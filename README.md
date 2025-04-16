# unindex

Generate index files for specified directories.

## Environment Requirements

- Node.js >= 20.0.0

## Installation

- npm

```shell
npm i -D unindex
```

- yarn

```shell
yarn add -D unindex
```

- pnpm

```shell
pnpm add -D unindex
```

## Usage

### Basic Usage

Create a configuration file `unindex.config.[js|ts|mjs|cjs|mts|cts|json]`.

```ts
// unindex.config.ts
import { defineConfig } from 'unindex'

export default defineConfig({
  dirs: 'src/hooks', // Specify the list of directories to generate index files for
})
```

You can execute it via `npx unindex` or set it as a script in `package.json`.

```json
{
  // ...

  "scripts": {
    // ...
    "unindex": "unindex"
  }
}
```

### Customizing Output Content

> You can change the generated content using `codeGenerator` and `contentGenerator`.

```ts
// unindex.config.ts
import { defineConfig } from 'unindex'

export default defineConfig([
  {
    entryDir: 'src/hooks',
    glob: {
      // Patterns to match files
      patterns: '**/*.ts',

      // Ignore files and directories starting with '_'
      // ignore: '**/_*',

      // Only ignore files starting with '_'
      ignore: '**/_.*'
    }
  },
  {
    entryDir: 'src/styles',
    glob: {
      patterns: '**/*.css',
    },
    // Change the generated code snippet
    codeGenerator: ({ relativePath }) => `@import './${relativePath}';`,
  },
  {
    entryDir: 'docs/pages',
    // Change the output file name
    outFile: 'Home.md',
    glob: {
      patterns: '**/*.md',
    },
    codeGenerator: ({ file, relativePath }) => `[${file}](./${relativePath})`,
    // Change the output content
    contentGenerator: ({ codes }) => {
      return `\
# Directory

${codes.map(code => `- ${code}`).join('\n')}
`
    },
  }
])
```

### Watch Mode

Enable watch mode via the `--watch` parameter in the command line, which has a lower priority than the `watch` option in the configuration file.

```sh
unindex --watch
# or
unindex -w
```

```ts
import { defineConfig } from 'unindex'

export default defineConfig({
  // ...
  watch: true,
})
```

## Debugging

Set `DEBUG=unindex` before running the command to enable the debugger. For more details, refer to [debug](https://www.npmjs.com/package/debug).
