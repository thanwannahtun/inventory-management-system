import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Op } from 'sequelize';
import { sequelize } from '@/db/config/database';
import { Category } from '@/db/models/Category';
import { connectDatabase } from '@/db/config/database';
import { ActivityLog } from '@/db/models/ActivityLog';
import { withAuth } from '@/lib/middleware';
import { JWTPayload } from '@/lib/auth';

// GET all stock out records with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDatabase();
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const reason = searchParams.get("reason")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    // search filter
    if (search) {
      where[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { operator: { [Op.like]: `%${search}%` } }
      ]
    }

    // reason filter
    if (reason) {
      where.reason = reason
    }

    // date filter
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date[Op.gte] = startDate
      if (endDate) where.date[Op.lte] = endDate
    }

    const StockOut = sequelize.models.StockOut

    const stockOutRecords = await StockOut.findAll({
      where,
    })

    return NextResponse.json(stockOutRecords)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}


// POST new stock out record
// export const POST = withAuth(async (request: NextRequest, context: {
//   user: JWTPayload;
// }) => {
// export const POST = withAuth(async (request: NextRequest, { user }) => {
export const POST = withAuth(async (request: NextRequest & { user: JWTPayload }) => {

    const { username} = request.user;

  // export async function POST(request: NextRequest) {
  // Declare t outside so it's accessible in the catch block
  let t;
  try {
    await connectDatabase();
    t = await sequelize.transaction();
    const { productId, quantity, reason, notes } = await request.json();

    if (!productId || !quantity || !reason) {
      await t.rollback();
      return NextResponse.json(
        { error: 'Product ID, quantity, and reason are required' },
        { status: 400 }
      );
    }

    // 2. Fetch product within the transaction context
    const product: any = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        }
      ],
      transaction: t // Pass transaction here
    });

    if (!product) {
      await t.rollback();
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const outQty = parseInt(quantity);
    if (product.quantity < outQty) {
      await t.rollback();
      return NextResponse.json({ error: 'Insufficient stock quantity' }, { status: 400 });
    }

    // 3. Update product quantity (decrement)
    await product.update(
      { quantity: product.quantity - outQty },
      { transaction: t } // Pass transaction here
    );

    // 4. Create stock out record
    const stockOutRecord = await sequelize.models.StockOut.create(
      {
        productId: parseInt(productId),
        productName: product.name,
        quantity: outQty,
        reason,
        date: new Date().toISOString().split('T')[0],
        operator: username,
        category: product.categoryRelation?.name ?? "",
        unitPrice: product.price,
        totalValue: product.price * outQty,
        notes: notes || null
      },
      { transaction: t } // Pass transaction here
    );

    await ActivityLog.create({
      type: 'stock_out',
      description: `${quantity} of ${product.name}: ${reason}`,
      operator: username,
    }, { transaction: t });

    // 5. If everything succeeded, commit the changes to the database
    await t.commit();

    return NextResponse.json(stockOutRecord, { status: 201 });

  } catch (error) {
    // 6. If ANY step fails, undo all changes made during this request
    if (t) await t.rollback();

    console.error('Error creating stock out record:', error);
    return NextResponse.json(
      { error: 'Failed to create stock out record' },
      { status: 500 }
    );
  }
});