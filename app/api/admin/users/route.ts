import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models/User';
import { Role } from '@/db/models/Role';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs'; // 1. Import bcrypt

import { connectDatabase, sequelize } from '@/db/config/database';

// GET all users with roles
export async function GET() {
  try {
    await connectDatabase();
    const users = await User.findAll({
      // const users = await sequelize.models.User.findAll({
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      roleId
    } = await request.json();

    if (!username || !email || !password || !firstName || !lastName || !roleId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // 2. Hash the password before saving
    // Using a salt factor of 10 is standard for performance/security balance
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user with the HASHED password
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // Use the variable created above
      firstName,
      lastName,
      roleId: parseInt(roleId),
      isActive: true
    });

    // 4. Clean the response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
