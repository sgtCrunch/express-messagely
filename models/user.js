/** User class for message.ly */

const bcrypt = require("bcrypt");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
      const result = await db.query(
        `INSERT INTO users (
              username,
              password,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at)
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
        [username, password, first_name, last_name, phone]);

      return result.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

      const result = await db.query(
        `SELECT password FROM users WHERE username = $1`,
        [username]);

      const user = result.rows[0];

      if (user) {
        if (await bcrypt.compare(password, user.password) === true) {
          return true;
        }
      }

      throw new ExpressError("Invalid user/password", 400);

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username)
  { 

      const result = await db.query(
        `UPDATE users
          SET last_login_at = current_timestamp
          WHERE username = $1
          RETURNING username, first_name, last_name`,
        [username]);

      if (!result.rows[0]) {
        throw new ExpressError(`Invalid Username`, 404);
      }

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`);

    if (!result.rows[0]) {
      throw new ExpressError(`Invalid Username`, 404);
    }
    
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(
      `SELECT 
        username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`, [username]);
      
    if (!result.rows[0]) {
      throw new ExpressError(`Invalid Username`, 404);
    }

    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const messages = await db.query(`
        SELECT id, to_username, body, sent_at, read_at
        FROM messages
        WHERE from_username = $1`,
        [username]);

    if (!messages.rows[0]) {
      throw new ExpressError(`Invalid Username`, 404);
    }

    messages = messages.rows.map(async (message) => {
      message.to_user = await this.get(message.to_username);
      delete message.to_user.join_at;
      delete message.to_user.last_login_at;
      delete message.to_username;
    });

    return messages;

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const messages = await db.query(`
        SELECT id, from_username, body, sent_at, read_at
        FROM messages
        WHERE to_username = $1`,
        [username]);

    if (!messages.rows[0]) {
      throw new ExpressError(`Invalid Username`, 404);
    }

    messages = messages.rows.map(async (message) => {
      message.from_user = await this.get(message.from_username);
      delete message.from_user.join_at;
      delete message.from_user.last_login_at;
      delete message.from_username;
    });

    return messages;
  }
}


module.exports = User;