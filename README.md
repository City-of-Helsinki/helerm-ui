# HELERM UI

This is a front-end project for Helsinki Electronic Records Management Classification System.

The project structure is based on create-react-app (https://create-react-app.dev/).

Looking for the backend code? It's in this repository: [helerm - Helsinki Electronic Records Management Classification System](https://github.com/City-of-Helsinki/helerm)

## Requirements
* Node v18 LTS (nvm use)

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

You will need to have the CLIENT_* and JWT_TOKEN parameters for the Helsinki Tunnistamo, or **run your own https://github.com/City-of-Helsinki/tunnistamo instance**.

### Running the app locally:

```bash
$ yarn start    # Launch on local environment
```
Navigate to [http://localhost:3000](http://localhost:3000)

### Running the app in Docker

```bash
$ docker compose up --build # Launches the containerized version of the application
```
Navigate to [http://localhost:3000](http://localhost:3000)

### Running production version with Docker

```bash
$ DOCKER_TARGET=production docker compose build
```

```bash
$ docker compose up -d
```
Navigate to [http://localhost:3000](http://localhost:3000)

## Commit message format

New commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/)
specification, and line length is limited to 72 characters.

[commitlint](https://github.com/conventional-changelog/commitlint) checks every new commit for the correct format.

## Using local Tunnistamo instance for development with docker

### Set tunnistamo hostname

Add the following line to your hosts file (`/etc/hosts` on mac and linux):

    127.0.0.1 tunnistamo-backend

### Create a new OAuth app on GitHub

Go to https://github.com/settings/developers/ and add a new app with the following settings:

- Application name: can be anything, e.g. local tunnistamo
- Homepage URL: http://tunnistamo-backend:8000
- Authorization callback URL: http://tunnistamo-backend:8000/accounts/github/login/callback/

Save. You'll need the created **Client ID** and **Client Secret** for configuring tunnistamo in the next step.

### Install local tunnistamo

Clone https://github.com/City-of-Helsinki/tunnistamo/.

Follow the instructions for setting up tunnistamo locally. Before running `docker compose up` set the following settings in tunnistamo roots `docker-compose.env.yaml`:

- SOCIAL_AUTH_GITHUB_KEY: **Client ID** from the GitHub OAuth app
- SOCIAL_AUTH_GITHUB_SECRET: **Client Secret** from the GitHub OAuth app

After you've got tunnistamo running locally, ssh to the tunnistamo docker container:

`docker compose exec django bash`

and execute the following four commands inside your docker container:

```bash
./manage.py add_oidc_client -n helerm-api -t "code" -u http://localhost:8080/pysocial/complete/tunnistamo/ -i https://api.hel.fi/auth/helerm -m github -s dev -c
./manage.py add_oidc_client -n helerm-api-admin -t "code" -u http://localhost:8080/pysocial/complete/tunnistamo/ -i helerm-api-admin -m github -s dev -c
./manage.py add_oidc_client -n helerm-ui -t "id_token token" -u "http://localhost:3000/callback" "http://localhost:3000/renew" -i helerm-ui -m github -s dev
./manage.py add_oidc_api -n helerm -d https://api.hel.fi/auth -s email,profile -c https://api.hel.fi/auth/helerm
./manage.py add_oidc_api_scope -an helerm -c https://api.hel.fi/auth/helerm -n "helerm" -d "Lorem ipsum"
./manage.py add_oidc_client_to_api_scope -asi https://api.hel.fi/auth/helerm -c helerm-api-admin
./manage.py add_oidc_client_to_api_scope -asi https://api.hel.fi/auth/helerm -c helerm-ui
```

### Configure Tunnistamo to frontend

Change the following configuration in `.env`

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_VERSION=v1

REACT_APP_OIDC_URL=http://tunnistamo-backend:8000
REACT_APP_OIDC_CLIENT_ID=helerm-ui
REACT_APP_OIDC_RESPONSE_TYPE="id_token token"
REACT_APP_OIDC_SCOPE="openid profile https://api.hel.fi/auth/helerm"
REACT_APP_OIDC_TOKEN_URL=http://tunnistamo-backend:8000/api-tokens/
REACT_APP_OIDC_LOGGING=true
```
