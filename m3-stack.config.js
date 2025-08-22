import { resolve } from 'node:path'
import { createConfig } from 'm3-stack/config'

export default createConfig({
    build: {
        bundleDependencies: true,
        externalDependencies: ['crypto-js', 'pngjs', 'react'],
    },
    vite: {
        resolve: {
            alias: {
                '@': resolve('./src'),
            },
        },
        optimizeDeps: {
            exclude: ['@preflower/barcode-detector-polyfill'],
        },
    },
})
