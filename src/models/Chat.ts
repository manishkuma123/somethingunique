import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'auth',
    required: true
  },
  file: {
    type: String, 
    required: false,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'auth',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
