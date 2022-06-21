const mongoose = require("mongoose");
const passwordHash = require("password-hash");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reset_token: { type: String, default: "" },
    reset_token_expire_date: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  const hashedPassword = passwordHash.generate(this.password);
  this.password = hashedPassword;
  next();
});

UserSchema.methods.checkPassword = function (password, hashPassword) {
  return passwordHash.verify(password, hashPassword);
};

UserSchema.methods.createJwtToken = async function (id) {
  try {
    const token = await jwt.sign(
      {
        user: id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return token;
  } catch (error) {
    console.log(error);
  }
};

UserSchema.methods.verifyJwtToken = async function (token) {
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    return { success: true, payload: decoded };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

module.exports = mongoose.model("user", UserSchema);
