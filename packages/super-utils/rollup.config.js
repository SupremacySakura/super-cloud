import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
export default [
    // ESM 输出配置
    {
        input: 'src/index.ts',  // 输入文件
        output: {
            file: 'dist/index.js',  // 输出文件
            format: 'esm',  // 输出格式为 ESM
        },
        plugins: [
            typescript({
                useTsconfigDeclarationDir: true
            })
        ],
        external: ['axios']
    },
    {
        input: 'dist/types/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [dts()]
    }
]
