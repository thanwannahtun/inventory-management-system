import 'reflect-metadata';
import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface ActivityAttributes {
    id: number;
    type: 'stock_in' | 'stock_out' | 'new_product' | 'category_added';
    description: string;
    operator: string;
}

@Table({
    tableName: 'activitylogs',
    timestamps: true, // This gives us 'createdAt' which we'll use as the timestamp
    updatedAt: false,
    modelName: 'ActivityLog'
})
export class ActivityLog extends Model<ActivityAttributes> {
    @Column({
        type: DataType.ENUM('stock_in', 'stock_out', 'new_product', 'category_added'),
        allowNull: false
    })
    declare type: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare description: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare operator: string;
}