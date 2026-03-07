import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Op } from 'sequelize';
import { sequelize } from '@/db/config/database';
import { Category } from '@/db/models/Category';
import { connectDatabase } from '@/db/config/database';
import { ActivityLog } from '@/db/models/ActivityLog';
import { withAuth } from '@/lib/middleware';
import { JWTPayload } from '@/lib/auth';
import { FIFOService } from '@/services/fifoService';

// GET all stock out records with filtering
export const GET = withAuth(async (request: NextRequest) => {

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
});


// POST new stock out record
export const POST = withAuth(async (request: NextRequest, { user }) => {
  const { username } = user;
  let t;

  try {
    await connectDatabase();
    t = await sequelize.transaction();

    const { productId, quantity, reason, notes } = await request.json();

    // 1. Validation
    if (!productId || !quantity || !reason) {
      if (t) await t.rollback();
      return NextResponse.json(
        { error: 'Product ID, quantity, and reason are required' },
        { status: 400 }
      );
    }

    // 2. Fetch product (needed to get the current Selling Price)
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      if (t) await t.rollback();
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 3. Use your FIFOService to handle the heavy lifting
    // This handles: Batch selection, Batch updates, StockOut record creation, and Activity Log
    const fifoResult = await FIFOService.removeStock(
      parseInt(productId),
      parseInt(quantity),
      product.price, // Current selling price
      reason,
      username,
      notes,
      t // 👈 VERY IMPORTANT: Pass the transaction
    );

    if (!fifoResult.success) {
      if (t) await t.rollback();
      return NextResponse.json({ error: fifoResult.error }, { status: 400 });
    }

    // 4. Finalize
    await t.commit();

    // Return the result (includes totalCost, totalValue, and totalProfit)
    return NextResponse.json(fifoResult, { status: 201 });

  } catch (error) {
    if (t && !t.afterCommit) await t.rollback();
    console.error('Error in stock-out:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});