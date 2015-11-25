import { expect } from "chai";
import axios      from "axios";
import User       from "../../../users/User";
import crypto     from "crypto";
import BCrypt     from "bcrypt";

function createUser(data) {
  const defaults = {
    provider:     "email",
    uid:          "foo@bar.com",
    name:         "FooBar",
    email:        "foo@bar.com",
    password:     BCrypt.hashSync("123456789", 10),
    token:        crypto.randomBytes(64).toString("hex"),
    archived:     false,
    confirmed:    false,
    confirmToken: crypto.randomBytes(12).toString("hex"),
  };
  const payload = { ...defaults, ...data };
  return new Promise((resolve, reject) => {
    User.create(payload, (err, user) => {
      if (err) reject(err);
      resolve(user);
    });
  });
}

function removeUsers() {
  User.remove().exec();
}

export {
  createUser,
  removeUsers,
};
