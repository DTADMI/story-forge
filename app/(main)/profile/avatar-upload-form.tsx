"use client";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";

export function AvatarUploadForm({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Upload failed");
      }

      return response.json().catch(() => null);
    },
    onSuccess: () => {
      toast({ title: "Avatar updated." });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: getErrorMessage(error, "Upload failed"),
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadMutation.mutate(file);
        }}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="inline-flex items-center gap-1.5 rounded-md border border-fg/20 px-3 py-1.5 text-xs hover:bg-fg/5 disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" />
        {uploadMutation.isPending ? "Uploading..." : "Change Avatar"}
      </button>
    </>
  );
}
