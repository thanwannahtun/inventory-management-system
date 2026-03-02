import { connectDatabase, sequelize } from '@/db/config/database';
import { Role } from '@/db/models/Role';
import { User } from '@/db/models/User';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import Op from 'sequelize/lib/operators';
// Mock user data for demo purposes
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In production, this would be hashed
    firstName: 'Admin',
    lastName: 'User',
    roleId: 1,
    isActive: true,
    role: {
      id: 1,
      name: 'Administrator',
      description: 'System administrator',
      permissions: JSON.stringify(['all']),
      isActive: true
    }
  },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    await connectDatabase();

    const userInstance = await User.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: username }] // Allow email login too
      }
    });

    if (!userInstance) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!userInstance.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userInstance.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // FIXED: Convert to plain object BEFORE destructuring/returning
    const user = userInstance.get({ plain: true });

    const token = btoa(JSON.stringify({
      userId: user.id,
      username: user.username,
      exp: Date.now() + 24 * 60 * 60 * 1000
    }));

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
