import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { NonAttribute, Optional } from 'sequelize';
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { User } from './User';

interface RoleAttributes {
    id: number;
    name: string;
    description?: string | null;
    permissions: string; // JSON string of permissions
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> { }

@Table({
    tableName: 'roles',
    modelName: 'Role'
})
export class Role extends Model<RoleAttributes, RoleCreationAttributes> {
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare description?: string | null;

    @Column({ type: DataType.TEXT, allowNull: false })
    declare permissions: string; // JSON string of permissions

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    declare isActive: boolean;

    @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
    declare createdAt: Date;

    @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
    declare updatedAt: Date;

    @HasMany(() => User, 'roleId')
    declare users: NonAttribute<User>[];
}
