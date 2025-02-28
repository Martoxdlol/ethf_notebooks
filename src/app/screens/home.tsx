export function HomeScreen() {
    // const user = useUserData()

    // const { data: message } = api.hello.useQuery()

    // const navigate = useNavigate()

    return (
        <div>
            <div className='flex items-center gap-4 p-4 pb-2'>
                <div className='flex size-12 items-center justify-center rounded-full bg-primary/5 font-mono font-semibold text-lg'>12</div>
                <div>
                    <p className='font-semibold'>Tomás Cichero</p>
                    <p className='text-sm opacity-60'>5° año - Auditorio</p>
                </div>
            </div>
            <div className='relative'>
                <div className='absolute right-0 bottom-0 left-0 h-1 bg-primary/5' />
                <div
                    className='flex justify-between border-blue-500 border-b-4 text-primary/60 text-xs'
                    style={{
                        marginLeft: '12.5%',
                        width: '25%',
                    }}
                >
                    <p>8:30</p>
                    <p>11:30</p>
                </div>
            </div>
        </div>
    )
}
