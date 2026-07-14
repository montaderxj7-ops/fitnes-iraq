import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        // @ts-ignore
        return token?.role === "COACH";
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
