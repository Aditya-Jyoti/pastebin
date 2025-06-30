"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LiveEditor } from "@/components/live-editor";
import Link from "next/link";

const LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "json",
  "xml",
  "yaml",
  "markdown",
  "bash",
  "dockerfile",
];

interface User {
  id: string;
  username: string;
  email: string;
  unique_code: string;
}

export default function HomePage() {
  const [content, setContent] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            router.push("/auth/login");
          }
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const slug = customSlug || generateSlug();

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content,
          language,
          isPublic,
          password: !isPublic ? password : null,
        }),
      });

      if (response.ok) {
        router.push(`/${user.unique_code}/${slug}`);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create paste");
      }
    } catch (error) {
      console.error("Error creating paste:", error);
      alert("Failed to create paste");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/auth/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center">
        <div className="text-gruvbox-fg font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gruvbox-bg text-gruvbox-fg font-mono flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gruvbox-dark border-b border-gruvbox-gray p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gruvbox-yellow">
            <a href="/">pastebin</a>
          </h1>
          <div className="flex items-center gap-6">
            {/* Controls */}
            <div className="flex items-center gap-4">
              <Input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="custom-slug"
                className="w-32 h-8 bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono text-sm"
              />

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 h-8 bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gruvbox-dark border-gruvbox-gray max-h-60">
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang}
                      value={lang}
                      className="text-gruvbox-fg hover:bg-gruvbox-gray focus:bg-gruvbox-gray"
                    >
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-gruvbox-green data-[state=unchecked]:bg-gruvbox-red"
                />
                <Label htmlFor="public" className="text-gruvbox-fg text-sm">
                  {isPublic ? "Public" : "Private"}
                </Label>
              </div>

              {!isPublic && (
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="w-24 h-8 bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono text-sm"
                />
              )}
            </div>

            <div className="flex items-center gap-4 border-l border-gruvbox-gray pl-4">
              <span className="text-gruvbox-fg text-sm">
                @{user?.username} ({user?.unique_code})
              </span>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gruvbox-fg hover:bg-gruvbox-gray h-8"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gruvbox-fg hover:bg-gruvbox-gray h-8"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <LiveEditor
              content={content}
              onChange={setContent}
              language={language}
            />
          </div>

          {/* Bottom Bar */}
          <div className="bg-gruvbox-dark border-t border-gruvbox-gray p-3 flex justify-between items-center flex-shrink-0">
            <div className="text-gruvbox-fg text-sm">
              Lines: {content.split("\n").length} | Chars: {content.length}
            </div>
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-gruvbox-yellow text-gruvbox-bg hover:bg-gruvbox-orange font-mono h-8 px-6"
            >
              {loading ? "Creating..." : "Create Paste"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
