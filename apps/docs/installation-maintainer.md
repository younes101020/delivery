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

**Important note**: If you are using *WSL2* for staging, you need to set the host of `apps/jobs/src/lib/ssh/client.ts` on line 32, to the IP address of the WSL2 VM. since the `host.docker.internal` is resolved to the Windows host and not the wsl instance. You can find the IP address of the WSL2 VM by running `ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1`.
