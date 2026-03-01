import { NextRequest, NextResponse } from 'next/server';

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
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: 'user123',
    firstName: 'Regular',
    lastName: 'User',
    roleId: 2,
    isActive: true,
    role: {
      id: 2,
      name: 'User',
      description: 'Regular user',
      permissions: JSON.stringify(['read', 'write']),
      isActive: true
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Find user by username or email
    const user = mockUsers.find(u => 
      u.username === username || u.email === username
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate a simple token (in production, use JWT)
    const token = btoa(JSON.stringify({
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
