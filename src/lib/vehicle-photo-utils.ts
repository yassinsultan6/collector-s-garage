export function mergePhotoUrls(existingPhotos: string, nextPhotoUrls: string | string[]) {
  const urls = new Set<string>();

  const addUrls = (value?: string | null) => {
    if (!value) return;
    value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => urls.add(item));
  };

  addUrls(existingPhotos);
  addUrls(Array.isArray(nextPhotoUrls) ? nextPhotoUrls.join("\n") : nextPhotoUrls);

  return Array.from(urls).join("\n");
}

export function splitPhotoUrls(photos?: string | null) {
  if (!photos) return [];

  return photos
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
