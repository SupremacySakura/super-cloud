import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { defineConfig } from 'rollup'

const external = ['fs', 'path', 'crypto', 'spark-md5']

export default defineConfig([
    {
        input: 'src/index.ts',
        output: [
            { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
            { file: 'dist/index.cjs', format: 'cjs', sourcemap: true }
        ],
        external,
        plugins: [typescript({ tsconfig: './tsconfig.json', declaration: false })]
    },
    // Core
    {
        input: 'src/core/index.ts',
        output: [
            { file: 'dist/core/index.mjs', format: 'esm', sourcemap: true },
            { file: 'dist/core/index.cjs', format: 'cjs', sourcemap: true }
        ],
        external,
        plugins: [typescript({ tsconfig: './tsconfig.json', declaration: false })]
    },

    // Client
    {
        input: 'src/client/index.ts',
        output: [
            { file: 'dist/client/index.mjs', format: 'esm', sourcemap: true },
            { file: 'dist/client/index.cjs', format: 'cjs', sourcemap: true }
        ],
        external,
        plugins: [typescript({ tsconfig: './tsconfig.json', declaration: false })]
    },

    // Server
    {
        input: 'src/server/index.ts',
        output: [
            { file: 'dist/server/index.mjs', format: 'esm', sourcemap: true },
            { file: 'dist/server/index.cjs', format: 'cjs', sourcemap: true }
        ],
        external,
        plugins: [typescript({ tsconfig: './tsconfig.json', declaration: false })]
    },

    // DTS 打包
    {
        input: 'src/core/index.ts',
        output: { file: 'dist/core/index.d.ts', format: 'es' },
        plugins: [dts()]
    },
    {
        input: 'src/client/index.ts',
        output: { file: 'dist/client/index.d.ts', format: 'es' },
        plugins: [dts()]
    },
    {
        input: 'src/server/index.ts',
        output: { file: 'dist/server/index.d.ts', format: 'es' },
        plugins: [dts()]
    },
    {
        input: 'src/index.ts',
        output: { file: 'dist/index.d.ts', format: 'es' },
        plugins: [dts()]
    }
])
