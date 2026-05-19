# ============================================================
# STAGE 1: Build the Static Assets
# ============================================================
FROM helsinki.azurecr.io/ubi9/nodejs-22-pnpm-builder-base AS appbase

# 1. Copy only necessary files for build
COPY --chown=default:root package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=default:root ./scripts ./scripts
COPY --chown=default:root ./public ./public
COPY --chown=default:root index.html vite.config.mjs eslint.config.mjs .prettierrc .env ./
COPY --chown=default:root ./src ./src

# 2. Run the install and update-runtime-env script
# corepack in the base image will automatically use the version of pnpm
# defined in your package.json 'packageManager' field if present.
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm store prune
RUN pnpm update-runtime-env

# ============================================================
# STAGE 2: Development
# ============================================================
FROM appbase AS development

WORKDIR /app

# Set NODE_ENV to development in the development container
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

EXPOSE 8080

CMD pnpm exec vite --port 8080

# ============================================================
# STAGE 3: Static builder for production
# ============================================================
FROM appbase AS staticbuilder

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
ARG REACT_APP_SENTRY_ENVIRONMENT
ARG REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS
ARG REACT_APP_SENTRY_TRACES_SAMPLE_RATE
ARG REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
ARG REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
ARG REACT_APP_SENTRY_RELEASE
ARG REACT_APP_SITE_THEME
ARG REACT_APP_SITE_TITLE
ARG REACT_APP_STORAGE_PREFIX
ARG REACT_APP_MATOMO_DOMAINS
ARG REACT_APP_MATOMO_COOKIE_DOMAIN
ARG REACT_APP_MATOMO_SRC_URL
ARG REACT_APP_MATOMO_URL_BASE
ARG REACT_APP_MATOMO_SITE_ID
ARG REACT_APP_MATOMO_ENABLED

ENV REACT_APP_RELEASE=${REACT_APP_SENTRY_RELEASE:-""}

RUN pnpm build

# ============================================================
# STAGE 4: Production Runtime
# ============================================================
FROM helsinki.azurecr.io/ubi9/nginx-126-spa-standard AS production

ARG REACT_APP_SENTRY_RELEASE
ENV APP_RELEASE=${REACT_APP_SENTRY_RELEASE:-""}
# 1. Copy the compiled assets
COPY --from=staticbuilder /app/build /usr/share/nginx/html

# 2. Setup Runtime Env Injection
# env.sh is provided by the base image
WORKDIR /usr/share/nginx/html
COPY .env .

# 3. Inject Versioning for the /readiness endpoint from package.json using base image
COPY package.json .

# - env.sh      (Inherited from base image at /usr/share/nginx/html/env.sh)
# - USER 1001   (Inherited from base image)
# - EXPOSE 8080 (Inherited from base image)
# - ENTRYPOINT/CMD (Inherited from base image)
