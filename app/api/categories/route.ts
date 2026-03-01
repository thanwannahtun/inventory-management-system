import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/db/models/Category';

// GET all categories
export async function GET() {
  try {
    const categories = await Category.findAll({
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
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    const { name, parent_id, is_active } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      parent_id: parent_id || null,
      is_active: is_active !== undefined ? is_active : true
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
