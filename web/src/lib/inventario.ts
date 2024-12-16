export function fetchInventory(path: string, method?: string, body?: unknown) {
    return fetch(`${process.env.INVENTORY_API_URL}${path}`, {
        method: method || 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.INVENTORY_API_KEY}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    }).then((r) => r.json())
}

export function getAssetByTag(tag: string) {
    return fetchInventory(`/hardware/bytag/${tag}`)
}

export function checkoutTag(opts: {
    assigned_user: number
    assigned_asset: number
    expected_checkin: Date
    checkout_at: Date
    user?: string
    checkout_by: string
}) {
    return fetchInventory(`/hardware/${opts.assigned_asset}/checkin`, 'POST', {
        ...opts,
        checkout_to_type: 'user',
        assigned_asset: undefined,
        note: `Entregado por ${opts.checkout_by}.${opts.user ? ` Para ${opts.user}.` : ''}`,
    })
}
