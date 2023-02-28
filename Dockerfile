# ==========================================
FROM helsinkitest/node:14-slim as deployable
# ==========================================
# Hardcode $HOME to /app, as yarn will need to put some stray files inside $HOME
# In Openshift $HOME would be / by default
ENV HOME /app
# Most files from source tree are needed at runtime
COPY  . .

# Official image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL warn

EXPOSE ${PORT}
# Yarn
ENV YARN_VERSION 1.19.1
RUN yarn policies set-version $YARN_VERSION
RUN bash /tools/apt-install.sh build-essential

# Install npm dependencies and build the bundle
ENV PATH /app/node_modules/.bin:$PATH
RUN yarn config set network-timeout 300000
RUN yarn
RUN chgrp 0 .yarn && chmod g+w .yarn
RUN yarn cache clean --force && yarn build
# Allow minimal writes to get the frontend server running

RUN bash /tools/apt-cleanup.sh build-essential

# Run the frontend server using arbitrary user to simulate
# Openshift when running using fe. Docker. Under actual
# Openshift, the user will be random
USER 158435:0
CMD [ "yarn", "start:docker"]
