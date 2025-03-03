import { api } from '@/lib/api-client'
import { Loader2Icon } from 'lucide-react'
import { Button } from './ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'

export function InventoryUserPicker(props: {
    onChange: (value: number) => void
    value: number | undefined
}) {
    const { data, isPending } = api.listUsers.useQuery()

    if (isPending) {
        return (
            <Button disabled={true} variant='outline' className='w-full' type='button'>
                <Loader2Icon className='animate-spin' />
            </Button>
        )
    }

    if (!data) {
        return (
            <Button disabled={true} type='button'>
                error
            </Button>
        )
    }

    return (
        <Select
            disabled={!data?.isAdmin}
            value={props.value?.toString() ?? data.me.id.toString()}
            onValueChange={(v) => props.onChange(Number.parseInt(v))}
        >
            <SelectTrigger>
                <SelectValue placeholder='Seleccionar usuario...' />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Horarios</SelectLabel>
                    {data?.users.map((u, i) => (
                        <SelectItem key={i} value={u.id.toString()}>
                            {u.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
