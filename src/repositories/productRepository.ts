import { IProductRepository } from "../interfaces/IProductRepository";
import { Product } from "../entities/Product";
import { ProductModel } from "../infrastructure/database/mongo/models/Product.model";
import { connectDB } from "../infrastructure/database/mongo/connection/connection";

export class ProductRepository implements IProductRepository {
  constructor() {
    connectDB()
      .then(() => console.log("Connected to DB"))
      .catch((err) => console.log(err));
  }

  async create({ name, description, price, stock }: Product): Promise<Product> {
    const product = await ProductModel.create({
      name,
      description,
      price,
      stock,
    });

    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    };
  }
  async update(id: string, stock: number): Promise<Product> {
    const product = await ProductModel.findByIdAndUpdate(id, { stock }, { new: true });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    };
  }
  async find(limit: number, offset: number): Promise<Product[]> {
    const products = await ProductModel.find().skip(offset).limit(limit);
    return products;
  }
}
