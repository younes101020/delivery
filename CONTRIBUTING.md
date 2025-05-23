# Contributing Guide

Thank you for considering contributing to our project! This document provides
the main guidelines for contributing.

## Prerequisites

- NodeJS LTS
- Pnpm

## Development Process

- Test your changes locally, make sure to colocate those with your source code
- Commit your changes: git commit -m "fix: no more..." make sure to follow [this commit specs](https://www.conventionalcommits.org/en/v1.0.0/#specification)
- Push to your fork: git push origin your-feature-name
- Open a Pull Request

## Testing

```bash
pnpm test
```

**Important note**: If you are using _WSL2_ for staging simulation, you need to
set `SSH_HOST` environment variable to your distro ip. You can find the IP
address of the WSL2 VM by running:

```bash
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
```
