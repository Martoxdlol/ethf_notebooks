import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth-helpers'
import { fetchInventory } from '~/lib/inventario'

export async function GET(_req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await fetchInventory('/users')

    return NextResponse.json(users)
}
