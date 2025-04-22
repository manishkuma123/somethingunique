import mongoose, { Document, Schema, Types } from 'mongoose';
import type ProductModel from './product'


export interface ICartItem {
  product: Types.ObjectId; 
  quantity: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const CartSchema = new Schema<ICart>({
  userId: {
    type: String,
    required: true
  },
  items: [CartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CartModel = mongoose.model<ICart>('Cart', CartSchema);

export default CartModel;
