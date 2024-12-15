import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/auth'
import { getAssetByTag } from '~/lib/inventario'

export async function GET(
    _req: NextRequest,
    context: {
        params: Promise<{ tag: string }>
    },
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tag = (await context.params).tag

    const asset = await getAssetByTag(tag)

    console.log(asset)

    return NextResponse.json(asset)
}
