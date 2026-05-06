import { ReactNode } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export async function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col navy-gradient">
      <TopNav />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 pb-10 pt-6 md:gap-10 md:px-8 md:pb-14 md:pt-8">
        <SidebarNav />
        <main className="min-w-0 flex-1">
          <section className="flex flex-wrap items-start justify-between gap-3 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
            </div>
          </section>
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
