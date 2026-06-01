import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'CollabSpark — Find Your Perfect Collab Partner 🔥',
  description:
    'Connect with content creators, dancers, editors, photographers, and more in your city. CollabSpark is India\'s #1 creator collaboration platform.',
  keywords:
    'content creators, collaboration, Instagram, YouTube, dance, music, India, collab',
  openGraph: {
    title: 'CollabSpark — Find Your Perfect Collab Partner 🔥',
    description:
      'Connect with content creators in your city. Stop waiting for the right collab — go find it.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
