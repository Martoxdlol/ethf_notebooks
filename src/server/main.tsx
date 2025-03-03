import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { Hono } from 'hono'
import { type Strings, createStrings } from '../lib/strings'
import { api } from './api'
import { type AuthType, createAuth } from './auth'
import { type DBType, createDatabase, type schema } from './db'
import { tRPCHandler } from './trpc/handler'

declare global {
    interface M3StackGlobals {
        db: DBType
        auth: AuthType
        i18n: Strings
        strings: ReturnType<Strings['withLang']>
        lang: Strings['supportedLanguages'][number]
        schema: typeof schema
    }
}

// set timezone to buenos aires
process.env.TZ = 'America/Argentina/Buenos_Aires'

export async function main() {
    const publicPath = resolve(new URL(import.meta.url).pathname, '../../public')

    const indexHtmlContent = await readFile(join(publicPath, 'index.html'), 'utf-8')
    const db = createDatabase()
    const auth = createAuth({ db })
    const i18n = createStrings()
    const app = new Hono()
        .use(async (c, next) => {
            const lang = i18n.matchLang(c.req.header('Accept-Language'))
            c.set('db', db)
            c.set('auth', auth)
            c.set('i18n', i18n)
            c.set('lang', lang)
            c.set('strings', i18n.withLang(lang))
            return next()
        })
        .use('/api/trpc/*', async (c) => {
            return tRPCHandler(c)
        })
        .route('/api', api)
        .on(['POST', 'GET'], '/api/auth/*', (c) => {
            return auth.handler(c.req.raw)
        })
        .use(
            '*',
            serveStatic({
                root: (await stat('./dist').catch(() => null)) ? './dist/public' : './public',
            }),
        )
        .get('*', async (c) => {
            return c.html(indexHtmlContent)
        })

    const server = serve({
        fetch: app.fetch,
        port: 3999,
        hostname: '0.0.0.0',
    })

    server.on('listening', () => {
        console.info('Server listening on', server.address())
    })

    return app
}

const app = await main()

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch
export const HEAD = app.fetch
export const OPTIONS = app.fetch
