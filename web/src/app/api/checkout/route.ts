import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth-helpers'
import { checkoutTag, getAssetByTag } from '~/lib/inventario'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const assets = body.assets as string[]
    const checkoutBy = session.user.email as string
    const responsible = body.responsible as number
    const finalUser = body.user as string | undefined
    const expected_checkin = new Date(body.expected_checkin)

    for (const asset of assets) {
        const data = await getAssetByTag(asset).catch((e) => {
            console.error(e)
            return null
        })
        if (!data) {
            continue
        }
        await checkoutTag({
            assigned_asset: data.id,
            assigned_user: responsible,
            user: finalUser,
            checkout_by: checkoutBy,
            checkout_at: new Date(),
            expected_checkin,
        }).catch((e) => {
            console.error(e)
            return null
        })
    }

    return NextResponse.json({ success: true })
}
