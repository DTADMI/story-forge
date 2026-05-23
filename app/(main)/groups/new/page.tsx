"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

export default function NewGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const createGroupMutation = useApiMutation<{ id: string }, Record<string, unknown>>(
    "/api/social/groups",
    {
      onSuccess: (group) => {
        router.push(`/groups/${group.id}`);
      },
      onError: (error) => {
        toast({
          title: "Failed to create group",
          description: getErrorMessage(error, "Something went wrong."),
          variant: "destructive",
        });
      },
    }
  );

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">Create Group</h1>
      <Card className="p-6">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!name.trim()) {
              toast({
                title: "Name required",
                description: "Please enter a group name.",
                variant: "destructive",
              });
              return;
            }

            await createGroupMutation.mutateAsync({
              name: name.trim(),
              description: description.trim() || null,
              isPrivate,
            });
          }}
          className="space-y-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Writing Circle"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this group about?"
              rows={3}
              className="border-fg/20 placeholder:text-fg/50 flex w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
              className="accent-brand"
            />
            Private group
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={createGroupMutation.isPending}>
              Create Group
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
