"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function ApiTokenManager() {
  const [loading, setLoading] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);

  const generateToken = async () => {
    if (!tokenName) {
      toast.error("Please enter a token name");
      return;
    }
    setLoading(true);
    setNewToken(null);
    try {
      const res = await fetch("/api/settings/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName }),
      });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setNewToken(data.token);
      setTokenName("");
      toast.success("Token generated successfully!");
    } catch (e) {
      toast.error("Failed to generate API token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Tokens</CardTitle>
        <CardDescription>
          Generate tokens to authenticate the browser extension or other third-party clients.
          Tokens are only shown once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Token Name (e.g. Chrome Extension)"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />
          <Button onClick={generateToken} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>

        {newToken && (
          <div className="p-4 bg-muted rounded-md border border-border break-all font-mono text-sm">
            <p className="font-semibold mb-2">Your new token (Copy it now!):</p>
            {newToken}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
