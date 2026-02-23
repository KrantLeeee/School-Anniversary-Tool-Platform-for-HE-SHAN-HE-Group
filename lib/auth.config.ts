import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 8 * 60 * 60, // 8 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
            const isAdminRoute = nextUrl.pathname.startsWith('/admin')
            const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

            // Allow API auth routes
            if (isApiAuthRoute) return true

            // Redirect logged-in users away from auth pages
            if (isAuthPage) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
                return true
            }

            // Admin routes require admin role
            if (isAdminRoute) {
                if (auth?.user?.role === 'ADMIN') return true
                return Response.redirect(new URL('/', nextUrl))
            }

            return isLoggedIn // Redirect unauthenticated users to login page
        },
    },
    providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig
