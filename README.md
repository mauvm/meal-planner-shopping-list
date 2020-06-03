# Meal Planner: Shopping List Service

> API for managing shopping list items

This TypeScript service is part of the [Meal Planner project](https://github.com/users/mauvm/projects/1).

This service requires an [EventStore](https://eventstore.com/) instance for persistance.

## Local Development

```bash
yarn install

# See https://github.com/mauvm/meal-planner-infrastructure
kubectl port-forward service/event-store-service 1113:1113

yarn dev
yarn test:dev
```

## Deploy to Production

```bash
# Configure Docker CLI
eval $(minikube docker-env) # Or "minikube docker-env | Invoke-Expression" on Windows

# Build Docker image
docker build -t shopping-list-service .

# Deploy via infrastructure repository
```

### Github Actions

For Docker image builds with Github Actions you must configure the following secrets:

- `DOCKER_HOST`: domain name for custom registry, leave blank to use Docker Hub
- `DOCKER_USERNAME`: username for registry authentication
- `DOCKER_PASSWORD`: password for registry authentication
- `DOCKER_REPOSITORY`: the repository/user and image name, for example: `meal-planner/shopping-list-service`
