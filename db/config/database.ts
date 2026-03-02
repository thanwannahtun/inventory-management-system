import { Sequelize } from 'sequelize-typescript';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Specification } from '../models/Specification';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { StockOut } from '../models/StockOut';
import { ActivityLog } from '../models/ActivityLog';

// 1. Ensure the Sequelize instance is a singleton
const globalForDb = global as unknown as {
    sequelize: Sequelize;
    connectionPromise: Promise<void> | null;
};


/// local
export const sequelize = globalForDb.sequelize || new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'admin_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DATABASE || 'inventory_managment_system',
    dialect: "mysql",
    port: 3306,
    models: [
        Category,
        Product,
        Specification,
        Role,
        User,
        StockOut,
        ActivityLog
    ]
});

if (process.env.NODE_ENV !== 'production') globalForDb.sequelize = sequelize;

// sequelize.addModels([
//     Category,
//     Product,
//     Specification,
//     Role,
//     User,
//     StockOut
// ])
export async function connectDatabase() {
    // 2. Use the global object to persist the promise during dev hot-reloads
    if (globalForDb.connectionPromise) return globalForDb.connectionPromise;

    globalForDb.connectionPromise = (async () => {
        try {
            await sequelize.authenticate();

            // 3. Strict Sync: Only run in local development
            if (process.env.NODE_ENV === 'development') {
                await sequelize.sync({ alter: true });
            }

            console.log('✨ DB Connected');
        } catch (err) {
            globalForDb.connectionPromise = null;
            console.error('❌ DB Error:', err);
            throw err;
        }
    })();

    return globalForDb.connectionPromise;
}