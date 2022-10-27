import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import dts from 'rollup-plugin-dts'

export default [
    {
        input: './src/index.ts',
        output: {
            name: 'excel-convert',
            format: 'umd',
            file: './dist/excel-convert.js',
        },
        plugins: [resolve(), typescript(), terser()],
    }, {
        input: './src/index.ts',
        output: {
            file: './dist/excel-convert.d.ts'
        },
        plugins: [dts()]
    }
];