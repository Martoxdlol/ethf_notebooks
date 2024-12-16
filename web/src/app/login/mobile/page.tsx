import { ArrowRightIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { createAuthorizationCodeToken, getSession } from '~/lib/auth-helpers'
import { SignOutButton } from './sign-out'
import { SigninButton } from './signin-button'

export default async function Page() {
    const session = await getSession()

    const token = session ? await createAuthorizationCodeToken(session.user) : null

    const nativeSigninUrl = `ethf-notebooks://ethf-notebooks/auth/callback?code=${token}`

    return (
        <main className='fixed overflow-y-auto items-center justify-center flex top-0 left-0 right-0 bottom-0 p-2'>
            <div className='max-w-[500px] w-full p-4 border rounded-xl flex flex-col gap-2'>
                <h1 className='text-lg'>Ingresar a ETHF Notebooks</h1>
                {session && (
                    <a href={nativeSigninUrl} className='block border-t dark:border-t-white/15 border-t-black/15 pt-2'>
                        <p>{session.user.name}</p>
                        <span className='text-sm opacity-60'>{session.user.email}</span>
                    </a>
                )}

                <SigninButton>
                    {session ? 'Usar otra cuenta' : 'Iniciar sesión'} {!session && <ArrowRightIcon />}
                </SigninButton>
                <form
                    className='w-full'
                    action={async () => {
                        'use server'
                        await signOut()
                    }}
                >
                    {session && <SignOutButton>Cerrar sesión</SignOutButton>}
                </form>
            </div>
        </main>
    )
}
