import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface productsAttributes {
    id?: string;
    productToken?: string;
    name: string;
    price: string;
    stock: number;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({
	tableName: "products",
	timestamps: true 
})
export class products extends Model<productsAttributes, productsAttributes> implements productsAttributes {

    @Column({
    	primaryKey: true,
    	type: DataType.CHAR(36),
    	defaultValue: DataType.UUIDV4 
    })
    @Index({
    	name: "PRIMARY",
    	using: "BTREE",
    	order: "ASC",
    	unique: true 
    })
    	id?: string;

    @Column({
    	type: DataType.CHAR(36),
    	defaultValue: DataType.UUIDV4 
    })
    @Index({
    	name: "productToken",
    	using: "BTREE",
    	order: "ASC",
    	unique: true 
    })
    	productToken?: string;

    @Column({
    	type: DataType.STRING(255) 
    })
    	name!: string;

    @Column({
    	type: DataType.DECIMAL(10,2) 
    })
    	price!: string;

    @Column({
    	type: DataType.INTEGER 
    })
    	stock!: number;

    @Column({
    	type: DataType.DATE,
    	defaultValue: DataType.NOW 
    })
    	createdAt?: Date;

    @Column({
    	type: DataType.DATE,
    	defaultValue: DataType.NOW 
    })
    	updatedAt?: Date;

}