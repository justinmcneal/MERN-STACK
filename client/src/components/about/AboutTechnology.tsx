import { TECHNOLOGY_STACK } from "./constants";

const AboutTechnology = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-white">Our Technology </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Stack</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TECHNOLOGY_STACK.map((tech) => {
          const Icon = tech.icon;
          return (
            <div
              key={tech.title}
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-8 h-8 ${tech.iconClassName}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{tech.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{tech.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AboutTechnology;
