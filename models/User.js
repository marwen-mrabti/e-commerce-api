const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
      minlength: [3, "Name must be at least 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
    },

    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Minimum password length is 6 characters"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  // console.log(!this.modifiedPaths()); //this.modifiedPaths() returns an array of modified paths
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//compare user entered password to hashed password in database
/**
 * @method checkPassword
 * @param {string} enteredPassword
 * @returns {boolean}
 */
userSchema.methods.comparePassword = async function (password) {
  const isMatch = bcrypt.compare(password, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
