import { authClient } from '@/lib/auth-client'
import { CalendarDaysIcon, CheckCheckIcon, HomeIcon, LogInIcon, PlusIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from './ui/button'

export function Layout(props: { children: React.ReactNode }) {
    const linkClassName = 'flex size-12 items-center justify-center rounded hover:bg-primary/5'

    const navigate = useNavigate()

    return (
        <div className='flex size-full flex-col'>
            <header className='flex h-12 shrink-0 items-center pr-2 pl-4 shadow'>
                <h1 className='grow text-lg'>Notebooks ETHF</h1>
                <Button size='icon' variant='ghost' onClick={() => authClient.signOut().then(() => navigate('/login'))}>
                    <LogInIcon />
                </Button>
            </header>
            <div className='flex min-h-0 grow flex-col md:flex-row-reverse'>
                <main className='flex min-h-0 shrink grow flex-col overflow-y-auto'>{props.children}</main>
                <nav className='h-12 shrink-0 border-t md:h-auto md:w-16 md:border-t-0 md:border-r md:p-2'>
                    <ul className='flex items-center justify-around gap-2 md:flex-col md:gap-2'>
                        <li>
                            <Link to='/' className={linkClassName}>
                                <HomeIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/calendario' className={linkClassName}>
                                <CalendarDaysIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/reservas/nueva' className={linkClassName}>
                                <PlusIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/checkout' className={linkClassName}>
                                <CheckCheckIcon />
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
