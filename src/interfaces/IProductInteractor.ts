export interface IProductInteractor {
  createProduct(input: any);
  updateStock(id: string, stock: number);
  getProducts(limit: number, offset: number);
}
