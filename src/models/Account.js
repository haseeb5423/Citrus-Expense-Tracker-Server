import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [50, 'Account name cannot exceed 50 characters']
  },
  balance: { 
    type: Number, 
    required: [true, 'Balance is required'], 
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  type: { 
    type: String, 
    required: [true, 'Account type is required'],
    trim: true
  },
  color: { type: String },
  cardNumber: { type: String },
  cardHolder: { type: String }
}, { timestamps: true });

// Compound index for faster user-specific queries
accountSchema.index({ user: 1, createdAt: -1 });

export const Account = mongoose.model('Account', accountSchema);
