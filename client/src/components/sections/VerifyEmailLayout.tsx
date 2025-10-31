import type { ReactNode } from "react";

interface VerifyEmailLayoutProps {
  children: ReactNode;
}

const VerifyEmailLayout = ({ children }: VerifyEmailLayoutProps) => (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-cyan-900/10" />
    </div>
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      {children}
    </main>
  </div>
);

export default VerifyEmailLayout;
