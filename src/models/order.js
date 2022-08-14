import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    max: 100,
  },

  customer: {
    type: String,
    required: [true, "Customer name is required"],
  },

  date: String,

  status: {
    type: String,
    enum: ["placed", "packed", "dispatched", "delivered"],
    default: "placed",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
