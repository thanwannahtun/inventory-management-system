import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/db/models/Category';
import { connectDatabase, sequelize } from '@/db/config/database';
import { ActivityLog } from '@/db/models/ActivityLog';
import { withAuth } from '@/lib/middleware';
import { JWTPayload } from '@/lib/auth';

// GET all categories
// export async function POST(request: NextRequest) {}

// export const GET = withAuth(async (request: NextRequest & { user: JWTPayload }) => {
/*
export const GET = withAuth(async (request, { user, params }) => {
  try {
    await connectDatabase();
    const categories = await Category.findAll({
      include: [
        {
          model: Category,
          as: 'children',
          required: false,
          include: [
            {
              model: Category,
              as: 'children',
              required: false
            },
            {
              model: Category,
              as: 'parent',
              include: [{ model: Category, as: 'parent' }] // Continue nesting or use a recursive helper
            }
          ],
        },
        {
          model: Category,
          as: 'parent',
          include: [{ model: Category, as: 'parent' }] // Continue nesting or use a recursive helper
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
*/
export const GET = withAuth(async (request, { user, params }) => {
  try {
    await connectDatabase();

    // 1. Get search params from the URL
    const { searchParams } = new URL(request.url);
    const isNested = searchParams.get('nested') === 'true';
    const parent_id = searchParams.get('parent_id');

    let whereClause: any = {};

    if (parent_id) {
      whereClause.parent_id = parent_id;
    }
    if (!isNested) {
      const categories = await Category.findAll({
        include: [
          {
            model: Category,
            as: 'children',
            required: false,
            attributes: ["id", "name", "parent_id"]
          },
          // {
          //   model: Category,
          //   as: 'parent',
          //   include: [{ model: Category, as: 'parent' }] // Continue nesting or use a recursive helper
          // }
        ],
        where: whereClause,
        order: [['name', 'ASC']]
      });

      return NextResponse.json(categories);
    }
    // Return flat list or build tree based on condition
    // Fetch data (flat list is usually better for selects/filters)
    const allCategories = await Category.findAll({
      order: [['name', 'ASC']],
      raw: true,
      nest: true,
      where: whereClause
    });


    // Recursive Helper for Tree Mode
    const buildTree = (dataset: any[], parentId: number | null = null): any[] => {
      return dataset
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(dataset, item.id)
        }));
    };

    const categoryTree = buildTree(allCategories, null);
    return NextResponse.json(categoryTree);

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
      operator: 'admin',
      createdAt: new Date()
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
