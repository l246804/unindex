import { defineConfig } from './src/define'

export default defineConfig({
  dir: 'test',
  outFile: 'index.ts',
  glob: {
    // ignore files and folders starting with `_`
    ignore: '**/_*',

    // only ignore files starting with `_`
    // ignore: '**/_*.*',
  },
  watch: false,
})
