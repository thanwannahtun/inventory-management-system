import 'reflect-metadata';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './Product';
import type { NonAttribute } from 'sequelize';

interface StockBatchAttributes {
    id: number;
    productId: number;
    initialQuantity: number;
    remainingQuantity: number;
    purchasePrice: number;
    receivedDate: Date;
}

interface StockBatchCreationAttributes extends Omit<StockBatchAttributes, 'id'> { }

@Table({
    tableName: 'stock_batches',
    timestamps: true,
    modelName: 'StockBatch'
})
export class StockBatch extends Model<StockBatchAttributes, StockBatchCreationAttributes> {
    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare productId: number;

    @BelongsTo(() => Product, 'productId')
    declare product: NonAttribute<Product>;

    @Column({ type: DataType.INTEGER, allowNull: false })
    declare initialQuantity: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    declare remainingQuantity: number;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare purchasePrice: number;

    @Column({ type: DataType.DATEONLY, allowNull: false })
    declare receivedDate: Date;
}
