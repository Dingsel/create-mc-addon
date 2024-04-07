import { apiChoises, languageChoises } from ".."
import { MODULE_NAMES, BUNDLERS } from "../global"

type multipleChoice = <T extends readonly string[]>(question: string, choices: T, defaultValues?: boolean[]) => Promise<Partial<T[number][]>>

type oneOf = <T extends string>(question: string, choices: readonly T[]) => Promise<T>

type fetchModules = (modulesToFetch: Partial<typeof MODULE_NAMES[number][]>) => Promise<{ [key in typeof MODULE_NAMES[number]]: [string | undefined, string | undefined, string | undefined, string | undefined] }>


interface ManifestGeneratorInfo {
    addonName: string
    apiInfo: ApiInfo
    modules: Partial<typeof MODULE_NAMES[number][]>
}

type useManifestTemplates = (manifestGeneratorInfo: ManifestGeneratorInfo) => Promise<{
    bpTemplate: any
    rpTemplate: any
}>

interface ApiInfo {
    isStable: boolean
    isBeta: boolean
}

interface LanguageInfo {
    ts: boolean
    doc: boolean
}

type ApiInfoMap = {
    [key in typeof apiChoises[number]]: ApiInfo
}
type LanguageMap = {
    [key in typeof languageChoises[number]]: LanguageInfo
}

type BundlerType = typeof BUNDLERS[number]