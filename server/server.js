import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';

//App config
const PORT=process.env.PORT||4000;
const app=express();
await connectDB();

//Initialize middleware
app.use(express.json());
app.use(cors());

//API Route
app.get('/',(req,res)=>{
  res.send("Api is working");
})
app.use('/api/user',userRouter)
app.listen(PORT,()=>console.log('Server running at port '+PORT));