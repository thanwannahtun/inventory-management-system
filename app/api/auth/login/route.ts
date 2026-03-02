import { connectDatabase, sequelize } from '@/db/config/database';
import { Role } from '@/db/models/Role';
import { User } from '@/db/models/User';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { ActivityLog } from '@/db/models/ActivityLog';
import Op from 'sequelize/lib/operators';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    await connectDatabase();

    const userInstance = await User.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: username }] // Allow email login too
      },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description', 'permissions']
        }
      ]
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

    // Generate real JWT token
    const token = generateToken(userInstance);

    // Log the login activity
    await ActivityLog.create({
      type: 'login',
      description: `${user.username} logged in`,
      operator: user.username
    });

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
