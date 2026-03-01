import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

interface CategoryAttributes {
    id: number;
    name: string;
    parent_id?: number | null;
    is_active: boolean;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'parent_id'> { }

@Table
export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @ForeignKey(() => Category)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare parent_id?: number | null;

    @BelongsTo(() => Category, 'parent_id')
    declare parent: Category;

    @HasMany(() => Category, 'parent_id')
    declare children: Category[];

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    declare is_active: boolean;
}
