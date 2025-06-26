# Ticketing

A ticket marketplace built as event-driven microservices. Users list tickets for sale, reserve a ticket by creating an order, and pay for it with Stripe before the reservation expires.

Shared errors, middlewares and event types live in a separate package: [ticketing-common](https://github.com/klintonc/ticketing-common) (`@klintonc-org/ticketing-common`).

## Architecture

| Service | Responsibility | Storage |
| ------- | -------------- | ------- |
| `auth` | Sign up, sign in, sign out, current user (JWT in a cookie session) | MongoDB |
| `tickets` | Create, list, show and update tickets; locks a ticket while it is reserved | MongoDB |
| `orders` | Reserve a ticket, list and cancel orders | MongoDB |
| `expiration` | Cancels unpaid orders when the reservation window (1 minute) ends | Redis (Bull queue) |
| `payments` | Charges orders with Stripe | MongoDB |
| `client` | Next.js frontend (server-side rendering) | — |

Services talk to each other only through events on **NATS Streaming**:

```
tickets ──TicketCreated/TicketUpdated──▶ orders
orders  ──OrderCreated/OrderCancelled──▶ tickets, payments, expiration
expiration ──ExpirationComplete──▶ orders
payments ──PaymentCreated──▶ orders
```

Each service keeps its own copy of the data it needs, and events carry a `version` so updates are applied in order (optimistic concurrency).

## Tech stack

Node.js, TypeScript, Express, MongoDB (Mongoose), Redis + Bull, NATS Streaming, Next.js, Stripe, Docker, Kubernetes, Skaffold, ingress-nginx, Jest + Supertest, GitHub Actions.

## Getting started

Requirements: Docker with a local Kubernetes cluster (e.g. Docker Desktop), [ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/), [Skaffold](https://skaffold.dev/) and a [Stripe](https://stripe.com) account (test mode).

1. Create the secrets the services read:

   ```bash
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<any-random-string>
   kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<your-stripe-test-secret-key>
   ```

2. Put your Stripe **publishable** test key in `client/pages/orders/[orderId].jsx` (`stripeKey`).

3. Map the dev host to your machine by adding this line to `/etc/hosts`:

   ```
   127.0.0.1 ticketing-playground.dev
   ```

4. Build and run everything:

   ```bash
   skaffold dev
   ```

5. Open http://ticketing-playground.dev.

Skaffold builds the images listed in `skaffold.yaml`. Change the `klintondocker/*` image names there and in `infra/k8s/*-depl.yaml` if you use your own Docker Hub account.

## API

All routes go through the ingress at `/api/...`.

| Method | Route | Service |
| ------ | ----- | ------- |
| `POST` | `/api/users/signup`, `/api/users/signin`, `/api/users/signout` | auth |
| `GET` | `/api/users/currentuser` | auth |
| `GET` / `POST` | `/api/tickets` | tickets |
| `GET` / `PUT` | `/api/tickets/:id` | tickets |
| `GET` / `POST` | `/api/orders` | orders |
| `GET` / `DELETE` | `/api/orders/:orderId` | orders |
| `POST` | `/api/payments` | payments |

## Tests

Each service has Jest + Supertest tests using an in-memory MongoDB and a mocked NATS client:

```bash
cd orders   # or auth, tickets, payments
npm install
npm run test:ci
```

The payments test that creates a real charge needs your Stripe test secret key:

```bash
cd payments
STRIPE_KEY=sk_test_... npm run test:ci
```

## Deployment

GitHub Actions in `.github/workflows`:

- **tests-\*** run each service's tests on pull requests.
- **deploy-\*** build and push the service image to Docker Hub and restart its deployment on a DigitalOcean Kubernetes cluster when `main` changes.
- **deploy-manifests** applies `infra/k8s` and `infra/k8s-prod`.

They need the repository secrets `DOCKER_USERNAME`, `DOCKER_PASSWORD` and `DIGITALOCEAN_ACCESS_TOKEN`.

## Project structure

```
auth/ tickets/ orders/ payments/ expiration/   # Express services (src/, tests in __test__/)
client/                                        # Next.js app (pages/, components/, api/)
infra/
├── k8s/        # Deployments and services shared by every environment
├── k8s-dev/    # Ingress for local development
└── k8s-prod/   # Ingress for production
skaffold.yaml   # Local development workflow
```
