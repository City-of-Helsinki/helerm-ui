# HELERM UI

This is a front-end project for Helsinki Electronic Records Management Classification System.

The project structure is based on create-react-app (https://create-react-app.dev/).

Looking for the backend code? It's in this repository: [helerm - Helsinki Electronic Records Management Classification System](https://github.com/City-of-Helsinki/helerm)

## Requirements

- Node v18 LTS (nvm use)

### Install from source

Make sure you have [pnpm](https://pnpm.io/installation) installed globally.

#### 1. Clone the project:

```bash
$ git clone https://github.com/City-of-Helsinki/helerm-ui.git
$ cd helerm-ui
```

#### 2. Install project dependencies

```bash
$ pnpm install              # Install project dependencies
```

#### 3. Add needed local environmental variables

Add these by copying the `.env.local.example` to `.env.local` and adding the values to the file.

### Running the app locally:

```bash
$ pnpm start    # Launch on local environment
```

### Running e2e tests:

```bash
$ pnpm test:e2e:start    # Runs e2e tests using playwright (using dev frontend if not set to local)
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

## License

The source code in this repository is licensed under the MIT License; see
[LICENSE](./LICENSE). The licenses of the third-party code included in the
production build are listed in `third-party-licenses.txt`, which is generated
during the build and served from the root of the deployed application. The
same information is emitted alongside it as `oss-licenses.json`, for license
audit tooling.

The MIT License covers this repository's own source code only. The following
files are **not** covered by it and remain with their respective rights
holders:

| Files                                                                                                   | Rights holder and terms                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/favicon.ico`, `public/helsinki-vaakuna-*.svg`, `src/components/NotFound/helsinki-vaakuna-*.svg` | City of Helsinki. The coat of arms of Helsinki, included to identify the service as the City's; not offered for reuse under the MIT License.                                                                  |
| `src/components/Header/Logo.jsx`                                                                        | City of Helsinki. The component draws the Helsinki logo, which is a trademark of the City; the logo is not offered for reuse under the MIT License.                                                           |
| `src/components/InfinityMenu/InfinityMenu.jsx`                                                          | Social Tables. Extracted and modified from [react-infinity-menu](https://github.com/socialtables/react-infinity-menu), licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).  |
| `src/styles/vendor/hel-components/`                                                                     | Adapted from [Bootstrap](https://github.com/twbs/bootstrap) 3 (Twitter, Inc.) and the [Bootswatch](https://github.com/thomaspark/bootswatch) Flatly theme (Thomas Park), both licensed under the MIT License. |

Two third-party components are also loaded at runtime from a public CDN. The
CDN copies are not part of the build output, so they do not appear in either
generated file:

- [oidc-client-ts](https://github.com/authts/oidc-client-ts) (Apache-2.0),
  loaded by [silent_renew.html](./public/silent_renew.html) from cdnjs with a
  subresource integrity hash. The copy bundled into the application through
  `hds-react` is listed in the generated files as usual.
- The [Lato](https://fonts.google.com/specimen/Lato) typeface (SIL Open Font
  License 1.1), loaded from Google Fonts by [index.html](./index.html) and
  [\_bootswatch-flatly.scss](./src/styles/vendor/hel-components/_bootswatch-flatly.scss).

Neither is redistributed by this repository or by its build output.
