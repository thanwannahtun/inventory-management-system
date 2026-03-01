import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/db/models/User';
import { Role } from '@/db/models/Role';
import { sequelize } from '@/db/config/database';

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await User.findByPk(parseInt(params.id), {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { 
      username, 
      email, 
      firstName, 
      lastName, 
      roleId, 
      isActive,
      password 
    } = await request.json();

    const user = await User.findByPk(parseInt(params.id));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      username: username || user.username,
      email: email || user.email,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      roleId: roleId ? parseInt(roleId) : user.roleId,
      isActive: isActive !== undefined ? isActive : user.isActive
    };

    // Only update password if provided
    if (password) {
      updateData.password = password; // In production, hash this with bcrypt
    }

    await user.update(updateData);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  
  try {
      // asynchronous access of `params.id` in client.
  // const { id } = React.use(params)
    // asynchronous access of `params.id`.
  const { id } = await params;
    const user = await User.findByPk(parseInt(id));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await user.destroy();

    return NextResponse.json(
      { message: 'User deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
