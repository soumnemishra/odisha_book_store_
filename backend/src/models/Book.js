import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    // NEW NESTED STRUCTURE
    title: {
      display: {
        type: String,
        required: true,
        trim: true,
      },
      english: {
        type: String,
        trim: true,
        index: true,
      },
      odia: {
        type: String,
        trim: true,
        index: true,
      },
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // NEW NESTED PRICE STRUCTURE
    price: {
      original: {
        type: Number,
        required: true,
        min: 0,
      },
      discounted: {
        type: Number,
        min: 0,
      },
      discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    category: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // NEW FIELDS
    language: {
      type: String,
      enum: ['Odia', 'English', 'Hindi'],
      required: true,
      default: 'Odia',
      index: true,
    },
    academicGrade: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    // IMPORTANT: Enable virtuals in JSON and Object output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// BACKWARD COMPATIBILITY VIRTUALS
// ============================================================================
// These virtuals allow old API code to work with the new nested structure
// without breaking existing frontend implementations

/**
 * Virtual: titleDisplay
 * Returns the display title as a simple string for backward compatibility
 * Usage: book.titleDisplay instead of book.title.display
 */
bookSchema.virtual('titleDisplay').get(function () {
  return this.title?.display || '';
});

/**
 * Virtual: finalPrice
 * Returns the active selling price (discounted if available, otherwise original)
 * Usage: book.finalPrice instead of manually checking price.discounted
 */
bookSchema.virtual('finalPrice').get(function () {
  return this.price?.discounted || this.price?.original || 0;
});

/**
 * Virtual: hasDiscount
 * Returns true if the book has an active discount
 */
bookSchema.virtual('hasDiscount').get(function () {
  return this.price?.discountPercent > 0;
});

/**
 * Virtual: savings
 * Returns the amount saved if there's a discount
 */
bookSchema.virtual('savings').get(function () {
  if (!this.hasDiscount) return 0;
  return (this.price?.original || 0) - (this.price?.discounted || 0);
});

// ============================================================================
// TEXT SEARCH INDEX
// ============================================================================
// Create text index on title.display for full-text search
bookSchema.index({ 'title.display': 'text', description: 'text', author: 'text' });

// ============================================================================
// METHODS
// ============================================================================

/**
 * Apply a discount to the book
 * @param {number} discountPercent - Discount percentage (0-100)
 */
bookSchema.methods.applyDiscount = function (discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100');
  }
  this.price.discountPercent = discountPercent;
  this.price.discounted = this.price.original * (1 - discountPercent / 100);
  return this;
};

/**
 * Remove discount and reset to original price
 */
bookSchema.methods.removeDiscount = function () {
  this.price.discountPercent = 0;
  this.price.discounted = this.price.original;
  return this;
};

import softDeletePlugin from './plugins/softDelete.js';

// Apply Soft Delete Plugin
bookSchema.plugin(softDeletePlugin);

export default mongoose.model('Book', bookSchema);
