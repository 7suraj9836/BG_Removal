import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/ImageRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';

//App config
const PORT=process.env.PORT||4000;
const app=express();
await connectDB();

//Initialize middleware
// app.use(express.json());
app.use(cors());

// Apply JSON parser only to non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

//API Route
app.get('/',(req,res)=>{
  res.send("Api is working");
})
app.use('/api/user',userRouter)
app.use('/api/image',imageRouter)
// Apply raw body parser only for the Stripe webhook route
app.use('/api/payments/webhook', paymentRouter);
app.use('/api/payments', paymentRouter);
app.listen(PORT,()=>console.log('Server running at port '+PORT));