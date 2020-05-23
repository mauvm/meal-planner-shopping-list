# Meal Planner: Shopping List Service

> API for shopping lists

## Usage

```bash
yarn install
yarn dev

yarn test:dev
```

## Deploy

```bash
minikube docker-env | Invoke-Expression # On Windows
kubectl port-forward service/event-store-service 1113:1113
docker build -t shopping-list-service .
# Deploy via infrastructure/
```
