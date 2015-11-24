import mongoose     from "mongoose";
import findOrCreate from "mongoose-findorcreate";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  uid: String,
  provider: String,
}, { timestamps: {} });

UserSchema.plugin(findOrCreate);

const User = mongoose.model("User", UserSchema);

export default User;
