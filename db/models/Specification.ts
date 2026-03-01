import 'reflect-metadata'; // 👈 required for decorator metadata for sequelize
import { Optional } from 'sequelize';
import { Table, Column, Model, DataType } from 'sequelize-typescript';

interface SpecificationAttributes {
    id: number;
    model?: string | null;
    display?: string | null;
    resolution?: string | null;
    os?: string | null;
    chipset?: string | null;
    main_camera?: string | null;
    selfie_camera?: string | null;
    battery?: string | null;
    charging?: string | null;
    charging_port?: string | null;
    weight?: string | null;
    dimensions?: string | null;
}

interface SpecificationCreationAttributes extends Optional<SpecificationAttributes, 'id'> { }

@Table
export class Specification extends Model<SpecificationAttributes, SpecificationCreationAttributes> {
    @Column({ type: DataType.STRING, allowNull: true })
    declare model?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare display?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare resolution?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare os?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare chipset?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare main_camera?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare selfie_camera?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare battery?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare charging?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare charging_port?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare weight?: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare dimensions?: string | null;
}
