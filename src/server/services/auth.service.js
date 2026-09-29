// To Do: Handle DB errors

const argon2 = require("argon2");
const config = require("../config");
const jwt = require("jsonwebtoken");

class AuthService {
  // Member Fields

  tokenRepository;
  userRepository;
  validationService;

  // Constructors

  constructor(userRepository, tokenRepository, validationService) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.validationService = validationService;
  }

  // Member Functions

  /**
   * Authenticates a user and returns an access token
   * @param {{ user: string; password: string }} userData
   * @returns The access token
   */
  async logIn(userData) {
    // Normalize user case
    userData.user = userData.user.toLowerCase();

    const user = await this.userRepository.findUserById(userData.user);

    // User not found; stop immediately
    if (!user) return null;

    // User has exceeded the max number of failed logins; block request until timeout expires
    if (user.login_failures >= config.maxFailedLogins) {
      const secondsElapsed = Math.floor(
        (Date.now() - user.login_at.getTime()) / 1000,
      );

      if (secondsElapsed < config.failedLoginTimeoutSeconds) {
        throw {
          status: 401,
          message: `You have been locked out due to too many failed login attempts. Please wait ${config.failedLoginTimeoutSeconds / 60} minutes and try again.`,
        };
      }
    }

    // Compare password to hash
    const match = await argon2.verify(
      user.password_hash.toString(),
      userData.password,
    );

    if (match) {
      const date = new Date();

      // Passwords match; reset failed login attempts
      await this.userRepository.resetFailedLogins(user.id, date);

      const iat = Math.floor(date.getTime() / 1000);

      // Generate token ID for blacklisting
      const jti = crypto.randomUUID();

      const payload = {
        sub: user.id,
        iat,
        jti,
      };

      const exp = iat + 5 * 60;

      // Sign auth tokens
      const accessToken = jwt.sign(
        {
          ...payload,
          exp,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );

      const refreshToken = jwt.sign(
        {
          ...payload,
          exp: iat + 60 * 60,
        },
        process.env.REFRESH_TOKEN_SECRET,
      );

      return {
        accessToken,
        refreshToken,
        iat,
        exp,
      };
    }

    // Passwords do not match; increment failed login attempts
    await this.userRepository.incrementFailedLogins(user.id);

    return null;
  }

  /**
   * Creates a new user in the DB
   * @param {{ user: string; password: string }} userData
   */
  async register(userData) {
    // Normalize user case
    userData.user = userData.user.toLowerCase();

    // User pattern is invalid; respond with 400 Bad Request
    if (!this.validationService.validateUser(userData.user))
      throw { status: 400 };

    // Respond with 409 Conflict, if existing user
    const user = await this.userRepository.findUserById(userData.user);

    if (user) {
      throw { status: 409, message: "User already exists. Please log in" };
    }

    // Hash password using HS256
    const passwordHash = await argon2.hash(userData.password);

    // Insert user and password hash into the DB
    await this.userRepository.createUser({ user: userData.user, passwordHash });
  }

  /**
   * Refreshes auth tokens and returns new ones
   * @param {string} refreshToken
   * @returns The new auth tokens
   */
  async refresh(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      // Check if token is blacklisted
      const token = await this.tokenRepository.findTokenById(decoded.jti);

      if (token) return null;

      // Blacklist refresh token
      await this.tokenRepository.createToken(decoded.jti);

      const iat = Math.floor(Date.now() / 1000);
      const jti = crypto.randomUUID();

      const payload = {
        ...decoded,
        iat,
        jti,
      };

      const exp = iat + 5 * 60;

      const accessToken = jwt.sign(
        {
          ...payload,
          exp,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );

      const refreshTokenObj = jwt.sign(
        {
          ...payload,
          exp: iat + 60 * 60,
        },
        process.env.REFRESH_TOKEN_SECRET,
      );

      return {
        accessToken,
        refreshToken: refreshTokenObj,
        iat,
        exp,
      };
    } catch (err) {
      throw { status: 401 };
    }
  }

  /**
   * Returns accessToken without the "Bearer " prefix
   * @param {string} accessToken
   * @returns The raw accessToken
   */
  removeBearerPrefix = (accessToken) => accessToken.split(" ").slice(-1)[0];

  /**
   * Verifies accessToken; throws { status: 401 }, if invalid
   * @param {string} accessToken
   */
  verifyToken(accessToken) {
    try {
      accessToken = this.removeBearerPrefix(accessToken);

      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw { status: 401 };
    }
  }

  /**
   * Blacklists the refresh token associated with accessToken and returns 1
   * @param {string} accessToken
   * @returns 1
   */
  logOut(accessToken) {
    try {
      accessToken = this.removeBearerPrefix(accessToken);

      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      return this.tokenRepository.createToken(decoded.jti);
    } catch (err) {
      throw { status: 401 };
    }
  }
}

module.exports = { AuthService };
