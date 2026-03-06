import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './Product';
import { StockBatch } from './StockBatch';

interface StockOutAttributes {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    reason: string;
    date: string;
    operator: string;
    category: string;
    unitPrice: number; // Selling price
    costPrice: number; // Purchase price from batch
    totalValue: number; // Selling value
    totalCost: number; // Cost value
    profit: number; // Total profit
    notes?: string | null;
    batchId?: number | null; // Track which batch this came from
}

interface StockOutCreationAttributes extends Optional<StockOutAttributes, 'id' | 'notes' | 'batchId'> { }

@Table({
    tableName: 'stockouts',
    modelName: 'StockOut'
})
export class StockOut extends Model<StockOutAttributes, StockOutCreationAttributes> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare productId: number;

    @BelongsTo(() => Product, 'productId')
    declare productRelation: Product;

    @ForeignKey(() => StockBatch)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare batchId?: number | null;

    @BelongsTo(() => StockBatch, 'batchId')
    declare batchRelation?: StockBatch;

    @Column({ type: DataType.STRING, allowNull: false })
    declare productName: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    declare quantity: number;

    @Column({ type: DataType.ENUM('Sale', 'Return', 'Damage', 'Transfer', 'Loss'), allowNull: false })
    declare reason: string;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    declare date: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare operator: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare category: string;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare unitPrice: number; // Selling price

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare costPrice: number; // Purchase price from batch

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare totalValue: number; // Selling value (quantity * unitPrice)

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare totalCost: number; // Cost value (quantity * costPrice)

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare profit: number; // Total profit (totalValue - totalCost)

    @Column({ type: DataType.TEXT, allowNull: true })
    declare notes?: string | null;
}
