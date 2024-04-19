#!/usr/bin/env node
import "./global.js"

import chalk from "chalk";
import { existsSync, mkdirSync } from "fs";
import { arch, platform } from "os"
import { execSync } from "child_process";

import { InputManager } from "./lib/input.js";
import { addBlundlerDeps } from "./lib/addBundlerDeps.js";
import { configurePackage } from "./lib/configurePackage.js";
import { useManifestTemplates } from "./lib/generateManifest.js";
import { BUNDLERS, DEPS_TO_INSTALL, MODULE_NAMES, applyWarning } from "./global.js";
import { generateRegolithProfile } from "./lib/generateRegolithProfile.js";

export const apiChoises = /**@type {const} */(["Stable", "Stable + Beta API's ⭐", "Preview", "Preview + Beta API's"])
export const languageChoises = /**@type {const} */(["JavaScript", "JavaScript + JSDoc", "TypeScript"])

DEPS_TO_INSTALL.push("cmca-build")

if (arch() !== "x64" || platform() !== "win32") {
    if (!await InputManager.boolOf("You Are Using An Unsuportet System. Continue Anyways?", false)) {
        process.exit(0)
    }
}

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

if(existsSync(addonName)) {
    console.error(`A Folder/File Already Exists With The Name "${addonName}". Run The Setup Again And Choose A Different Name.`)
    process.exit(1)
}

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

if (!await InputManager.confirmAll()) process.exit(0)
console.clear()

mkdirSync(PROJECT_ROOT)
process.chdir("./" + PROJECT_ROOT)

if (DEPS_TO_INSTALL.find(x => x.startsWith("@minecraft/math")))
    console.log(applyWarning("@minecraft/math Can Cause An Upstream Dependency Conflict. When Installing The Node Modules Manualy Make Sure To Use The --force Flag In The npm i Command."))

console.log(chalk.bgBlueBright.white(`Following Packages Will Be Installed :`) + `\n${DEPS_TO_INSTALL.join("\n")}`)

execSync("npm init -y")
execSync(`npm i ${DEPS_TO_INSTALL.join(" ")} --force`)

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