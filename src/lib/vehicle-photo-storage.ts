import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const bucketName = process.env.SUPABASE_VEHICLE_PHOTOS_BUCKET || "vehicle-photos";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getStorageClient() {
  const key = serviceRoleKey || anonKey;
  if (!supabaseUrl || !key) return null;

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function sanitizeFileName(fileName: string) {
  const baseName = (fileName || "vehicle-photo")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "") || "vehicle-photo";

  const extension = path.extname(baseName) || ".jpg";
  const stem = path.basename(baseName, extension);

  return `${stem || "vehicle-photo"}${extension}`;
}

export function buildVehiclePhotoStorageTarget(fileName: string) {
  const safeName = sanitizeFileName(fileName);
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "vehicle-photos");
  const filePath = path.join(uploadDir, uniqueName);
  const publicUrl = `/uploads/vehicle-photos/${uniqueName}`;

  return {
    filePath,
    publicUrl,
  };
}

async function storePhotoLocally(file: File, target: ReturnType<typeof buildVehiclePhotoStorageTarget>) {
  await mkdir(path.dirname(target.filePath), { recursive: true });
  await writeFile(target.filePath, Buffer.from(await file.arrayBuffer()));
  return target.publicUrl;
}

export async function uploadVehiclePhoto(file: File) {
  const supabase = getStorageClient();
  if (supabase) {
    const safeName = sanitizeFileName(file.name);
    const pathName = `vehicles/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    try {
      const bucketResult = await supabase.storage.getBucket(bucketName);
      if (bucketResult.error?.message?.toLowerCase().includes("not found")) {
        const createResult = await supabase.storage.createBucket(bucketName, { public: true });
        if (createResult.error) {
          throw new Error(createResult.error.message);
        }
      }

      const { error } = await supabase.storage.from(bucketName).upload(pathName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

      if (!error) {
        const publicUrl = supabase.storage.from(bucketName).getPublicUrl(pathName);
        if (publicUrl.data.publicUrl) {
          return publicUrl.data.publicUrl;
        }
      }
    } catch (error) {
      console.warn("Supabase photo upload failed, falling back to local storage", error);
    }
  }

  try {
    return await storePhotoLocally(file, buildVehiclePhotoStorageTarget(file.name));
  } catch (error) {
    console.error("Local photo storage failed", error);
    return null;
  }
}
