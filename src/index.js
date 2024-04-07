#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync } from "fs";
import "./global.js"
import { BUNDLERS, DEPS_TO_INSTALL, MODULE_NAMES } from "./global.js";
import { useManifestTemplates } from "./lib/generateManifest.js";
import { InputManager } from "./lib/input.js";
import chalk from "chalk";
import { execSync } from "child_process";
import { writeDownload } from "./lib/downloader.js";
import { inflate } from "./lib/inflate.js";
import { generateRegolithProfile } from "./lib/generateRegolithProfile.js";
import { addBlundlerDeps } from "./lib/addBundlerDeps.js";
import { configurePackage } from "./lib/configurePackage.js";

export const apiChoises = /**@type {const} */(["Stable", "Stable + Beta API's ⭐", "Preview", "Preview + Beta API's"])
export const languageChoises = /**@type {const} */(["JavaScript", "JavaScript + JSDoc", "TypeScript"])

/**@type {import("./lib/types.js").ApiInfoMap} */
const apiInfoMap = {
    "Stable": { isStable: true, isBeta: false },
    "Stable + Beta API's ⭐": { isStable: true, isBeta: true },
    "Preview": { isStable: false, isBeta: false },
    "Preview + Beta API's": { isStable: false, isBeta: true }
}

/**@type {import("./lib/types.js").LanguageMap} */
const languageMap = {
    "JavaScript": { ts: false, doc: false },
    "JavaScript + JSDoc": { ts: false, doc: true },
    "TypeScript": { ts: true, doc: false }
}

const addonName = await InputManager.getInput("Your Addon Name")
const PROJECT_ROOT = addonName

const selectedApiTypeIndex = await InputManager.oneOf("Choose An API Type", apiChoises)

const prefLang = await InputManager.oneOf("Prefered Language", languageChoises)
const langInfo = languageMap[prefLang]

const modules = await InputManager.multipleChoice("Choose Prefered Modules", MODULE_NAMES, [true, true])
const apiInfo = apiInfoMap[selectedApiTypeIndex]

const manifestInfo = await useManifestTemplates({
    apiInfo,
    addonName,
    modules
})

/** @type {import("./lib/types.js").BundlerType}*/
const selectedBundler = await InputManager.oneOf("Bundler", BUNDLERS);
addBlundlerDeps({ bundlerType: selectedBundler, ts: languageMap[prefLang].ts })

await InputManager.confirmAll()
console.clear()

mkdirSync(PROJECT_ROOT)
process.chdir("./" + PROJECT_ROOT)

console.log(chalk.bgBlueBright.white(`Following Packages Will Be Installed :`) + `\n${DEPS_TO_INSTALL.join("\n")}`)

execSync("npm init -y")
execSync("npm i " + DEPS_TO_INSTALL.join(" "))

console.log(chalk.bgBlueBright.white(`Additionally Regolith Will Be Downloaded...`))

const regolithFolderPath = "./.regolith"
const downloadDest = "./.regolith/regolith.zip"

!existsSync(regolithFolderPath) && mkdirSync(regolithFolderPath)

await writeDownload("https://github.com/Bedrock-OSS/regolith/releases/download/1.2.0/regolith_1.2.0_windows_amd64.zip", downloadDest)

await inflate(downloadDest, "./.regolith/regolith/")
rmSync(downloadDest)

generateRegolithProfile({
    addonName,
    bundler: selectedBundler,
    manifestInfo,
    langInfo,
    apiInfo
})

configurePackage({
    addonName
})

console.warn("Done!\n\nTo Start Developing Navigate Into The Project And Type `npm run dev`.\n\nHappy Coding!")