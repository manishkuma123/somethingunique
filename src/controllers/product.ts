import multer from 'multer';
import path from 'path';
import cloudinary from '../cloudnairy';
import ProductModel from '../models/product';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), 
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), 
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('imageUrl');

// export const uploadProductImage = async (req: any, res: any) => {

//   upload(req, res, async (err) => {
//     if (err) {
      
//       console.error('Multer Error:', err);
//       return res.status(400).json({ message: 'Error uploading file', error: err.message });
//     }

//     if (!req.file) {
     
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     try {
     
//       const result = await cloudinary.uploader.upload(req.file?.path!, {
//         folder: 'products',
//         public_id: `${Date.now()}-product`,
//       });

     
//       const product = new ProductModel({
//         name: req.body.name,
//         description: req.body.description,
//         price: req.body.price,
//         stock: req.body.stock,
//         category: req.body.category,
//         imageUrl: result.secure_url, 
//       });

//       await product.save();

//       res.status(201).json({
//         message: 'Product created successfully',
//         product,
//       });
//     } catch (err) {
//       console.error('Error uploading image to Cloudinary:', err);
//       res.status(500).json({ message: 'Error saving product' });
//     }
//   });
// };
export const uploadProductImage = async (req: any, res: any) => {

  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }

    let finalImageUrl = '';

    try {
      // ✅ Case 1: File upload
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file?.path!, {
          folder: 'products',
          public_id: `${Date.now()}-product`,
        });

        finalImageUrl = result.secure_url;
      } 
      // ✅ Case 2: JSON payload with imageUrl
      else if (req.body.imageUrl) {
        finalImageUrl = req.body.imageUrl;
      } 
      // ❌ Neither file nor image URL provided
      else {
        return res.status(400).json({ message: 'No image file or imageUrl provided' });
      }

      // ✅ Save to MongoDB
      const product = new ProductModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        imageUrl: finalImageUrl,
      });

      await product.save();

      res.status(201).json({
        message: 'Product created successfully',
        product,
      });
    } catch (err) {
      console.error('Error uploading image or saving product:', err);
      res.status(500).json({ message: 'Error saving product' });
    }
  });
};

export const getproduct = async (req:any,res:any)=>{
try {
    
    const products = await ProductModel.find()
    res.json(products)
} catch (error) {
    res.json(error)
}
}


export const getproductbyid = async(req:any,res:any)=>{
  try {
    const product = await ProductModel.findById(req.params.id)
    res.json(product)
  } catch (error) {
    res.json(error)
  }
}