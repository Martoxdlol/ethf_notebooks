export type Time = {
    minutes: number
    hours: number
}

export const times: Time[] = [
    { hours: 7, minutes: 30 },
    { hours: 8, minutes: 30 },
    { hours: 9, minutes: 30 },
    { hours: 10, minutes: 30 },
    { hours: 11, minutes: 30 },
    { hours: 12, minutes: 30 },
    { hours: 13, minutes: 30 },
    { hours: 14, minutes: 30 },
    { hours: 15, minutes: 30 },
    { hours: 16, minutes: 30 },
    { hours: 17, minutes: 30 },
    { hours: 18, minutes: 30 },
]

export function encodeTime(time: Time): string {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`
}

export function decodeTime(time: string): Time {
    const [hours, minutes] = time
        .split(':')
        .map((part) => Number.parseInt(part, 10))

    if (!(hours && minutes)) {
        throw new Error('Invalid time format')
    }

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        throw new Error('Invalid time format')
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time range')
    }

    return { hours, minutes }
}

export function compareTimes(a: Time, b: Time): number {
    return a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes)
}

export function timeToValue(time: Time): number {
    return time.hours * 60 + time.minutes
}

export const maxTimeValue = timeToValue(times[times.length - 1]!)
export const minTimeValue = timeToValue(times[0]!)

export function timestampToTime(timestamp: number): Time {
    const date = new Date(timestamp)
    return { hours: date.getHours(), minutes: date.getMinutes() }
}

// number between 0 and 1 in the range of the times
export const timeToFactor = (time: Time): number => {
    return (timeToValue(time) - minTimeValue) / (maxTimeValue - minTimeValue)
}
