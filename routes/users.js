const User = require("./models/user");
const Message = require("./models/message");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function (req, res, next) {

    try {
        const allUsers = await User.all();
        
        return req.json({users: allUsers});
    }
    catch (err){
        return next(err);
    }
    
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", async function(req, res, next) {
    try{
        const user = await User.get(req.params.username);

        return req.json({"user": user});
    }
    catch (err){
        return next(err);
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
route.get("/:username/to", async function(req, res, next) {
    try{
        const messages = await User.messagesTo(req.params.username);
        return res.json({"messages": messages});
    }
    catch (err){
        return next(err);
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
route.get("/:username/from", async function(req, res, next) {
    try {
        const messages = await User.messagesFrom(req.params.username);
        return res.json({"messages": messages});
    }
    catch (err) {
        return next(err);
    }
});