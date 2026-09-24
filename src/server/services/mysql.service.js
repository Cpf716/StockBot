// Cannot invoke changeUser() on the sync mysql2 driver; explicitly wrap the async driver
const mysql = require("mysql2");

class MysqlService {
  // Member Fields

  pool;

  // Constructors

  constructor() {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      idleTimeout: 10000,
      timezone: "Z",
    });
  }

  /**
   * Gracefully closes the connection pool
   */
  async destroy() {
    let err;

    if ((err = await new Promise((resolve) => this.pool.end(resolve)))) {
      console.error(err);
    }
  }

  // Member Functions

  /**
   * Returns a connection from the pool
   * @param {string | undefined} database
   * @returns The connection object
   */
  async getConnection(database) {
    let [err, conn] = await new Promise((resolve) =>
      this.pool.getConnection((err, conn) => resolve([err, conn])),
    );

    if (err) throw err;

    // Dynamically "use" database
    if (
      (err = await new Promise((resolve) =>
        conn.changeUser({ database: database || "rts" }, resolve),
      ))
    )
      throw err;

    return conn;
  }

  /**
   * Queries the DB and returns the results
   * @param {{ connection?: Connection, sql: string, values?: any[] }} options - The query options
   * @returns The results
   */
  async query(options) {
    let connection = options.connection;

    // Fetch connection from the pool, if required
    if (!connection) connection = await this.getConnection();

    const result = await new Promise((resolve, reject) =>
      connection.query(options.sql, options.values, (err, results, fields) => {
        if (err) return reject(err);

        resolve([results, fields]);
      }),
    );

    // Release pooled connection, if none was provided
    if (!options.connection) connection.release((err) => console.error(err));

    return result;
  }

  /**
   * Executes an update against the DB and returns the number of rows updated
   * @param {{ connection?: Connection, sql: string, values?: any[] }} options - The update options
   * @returns The number of rows updated
   */
  async update(options) {
    let connection = options.connection;

    // Fetch connection from the pool, if required
    if (!connection) connection = await this.getConnection();

    const result = await new Promise((resolve, reject) =>
      connection.execute(options.sql, options.values, (err, rows) => {
        if (err) return reject(err);

        resolve(rows);
      }),
    );

    // Release pooled connection, if none was provided
    if (!options.connection) connection.release((err) => console.error(err));

    return result;
  }
}

module.exports = { MysqlService };
