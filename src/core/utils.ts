import Debug from 'debug'
import { isAbsolute, join, normalize, parse, resolve } from 'pathe'

export const debug: Debug.Debugger = Debug('unindex')

export function tempDebug(...args: Parameters<typeof debug>): void {
  const enabled = debug.enabled
  debug.enabled = true
  debug(...args)
  debug.enabled = enabled
}

export function getAbsolutePath(path: string, cwd: string): string {
  return isAbsolute(path) ? normalize(path) : resolve(cwd, path)
}

export interface ParsePathResult {
  readonly root: string
  readonly dir: string
  readonly name: string
  ext: string
  readonly base: string
  readonly path: string
}

export function parsePath(path: string): ParsePathResult {
  const rawOutFileParsed = parse(path)
  return {
    get root(): string {
      return rawOutFileParsed.root
    },

    get dir(): string {
      return rawOutFileParsed.dir
    },

    get name(): string {
      return rawOutFileParsed.name
    },

    get ext(): string {
      return rawOutFileParsed.ext
    },
    set ext(ext) {
      rawOutFileParsed.ext = ext
    },

    get base(): string {
      return this.name + this.ext
    },

    get path(): string {
      return join(this.dir, this.base)
    },
  }
}
