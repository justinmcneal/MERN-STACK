import ContactSupportForm from "../forms/ContactSupportForm";

const ContactSupportContent = () => {
  return (
    <main className="flex-1 overflow-hidden p-4 lg:p-6">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          <span className="text-white">Contact </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Support</span>
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto text-sm">
          Get expert help from our crypto arbitrage support team. We're here 24/7 to assist you with technical issues, monitoring questions, and platform guidance.
        </p>
      </div>

      <div className="w-full">
        <ContactSupportForm />
      </div>
    </main>
  );
};

export default ContactSupportContent;
