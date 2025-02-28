import { createConfig } from 'm3-stack/config'
import { resolve } from 'node:path'

export default createConfig({
    vite: {
        resolve: {
            alias: {
                '@': resolve('./src')
            }
        }
    }
})