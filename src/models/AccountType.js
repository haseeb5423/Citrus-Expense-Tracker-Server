import mongoose from 'mongoose';

const accountTypeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
    maxlength: [30, 'Label cannot exceed 30 characters']
  },
  theme: {
    type: String,
    required: [true, 'Theme color is required'],
    enum: ['blue', 'emerald', 'orange', 'purple', 'rose', 'slate', 'indigo']
  }
}, {
  timestamps: true
});

// Ensure a user can't duplicate labels
accountTypeSchema.index({ user: 1, label: 1 }, { unique: true });

export const AccountType = mongoose.model('AccountType', accountTypeSchema);
