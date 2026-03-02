import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/db/models/Category';
import { connectDatabase, sequelize } from '@/db/config/database';
import { ActivityLog } from '@/db/models/ActivityLog';
import { withAuth } from '@/lib/middleware';
import { JWTPayload } from '@/lib/auth';

// GET all categories
// export async function POST(request: NextRequest) {}

// export const GET = withAuth(async (request: NextRequest & { user: JWTPayload }) => {
export const GET = withAuth(async (request, { user, params }) => {
  try {
    await connectDatabase();
    const categories = await sequelize.models.Category.findAll({
      include: [
        {
          model: Category,
          as: 'children',
          required: false
        }
      ],
      where: {
        parent_id: null
      },
      order: [['name', 'ASC']]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
});

// POST new category
export const POST = withAuth(async (request, { user, params }) => {

  try {
    const { name, parent_id, is_active } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    await connectDatabase();
    const category = await Category.create({
      name,
      parent_id: parent_id || null,
      is_active: is_active !== undefined ? is_active : true
    });

    // Log the login activity
    await ActivityLog.create({
      type: 'category_added',
      description: `New Category Added: ${category.name} `,
      operator: 'admin'
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
});
