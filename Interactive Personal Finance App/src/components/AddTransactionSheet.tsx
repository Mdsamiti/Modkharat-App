import { ArrowUpRight, ArrowDownRight, Edit3, MessageSquare, Mic, Camera, X } from 'lucide-react';

interface AddTransactionSheetProps {
  language: 'en' | 'ar';
  transactionType: 'income' | 'expense' | null;
  onSelectType: (type: 'income' | 'expense') => void;
  onSelectMethod: (method: 'manual' | 'sms' | 'voice' | 'scan') => void;
  onClose: () => void;
}

export default function AddTransactionSheet({
  language,
  transactionType,
  onSelectType,
  onSelectMethod,
  onClose
}: AddTransactionSheetProps) {
  const captureMethods = [
    {
      id: 'manual',
      icon: Edit3,
      label: language === 'en' ? 'Manual Entry' : 'إدخال يدوي',
      description: language === 'en' ? 'Fill in transaction details' : 'إدخال تفاصيل المعاملة'
    },
    {
      id: 'sms',
      icon: MessageSquare,
      label: language === 'en' ? 'SMS Paste' : 'لصق رسالة نصية',
      description: language === 'en' ? 'Paste bank SMS message' : 'لصق رسالة البنك النصية'
    },
    {
      id: 'voice',
      icon: Mic,
      label: language === 'en' ? 'Voice Input' : 'إدخال صوتي',
      description: language === 'en' ? 'Speak transaction details' : 'نطق تفاصيل المعاملة'
    },
    {
      id: 'scan',
      icon: Camera,
      label: language === 'en' ? 'Scan Receipt' : 'مسح الإيصال',
      description: language === 'en' ? 'Capture receipt photo' : 'التقاط صورة الإيصال'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        <div className="p-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900">
              {language === 'en' ? 'Add Transaction' : 'إضافة معاملة'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Step 1: Select Type */}
          {!transactionType && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-4">
                {language === 'en' ? 'Select transaction type:' : 'اختر نوع المعاملة:'}
              </p>
              <button
                onClick={() => onSelectType('income')}
                className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-slate-900">{language === 'en' ? 'Income' : 'دخل'}</p>
                  <p className="text-sm text-slate-600">
                    {language === 'en' ? 'Money received' : 'أموال واردة'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSelectType('expense')}
                className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-slate-900">{language === 'en' ? 'Expense' : 'مصروف'}</p>
                  <p className="text-sm text-slate-600">
                    {language === 'en' ? 'Money spent' : 'أموال منصرفة'}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Select Capture Method */}
          {transactionType && (
            <div className="space-y-3">
              <button
                onClick={() => onSelectType(null!)}
                className="text-sm text-emerald-600 hover:text-emerald-700 mb-2"
              >
                ← {language === 'en' ? 'Change type' : 'تغيير النوع'}
              </button>
              
              <p className="text-sm text-slate-600 mb-4">
                {language === 'en' ? 'How would you like to add this transaction?' : 'كيف تريد إضافة هذه المعاملة؟'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {captureMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => onSelectMethod(method.id as any)}
                      className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-900">{method.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{method.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
