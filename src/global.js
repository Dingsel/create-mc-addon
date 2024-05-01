import chalk from "chalk";
import { platform } from "os";

export const IS_WINDOWS = platform() === "win32"
/** @type {string[]}*/
export const DEPS_TO_INSTALL = []

export const applyWarning = chalk.bgYellowBright.bold.black

export const IS_SERVER = false;

export const BUNDLERS = /**@type {const}*/(["esbuild", "none"])

export const MODULE_NAMES = /**@type {const}*/([
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/math",
    "@minecraft/vanilla-data",
    "@minecraft/common",
    "@minecraft/server-editor",
    "@minecraft/server-gametest",
    "@minecraft/server-admin",
    "@minecraft/server-net",
])

export const EXTERNAL_WORLD_MODULES = /**@type {const}*/([
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-gametest",
    "@minecraft/server-editor",
    "@minecraft/common"
])