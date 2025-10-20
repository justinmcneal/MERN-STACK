interface AboutBackButtonProps {
  onBack: () => void;
}

const AboutBackButton = ({ onBack }: AboutBackButtonProps) => {
  return (
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 group"
    >
      <svg
        className="w-5 h-5 transition-transform group-hover:-translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Home
    </button>
  );
};

export default AboutBackButton;
