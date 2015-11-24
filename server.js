import Hapi        from "hapi";
import bell        from "bell";
import mongoose    from "mongoose";
import _           from "lodash";
import Todo        from "./todos/Todo";
import User        from "./users/User";
import authHandler from "./auth/authHandler";

const server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 4000,
});

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

mongoose.connect(process.env.MONGOLAB_URI);

server.route({
  path: "/users/current",
  method: "GET",
  handler(request, reply) {
    const token = request.headers.authorization.match(/Token (.*)/)[1];

    User.findOne({ token }, (err, user) => {
      if (err) throw err;
      reply(_.pick(user, "name", "email"));
    });
  }
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
  }
});

server.route({
  path: "/todos/{id}",
  method: "PUT",
  handler(request, reply) {
    Todo.findByIdAndUpdate(request.params.id, { $set: request.payload }, {new: true}, function (err, todo) {
      if (err) throw err;
      reply(todo);
    });
  }
});


server.start(err => {
  if (err) throw err;
  console.log(`Server started at: ${server.info.uri}`);
});
