const { getMysqlTimestamp } = require("../utils/utils");

class UserRepository {
  // Member Fields

  mysqlService;

  // Constructors

  constructor(mysqlService) {
    this.mysqlService = mysqlService;
  }

  // Member Functions

  /**
   * Creates a new user in the DB and returns 1
   * @param {{ user: string; passwordHash: any }} userData - The user data
   * @returns 1
   */
  createUser = (userData) =>
    this.mysqlService.update({
      sql: "insert into users (id, password_hash) values (?, ?)",
      values: Object.values(userData),
    });

  /**
   * Returns the DB user for id, otherwise null if not found
   * @param {string} id - The user ID
   * @returns The user object or null
   */
  async findUserById(id) {
    const [result] = await this.mysqlService.query({
      sql: "select * from users where id = ?",
      values: [id],
    });

    return result[0] ?? null;
  }

  /**
   * Sets the login time and increments the number of failed logins for a DB user
   * @param {string} id - The user ID
   * @returns The number of rows updated
   */
  incrementFailedLogins = (id) =>
    this.mysqlService.update({
      sql: "update users set login_at = ?, login_failures = login_failures + 1 where id = ?",
      values: [getMysqlTimestamp(), id],
    });

  /**
   * Sets the login time and resets the number of failed logins for a DB user
   * @param {string} id - The user ID
   * @param {Date} loginAt - The login Date
   * @returns The number of rows updated
   */
  resetFailedLogins = (id, loginAt) =>
    this.mysqlService.update({
      sql: "update users set login_at = ?, login_failures = 0 where id = ?",
      values: [getMysqlTimestamp(loginAt), id],
    });
}

module.exports = { UserRepository };
