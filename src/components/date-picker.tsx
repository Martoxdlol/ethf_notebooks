import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function DatePicker(props: {
    onChange: (value: Date | undefined) => void
    value: Date | undefined
    placeholder?: string
    children?: ReactElement
}) {
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                {props.children ?? (
                    <Button
                        type='button'
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !props.value && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {props.value ? (
                            format(props.value, 'PPP', { locale: es })
                        ) : (
                            <span>{props.placeholder}</span>
                        )}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
                <Calendar
                    required={true}
                    mode='single'
                    initialFocus={true}
                    onSelect={props.onChange}
                    selected={props.value}
                />
            </PopoverContent>
        </Popover>
    )
}
