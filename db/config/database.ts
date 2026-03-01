import { Sequelize } from 'sequelize-typescript';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import dotenv from 'dotenv';
import { Specification } from '../models/Specification';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { StockOut } from '../models/StockOut';

dotenv.config();

/// local
export const sequelize = new Sequelize({
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
        StockOut
    ]
});

// sequelize.addModels([
//     Category,
//     Product,
//     Specification,
//     Role,
//     User,
//     StockOut
// ])

export async function connectDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({alter:true});

        console.log('✨ Database connected');
    } catch (err) {
        console.error('❌ DB Error:', err);
    }
}


