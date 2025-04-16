/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,cjs,mjs,ts,json}': ['prettier --write', 'eslint --fix'],
  '*.md': ['prettier --write'],
}
