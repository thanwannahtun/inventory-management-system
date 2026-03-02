import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from '@/db/models/User';
import { connectDatabase } from '@/db/config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET_KEY';
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}
export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  roleId: number;
  firstName: string;
  lastName: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    firstName: user.firstName,
    lastName: user.lastName
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');
    console.log("Auth header", authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No auth header");
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log("Token", token);
    const payload = verifyToken(token);
    console.log("Payload", payload);
    if (!payload) {
      console.log("Invalid token", payload);
      return null;
    }

    // await connectDatabase();
    // // Optionally verify user still exists in database
    // const user = await User.findByPk(payload.id);
    // if (!user || !user.isActive) {
    //   return null;
    // }
    // console.log("User", user);
    return payload;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
