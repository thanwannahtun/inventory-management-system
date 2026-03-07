import { NextResponse } from 'next/server';
import { Op, fn, col } from 'sequelize';
import { connectDatabase } from '@/db/config/database';
import { Product } from '@/db/models/Product';
import { Category } from '@/db/models/Category';
import { StockBatch } from '@/db/models/StockBatch';
import { ActivityLog } from '@/db/models/ActivityLog';

export async function GET() {
  try {
    await connectDatabase();

    // 1. Basic Counts
    const totalProducts = await Product.count();
    const totalCategories = await Category.count();

    // 2. Real Low Stock Logic
    // We sum up the remainingQuantity in StockBatches grouped by productId
    const productsWithStock = await StockBatch.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('remainingQuantity')), 'totalRemaining']
      ],
      group: ['productId'],
      having: {
        totalRemaining: { [Op.lt]: 10 } // Business Rule: Alert if < 10
      }
    });
    const lowStockItems = productsWithStock.length;

    // 3. Real Inventory Value (Asset Value at Cost)
    // Business insight: We use remainingQuantity * purchasePrice from batches
    const allBatches = await StockBatch.findAll({
      where: { remainingQuantity: { [Op.gt]: 0 } }
    });

    const totalInventoryValue = allBatches.reduce((sum, batch) => {
      return sum + (batch.remainingQuantity * batch.purchasePrice);
    }, 0);

    // 4. Today's Stock Movements (Real data from ActivityLogs)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayActivities = await ActivityLog.findAll({
      where: {
        createdAt: { [Op.gte]: startOfToday }
      }
    });

    // We filter logs by type to get actual counts
    const todayStockIn = todayActivities.filter(log => log.type === 'stock_in').length;
    const todayStockOut = todayActivities.filter(log => log.type === 'stock_out').length;

    return NextResponse.json({
      totalProducts,
      totalCategories,
      lowStockItems,
      totalValue: totalInventoryValue, // Now showing your actual money tied up in stock
      todayStockIn,
      todayStockOut
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}