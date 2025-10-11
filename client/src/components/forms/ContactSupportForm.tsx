import { Send, CheckCircle, ArrowLeft } from "lucide-react";
import PriorityButton from "../ui/PriorityButton/PriorityButton";
import { useContactSupportForm } from "../../hooks/useContactSupportForm";

const ContactSupportForm = () => {
  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    isRateLimited,
    handleInputChange,
    handlePriorityChange,
    handleSubmit,
    handleBackToDashboard
  } = useContactSupportForm();

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 min-h-[950px] flex flex-col">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Get in Touch</h2>
      
      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-emerald-400 font-semibold">Support Ticket Submitted!</h3>
              <p className="text-slate-300 text-sm mt-1">
                We've received your request and will get back to you within 2 hours.
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{errors.general}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.fullName ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
              }`}
              required
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
              }`}
              required
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
        </div>

        {/* Phone Number & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              placeholder="e.g 094527688976"
              className={`w-full px-4 py-2 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.phoneNumber ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>}
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={handleInputChange('subject')}
              placeholder="Enter your subject"
              className={`w-full px-4 py-2 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.subject ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
              }`}
              required
            />
            {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Priority Level</label>
          <div className="flex flex-wrap gap-2">
            <PriorityButton 
              level="Low" 
              selected={formData.priorityLevel === "Low"}
              onClick={() => handlePriorityChange("Low")}
            />
            <PriorityButton 
              level="Medium" 
              selected={formData.priorityLevel === "Medium"}
              onClick={() => handlePriorityChange("Medium")}
            />
            <PriorityButton 
              level="High" 
              selected={formData.priorityLevel === "High"}
              onClick={() => handlePriorityChange("High")}
            />
          </div>
        </div>

        {/* Your Message */}
        <div className="flex-1 flex flex-col">
          <label className="block text-sm text-slate-400 mb-2">Your Message</label>
          <textarea
            value={formData.message}
            onChange={handleInputChange('message')}
            placeholder="Please describe your issue or question in detail. Include any error messages, steps to reproduce, and relevant account information..."
            className={`w-full flex-1 px-4 py-2 bg-slate-700/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-none ${
              errors.message ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-600/50 focus:ring-cyan-400/50'
            }`}
            required
          ></textarea>
          {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isRateLimited || isSuccess}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform ${
            isLoading || isRateLimited || isSuccess
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:shadow-cyan-500/25 hover:scale-[1.02]'
          }`}
        >
          <Send className="w-4 h-4" />
          {isLoading ? 'Submitting...' : isRateLimited ? 'Rate Limited' : isSuccess ? 'Submitted' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactSupportForm;
