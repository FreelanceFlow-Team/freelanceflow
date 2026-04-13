import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-undef': 'off',
    },
  },
  globalIgnores(['.next/', 'out/', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
