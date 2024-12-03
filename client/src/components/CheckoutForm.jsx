import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser } from '@clerk/clerk-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const [amount, setAmount] = useState(0);
  const elements = useElements();
  const { user } = useUser(); 
  const clerkId = user?.id;
  console.log('clerkId56',clerkId)

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!clerkId) {
      console.error('Clerk ID is not available.');
      return;
    }


    const stripe = await stripePromise;
      console.log("stripe55",stripe);
    // Create a payment intent on the server
    const response = await fetch('http://localhost:4000/api/payments/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amount * 100, clerkId }) // amount in paise
    });
    
    const { clientSecret } = await response.json();

    // Confirm the payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement), // get card element
      },
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount in INR"
        required
      />
      <button type="submit">Pay</button>
    </form>
  );
};

export default CheckoutForm;


// import React, { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// // Load Stripe outside of a component to avoid re-creating it on every render
// const stripePromise = loadStripe(import.meta.env.REACT_APP_STRIPE_PUBLIC_KEY);

// const CheckoutForm = () => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       console.error("Stripe has not loaded yet.");
//       return;
//     }

//     // Create a payment intent on the server
//     const response = await fetch('http://localhost:4000/api/payments/create-payment-intent', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ amount}) // amount in the smallest currency unit
//     });

//     const { clientSecret } = await response.json();

//     // Confirm the payment
//     const result = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: elements.getElement(CardElement), // get card element
//       },
//     });

//     if (result.error) {
//       console.error(result.error.message);
//     } else {
//       if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
//         console.log('Payment succeeded!');
//       }
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <CardElement /> {/* CardElement to collect card details */}
//       <button type="submit" disabled={!stripe || !elements}>Pay</button>
//     </form>
//   );
// };

// // Wrap CheckoutForm in Elements provider
// const PaymentPage = ({ amount, onClose }) => (
//   <>
//   <button onClick={onClose}>Close</button>
//   <Elements stripe={stripePromise}>
//     <CheckoutForm amount={amount} />
//   </Elements>
//   </>
// );

// export default PaymentPage;
