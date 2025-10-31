import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/ui/Header/Header";
import HeroSection from "../components/sections/HeroSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import DashboardSection from "../components/sections/DashboardSection";
import Footer from "../components/ui/Footer/Footer";

export default function ArbiTraderPro() {
  const [scrollY, setScrollY] = useState(0);
  const [parallaxEnabled, setParallaxEnabled] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handlePreferenceChange = () => {
      const shouldEnable = !mediaQuery.matches;
      setParallaxEnabled(shouldEnable);
      if (!shouldEnable) {
        setScrollY(0);
      } else {
        setScrollY(window.scrollY);
      }
    };

    handlePreferenceChange();
    mediaQuery.addEventListener("change", handlePreferenceChange);

    return () => {
      mediaQuery.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !parallaxEnabled) {
      return;
    }

    const handleScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frameRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setScrollY(window.scrollY);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [parallaxEnabled]);

  const parallaxStyle = useMemo(() => {
    const baseStyle = {
      backgroundImage:
        "radial-gradient(circle at 25% 25%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
    } as const;

    if (!parallaxEnabled) {
      return baseStyle;
    }

    return {
      ...baseStyle,
      transform: `translateY(${scrollY * 0.1}px)`,
    };
  }, [parallaxEnabled, scrollY]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white font-inter antialiased">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-purple-900/20" />
        <div
          className="absolute inset-0 opacity-30 transition-transform duration-300"
          style={parallaxStyle}
        />
      </div>

      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardSection />
      </main>
      <Footer />
    </div>
  );
}