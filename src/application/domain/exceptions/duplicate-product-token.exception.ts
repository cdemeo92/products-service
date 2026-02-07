export class DuplicateProductTokenException extends Error {
  constructor(productToken: string) {
    super(`Product token already exists: ${productToken}`);
    this.name = 'DuplicateProductTokenException';
  }
}
