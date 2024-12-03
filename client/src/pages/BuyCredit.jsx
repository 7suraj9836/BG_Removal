import React, { useState } from 'react'
import { assets, plans } from '../assets/assets'
import PaymentPage from '../components/CheckoutForm';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
const BuyCredit = () => {
  const [selectedAmount, setSelectedAmount] = useState(null); // Store selected amount for payment
  const [isPaymentPageOpen, setIsPaymentPageOpen] = useState(false); 
  const { user } = useUser(); 
  const clerkId = user?.id;
  const backendUrl= import.meta.env.VITE_BACKEND_URL;
  console.log(backendUrl);
  const stripePublishableKey=import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  // Handle Purchase button click
  const handlePurchaseClick =async (priceId) => {
    console.log("Stripe Public Key:", stripePublishableKey);
  const stripe=await loadStripe(stripePublishableKey);
  const body = { priceId,clerkId };
  const headers={
    "Content-Type":"application/json"
  }
  try {
    const response = await axios.post(`${backendUrl}/api/payments/create-payment-intent`, body, { headers });
    console.log("Response:", response.data);
   // Redirect to Stripe Checkout
   stripe.redirectToCheckout({ sessionId: response.data.id });
  } catch (error) {
    console.error("Error:", error);
  }
  };

  // Close payment modal
  const handleClosePayment = () => {
    setIsPaymentPageOpen(false);
  };
  return (
    <div className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our Plans</button>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10'>Choose the plan that’s right for you</h1>
      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {
            plans.map((item,index)=>(
                <div className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all duration-500' key={index}> 
                <img width={40} src={assets.logo_icon} alt="" />
                <p className='mt-3 font-semibold'>{item.id}</p>
                <p className='text-sm'>{item.desc}</p>
                <p className='mt-6'><span className='text-3xl font-medium'>${item.price}</span>/{item.credits}</p>
                <button  onClick={() => handlePurchaseClick(item.priceId)} className='w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52'>Purchase</button>
               
                </div>
            ))
        }
      </div>

      
      {/* {isPaymentPageOpen && (
        <div className='fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-4 rounded'>
            <PaymentPage amount={selectedAmount} onClose={handleClosePayment} />
          </div>
        </div>
      )} */}
    </div>
  )
}

export default BuyCredit
