import mongoose from 'mongoose';

/**
 * Order Schema - Supports both authenticated users and guest checkout
 * 
 * For Guest Orders:
 * - user field is null
 * - customerName, customerPhone, customerAddress are required
 * 
 * For Authenticated Orders:
 * - user field references User model
 * - customer fields can be auto-filled from user profile
 */
const orderSchema = new mongoose.Schema(
  {
    // User reference (optional for guest orders)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest orders
    },

    // Guest customer details (required when user is null)
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // Order items with validated prices
    items: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        // Store book title for historical record (in case book is deleted)
        title: {
          type: String,
          required: true,
        },
      },
    ],

    // Pricing breakdown
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 50, // Flat ₹50 shipping
      min: 0,
    },

    // Order status tracking
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      required: true,
    },

    // Payment details (optional - for future implementation)
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },

    // Delivery tracking (optional - for future implementation)
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },

    // Notes or special instructions
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1 });

export default mongoose.model('Order', orderSchema);
