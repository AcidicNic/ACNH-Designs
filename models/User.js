const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  password: { type: String, select: false },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 16 },
  creatorId: { type: String },
  bio: { type: String, maxlength: 200 },
  favorites: [{ type:mongoose.Schema.ObjectId, ref: 'Design' }],
  designs: [{ type:mongoose.Schema.ObjectId, ref: 'Design' }],
});

UserSchema.pre("save", function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);
