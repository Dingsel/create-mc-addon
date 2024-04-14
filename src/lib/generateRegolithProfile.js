import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { copyFile, mkdir, writeFile } from "fs/promises"

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param {{
 *  addonName : string,
 *  bundler : import("./types").BundlerType,
 *  manifestInfo : Awaited<ReturnType<import("./types").useManifestTemplates>>,
 *  langInfo : import("./types").LanguageInfo,
 *  apiInfo : import("./types").ApiInfo
 * }} param0 
 * @returns 
 */
export async function generateRegolithProfile({ addonName, bundler, manifestInfo, langInfo, apiInfo }) {

    await Promise.all([
        mkdir("./src/BP/scripts", { recursive: true }),
        mkdir("./src/RP", { recursive: true }),
        mkdir("./src/data", { recursive: true })
    ])

    const configFile = {
        "$schema": "https://raw.githubusercontent.com/Bedrock-OSS/regolith-schemas/main/config/v1.1.json",
        "author": "cmca",
        "name": addonName,
        "packs": {
            "behaviorPack": "./src/BP",
            "resourcePack": "./src/RP"
        },
        "regolith": {
            "dataPath": "./src/data",
            "filterDefinitions": {
                "cmcaBuild": {
                    "runWith": "shell",
                    "command": "cmca-build"
                },
            },
            "profiles": {
                "default": {
                    "filters": [
                        {
                            "filter": "cmcaBuild",
                            "settings": {
                                envMode: "dev",
                                bundlerType: bundler,
                                ts: langInfo.ts
                            }
                        }
                    ],
                    "export": {
                        "target": apiInfo.isStable ? "development" : "preview"
                    },
                },
                "export": {
                    "filters": [
                        {
                            "filter": "cmcaBuild",
                            "settings": {
                                envMode: "release",
                                bundlerType: bundler,
                                ts: langInfo.ts
                            }
                        }
                    ],
                    "export": {
                        "target": "local"
                    },
                }
            }
        }
    }

    await Promise.all([
        writeFile("./config.json", JSON.stringify(configFile, null, 4)),
        writeFile("./src/BP/manifest.json", JSON.stringify(manifestInfo.bpTemplate, null, 4)),
        writeFile("./src/RP/manifest.json", JSON.stringify(manifestInfo.rpTemplate, null, 4)),
        copyFile(join(__dirname, "../data/scriptExample.js"), `./src/BP/scripts/main.${langInfo.ts ? "ts" : "js"}`),
        copyFile(join(__dirname, "../data/gitignoreContent.txt"), "./.gitignore"),
        copyFile(join(__dirname, "../data/readme.md"), "./readme.md"),
        langInfo.ts && copyFile(join(__dirname, "../data/tsconfig.json"), "./tsconfig.json"),
        langInfo.doc && copyFile(join(__dirname, "../data/tsconfigJSdoc.json"), "./tsconfig.json")
    ])
}