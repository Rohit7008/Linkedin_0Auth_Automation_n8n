"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Account {
  id: string;
  provider: string;
  status: string;
  name?: string;
  created_at?: string;
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null
  );
  const router = useRouter();

  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must log in first.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accounts.");
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError("Error fetching accounts.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (provider: string) => {
    setConnectingProvider(provider);
    try {
      const authUrl = `https://api.unipile.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(
        "http://localhost:3000/oauth/callback"
      )}&response_type=code&scope=email`;

      window.location.href = authUrl;
    } catch (err) {
      setError(`Error connecting to ${provider}. Please try again.`);
      console.error(err);
    } finally {
      setConnectingProvider(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="border-b bg-card">
          <CardTitle className="text-2xl">Unipile Account Status</CardTitle>
          <CardDescription>
            View and manage your connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading accounts...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        {account.status === "connected" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium capitalize">
                            {account.name || account.provider}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {account.provider}
                          </p>
                        </div>
                      </div>
                      {account.status !== "connected" && (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(account.provider)}
                          disabled={connectingProvider === account.provider}
                        >
                          {connectingProvider === account.provider ? (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <XCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No accounts found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No accounts are available or connected through Unipile
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={fetchAccounts}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh Status
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
