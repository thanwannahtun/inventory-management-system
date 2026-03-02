import { NextRequest, NextResponse } from 'next/server';
import { StockOut } from '@/db/models/StockOut';
import { Product } from '@/db/models/Product';
import { connectDatabase } from '@/db/config/database';

// GET single stock out record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDatabase();
    const { id } = await params;

    const stockOutRecord = await StockOut.findByPk(parseInt(id), {
      include: [
        {
          model: Product,
          as: 'productRelation',
          attributes: ['name', 'price', 'quantity', 'color', 'storage', 'ram']
        }
      ]
    });

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

// PUT update stock out record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDatabase();
    const { id } = await params;

    const { quantity, reason, notes, operator } = await request.json();

    const stockOutRecord = await StockOut.findByPk(parseInt(id));

    if (!stockOutRecord) {
      return NextResponse.json(
        { error: 'Stock out record not found' },
        { status: 404 }
      );
    }

    await stockOutRecord.update({
      quantity: quantity || stockOutRecord.quantity,
      reason: reason || stockOutRecord.reason,
      notes: notes !== undefined ? notes : stockOutRecord.notes,
      operator: operator || stockOutRecord.operator
    });

    return NextResponse.json(stockOutRecord);
  } catch (error) {
    console.error('Error updating stock out record:', error);
    return NextResponse.json(
      { error: 'Failed to update stock out record' },
      { status: 500 }
    );
  }
}

// DELETE stock out record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDatabase();
    const { id } = await params;
    const stockOutRecord = await StockOut.findByPk(parseInt(id));

    if (!stockOutRecord) {
      return NextResponse.json(
        { error: 'Stock out record not found' },
        { status: 404 }
      );
    }

    await stockOutRecord.destroy();

    return NextResponse.json(
      { message: 'Stock out record deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting stock out record:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock out record' },
      { status: 500 }
    );
  }
}
