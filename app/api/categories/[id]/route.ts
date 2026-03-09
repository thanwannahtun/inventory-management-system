import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/db/models/Category';
import { connectDatabase, sequelize } from '@/db/config/database';
import { withAuth } from '@/lib/middleware';
import { JWTPayload } from '@/lib/auth';
import { ActivityLog } from '@/db/models/ActivityLog';

// GET single category
export const GET = withAuth(async (request, { user, params }) => {
  try {
    // const { id } = await params;
    const { id } = await params;
    await connectDatabase();

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children'
        },
        {
          model: Category,
          as: 'parent',
          include: [{ model: Category, as: 'parent' }] // Continue nesting or use a recursive helper
        }
      ]
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
});

// PUT update category
export const PUT = withAuth(async (request, { user, params }) => {

  let t;
  try {
    const { username } = user;
    const { id } = await params;
    const body = await request.json();
    await connectDatabase();
    t = await sequelize.transaction();
    // const category = await sequelize.models.Category.findByPk(id);
    const category = await Category.findByPk(id, { transaction: t });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    await category.update({
      name: body.name,
      parent_id: body.parent_id || null,
      is_active: body.is_active !== undefined ? body.is_active : category.is_active
    }, { transaction: t });

    await ActivityLog.create({
      type: 'category_updated',
      description: `Category Updated: ${category.name} `,
      operator: username,
      createdAt: new Date()
    }, { transaction: t });

    await t.commit();
    return NextResponse.json(category);
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
});

// // DELETE category
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
export const DELETE = withAuth(async (request, { user, params }) => {
  let t;
  try {
    const { id } = await params;
    const { username } = user;
    await connectDatabase();
    t = await sequelize.transaction();
    const category = await Category.findByPk(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has children
    const hasChildren = await Category.count({
      where: { parent_id: id },
      transaction: t
    });

    if (hasChildren > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    await category.destroy({ transaction: t });

    await ActivityLog.create({
      type: "category_deleted",
      description: `Category Deleted: ${category.name} `,
      operator: username,
      createdAt: new Date(),
    }, { transaction: t });

    await t.commit();
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
});
