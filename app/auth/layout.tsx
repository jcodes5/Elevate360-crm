import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Elevate360 CRM - Authentication",
  description: "Login to your Elevate360 CRM account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("bg-background font-sans antialiased", fontSans.variable)}
    >
      <AuthSplitLayout>{children}</AuthSplitLayout>
    </div>
  );
}
