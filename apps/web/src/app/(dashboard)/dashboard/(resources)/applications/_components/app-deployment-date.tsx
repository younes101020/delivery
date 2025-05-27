"use client";

interface AppDeploymentDateProps {
  deployedAt: string;
}

export default function AppDeploymentDate({ deployedAt }: AppDeploymentDateProps) {
  return <dd className="text-xs">{deployedAt}</dd>;
}
