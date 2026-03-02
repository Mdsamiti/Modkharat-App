import { useState } from 'react';
import { X, ArrowLeft, Upload, Mic, Camera, MessageSquare, Check } from 'lucide-react';

interface TransactionFormProps {
  language: 'en' | 'ar';
  transactionType: 'income' | 'expense';
  captureMethod: 'manual' | 'sms' | 'voice' | 'scan';
  onSave: () => void;
  onBack: () => void;
  onClose: () => void;
}

export default function TransactionForm({
  language,
  transactionType,
  captureMethod,
  onSave,
  onBack,
  onClose
}: TransactionFormProps) {
  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [amount, setAmount] = useState('245.50');
  const [category, setCategory] = useState('Shopping');
  const [merchant, setMerchant] = useState('Carrefour');
  const [date, setDate] = useState('2025-11-27');
  const [account, setAccount] = useState('main');
  const [notes, setNotes] = useState('');
  const [smsText, setSmsText] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const categories = language === 'en'
    ? ['Shopping', 'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Other']
    : ['تسوق', 'طعام', 'مواصلات', 'سكن', 'فواتير', 'ترفيه', 'صحة', 'تعليم', 'أخرى'];

  const accounts = [
    { id: 'main', name: language === 'en' ? 'Main Account' : 'الحساب الرئيسي' },
    { id: 'savings', name: language === 'en' ? 'Savings Account' : 'حساب التوفير' },
    { id: 'cash', name: language === 'en' ? 'Cash' : 'نقدي' }
  ];

  const handleContinue = () => {
    if (captureMethod === 'sms') {
      // Parse SMS (mock)
      setAmount('245.50');
      setMerchant('Carrefour');
      setCategory('Shopping');
    } else if (captureMethod === 'voice') {
      // Parse voice (mock)
      setAmount('32.00');
      setMerchant('Starbucks');
      setCategory('Food & Dining');
    } else if (captureMethod === 'scan') {
      // Parse receipt (mock)
      setAmount('156.75');
      setMerchant('IKEA');
      setCategory('Shopping');
    }
    setStep('review');
  };

  const handleSave = () => {
    onSave();
  };

  const renderCaptureStep = () => {
    switch (captureMethod) {
      case 'manual':
        return renderManualForm();
      case 'sms':
        return renderSMSCapture();
      case 'voice':
        return renderVoiceCapture();
      case 'scan':
        return renderScanCapture();
      default:
        return null;
    }
  };

  const renderManualForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Amount' : 'المبلغ'}
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            {language === 'en' ? 'SAR' : 'ر.س'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Date' : 'التاريخ'}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Account' : 'الحساب'}
        </label>
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Category' : 'الفئة'}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Merchant (Optional)' : 'التاجر (اختياري)'}
        </label>
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder={language === 'en' ? 'e.g., Carrefour' : 'مثال: كارفور'}
        />
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Notes (Optional)' : 'ملاحظات (اختياري)'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          rows={3}
          placeholder={language === 'en' ? 'Add any notes...' : 'أضف ملاحظات...'}
        />
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'Receipt (Optional)' : 'الإيصال (اختياري)'}
        </label>
        <button className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
          <Upload className="w-5 h-5 text-slate-500" />
          <span className="text-slate-700">
            {language === 'en' ? 'Upload receipt' : 'رفع إيصال'}
          </span>
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
      >
        {language === 'en' ? 'Save Transaction' : 'حفظ المعاملة'}
      </button>
    </div>
  );

  const renderSMSCapture = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-blue-900">
          {language === 'en' ? 'Paste your bank SMS message below' : 'الصق رسالة البنك النصية أدناه'}
        </p>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-2">
          {language === 'en' ? 'SMS Message' : 'الرسالة النصية'}
        </label>
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          rows={6}
          placeholder={language === 'en' ? 'Paste SMS message here...' : 'الصق الرسالة هنا...'}
        />
      </div>

      {smsText && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-900 mb-2">
            {language === 'en' ? 'Detected:' : 'تم الكشف:'}
          </p>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-600">{language === 'en' ? 'Amount:' : 'المبلغ:'}</span> <span className="text-slate-900">245.50 SAR</span></p>
            <p><span className="text-slate-600">{language === 'en' ? 'Merchant:' : 'التاجر:'}</span> <span className="text-slate-900">Carrefour</span></p>
            <p><span className="text-slate-600">{language === 'en' ? 'Date:' : 'التاريخ:'}</span> <span className="text-slate-900">2025-11-27</span></p>
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!smsText}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {language === 'en' ? 'Continue' : 'متابعة'}
      </button>
    </div>
  );

  const renderVoiceCapture = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <Mic className="w-5 h-5 text-purple-600" />
        <p className="text-sm text-purple-900">
          {language === 'en' ? 'Tap the microphone to start recording' : 'اضغط على الميكروفون لبدء التسجيل'}
        </p>
      </div>

      <div className="flex justify-center py-8">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 scale-110'
              : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          <Mic className="w-12 h-12 text-white" />
        </button>
      </div>

      {isRecording && (
        <div className="flex justify-center">
          <div className="flex gap-1">
            <div className="w-1 h-8 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-12 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-10 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-1 h-14 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
          </div>
        </div>
      )}

      {voiceTranscript && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-600 mb-2">
            {language === 'en' ? 'Transcript:' : 'النص:'}
          </p>
          <p className="text-slate-900">{voiceTranscript}</p>
        </div>
      )}

      {voiceTranscript && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-900 mb-2">
            {language === 'en' ? 'Detected:' : 'تم الكشف:'}
          </p>
          <div className="space-y-1 text-sm">
            <p><span className="text-slate-600">{language === 'en' ? 'Amount:' : 'المبلغ:'}</span> <span className="text-slate-900">32.00 SAR</span></p>
            <p><span className="text-slate-600">{language === 'en' ? 'Category:' : 'الفئة:'}</span> <span className="text-slate-900">Food & Dining</span></p>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setVoiceTranscript('I spent 32 riyals at Starbucks for coffee');
          setIsRecording(false);
          setTimeout(() => handleContinue(), 500);
        }}
        disabled={!isRecording && !voiceTranscript}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRecording ? (language === 'en' ? 'Stop Recording' : 'إيقاف التسجيل') : (language === 'en' ? 'Continue' : 'متابعة')}
      </button>
    </div>
  );

  const renderScanCapture = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Camera className="w-5 h-5 text-amber-600" />
        <p className="text-sm text-amber-900">
          {language === 'en' ? 'Position the receipt within the frame' : 'ضع الإيصال داخل الإطار'}
        </p>
      </div>

      <div className="aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-80 border-2 border-white/50 rounded-xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-slate-900" />
        </button>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <p className="text-sm text-emerald-900 mb-2">
          {language === 'en' ? 'Detected from receipt:' : 'تم الكشف من الإيصال:'}
        </p>
        <div className="space-y-1 text-sm">
          <p><span className="text-slate-600">{language === 'en' ? 'Total:' : 'الإجمالي:'}</span> <span className="text-slate-900">156.75 SAR</span></p>
          <p><span className="text-slate-600">{language === 'en' ? 'Merchant:' : 'التاجر:'}</span> <span className="text-slate-900">IKEA</span></p>
          <p><span className="text-slate-600">{language === 'en' ? 'Date:' : 'التاريخ:'}</span> <span className="text-slate-900">2025-11-27</span></p>
        </div>
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
      >
        {language === 'en' ? 'Continue' : 'متابعة'}
      </button>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
        <Check className="w-5 h-5 text-emerald-600" />
        <p className="text-sm text-emerald-900">
          {language === 'en' ? 'Review and confirm transaction details' : 'راجع وأكد تفاصيل المعاملة'}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Type' : 'النوع'}</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            transactionType === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {transactionType === 'income' ? (language === 'en' ? 'Income' : 'دخل') : (language === 'en' ? 'Expense' : 'مصروف')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Amount' : 'المبلغ'}</span>
          <span className="text-slate-900">{amount} {language === 'en' ? 'SAR' : 'ر.س'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Category' : 'الفئة'}</span>
          <span className="text-slate-900">{category}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Merchant' : 'التاجر'}</span>
          <span className="text-slate-900">{merchant}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Date' : 'التاريخ'}</span>
          <span className="text-slate-900">{date}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Account' : 'الحساب'}</span>
          <span className="text-slate-900">
            {accounts.find(a => a.id === account)?.name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{language === 'en' ? 'Method' : 'الطريقة'}</span>
          <span className="text-slate-900 capitalize">{captureMethod}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('capture')}
          className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-colors"
        >
          {language === 'en' ? 'Edit' : 'تعديل'}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
        >
          {language === 'en' ? 'Save' : 'حفظ'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
        <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h2 className="text-slate-900">
              {step === 'capture'
                ? (language === 'en' ? 'Add Transaction' : 'إضافة معاملة')
                : (language === 'en' ? 'Review Transaction' : 'مراجعة المعاملة')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          <div className="p-6">
            {step === 'capture' ? renderCaptureStep() : renderReviewStep()}
          </div>
        </div>
      </div>
    </>
  );
}
