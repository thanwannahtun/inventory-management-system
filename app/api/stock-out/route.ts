import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { StockOut } from '@/db/models/StockOut';
import { Op } from 'sequelize';
import { sequelize } from '@/db/config/database';

// GET all stock out records with filtering
export async function GET(request: NextRequest) {
  try {
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
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity, reason, notes, operator } = await request.json();

    if (!productId || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Product ID, quantity, and reason are required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.quantity < parseInt(quantity)) {
      return NextResponse.json(
        { error: 'Insufficient stock quantity' },
        { status: 400 }
      );
    }

    // Update product quantity
    await product.update({
      quantity: product.quantity - parseInt(quantity)
    });

    // Create stock out record
    const stockOutRecord = await sequelize.models.StockOut.create({
      productId: parseInt(productId),
      productName: product.name,
      quantity: parseInt(quantity),
      reason,
      date: new Date().toISOString().split('T')[0],
      operator: operator || 'Current User',
      // category: product.categoryRelation?.name, // Would come from product relationship
      unitPrice: product.price,
      totalValue: product.price * parseInt(quantity),
      notes: notes || null
    });

    return NextResponse.json(stockOutRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating stock out record:', error);
    return NextResponse.json(
      { error: 'Failed to create stock out record' },
      { status: 500 }
    );
  }
}
