import { NextRequest, NextResponse } from 'next/server';
import { StockOut } from '@/db/models/StockOut';
import { Product } from '@/db/models/Product';
import { connectDatabase, sequelize } from '@/db/config/database';
import { StockBatch } from '@/db/models/StockBatch';
import { ActivityLog } from '@/db/models/ActivityLog';

// GET single stock out record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDatabase();
    const { id } = await params;

    // GET single stock out record
    const stockOutRecord = await StockOut.findByPk(parseInt(id), {
      include: [
        {
          model: Product,
          as: 'productRelation',
          attributes: ['name', 'price'],
          required: true
        },
        // Add Batch info to see the cost side
        {
          model: StockBatch,
          as: 'batchRelation',
          attributes: ['purchasePrice', 'receivedDate'],
          required: true
        }
      ],
    });
    console.log('👋🏻👋🏻👋🏻 stockOutRecord', stockOutRecord);
    if (!stockOutRecord) {
      return NextResponse.json(
        { error: 'Stock out record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stockOutRecord);
  } catch (error) {
    console.error('Error fetching stock out record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock out record' },
      { status: 500 }
    );
  }
}

// DELETE stock out record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  let t = await sequelize.transaction();
  try {
    const { id } = await params;
    const record = await StockOut.findByPk(parseInt(id), { transaction: t });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 1. Put the stock back into the specific batch it came from
    if (record.batchId) {
      const batch = await StockBatch.findByPk(record.batchId, { transaction: t });
      if (batch) {
        await batch.update({
          remainingQuantity: batch.remainingQuantity + record.quantity
        }, { transaction: t });
      }
    }

    // 2. Log the reversal
    await ActivityLog.create({
      type: 'stock_in', // Or 'return_to_stock'
      description: `Reversed Sale: ${record.quantity} units of ${record.productName} returned to batch ${record.batchId}`,
      operator: 'SYSTEM',
      createdAt: new Date(),
    }, { transaction: t });

    await record.destroy({ transaction: t });
    await t.commit();
    return NextResponse.json({ message: 'Stock returned and record deleted' });
  } catch (error) {
    if (t) await t.rollback();
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}