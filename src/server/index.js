const { AuthService } = require("./services/auth.service");
const { MysqlService } = require("./services/mysql.service");
const { OpenAPIBackend } = require("openapi-backend");
const { StocksService } = require("./services/stocks.service");
const { TokenRepository } = require("./repositories/token-repository");
const { UserRepository } = require("./repositories/user-repository");
const { ValidationService } = require("./services/validation.service");
const config = require("./config");
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

// Dependencies
const mysqlService = new MysqlService();
const userRepository = new UserRepository(mysqlService);
const tokenRepository = new TokenRepository(mysqlService);
const validationService = new ValidationService();
const authService = new AuthService(
  userRepository,
  tokenRepository,
  validationService,
);
const stocksService = new StocksService();

// Middleware
const handleError = (err, req, res) => {
  console.error("Error:", err);

  err.status ||= 500;

  if (err.message) res.status(err.status).send(err.message);
  else res.sendStatus(err.status);
};

const handleRequest = async (req, res, cb) => {
  try {
    // Never log /auth requests!
    !req.url.startsWith("/api/auth/") &&
      console.log({ url: req.url, body: req.body });

    await cb();
  } catch (err) {
    handleError(err, req, res);
  }
};

const handleAuth = (req, res) =>
  authService.verifyToken(req.get("authorization"));

// API
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth/refresh",
  maxAge: 60 * 60 * 1000, // 1 hour
};

const api = new OpenAPIBackend({
  definition: path.join(__dirname, "/api-doc.yaml"),
});

api.init();
api.register({
  // validationFail: (c, req, res) => res.status(400).send(c.validation.errors),
  logIn: async (c, req, res) =>
    handleRequest(req, res, async () => {
      const result = await authService.logIn(req.body);

      if (result) {
        // Send refreshToken cookie and omit it from response body
        res.cookie("refreshToken", result.refreshToken, cookieOptions);

        return res.send({
          ...result,
          refreshToken: undefined,
        });
      }

      res.sendStatus(401);
    }),
  register: (c, req, res) =>
    handleRequest(req, res, async () => {
      await authService.register(req.body);

      res.sendStatus(201);
    }),
  refresh: (c, req, res) =>
    handleRequest(req, res, async () => {
      const result = await authService.refresh(req.cookies.refreshToken);

      if (result) {
        // Send refreshToken cookie and omit it from response body
        res.cookie("refreshToken", result.refreshToken, cookieOptions);

        return res.send({
          ...result,
          refreshToken: undefined,
        });
      }

      res.sendStatus(401);
    }),
  logOut: (c, req, res) =>
    handleRequest(req, res, async () => {
      await authService.logOut(req.get("authorization"));

      // Clear client's refreshToken cookie
      res.clearCookie("refreshToken", {
        ...cookieOptions,
        maxAge: undefined,
      });
      res.sendStatus(204);
    }),
  validateUser: (c, req, res) =>
    handleRequest(req, res, () => {
      const result = validationService.validateUser(req.query.id);

      res.send(result);
    }),
  getQuote: (c, req, res) =>
    handleRequest(req, res, async () => {
      handleAuth(req, res);

      const result = await stocksService.getQuote(req.query.symbol);

      res.send(result);
    }),
  notFound: (c, req, res) => res.sendStatus(404),
});

const app = express();

app.use(
  cors({
    origin: config.host,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", config.host);
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  next();
});

app.use((req, res) => api.handleRequest(req, req, res));

// Destructors
const cleanup = () => {
  mysqlService.destroy();
};

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

// Entry point
app.listen(config.port, () =>
  console.log(`Server listening on port ${config.port}...`),
);
