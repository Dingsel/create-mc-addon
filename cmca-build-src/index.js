#!/usr/bin/env node
import { exit } from "process"
import { spawn } from "child_process"
import { existsSync, mkdirSync, rmSync } from "fs"

import { inflate } from "./inflate.js"
import { writeDownload } from "./downloader.js"

const regolithFolderPath = "./.regolith"
const downloadDest = "./.regolith/regolith.zip"

if (!existsSync("./.regolith/regolith/regolith.exe")) {
    console.warn("Regolith will now be downloaded locally, for this project only.")
    !existsSync(regolithFolderPath) && mkdirSync(regolithFolderPath)

    await writeDownload("https://github.com/Bedrock-OSS/regolith/releases/download/1.5.1/regolith_1.5.1_windows_amd64.zip", downloadDest)

    await inflate(downloadDest, "./.regolith/regolith/")
    rmSync(downloadDest)
}

//TODO: Optimise for CI
const regolithProcces = spawn("./.regolith/regolith/regolith.exe", process.argv.slice(2))

regolithProcces.stdout.on("data", (msg) => {
    console.log(msg.toString())
})

regolithProcces.on("error", (err) => {
    console.log(err)
})

regolithProcces.stdout.on("error", (msg) => {
    console.log(msg.toString())
})

regolithProcces.on("exit", exit)