export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'test',
      'docs', 'ci', 'refactor', 'style', 'perf', 'revert',
    ]],
    'subject-case':  [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'type-empty':    [2, 'never'],
  },
};