import { Schema, model } from 'mongoose';
import { Product } from '../../../../entities/Product';

const productSchema = new Schema<Product>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }
}, {
  timestamps: true
});

export const ProductModel = model('Product', productSchema)
