import mongoose, { Document, Schema } from 'mongoose';

interface IAppointment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  date: Date;
  time: string;
  status: 'booked' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed'],
      default: 'booked',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } 
);


appointmentSchema.pre<IAppointment>('save', function(next) {
  this.updatedAt = new Date(); 
  next();
});

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
