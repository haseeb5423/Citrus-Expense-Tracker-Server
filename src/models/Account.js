import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  type: { type: String, required: true },
  color: { type: String },
  cardNumber: { type: String },
  cardHolder: { type: String }
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);
