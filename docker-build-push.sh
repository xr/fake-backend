#!/usr/bin/env bash
set -e

# Docker Hub image: set DOCKER_HUB_USER or pass as first argument
DOCKER_HUB_USER="${1:-${DOCKER_HUB_USER}}"
if [ -z "$DOCKER_HUB_USER" ]; then
  echo "Usage: $0 <docker-hub-username>"
  echo "   or: DOCKER_HUB_USER=yourusername $0"
  exit 1
fi

IMAGE_NAME="fake-backend"
VERSION="${VERSION:-$(node -p "require('./package.json').version")}"
FULL_IMAGE="${DOCKER_HUB_USER}/${IMAGE_NAME}:${VERSION}"
LATEST_IMAGE="${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"

# Platforms: amd64 (Intel/AMD) and arm64 (Apple Silicon, many Linux)
PLATFORMS="linux/amd64,linux/arm64"

echo "Building and pushing ${FULL_IMAGE} (${PLATFORMS})"

# Ensure buildx builder exists and use it
if ! docker buildx inspect multiarch &>/dev/null; then
  docker buildx create --name multiarch --use
else
  docker buildx use multiarch
fi

docker buildx build \
  --platform "$PLATFORMS" \
  --tag "$FULL_IMAGE" \
  --tag "$LATEST_IMAGE" \
  --push \
  .

echo "Pushed: $FULL_IMAGE and $LATEST_IMAGE"
