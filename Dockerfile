# ==========================================
FROM registry.access.redhat.com/ubi8/nodejs-16 AS appbase
# ==========================================

WORKDIR /app

USER root
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

# Official image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL warn

# Yarn
ENV YARN_VERSION 1.22.19
RUN yarn policies set-version $YARN_VERSION

# ==========================================
# Hardcode $HOME to /app, as yarn will need to put some stray files inside $HOME
# In Openshift $HOME would be / by default
# ENV HOME /app

COPY package.json yarn.lock /app/
RUN chown -R default:root /app

# Install npm dependencies and build the bundle
# ENV PATH /app/node_modules/.bin:$PATH

# RUN yarn config set network-timeout 300000
RUN yarn cache clean --force
RUN yarn
# RUN chgrp 0 .yarn && chmod g+w .yarn

COPY .eslintrc.json .eslintignore .prettierrc .env /app/
COPY ./src /app/src
COPY ./server /app/server
COPY ./public /app/public

RUN yarn build

USER default

ARG PORT
EXPOSE ${PORT}

# RUN bash /tools/apt-install.sh build-essential

# Allow minimal writes to get the frontend server running

# RUN bash /tools/apt-cleanup.sh build-essential

# Run the frontend server using arbitrary user to simulate
# Openshift when running using fe. Docker. Under actual
# Openshift, the user will be random
USER 158435:0
CMD [ "yarn", "start:docker"]
