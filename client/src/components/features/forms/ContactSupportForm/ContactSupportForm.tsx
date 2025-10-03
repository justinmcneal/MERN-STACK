import React from 'react';
import { Mail, Send } from 'lucide-react';
import Input from '../../../ui/Input/Input';
import Select from '../../../ui/Select/Select';
import Textarea from '../../../ui/Textarea/Textarea';
import Button from '../../../ui/Button/Button';
import Card from '../../../ui/Card/Card';

export interface ContactFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  priorityLevel: string;
}

interface ContactSupportFormProps {
  values: ContactFormValues;
  onChange: (field: keyof ContactFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  className?: string;
}

const ContactSupportForm: React.FC<ContactSupportFormProps> = ({
  values,
  onChange,
  onSubmit,
  loading = false,
  className = ''
}) => {
  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  return (
    <Card className={`p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
          <Mail className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Contact Support</h2>
          <p className="text-slate-400 text-sm">Send us a message and we'll get back to you soon</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={values.fullName}
            onChange={onChange.bind(null, 'fullName')}
            required
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={values.email}
            onChange={onChange.bind(null, 'email')}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={values.phoneNumber}
            onChange={onChange.bind(null, 'phoneNumber')}
          />

          <Select
            label="Priority Level"
            value={values.priorityLevel}
            onChange={onChange.bind(null, 'priorityLevel')}
            options={priorityOptions}
            placeholder="Select priority"
          />
        </div>

        <Input
          label="Subject"
          placeholder="Brief description of your issue"
          value={values.subject}
          onChange={onChange.bind(null, 'subject')}
          required
        />

        <Textarea
          label="Message"
          placeholder="Please provide detailed information about your inquiry..."
          value={values.message}
          onChange={onChange.bind(null, 'message')}
          rows={6}
          required
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="min-w-[120px]"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ContactSupportForm;
