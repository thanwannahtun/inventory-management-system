import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne } from 'sequelize-typescript';
import { Category } from './Category';
import { Specification } from './Specification';

interface ProductAttributes {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
    color?: string | null;
    storage?: string | null;
    ram?: string | null;
    category: number;
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
    declare price: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    declare quantity: number;

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
    declare category: number;

    @BelongsTo(() => Category, 'category')
    declare categoryRelation: Category;

    @HasOne(() => Specification)
    declare specification: Specification;
}
