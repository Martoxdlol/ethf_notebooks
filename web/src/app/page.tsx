import Link from 'next/link'
import { SigninPage } from '~/components/signin-button'
import { getSession } from '~/lib/auth-helpers'

export default async function Page() {
    const session = await getSession()

    if (!session) {
        return <SigninPage />
    }

    const linkClassName = 'block border border-black/15 dark:border-white/15 p-2 rounded-lg text-lg px-4 py-2'

    return (
        <>
            <nav className='border-b dark:border-b-white/15 border-b-black/15 p-2'>
                <h1 className='text-lg'>ETHF Notebooks</h1>
            </nav>
            <main className='p-2 sm:px-4 flex flex-col gap-2'>
                <Link href='/api/assets/print/etiquetas_notebooks' className={linkClassName}>
                    Generar etiquetas
                </Link>
                <Link href='/app-release.apk' className={linkClassName}>
                    Descargar aplicación Android
                </Link>
                <Link href='/app' className={linkClassName}>
                    Abrir app web
                </Link>
                <Link href='/notebooks' className={linkClassName}>
                    Ver Notebooks
                </Link>
            </main>
        </>
    )
}
