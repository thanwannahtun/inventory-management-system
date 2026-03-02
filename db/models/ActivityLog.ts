import 'reflect-metadata';
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface ActivityAttributes {
    id: number;
    type: 'stock_in' | 'stock_out' | 'new_product' | 'category_added' | 'login' | 'category_updated' | 'category_deleted';
    description: string;
    operator: string;
}

interface ActivityLogCreationAttributes extends Optional<ActivityAttributes, 'id'> { }


@Table({
    tableName: 'activitylogs',
    timestamps: true, // This gives us 'createdAt' which we'll use as the timestamp
    updatedAt: false,
    modelName: 'ActivityLog'
})
export class ActivityLog extends Model<ActivityAttributes, ActivityLogCreationAttributes> {
    @Column({
        type: DataType.TEXT,
        allowNull: false
    })
    declare type: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare description: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare operator: string;
}