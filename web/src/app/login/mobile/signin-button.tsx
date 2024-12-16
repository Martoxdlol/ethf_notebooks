'use client'

import { signIn } from 'next-auth/react'

export function SigninButton(props: { children?: React.ReactNode }) {
    return (
        <button
            type='submit'
            className='w-full text-left block border-t dark:border-t-white/15 border-t-black/15 pt-2'
            onClick={() => signIn('microsoft-entra-id')}
        >
            <p className='flex gap-2 justify-between'>{props.children}</p>
        </button>
    )
}
