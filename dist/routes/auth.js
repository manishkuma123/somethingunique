"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.post('/register', auth_1.register);
router.post('/login', auth_1.login);
router.get('/', auth_1.protect, (req, res) => {
    res.send('hello manish');
});
router.get('/allusers', auth_1.protect, auth_1.adminProtect, auth_1.getAllUsers);
router.post('/chat/sendMessage', auth_1.protect, upload.single('file'), auth_1.sendMessage);
router.post('/chat/adminSendMessage', auth_1.protect, auth_1.adminProtect, auth_1.adminSendMessage);
router.get('/getMessages', auth_1.protect, auth_1.getMessages);
router.get('/getMessages/:userId', auth_1.protect, auth_1.adminProtect, auth_1.getMessages);
router.get('/admin-dashboard', auth_1.protect, auth_1.adminProtect, (req, res) => {
    res.json({ message: 'Admin dashboard' });
});
exports.default = router;
