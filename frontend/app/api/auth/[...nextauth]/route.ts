/**
 * @file route.ts  (app/api/auth/[...nextauth]/route.ts)
 * @description NextAuth v5 App Router handler.
 *              This catches all /api/auth/* requests automatically.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
