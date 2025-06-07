import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Ensure that this route is public
  publicRoutes: ['/'],
  // Redirect unauthenticated users to the sign-in page
  // Make sure to create this page in a later step
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
