import 'dotenv/config'; // 👈 MUST be the first line
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
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');

    // Seed Roles
    const roles = await Role.bulkCreate([
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

    // Seed Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userHashedPassword = await bcrypt.hash('user123', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: 1, // Administrator
        isActive: true
      },
      {
        username: 'manager',
        email: 'manager@example.com',
        password: userHashedPassword,
        firstName: 'Store',
        lastName: 'Manager',
        roleId: 2, // Manager
        isActive: true
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: userHashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        roleId: 3, // User
        isActive: true
      }
    ]);

    console.log('✅ Users seeded');

    // Seed Categories
    const categories = await Category.bulkCreate([
      {
        name: 'SmartPhone Category',
        parent_id: null,
        is_active: true
      },
      {
        name: 'Laptop Category',
        parent_id: null,
        is_active: true
      },
      {
        name: 'Tablet Category',
        parent_id: null,
        is_active: true
      },
      {
        name: 'iPhone',
        parent_id: 1,
        is_active: true
      },
      {
        name: 'Samsung',
        parent_id: 1,
        is_active: true
      },
      {
        name: 'Gaming Laptops',
        parent_id: 2,
        is_active: true
      },
      {
        name: 'Business Laptops',
        parent_id: 2,
        is_active: true
      }
    ]);

    console.log('✅ Categories seeded');

    // Seed Products (without quantity field)
    const products = await Product.bulkCreate([
      {
        name: 'iPhone 15 Pro Max',
        price: 1199.99, // Selling price
        color: 'Natural Titanium',
        storage: '256GB',
        ram: '8GB',
        category: 1
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299.99, // Selling price
        color: 'Phantom Black',
        storage: '512GB',
        ram: '12GB',
        category: 1
      },
      {
        name: 'MacBook Pro 16"',
        price: 2499.99, // Selling price
        color: 'Space Gray',
        storage: '1TB SSD',
        ram: '32GB',
        category: 2
      },
      {
        name: 'Dell XPS 15',
        price: 1899.99, // Selling price
        color: 'Silver',
        storage: '512GB SSD',
        ram: '16GB',
        category: 2
      },
      {
        name: 'iPad Pro 12.9"',
        price: 1099.99, // Selling price
        color: 'Space Gray',
        storage: '256GB',
        ram: '8GB',
        category: 3
      },
      {
        name: 'Samsung Galaxy Tab S9',
        price: 899.99, // Selling price
        color: 'Graphite',
        storage: '128GB',
        ram: '8GB',
        category: 3
      }
    ]);

    console.log('✅ Products seeded');

    // Seed Stock Batches for FIFO demonstration
    const stockBatches = await StockBatch.bulkCreate([
      // iPhone 15 Pro Max - Multiple batches with different purchase prices
      {
        productId: 1,
        initialQuantity: 30,
        remainingQuantity: 10, // 20 already sold
        purchasePrice: 999.99, // Original purchase price
        receivedDate: new Date('2025-01-15')
      },
      {
        productId: 1,
        initialQuantity: 25,
        remainingQuantity: 25, // All available
        purchasePrice: 1099.99, // Higher purchase price
        receivedDate: new Date('2025-11-20')
      },
      
      // Samsung Galaxy S24 Ultra
      {
        productId: 2,
        initialQuantity: 35,
        remainingQuantity: 35,
        purchasePrice: 1199.99,
        receivedDate: new Date('2025-01-10')
      },
      
      // MacBook Pro 16"
      {
        productId: 3,
        initialQuantity: 20,
        remainingQuantity: 15, // 5 already sold
        purchasePrice: 2299.99,
        receivedDate: new Date('2025-02-01')
      },
      
      // Dell XPS 15
      {
        productId: 4,
        initialQuantity: 25,
        remainingQuantity: 25,
        purchasePrice: 1699.99,
        receivedDate: new Date('2025-02-15')
      },
      
      // iPad Pro 12.9"
      {
        productId: 5,
        initialQuantity: 40,
        remainingQuantity: 40,
        purchasePrice: 999.99,
        receivedDate: new Date('2025-01-20')
      },
      
      // Samsung Galaxy Tab S9
      {
        productId: 6,
        initialQuantity: 30,
        remainingQuantity: 30,
        purchasePrice: 799.99,
        receivedDate: new Date('2025-01-25')
      }
    ]);

    console.log('✅ Stock batches seeded (FIFO demonstration)');

    // Seed Stock Out Records with FIFO tracking
    await StockOut.bulkCreate([
      {
        productId: 1,
        productName: 'iPhone 15 Pro Max',
        quantity: 20,
        reason: 'Sale',
        date: '2025-03-01',
        operator: 'admin',
        category: 'SmartPhone Category',
        unitPrice: 1199.99, // Selling price
        costPrice: 999.99, // Cost price from first batch
        totalValue: 20 * 1199.99,
        totalCost: 20 * 999.99,
        profit: 20 * (1199.99 - 999.99),
        notes: 'Sold 20 units from first batch (FIFO)',
        batchId: 1
      },
      {
        productId: 3,
        productName: 'MacBook Pro 16"',
        quantity: 5,
        reason: 'Sale',
        date: '2025-03-05',
        operator: 'manager',
        category: 'Laptop Category',
        unitPrice: 2499.99,
        costPrice: 2299.99,
        totalValue: 5 * 2499.99,
        totalCost: 5 * 2299.99,
        profit: 5 * (2499.99 - 2299.99),
        notes: 'Sold 5 units from batch',
        batchId: 3
      }
    ]);

    console.log('✅ Stock out records seeded with FIFO tracking');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 FIFO System Demo:');
    console.log('   - iPhone 15 Pro Max: 10 units @ $999.99 + 25 units @ $1099.99');
    console.log('   - Next sale will use FIFO: 10 units from cheaper batch first');
    console.log('   - Profit tracking is now accurate with cost basis');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
