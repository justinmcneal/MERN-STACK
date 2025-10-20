import type { FAQNavItem } from "./constants";

interface FAQSidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  navigation: FAQNavItem[];
  onTabChange: (tab: string) => void;
  onNavigate: (path: string) => void;
  onClose: () => void;
}

const FAQSidebar = ({
  sidebarOpen,
  activeTab,
  navigation,
  onTabChange,
  onNavigate,
  onClose,
}: FAQSidebarProps) => {
  return (
    <div
      className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                  fixed inset-y-0 left-0 z-[100] w-64 transform 
                  bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 
                  transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:transform-none`}
    >
      <div className="flex items-center justify-between gap-3 p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="font-bold text-lg">
            <span className="text-cyan-400">ArbiTrage</span>
            <span className="text-purple-400 ml-1">Pro</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition"
        >
          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Main Navigation</div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  onTabChange(item.name);
                  if (item.path) {
                    onNavigate(item.path);
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <span className="text-lg">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default FAQSidebar;
