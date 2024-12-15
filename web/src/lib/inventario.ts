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
