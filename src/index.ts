import express from "express";
import cors from "cors";


import * as dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db";
import authuser from "./routes/auth";
import{ app,server} from './socket'
import  productrouter from './routes/product'
import doctorrouter from './routes/DoctorRoutes'
import AppointmentRoutes from './routes/AppointmentRoutes'
import  Cart  from "./routes/cart";


connectDB();


app.use(express.json());
app.use(cors());

app.use("/api/auth", authuser);
app.use("/api/product", productrouter);
app.use('/api/appointment' , AppointmentRoutes)
app.use('/api/cart',Cart)
app.get('/',(req:any,res:any)=>{
res.send('hi manish ')
})
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
