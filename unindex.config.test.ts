import { defineConfig } from './src/define'

export default defineConfig({
  dir: 'test',
  glob: {
    patterns: '**/*',

    // ignore files and folders starting with `_`
    ignore: '**/_*',

    // only ignore files starting with `_`
    // ignore: '**/_*.*',
  },
  watch: false,
})
