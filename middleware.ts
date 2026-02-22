import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === 'ADMIN'

  const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // Allow auth pages for non-logged-in users
  if (isAuthPage) {
    return NextResponse.next()
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Admin routes require admin role
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
