"use client";
import { ApiProvider } from "@/context/api/context";
import { SessionProvider } from "@/context/session";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStore, Provider } from "jotai";
import { ViewTransitions } from "next-view-transitions";
import { Outfit } from "next/font/google";
import "../css/calendar.css";
import "../css/globals.css";
import "../css/timeField.css";
const inter = Outfit({ subsets: ["latin"], weight: "300" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const store = createStore();

  return (
    <Provider store={store}>
      <ViewTransitions>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <ApiProvider>
              <html lang="en">
                <body className={inter.className}>{children}</body>
              </html>
            </ApiProvider>
          </QueryClientProvider>
        </SessionProvider>
      </ViewTransitions>
    </Provider>
  );
}
