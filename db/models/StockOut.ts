import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './Product';

interface StockOutAttributes {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    reason: string;
    date: string;
    operator: string;
    category: string;
    unitPrice: number;
    totalValue: number;
    notes?: string | null;
}

interface StockOutCreationAttributes extends Optional<StockOutAttributes, 'id' | 'notes'> { }

@Table
export class StockOut extends Model<StockOutAttributes, StockOutCreationAttributes> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare productId: number;

    @BelongsTo(() => Product, 'productId')
    declare productRelation: Product;

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
    declare unitPrice: number;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare totalValue: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare notes?: string | null;
}
