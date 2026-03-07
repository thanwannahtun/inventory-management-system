import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Category } from '@/db/models/Category';
import { Specification } from '@/db/models/Specification';
import { Op } from 'sequelize';
import { connectDatabase, sequelize } from '@/db/config/database';
import { withAuth } from '@/lib/middleware';
import { JWTPayload } from '@/lib/auth';
import { ActivityLog } from '@/db/models/ActivityLog';
import { FIFOService } from '@/services/fifoService';
import { StockBatch } from '@/db/models/StockBatch';

// GET all products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const color = searchParams.get('color') || '';
    const storage = searchParams.get('storage') || '';
    const ram = searchParams.get('ram') || '';
    const inStockOnly = searchParams.get('inStockOnly') === 'true';

    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { color: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = parseInt(category);
    }

    if (minPrice) {
      whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice) {
      whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(maxPrice) };
    }

    if (color) {
      whereClause.color = { [Op.like]: `%${color}%` };
    }

    if (storage) {
      whereClause.storage = { [Op.like]: `%${storage}%` };
    }

    if (ram) {
      whereClause.ram = { [Op.like]: `%${ram}%` };
    }

    if (inStockOnly) {
      whereClause.quantity = { [Op.gt]: 0 };
    }

    // Get products with stock batches and category
    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        },
        {
          model: StockBatch,
          as: 'stockBatches',
          order: [['receivedDate', 'ASC'], ['createdAt', 'ASC']]
        }
      ],
      order: [['name', 'ASC']]
    });

    // Calculate virtual fields
    const productsWithStock = products.map(product => {
      const batches = product.stockBatches || [];
      const totalQuantity = batches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
      const totalValue = batches.reduce((sum, batch) => sum + (batch.remainingQuantity * batch.purchasePrice), 0);
      const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      // Filter out if inStockOnly and no stock
      if (inStockOnly && totalQuantity === 0) {
        return null;
      }

      return {
        ...product.toJSON(),
        quantity: totalQuantity,
        inventoryValue: totalValue,
        averageCostPrice: averageCost,
        stockBatches: batches
      };
    }).filter(Boolean);

    return NextResponse.json(productsWithStock);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST new product
// export async function POST(request: NextRequest) {
export const POST = withAuth(async (request, { user }) => {

  const { username } = user;
  // 1. Initialize the transaction
  let t;

  try {
    await connectDatabase();
    t = await sequelize.transaction();
    const {
      name,
      price,
      quantity,
      purchasePrice,
      color,
      storage,
      ram,
      category,
      specifications
    } = await request.json();

    // Validation (Rollback if fails)
    if (!name || !price || !quantity || !category) {
      await t.rollback();
      return NextResponse.json(
        { error: 'Name, price, quantity, and category are required' },
        { status: 400 }
      );
    }

    // 2. Create the Product within the transaction
    const product = await Product.create({
      name,
      price: parseFloat(price),
      // quantity: parseInt(quantity),

      color: color || null,
      storage: storage || null,
      ram: ram || null,
      category: parseInt(category)
    }, { transaction: t });

    // 3. Create Specifications within the same transaction
    if (specifications) {
      await Specification.create({
        ...specifications,
        product_id: product.id,
      }, { transaction: t });
    }

    // Add stock to FIFO system
    if (quantity > 0) {
      const actualPurchasePrice = purchasePrice || parseFloat(price); // Default to selling price if no purchase price
      await FIFOService.addStock(
        product.id,
        parseInt(quantity),
        actualPurchasePrice,
        username,
        t
      );
    }

    await ActivityLog.create({
      type: 'stock_in',
      description: `${quantity} units of ${product.name} added`,
      operator: username,
      createdAt: new Date()
    }, { transaction: t });


    await t.commit();

    // Return product with stock information
    const productWithStock = await FIFOService.getStockStatus(product.id);
    // 4. Everything worked? Commit the changes!
    return NextResponse.json(productWithStock, { status: 201 });

  } catch (error) {
    // 5. If any step failed, undo everything
    if (t && !t.afterCommit) {
      await t.rollback();
    }
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
});
