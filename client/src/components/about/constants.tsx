import { BarChart3, Brain, Link2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TeamMember {
  initials: string;
  name: string;
  title: string;
  subtitle?: string;
  gradient: string;
  description: string;
}

export interface TechnologyStackItem {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    initials: "JM",
    name: "Justin Mc Neal Caronangan",
    title: "Project Manager & Data Scientist /",
    subtitle: "ML Engineer",
    gradient: "from-cyan-400 to-blue-500",
    description:
      "Leads project strategy and oversees the development of AI-driven monitoring models and scalable infrastructure. Specializes in designing systems and predictive analytics for financial markets.",
  },
  {
    initials: "JW",
    name: "John Wayne Enrique",
    title: "UI/UX & Frontend Developer",
    gradient: "from-cyan-400 to-purple-500",
    description:
      "Designs and develops the user interfaces and seamless experiences for monitoring platforms. Creates responsive, professional-grade dashboards that make complex data accessible and actionable.",
  },
  {
    initials: "JP",
    name: "Jame Patrick Palayo",
    title: "Backend Developer",
    gradient: "from-cyan-400 to-blue-600",
    description:
      "Architects and implements robust backend systems, API integrations, and database solutions for professional monitoring platforms. Ensures reliable real-time data processing and secure high-load use cases.",
  },
  {
    initials: "JP",
    name: "Jean Claude Ganay",
    title: "Quality Assurance Engineer",
    gradient: "from-blue-400 to-cyan-500",
    description:
      "Ensures platform reliability, security, and performance through comprehensive testing protocols. Maintains quality standards for monitoring systems and user interface functionality.",
  },
  {
    initials: "EB",
    name: "Ericka Brudo",
    title: "Research Specialist",
    gradient: "from-cyan-400 to-teal-500",
    description:
      "Conducts in-depth research and analysis of blockchain ecosystems, market patterns, and monitoring needs. Develops insights that influence platform innovation and strategic direction.",
  },
];

export const TECHNOLOGY_STACK: TechnologyStackItem[] = [
  {
    icon: Brain,
    iconClassName: "text-cyan-400",
    title: "Large Language Models",
    description:
      "Supports AI-aided expansion for natural language processing of market sentiment, news analysis, and intelligent pattern recognition across multiple data sources.",
  },
  {
    icon: Zap,
    iconClassName: "text-yellow-400",
    title: "Real-Time Data Processing",
    description:
      "High-frequency data ingestion and analysis from 50+ exchanges, delivering sub-second latency for time-critical insights.",
  },
  {
    icon: Link2,
    iconClassName: "text-purple-400",
    title: "Cross-Chain Integration",
    description:
      "Native support for multiple blockchain networks including Ethereum, Binance Smart Chain, Polygon, and more. Comprehensive arbitrage coverage.",
  },
  {
    icon: BarChart3,
    iconClassName: "text-emerald-400",
    title: "Advanced Analytics",
    description:
      "Sophisticated risk assessment algorithms, portfolio optimization tools, and performance tracking with comprehensive reporting and visualization.",
  },
];
