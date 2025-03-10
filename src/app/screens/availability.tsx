import { encodeTime, times } from '@/lib/constants'

export function AvailabilityScreen() {
    return (
        <>
            <div className='mt-4 flex h-6 justify-around text-white'>
                <div className='flex h-full items-center bg-green-500 px-2'>Disponibles</div>
                <div className='flex h-full items-center bg-amber-500 px-2'>Reservadas</div>
                <div className='flex h-full items-center bg-gray-500 px-2'>No disponibilidad</div>
            </div>
            {times.map((time) => (
                <div className='px-4 pt-2' key={encodeTime(time)}>
                    <p className='font-semibold text-sm'>{encodeTime(time)}</p>
                    <div className='flex h-6 font-semibold text-white'>
                        <div className='flex h-full items-center bg-green-500 pl-2' style={{ flex: 55 }}>
                            55
                        </div>
                        <div className='flex h-full items-center bg-amber-500 pl-2' style={{ flex: 35 }}>
                            35
                        </div>
                        <div className='flex h-full items-center bg-gray-500 pl-2' style={{ flex: 10 }}>
                            10
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
