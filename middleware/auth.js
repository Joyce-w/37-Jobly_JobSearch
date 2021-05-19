"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    console.log(res.locals.user)
    //checks to see if admin is in the payload
    if (res.locals.user) {
      const {isAdmin } = res.locals.user;
      if (isAdmin === true ) {
        return next()
      }
    }
    throw new UnauthorizedError();

  } catch (err) {
    return next(err);
  }
}

/** Middleware to authenticate correct user or admin   
 * Must be user and a user with a username match the params or an admin to access.
*/
function ensureValidUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.username === req.params.username || user.isAdmin))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  authenticateJWT,
  ensureAdmin,
  ensureValidUserOrAdmin
};
