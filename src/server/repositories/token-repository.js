const { uuidToBinary } = require("../utils/utils");

class TokenRepository {
  // Member Fields

  mysqlService;

  // Constructors

  constructor(mysqlService) {
    this.mysqlService = mysqlService;
  }

  // Member Functions

  /**
   * Blacklists a refreshToken in the DB and returns 1
   * @param {string} id - The token ID
   * @returns 1
   */
  createToken = (id) =>
    this.mysqlService.update({
      sql: "insert ignore into bl_tokens (id) values (?)",
      values: [uuidToBinary(id)],
    });

  /**
   * Returns the DB token for id, otherwise null if not found
   * @param {string} id - The token ID
   * @returns The token object or null
   */
  async findTokenById(id) {
    const [result] = await this.mysqlService.query({
      sql: "select * from bl_tokens where id = ?",
      values: [uuidToBinary(id)],
    });

    return result[0] ?? null;
  }
}

module.exports = { TokenRepository };
