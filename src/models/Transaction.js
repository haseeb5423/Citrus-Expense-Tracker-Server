import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  type: { 
    type: String, 
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    required: [true, 'Transaction type is required']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'],
    default: Date.now
  }
}, { timestamps: true });

// Compound indexes for efficient queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ accountId: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
