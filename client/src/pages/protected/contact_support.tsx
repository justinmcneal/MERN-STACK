import React from "react";
import { Layout } from "../../components/layout";
import { ContactSupportForm, type ContactFormValues } from "../../components/features/forms";
import { useFormState, usePageState, useNotificationState } from "../../hooks";

const ContactSupportPage = () => {
  const pageState = usePageState("Contact Support");
  const notificationState = useNotificationState([
    {
      type: "price",
      title: "Price Target Hit",
      pair: "ETH/USDT",
      target: "$0.45",
      current: "$0.4523",
      time: "now",
      unread: false,
    },
    {
      type: "arbitrage",
      title: "New Arbitrage Alert",
      details: "BNB on Uniswap → BNB on Sushiswap = +2.8% spread",
      profit: "$567",
      gas: "$15",
      score: 91,
      time: "now",
      unread: true,
    },
  ]);

  const formState = useFormState<ContactFormValues>({
    initialValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      subject: "",
      message: "",
      priorityLevel: "Low",
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ContactFormValues, string>> = {};
      
      if (!values.fullName.trim()) errors.fullName = "Full name is required";
      if (!values.email.trim()) errors.email = "Email is required";
      if (!values.subject.trim()) errors.subject = "Subject is required";
      if (!values.message.trim()) errors.message = "Message is required";
      
      return errors;
    }
  });

  const user = {
    name: "John Wayne",
    email: "johnwayne@gmail.com",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formState.validate()) return;
    
    formState.setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      alert("Message sent successfully! Our support team will get back to you within 2 hours.");
      formState.reset();
      notificationState.addNotification({
        type: "system",
        title: "Support Request Sent",
        details: "Your support request has been submitted successfully.",
        time: "now",
        unread: true,
      });
      formState.setSubmitting(false);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Support",
      description: "Get help via email",
      link: "support@arbitragepro.com"
    },
    {
      icon: (
        <svg className="w-6 h-6  text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Phone Support",
      description: "Call us directly",
      link: "+1 (555) 123-4567"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "Live Chat",
      description: "Chat with our team",
      link: "Start Chat"
    }
  ];

  return (
    <Layout
      title="Contact Support"
      activeTab={pageState.activeTab}
      onTabChange={pageState.setActiveTab}
      notifications={notificationState.notifications}
      user={user}
      onNotificationClick={(notification) => {
        console.log('Notification clicked:', notification);
        notificationState.markAsRead(notification.id!);
      }}
      onMarkAllRead={notificationState.markAllAsRead}
      onLogout={() => console.log('Logout')}
    >
      <div className="p-6 space-y-6">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contactMethods.map((method, index) => (
            <div 
              key={index}
              className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl hover:bg-slate-800/70 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-200 font-semibold mb-1">{method.title}</h3>
                  <p className="text-slate-400 text-sm mb-2">{method.description}</p>
                  <a 
                    href="#" 
                    className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                  >
                    {method.link}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <ContactSupportForm
          values={formState.values}
          onChange={formState.setField}
          onSubmit={handleSubmit}
          loading={formState.isSubmitting}
          className="max-w-4xl mx-auto"
        />
      </div>
    </Layout>
  );
};

export default ContactSupportPage;
