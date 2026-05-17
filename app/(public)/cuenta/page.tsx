import type { Metadata } from "next";
import AuthPanel from "@/components/account/AuthPanel";

export const metadata: Metadata = {
  title: "Cuenta",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AuthPanel />;
}

