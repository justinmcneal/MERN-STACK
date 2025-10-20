import { ArrowLeft } from "lucide-react";

interface NotificationsBackButtonProps {
  onBack: () => void;
}

const NotificationsBackButton = ({ onBack }: NotificationsBackButtonProps) => {
  return (
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 group"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      Back
    </button>
  );
};

export default NotificationsBackButton;
