import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Povolené e-mailové adresy — přidej další členy týmu sem
const POVOLENE_EMAILY = [
  'nechmerust@gmail.com',
  'tomas.bahnik@gmail.com',
  'katerina.valesova@gmail.com',
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? ''
      return POVOLENE_EMAILY.includes(email)
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 dní
  },
}
