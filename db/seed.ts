import { sequelize } from './config/database';
import { Category } from './models/Category';
import { Product } from './models/Product';
import { Role } from './models/Role';
import { User } from './models/User';
import { StockOut } from './models/StockOut';
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

    // Seed Products
    await Product.bulkCreate([
      {
        name: 'iPhone 15 Pro Max',
        price: 1199.99,
        quantity: 50,
        color: 'Natural Titanium',
        storage: '256GB',
        ram: '8GB',
        category: 1
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299.99,
        quantity: 35,
        color: 'Phantom Black',
        storage: '512GB',
        ram: '12GB',
        category: 1
      },
      {
        name: 'MacBook Pro 16"',
        price: 2499.99,
        quantity: 20,
        color: 'Space Gray',
        storage: '1TB SSD',
        ram: '32GB',
        category: 2
      },
      {
        name: 'Dell XPS 15',
        price: 1899.99,
        quantity: 25,
        color: 'Silver',
        storage: '512GB SSD',
        ram: '16GB',
        category: 2
      },
      {
        name: 'iPad Pro 12.9"',
        price: 1099.99,
        quantity: 40,
        color: 'Space Gray',
        storage: '256GB',
        ram: '8GB',
        category: 3
      },
      {
        name: 'Samsung Galaxy Tab S9',
        price: 899.99,
        quantity: 30,
        color: 'Graphite',
        storage: '128GB',
        ram: '8GB',
        category: 3
      }
    ]);

    console.log('✅ Products seeded');

    // Seed Stock Out Records
    await StockOut.bulkCreate([
      {
        productId: 1,
        productName: 'iPhone 15 Pro Max',
        quantity: 5,
        reason: 'Sale',
        date: '2024-01-15',
        operator: 'admin',
        category: 'SmartPhone Category',
        unitPrice: 1199.99,
        totalValue: 5999.95,
        notes: 'Customer purchase - Order #12345'
      },
      {
        productId: 2,
        productName: 'Samsung Galaxy S24 Ultra',
        quantity: 3,
        reason: 'Return',
        date: '2024-01-14',
        operator: 'manager',
        category: 'SmartPhone Category',
        unitPrice: 1299.99,
        totalValue: 3899.97
      },
      {
        productId: 3,
        productName: 'MacBook Pro 16"',
        quantity: 2,
        reason: 'Damage',
        date: '2024-01-13',
        operator: 'user',
        category: 'Laptop Category',
        unitPrice: 2499.99,
        totalValue: 4999.98,
        notes: 'Damaged during shipping'
      }
    ]);

    console.log('✅ Stock out records seeded');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
