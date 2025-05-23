import createJiti from "jiti";
import { fileURLToPath } from "node:url";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./src/env");
function nextConfig() {
  return {
    output: "standalone",
    transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
    experimental: {
      nodeMiddleware: true,
      dynamicIO: true,
      useCache: true,
      reactCompiler: true,
      ppr: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          pathname: "/**",
          port: "9000",
        },
      ],
    },
    webpack: (webpackConfig, { webpack }) => {
      webpackConfig.plugins.push(
      // Remove node: from import specifiers, because Next.js does not yet support node: scheme
      // https://github.com/vercel/next.js/issues/28774
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );

      return webpackConfig;
    },
  };
}

export default nextConfig;
