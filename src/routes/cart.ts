import express, { Request, Response } from 'express';
import CartModel from '../models/Cart';
import ProductModel from '../models/product';
import { Types } from 'mongoose';

const router = express.Router();


router.post('/add', async (req: any, res: any) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const product = await ProductModel.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  let cart = await CartModel.findOne({ userId });

  if (!cart) {
    cart = new CartModel({ userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(item =>
    item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), quantity });
  }

  await cart.save();
  res.status(200).json({ message: 'Product added to cart', cart });
});

router.get('/:userId', async (req: any, res: any) => {
  const { userId } = req.params;

  const cart = await CartModel.findOne({ userId }).populate('items.product');

  if (!cart) return res.json({ items: [] });

  res.json(cart);
});

// Update item quantity
router.post('/update', async (req: any, res: any) => {
  const { userId, productId, quantity } = req.body;

  const cart = await CartModel.findOne({ userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  const item = cart.items.find(item => item.product.toString() === productId);

  if (!item) return res.status(404).json({ error: 'Product not in cart' });

  item.quantity = quantity;
  await cart.save();

  res.json({ message: 'Quantity updated', cart });
});

// Remove item from cart
router.post('/remove', async (req:any, res: any) => {
  const { userId, productId } = req.body;

  const cart = await CartModel.findOne({ userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();

  res.json({ message: 'Product removed from cart', cart });
});

export default router;
