import { useState } from 'react';
import { Search, Filter, ChevronDown, Edit3, MessageSquare, Mic, Camera, Paperclip, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionsProps {
  language: 'en' | 'ar';
}

export default function Transactions({ language }: TransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const transactions = [
    {
      id: '1',
      merchant: 'Carrefour',
      category: language === 'en' ? 'Shopping' : 'تسوق',
      amount: -245.50,
      date: '2025-11-26',
      type: 'expense',
      method: 'sms',
      hasReceipt: true
    },
    {
      id: '2',
      merchant: language === 'en' ? 'Salary - November' : 'راتب - نوفمبر',
      category: language === 'en' ? 'Income' : 'دخل',
      amount: 8500,
      date: '2025-11-25',
      type: 'income',
      method: 'manual',
      hasReceipt: false
    },
    {
      id: '3',
      merchant: 'Starbucks',
      category: language === 'en' ? 'Food & Dining' : 'طعام',
      amount: -32.00,
      date: '2025-11-24',
      type: 'expense',
      method: 'voice',
      hasReceipt: false
    },
    {
      id: '4',
      merchant: 'Uber',
      category: language === 'en' ? 'Transportation' : 'مواصلات',
      amount: -45.80,
      date: '2025-11-23',
      type: 'expense',
      method: 'manual',
      hasReceipt: false
    },
    {
      id: '5',
      merchant: 'IKEA',
      category: language === 'en' ? 'Shopping' : 'تسوق',
      amount: -156.75,
      date: '2025-11-22',
      type: 'expense',
      method: 'scan',
      hasReceipt: true
    },
    {
      id: '6',
      merchant: 'STC Bill',
      category: language === 'en' ? 'Utilities' : 'فواتير',
      amount: -125.00,
      date: '2025-11-21',
      type: 'expense',
      method: 'sms',
      hasReceipt: false
    },
    {
      id: '7',
      merchant: 'Freelance Project',
      category: language === 'en' ? 'Income' : 'دخل',
      amount: 2500,
      date: '2025-11-20',
      type: 'income',
      method: 'manual',
      hasReceipt: false
    },
    {
      id: '8',
      merchant: 'Al Nahdi Pharmacy',
      category: language === 'en' ? 'Healthcare' : 'صحة',
      amount: -89.50,
      date: '2025-11-19',
      type: 'expense',
      method: 'sms',
      hasReceipt: true
    }
  ];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'manual': return Edit3;
      case 'sms': return MessageSquare;
      case 'voice': return Mic;
      case 'scan': return Camera;
      default: return Edit3;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (searchQuery && !t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) && !t.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? 'Search transactions...' : 'بحث في المعاملات...'}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-slate-700">
              {language === 'en' ? 'Filters' : 'التصفية'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Date Range' : 'النطاق الزمني'}
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{language === 'en' ? 'All Time' : 'كل الأوقات'}</option>
                <option value="today">{language === 'en' ? 'Today' : 'اليوم'}</option>
                <option value="week">{language === 'en' ? 'This Week' : 'هذا الأسبوع'}</option>
                <option value="month">{language === 'en' ? 'This Month' : 'هذا الشهر'}</option>
                <option value="custom">{language === 'en' ? 'Custom Range' : 'نطاق مخصص'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Account' : 'الحساب'}
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{language === 'en' ? 'All Accounts' : 'كل الحسابات'}</option>
                <option value="main">{language === 'en' ? 'Main Account' : 'الحساب الرئيسي'}</option>
                <option value="savings">{language === 'en' ? 'Savings' : 'التوفير'}</option>
                <option value="cash">{language === 'en' ? 'Cash' : 'نقدي'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Category' : 'الفئة'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{language === 'en' ? 'All Categories' : 'كل الفئات'}</option>
                <option value="Shopping">{language === 'en' ? 'Shopping' : 'تسوق'}</option>
                <option value="Food">{language === 'en' ? 'Food & Dining' : 'طعام'}</option>
                <option value="Transport">{language === 'en' ? 'Transportation' : 'مواصلات'}</option>
                <option value="Utilities">{language === 'en' ? 'Utilities' : 'فواتير'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Type' : 'النوع'}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{language === 'en' ? 'All Types' : 'كل الأنواع'}</option>
                <option value="income">{language === 'en' ? 'Income' : 'دخل'}</option>
                <option value="expense">{language === 'en' ? 'Expense' : 'مصروف'}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">
              {language === 'en' ? 'No transactions found' : 'لا توجد معاملات'}
            </h3>
            <p className="text-sm text-slate-500">
              {language === 'en' ? 'Try adjusting your filters or search terms' : 'حاول تعديل التصفية أو البحث'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((transaction) => {
              const MethodIcon = getMethodIcon(transaction.method);
              return (
                <button
                  key={transaction.id}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-12 h-12 rounded-xl ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-slate-100'
                  } flex items-center justify-center flex-shrink-0`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900 truncate">{transaction.merchant}</p>
                      {transaction.hasReceipt && (
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-500">{transaction.category}</p>
                      <span className="text-slate-300">•</span>
                      <MethodIcon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{transaction.date}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
