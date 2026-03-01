import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models/User';
import { Role } from '@/db/models/Role';
import { Op } from 'sequelize';
import { sequelize } from '@/db/config/database';

// GET all users with roles
export async function GET() {
  try {
    // const users = await User.findAll({
    const users = await sequelize.models.User.findAll({
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

// POST new user
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

    // Check if user already exists
    const existingUser = await sequelize.models.User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Create user (password should be hashed in production)
    const user = await sequelize.models.User.create({
      username,
      email,
      password, // In production, hash this with bcrypt
      firstName,
      lastName,
      roleId: parseInt(roleId),
      isActive: true
    });

    // Return user without password
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
