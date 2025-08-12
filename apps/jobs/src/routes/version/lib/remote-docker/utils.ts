export function getVersionFromImageRef(imageName: string) {
  const tags = imageName.split(":")[1];
  const versionParts = tags.split("-")[0];
  return versionParts;
}
