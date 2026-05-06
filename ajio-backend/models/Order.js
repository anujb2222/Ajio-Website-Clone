const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  shipping: {
    name: String,
    address: String,
    state: String,
    email: String   
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number
    }
  ],
  totalPrice: Number,
  paymentMethod: String,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  paymentStatus: { type: String, default: "pending" },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});