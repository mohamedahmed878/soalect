import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required for Google accounts — they authenticate via googleId instead.
    password: {
      type: String,
      required: function passwordRequired() {
        return !this.googleId;
      },
      minlength: 8,
    },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

// Hash the password whenever it's set/changed.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

// Never send the password hash back in API responses.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    ret.id = ret._id.toString();
    return ret;
  },
});

export default mongoose.model("User", userSchema);
