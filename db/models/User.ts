import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import type { NonAttribute } from 'sequelize/lib/model';

import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Role } from './Role';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: number;
    isActive: boolean;
    lastLogin?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'lastLogin' | 'createdAt' | 'updatedAt'> { }

@Table
export class User extends Model<UserAttributes, UserCreationAttributes> {
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare username: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare firstName: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare lastName: string;

    @ForeignKey(() => Role)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare roleId: number;

    @BelongsTo(() => Role, 'roleId')
    declare role: NonAttribute<Role>;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
    declare isActive: boolean;

    @Column({ type: DataType.DATE, allowNull: true })
    declare lastLogin?: Date | null;

    @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
    declare createdAt: Date;

    @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
    declare updatedAt: Date;
}
