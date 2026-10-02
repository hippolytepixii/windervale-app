import React, { useState, useEffect } from 'react';
import {
  FinancialTransaction,
  MoneySummary,
  ProjectMember,
  WaterfallReport
} from '../../../types';
import { api } from '../../../services/api';
import {
  Plus,
  Maximize2,
  X,
  Trash2,
  Coins,
  ArrowDownRight,
  CheckCircle,
  Clock,
  FileText,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
  onNavigateModule?: (moduleKey: string) => void;
}

export const MoneyTool: React.FC<ToolProps> = ({
  projectId,
  members,
  userRole,
  onEnterFocus,
  isFocusMode,
  onNavigateModule
}) => {
  const [summary, setSummary] = useState<MoneySummary>({
    funding: 0,
    expenses: 0,
    revenue: 0,
    remaining: 0,
    currency: 'INR'
  });
  const [waterfall, setWaterfall] = useState<WaterfallReport | null>(null);
  const [recoupment, setRecoupment] = useState<{
    totalRecoupable: number;
    totalRecouped: number;
    remainingToRecoup: number;
  }>({ totalRecoupable: 0, totalRecouped: 0, remainingToRecoup: 0 });
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'waterfall' | 'ledger' | 'payouts'>('waterfall');
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [type, setType] = useState<'funding' | 'expense' | 'payment' | 'revenue'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Stock & Materials');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('INR');
  const [isRecoupable, setIsRecoupable] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    loadMoney();
  }, [projectId]);

  const loadMoney = async () => {
    setLoading(true);
    try {
      const data = await api.getMoney(projectId);
      setSummary(data.summary);
      setTransactions(data.transactions || []);
      if (data.waterfall) setWaterfall(data.waterfall);
      if (data.recoupment) setRecoupment(data.recoupment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    try {
      await api.createTransaction(projectId, {
        type,
        amount: parseFloat(amount),
        currency,
        category,
        description,
        transaction_date: transactionDate,
        is_approved: 1,
        is_recoupable: isRecoupable ? 1 : 0,
        deduction_amount: deductionAmount ? parseFloat(deductionAmount) : 0,
        recipient_name: recipientName,
        status: 'approved'
      });
      setAmount('');
      setDescription('');
      setRecipientName('');
      setDeductionAmount('');
      setIsRecoupable(false);
      setCreateModal(false);
      loadMoney();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await api.approveTransaction(projectId, id);
      loadMoney();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove transaction from ledger?')) return;
    try {
      await api.deleteTransaction(projectId, id);
      loadMoney();
    } catch (err) {
      console.error(err);
    }
  };

  const currencySymbol = summary.currency === 'INR' ? '₹' : summary.currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">08 : MONEY</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
              FUNDING, BUDGETS, REVENUE &amp; PAYOUTS
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">
            CREATIVE PROJECT ECONOMICS &amp; WATERFALL
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-wine text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ RECORD TRANSACTION</span>
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>FOCUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Financial Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-[2px] border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000]">
          <span className="font-mono text-[9px] uppercase font-bold text-black/60 block">
            01. FUNDING RAISED
          </span>
          <p className="font-mono font-black text-2xl text-black mt-1">
            {currencySymbol} {summary.funding.toLocaleString()}
          </p>
          <span className="font-fun text-[10px] text-black/60">Grants &amp; Patron Contributions</span>
        </div>

        <div className="border-[2px] border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000]">
          <span className="font-mono text-[9px] uppercase font-bold text-black/60 block">
            02. APPROVED EXPENSES
          </span>
          <p className="font-mono font-black text-2xl text-[#C84B31] mt-1">
            {currencySymbol} {summary.expenses.toLocaleString()}
          </p>
          <span className="font-fun text-[10px] text-black/60">Actual Production Costs</span>
        </div>

        <div className="border-[2px] border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000]">
          <span className="font-mono text-[9px] uppercase font-bold text-black/60 block">
            03. GROSS REVENUE
          </span>
          <p className="font-mono font-black text-2xl text-[#2D7A4C] mt-1">
            {currencySymbol} {summary.revenue.toLocaleString()}
          </p>
          <span className="font-fun text-[10px] text-black/60">Streaming, Sync &amp; Licensing</span>
        </div>

        <div className="border-[2px] border-black bg-[#fbf6f0] p-4 shadow-[2px_2px_0px_0px_#000]">
          <span className="font-mono text-[9px] uppercase font-bold text-black/60 block">
            04. DISTRIBUTABLE POOL
          </span>
          <p className="font-mono font-black text-2xl text-[#6A1A4C] mt-1">
            {currencySymbol} {waterfall ? waterfall.distributableRevenue.toLocaleString() : summary.remaining.toLocaleString()}
          </p>
          <span className="font-fun text-[10px] text-black/60">Net Distributable Revenue</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-[2px] border-black pb-2">
        <button
          onClick={() => setActiveTab('waterfall')}
          className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border border-black cursor-pointer transition-colors ${
            activeTab === 'waterfall'
              ? 'bg-black text-white'
              : 'bg-[#fbf6f0] text-black hover:bg-white'
          }`}
        >
          TRANSPARENT WATERFALL CALCULATION
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border border-black cursor-pointer transition-colors ${
            activeTab === 'payouts'
              ? 'bg-black text-white'
              : 'bg-[#fbf6f0] text-black hover:bg-white'
          }`}
        >
          CONTRIBUTOR PAYOUTS &amp; STATEMENTS ({waterfall?.payouts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border border-black cursor-pointer transition-colors ${
            activeTab === 'ledger'
              ? 'bg-black text-white'
              : 'bg-[#fbf6f0] text-black hover:bg-white'
          }`}
        >
          COMPLETE FINANCIAL LEDGER ({transactions.length})
        </button>
      </div>

      {/* TAB 1: TRANSPARENT WATERFALL */}
      {activeTab === 'waterfall' && (
        <div className="space-y-6">
          {/* Step-by-Step Waterfall Formula Card */}
          <div className="border-[2.5px] border-black bg-white p-6 shadow-[3px_3px_0px_0px_#000] space-y-5">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#6A1A4C] tracking-wider flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" />
                  VISIBLE MATH BREAKDOWN
                </span>
                <h3 className="font-display font-black text-xl text-black">
                  Project Revenue Waterfall Sequence
                </h3>
              </div>
              <span className="font-mono text-xs text-black/60 uppercase">
                CONTRACTUAL SPLIT RULES FROM 02 RIGHTS
              </span>
            </div>

            {/* Sequence Steps */}
            <div className="space-y-3 font-mono text-xs">
              {waterfall?.steps?.map((step, idx) => (
                <div
                  key={step.label}
                  className="p-3 bg-[#fbf6f0] border border-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-black text-white font-bold text-[10px]">
                      STEP 0{idx + 1}
                    </span>
                    <div>
                      <h5 className="font-fun font-bold text-sm text-black">{step.label}</h5>
                      <span className="text-[10px] text-black/60 block">{step.notes}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-black">
                      {currencySymbol} {step.amount.toLocaleString()}
                    </span>
                    {step.formula && (
                      <span className="font-mono text-[10px] text-[#6A1A4C] block font-bold">
                        {step.formula}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recoupment Status */}
            {recoupment.totalRecoupable > 0 && (
              <div className="p-3.5 border border-black bg-[#f3eae4] text-xs font-mono space-y-1">
                <span className="font-bold uppercase text-[10px] text-black/70">
                  RECOUPMENT STATUS (Contractually Recoverable Costs):
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Total Recoverable: {currencySymbol} {recoupment.totalRecoupable.toLocaleString()}</span>
                  <span>Recouped To Date: {currencySymbol} {recoupment.totalRecouped.toLocaleString()}</span>
                  <span className="font-bold text-[#C84B31]">
                    Remaining to Recoup: {currencySymbol} {recoupment.remainingToRecoup.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Individual Payouts with Visible Math */}
          <div className="border-[2.5px] border-black bg-white p-6 shadow-[3px_3px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#6A1A4C] tracking-wider">
                  CONTRACTUAL PAYOUT ALLOCATION
                </span>
                <h3 className="font-display font-black text-xl text-black">
                  Why each payout is calculated:
                </h3>
              </div>
              <button
                onClick={() => onNavigateModule?.('02_RIGHTS')}
                className="font-mono text-xs uppercase font-bold text-[#6A1A4C] hover:underline cursor-pointer"
              >
                Modify Splits in 02 RIGHTS &rarr;
              </button>
            </div>

            {waterfall && waterfall.payouts.length > 0 ? (
              <div className="divide-y divide-black/15 font-mono text-xs">
                {waterfall.payouts.map((p) => (
                  <div key={p.contributorName} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-fun font-bold text-base text-black">
                          {p.contributorName}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-[#fbf6f0] border border-black/40 text-[9px] uppercase font-bold text-black/70">
                          {p.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-black/60 font-mono block mt-0.5">
                        Contractual Allocation: <strong>{p.splitPercentage}%</strong> of distributable pool
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-black text-[#6A1A4C]">
                        {currencySymbol} {p.netPayout.toLocaleString()}
                      </span>
                      <span className="font-mono text-[10px] text-black/70 block bg-[#fbf6f0] px-2 py-0.5 border border-black/20 mt-1">
                        MATH: {p.formula}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-black/60 bg-[#fbf6f0] border border-dashed border-black/30">
                No rights splits established yet. Add contributors and percentages in 02 RIGHTS to calculate waterfall allocations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAYOUTS & STATEMENTS */}
      {activeTab === 'payouts' && (
        <div className="border-[2px] border-black bg-white p-6 space-y-4 shadow-[2px_2px_0px_0px_#000]">
          <div className="border-b border-black/15 pb-3 flex items-center justify-between">
            <h3 className="font-fun font-bold text-lg text-black uppercase">
              Contributor Payout Statements
            </h3>
            <span className="font-mono text-[10px] text-black/60 uppercase">
              Auditable Statement Archive
            </span>
          </div>

          {waterfall && waterfall.payouts.length > 0 ? (
            <div className="space-y-3 font-mono text-xs">
              {waterfall.payouts.map((p) => (
                <div key={p.contributorName} className="p-4 border border-black bg-[#fbf6f0] space-y-2">
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <span className="font-bold text-black text-sm">{p.contributorName} &middot; Statement</span>
                    <span className="px-2 py-0.5 bg-black text-white text-[9px] uppercase font-bold">
                      STATUS : {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-black/60 block">Distributable Base:</span>
                      <span className="font-bold">{currencySymbol} {waterfall.distributableRevenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-black/60 block">Contractual Split:</span>
                      <span className="font-bold">{p.splitPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-black/60 block">Prior Deductions:</span>
                      <span className="font-bold">{currencySymbol} {p.priorRecoupmentDeduction.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-black/60 block">Net Payable:</span>
                      <span className="font-bold text-[#6A1A4C]">{currencySymbol} {p.netPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-xs text-black/60 p-4 text-center">No statements generated.</p>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETE FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="border-[2px] border-black bg-white p-6 space-y-4 shadow-[2px_2px_0px_0px_#000]">
          <div className="border-b border-black/15 pb-3 flex items-center justify-between">
            <h3 className="font-fun font-bold text-lg text-black uppercase">
              Financial Transactions Ledger
            </h3>
            <span className="font-mono text-[10px] text-black/60 uppercase">
              {transactions.length} Total Records
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="font-fun text-sm text-black/60 p-8 text-center">
              No transactions recorded yet. Click Record Transaction above to track funding, expenses, or revenue.
            </p>
          ) : (
            <div className="divide-y divide-black/15 font-mono text-xs">
              {transactions.map((t) => (
                <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase font-bold border border-black ${
                        t.type === 'revenue'
                          ? 'bg-[#2D7A4C] text-white'
                          : t.type === 'funding'
                          ? 'bg-[#6A1A4C] text-white'
                          : 'bg-black text-white'
                      }`}
                    >
                      {t.type}
                    </span>
                    <div>
                      <h4 className="font-fun font-bold text-sm text-black">
                        {t.category} {t.description ? ` - ${t.description}` : ''}
                      </h4>
                      <span className="text-[10px] text-black/60">
                        {t.transaction_date} &middot; Recorded by {t.recorder_name || 'Collaborator'}
                        {t.is_recoupable === 1 ? ' &middot; [RECOUPABLE]' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-bold ${
                        t.type === 'revenue'
                          ? 'text-[#2D7A4C]'
                          : t.type === 'funding'
                          ? 'text-[#6A1A4C]'
                          : 'text-[#C84B31]'
                      }`}
                    >
                      {t.type === 'revenue' || t.type === 'funding' ? '+' : '-'} {currencySymbol} {t.amount.toLocaleString()}
                    </span>

                    {userRole !== 'viewer' && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-black/40 hover:text-[#C84B31] cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RECORD TRANSACTION MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  RECORD FINANCIAL ENTRY
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  New Project Transaction
                </h3>
              </div>
              <button
                onClick={() => setCreateModal(false)}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  >
                    <option value="expense">Expense (Production Cost)</option>
                    <option value="funding">Funding (Grant / Patron)</option>
                    <option value="revenue">Revenue (Sales / Streaming)</option>
                    <option value="payment">Payout / Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-sm text-black focus:outline-none"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  placeholder="e.g. Film Stock, Studio Rental, Sound Design, Grant Funding"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Description / Payee
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  placeholder="e.g. 5 Rolls 16mm Vision3 250D from Kodak"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-sm text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {type === 'expense' && (
                <div className="p-3 bg-white border border-black/20 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold text-black">
                    <input
                      type="checkbox"
                      checked={isRecoupable}
                      onChange={(e) => setIsRecoupable(e.target.checked)}
                      className="w-4 h-4 accent-[#6A1A4C]"
                    />
                    <span>Contractually Recoverable / Recoupable from gross revenue</span>
                  </label>
                </div>
              )}

              {type === 'revenue' && (
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Permitted Deductions (Fees, Commissions)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-sm text-black focus:outline-none"
                    placeholder="e.g. 5000"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-wine text-xs px-5 py-2 cursor-pointer font-bold"
                >
                  RECORD TRANSACTION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
