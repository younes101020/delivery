# Contributing Guide

Thank you for considering contributing to our project! This document provides
the main guidelines for contributing.

## Prerequisites

- Docker
- Docker Compose
- NodeJS LTS
- Yarn
- Unix-like operating system (macOS, Linux)

## Getting Started

1. Fork the project
2. Clone your fork
3. Create your branch: `git checkout -b your-branch-name`
4. Set up your development environment:

```bash
yarn install
yarn dev
```

## Development Process

- Make sure your changes respect the code standards
- Test your changes locally
- Commit your changes: git commit -m "Description of the change"
- Push to your fork: git push origin your-branch-name
- Open a Pull Request

## Testing

```bash
yarn ut:test
```

## Development experience script

These commands could be useful when you want to simulate a staging environment

```bash
# Deploy all services
yarn deploy
# Redeploy all services including the rebuild
yarn redeploy
# Or just redeploy a specific service (jobs, web)
yarn redeploy <service>
# Stop all services
yarn stop
# Restart all services
yarn restart
```

**Important note**: If you are using _WSL2_ for staging simulation, you need to set
`SSH_HOST` environment variable to your distro ip. You can find the IP address
of the WSL2 VM by running:
```bash
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
```