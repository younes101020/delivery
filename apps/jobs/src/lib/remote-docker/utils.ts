import type Dockerode from "dockerode";

export async function getApplicationServiceByName(name: string, docker: Dockerode) {
  const services = await docker.listServices({ filters: { label: ["resource=application"] } });
  return services.find(service => service.Spec?.Name === name);
}
