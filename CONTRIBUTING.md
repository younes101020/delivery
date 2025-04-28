# Contributing Guide

Thank you for considering contributing to our project! This document provides
the main guidelines for contributing.

## Prerequisites

- NodeJS LTS
- Yarn

## Getting Started

1. Fork the project
2. Clone your fork
3. Create your branch: `git checkout -b your-branch-name`
4. Set up your development environment:

```bash
yarn install
# You can also choose to use a remote postgres database, in this case skip `yarn start db` command and make sure to provide your db credentials inside the .env file
yarn start db
yarn dev
```

## Development Process

- Make sure your changes respect the code standards
- Test your changes locally
- Commit your changes: git commit -m "fix: no more..." make sure to follow [this commit specs](https://www.conventionalcommits.org/en/v1.0.0/#specification)
- Push to your fork: git push origin your-branch-name
- Open a Pull Request

## Testing

```bash
yarn test
```

**Important note**: If you are using _WSL2_ for staging simulation, you need to
set `SSH_HOST` environment variable to your distro ip. You can find the IP
address of the WSL2 VM by running:

```bash
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
```
