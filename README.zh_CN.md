# unindex

为指定目录生成索引文件。

## 环境要求

- Node.js >= 20.0.0

## 安装

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

## 使用方式

### 基础用法

创建配置文件 `unindex.config.[js|ts|mjs|cjs|mts|cts|json]`。

```ts
// unindex.config.ts
import { defineConfig } from 'unindex'

export default defineConfig({
  dirs: 'src/hooks', // 指定需要生成索引文件的目录列表
})
```

可通过 `npx unindex` 执行或设置 `package.json` 脚本。

```json
{
  // ...

  "scripts": {
    // ...
    "unindex": "unindex"
  }
}
```

### 自定义输出内容

> 可通过 `codeGenerator`、`contentGenerator` 更改生成的内容>。

```ts
// unindex.config.ts
import { defineConfig } from 'unindex'

export default defineConfig([
  {
    entryDir: 'src/hooks',
    glob: {
      // 需要匹配的文件
      patterns: '**/*.ts',

      // 忽略以 `_` 开头的文件和目录
      // ignore: '**/_*',

      // 仅忽略以 `_` 开头的文件
      ignore: '**/_.*'
    }
  },
  {
    entryDir: 'src/styles',
    glob: {
      patterns: '**/*.css',
    },
    // 更改生成的代码片段
    codeGenerator: ({ relativePath }) => `@import './${relativePath}';`,
  },
  {
    entryDir: 'docs/pages',
    // 更改输出的文件名
    outFile: 'Home.md',
    glob: {
      patterns: '**/*.md',
    },
    codeGenerator: ({ file, relativePath }) => `[${file}](./${relativePath})`,
    // 更改输出的内容
    contentGenerator: ({ codes }) => {
      return `\
# 目录

${codes.map(code => `- ${code}`).join('\n')}
`
    },
  }
])
```

### 监听模式

命令行通过 `--watch` 参数开启监听模式，优先级低于配置文件中的 `watch` 选项。

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

## 调试

执行命令前设置 `DEBUG=unindex` 开启调试器，具体请参考 [debug](https://www.npmjs.com/package/debug)。
