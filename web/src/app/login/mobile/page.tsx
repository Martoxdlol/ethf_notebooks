import { createAuthorizationCodeToken, getSession, signIn } from '~/auth'

export default async function Page() {
    const session = await getSession()

    if (!session) {
        return signIn()
    }

    const token = await createAuthorizationCodeToken(session.user)

    return (
        <div>
            <a
                href={`ethf-notebooks://ethf-notebooks/auth/callback?code=${token}&server=${process.env.NEXTAUTH_URL ? encodeURIComponent(process.env.NEXTAUTH_URL) : ''}`}
            >
                Continuar como {session.user.name}
            </a>
        </div>
    )
}
