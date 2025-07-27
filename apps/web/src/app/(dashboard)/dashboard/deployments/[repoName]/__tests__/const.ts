export const DEPLOYED_APP = "my-app";
export const DEPLOYMENT_SSE_URL = new URL(`/api/sse-proxy/deployments/logs/${DEPLOYED_APP}`, "https://localweb.younesfakallah.com").toString();
