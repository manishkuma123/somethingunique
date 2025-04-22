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
exports.getproductbyid = exports.getproduct = exports.uploadProductImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudnairy_1 = __importDefault(require("../cloudnairy"));
const product_1 = __importDefault(require("../models/product"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname)),
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
const uploadProductImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'Error uploading file', error: err.message });
        }
        let finalImageUrl = '';
        try {
            // ✅ Case 1: File upload
            if (req.file) {
                const result = yield cloudnairy_1.default.uploader.upload((_a = req.file) === null || _a === void 0 ? void 0 : _a.path, {
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
            const product = new product_1.default({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                stock: req.body.stock,
                category: req.body.category,
                imageUrl: finalImageUrl,
            });
            yield product.save();
            res.status(201).json({
                message: 'Product created successfully',
                product,
            });
        }
        catch (err) {
            console.error('Error uploading image or saving product:', err);
            res.status(500).json({ message: 'Error saving product' });
        }
    }));
});
exports.uploadProductImage = uploadProductImage;
const getproduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_1.default.find();
        res.json(products);
    }
    catch (error) {
        res.json(error);
    }
});
exports.getproduct = getproduct;
const getproductbyid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_1.default.findById(req.params.id);
        res.json(product);
    }
    catch (error) {
        res.json(error);
    }
});
exports.getproductbyid = getproductbyid;
