import { getDocker } from "@/lib/remote-docker";

export async function deleteAppServiceByName(applicationName: string) {
  const docker = await getDocker();
  const appsServices = await docker.listServices({ filters: { label: ["resource=application"] } });
  const appService = appsServices.find(service => service.Spec?.Name === applicationName);
  return await appService?.remove();
}
