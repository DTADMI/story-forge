"use client";

import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Hook to upload a file to Supabase Storage.
 * Returns { upload, uploading, error, url }
 */
export function useStorageUpload(bucket: string) {
  const supabase = createBrowserClient();

  const upload = async (file: File, path?: string): Promise<string | null> => {
    const filePath = path ?? `${Date.now()}-${file.name}`;
    const { error, data } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  return { upload };
}
