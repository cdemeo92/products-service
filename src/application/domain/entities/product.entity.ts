import { Products } from "src/infrastructure/repositories/models";

export class Product {

  public readonly id?: string;
  public readonly productToken: string;
  public readonly name: string;
  public readonly price: number;
  public readonly stock: number;

  constructor(product: { id?: string, productToken: string, name: string, price: number, stock: number }) {
    this.id = product.id;
    this.productToken = product.productToken;
    this.name = product.name;
    this.price = product.price;
    this.stock = product.stock;
  }
}
