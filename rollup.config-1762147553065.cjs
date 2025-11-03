'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typescript = require('@rollup/plugin-typescript');
var rollupPluginDts = require('rollup-plugin-dts');

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/index.esm.js',
        format: 'es',
        exports: 'named',
      },
    ],
    plugins: [typescript()],
  },
  {
    input: './src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [rollupPluginDts.dts()],
  },
];

exports.default = config;
