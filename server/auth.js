const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socketManager = require("./server-socket");

// create a new OAuth client used to verify google sign-in
const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "612582615698-704pocdm5pca68trnq3jdvt5il3ta2k9.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  console.log("Verifying token...");
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => {
      console.log("Token verified successfully");
      return ticket.getPayload();
    })
    .catch((err) => {
      console.error("Token verification failed:", err);
      throw err;
    });
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  console.log("Looking up user with Google ID:", user.sub);
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub })
    .then((existingUser) => {
      if (existingUser) {
        console.log("Found existing user:", existingUser._id);
        return existingUser;
      }

      console.log("Creating new user for:", user.name);
      const newUser = new User({
        name: user.name,
        googleid: user.sub,
      });

      return newUser.save();
    })
    .catch((err) => {
      console.error("Database error in getOrCreateUser:", err);
      throw err;
    });
}

function login(req, res) {
  console.log("Login attempt with token:", req.body.token ? "present" : "missing");
  verify(req.body.token)
    .then((user) => getOrCreateUser(user))
    .then((user) => {
      // persist user in the session
      req.session.user = user;
      console.log("User logged in successfully:", user._id);
      res.send(user);
    })
    .catch((err) => {
      console.error("Login failed:", err);
      res.status(401).send({ err: "Login failed. Please try again." });
    });
}

function logout(req, res) {
  console.log("Logging out user:", req.session.user?._id);
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  if (req.user) {
    console.log("Current user:", req.user._id);
  }
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    console.log("Unauthorized access attempt");
    return res.status(401).send({ err: "not logged in" });
  }
  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
