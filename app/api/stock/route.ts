import { NextRequest, NextResponse } from 'next/server';
import { FIFOService } from '@/services/fifoService';
import { withAuth } from '@/lib/middleware';

// GET stock status for a specific product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      // Return all products with stock status
      const allStockStatus = await FIFOService.getAllStockStatus();
      return NextResponse.json(allStockStatus);
    }

    const stockStatus = await FIFOService.getStockStatus(parseInt(productId));
    
    if (!stockStatus) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stockStatus);
  } catch (error) {
    console.error('Error fetching stock status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock status' },
      { status: 500 }
    );
  }
}

// POST add stock (create new batch)
export const POST = withAuth(async (request : NextRequest, { user }) => {
  try {
    const { productId, quantity, purchasePrice } = await request.json();

    if (!productId || !quantity || !purchasePrice) {
      return NextResponse.json(
        { error: 'Product ID, quantity, and purchase price are required' },
        { status: 400 }
      );
    }

    const batch = await FIFOService.addStock(
      parseInt(productId),
      parseInt(quantity),
      parseFloat(purchasePrice),
      user.username
    );

    return NextResponse.json({
      success: true,
      message: 'Stock added successfully',
      batch
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding stock:', error);
    return NextResponse.json(
      { error: 'Failed to add stock' },
      { status: 500 }
    );
  }
});
