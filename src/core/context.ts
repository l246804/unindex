import type { Config, ConfigResolved } from './config'
import type { ParsePathResult } from './utils'
import fs from 'node:fs/promises'
import { extname, matchesGlob, relative } from 'pathe'
import { glob } from 'tinyglobby'
import { resolveConfig } from './config'
import { debug, getAbsolutePath, parsePath, tempDebug } from './utils'

export interface GenerateIndexState {
  files: Set<string>
  codes: Set<string>
  content: string
}

export interface Context {
  config: ConfigResolved
  entryDir: string
  outFileParsed: ParsePathResult
  getFiles: () => Promise<string[]>
  getCodes: (files: string[] | Set<string>) => Promise<string[]>
  getContent: (data: {
    files: string[] | Set<string>
    codes: string[] | Set<string>
  }) => Promise<string>
  tryUpdateOutFileExtension: (files: string[] | Set<string>) => void
  writeFile: (content: string) => Promise<void>
  generateIndex: () => Promise<GenerateIndexState>
}

export function createContext(userConfig: Config): Context {
  const config = resolveConfig(userConfig)
  const entryDir = getAbsolutePath(config.dir, config.cwd)
  const outFileParsed = parsePath(getAbsolutePath(config.outFile, entryDir))

  debug('Resolved config: %O', config)
  debug('Resolved entryDir: %o', entryDir)
  debug('Resolved outFile: %O', outFileParsed.path)

  const getFiles: Context['getFiles'] = async () => {
    return glob({
      ...config.glob,
      cwd: entryDir,
      absolute: true,
    }).then((files) => {
      debug('Found files: %O', files)

      return files.filter((file) => {
        const valid = !matchesGlob(file, outFileParsed.path)
        if (!valid) {
          debug('Skip file: %o, because it matches outFile', file)
        }
        return valid
      })
    })
  }

  const tryUpdateOutFileExtension: Context['tryUpdateOutFileExtension'] = (files) => {
    let extension = outFileParsed.ext
    if (extension === '.*') {
      for (const file of files) {
        const ext = extname(file)
        if (ext) {
          extension = ext
          debug('Resolved outFile extension: %o from %o', extension, file)
          break
        }
      }
      if (extension === '.*') {
        extension = ''
        debug('Resolved outFile extension: %o', extension)
      }
    }
    outFileParsed.ext = extension
  }

  const getCodes: Context['getCodes'] = async (files) => {
    return Promise.all(
      Array.from(files, (file) => {
        const code = config.codeGenerator({
          outFile: outFileParsed.path,
          file,
          relativePath: relative(outFileParsed.dir, file),
        })
        debug('Generated code: %o', code)
        return code
      }),
    )
  }

  const getContent: Context['getContent'] = async ({ files, codes }) => {
    return config.contentGenerator({
      outFile: outFileParsed.path,
      files: [...files],
      codes: [...codes],
    })
  }

  const writeFile: Context['writeFile'] = async (content) => {
    debug('Writing to %o', outFileParsed.path)
    await fs.mkdir(outFileParsed.dir, { recursive: true })
    await fs.writeFile(outFileParsed.path, content, { encoding: 'utf-8' })
    tempDebug('Successfully written to %o', outFileParsed.path)
  }

  const generateIndex: Context['generateIndex'] = async () => {
    const state = {
      files: new Set<string>(),
      codes: new Set<string>(),
      content: '',
    }

    state.files = new Set(await getFiles())
    if (state.files.size === 0) {
      tempDebug('No files found, skip generating outFile')
    }
    else {
      tryUpdateOutFileExtension([...state.files])

      state.codes = new Set(await getCodes(state.files))
      state.content = await getContent(state)

      await writeFile(state.content)
    }

    return state
  }

  return {
    config,
    entryDir,
    outFileParsed,
    getFiles,
    getCodes,
    getContent,
    tryUpdateOutFileExtension,
    writeFile,
    generateIndex,
  }
}
