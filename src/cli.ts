import type { Config } from '.'
import process from 'node:process'
import { loadConfig } from 'c12'
import { defineCommand, runMain } from 'citty'
import { start } from '.'
import { description, name, version } from '../package.json'
import { debug } from './core/utils'

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  args: {
    config: {
      alias: 'c',
      type: 'string',
      description: 'Specify the config file',
    },
    watch: {
      alias: 'w',
      type: 'boolean',
      description: 'Watch files and regenerate on add or delete, priority lower than config file',
    },
    help: {
      type: 'boolean',
      alias: 'h',
      description: 'Show help',
    },
  },
  async run({ args }) {
    debug('CLI args: %O', args)

    await loadConfig<Config | Config[]>({
      name,
      configFile: args.config || undefined,
      rcFile: false,
      merger(...sources) {
        return ([] as Config[]).concat(...sources.filter(source => source != null))
      },
    })
      .then(({ config, layers = [] }) => {
        debug('config layers: %O', layers)
        debug('loaded config: %O', config)
        if (layers.length > 0) {
          return start(config, { watch: args.watch })
        }
        debug('no config found')
      })
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
  },
})

runMain(main)
