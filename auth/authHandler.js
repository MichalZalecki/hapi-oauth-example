import _                    from "lodash";
import User                 from "../users/User";
import credentialsFormatter from "../users/credentialsFormatter";

function authHandler(request, reply) {
  if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
  }

  const credentials = credentialsFormatter(request.auth.credentials);

  User.findOrCreate(credentials.query, credentials.info, (err, user, created) => {
    if (err) console.log(err);
    return reply({ user: _.pick(user, "token", "name", "email")});
  });
}

export default authHandler;
