[![Build status](https://travis-ci.org/City-of-Helsinki/helerm-ui.svg?branch=master)](https://travis-ci.org/City-of-Helsinki/helerm-ui)
[![codecov](https://codecov.io/gh/City-of-Helsinki/helerm-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/City-of-Helsinki/helerm-ui)

# HELERM UI

This is a front-end project for Helsinki Electronic Records Management Classification System.

The project structure is based on create-react-app (https://create-react-app.dev/).

Looking for the backend code? It's in this repository: [helerm - Helsinki Electronic Records Management Classification System](https://github.com/City-of-Helsinki/helerm)

## Requirements
* node `^14.15.1`
* npm `^6.14.8`

### Install from source

Make sure you have [Yarn](https://yarnpkg.com/en/docs/install) installed globally.

#### 1. Clone the project:

```bash
$ git clone https://github.com/City-of-Helsinki/helerm-ui.git
$ cd helerm-ui
```

#### 2. Install depencies:

```bash
$ yarn              # Install project dependencies
$ yarn start:dev    # Launch on local environment
```

#### 3. Add needed environmental variables
Add these by copying the `.env.example` to `.env` and adding the values to the file, or directly through process.env.

You will need to have the CLIENT_* and JWT_TOKEN parameters for the Helsinki Tunnistamo, or **run your own https://github.com/City-of-Helsinki/tunnistamo instance**.

#### 4. Navigate to [http://localhost:3000](http://localhost:3000)
