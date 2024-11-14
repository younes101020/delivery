# Get Started

<div align="center">
  <img src="https://github.com/user-attachments/assets/904f879b-1a7a-4f9c-8250-b595caf89dbb" alt="Delivery Logo">
</div>

**Description**: This a self-hostable Coolify, Vercel, Heroku alternative focusing on one single thing: deploying your applications as simply as possible, without any vendor lock-in.

- **Technology stack**: BullMQ, NextJS, Tailwind, PostgreSQL
- **Status**: 0.0

---

## Prerequisites

- Docker
- Docker Compose
- NodeJS LTS
- Yarn
- Unix-like operating system (macOS, Linux)

## Installation

First of all, you need to clone the repository:

```bash
git clone https://github.com/younes101020/delivery.git
cd delivery
```

### Launch development environment

```bash
yarn install
yarn dev
```

### Deploy production environment

```bash
yarn deploy
```

> **_Note:_** This will run the frontend and backend in containerized environment.

#### Development experience script

These commands could be useful when you want to simulate a staging environment

```bash
# Redeploy all services including the rebuild
yarn redeploy
# Or just redeploy a specific service (jobs, web)
yarn redeploy <service>
# Stop all services
yarn stop
# Restart all services
yarn restart
```
