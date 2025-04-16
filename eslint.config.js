import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  formatters: true,
  rules: {
    'unused-imports/no-unused-imports': ['error'],
  },
})
