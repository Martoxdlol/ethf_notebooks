// SnipeIT

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

export type Model = {
    id: number
    name: string
}

export type Manufacturer = {
    id: number
    name: string
}

export type AvailableAction = {
    checkin: boolean
    checkout: boolean
    clone: boolean
    delete: boolean
    restore: boolean
    update: boolean
}

export type Category = {
    id: number
    name: string
}

export type StatusLabel = {
    id: number
    name: string
    status_meta: string
    status_type: string
}

export type DateTime = {
    datetime: string
    formatted: string
}

export type AssignedTo = {
    email: string
    employee_number: string
    first_name: string
    id: number
    last_name: string
    name: string
    username: string
}

export type Hardware = {
    id: number
    name: string
    asset_tag: string
    serial: string
    image: string
    available_actions: AvailableAction
    model: Model
    manufacturer: Manufacturer
    category: Category
    status_label?: StatusLabel
    assigned_to?: AssignedTo
    last_checkout?: DateTime
    last_checkin?: DateTime
    created_at: DateTime
    updated_at: DateTime
}

export type HardwareResponse = {
    rows: Hardware[]
    total: number
}

export function listHardware(): Promise<HardwareResponse> {
    return fetchInventory('/hardware')
}

export type Group = {
    id: number
    name: string
}

export type User = {
    id: number
    email: string
    avatar: string
    name: string
    first_name: string
    last_name: string
    username: string
    groups: {
        total: number
        rows: Group[]
    } | null
}

export async function getUsers(): Promise<User[]> {
    return (await fetchInventory('/users?limit=1000')).rows
}

export async function getUser(email: string): Promise<User | null> {
    const result = await (fetchInventory(`/users?email=${encodeURIComponent(email)}&limit=1`) as Promise<{ rows: User[] }>)

    return result.rows[0] ?? null
}

export async function getUserById(id: number): Promise<User | null> {
    const result = await (fetchInventory(`/users/${id}`) as Promise<User>)

    return result
}
