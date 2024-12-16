import NextAuth from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

export const { auth, handlers, signIn, signOut } = NextAuth({
    session: {
        strategy: 'jwt',
    },
    secret: process.env.AUTH_SECRET,
    providers: [MicrosoftEntraID],
})
