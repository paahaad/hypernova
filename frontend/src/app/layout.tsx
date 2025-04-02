"use client"

import "./globals.css";
import React from "react";
import Layout from "@/components/layout/layout";
import { QueryProvider } from "@/lib/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Layout>
            {children}
          </Layout>
        </QueryProvider>
      </body>
    </html>
  );
}
