import { useEffect } from 'react'
import {
    BrowserRouter,
    Link,
    Outlet,
    Route,
    Routes,
    useNavigate,
} from 'react-router'
import { Layout } from '@/components/layout'
import { useSession } from '../lib/auth-client'
import { AvailabilityScreen } from './screens/availability'
import { CheckoutScreen } from './screens/checkout'
import { CheckoutScreenKeyboard } from './screens/checkout_keyboard'
import { HomeScreen } from './screens/home'
import { ListScreen } from './screens/list'
import { LoginScreen } from './screens/login'
import { NewReservationScreen } from './screens/new-reservation'
import { OptionsScreen } from './screens/options-screen'
import { ReservationScreen } from './screens/reservation'

function Redirect(props: { path: string }) {
    const navigate = useNavigate()

    useEffect(() => {
        navigate(props.path, { replace: true })
    }, [])

    return null
}

function RequiresAuth(props: {
    children: React.ReactNode
    fallback: React.ReactNode
}) {
    const session = useSession()

    if (session.error) {
        return <div>Error: {session.error.message}</div>
    }

    if (!session.loaded) {
        return <div>Loading...</div>
    }

    if (session.data?.user) {
        return <>{props.children}</>
    }

    return <Redirect path='/login' />
}

function RequiresNotAuth(props: {
    children: React.ReactNode
    fallback: React.ReactNode
}) {
    const session = useSession()

    if (session.error) {
        return <div>Error: {session.error.message}</div>
    }

    if (!session.loaded) {
        return <div>Loading...</div>
    }

    if (!session.data?.user) {
        return <>{props.children}</>
    }

    return <Redirect path='/' />
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    element={
                        <RequiresAuth
                            fallback={<Link to='/login'>Please login</Link>}
                        >
                            <Layout>
                                <Outlet />
                            </Layout>
                        </RequiresAuth>
                    }
                >
                    <Route path='/' element={<HomeScreen />} />
                    <Route path='/checkout' element={<CheckoutScreen />} />
                    <Route
                        path='/checkout_keyboard'
                        element={<CheckoutScreenKeyboard />}
                    />
                    <Route
                        path='/reservas/nueva'
                        element={<NewReservationScreen />}
                    />
                    <Route
                        path='/reservas/:reservationId'
                        element={<ReservationScreen />}
                    />
                    <Route path='/opciones' element={<OptionsScreen />} />
                    <Route path='/lista' element={<ListScreen />} />
                    <Route
                        path='/disponibilidad'
                        element={<AvailabilityScreen />}
                    />
                    <Route
                        path='*'
                        element={
                            <Link to='/' className='w-full py-10 text-center'>
                                Inicio
                            </Link>
                        }
                    />
                </Route>
                <Route
                    element={
                        <RequiresNotAuth
                            fallback={<Link to='/'>Please logout</Link>}
                        >
                            <Outlet />
                        </RequiresNotAuth>
                    }
                >
                    <Route path='/login' element={<LoginScreen />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
