import { Model, Table, Column, DataType, Index } from 'sequelize-typescript';

export interface ProductsAttributes {
  id?: string;
  productToken: string;
  name: string;
  price: number;
  stock: number;
}

@Table({
  tableName: 'products',
  timestamps: false,
})
export class Products
  extends Model<ProductsAttributes, ProductsAttributes>
  implements ProductsAttributes
{
  @Column({
    primaryKey: true,
    type: DataType.CHAR(36),
    defaultValue: DataType.UUIDV4,
  })
  @Index({
    name: 'PRIMARY',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  id?: string;

  @Column({
    type: DataType.CHAR(36),
  })
  @Index({
    name: 'productToken',
    using: 'BTREE',
    order: 'ASC',
    unique: true,
  })
  productToken!: string;

  @Column({
    type: DataType.STRING(255),
  })
  name!: string;

  @Column({
    type: DataType.DOUBLE(22),
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
  })
  stock!: number;
}
