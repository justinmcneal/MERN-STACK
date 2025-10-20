import { TEAM_MEMBERS } from "./constants";

const AboutTeam = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-white">Meet Our </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Expert Team
          </span>
        </h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Our diverse team of technology experts, data scientists, and market analysts combines decades of experience
          in blockchain technology, artificial intelligence, and quantitative analysis to deliver a world-class monitoring
          platform.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.name}
            className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all"
          >
            <div className="flex flex-col items-center mb-4">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center mb-4 shadow-lg`}
              >
                <span className="text-white font-bold text-2xl">{member.initials}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-200 text-center">{member.name}</h3>
              <p className="text-cyan-400 text-sm text-center mb-1">{member.title}</p>
              {member.subtitle && <p className="text-cyan-400 text-sm text-center">{member.subtitle}</p>}
            </div>
            <p className="text-slate-300 text-sm text-center leading-relaxed">{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutTeam;
