import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import { Category } from './Category';
import { Specification } from './Specification';
import { StockBatch } from './StockBatch';
import type { NonAttribute } from 'sequelize/lib/model';
import { Optional } from 'sequelize';

interface ProductAttributes {
    id: number;
    name: string;
    price: number; // Selling price
    image?: string | null;
    color?: string | null;
    storage?: string | null;
    ram?: string | null;
    categoryId: number;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'image' | 'color' | 'storage' | 'ram'> { }

@Table({
    tableName: 'products',
    modelName: 'Product'
})
export class Product extends Model<ProductAttributes, ProductCreationAttributes> {
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    declare price: number; // Selling price

    @Column({ type: DataType.STRING, allowNull: true })
    declare image?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare color?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare storage?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare ram?: string | null;

    @ForeignKey(() => Category)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare categoryId: number;

    @BelongsTo(() => Category, { foreignKey: 'categoryId', as: 'category' })
    declare category: NonAttribute<Category>;

    @HasOne(() => Specification)
    declare specification: Specification;

    @HasMany(() => StockBatch, 'productId')
    declare stockBatches: NonAttribute<StockBatch>[];

    // Virtual field for total quantity (calculated from batches)
    get quantity(): number {
        if (this.stockBatches) {
            return this.stockBatches.reduce((total, batch) => total + batch.remainingQuantity, 0);
        }
        return 0;
    }

    // FIFO/LIFO Inventory Valuation
    get inventoryValue(): number {
        if (this.stockBatches) {
            return this.stockBatches.reduce((total, batch) =>
                total + ((batch.remainingQuantity || 0) * (batch.purchasePrice || 0)), 0);
        }
        return 0;
    }

    // Virtual field for average cost price
    get averageCostPrice(): number {
        if (this.stockBatches && this.stockBatches.length > 0) {
            const totalQuantity = this.stockBatches.reduce((total, batch) => total + batch.remainingQuantity, 0);
            if (totalQuantity > 0) {
                const totalCost = this.stockBatches.reduce((total, batch) =>
                    total + (batch.remainingQuantity * batch.purchasePrice), 0);
                return totalCost / totalQuantity;
            }
        }
        return 0;
    }
}
