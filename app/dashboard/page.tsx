"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface UserConnection {
  provider: string;
  connected: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token found.");

        const response = await fetch("/api/auth/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to authenticate.");

        const data = await response.json();

        if (data.authenticated) {
          setIsAuthenticated(true);
          setConnections(data.connections || []);
        } else {
          throw new Error("User not authenticated.");
        }
      } catch (error) {
        console.error("Auth Error:", error);
        localStorage.removeItem("access_token"); // Ensure logout on auth failure
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("access_token"); // Clear token on logout
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">User Status</CardTitle>
            <CardDescription>Checking authentication...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">User Status</CardTitle>
          <CardDescription>Your connected accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : connections.length > 0 ? (
            connections.map((connection, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  {connection.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium capitalize">
                    {connection.connected
                      ? `Logged in with ${connection.provider}`
                      : `Not logged in with ${connection.provider}`}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">No connections found</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
