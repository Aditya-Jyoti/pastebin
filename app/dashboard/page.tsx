"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Lock, Globe, Copy, EyeOff, Trash2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  unique_code: string;
}

interface Paste {
  id: string;
  slug: string;
  language: string;
  is_public: boolean;
  password: string | null;
  view_count: number;
  created_at: string;
  content: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching auth data...");
        const authResponse = await fetch("/api/auth/me");
        console.log("Auth response status:", authResponse.status);
        
        if (!authResponse.ok) {
          console.log("Auth failed, redirecting to login");
          router.push("/auth/login");
          return;
        }

        const authData = await authResponse.json();
        console.log("Auth data:", authData);
        
        if (!authData.user) {
          console.log("No user in auth data, redirecting to login");
          router.push("/auth/login");
          return;
        }

        setUser(authData.user);

        console.log("Fetching pastes...");
        const pastesResponse = await fetch("/api/pastes");
        console.log("Pastes response status:", pastesResponse.status);
        
        if (pastesResponse.ok) {
          const pastesData = await pastesResponse.json();
          console.log("Pastes data:", pastesData);
          
          // Make sure we're setting the right data structure
          if (pastesData && pastesData.pastes) {
            setPastes(pastesData.pastes);
            console.log("Set pastes:", pastesData.pastes);
          } else {
            console.log("No pastes in response or wrong structure");
            setPastes([]);
          }
        } else {
          const errorText = await pastesResponse.text();
          console.error("Failed to fetch pastes:", errorText);
          setError("Failed to load pastes");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        // Don't redirect on fetch error, user might still be authenticated
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const togglePasswordVisibility = (pasteId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [pasteId]: prev[pasteId] === undefined ? false : !prev[pasteId],
    }));
  };

  const deletePaste = async (pasteId: string, pasteSlug: string) => {
    if (!confirm(`Are you sure you want to delete paste "${pasteSlug}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteLoading(pasteId);
    try {
      console.log("Deleting paste:", pasteId);
      const response = await fetch("/api/pastes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pasteId }),
      });
      
      if (response.ok) {
        console.log("Paste deleted successfully");
        setPastes(prev => prev.filter(paste => paste.id !== pasteId));
      } else {
        const data = await response.json();
        console.error("Delete failed:", data);
        alert(data.error || "Failed to delete paste");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete paste");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center">
        <div className="text-gruvbox-fg font-mono">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center">
        <div className="text-gruvbox-red font-mono">
          Error: {error}
          <br />
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gruvbox-yellow text-gruvbox-bg"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gruvbox-bg text-gruvbox-fg font-mono">
      {/* Header */}
      <header className="bg-gruvbox-dark border-b border-gruvbox-gray p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gruvbox-yellow">
              <a href="/">pastebin</a>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gruvbox-fg text-sm">
              @{user?.username} ({user?.unique_code})
            </span>
            <Link href="/">
              <Button
                variant="ghost"
                className="text-gruvbox-fg hover:bg-gruvbox-gray"
              >
                New Paste
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gruvbox-fg hover:bg-gruvbox-gray"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gruvbox-yellow mb-2">
            Your Pastes
          </h2>
          <p className="text-gruvbox-fg">
            Total: {pastes.length} pastes
          </p>
        </div>

        {pastes.length === 0 ? (
          <Card className="bg-gruvbox-dark border-gruvbox-gray">
            <CardContent className="p-8 text-center">
              <p className="text-gruvbox-fg mb-4">No pastes yet.</p>
              <Link href="/">
                <Button className="bg-gruvbox-yellow text-gruvbox-bg hover:bg-gruvbox-orange font-mono">
                  Create First Paste
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pastes.map((paste) => (
              <Card
                key={paste.id}
                className="bg-gruvbox-dark border-gruvbox-gray hover:border-gruvbox-gray/60 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gruvbox-fg flex items-center gap-2">
                      <Link
                        href={`/${user?.unique_code}/${paste.slug}`}
                        className="hover:text-gruvbox-yellow transition-colors"
                      >
                        /{user?.unique_code}/{paste.slug}
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/${user?.unique_code}/${paste.slug}`
                          )
                        }
                        className="h-6 w-6 p-0 text-gruvbox-fg hover:text-gruvbox-yellow"
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-gruvbox-fg border-gruvbox-gray font-mono"
                      >
                        {paste.language}
                      </Badge>
                      <Badge
                        variant={paste.is_public ? "default" : "secondary"}
                        className={
                          paste.is_public
                            ? "bg-gruvbox-green text-gruvbox-bg"
                            : "bg-gruvbox-red text-gruvbox-bg"
                        }
                      >
                        {paste.is_public ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" /> Private
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gruvbox-fg mb-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {paste.view_count || 0}
                      </span>
                      <span>
                        {new Date(paste.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/${user?.unique_code}/${paste.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gruvbox-fg hover:text-gruvbox-yellow"
                        >
                          View
                        </Button>
                      </Link>
                      <Link href={`/${user?.unique_code}/${paste.slug}/raw`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gruvbox-fg hover:text-gruvbox-yellow"
                        >
                          Raw
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePaste(paste.id, paste.slug)}
                        disabled={deleteLoading === paste.id}
                        className="text-gruvbox-fg hover:text-gruvbox-red hover:bg-gruvbox-red/10 transition-colors"
                        title="Delete paste"
                      >
                        {deleteLoading === paste.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gruvbox-red border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Minimal password display for private pastes */}
                  {!paste.is_public && paste.password && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gruvbox-fg">
                      <span>Password:</span>
                      <span className="font-mono text-gruvbox-yellow">
                        {showPasswords[paste.id] !== false
                          ? paste.password
                          : "••••••••"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(paste.id)}
                        className="h-4 w-4 p-0 text-gruvbox-fg hover:text-gruvbox-yellow"
                        title="Toggle password visibility"
                      >
                        {showPasswords[paste.id] !== false ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paste.password || "")}
                        className="h-4 w-4 p-0 text-gruvbox-fg hover:text-gruvbox-yellow"
                        title="Copy password"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="p-2 bg-gruvbox-bg rounded text-xs font-mono text-gruvbox-fg truncate">
                    {paste.content.split("\n")[0]}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
