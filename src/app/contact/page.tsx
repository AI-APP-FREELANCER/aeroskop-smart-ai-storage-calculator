"use client";
import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    interest: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Validate required fields on client side
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.message.trim()) {
        setSubmitStatus('error');
        console.error('Validation error: Required fields are missing');
        return;
      }

      // Submit consultation enquiry to PostgreSQL database via API
      const response = await fetch('/api/consultation/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company?.trim() || null,
          phone_number: formData.phone?.trim() || null,
          area_of_interest: formData.interest?.trim() || null,
          message_content: formData.message.trim()
        })
      });

      // Parse response (whether success or error)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setSubmitStatus('error');
        return;
      }

      // Check if response is ok AND success is true
      if (!response.ok || !data.success) {
        // Handle error response
        const errorMessage = data.error || 'Failed to submit consultation enquiry. Please try again later.';
        setSubmitStatus('error');
        console.error('Submission error:', errorMessage, 'Status:', response.status, 'Response:', data);
        return;
      }

      // Success - data was saved
      console.log('✅ Consultation enquiry submitted successfully:', {
        id: data.id,
        created_at: data.created_at
      });
      setSubmitStatus('success');
      // Clear form on successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        interest: ''
      });
      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-sky-50/50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              Ready to enhance your security? Our experts are here to help you find 
              the perfect surveillance solution for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-slate-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Thank you, your consultation request has been logged!</span>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>There was an error sending your message. Please try again.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-slate-700 mb-2">
                    Area of Interest
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an option</option>
                    <option value="security-cameras">Security Cameras</option>
                    <option value="nvr">NVR Systems</option>
                    <option value="poe-switches">PoE Switches</option>
                    <option value="storage-servers">Storage Servers</option>
                    <option value="workstations">Workstations</option>
                    <option value="vms">VMS Software</option>
                    <option value="consultation">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your surveillance needs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                      <span className="text-blue-600">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <p className="text-slate-600">info@aeroskop.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                      <span className="text-blue-600">💬</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">WhatsApp</h3>
                      <a 
                        href="https://wa.me/+97377992203" 
                        className="text-blue-600 hover:text-blue-700"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat with us on WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Bahrain Office */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Bahrain Office</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                          <span className="text-blue-600">📍</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Address</h4>
                          <p className="text-slate-600">Umm Al Hassam, Kingdom of Bahrain</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                          <span className="text-blue-600">📞</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Phone</h4>
                          <p className="text-slate-600">+973 77992203</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Poland Office */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Poland Office</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                          <span className="text-blue-600">📍</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Address</h4>
                          <p className="text-slate-600">ul. Hoża 86 lok. 410, 00-682 Warszawa, Poland</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-sky-50 ring-1 ring-sky-100 flex items-center justify-center">
                          <span className="text-blue-600">📞</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">Phone</h4>
                          <p className="text-slate-600">+48 732 082 387</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
