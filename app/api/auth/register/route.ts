import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models/User';
import { Role } from '@/db/models/Role';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '@/db/config/database';
import { Op } from 'sequelize'; // Import Op for OR logic

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, firstName, lastName } = await request.json();

    await connectDatabase();

    // FIXED: Check if EITHER username OR email exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      // Professional tip: Tell them exactly which one is taken
      const field = existingUser.username === username ? 'Username' : 'Email';
      return NextResponse.json({ error: `${field} is already taken` }, { status: 400 });
    }

    const userRole = await Role.findOne({ where: { name: 'User' } });
    if (!userRole) {
      return NextResponse.json({ error: 'System configuration error: Role not found' }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId: userRole.id,
      isActive: true
    });

    // Use toJSON() or get({plain: true}) to avoid circular JSON errors
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
