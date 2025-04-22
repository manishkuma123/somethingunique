import mongoose, { Document, Schema } from 'mongoose';

interface Product extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string; 
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'home', 'books', 'sports',"beauty","fashion"],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProductModel = mongoose.model<Product>('Product', ProductSchema);

export default ProductModel;
