"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_1 = __importDefault(require("../models/Cart"));
const product_1 = __importDefault(require("../models/product"));
const mongoose_1 = require("mongoose");
const router = express_1.default.Router();
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const product = yield product_1.default.findById(productId);
    if (!product)
        return res.status(404).json({ error: 'Product not found' });
    let cart = yield Cart_1.default.findOne({ userId });
    if (!cart) {
        cart = new Cart_1.default({ userId, items: [] });
    }
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
    }
    else {
        cart.items.push({ product: new mongoose_1.Types.ObjectId(productId), quantity });
    }
    yield cart.save();
    res.status(200).json({ message: 'Product added to cart', cart });
}));
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const cart = yield Cart_1.default.findOne({ userId }).populate('items.product');
    if (!cart)
        return res.json({ items: [] });
    res.json(cart);
}));
// Update item quantity
router.post('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, quantity } = req.body;
    const cart = yield Cart_1.default.findOne({ userId });
    if (!cart)
        return res.status(404).json({ error: 'Cart not found' });
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item)
        return res.status(404).json({ error: 'Product not in cart' });
    item.quantity = quantity;
    yield cart.save();
    res.json({ message: 'Quantity updated', cart });
}));
// Remove item from cart
router.post('/remove', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId } = req.body;
    const cart = yield Cart_1.default.findOne({ userId });
    if (!cart)
        return res.status(404).json({ error: 'Cart not found' });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    yield cart.save();
    res.json({ message: 'Product removed from cart', cart });
}));
exports.default = router;
