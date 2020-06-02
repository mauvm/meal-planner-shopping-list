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
