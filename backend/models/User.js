const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  phone:     { type: String, trim: true },
  role:      { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  avatar:    { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  isVerified:{ type: Boolean, default: false },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['male', 'female', 'other', ''] },
  bloodType:   { type: String },
  address:     { type: String },
  city:        { type: String },
  allergies:   [{ type: String }],
  chronicDiseases: [{ type: String }],
  notifications: [{
    message:   { type: String },
    type:      { type: String, enum: ['appointment', 'consultation', 'payment', 'general'] },
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// ✅ Sans next — Mongoose async le gère automatiquement
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
