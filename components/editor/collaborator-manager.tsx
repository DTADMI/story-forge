"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, UserPlus, X } from "lucide-react";
import { useToast } from "@/components/toast";
import { fetchVoid, getErrorMessage } from "@/lib/client-api";
import { useApiMutation, useApiQuery } from "@/lib/query-hooks";

interface Collaborator {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    image: string | null;
  };
}

interface UserResult {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  image: string | null;
}

interface CollaboratorManagerProps {
  projectId: string;
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export function CollaboratorManager({ projectId }: CollaboratorManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const collaboratorsKey = ["projects", projectId, "collaborators"];
  const collaboratorsQuery = useApiQuery<Collaborator[]>(
    collaboratorsKey,
    `/api/projects/${projectId}/collaborators`
  );
  const collaborators = collaboratorsQuery.data ?? [];
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const userSearchQuery = useApiQuery<UserResult[]>(
    ["users", "search", debouncedSearch],
    `/api/users?q=${encodeURIComponent(debouncedSearch)}`,
    {
      enabled: debouncedSearch.trim().length >= 2 && showSearch,
    }
  );
  const searchResults = useMemo(
    () =>
      (userSearchQuery.data ?? []).filter(
        (user) => !collaborators.some((collaborator) => collaborator.user.id === user.id)
      ),
    [collaborators, userSearchQuery.data]
  );
  const addCollaboratorMutation = useApiMutation<Collaborator, { userId: string; role: string }>(
    `/api/projects/${projectId}/collaborators`,
    {
      onSuccess: () => {
        toast({ title: "Collaborator added" });
        setSearchQuery("");
        setShowSearch(false);
        void queryClient.invalidateQueries({ queryKey: collaboratorsKey });
      },
      onError: (error) => {
        toast({
          title: "Failed to add collaborator",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );
  const updateCollaboratorMutation = useApiMutation<Collaborator, { userId: string; role: string }>(
    `/api/projects/${projectId}/collaborators`,
    {
      onSuccess: () => {
        toast({ title: "Role updated" });
        void queryClient.invalidateQueries({ queryKey: collaboratorsKey });
      },
      onError: (error) => {
        toast({
          title: "Failed to update role",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );
  const removeCollaboratorMutation = useMutation({
    mutationFn: (userId: string) =>
      fetchVoid(`/api/projects/${projectId}/collaborators?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({ title: "Collaborator removed" });
      void queryClient.invalidateQueries({ queryKey: collaboratorsKey });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove collaborator",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <UserPlus className="h-4 w-4" />
          Collaborators ({collaborators.length})
        </h3>
        <button
          onClick={() => setShowSearch((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-md border border-fg/20 px-2.5 py-1 text-xs hover:bg-fg/5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-fg/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search users by username..."
              className="w-full rounded-md border border-fg/20 bg-bg py-1.5 pr-3 pl-8 text-sm"
            />
          </div>
          {userSearchQuery.isLoading && <p className="text-xs text-fg/40">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-fg/10 divide-y divide-fg/10">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() =>
                    addCollaboratorMutation.mutate({ userId: user.id, role: "editor" })
                  }
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-fg/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{user.username || user.name || user.email}</p>
                    {user.name && user.username && (
                      <p className="truncate text-xs text-fg/40">{user.name}</p>
                    )}
                  </div>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-fg/40" />
                </button>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && !userSearchQuery.isLoading && searchResults.length === 0 && (
            <p className="text-xs text-fg/40">No users found</p>
          )}
        </div>
      )}

      {collaboratorsQuery.isLoading ? (
        <p className="text-xs text-fg/40">Loading...</p>
      ) : collaborators.length === 0 ? (
        <p className="text-xs text-fg/40">No collaborators yet</p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between gap-2 border-b border-fg/5 py-2 last:border-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fg/10 text-xs font-medium">
                  {(collaborator.user.username || collaborator.user.name || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {collaborator.user.username ||
                      collaborator.user.name ||
                      collaborator.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={collaborator.role}
                  onChange={(event) =>
                    updateCollaboratorMutation.mutate({
                      userId: collaborator.user.id,
                      role: event.target.value,
                    })
                  }
                  className="rounded border border-fg/15 bg-bg px-1.5 py-0.5 text-xs"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => removeCollaboratorMutation.mutate(collaborator.user.id)}
                  className="rounded p-0.5 text-fg/40 hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Remove collaborator"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
