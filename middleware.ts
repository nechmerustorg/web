import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
})

export const config = {
  // Chraň hlavní stránku; API routes jsou volány z přihlášeného UI
  matcher: ['/((?!api|auth|_next/static|_next/image|favicon.ico).*)'],
}
