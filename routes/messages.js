
const User = require("./models/user");
const Message = require("./models/message");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", async function (req, res, next) {

    try {
        const m = await Message.get(req.params.id);
        if (!req.user || (req.user.username != m.message.from_user.username
            && req.user.username != m.message.to_user.username)) {
            
            throw new ExpressError("Not Authorized", 401);
        }
        
        return res.json(m);
    }
    catch (err){
        return next(err);
    }
    
});



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async function (req, res, next) {
    
    try {
        req.body.from_username = req.user.username;
        const new_message = await Message.create(req.body);

        return res.json({message: new_message});
    }
    catch (err){
        return next(err);
    }
    
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async function (req, res, next) {

    try {
        const m = await Message.get(req.params.id);

        if(!req.user || m.message.to_user.username != req.user.username){
            throw new ExpressError("Not Authorized", 401);
        }

        const read_info = await Message.markRead(req.params.id); 
        
        return res.json({message: read_info});
    }
    catch (err){
        return next(err);
    }
    
});