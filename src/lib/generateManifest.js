import { randomUUID } from "crypto";

import getModules from "./fetchModules.js";
import { DEPS_TO_INSTALL, EXTERNAL_WORLD_MODULES, applyWarning } from "../global.js";

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
                "uuid": randomUUID(),
                "entry": "scripts/main.js",
                "version": [1, 0, 0]
            }
        ],
        /**@type {any[]} */
        "dependencies": [{ "uuid": rpUUID, "version": version }]
    }

    moduleData.forEach(([moduleName, moduleVersions]) => {

        let index = 0;
        if (isBeta) index += 1
        if (!isStable) index += 2

        let moduleVersion = moduleVersions[index]

        if (!moduleVersion) {
            const fallbackVersion = moduleVersions.find(x => x)
            console.log(applyWarning(`Module "${moduleName}" Is Not Available For The Configuration : Is Stable :${isStable} Beta API's :${isBeta}`))
            if (!fallbackVersion) return console.log(applyWarning("No Fallback Version Found. Skipping..."))
            console.log("A Fallback Version Has Been Found.")
            moduleVersion = fallbackVersion
        }

        // @ts-ignore
        if (!EXTERNAL_WORLD_MODULES.includes(moduleName)) {
            return DEPS_TO_INSTALL.push(`${moduleName}@${moduleVersion}`)
        }

        DEPS_TO_INSTALL.push(`${moduleName}@${moduleVersion}`)

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