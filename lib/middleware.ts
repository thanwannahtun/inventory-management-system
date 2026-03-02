import { NextRequest } from 'next/server';
import { getCurrentUser, JWTPayload } from './auth';

export function withAuth(
  handler: (request: NextRequest, context: { user: JWTPayload; params: any }) => Promise<Response>
) {
  // context is the second argument provided by Next.js (contains params)
  return async (request: NextRequest, context: any) => {
    const user = await getCurrentUser(request);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Merge the user into the context object so it's accessible as the 2nd arg
    return handler(request, { ...context, user });
  };
}

// Helper to get current user from request
export async function getUserFromRequest(request: NextRequest) {
  return await getCurrentUser(request);
}
