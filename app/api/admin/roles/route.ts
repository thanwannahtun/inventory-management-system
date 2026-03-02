import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/db/models/Role';
import { connectDatabase } from '@/db/config/database';

// GET all roles
export async function GET() {
  try {
      await connectDatabase();
    const roles = await Role.findAll({
      where: {
        isActive: true
      },
      order: [['name', 'ASC']]
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}
