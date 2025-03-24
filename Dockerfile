# ==========================================
FROM registry.access.redhat.com/ubi9/nodejs-18 AS appbase
# ==========================================

WORKDIR /app

USER root
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

# Official image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL warn

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Yarn
ENV YARN_VERSION 1.22.19
RUN yarn policies set-version $YARN_VERSION

COPY package.json yarn.lock /app/
RUN chown -R default:root /app

# Install npm dependencies and build the bundle
USER default

RUN yarn cache clean --force
RUN yarn

COPY index.html vite.config.mjs eslint.config.mjs .eslintignore .prettierrc .env* /app/
COPY ./src /app/src
COPY ./public /app/public

# ==========================================
FROM appbase AS development
# ==========================================

WORKDIR /app

# Set NODE_ENV to development in the development container
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

ENV PORT 8080

CMD yarn start --port ${PORT}

EXPOSE 8080

# ==========================================
FROM appbase AS staticbuilder
# ==========================================

WORKDIR /app

ARG REACT_APP_API_URL
ARG REACT_APP_API_VERSION
ARG REACT_APP_FACETED_SEARCH_LENGTH
ARG REACT_APP_FEEDBACK_URL
ARG REACT_APP_GIT_VERSION
ARG REACT_APP_OIDC_DEBUG
ARG REACT_APP_OIDC_AUTHORITY
ARG REACT_APP_OIDC_CLIENT_ID
ARG REACT_APP_OIDC_API_TOKEN_AUTH_AUDIENCE
ARG REACT_APP_OIDC_SCOPE
ARG REACT_APP_OIDC_TOKEN_URL
ARG REACT_APP_OIDC_RESPONSE_TYPE
ARG REACT_APP_RESULTS_PER_PAGE
ARG REACT_APP_SEARCH_PAGE_SIZE
ARG REACT_APP_SENTRY_DSN
ARG REACT_APP_SENTRY_REPORT_DIALOG
ARG REACT_APP_SITE_THEME
ARG REACT_APP_SITE_TITLE
ARG REACT_APP_STORAGE_PREFIX
ARG REACT_APP_MATOMO_DOMAINS
ARG REACT_APP_MATOMO_COOKIE_DOMAIN
ARG REACT_APP_MATOMO_SRC_URL
ARG REACT_APP_MATOMO_URL_BASE
ARG REACT_APP_MATOMO_SITE_ID
ARG REACT_APP_MATOMO_ENABLED

RUN yarn build
RUN yarn compress

# =============================
FROM registry.access.redhat.com/ubi9/nginx-120 AS production
# =============================

USER root

RUN chgrp -R 0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html

# Copy static build
COPY --from=staticbuilder /app/build /usr/share/nginx/html

# Copy nginx config
COPY .prod/nginx.conf /etc/nginx/nginx.conf

USER 1001

CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]

EXPOSE 8080
