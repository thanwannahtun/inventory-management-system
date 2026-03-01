import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Category } from '@/db/models/Category';
import { Specification } from '@/db/models/Specification';
import { Op } from 'sequelize';

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

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      price,
      quantity,
      color,
      storage,
      ram,
      category,
      specifications
    } = await request.json();

    if (!name || !price || !quantity || !category) {
      return NextResponse.json(
        { error: 'Name, price, quantity, and category are required' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      color: color || null,
      storage: storage || null,
      ram: ram || null,
      category: parseInt(category)
    });

    // If specifications provided, create them
    if (specifications) {
      await Specification.create({
        ...specifications,
        // You might want to link this to the product if needed
        product_id: product.id,

      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
