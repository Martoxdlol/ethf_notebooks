import { resolve } from 'node:path'
import { createConfig } from 'm3-stack/config'

export default createConfig({
    vite: {
        resolve: {
            alias: {
                '@': resolve('./src')
            }
        },
        optimizeDeps: {
            exclude: ['@preflower/barcode-detector-polyfill']
        }
    }
})