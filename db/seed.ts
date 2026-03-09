import 'dotenv/config';
import { sequelize } from './config/database';
import { Category } from './models/Category';
import { Product } from './models/Product';
import { Role } from './models/Role';
import { User } from './models/User';
import { StockOut } from './models/StockOut';
import { StockBatch } from './models/StockBatch';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    // 1. Clear and Sync Database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');

    // 2. Seed Roles
    const [adminRole, managerRole, userRole] = await Role.bulkCreate([
      {
        name: 'Administrator',
        description: 'System administrator with full access',
        permissions: JSON.stringify(['all']),
        isActive: true
      },
      {
        name: 'Manager',
        description: 'Store manager with limited admin access',
        permissions: JSON.stringify(['read', 'write', 'delete', 'stock_out']),
        isActive: true
      },
      {
        name: 'User',
        description: 'Regular user with basic access',
        permissions: JSON.stringify(['read', 'write']),
        isActive: true
      }
    ]);
    console.log('✅ Roles seeded');

    // 3. Seed Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('user123', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id, // Using dynamic ID
        isActive: true
      },
      {
        username: 'manager',
        email: 'manager@example.com',
        password: staffPassword,
        firstName: 'Store',
        lastName: 'Manager',
        roleId: managerRole.id,
        isActive: true
      }
    ]);
    console.log('✅ Users seeded');

    // 4. Seed Categories (Handling Parent/Child Relationships)
    const phoneCat = await Category.create({ name: 'SmartPhone Category', is_active: true });
    const laptopCat = await Category.create({ name: 'Laptop Category', is_active: true });
    const tabletCat = await Category.create({ name: 'Tablet Category', is_active: true });

    // Sub-categories
    await Category.bulkCreate([
      { name: 'iPhone', parent_id: phoneCat.id, is_active: true },
      { name: 'Samsung', parent_id: phoneCat.id, is_active: true },
      { name: 'Gaming Laptops', parent_id: laptopCat.id, is_active: true }
    ]);
    console.log('✅ Categories seeded');

    // 5. Seed Products
    // NOTE: Ensure your Product model uses 'categoryId' as the foreign key field
    const products = await Product.bulkCreate([
      {
        name: 'iPhone 15 Pro Max',
        price: 1199.99,
        color: 'Natural Titanium',
        storage: '256GB',
        ram: '8GB',
        categoryId: phoneCat.id
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299.99,
        color: 'Phantom Black',
        storage: '512GB',
        ram: '12GB',
        categoryId: phoneCat.id
      },
      {
        name: 'MacBook Pro 16"',
        price: 2499.99,
        color: 'Space Gray',
        storage: '1TB SSD',
        ram: '32GB',
        categoryId: laptopCat.id
      }
    ]);
    console.log('✅ Products seeded');

    // 6. Seed Stock Batches (FIFO Setup)
    const batches = await StockBatch.bulkCreate([
      {
        productId: products[0].id, // iPhone Batch 1
        initialQuantity: 30,
        remainingQuantity: 10,
        purchasePrice: 999.99,
        receivedDate: new Date('2025-01-15')
      },
      {
        productId: products[0].id, // iPhone Batch 2 (Newer)
        initialQuantity: 25,
        remainingQuantity: 25,
        purchasePrice: 1099.99,
        receivedDate: new Date('2026-02-20')
      },
      {
        productId: products[2].id, // MacBook Batch
        initialQuantity: 20,
        remainingQuantity: 15,
        purchasePrice: 2299.99,
        receivedDate: new Date('2025-02-01')
      }
    ]);
    console.log('✅ Stock batches seeded');

    // 7. Seed Stock Out Records
    await StockOut.bulkCreate([
      {
        productId: products[0].id,
        productName: products[0].name,
        quantity: 20,
        reason: 'Sale',
        date: new Date().toISOString().split('T')[0],
        operator: 'admin',
        category: 'SmartPhone Category',
        unitPrice: 1199.99,
        costPrice: 999.99,
        totalValue: 20 * 1199.99,
        totalCost: 20 * 999.99,
        profit: 20 * (1199.99 - 999.99),
        notes: 'Initial sale from Batch 1',
        batchId: batches[0].id
      }
    ]);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}