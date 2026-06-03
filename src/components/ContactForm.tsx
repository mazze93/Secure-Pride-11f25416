import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  organization: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    message: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email address, and message.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const subject = formData.organization
      ? `Contact from ${formData.name} (${formData.organization})`
      : `Contact from ${formData.name}`;

    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.organization ? `Organization: ${formData.organization}` : null,
      '',
      formData.message,
    ].filter(Boolean).join('\n');

    window.location.href = `mailto:hello@securepride.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Organization
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleChange}
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="Your organization (optional)"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="Tell us about your needs..."
        />
      </div>

      {error && (
        <div className="rounded-lg bg-neon-pink/10 border border-neon-pink p-4 text-neon-pink text-sm" role="alert">
          {error}
        </div>
      )}

      <p className="text-xs text-text-secondary opacity-60">
        Clicking send opens your email client with this message pre-filled.
        No data is sent to a server.
      </p>

      <button
        type="submit"
        className="w-full rounded-lg bg-neon-cyan px-6 py-3 font-heading font-bold text-dark-bg transition-all duration-250 hover:shadow-glow focus:outline-2 focus:outline-offset-2 focus:outline-neon-cyan"
      >
        Open in email client →
      </button>
    </form>
  );
}
