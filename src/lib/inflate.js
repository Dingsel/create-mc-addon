import { createReadStream, createWriteStream } from "fs"
import { pipeline } from "stream/promises"
import { createUnzip } from "zlib"


/**
 * @param {import("fs").PathLike} file
 * @param {import("fs").PathLike} dest
 */
export async function inflate(file, dest) {
    const inputStream = createReadStream(file)
    const destStream = createWriteStream(dest)

    const unzip = createUnzip()
    await pipeline(inputStream, unzip, destStream)
    inputStream.close()
    destStream.close()
}