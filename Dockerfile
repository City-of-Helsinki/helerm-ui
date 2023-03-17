# ==========================================
FROM helsinkitest/node:16-slim as deployable
# ==========================================
# Hardcode $HOME to /app, as yarn will need to put some stray files inside $HOME
# In Openshift $HOME would be / by default
ENV HOME /app

COPY ./.env .
COPY ./package.json .
COPY ./yarn.lock .
COPY ./src ./src
COPY ./server ./server
COPY ./public ./public
COPY ./.eslintrc.json .
COPY ./.prettierrc .

# Official image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL warn

EXPOSE ${PORT}
# Yarn
ENV YARN_VERSION 1.22.19
RUN yarn policies set-version $YARN_VERSION
RUN bash /tools/apt-install.sh build-essential

# Install npm dependencies and build the bundle
ENV PATH /app/node_modules/.bin:$PATH
RUN yarn config set network-timeout 300000
RUN yarn cache clean --force
RUN yarn
RUN chgrp 0 .yarn && chmod g+w .yarn
RUN yarn build
# Allow minimal writes to get the frontend server running

RUN bash /tools/apt-cleanup.sh build-essential

# Run the frontend server using arbitrary user to simulate
# Openshift when running using fe. Docker. Under actual
# Openshift, the user will be random
USER 158435:0
CMD [ "yarn", "start:docker"]
