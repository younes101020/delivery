export async function pullDockerImage(image: string) {
  const response = await fetch("/api/hub/pull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string" ? body.message : "Image pull failed.";
    throw new Error(message);
  }
}
