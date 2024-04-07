import { readFileSync, writeFileSync } from "fs";

/**
 * @param {{addonName: string}} param0 
 */
export function configurePackage({ addonName }) {
    const packageJSON = JSON.parse(readFileSync("./package.json").toString())
    packageJSON.scripts = {
        "dev": ".\\.regolith\\regolith\\regolith.exe watch",
        "export": ".\\.regolith\\regolith\\regolith.exe run export",
    }
    packageJSON.name = addonName
    packageJSON.type = "module"
    delete packageJSON["main"]
    writeFileSync("./package.json", JSON.stringify(packageJSON, null, 4))
}