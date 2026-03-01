import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/db/models/Product';
import { Category } from '@/db/models/Category';
import { Specification } from '@/db/models/Specification';
import { sequelize } from '@/db/config/database';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const {id } = await params;
    const product = await sequelize.models.Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categoryRelation',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get specifications if needed
    const specifications = await Specification.findOne({
      // You might need to add a foreign key to link specifications to products
      // For now, this is a placeholder
    });

    return NextResponse.json({
      ...product.toJSON(),
      specifications
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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const {id} = await params;
    const body = await request.json();
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await product.update({
      name: body.name || product.name,
      price: body.price !== undefined ? body.price : product.price,
      quantity: body.quantity !== undefined ? body.quantity : product.quantity,
      image: body.image !== undefined ? body.image : product.image,
      color: body.color !== undefined ? body.color : product.color,
      storage: body.storage !== undefined ? body.storage : product.storage,
      ram: body.ram !== undefined ? body.ram : product.ram,
      category: body.category !== undefined ? body.category : product.category
    });

    // Update specifications if provided
    if (body.specifications) {
      // Update logic for specifications
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
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
