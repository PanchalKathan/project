import Stripe from "stripe";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

// @desc    Create a Stripe checkout session
// @route   POST /api/payment/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // --- SECURE PRICE HANDLING ---
  // Receive cart items and customerId from the frontend.
  const { cartItems, customerId } = req.body;

  if (!cartItems?.length) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found." });

    // --- SERVER-SIDE VALIDATION ---
    // For security, we recalculate the subtotal based on product prices from your database,
    // ignoring any totals sent from the client.
    let verifiedSubtotal = 0;
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (!product) throw new Error(`Product '${item.name}' not found.`);
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for '${product.name}'.`);
      }
      verifiedSubtotal += product.price * item.quantity;
    }
    
    // Re-calculate delivery fee and tax on the server to ensure accuracy.
    const verifiedDeliveryFee = verifiedSubtotal > 500 ? 0 : 50;
    const verifiedTax = verifiedSubtotal * 0.18;
    const serverTotalAmount = verifiedSubtotal + verifiedDeliveryFee + verifiedTax;
    // --- END VALIDATION ---

    const line_items = [{
      price_data: {
        currency: "inr",
        product_data: {
          name: "Your Total Purchase from HomeCraft",
          description: `Order for ${customer.name}`,
        },
        // Use the SECURE, server-calculated total amount, converted to paise/cents
        unit_amount: Math.round(serverTotalAmount * 100),
      },
      quantity: 1,
    }];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: customer.email,
      metadata: {
        customerId,
        shippingAddress: JSON.stringify(customer.address),
        cartItems: JSON.stringify(cartItems.map(item => ({ product: item._id, quantity: item.quantity }))),
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ... the rest of your paymentController.js file remains the same ...

// @desc    Stripe webhook handler
// @route   POST /api/payment/webhook
export const handleStripeWebhook = (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  
  console.log("\n--- STRIPE WEBHOOK EVENT RECEIVED ---");

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // The raw body buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified successfully.");
  } catch (err) {
    console.error("❌ WEBHOOK SIGNATURE VERIFICATION FAILED:", err.message);
    console.error("Please ensure the webhook secret in your .env file matches the one from the Stripe CLI.");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Event type is 'checkout.session.completed'. Processing session:", session.id);
    createOrderFromWebhook(session); 
  } else {
    console.log(`- Webhook received unhandled event type: '${event.type}'. No action taken.`);
  }

  res.json({ received: true });
};

// @desc    Get session details for the success page
// @route   GET /api/payment/session/:id
export const getSessionDetails = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["line_items.data.price.product"],
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to create the order asynchronously
const createOrderFromWebhook = async (session) => {
  console.log("-> Starting createOrderFromWebhook function...");
  try {
    const { customerId, cartItems: cartItemsJSON, shippingAddress: addressJSON } = session.metadata;
    console.log("1. Extracted metadata from session.");

    if (!customerId || !cartItemsJSON || !addressJSON) {
      console.error("❌ Webhook Error: Missing required metadata from Stripe session.", { metadata: session.metadata });
      return;
    }
    console.log("2. Metadata is present and valid.");

    const existingOrder = await Order.findOne({ "paymentDetails.sessionId": session.id });
    if (existingOrder) {
      console.warn(`- Webhook Warning: Order for session ID ${session.id} already exists. Stopping.`);
      return;
    }
    console.log("3. No duplicate order found. Proceeding.");

    const cartItems = JSON.parse(cartItemsJSON);
    const shippingAddress = JSON.parse(addressJSON);

    const productsForOrder = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(`❌ Webhook Error: Product ID ${item.product} not found. Skipping.`);
          return null;
        }
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
        return {
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
        };
      })
    );
    console.log("4. Processed product data for the order.");
    
    const validProductsForOrder = productsForOrder.filter(p => p !== null);
    if (validProductsForOrder.length === 0) {
        console.error(`❌ Webhook Error: No valid products found for order creation.`);
        return;
    }

    await Order.create({
      customer: customerId,
      products: validProductsForOrder,
      totalAmount: session.amount_total / 100,
      shippingAddress: shippingAddress,
      paymentDetails: { sessionId: session.id, paymentStatus: "Paid" },
    });

    console.log(`✅✅✅ ORDER CREATED SUCCESSFULLY FOR CUSTOMER: ${customerId} ✅✅✅`);
  } catch (err) {
    console.error("❌❌❌ FAILED TO CREATE ORDER FROM WEBHOOK:", {
      error: err.message,
      stack: err.stack,
      sessionId: session.id,
    });
  }
};

