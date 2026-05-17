import type { ReactNode } from "react";
import PublicLayout from "@/components/layout/PublicLayout";

interface PublicRouteLayoutProps {
  children: ReactNode;
}

/**
 * Route group layout for all public-facing pages.
 * Wraps content with the site Header and Footer via PublicLayout.
 */
export default function PublicRouteLayout({ children }: PublicRouteLayoutProps) {
  return <PublicLayout>{children}</PublicLayout>;
}
