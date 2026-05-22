"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

interface ImageUploadProps {
  entityType: "character" | "location";
  entityId: string;
  currentUrl?: string | null;
}

export function ImageUpload({ entityType, entityId, currentUrl }: ImageUploadProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Client-side EXIF stripping via canvas redraw
  function stripExif(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas toBlob failed"));
              return;
            }
            resolve(new File([blob], file.name, { type: "image/webp" }));
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image load failed"));
      };
      img.src = objectUrl;
    });
  }

  const uploadFile = useCallback(
    async (file: File) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Use JPEG, PNG, WebP, or GIF.",
          variant: "destructive",
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Maximum 5MB.",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        // Strip EXIF data by redrawing on canvas
        const stripped = await stripExif(file);
        const localPreview = URL.createObjectURL(stripped);
        setPreview(localPreview);

        const formData = new FormData();
        formData.append("file", stripped, file.name);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.open("POST", `/api/world/${entityType}s/${entityId}/image`);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              setPreview(data.url);
              toast({ title: "Image uploaded" });
              resolve();
            } else {
              let message = "Upload failed.";
              try {
                const err = JSON.parse(xhr.responseText);
                message = err.error || message;
              } catch {
                /* noop */
              }
              reject(new Error(message));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(formData);
        });
      } catch (err) {
        toast({
          title: "Upload failed",
          description: err instanceof Error ? err.message : "Could not upload image.",
          variant: "destructive",
        });
        setPreview(currentUrl || null);
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [entityType, entityId, currentUrl, toast]
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex aspect-square w-full max-w-64 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
          isDragging ? "border-brand bg-brand/5" : "border-fg/20 hover:border-fg/40"
        } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`${entityType} image`}
              className="h-full w-full rounded-lg object-cover"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-fg/30" />
            <p className="text-sm text-fg/40 text-center px-4">Drag & drop or click to upload</p>
            <p className="text-xs text-fg/20">JPEG, PNG, WebP, GIF (max 5MB)</p>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/40">
            <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-white">{progress}%</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {preview ? "Change Image" : "Choose File"}
      </Button>
    </div>
  );
}
