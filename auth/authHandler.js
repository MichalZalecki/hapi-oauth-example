import _                    from "lodash";
import User                 from "../users/User";
import credentialsFormatter from "../users/credentialsFormatter";

function authHandler(request, reply) {
  if (!request.auth.isAuthenticated) {
      return reply('Authentication failed due to: ' + request.auth.error.message);
  }

  const credentials = credentialsFormatter(request.auth.credentials);

  User.findOrCreate(credentials.query, credentials.info, (err, user, created) => {
    if (err) throw err;
    return reply({
      id:        user._id,
      name:      user.name,
      email:     user.email,
      token:     user.token,
      archived:  user.archived,
      confirmed: user.confirmed,
    });
  });
}

export default authHandler;
