import { Layout } from '@/components/layout'
import { useEffect } from 'react'
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate } from 'react-router'
import { useSession } from '../lib/auth-client'
import { CheckoutScreen } from './screens/checkout'
import { HomeScreen } from './screens/home'
import { LoginScreen } from './screens/login'
import { NewReservationScreen } from './screens/new-reservation'
import { ReservationScreen } from './screens/reservation'

function Redirect(props: { path: string }) {
    const navigate = useNavigate()

    useEffect(() => {
        navigate(props.path, { replace: true })
    }, [])

    return null
}

function RequiresAuth(props: { children: React.ReactNode; fallback: React.ReactNode }) {
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

function RequiresNotAuth(props: { children: React.ReactNode; fallback: React.ReactNode }) {
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
                        <RequiresAuth fallback={<Link to='/login'>Please login</Link>}>
                            <Layout>
                                <Outlet />
                            </Layout>
                        </RequiresAuth>
                    }
                >
                    <Route path='/' element={<HomeScreen />} />
                    <Route path='/checkout' element={<CheckoutScreen />} />
                    <Route path='/reservas/nueva' element={<NewReservationScreen />} />
                    <Route path='/reservas/:reservationId' element={<ReservationScreen />} />
                </Route>
                <Route
                    element={
                        <RequiresNotAuth fallback={<Link to='/'>Please logout</Link>}>
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
