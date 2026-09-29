# StockBot

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.27 and was built for Node.js v22.

## Start the server

To start the local server, run:

```
node --env-file=.env src/server/index.js
```

The development server stores secrets like the DB config, API URLs, and API keys in the .env file. For a production application, those should be stored in AWS Secrets Manager (or similar).

## Start the client

To start the local client, run:

```bash
ng serve --configuration=development
```

You can omit the `configuration` argument for local development.

Once the client is running, open your browser and navigate to `http://localhost:4200/`.

## Building

To build the project run:

```bash
ng build
```

This will compile the project and store the build artifacts in the `dist/` directory. By default, the production build optimizes the application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Generate Private Keys:

```
openssl genpkey -algorithm RSA -out private-access_key.pem -pkeyopt rsa_keygen_bits:2048
openssl genpkey -algorithm RSA -out private-refresh_key.pem -pkeyopt rsa_keygen_bits:2048
```

## Extract Public Keys:

```
openssl rsa -in private-access_key.pem -pubout -out public-access_key.pem
openssl rsa -in private-refresh_key.pem -pubout -out public-refresh_key.pem
```
