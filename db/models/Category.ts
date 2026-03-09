import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Product } from './Product';
import type { NonAttribute } from 'sequelize/lib/model';

interface CategoryAttributes {
    id: number;
    name: string;
    parent_id?: number | null;
    is_active: boolean;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'parent_id'> { }

@Table({
    tableName: 'categories',
    modelName: 'Category'
})
export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @ForeignKey(() => Category)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare parent_id?: number | null;

    @BelongsTo(() => Category, { foreignKey: 'parent_id', as: 'parent' })
    declare parent: NonAttribute<Category>;

    @HasMany(() => Category, { foreignKey: 'parent_id', as: 'children' })
    declare children: NonAttribute<Category>[];

    @HasMany(() => Product, { foreignKey: 'categoryId' })
    declare products: NonAttribute<Product>[];

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    declare is_active: boolean;
}
