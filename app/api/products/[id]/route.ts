// products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Category } from '@/db/models/Category';
import { Specification } from '@/db/models/Specification';
import { sequelize } from '@/db/config/database';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await sequelize.models.Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        },
        {
          model: Specification,
        },
      ]
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }



    return NextResponse.json({
      ...product.toJSON(),
      // specifications
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product
// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction(); // Start transaction
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 1. Update Product fields
    await product.update({
      name: body.name ?? product.name,
      price: body.price ?? product.price,
      quantity: body.quantity ?? product.quantity,
      image: body.image ?? product.image,
      color: body.color ?? product.color,
      storage: body.storage ?? product.storage,
      ram: body.ram ?? product.ram,
      category: body.category ?? product.category
    }, { transaction });

    // 2. Update or Create Specifications
    if (body.specifications) {
      const [spec, created] = await Specification.findOrCreate({
        where: { product_id: id },
        defaults: { ...body.specifications, product_id: id },
        transaction
      });

      if (!created) {
        // If it already existed, update the existing record
        await spec.update(body.specifications, { transaction });
      }
    }

    await transaction.commit(); // Save all changes

    // Re-fetch with associations to return the full updated object
    const updatedProduct = await Product.findByPk(id, {
      include: [Specification, { model: Category, as: 'categoryRelation' }]
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    await transaction.rollback(); // Undo everything if any part fails
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await Product.findByPk(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await product.destroy();

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
