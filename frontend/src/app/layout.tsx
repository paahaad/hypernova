import "./globals.css";
import React from "react";
import Layout from "@/components/layout/layout";
import { Providers } from "@/providers/Providers";
import { Metadata } from 'next';
import { ThemedToaster } from "@/lib/toast";

export const metadata: Metadata = {
  title: 'Hypernova',
  description: 'The Decentralized Exchange & Launchpad for Sonic SVM',
  keywords: ['solana', 'hackathon', 'ai', 'Hypernova'],
  authors: [{ name: 'Hypernova', url: 'https://www.hypernova.fun' }],
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hypernova',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Hypernova',
    description: 'The Decentralized Exchange & Launchpad for Sonic SVM',
    url: 'https://hypernova.fun',
    siteName: "Hypernova",
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Hypernova',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hypernova',
    description: 'The Decentralized Exchange & Launchpad for Sonic SVM',
    images: ['/og.png'],
  },
  metadataBase: new URL('https://hypernova.fun'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>
            {children}
          </Layout>
          <ThemedToaster />
        </Providers>
      </body>
    </html>
  );
}
