import type { FSWatcher } from 'chokidar'
import type { Config } from './core/config'
import type { Context } from './core/context'
import process from 'node:process'
import chokidar from 'chokidar'
import { assign, debounce } from 'nice-fns'
import { createContext } from './core/context'
import { debug, getAbsolutePath } from './core/utils'

export type {
  CodeGeneratorContext,
  Config,
  ConfigResolved,
  ContentGeneratorContext,
} from './core/config'

export { defineConfig } from './define'

export async function start(
  config: Config | Config[],
  baseConfig: Pick<Config, 'watch'> = {},
): Promise<{ stop: () => void }> {
  const configs = Array.isArray(config) ? config : [config]
  const ctxs = configs.map(config => createContext(assign({}, baseConfig, config)))
  const watchers = new Map<Context, FSWatcher>()

  for (const ctx of ctxs) {
    if (!ctx.config.watch) {
      await ctx.generateIndex()
      continue
    }

    const watcher = chokidar.watch(ctx.entryDir)
    watchers.set(ctx, watcher)

    const generateIndex = debounce(() => {
      ctx.generateIndex().catch(console.error)
    }, 1e3)
    const createWatchCb = (eventName: string) => {
      return async (path: string) => {
        debug('watcher: %s %o', eventName, getAbsolutePath(path, ctx.entryDir))
        generateIndex()
      }
    }
    watcher.on('add', createWatchCb('add')).on('unlink', createWatchCb('unlink'))
  }

  const stop = (): void => {
    watchers.forEach(watcher => watcher.close())
    watchers.clear()
    ctxs.length = 0
  }
  process.once('beforeExit', stop)

  return { stop }
}
