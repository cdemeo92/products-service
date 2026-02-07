export class ProductNotFoundException extends Error {
  constructor(id: number) {
    super(`Product not found: ${id}`);
    this.name = 'ProductNotFoundException';
  }
}
