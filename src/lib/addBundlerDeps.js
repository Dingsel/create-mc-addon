import { DEPS_TO_INSTALL } from "../global.js";

/**
 * 
 * @param {{ts : boolean, bundlerType : import("./types").BundlerType}} param0 
 */
export function addBlundlerDeps({ ts, bundlerType }) {
    if (ts) DEPS_TO_INSTALL.push("typescript")
    switch (bundlerType) {
        case "none": break;
        case "esbuild": DEPS_TO_INSTALL.push("esbuild"); break;
    }
}