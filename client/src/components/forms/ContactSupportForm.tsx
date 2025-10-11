import { useState } from "react";
import { Send } from "lucide-react";
import PriorityButton from "../ui/PriorityButton/PriorityButton";

const ContactSupportForm = () => {
  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("Low");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static form submission - no actual processing
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Get in Touch</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              required
            />
          </div>
        </div>

        {/* Phone Number & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g 094527688976"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter your subject"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              required
            />
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Priority Level</label>
          <div className="flex flex-wrap gap-2">
            <PriorityButton 
              level="Low" 
              selected={priorityLevel === "Low"}
              onClick={() => setPriorityLevel("Low")}
            />
            <PriorityButton 
              level="Medium" 
              selected={priorityLevel === "Medium"}
              onClick={() => setPriorityLevel("Medium")}
            />
            <PriorityButton 
              level="High" 
              selected={priorityLevel === "High"}
              onClick={() => setPriorityLevel("High")}
            />
          </div>
        </div>

        {/* Your Message */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm text-slate-400 mb-2">Your Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please describe your issue or question in detail. Include any error messages, steps to reproduce, and relevant account information..."
            className="w-full flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all resize-none"
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactSupportForm;
