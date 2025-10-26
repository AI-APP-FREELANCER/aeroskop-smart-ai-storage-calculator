'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserData) => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  company: string;
}

const countryCodes = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+31', country: 'Netherlands' },
  { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' },
  { code: '+45', country: 'Denmark' },
  { code: '+41', country: 'Switzerland' },
  { code: '+43', country: 'Austria' },
  { code: '+32', country: 'Belgium' },
  { code: '+351', country: 'Portugal' },
  { code: '+30', country: 'Greece' },
  { code: '+48', country: 'Poland' },
  { code: '+420', country: 'Czech Republic' },
  { code: '+36', country: 'Hungary' },
  { code: '+40', country: 'Romania' },
  { code: '+359', country: 'Bulgaria' },
  { code: '+385', country: 'Croatia' },
  { code: '+386', country: 'Slovenia' },
  { code: '+421', country: 'Slovakia' },
  { code: '+370', country: 'Lithuania' },
  { code: '+371', country: 'Latvia' },
  { code: '+372', country: 'Estonia' },
  { code: '+353', country: 'Ireland' },
  { code: '+358', country: 'Finland' },
  { code: '+352', country: 'Luxembourg' },
  { code: '+356', country: 'Malta' },
  { code: '+357', country: 'Cyprus' },
  { code: '+973', country: 'Bahrain' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+965', country: 'Kuwait' },
  { code: '+974', country: 'Qatar' },
  { code: '+968', country: 'Oman' },
  { code: '+20', country: 'Egypt' },
  { code: '+27', country: 'South Africa' },
  { code: '+61', country: 'Australia' },
  { code: '+64', country: 'New Zealand' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'South Korea' },
  { code: '+86', country: 'China' },
  { code: '+91', country: 'India' },
  { code: '+65', country: 'Singapore' },
  { code: '+60', country: 'Malaysia' },
  { code: '+66', country: 'Thailand' },
  { code: '+63', country: 'Philippines' },
  { code: '+84', country: 'Vietnam' },
  { code: '+62', country: 'Indonesia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+54', country: 'Argentina' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+51', country: 'Peru' },
  { code: '+58', country: 'Venezuela' },
  { code: '+593', country: 'Ecuador' },
  { code: '+595', country: 'Paraguay' },
  { code: '+598', country: 'Uruguay' },
  { code: '+591', country: 'Bolivia' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+507', country: 'Panama' },
  { code: '+502', country: 'Guatemala' },
  { code: '+504', country: 'Honduras' },
  { code: '+503', country: 'El Salvador' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+1-242', country: 'Bahamas' },
  { code: '+1-246', country: 'Barbados' },
  { code: '+1-767', country: 'Dominica' },
  { code: '+1-809', country: 'Dominican Republic' },
  { code: '+1-876', country: 'Jamaica' },
  { code: '+1-664', country: 'Montserrat' },
  { code: '+1-787', country: 'Puerto Rico' },
  { code: '+1-869', country: 'Saint Kitts and Nevis' },
  { code: '+1-758', country: 'Saint Lucia' },
  { code: '+1-784', country: 'Saint Vincent and the Grenadines' },
  { code: '+1-868', country: 'Trinidad and Tobago' },
  { code: '+1-649', country: 'Turks and Caicos Islands' },
  { code: '+1-340', country: 'US Virgin Islands' },
  { code: '+1-441', country: 'Bermuda' },
  { code: '+1-284', country: 'British Virgin Islands' },
  { code: '+1-345', country: 'Cayman Islands' },
  { code: '+1-473', country: 'Grenada' },
  { code: '+1-670', country: 'Northern Mariana Islands' },
  { code: '+1-671', country: 'Guam' },
  { code: '+1-684', country: 'American Samoa' },
  { code: '+1-808', country: 'Hawaii' },
  { code: '+1-907', country: 'Alaska' },
  { code: '+1-250', country: 'British Columbia' },
  { code: '+1-403', country: 'Alberta' },
  { code: '+1-306', country: 'Saskatchewan' },
  { code: '+1-204', country: 'Manitoba' },
  { code: '+1-416', country: 'Ontario' },
  { code: '+1-418', country: 'Quebec' },
  { code: '+1-506', country: 'New Brunswick' },
  { code: '+1-902', country: 'Nova Scotia' },
  { code: '+1-709', country: 'Newfoundland and Labrador' },
  { code: '+1-867-1', country: 'Northwest Territories' },
  { code: '+1-867-2', country: 'Nunavut' },
  { code: '+1-867-3', country: 'Yukon' },
].sort((a, b) => a.country.localeCompare(b.country));

const freeEmailProviders = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.ca',
  'aol.com', 'icloud.com', 'me.com', 'mac.com', 'live.com', 'msn.com',
  'ymail.com', 'rocketmail.com', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it',
  'yahoo.co.jp', 'yahoo.co.kr', 'yahoo.com.au', 'yahoo.com.br', 'yahoo.com.mx',
  'yahoo.com.ar', 'yahoo.com.sg', 'rediffmail.com', 'mail.com', 'gmx.com',
  'gmx.de', 'web.de', 't-online.de', 'freenet.de', 'arcor.de', '1und1.de',
  'tiscali.it', 'libero.it', 'virgilio.it', 'alice.it', 'tin.it', 'fastwebnet.it',
  'windtre.it', 'tim.it', 'vodafone.it', 'orange.fr', 'wanadoo.fr', 'free.fr',
  'laposte.net', 'sfr.fr', 'bouyguestelecom.fr', 'club-internet.fr', 'noos.fr',
  'cegetel.net', '9online.fr', 'aliceadsl.fr', 'neuf.fr', 'numericable.fr',
  'protonmail.com', 'tutanota.com', 'mailfence.com', 'hushmail.com',
  'fastmail.com', 'zoho.com', 'yandex.com', 'yandex.ru', 'yandex.by', 'yandex.kz',
  'yandex.ua', 'yandex.uz', 'yandex.az', 'yandex.am', 'yandex.ge', 'yandex.kg',
  'yandex.tj', 'yandex.tm', 'yandex.md', 'yandex.lv', 'yandex.lt', 'yandex.ee',
  'yandex.fi', 'yandex.se', 'yandex.no', 'yandex.dk', 'yandex.is', 'yandex.li',
  'yandex.ad', 'yandex.mc', 'yandex.sm', 'yandex.va', 'yandex.sj', 'yandex.bv',
  'yandex.nr', 'yandex.nu', 'yandex.tf', 'yandex.yt', 'yandex.pm', 'yandex.wf',
  'yandex.re', 'yandex.gp', 'yandex.mq', 'yandex.gf', 'yandex.gd', 'yandex.lc',
  'yandex.vc', 'yandex.ag', 'yandex.dm', 'yandex.kn', 'yandex.ai', 'yandex.ms',
  'yandex.tc', 'yandex.vg', 'yandex.vi', 'yandex.pr', 'yandex.ky', 'yandex.bm',
  'yandex.fk', 'yandex.gs', 'yandex.sh', 'yandex.ac', 'yandex.ta', 'yandex.cx',
  'yandex.cc', 'yandex.co', 'yandex.io', 'yandex.tv', 'yandex.me', 'yandex.us'
];

export default function LoginModal({ isOpen, onClose, onSubmit }: LoginModalProps) {
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    countryCode: '+1',
    phoneNumber: '',
    email: '',
    company: ''
  });
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    const domain = email.split('@')[1].toLowerCase();
    return !freeEmailProviders.includes(domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newErrors: Partial<UserData> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please use a company email address (not Gmail, Outlook, Yahoo, etc.)';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit(formData);
      setFormData({
        firstName: '',
        lastName: '',
        countryCode: '+1',
        phoneNumber: '',
        email: '',
        company: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access AI Recommender</h2>
          <p className="text-slate-600">
            Please provide your information to continue with the storage calculation
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Country Code *
            </label>
            <select
              value={formData.countryCode}
              onChange={(e) => handleInputChange('countryCode', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} - {country.country}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="1234567890"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="john.doe@company.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Please use your company email address
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.company ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Your Company Name"
            />
            {errors.company && (
              <p className="text-red-500 text-xs mt-1">{errors.company}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Continue to Calculator'}
          </button>
        </form>
      </div>
    </div>
  );
}
