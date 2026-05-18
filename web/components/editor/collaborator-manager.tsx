"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/toast";
import { Plus, X, Search, UserPlus, Shield } from "lucide-react";

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

export function CollaboratorManager({ projectId }: CollaboratorManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCollaborators();
  }, [projectId]);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(
            data.filter((u: UserResult) => !collaborators.some((c) => c.user.id === u.id))
          );
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    },
    [collaborators]
  );

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchUsers]);

  const addCollaborator = async (userId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "editor" }),
      });
      if (res.ok) {
        const newCollab = await res.json();
        setCollaborators((prev) => [...prev, newCollab]);
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        toast({ title: "Collaborator added" });
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to add collaborator", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to add collaborator", variant: "destructive" });
    }
  };

  const removeCollaborator = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators?userId=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.user.id !== userId));
        toast({ title: "Collaborator removed" });
      }
    } catch {
      toast({ title: "Failed to remove collaborator", variant: "destructive" });
    }
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCollaborators((prev) => prev.map((c) => (c.user.id === userId ? updated : c)));
        toast({ title: "Role updated" });
      }
    } catch {
      toast({ title: "Failed to update role", variant: "destructive" });
    }
  };

  const roleBadge = (role: string) => {
    const variants: Record<string, string> = {
      owner: "bg-brand/20 text-brand text-xs px-1.5 py-0.5 rounded",
      editor: "bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded",
      viewer: "bg-fg/10 text-fg/50 text-xs px-1.5 py-0.5 rounded",
    };
    return <span className={variants[role] || variants.viewer}>{role}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Collaborators ({collaborators.length})
        </h3>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-fg/20 rounded-md hover:bg-fg/5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by username..."
              className="w-full rounded-md border border-fg/20 pl-8 pr-3 py-1.5 text-sm bg-bg"
            />
          </div>
          {searching && <p className="text-xs text-fg/40">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="border border-fg/10 rounded-md divide-y divide-fg/10 max-h-40 overflow-y-auto">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => addCollaborator(u.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-fg/5 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{u.username || u.name || u.email}</p>
                    {u.name && u.username && (
                      <p className="text-xs text-fg/40 truncate">{u.name}</p>
                    )}
                  </div>
                  <Plus className="h-3.5 w-3.5 text-fg/40 shrink-0" />
                </button>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-fg/40">No users found</p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-fg/40">Loading...</p>
      ) : collaborators.length === 0 ? (
        <p className="text-xs text-fg/40">No collaborators yet</p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-fg/5 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-fg/10 flex items-center justify-center text-xs font-medium shrink-0">
                  {(c.user.username || c.user.name || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm truncate">
                    {c.user.username || c.user.name || c.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={c.role}
                  onChange={(e) => changeRole(c.user.id, e.target.value)}
                  className="text-xs border border-fg/15 rounded px-1.5 py-0.5 bg-bg"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => removeCollaborator(c.user.id)}
                  className="p-0.5 rounded hover:bg-red-500/10 text-fg/40 hover:text-red-500"
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
