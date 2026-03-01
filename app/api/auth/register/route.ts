import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models/User';
import { Role } from '@/db/models/Role';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, firstName, lastName } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        // [User.sequelize!.Op.or]: [
        //   { username: username },
        //   { email: email }
        // ]
        username: username,
        email: email
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Get default user role
    const userRole = await Role.findOne({ where: { name: 'User' } });
    
    if (!userRole) {
      return NextResponse.json(
        { error: 'Default user role not found' },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId: userRole.id,
      isActive: true
    });

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
