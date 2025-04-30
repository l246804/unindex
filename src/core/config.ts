import type { GlobOptions } from 'tinyglobby'
import process from 'node:process'
import { assign } from 'nice-fns'

export interface CodeGeneratorContext {
  /**
   * Absolute path of the output file
   */
  outFile: string
  /**
   * Absolute path of the imported file
   */
  file: string
  /**
   * Relative path of the imported file to the output file (including extension)
   */
  relativePath: string
}

export interface ContentGeneratorContext {
  /**
   * Absolute path of the output file
   */
  outFile: string
  /**
   * Resolved files
   */
  files: string[]
  /**
   * Generated codes
   */
  codes: string[]
}

export interface Config {
  /**
   * Entry directory
   */
  entryDir: string
  /**
   * Output file path. Defaults to 'index.*' in the entry directory if not provided.
   * If the extension ends with `.*`, it will attempt to infer the extension from the matched file list.
   * @default 'index.*'
   */
  outFile?: string
  /**
   * Glob options, refer to {@link https://www.npmjs.com/package/tinyglobby tinyglobby}
   * @default
   * ```ts
   * {
   *   patterns: '**\/*.(js|ts|mjs|cjs|mts|cts)'
   * }
   * ```
   */
  glob?: Omit<GlobOptions, 'cwd' | 'absolute'>
  /**
   * Root directory. Defaults to the current working directory if not provided.
   * @default process.cwd()
   */
  cwd?: string
  /**
   * Whether to enable watch mode, which will automatically update the content of `outFile`.
   */
  watch?: boolean
  /**
   * Code generator function
   * @param ctx Generator context
   * @returns Code snippet
   * @default
   * ```ts
   * ({ relativePath }) => `export * from './${relativePath}'`
   * ```
   */
  codeGenerator?: (ctx: CodeGeneratorContext) => string | Promise<string>
  /**
   * Content generator function
   * @param ctx Generator context
   * @returns Output content
   * @default
   * ```ts
   * ({ codes }) => codes.join('\n')
   * ```
   */
  contentGenerator?: (ctx: ContentGeneratorContext) => string | Promise<string>
}

export type ConfigResolved = Required<Config>

function defaultCodeGenerator(ctx: CodeGeneratorContext): string {
  return `export * from './${ctx.relativePath}'`
}

function defaultContentGenerator(ctx: ContentGeneratorContext): string {
  return ctx.codes.join('\n')
}

/**
 * Resolves the configuration by filling in default values for optional properties.
 * @param config User-provided configuration
 */
export function resolveConfig(config: Config): ConfigResolved {
  return {
    entryDir: config.entryDir,
    outFile: config.outFile || 'index.*',
    cwd: config.cwd || process.cwd(),
    glob: assign({ patterns: '**/*.(js|ts|mjs|cjs|mts|cts)' }, config.glob),
    watch: config.watch || false,
    codeGenerator: config.codeGenerator || defaultCodeGenerator,
    contentGenerator: config.contentGenerator || defaultContentGenerator,
  }
}
