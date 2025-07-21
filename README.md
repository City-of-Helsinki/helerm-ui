# HELERM UI

This is a front-end project for Helsinki Electronic Records Management Classification System.

The project structure is based on create-react-app (https://create-react-app.dev/).

Looking for the backend code? It's in this repository: [helerm - Helsinki Electronic Records Management Classification System](https://github.com/City-of-Helsinki/helerm)

## Requirements

- Node v18 LTS (nvm use)

### Install from source

Make sure you have [Yarn](https://yarnpkg.com/en/docs/install) installed globally.

#### 1. Clone the project:

```bash
$ git clone https://github.com/City-of-Helsinki/helerm-ui.git
$ cd helerm-ui
```

#### 2. Install project dependencies

```bash
$ yarn              # Install project dependencies
```

#### 3. Add needed environmental variables

Add these by copying the `.env.example` to `.env` and adding the values to the file, or directly through import.meta.env.

### Running the app locally:

```bash
$ yarn start    # Launch on local environment
```

### Running e2e tests:

```bash
$ yarn test:e2e:start    # Runs e2e tests using playwright (using dev frontend if not set to local)
```


Navigate to [http://localhost:3000](http://localhost:3000)

### Running the app in Docker

```bash
$ docker compose build
$ docker compose up    # Launches the containerized version of the application
```

Navigate to [http://localhost:3000](http://localhost:3000)

### Running production version with Docker

```bash
$ DOCKER_TARGET=production docker compose build
```

```bash
$ docker compose up
```

Navigate to [http://localhost:3000](http://localhost:3000)

## Commit message format

New commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/)
specification, and line length is limited to 72 characters.

[commitlint](https://github.com/conventional-changelog/commitlint) checks every new commit for the correct format.

## Development with Helsinki-tunnistus

### Configure backend

Change the following configuration in `.env`

```
SOCIAL_AUTH_TUNNISTAMO_KEY=tiedonohjaus-django-admin-dev
SOCIAL_AUTH_TUNNISTAMO_SECRET=<ttiedonohjaus-django-admin-dev client secret>
SOCIAL_AUTH_TUNNISTAMO_OIDC_ENDPOINT=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus
OIDC_API_TOKEN_AUTH_AUDIENCE=tiedonohjaus-api-dev
OIDC_API_TOKEN_AUTH_ISSUER=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus
```

### Configure frontend

Change the following configuration in `.env`

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_VERSION=v1

REACT_APP_OIDC_AUTHORITY=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus
REACT_APP_OIDC_CLIENT_ID=tiedonohjaus-ui-dev
REACT_APP_OIDC_API_TOKEN_AUTH_AUDIENCE=tiedonohjaus-api-dev
REACT_APP_OIDC_SCOPE="openid profile"
REACT_APP_OIDC_TOKEN_URL=https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus/protocol/openid-connect/token
REACT_APP_OIDC_RESPONSE_TYPE="code"
```
