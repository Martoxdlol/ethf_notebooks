import { useMemo } from 'react'
import { compareTimes, decodeTime, encodeTime, times } from '@/lib/constants'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select'

export function DiscreteTimeSelect(props: {
    onChange: (value: string | undefined) => void
    value: string | undefined
    placeholder: string
    maxExclusive?: string
    minInclusive?: string
}) {
    const filteredTimes = useMemo(() => {
        const minInclusive = props.minInclusive
            ? decodeTime(props.minInclusive)
            : undefined
        const maxExclusive = props.maxExclusive
            ? decodeTime(props.maxExclusive)
            : undefined

        return times.filter((time) => {
            if (minInclusive && compareTimes(time, minInclusive) <= 0) {
                return false
            }
            if (maxExclusive && compareTimes(time, maxExclusive) >= 0) {
                return false
            }

            return true
        })
    }, [props.maxExclusive, props.minInclusive])

    return (
        <Select
            onValueChange={(value) => props.onChange(value)}
            required={true}
        >
            <SelectTrigger>
                <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Horarios</SelectLabel>
                    {filteredTimes.map((time, i) => (
                        <SelectItem key={i} value={encodeTime(time)}>
                            {encodeTime(time)}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
