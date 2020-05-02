# @todo Resolve security warning when building image on Windows:
#   SECURITY WARNING: You are building a Docker image fromWindows against
#   a non-Windows Docker host. All files and directories added to build
#   context will have '-rwxr-xr-x' permissions. It is recommended to double
#   check and reset permissions for sensitive # files and directories.
FROM node:12-alpine

WORKDIR /data
COPY . /data

RUN yarn install \
  && yarn build \
  # Clean up source code
  && rm -r /data/src/ \
  # Clean up dependencies
  && yarn install --production --ignore-scripts --prefer-offline

EXPOSE 3000
CMD yarn start