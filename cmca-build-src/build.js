#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs"
import { rm } from "fs/promises"
import { createRequire } from "module"
import { join } from "path"

//dynamic import doesnt work?!
const require = createRequire(import.meta.url)

let isDev = true
let ts = false
/**@type {import("./types").BundlerType} */
let bundlerType = "none"

const root = process.env.ROOT_DIR
if (!root) throw new Error("This Project Can Only Be Executed With Regolith.")
const tsEntry = "./BP/scripts/main.ts"

try {
    /**
     * @type {{envMode : "dev" | "release", bundlerType : import("./types").BundlerType, ts : boolean}}
     */
    const startOptions = JSON.parse(process.argv[2])
    startOptions.envMode === "release" && (isDev = false)
    startOptions.bundlerType && (bundlerType = startOptions.bundlerType)
    ts = startOptions.ts
} catch (error) {
    console.error("Error Parsing Start Args", error)
}

switch (bundlerType) {
    case "none": {
        if (!ts) break
        //dynamic import doesnt work?!
        const tsModule = require("typescript")

        const options = JSON.parse(readFileSync(join(root, "/tsconfig.json")).toString())

        const program = tsModule.createProgram([tsEntry], options)
        const emitResult = program.emit();

        //Handle diagnostics
        const allDiagnostics = tsModule
            .getPreEmitDiagnostics(program)
            .concat(emitResult.diagnostics);

        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file && diagnostic.start) {
                let { line, character } = tsModule.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                let message = tsModule.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.log(tsModule.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
            }
        });

        delTsFiles()
        break
    };
    case "esbuild": {
        const { build } = await import("esbuild")
        await build({
            bundle: true,
            format: "esm",
            outfile: "./BP/scripts/main.js",
            entryPoints: {
                in: ts ? tsEntry : "./BP/scripts/main.js"
            },
            sourcemap: isDev,
            allowOverwrite: true,
            minify: !isDev,
            external: [
                "@minecraft/server",
                "@minecraft/server-ui",
                "@minecraft/server-admin",
                "@minecraft/server-gametest",
                "@minecraft/server-net",
                "@minecraft/server-common",
                "@minecraft/server-editor",
                "@minecraft/debug-utilities",
            ]
        })
        delOldFiles()
        break;
    }
}

function delOldFiles() {
    readdirSync("./BP/scripts/", { recursive: true }).map((/** @type {import("fs").PathLike} */ x) => {
        const asStr = x.toString()
        if (asStr.endsWith("main.js") || asStr.endsWith(".map")) return
        rm("./BP/scripts/" + x, { force: true, recursive: true })
    })
}

function delTsFiles() {
    readdirSync("./BP/scripts/", { recursive: true }).map((/** @type {import("fs").PathLike} */ x) => {
        const asStr = x.toString()
        if (asStr.endsWith(".js")) return
        rm("./BP/scripts/" + x, { force: true, recursive: true })
    })
}