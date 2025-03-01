import type { Hardware } from '@/server/inventory'
import { useMemo } from 'react'
import { api } from './api-client'

export function useHardware() {
    const { data, error, isPending, isFetched, refetch } = api.listAssets.useQuery()

    const hardwareByAssetTag = useMemo(() => {
        const map = new Map<string, Hardware>()
        for (const h of data?.rows ?? []) {
            map.set(h.asset_tag, h)
        }
        return map
    }, [data])

    return {
        hardware: data?.rows ?? [],
        getByTag: (tag: string) => hardwareByAssetTag.get(tag),
        hardwareByAssetTag,
        error,
        isPending,
        isFetched,
        refetch,
    }
}
