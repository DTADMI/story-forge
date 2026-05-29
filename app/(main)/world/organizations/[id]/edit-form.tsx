"use client";

import { useState } from "react";
import type { Organization } from ".prisma/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { Card } from "@/components/ui/card";
import { useApiMutation } from "@/lib/query-hooks";
import { getErrorMessage } from "@/lib/client-api";

const ORG_TYPES = ["faction", "guild", "kingdom", "clan", "corporation", "cult", "other"];

export function OrganizationEditForm({ org }: { org: Organization }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(org.name || "");
  const [type, setType] = useState(org.type || "faction");
  const [description, setDescription] = useState(org.description || "");
  const [goals, setGoals] = useState(org.goals || "");
  const [projectId, setProjectId] = useState(org.projectId || "");

  const updateOrg = useApiMutation<unknown, Record<string, unknown>>(
    `/api/world/organizations/${org.id}`,
    {
      method: "PATCH",
      onSuccess: () => {
        toast({ title: "Organization updated!" });
        router.refresh();
      },
      onError: (err) => {
        toast({
          title: getErrorMessage(err, "Failed to update organization"),
          variant: "destructive",
        });
      },
    }
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    updateOrg.mutate({
      name: name.trim(),
      type,
      description: description.trim() || null,
      goals: goals.trim() || null,
      projectId: projectId.trim() || null,
    });
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">Edit Organization</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Goals</label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Project (optional)</label>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-fg/20 px-3 py-2 text-sm bg-bg"
          />
        </div>
        <button
          type="submit"
          disabled={updateOrg.isPending}
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {updateOrg.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </Card>
  );
}
