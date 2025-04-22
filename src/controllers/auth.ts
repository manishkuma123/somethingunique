
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/auth';
import Message from '../models/Chat';
import { getReceiverSocketId, io } from "../socket";
import multer from 'multer';

import path from 'path';


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});


const upload = multer({ storage: storage });








const register = async (req: any, res: any) => {
  const { username, password ,email,role} = req.body;


  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);


  const newUser = new User({ username, password: hashedPassword ,email,role});
  await newUser.save();

  return res.status(201).json({ message: 'User registered successfully' });
};

const login = async (req: any, res: any) => {
  const {  password, email} = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });


  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


  const token = jwt.sign({ id: user._id, email: user.email, role: user.role },  process.env.JWT_SECRET as string,{ expiresIn: '24h' });
const userdata ={
  userid: user._id,
  username: user.username,
email:user.email
}
  console.log(user)
  return res.status(200).json({ token ,userdata});
};

const protect = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied, token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string,);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};
const adminProtect = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin role required' });
  }
  next(); 
};


const chatAuthorization = (req: any, res: any, next: any) => {
  if (req.user.role === 'user') {
   
    next();
  } else {
    next();
  }
};
const getAllUsers = async (req: any, res: any) => {
  try {
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin role required' });
    }

  
    const users = await User.find();
    
    
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};


const sendMessage = async (req: any, res: any) => {
  const { text } = req.body;
  const senderId = req.user.id; 
 
  let fileUrl = null;

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    return res.status(400).json({ message: 'Admin not found' });
  }



  if (req.file) {
   
    fileUrl = `/uploads/${req.file.filename}`;
  }

  const user = await User.findById(senderId);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const newMessage = new Message({
    text,
    sender: senderId,
    recipient: admin._id,  
   file: fileUrl,
  });
 
  const receiverSocketId = getReceiverSocketId(admin._id);
  if (receiverSocketId) {

    io.to(receiverSocketId).emit("newMessage", newMessage);
  }
  await newMessage.save();
 
console.log(newMessage)

  return res.status(200).json({ message: 'Message sent to admin' });
};

const adminSendMessage = async (req: any, res: any) => {
  const { text, recipientId } = req.body;
  const senderId = req.user.id;  


  const recipient = await User.findById(recipientId);
  if (!recipient || recipient.role !== 'user') {
    return res.status(400).json({ message: 'User not found' });
  }

 
  const newMessage = new Message({
    text,
    sender: senderId,
    recipient: recipientId,
    date: new Date(),
  });

  await newMessage.save();
  const receiverSocketId = getReceiverSocketId(recipientId);
  if (receiverSocketId) {
    
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  return res.status(200).json({ message: 'Message sent to user' });
};


const getMessages = async (req: any, res:any) => {
  try {
    const userId = req.user.id;  
    const userRole = req.user.role; 

    console.log('User ID:', userId);
    console.log('User Role:', userRole);

   
    if (userRole === 'admin') {
      const { userId: targetUserId } = req.params;


      const targetUser = await User.findById(targetUserId);

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }


      const messages = await Message.find({
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
      const admin = await User.findOne({ role: 'admin' });

      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }

 
      const messages = await Message.find({
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



export { register,login,protect,adminProtect,chatAuthorization ,getAllUsers,sendMessage ,adminSendMessage,getMessages };
