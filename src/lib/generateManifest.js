import chalk from "chalk";
import { randomUUID } from "crypto";

import getModules from "./fetchModules.js";
import { DEPS_TO_INSTALL, EXTERNAL_WORLD_MODULES } from "../global.js";

/** @type {import("./types").useManifestTemplates} */
export async function useManifestTemplates({ apiInfo: { isStable, isBeta }, addonName, modules }) {
    const bpUUID = randomUUID()
    const rpUUID = randomUUID()

    const version = [0, 0, 1]

    const moduleData = Object.entries(await getModules(modules))

    const bpTemplate = {
        "format_version": 2,
        "header": {
            "name": addonName,
            "description": addonName,
            "min_engine_version": [1, 19, 60],
            "uuid": bpUUID,
            "version": version
        },
        "modules": [
            {
                "type": "data",
                "uuid": randomUUID(),
                "version": version
            },
            {
                "type": "script",
                "language": "javascript",
                "uuid": "4477d450-844c-41a1-81e7-b9e08057fa43",
                "entry": "scripts/main.js",
                "version": [1, 0, 0]
            }
        ],
        /**@type {any[]} */
        "dependencies": [{ "uuid": rpUUID, "version": version }]
    }

    moduleData.forEach(([moduleName, moduleVersions]) => {
        // @ts-ignore
        if (!EXTERNAL_WORLD_MODULES.includes(moduleName)) {
            DEPS_TO_INSTALL.push(moduleName)
            return
        }
        let index = 0;
        if (isBeta) index += 1
        if (!isStable) index += 2
        const moduleVersion = moduleVersions[index]
        if (!moduleVersion) return console.log(chalk.bgYellowBright.bold.white(`Module "${moduleName}" Is Not Available For The Configuration : Is Stable :${isStable} Beta API's :${isBeta}`))

        DEPS_TO_INSTALL.push(moduleName)

        const trimedVersionName = moduleVersion.split(".").slice(0, 3).join(".")

        bpTemplate.dependencies.push({
            module_name: `${moduleName}`,
            version: trimedVersionName
        })
    })

    const rpTemplate = {
        "format_version": 2,
        "header": {
            "name": addonName,
            "description": addonName,
            "min_engine_version": [1, 19, 60],
            "uuid": rpUUID,
            "version": version
        },
        "modules": [
            {
                "type": "resources",
                "uuid": randomUUID(),
                "version": version
            }
        ],
        "dependencies": [{ "uuid": bpUUID, "version": version }]
    }

    return {
        bpTemplate,
        rpTemplate
    }
}