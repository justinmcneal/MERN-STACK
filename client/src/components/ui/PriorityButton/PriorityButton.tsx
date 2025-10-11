interface PriorityButtonProps {
  level: string;
  selected: boolean;
  onClick: () => void;
}

const PriorityButton = ({ level, selected, onClick }: PriorityButtonProps) => {
  const colors = {
    Low: "from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-400",
    Medium: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400",
    High: "from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-400"
  };
  
  const selectedColors = {
    Low: "from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25",
    Medium: "from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25",
    High: "from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
        selected 
          ? `bg-gradient-to-r ${selectedColors[level as keyof typeof selectedColors]}` 
          : `bg-gradient-to-r ${colors[level as keyof typeof colors]} border hover:scale-105`
      }`}
    >
      {level}
    </button>
  );
};

export default PriorityButton;
