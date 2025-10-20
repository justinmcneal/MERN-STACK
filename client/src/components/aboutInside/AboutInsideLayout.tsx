import type { ReactNode } from "react";

interface AboutInsideLayoutProps {
  children: ReactNode;
}

const AboutInsideLayout = ({ children }: AboutInsideLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-purple-900/10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-cyan-900/10" />
      <div className="relative z-50 flex h-screen">{children}</div>
    </div>
  );
};

export default AboutInsideLayout;
