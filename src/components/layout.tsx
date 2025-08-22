import {
    AlertTriangleIcon,
    HomeIcon,
    KeyboardIcon,
    LaptopIcon,
    Loader2Icon,
    LogInIcon,
    PlusIcon,
    QrCodeIcon,
    SettingsIcon,
} from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useLocation, useNavigate } from 'react-router'
import { authClient } from '@/lib/auth-client'
import { useIsAdmin } from '@/lib/hooks'
import { AvailabilityNavActions, HomeNavActions } from './nav-actions'
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
    return (
        <Suspense
            fallback={
                <div className='flex size-full items-center justify-center'>
                    <Loader2Icon className='animate-spin' />
                </div>
            }
        >
            <LayoutContent>{props.children}</LayoutContent>
        </Suspense>
    )
}
function LayoutContent(props: { children: React.ReactNode }) {
    const linkClassName =
        'flex size-12 items-center justify-center rounded hover:bg-primary/5'

    const navigate = useNavigate()

    const pathname = useLocation().pathname

    const isAdmin = useIsAdmin()

    return (
        <div className='flex size-full flex-col'>
            <header className='flex h-12 shrink-0 items-center pr-2 pl-4 shadow'>
                <h1 className='grow text-lg'>Notebooks ETHF</h1>
                {pathname === '/' && <HomeNavActions />}
                {pathname === '/disponibilidad' && <AvailabilityNavActions />}
                <Button
                    size='icon'
                    variant='ghost'
                    onClick={() =>
                        authClient.signOut().then(() => navigate('/login'))
                    }
                    type='button'
                >
                    <LogInIcon />
                </Button>
            </header>
            <div className='flex min-h-0 grow flex-col md:flex-row-reverse'>
                <main className='relative flex min-h-0 shrink grow flex-col overflow-y-auto overflow-x-hidden'>
                    <ErrorBoundary
                        fallbackRender={({ error }) => (
                            <ErrorScreen message={error.message} />
                        )}
                    >
                        {props.children}
                    </ErrorBoundary>
                </main>
                <nav className='h-12 shrink-0 border-t md:h-auto md:w-16 md:border-t-0 md:border-r md:p-2'>
                    <ul className='flex items-center justify-around gap-2 md:flex-col md:gap-2'>
                        <li>
                            <Link to='/' className={linkClassName}>
                                <HomeIcon />
                            </Link>
                        </li>
                        {!isAdmin && (
                            <li>
                                <Link
                                    to='/reservas/nueva'
                                    className={linkClassName}
                                >
                                    <PlusIcon />
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link to='/lista' className={linkClassName}>
                                <LaptopIcon />
                            </Link>
                        </li>
                        {isAdmin && (
                            <li>
                                <Link
                                    to='/reservas/nueva'
                                    className={linkClassName}
                                >
                                    <PlusIcon />
                                </Link>
                            </li>
                        )}
                        {isAdmin && (
                            <li>
                                <Link to='/checkout' className={linkClassName}>
                                    <QrCodeIcon />
                                </Link>
                            </li>
                        )}
                        {isAdmin && (
                            <li>
                                <Link
                                    to='/checkout_keyboard'
                                    className={linkClassName}
                                >
                                    <KeyboardIcon />
                                </Link>
                            </li>
                        )}
                        {isAdmin && (
                            <li>
                                <Link to='/opciones' className={linkClassName}>
                                    <SettingsIcon />
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </div>
    )
}
