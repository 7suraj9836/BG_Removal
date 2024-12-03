import {confirmPayment, createPaymentIntent, stripeWebhook} from "../controllers/PaymentController.js";
import express from 'express';
import bodyParser from 'body-parser';

const paymentRouter= express.Router();
// paymentRouter.post('/create-payment',createPayment);
// paymentRouter.post('/execute-payment',executePayment);
paymentRouter.post('/create-payment-intent', createPaymentIntent);
paymentRouter.post('/confirm-payment', confirmPayment); 
paymentRouter.post('/webhook', bodyParser.raw({ type: 'application/json' }),stripeWebhook);

 export default paymentRouter;