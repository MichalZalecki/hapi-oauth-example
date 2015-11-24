import Hapi        from "hapi";
import Boom        from "boom";
import Joi         from "joi";
import bell        from "bell";
import mongoose    from "mongoose";
import _           from "lodash";
import BCrypt      from "bcrypt";
import crypto      from "crypto";
import Todo        from "./todos/Todo";
import User        from "./users/User";
import authHandler from "./auth/authHandler";
import getToken    from "./auth/getToken";

const server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 4000,
});

mongoose.connect(process.env.MONGOLAB_URI);

server.register(bell, err => {
  if (err) throw err;

  server.auth.strategy("facebook", "bell", {
    provider:     "facebook",
    password:     process.env.FACEBOOK_PASSWORD,
    clientId:     process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    isSecure:     false // Terrible idea but required if not using HTTPS especially if developing locally
  });

  server.route({
    method: ["GET", "POST"],
    path: "/auth/facebook",
    config: {
      auth: "facebook",
      handler: authHandler,
    },
  });

  server.auth.strategy("google", "bell", {
    provider:     "google",
    password:     process.env.GOOGLE_PASSWORD,
    clientId:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure:     false // Terrible idea but required if not using HTTPS especially if developing locally
  });

  server.route({
    method: ["GET", "POST"],
    path: "/auth/google",
    config: {
      auth: "google",
      handler: authHandler,
    },
  });

});

server.route({
  path: "/user",
  method: "GET",
  handler(request, reply) {
    const token = getToken(request.headers);

    if (!token) throw Boom.badRequest("Missing or invalid Authorization header");

    User.findOne({ token }, (err, user) => {
      if (err) throw err;
      if (!user) throw Boom.notFound("Invalid token");

      reply({
        id:        user._id,
        name:      user.name,
        email:     user.email,
        archived:  user.archived,
        confirmed: user.confirmed,
      });
    });
  },
});

server.route({
  path: "/user",
  method: "POST",
  config: {
    validate: {
      payload: {
        name:     Joi.string().required(),
        email:    Joi.string().email().required(),
        password: Joi.string().min(6).required(),
      },
    },
  },
  handler(request, reply) {
    User.count({ email: request.payload.email }, (err, count) => {
      if (err) throw err;
      if (count) throw Boom.conflict("Email has already been taken");

      User.create({
        provider:     "email",
        uid:          request.payload.email,
        email:        request.payload.email,
        name:         request.payload.name,
        password:     BCrypt.hashSync(request.payload.password, 10),
        token:        crypto.randomBytes(64).toString("hex"),
        archived:     false,
        confirmed:    false,
        confirmToken: crypto.randomBytes(12).toString("hex"),
      }, (err, user) => {

        // TODO: Send confirmation email

        reply({
          id:        user._id,
          name:      user.name,
          email:     user.email,
          token:     user.token,
          archived:  user.archived,
          confirmed: user.confirmed,
        });
      });
    });
  },
});

server.route({
  path: "/user/archive",
  method: "PATCH",
  handler(request, reply) {
    const token = getToken(request.headers);

    if (!token) throw Boom.badRequest("Missing or invalid Authorization header");

    User.update({ token }, {
      archived: true,
      name:     null,
      email:    null,
      token:    null,
      password: null,
    }, (err, user) => {
      if (err) throw err;
      reply().code(204);
    });
  },
});

server.route({
  path: "/user/confirm/{confirmToken}",
  method: "GET",
  handler(request, reply) {
    User.update({
      confirmToken: request.params.confirmToken,
      confirmed: false,
    }, {
      confirmToken: null,
      confirmed: true
    }, (err, res) => {
      if (err) throw err;

      if (res.nModified) reply("Email has been confirmed");
      else throw Boom.notFound("Invalid confirmation token or email has already been confirmed");
    });
  },
});

server.route({
  path: "/session",
  method: "POST",
  config: {
    validate: {
      payload: {
        email:    Joi.string().email().required(),
        password: Joi.string().required(),
      },
    },
  },
  handler(request, reply) {
    const credentials = credentia
    User.findOne({
      provider: "email",
      uid:      request.payload.email,
    }, (err, user) => {
      if (err) throw err;

      if (BCrypt.compareSync(request.payload.password, user.password)) {
        reply({
          id:        user._id,
          name:      user.name,
          email:     user.email,
          token:     user.token,
          archived:  user.archived,
          confirmed: user.confirmed,
        });
      } else {
        throw Boom.forbidden("Invalid credentials");
      }
    });
  },
});

server.route({
  path: "/todos",
  method: "GET",
  handler(request, reply) {
    Todo.find((err, todos) => {
      if (err) throw err;
      reply(todos);
    });
  }
});

server.route({
  path: "/todos/{id}",
  method: "GET",
  handler(request, reply) {
    Todo.findById(request.params.id, (err, todo) => {
      if (err) throw err;
      reply(todo);
    });
  }
});

server.route({
  path: "/todos",
  method: "POST",
  handler(request, reply) {
    const todo = new Todo(request.payload).save(err => {
      if (err) throw err;
      reply(todo);
    });
  }
});

server.route({
  path: "/todos/{id}",
  method: "DELETE",
  handler(request, reply) {
    Todo.remove({ _id: request.params.id }, err => {
      if (err) throw err;
      reply().code(204);
    });
  },
});

server.route({
  path: "/todos/{id}",
  method: "PUT",
  handler(request, reply) {
    Todo.findByIdAndUpdate(request.params.id, { $set: request.payload }, {new: true}, function (err, todo) {
      if (err) throw err;
      reply(todo);
    });
  },
});


server.start(err => {
  if (err) throw err;
  console.log(`Server started at: ${server.info.uri}`);
});
