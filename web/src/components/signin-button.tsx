'use client'

import { signIn } from 'next-auth/react'

export function SigninButton() {
    return (
        <button
            type='button'
            onClick={() => signIn('microsoft-entra-id')}
            className='rounded-lg border px-6 py-4 text-lg flex items-center justify-center max-w-[300px] w-full'
        >
            Iniciar sesión
        </button>
    )
}

export function SigninPage() {
    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <SigninButton />
        </div>
    )
}
