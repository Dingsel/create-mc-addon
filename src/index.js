#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "fs";
import "./global.js"
import { DEPS_TO_INSTALL, MODULE_NAMES } from "./global.js";
import { useManifestTemplates } from "./lib/generateManifest.js";
import { InputManager } from "./lib/input.js";
import chalk from "chalk";
import { execSync } from "child_process";
import { writeDownload } from "./lib/downloader.js";
import { inflate } from "./lib/inflate.js";

export const apiChoises = /**@type {const} */(["Stable", "Stable + Beta API's ⭐", "Preview", "Preview + Beta API's"])
/**@type {import("./lib/types.js").ApiInfoMap} */
const apiInfoMap = {
    "Stable": { isStable: true, isBeta: false },
    "Stable + Beta API's ⭐": { isStable: true, isBeta: true },
    "Preview": { isStable: false, isBeta: false },
    "Preview + Beta API's": { isStable: false, isBeta: true }
}

const addonName = await InputManager.getInput("Your Addon Name")
const selectedApiTypeIndex = await InputManager.oneOf("Choose An API Type", apiChoises)

await InputManager.oneOf("Prefered Language", ["JavaScript", "JavaScript + JSDoc", "TypeScript"])

const modules = await InputManager.multipleChoice("Choose Prefered Modules", MODULE_NAMES, [true, true])

if (await InputManager.boolOf("Use A Bundler")) {
    await InputManager.oneOf("Bundler", ["esbuild ⭐", "rollup", "webpack"])
}

await InputManager.confirmAll()
console.clear()

const res = await useManifestTemplates({
    apiInfo: apiInfoMap[selectedApiTypeIndex],
    addonName,
    modules
})

console.log(chalk.bgBlueBright.white(`Following Packages Will Be Installed :`) + `\n${" ".repeat(8)}${DEPS_TO_INSTALL.join("\n")}`)

execSync("npm init -y")
execSync("npm i " + DEPS_TO_INSTALL.join(" "))

console.log(chalk.bgBlueBright.white(`Additionally Regolith Will Be Downloaded`))

mkdirSync("./.regolith")

await writeDownload("https://github.com/Bedrock-OSS/regolith/releases/download/1.2.0/regolith_1.2.0_windows_amd64.zip", "./.regolith/regolith.zip")

await inflate("./.regolith/regolith.zip", "./.regolith/regolith/")

writeFileSync("./res.json", JSON.stringify(res))