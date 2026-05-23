"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { Card } from "@/components/ui/card";
import { useApiMutation } from "@/lib/query-hooks";
import { getErrorMessage } from "@/lib/client-api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ORG_TYPES = ["faction", "guild", "kingdom", "clan", "corporation", "cult", "other"];

export default function NewOrganizationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState("faction");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [projectId, setProjectId] = useState("");

  const createOrg = useApiMutation<unknown, Record<string, unknown>>("/api/world/organizations", {
    onSuccess: () => {
      toast({ title: "Organization created!" });
      router.push("/world/organizations");
      router.refresh();
    },
    onError: (err) => {
      toast({
        title: getErrorMessage(err, "Failed to create organization"),
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    createOrg.mutate({
      name: name.trim(),
      type,
      description: description.trim() || null,
      goals: goals.trim() || null,
      projectId: projectId.trim() || null,
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/world/organizations" className="p-1.5 rounded-md hover:bg-fg/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">New Organization</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
              placeholder="Organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
            >
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
              placeholder="Describe this organization..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Goals</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
              placeholder="What are their goals?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project (optional)</label>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
              placeholder="Associate with a project"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Link
              href="/world/organizations"
              className="px-4 py-2 text-sm font-medium border border-fg/20 rounded-md hover:bg-fg/5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createOrg.isPending}
              className="bg-brand text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
            >
              {createOrg.isPending ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}
