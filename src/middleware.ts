import { clerkMiddleware } from "@clerk/nextjs";

export default clerkMiddleware({
  publicRoutes: ['/'],
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up', // Added this line
});

export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
