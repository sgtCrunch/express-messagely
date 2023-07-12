
const User = require("./models/user");
const SECRET_KEY = require("./config").SECRET_KEY;



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
    try {
      
      if (User.authenticate(req.body.username, req.body.password)) {
          let token = jwt.sign({ username }, SECRET_KEY);
          User.updateLoginTimestamp(username);
          return res.json({ token });
      }
      
    } catch (err) {
      return next(err);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
    try {
        
        const user = User.register(req.body);
        let token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({ token });

    } catch (err) {
        return next(err);
    }
});