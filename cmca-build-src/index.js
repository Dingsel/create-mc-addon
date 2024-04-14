#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync } from "fs"
import { writeDownload } from "./downloader.js"
import { inflate } from "./inflate.js"
import { spawn } from "child_process"
import { exit } from "process"

const regolithFolderPath = "./.regolith"
const downloadDest = "./.regolith/regolith.zip"

if (!existsSync("./.regolith/regolith/regolith.exe")) {
    console.warn("Regolith Has Not Been Found. It Will Be Downloaded Now")
    !existsSync(regolithFolderPath) && mkdirSync(regolithFolderPath)

    await writeDownload("https://github.com/Bedrock-OSS/regolith/releases/download/1.2.0/regolith_1.2.0_windows_amd64.zip", downloadDest)

    await inflate(downloadDest, "./.regolith/regolith/")
    rmSync(downloadDest)
}

//TODO: Optimise for CI
const regolithProcces = spawn("./.regolith/regolith/regolith.exe", [...process.argv.slice(2)])

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