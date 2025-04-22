import express from 'express';
import { register ,login, protect, adminProtect, getAllUsers, sendMessage, getMessages, adminSendMessage} from '../controllers/auth';

import multer from 'multer';
import path from 'path';

const router = express.Router();



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });


router.post('/register', register);


router.post('/login', login);

router.get('/', protect,(req,res)=>{
    res.send('hello manish')
})
router.get('/allusers', protect,  adminProtect, getAllUsers)
router.post('/chat/sendMessage', protect,upload.single('file'), sendMessage);

router.post('/chat/adminSendMessage', protect, adminProtect, adminSendMessage);

router.get('/getMessages', protect, getMessages);
router.get('/getMessages/:userId', protect, adminProtect, getMessages); 
router.get('/admin-dashboard', protect, adminProtect, (req: any, res: any) => {
    res.json({ message: 'Admin dashboard' });
  });
export default router;
