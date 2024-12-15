import { redirect } from 'next/navigation'
import { createAuthorizationCodeToken, getSession } from '~/auth'

export default async function Page() {
    const session = await getSession()

    if (!session) {
        redirect('/api/auth/signin?redirectTo=/login/mobile')
    }

    const token = await createAuthorizationCodeToken(session.user)

    return (
        <div>
            <a href={`ethf-notebooks://ethf-notebooks/auth/callback?code=${token}`}>
                Continuar como {session.user.name}
            </a>
        </div>
    )
}
