import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface SignUpProps {
  language: 'en' | 'ar';
  onSignUp: (name: string, email: string, password: string) => void;
  onSwitchToSignIn: () => void;
  onToggleLanguage: () => void;
}

export default function SignUp({ language, onSignUp, onSwitchToSignIn, onToggleLanguage }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const isRTL = language === 'ar';

  const text = {
    en: {
      title: 'Create Account',
      subtitle: 'Start your journey with Modkharat',
      nameLabel: 'Full Name',
      namePlaceholder: 'Enter your full name',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      termsAgree: 'I agree to the',
      termsLink: 'Terms & Conditions',
      signUpButton: 'Create Account',
      haveAccount: 'Already have an account?',
      signInLink: 'Sign In',
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      confirmPasswordRequired: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match',
      termsRequired: 'You must agree to the terms',
    },
    ar: {
      title: 'إنشاء حساب',
      subtitle: 'ابدأ رحلتك مع مدخراتي',
      nameLabel: 'الاسم الكامل',
      namePlaceholder: 'أدخل اسمك الكامل',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أنشئ كلمة مرور',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
      termsAgree: 'أوافق على',
      termsLink: 'الشروط والأحكام',
      signUpButton: 'إنشاء حساب',
      haveAccount: 'لديك حساب بالفعل؟',
      signInLink: 'تسجيل الدخول',
      nameRequired: 'الاسم مطلوب',
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordRequired: 'كلمة المرور مطلوبة',
      passwordMinLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      confirmPasswordRequired: 'يرجى تأكيد كلمة المرور',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      termsRequired: 'يجب الموافقة على الشروط',
    },
  };

  const t = text[language];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!email) {
      newErrors.email = t.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!password) {
      newErrors.password = t.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = t.passwordMinLength;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch;
    }

    if (!agreeToTerms) {
      newErrors.terms = t.termsRequired;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSignUp(name.trim(), email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Language Toggle Button */}
      <button
        onClick={onToggleLanguage}
        className="fixed top-4 right-4 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow text-sm font-medium text-slate-700 hover:text-emerald-600"
      >
        {language === 'en' ? 'العربية' : 'English'}
      </button>

      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {language === 'en' ? 'Modkharat' : 'مدخراتي'}
          </h1>
          <p className="text-slate-600">{t.subtitle}</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">{t.title}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">
                {t.nameLabel}
              </Label>
              <div className="relative">
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}>
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder={t.namePlaceholder}
                  className={`h-12 ${isRTL ? 'pr-11' : 'pl-11'} ${errors.name ? 'border-red-500' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                {t.emailLabel}
              </Label>
              <div className="relative">
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}>
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder={t.emailPlaceholder}
                  className={`h-12 ${isRTL ? 'pr-11' : 'pl-11'} ${errors.email ? 'border-red-500' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                {t.passwordLabel}
              </Label>
              <div className="relative">
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}>
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder={t.passwordPlaceholder}
                  className={`h-12 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} ${errors.password ? 'border-red-500' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                {t.confirmPasswordLabel}
              </Label>
              <div className="relative">
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}>
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  placeholder={t.confirmPasswordPlaceholder}
                  className={`h-12 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600`}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => {
                    setAgreeToTerms(checked as boolean);
                    if (errors.terms) setErrors({ ...errors, terms: undefined });
                  }}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                  {t.termsAgree}{' '}
                  <button type="button" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    {t.termsLink}
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium"
            >
              {t.signUpButton}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {t.haveAccount}{' '}
              <button
                onClick={onSwitchToSignIn}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {t.signInLink}
              </button>
            </p>
          </div>
        </div>

        {/* App Description */}
        <p className="text-center text-sm text-slate-500 mt-6">
          {language === 'en' 
            ? 'Your personal budgeting and savings companion' 
            : 'رفيقك الشخصي لإدارة الميزانية والادخار'}
        </p>
      </div>
    </div>
  );
}