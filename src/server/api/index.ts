import { Hono } from 'hono'
import { responsePrintTags } from '../print-tags'

export const api = new Hono()
    .get('/etiquetas.pdf', async () => {
        return responsePrintTags()
    })
    .notFound(async (c) => {
        return c.text('Not Found')
    })
