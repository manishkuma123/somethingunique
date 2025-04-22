"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../controllers/product");
const router = express_1.default.Router();
router.post('/upload', product_1.uploadProductImage);
router.get('/all', product_1.getproduct);
router.get('/all/:id', product_1.getproductbyid);
router.get('/', (req, res) => {
    res.send("Hey Manish Kumar");
});
exports.default = router;
