"use client";

import React from "react";

import { DockerImagesPanel } from "./docker-images-panel";

export default function Sidebar() {
  return (
    <aside className="h-full min-h-0">
      <DockerImagesPanel />
    </aside>
  );
}
