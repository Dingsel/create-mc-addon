const BASE_URL = "https://registry.npmjs.org/"

const STABLE_REG = /^(\d+\.){2}\d+$/g
const STABLE_BETA_REG = /^(\d+\.){2}\d+.*stable$/g
const PREVIEW_REG = /^(\d+\.){2}\d+-rc.*preview/g
const PREVIEW_BETA_REG = /^(\d+\.){2}\d+-beta.*preview/g

const VERSION_REGS = [STABLE_REG, STABLE_BETA_REG, PREVIEW_REG, PREVIEW_BETA_REG]

const getVersionIndex = (/** @type {string} */ v) => VERSION_REGS.findIndex(re => re.test(v))

/**@type {import("./types.js").fetchModules} */
export default async function getModules(modulesToFetch) {
    const json = await Promise.all(
        (await Promise.all(modulesToFetch.map(x => {
            return fetch(BASE_URL + x, {
                // @ts-ignore
                "Accept": "application/vnd.npm.install-v1+json"
            })
        })))
            .map(async (x, i) => {
                const { versions } = await x.json()
                let versionIndex = []

                for (let version in versions) {
                    let index = getVersionIndex(version)

                    if (index >= 0) versionIndex[index] = version
                }
                return [modulesToFetch[i], versionIndex]
            }))
    return Object.fromEntries(json)
}