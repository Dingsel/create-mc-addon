#!/usr/bin/env node
import { readdirSync } from "fs"
import { rm } from "fs/promises"

let isDev = true
let ts = false
/**@type {import("./types").BundlerType} */
let bundlerType = "none"

try {
    /**
     * @type {{envMode : "dev" | "release", bundlerType : import("./types").BundlerType}}
     */
    const startOptions = JSON.parse(process.argv[2])
    startOptions.envMode === "release" && (isDev = false)
    startOptions.bundlerType && (bundlerType = startOptions.bundlerType)
} catch (error) {
    console.warn("Error Parsing Start Args")
}

switch (bundlerType) {
    case "none": break;
    case "esbuild": {
        const { build } = await import("esbuild")
        await build({
            bundle: true,
            format: "esm",
            outfile: "./BP/scripts/main.js",
            entryPoints: {
                in: ts ? "./BP/scripts/main.ts" : "./BP/scripts/main.js"
            },
            sourcemap: isDev,
            allowOverwrite: true,
            minify: !isDev,
            external: [
                "@minecraft/server",
                "@minecraft/server-ui",
                "@minecraft/server-net",
                "@minecraft/server-admin",
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
