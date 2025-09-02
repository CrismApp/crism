import { auth } from "@/lib/auth"

// Better Auth handler for Next.js App Router
const handler = auth.handler

export { handler as GET, handler as POST }