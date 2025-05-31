import { getDeliveryWebInstanceConfiguration } from "@/app/(dashboard)/dashboard/settings/general/_lib/queries";

export async function GET() {
  const deliveryInstanceConfiguration = await getDeliveryWebInstanceConfiguration();
  return Response.json(deliveryInstanceConfiguration);
}
