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
exports.getMessages = exports.adminSendMessage = exports.sendMessage = exports.getAllUsers = exports.chatAuthorization = exports.adminProtect = exports.protect = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("../models/auth"));
const Chat_1 = __importDefault(require("../models/Chat"));
const socket_1 = require("../socket");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email, role } = req.body;
    const userExists = yield auth_1.default.findOne({ email });
    if (userExists)
        return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const newUser = new auth_1.default({ username, password: hashedPassword, email, role });
    yield newUser.save();
    return res.status(201).json({ message: 'User registered successfully' });
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = req.body;
    const user = yield auth_1.default.findOne({ email });
    if (!user)
        return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const userdata = {
        userid: user._id,
        username: user.username,
        email: user.email
    };
    console.log(user);
    return res.status(200).json({ token, userdata });
});
exports.login = login;
const protect = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ message: 'Access denied, token missing' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    }
    catch (err) {
        return res.status(400).json({ message: 'Invalid token' });
    }
};
exports.protect = protect;
const adminProtect = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin role required' });
    }
    next();
};
exports.adminProtect = adminProtect;
const chatAuthorization = (req, res, next) => {
    if (req.user.role === 'user') {
        next();
    }
    else {
        next();
    }
};
exports.chatAuthorization = chatAuthorization;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied, admin role required' });
        }
        const users = yield auth_1.default.find();
        return res.status(200).json({ users });
    }
    catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllUsers = getAllUsers;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text } = req.body;
    const senderId = req.user.id;
    let fileUrl = null;
    const admin = yield auth_1.default.findOne({ role: 'admin' });
    if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
    }
    if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
    }
    const user = yield auth_1.default.findById(senderId);
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    const newMessage = new Chat_1.default({
        text,
        sender: senderId,
        recipient: admin._id,
        file: fileUrl,
    });
    const receiverSocketId = (0, socket_1.getReceiverSocketId)(admin._id);
    if (receiverSocketId) {
        socket_1.io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    yield newMessage.save();
    console.log(newMessage);
    return res.status(200).json({ message: 'Message sent to admin' });
});
exports.sendMessage = sendMessage;
const adminSendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, recipientId } = req.body;
    const senderId = req.user.id;
    const recipient = yield auth_1.default.findById(recipientId);
    if (!recipient || recipient.role !== 'user') {
        return res.status(400).json({ message: 'User not found' });
    }
    const newMessage = new Chat_1.default({
        text,
        sender: senderId,
        recipient: recipientId,
        date: new Date(),
    });
    yield newMessage.save();
    const receiverSocketId = (0, socket_1.getReceiverSocketId)(recipientId);
    if (receiverSocketId) {
        socket_1.io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(200).json({ message: 'Message sent to user' });
});
exports.adminSendMessage = adminSendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log('User ID:', userId);
        console.log('User Role:', userRole);
        if (userRole === 'admin') {
            const { userId: targetUserId } = req.params;
            const targetUser = yield auth_1.default.findById(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const messages = yield Chat_1.default.find({
                $or: [
                    { sender: userId, recipient: targetUserId },
                    { sender: targetUserId, recipient: userId }
                ]
            })
                .populate('sender', 'username email')
                .populate('recipient', 'username email')
                .sort({ date: -1 });
            return res.status(200).json({ messages });
        }
        if (userRole === 'user') {
            const admin = yield auth_1.default.findOne({ role: 'admin' });
            if (!admin) {
                return res.status(400).json({ message: 'Admin not found' });
            }
            const messages = yield Chat_1.default.find({
                $or: [
                    { sender: userId, recipient: admin._id },
                    { sender: admin._id, recipient: userId }
                ]
            })
                .populate('sender', 'username email')
                .populate('recipient', 'username email')
                .sort({ date: -1 });
            return res.status(200).json({ messages });
        }
        return res.status(403).json({ message: 'Access denied' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.getMessages = getMessages;
