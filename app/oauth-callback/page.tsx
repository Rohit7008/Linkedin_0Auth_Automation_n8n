"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("Authorization code not found.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          router.push("/dashboard"); // Redirect to dashboard after login
        } else {
          throw new Error(data.error || "Failed to authenticate.");
        }
      } catch (err) {
        setError("Error exchanging code for token.");
        console.error(err);
      }
    };

    fetchToken();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>Authenticating...</p>
      )}
    </div>
  );
}
