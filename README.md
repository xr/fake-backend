## fake backend
Fake backend for testing http request proxy

### Docker
- Image: https://hub.docker.com/r/liangular/fake-backend

**Cross-build and push new versions** (linux/amd64 + linux/arm64):
```bash
docker login
./docker-build-push.sh liangular
```
Optional: `VERSION=1.1.0 ./docker-build-push.sh liangular`
