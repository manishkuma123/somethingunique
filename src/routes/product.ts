import { Request, Response } from 'express';
import cloudinary from '../cloudnairy';
import ProductModel from '../models/product';
import express from 'express';
import { getproduct, getproductbyid, uploadProductImage } from '../controllers/product';

const router = express.Router();

router.post('/upload', uploadProductImage);
router.get('/all', getproduct);
router.get('/all/:id', getproductbyid);

router.get('/', (req, res) => {
  res.send("Hey Manish Kumar");
});

export default router;
