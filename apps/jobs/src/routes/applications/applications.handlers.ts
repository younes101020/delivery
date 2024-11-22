import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { applications } from "@/db/schema";
import sshClient from "@/lib/ssh";

import type { CreateRoute } from "./applications.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const application = c.req.valid("json");
  // TODO: move this ssh executation to bullmq job and replace ./ with the path to the cloned repo
  // After github app manifest creation do:

  /*
    const auth = createAppAuth({
    appId: 1,
    privateKey: "-----BEGIN PRIVATE KEY-----\n...", => will be in response of github app manifest creation
    clientId: "lv1.1234567890abcdef", => will be in response of github app manifest creation
    clientSecret: "1234567890abcdef12341234567890abcdef1234", => will be in response of github app manifest creation
  });

  // Retrieve installation access token
  const installationAuthentication = await auth({
    type: "installation",
    installationId: 123,
  });

  => CLONE solution: Replace TOKEN with the installationAuthentication: git clone https://x-access-token:TOKEN@github.com/owner/repo.git.
  */
  const ssh = await sshClient();
  const result = await ssh.execCommand(
    "ls",
    // `nixpacks build ./ --name ${application.name} -o /data/delivery/applications/${application.name}`
  );

  const [inserted] = await db
    .insert(applications)
    .values(application)
    .returning();

  const withSshOutput = Object.assign(inserted, result);

  return c.json(withSshOutput, HttpStatusCodes.OK);
};

// TODO: Add job to deploy application and stream logs
