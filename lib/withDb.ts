import { connectDatabase } from '@/db/config/database';
import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (request: NextRequest, context: any) => Promise<NextResponse>;

export function withDb(handler: RouteHandler) {
  return async (request: NextRequest, context: any) => {
    try {
      // This uses your 'connectionPromise' logic - returns instantly if already connected
      await connectDatabase(); 
      return await handler(request, context);
    } catch (error) {
      console.error("🔥 Database Connection Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
