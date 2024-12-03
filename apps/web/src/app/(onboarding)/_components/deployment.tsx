"use client";

import type { Installation } from "@/lib/github";

interface DeploymentProps {
  githubInstallationsWithRepos: Installation[];
}

export function Deployment({ githubInstallationsWithRepos }: DeploymentProps) {
  return (
    <div className="flex">
      <ul>
        {githubInstallationsWithRepos.map(({ githubAppId, githubInstallationName }) => (
          <li key={githubAppId}>{githubInstallationName}</li>
        ))}
      </ul>
      {/* TODO: add repositories based on selected installation */}
    </div>
  );
}
