import { authClient } from '@/lib/auth-client'
import { AlertTriangleIcon, HomeIcon, LaptopIcon, LogInIcon, PlusIcon, QrCodeIcon, SettingsIcon } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useLocation, useNavigate } from 'react-router'
import { HomeNavActions } from './home-nav-actions'
import { Button } from './ui/button'

function ErrorScreen(props: { message: string }) {
    return (
        <div className='flex size-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2 text-center text-xs'>
                <AlertTriangleIcon />
                <div>{props.message}</div>
            </div>
        </div>
    )
}

export function Layout(props: { children: React.ReactNode }) {
    const linkClassName = 'flex size-12 items-center justify-center rounded hover:bg-primary/5'

    const navigate = useNavigate()

    const pathname = useLocation().pathname

    return (
        <div className='flex size-full flex-col'>
            <header className='flex h-12 shrink-0 items-center pr-2 pl-4 shadow'>
                <h1 className='grow text-lg'>Notebooks ETHF</h1>
                {pathname === '/' && <HomeNavActions />}
                <Button size='icon' variant='ghost' onClick={() => authClient.signOut().then(() => navigate('/login'))} type='button'>
                    <LogInIcon />
                </Button>
            </header>
            <div className='flex min-h-0 grow flex-col md:flex-row-reverse'>
                <main className='relative flex min-h-0 shrink grow flex-col overflow-y-auto overflow-x-hidden'>
                    <ErrorBoundary fallbackRender={({ error }) => <ErrorScreen message={error.message} />}>{props.children}</ErrorBoundary>
                </main>
                <nav className='h-12 shrink-0 border-t md:h-auto md:w-16 md:border-t-0 md:border-r md:p-2'>
                    <ul className='flex items-center justify-around gap-2 md:flex-col md:gap-2'>
                        <li>
                            <Link to='/' className={linkClassName}>
                                <HomeIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/lista' className={linkClassName}>
                                <LaptopIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/reservas/nueva' className={linkClassName}>
                                <PlusIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/checkout' className={linkClassName}>
                                <QrCodeIcon />
                            </Link>
                        </li>
                        <li>
                            <Link to='/opciones' className={linkClassName}>
                                <SettingsIcon />
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
