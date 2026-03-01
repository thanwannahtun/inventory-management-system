import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Category } from '@/db/models/Category';
import { Op } from 'sequelize';

// GET dashboard statistics
export async function GET() {
  try {
    // Get total products count
    const totalProducts = await Product.count();

    // Get total categories count
    const totalCategories = await Category.count();

    // Get low stock items (less than 10 units)
    const lowStockItems = await Product.count({
      where: {
        quantity: {
          [Op.lt]: 10
        }
      }
    });

    // Get total inventory value
    const products = await Product.findAll({
      attributes: ['price', 'quantity']
    });

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);

    // Get today's stock movements (mock data for now)
    // In a real app, you would have a StockMovement table
    const todayStockIn = 25; // Mock data
    const todayStockOut = 18; // Mock data

    return NextResponse.json({
      totalProducts,
      totalCategories,
      lowStockItems,
      totalValue,
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
