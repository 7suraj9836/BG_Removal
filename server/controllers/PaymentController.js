
// const createPayment=async(req,res)=>{
//     const { amount } = req.body;

//     const payment = {
//       intent: 'sale',
//       payer: { payment_method: 'paypal' },
//       redirect_urls: {
//         return_url: 'http://localhost:5173/buy', // adjust as per your frontend
//         cancel_url: 'http://localhost:5173/result',
//       },
//       transactions: [{
//         amount: { currency: 'USD', total: amount },
//         description: 'Payment for goods.',
//       }],
//     };
  
//     paypal.payment.create(payment, (error, payment) => {
//       if (error) {
//         res.status(500).send({ error: error.message });
//       } else {
//         const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
//         res.send({ approvalUrl });
//       }
//     });
// }

// const executePayment=async(req,res)=>{
//     const { paymentId, payerId } = req.body;

//     const executePaymentJson = { payer_id: payerId };
  
//     paypal.payment.execute(paymentId, executePaymentJson, (error, payment) => {
//       if (error) {
//         res.status(500).send({ error: error.message });
//       } else {
//         res.send({ success: true, payment });
//       }
//     });
// }

import dotenv from 'dotenv';
import stripe from '../configs/stripeConfig.js';
import userModel from "../models/userModel.js";
// import { useAuth } from "@clerk/clerk-react";
dotenv.config();


const createPaymentIntent = async (req, res) => {
  try {
    console.log("req12",req.body);
    const { priceId,clerkId } = req.body; // Amount in smallest currency unit (e.g., cents)
    
    // Create a PaymentIntent with the order amount and currency
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1
        },
      ],
      metadata: {
    clerkId: clerkId, // Pass the actual clerkId here
  },
      success_url:"http://localhost:5173",
      cancel_url:"http://localhost:5173" // Indian Rupee
      // Optional: Add additional payment options, such as "payment_method_types"
    });
   
    res.status(200).json({ id:session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const confirmPayment = async (req, res) => {
    const { paymentIntentId } = req.body;

    try {
        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log("paymentIntentId",paymentIntent);
        // Check the payment intent status
        if (paymentIntent.status === 'succeeded') {
            return res.send({ success: true, paymentIntent });
        } else {
            return res.status(400).send({ error: 'Payment not successful.' });
        }
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// const stripeWebhook=async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   try {
//     const event = stripeClient.webhooks.constructEvent(req.body, sig,whsec_a715a6fa7f5bad34613162d543e4bc47ba90dcec2e8c1461188e390ddf3df454 );

//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
//       const clerkId = session.metadata.clerkId;

//       // Retrieve the Price object from Stripe using priceId
//       const lineItem = await stripeClient.checkout.sessions.listLineItems(session.id, { limit: 1 });
//       const priceId = lineItem.data[0].price.id;

//       const price = await stripeClient.prices.retrieve(priceId);
//       const product = await stripeClient.products.retrieve(price.product);

//       // Assume credits info is stored in product metadata
//       const creditsToAdd = product.metadata.credits ? parseInt(product.metadata.credits) : 0;

//       if (creditsToAdd > 0) {
//         // Update user's credit balance
//         await userModel.findOneAndUpdate(
//           { clerkId },
//           { $inc: { creditBalance: creditsToAdd } }
//         );
//         res.status(200).send('Success');
//       } else {
//         console.error('No credits information available in product metadata');
//         res.status(400).send('No credits information');
//       }
//     } else {
//       res.status(400).send('Event type not supported');
//     }
//   } catch (error) {
//     console.error('Error in webhook processing:', error.message);
//     res.status(400).send(`Webhook Error: ${error.message}`);
//   }
// }

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // Verify the Stripe webhook event with the provided secret
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      'whsec_a715a6fa7f5bad34613162d543e4bc47ba90dcec2e8c1461188e390ddf3df454'
    );
    console.log("event Recieved",event);
    // Check if the event is for a completed checkout session
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log("session",session);
      const clerkId = session.metadata.clerkId;
      // const {getToken}=useAuth();
      // const token=await getToken();
      // const token_decode = jwt.decode(token);
      // console.log("clerkId56",token_decode);
      // Retrieve the line items associated with the session to get the price ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceId = lineItems.data[0].price.id;

      // Retrieve the price and product associated with the priceId
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);
      console.log('metadata',product);
      // Parse credits from the product's metadata
      // const creditsToAdd = product.metadata.credits ? parseInt(product.metadata.credits) : 0;

      // If credits are available, update the user's credit balance in the database
      let creditsToAdd = 0;
      switch (product.name) {
        case "Basic":
          creditsToAdd = 100;
          break;
        case "Advanced":
          creditsToAdd = 500;
          break;
        case "Business":
          creditsToAdd = 5000;
          break;
        default:
          console.error('Unknown product name');
          return res.status(400).send('Unknown product name');
      }
        const updatedUser = await userModel.findOneAndUpdate(
          { clerkId },
          { $inc: { creditBalance: creditsToAdd } },
          { new: true } // Returns the updated document
        );
       console.log('updatedUser',updatedUser)
        if (updatedUser) {
          console.log(`Credits successfully added. New balance for user ${clerkId}: ${updatedUser.creditBalance}`);
          res.status(200).send('Success');
        } else {
          console.error(`User with clerkId ${clerkId} not found`);
          res.status(404).send('User not found');
        }
      
    } else {
      console.error(`Event type ${event.type} not supported`);
      res.status(400).send('Event type not supported');
    }
  } catch (error) {
    console.error('Error in webhook processing:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export { createPaymentIntent,confirmPayment,stripeWebhook };


// export {createPayment,executePayment};