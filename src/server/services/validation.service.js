class ValidationService {
  /**
   * Returns true if user:
   *   1. Starts with an underscore, letter, or number
   *   2. Has at least three characters
   *   3. Includes only underscores, hythens, letters, and numbers
   * Otherwise, returns false
   * @param {string} user
   * @returns True if the token if valid, otherwise false
   */
  validateUser = (user) =>
    /^[0-9a-z_]*[0-9a-z_\.-]{2,}$/.test(user.toLowerCase());
}

module.exports = { ValidationService };
