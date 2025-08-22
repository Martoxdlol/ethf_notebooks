import { useMemo } from 'react'
import { getReservationIdByNotes, type Hardware } from '@/server/inventory'
import { api } from './api-client'

export function useHardware() {
    const { data, error, isPending, isFetched, refetch } =
        api.listAssets.useQuery()

    const hardwareByAssetTag = useMemo(() => {
        const map = new Map<string, Hardware>()
        for (const h of data?.rows ?? []) {
            map.set(h.asset_tag, h)
        }
        return map
    }, [data])

    const hardwareByReservationId = useMemo(() => {
        const map = new Map<string, Hardware[]>()
        for (const h of data?.rows ?? []) {
            const reservationId = getReservationIdByNotes(h.notes)
            if (reservationId) {
                const current = map.get(reservationId) ?? []
                current.push(h)
                map.set(reservationId, current)
            }
        }
        return map
    }, [data])

    return {
        hardware: data?.rows ?? [],
        getByTag: (tag: string) => hardwareByAssetTag.get(tag),
        getReservationIdByTag: (tag: string) => {
            const notes = hardwareByAssetTag.get(tag)?.notes
            if (notes && hardwareByAssetTag.get(tag)?.assigned_to) {
                return getReservationIdByNotes(notes)
            }
        },
        hardwareByAssetTag,
        hardwareByReservationId,
        error,
        isPending,
        isFetched,
        refetch,
    }
}

export function useMe() {
    const [data] = api.me.useSuspenseQuery()

    return data
}

export function useIsAdmin() {
    return useMe().isAdmin
}
