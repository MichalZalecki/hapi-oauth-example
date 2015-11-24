import _                from "lodash";
import generatePassword from "password-generator";

function getQuery(credentials) {
  switch(credentials.provider) {
    case "google":
    case "facebook":
      return { provider: credentials.provider, uid: credentials.profile.id };
    default:
      throw "Unknow provider";
  }
}

function getInfo(credentials) {
  switch(credentials.provider) {
    case "google":
      return {
        token: credentials.token,
        name:  credentials.profile.displayName,
        email: _(credentials.profile.emails)
          .filter(email => email.type === "account")
          .first()
          .value,
        password: generatePassword(20, false),
      }
    case "facebook": {
      return {
        token: credentials.token,
        name:  credentials.profile.displayName,
        email: credentials.profile.email,
        password: generatePassword(20, false),
      }
    }
    default:
      throw "Unknow provider";
  }
}

function credentialsFormatter(credentials) {
  return {
    query: getQuery(credentials),
    info: getInfo(credentials),
  };
}

export default credentialsFormatter;
