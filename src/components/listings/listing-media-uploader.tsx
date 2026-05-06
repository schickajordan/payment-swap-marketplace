"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { registerListingMediaAsset } from "@/app/seller/listings/media-actions";
import { createClientSupabaseClient } from "@/lib/supabase/client";

function sanitizeFilename(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
  return base.length > 0 ? base : "file";
}

type ListingMediaUploaderProps = {
  listingId: string;
};

export function ListingMediaUploader({ listingId }: ListingMediaUploaderProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const supabase = useMemo(() => createClientSupabaseClient(), []);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || busy) {
      return;
    }

    setBusy(true);
    setStatus(null);

    try {
      for (const file of Array.from(files)) {
        const id = crypto.randomUUID();
        const path = `${listingId}/${id}-${sanitizeFilename(file.name)}`;
        const { error: upErr } = await supabase.storage
          .from("listing-media")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (upErr) {
          throw new Error(upErr.message);
        }

        const fd = new FormData();
        fd.set("listingId", listingId);
        fd.set("storagePath", path);
        fd.set("mime", file.type || "");

        const result = await registerListingMediaAsset(fd);
        if (!result.ok) {
          throw new Error(result.message);
        }
      }

      setStatus("Upload complete.");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col gap-2 rounded-lg border border-dashed border-white/25 bg-[#091c3d]/40 p-4 text-center text-sm text-slate-300 hover:border-gold/50 hover:bg-[#091c3d]/60">
        <input
          type="file"
          accept="image/*,video/mp4,video/webm"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => void uploadFiles(e.target.files)}
        />
        <span className="font-semibold text-white">
          Drop files here or browse (images / MP4)
        </span>
        <span className="text-xs text-slate-500">Recommended: JPG/PNG/WebP; videos MP4/WebM.</span>
      </label>

      {busy ? <p className="text-sm text-gold">Uploading...</p> : null}
      {status ? (
        <p className={`text-sm ${status === "Upload complete." ? "text-emerald-200" : "text-red-200"}`}>
          {status}
        </p>
      ) : null}
    </div>
  );
}
