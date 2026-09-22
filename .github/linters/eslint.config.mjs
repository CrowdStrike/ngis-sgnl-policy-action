import jest from 'eslint-plugin-jest'
import globals from 'globals'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/*.json',
      'coverage/**',
      '.github/workflows/**',
      '.github/linters/eslint.config.mjs',
      'babel.config.js'
    ]
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      jest
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: path.resolve(__dirname, '../..')
      },
      globals: {
        ...globals.commonjs,
        ...globals.jest,
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      },
      ecmaVersion: 2023,
      sourceType: 'module'
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...jest.configs.recommended.rules,
      camelcase: 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      semi: 'off'
    }
  }
]
