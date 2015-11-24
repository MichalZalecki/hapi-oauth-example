function getToken({authorization}) {
  try {
    return authorization.match(/Token (.*)/)[1];
  } catch(e) {
    return null;
  }
}

export default getToken;
