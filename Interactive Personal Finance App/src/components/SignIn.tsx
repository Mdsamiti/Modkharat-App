import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SignInProps {
  language: 'en' | 'ar';
  onSignIn: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
  onToggleLanguage: () => void;
}

export default function SignIn({ language, onSignIn, onSwitchToSignUp, onToggleLanguage }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isRTL = language === 'ar';

  const text = {
    en: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your Modkharat account',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot password?',
      signInButton: 'Sign In',
      noAccount: "Don't have an account?",
      signUpLink: 'Sign Up',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      or: 'or',
    },
    ar: {
      title: 'مرحباً بعودتك',
      subtitle: 'سجل دخولك إلى حساب مدخراتي',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      signInButton: 'تسجيل الدخول',
      noAccount: 'ليس لديك حساب؟',
      signUpLink: 'إنشاء حساب',
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordRequired: 'كلمة المرور مطلوبة',
      passwordMinLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      or: 'أو',
    },
  };

  const t = text[language];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; password?: string } = {};

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSignIn(email, password);
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

        {/* Sign In Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">{t.title}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Forgot Password */}
            <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
              <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                {t.forgotPassword}
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-medium"
            >
              {t.signInButton}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {t.noAccount}{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {t.signUpLink}
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