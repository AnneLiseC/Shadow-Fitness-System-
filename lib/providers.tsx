"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0a0a1a",
              color: "#06b6d4",
              border: "1px solid #7c3aed",
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "14px",
              padding: "12px 16px",
              borderRadius: "4px",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)",
            },
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
