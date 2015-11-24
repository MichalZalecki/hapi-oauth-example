import mongoose     from "mongoose";
import findOrCreate from "mongoose-findorcreate";

const UserSchema = new mongoose.Schema({
  uid:          String,
  provider:     String,
  name:         String,
  email:        String,
  password:     String,
  token:        String,
  archived:     Boolean,
  confirmed:    Boolean,
  confirmToken: String,
}, { timestamps: {} });

UserSchema.plugin(findOrCreate);

const User = mongoose.model("User", UserSchema);

export default User;
