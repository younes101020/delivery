export function getVersionFromImageName(imageName: string) {
  const tags = imageName.split(":")[1];
  const versionParts = tags.split("-")[0];
  return versionParts;
}

export function getImageDigest(fullImageName: string) {
  return fullImageName.split("@")[1];
}
