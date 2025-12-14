import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Calendar, 
  Plus, 
  Search, 
  Trash2, 
  Info, 
  Save, 
  Clock, 
  Receipt, 
  History, 
  ChevronRight, 
  Pill, 
  Layers, 
  Printer, 
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Phone,
  MapPin,
  ArrowRightLeft,
  Filter,
  Landmark,
  Banknote,
  Wallet,
  Check
} from 'lucide-react';
import { BillItem, Medicine, SalesHistoryItem, Customer } from '../types';

// --- Mock Data ---
const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'DOLO-650 MG TABS', batch: 'DOL9', expiry: '02/25', pack: 15, strip: 10, tab: 1, free: 0, mrp: 32.00, price: 32.50, disc: 0, gst: 12, amount: 0, salt: 'Paracetamol 500mg', manufacturer: 'Micro Labs', category: 'Analgesic', stock: 145 },
  { id: '2', name: 'DOLO-650 MG TABS', batch: 'DOL9', expiry: '12/32', pack: 15, strip: 10, tab: 1, free: 0, mrp: 32.00, price: 32.50, disc: 0, gst: 12, amount: 0, salt: 'Paracetamol 500mg', manufacturer: 'Micro Labs', category: 'Analgesic', stock: 45 },
  { id: '3', name: 'DOLO-650 MG TABS', batch: 'DOL9', expiry: '02/25', pack: 100, strip: 1, tab: 1, free: 0, mrp: 32.00, price: 32.50, disc: 0, gst: 12, amount: 0, salt: 'Paracetamol 500mg', manufacturer: 'Micro Labs', category: 'Analgesic', stock: 32 },
  { id: '4', name: 'Amoxyclav 625', batch: 'A9921', expiry: '10/25', pack: 6, strip: 1, tab: 1, free: 0, mrp: 120, price: 105, disc: 5, gst: 18, amount: 0, salt: 'Amoxicillin + Clavulanic', manufacturer: 'Sun Pharma', category: 'Antibiotic', stock: 50 },
  { id: '5', name: 'Cetirizine 10mg', batch: 'CET02', expiry: '09/33', pack: 10, strip: 1, tab: 1, free: 0, mrp: 45.00, price: 40.00, disc: 0, gst: 12, amount: 0, salt: 'Cetirizine Hydrochloride', manufacturer: 'Dr. Reddy', category: 'Anti-Allergic', stock: 180 },
  { id: '6', name: 'Pantop 40', batch: 'P442', expiry: '05/26', pack: 15, strip: 1, tab: 1, free: 1, mrp: 140, price: 110, disc: 0, gst: 12, amount: 0, salt: 'Pantoprazole 40mg', manufacturer: 'Aristo Pharma', category: 'Antacid', stock: 120 },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Ramesh Kumar', phone: '7780355664', address: 'Ramesh Nagar, Godavarikhani', state: 'Telangana', credits: 500 },
  { id: '2', name: 'Suresh Reddy', phone: '9876543210', address: 'MG Road, Bangalore', state: 'Karnataka', credits: 1200 },
  { id: '3', name: 'Lakshmi Prasad', phone: '8765432109', address: 'Jubilee Hills, Hyderabad', state: 'Telangana', credits: 0 },
  { id: '4', name: 'Priya Nair', phone: '6543210987', address: 'Banjara Hills, Hyderabad', state: 'Telangana', credits: 50 },
];

const MOCK_HISTORY: SalesHistoryItem[] = [
  { id: 'A000101', billNo: 'A000101', date: '2025-09-28', amount: 120.00, status: 'Paid', items: [{name: 'Dolo 650', qty: 8}] },
  { id: 'A000102', billNo: 'A000102', date: '2025-09-28', amount: 450.50, status: 'Paid', items: [{name: 'Azithral 500', qty: 3}] },
];

interface PaymentAccount {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'Cheque' | 'Wallet';
  description?: string;
  balance?: number;
}

const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  { id: 'cash-01', name: 'Cash on Hand', type: 'Cash', description: 'Distributor paid via Cash', balance: 67 },
  { id: 'hdfc-01', name: 'HDFC Bank', type: 'Bank', description: 'Warangal - Andhra Pradesh, Warangal', balance: 999 },
  { id: 'cheque-01', name: 'Paid-Out Cheque', type: 'Cheque' },
];

const SalesRetail: React.FC = () => {
  // --- STATE ---
  const [billDate] = useState('2025-09-28');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  
  // Payment State
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<PaymentAccount>(PAYMENT_ACCOUNTS[0]);
  const [dueDate, setDueDate] = useState('');
  
  // Billing State
  const [cashDiscountInput, setCashDiscountInput] = useState<string>('');
  const [useCredits, setUseCredits] = useState(false);
  const [isInterState, setIsInterState] = useState(false); // False = Intra (SGST/CGST), True = Inter (IGST)

  // Modals
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Collapsibles
  const [isPatientInfoOpen, setIsPatientInfoOpen] = useState(true);
  const [isBillingSummaryOpen, setIsBillingSummaryOpen] = useState(false); // Default collapsed detail

  // Search Terms
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // --- CALCULATIONS ---
  const totalMrp = selectedItems.reduce((acc, item) => acc + (item.mrp * item.qty), 0);
  const subTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const itemLevelDiscount = selectedItems.reduce((acc, item) => acc + (item.price * item.qty * (item.disc / 100)), 0);
  
  const taxableValue = subTotal - itemLevelDiscount;
  
  // Tax Calculations
  const sgst = isInterState ? 0 : taxableValue * 0.06;
  const cgst = isInterState ? 0 : taxableValue * 0.06;
  const igst = isInterState ? taxableValue * 0.12 : 0;
  const gstTotal = sgst + cgst + igst;
  
  // Bill Total before Cash Discount & Credits
  const billTotal = taxableValue + gstTotal;

  // Cash Discount Logic
  const cashDiscount = parseFloat(cashDiscountInput) || 0;

  // Credits Logic
  const availableCredits = selectedCustomer?.credits || 0;
  const creditsToDeduct = useCredits ? Math.min(availableCredits, billTotal - cashDiscount) : 0;

  // Final Payable
  const finalPayable = Math.max(0, billTotal - cashDiscount - creditsToDeduct);

  // --- HANDLERS ---
  const handleAddMedicine = (medicine: Medicine) => {
    const existing = selectedItems.find(i => i.id === medicine.id);
    if (existing) {
       handleQtyChange(medicine.id, existing.qty + 1);
    } else {
       setSelectedItems([...selectedItems, { ...medicine, qty: 1 }]);
    }
    setIsMedicineModalOpen(false);
  };

  const handleQtyChange = (id: string, qty: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, qty);
        const taxable = newQty * item.price;
        const discountAmt = taxable * (item.disc / 100);
        return { ...item, qty: newQty, amount: taxable - discountAmt };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
    if (activeRowId === id) setActiveRowId(null);
  };

  const handleCustomerSelect = (customer: Customer) => {
     setSelectedCustomer(customer);
     setUseCredits(false); // Reset credits when customer changes
     setIsCustomerModalOpen(false);
     
     // Auto-detect State for Tax
     if (customer.state && customer.state.toLowerCase() !== 'telangana') {
        setIsInterState(true);
     } else {
        setIsInterState(false);
     }
  };

  // Filtered Lists for Modals
  const filteredMedicines = useMemo(() => {
     return MOCK_MEDICINES.filter(m => 
       m.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
       m.salt.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
       m.batch.toLowerCase().includes(medicineSearchTerm.toLowerCase())
     );
  }, [medicineSearchTerm]);

  const filteredCustomers = useMemo(() => {
     return MOCK_CUSTOMERS.filter(c => 
       c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
       c.phone.includes(customerSearchTerm)
     );
  }, [customerSearchTerm]);

  return (
    <div className="flex h-full bg-gray-50/50 font-sans relative">
      
      {/* LEFT COLUMN: Main Transaction Area */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
        
        {/* 1. TOP: Patient & Payment Info (Collapsible) */}
        <div className={`bg-white border-b border-gray-200 shadow-sm flex-shrink-0 transition-all duration-300 ease-in-out ${isPatientInfoOpen ? 'max-h-[500px]' : 'max-h-[57px] overflow-hidden'}`}>
          <div 
             className="px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
             onClick={() => setIsPatientInfoOpen(!isPatientInfoOpen)}
          >
             <div className="flex items-center gap-2">
                <User className="text-gray-500" size={18}/>
                <h2 className="text-base font-bold text-gray-800">Patient Information</h2>
                {!isPatientInfoOpen && selectedCustomer && (
                   <span className="ml-4 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedCustomer.name}</span>
                )}
             </div>
             <div className="flex items-center gap-3">
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden" onClick={e => e.stopPropagation()}>
                    <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border-r border-gray-200">Bill Number</span>
                    <input type="text" value="INV-001" readOnly className="w-24 px-2 py-1.5 text-sm font-bold text-gray-700 bg-transparent outline-none"/>
                 </div>
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden" onClick={e => e.stopPropagation()}>
                    <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border-r border-gray-200">Date</span>
                    <input type="date" value={billDate} className="px-2 py-1.5 text-xs font-bold text-gray-700 bg-transparent outline-none"/>
                 </div>
                 {isPatientInfoOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
             </div>
          </div>

          <div className="px-6 pb-4 pt-1 grid grid-cols-2 gap-6">
              {/* Customer Details Box */}
              <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100/50 flex flex-col h-full relative">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Customer Details</label>
                  <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                      <input 
                        type="text" 
                        placeholder="Search Customer (Click to search)" 
                        value={selectedCustomer ? selectedCustomer.name : ''}
                        onClick={() => setIsCustomerModalOpen(true)}
                        readOnly
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer bg-white"
                      />
                  </div>
                  <div className="flex-1 bg-white rounded border border-gray-200 p-3 text-xs space-y-2 text-gray-600 shadow-sm">
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">Mob no.</span> <span className="font-semibold text-gray-800">{selectedCustomer?.phone || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">Address</span> <span className="text-right truncate max-w-[150px]">{selectedCustomer?.address || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">State</span> <span>{selectedCustomer?.state || '-'}</span></div>
                  </div>
              </div>

              {/* Payment Details Box */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full transition-colors hover:border-blue-300">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Payment</label>
                     <div 
                        className="relative w-48 cursor-pointer group"
                        onClick={() => setIsPaymentModalOpen(true)}
                     >
                        <div className="flex items-center justify-between bg-white border border-gray-300 group-hover:border-blue-500 px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all">
                           <span className="flex items-center gap-2">
                              {selectedPaymentAccount.type === 'Cash' && <Banknote size={14} className="text-green-600"/>}
                              {selectedPaymentAccount.type === 'Bank' && <Landmark size={14} className="text-blue-600"/>}
                              {selectedPaymentAccount.type === 'Cheque' && <CreditCard size={14} className="text-purple-600"/>}
                              {selectedPaymentAccount.name}
                           </span>
                           <ChevronDown size={12} className="text-gray-400"/>
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Due Date</label>
                            <input 
                              type="date" 
                              value={dueDate}
                              onChange={e => setDueDate(e.target.value)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 shadow-sm font-medium bg-white text-gray-800"
                            />
                         </div>
                         <div>
                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Applied Credits</label>
                            <input 
                              type="text" 
                              value={creditsToDeduct > 0 ? `- ₹${creditsToDeduct.toFixed(2)}` : '₹0.00'}
                              disabled
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-gray-100 text-gray-500 font-bold text-right" 
                            />
                         </div>
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1">
                             <label className="text-[10px] text-gray-500 font-bold">Total Customer Credits</label>
                             <span className="text-[10px] font-bold text-blue-600">{availableCredits > 0 ? `₹${availableCredits.toFixed(2)} Available` : 'No Credits'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: availableCredits > 0 ? '100%' : '0%' }}
                             ></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* 2. MIDDLE: Medicines Table */}
        <div className="flex-1 overflow-auto bg-white relative pb-10 flex flex-col">
          <div className="flex justify-between items-center px-4 py-2 bg-white sticky top-0 z-10 border-b border-dashed border-gray-200">
             <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                Medicines <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{selectedItems.length} Medicines</span>
             </div>
             <button 
                onClick={() => setIsMedicineModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-transform active:scale-95"
             >
                <Plus size={14}/> Add New Medicine
             </button>
          </div>
          
          {selectedItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Pill size={32} className="opacity-50"/>
               </div>
               <p className="text-sm font-medium">No medicines added.</p>
               <p className="text-xs mt-1">Click "Add New Medicine" to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 border-b text-center w-10">#</th>
                <th className="px-3 py-3 border-b w-[28%]">Medicine Name</th>
                <th className="px-3 py-3 border-b text-center">Batch</th>
                <th className="px-3 py-3 border-b text-center">Exp</th>
                <th className="px-3 py-3 border-b text-center">Pack</th>
                <th className="px-3 py-3 border-b text-center">Strip</th>
                <th className="px-3 py-3 border-b text-center">Free</th>
                <th className="px-3 py-3 border-b text-right">MRP</th>
                <th className="px-3 py-3 border-b text-right">Price</th>
                <th className="px-3 py-3 border-b text-center">Dis%</th>
                <th className="px-3 py-3 border-b text-right">Total</th>
                <th className="px-3 py-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {selectedItems.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className={`group hover:bg-blue-50/40 transition-colors relative ${activeRowId === item.id ? 'bg-blue-50/60' : ''}`}
                  onClick={() => setActiveRowId(item.id)}
                >
                  <td className="px-3 py-3 text-center text-xs text-gray-400">{idx+1}</td>
                  
                  {/* Medicine Name with Smart Hover Card */}
                  <td className="px-3 py-3 relative">
                    <div className="font-semibold text-gray-800 flex items-center gap-2 cursor-pointer">
                      {item.name}
                      {activeRowId === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.manufacturer}</div>
                    
                    {/* Hover Card */}
                    <div className="absolute left-8 top-8 z-[60] w-80 bg-white rounded-lg shadow-2xl border border-blue-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
                      <div className="flex items-start justify-between mb-3 border-b border-gray-50 pb-2">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                               <Pill size={16}/>
                            </div>
                            <div>
                               <div className="font-bold text-sm text-gray-800">{item.name}</div>
                               <div className="text-[10px] text-gray-500">{item.category}</div>
                            </div>
                         </div>
                         <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">In Stock</span>
                      </div>
                      <div className="space-y-3">
                         <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Salt Composition</div>
                            <div className="text-xs font-medium text-gray-700 leading-tight">{item.salt}</div>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                             <div><div className="text-[10px] font-bold text-gray-400 uppercase">Location</div><div className="text-xs font-medium text-gray-700"><Layers size={10} className="inline mr-1"/> Rack A-04</div></div>
                             <div><div className="text-[10px] font-bold text-gray-400 uppercase">Manufacturer</div><div className="text-xs font-medium text-gray-700 truncate">{item.manufacturer}</div></div>
                         </div>
                      </div>
                      <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-blue-100 transform rotate-45"></div>
                    </div>
                  </td>

                  <td className="px-3 py-3 font-mono text-xs text-gray-600 text-center">{item.batch}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-gray-200">{item.expiry}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.pack}</td>
                  <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.strip}</td>
                  <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.free}</td>
                  <td className="px-3 py-3 text-right text-gray-600 text-xs">₹{item.mrp}</td>
                  <td className="px-3 py-3 text-right text-gray-600 text-xs">₹{item.price}</td>
                  <td className="px-3 py-3 text-center text-gray-600 text-xs">{item.disc}</td>
                  <td className="px-3 py-3 text-right font-bold text-gray-800">₹{item.amount.toFixed(2)}</td>
                  <td className="px-3 py-3 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* 3. MINIMAL FOOTER */}
        <div className="bg-[#1a237e] text-blue-200 text-xs py-1.5 px-4 flex justify-between items-center select-none mt-auto z-20">
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">F10</span> Save</span>
            <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">F2</span> Search</span>
            <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">Alt+C</span> Patient</span>
          </div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">Alt+R</span> Return</span>
            <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">Esc</span> Clear</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Sidebar with Collapsible Billing & History */}
      <div className="w-[380px] bg-white flex flex-col z-30 shadow-2xl h-full border-l border-gray-200">
        
        {/* SECTION A: BILLING INFORMATION */}
        <div className="flex-shrink-0 bg-white">
           <div className="p-5 space-y-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                   <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Billing Summary</h2>
                   <div className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{selectedItems.length} Items</div>
                </div>

                {/* Primary Calculations (Always Visible) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm group">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="font-bold text-gray-800">₹ {subTotal.toFixed(2)}</span>
                    </div>

                    {/* Editable Cash Discount */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium border-b border-dashed border-gray-300">Cash Discount</span>
                        <div className="flex items-center w-24 border border-gray-300 rounded overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                           <span className="bg-gray-50 text-gray-500 px-2 py-1 text-xs border-r border-gray-300">₹</span>
                           <input 
                              type="number" 
                              value={cashDiscountInput}
                              onChange={(e) => setCashDiscountInput(e.target.value)}
                              placeholder="0"
                              className="w-full py-1 px-1 text-right text-sm font-bold text-gray-800 outline-none"
                           />
                        </div>
                    </div>
                    
                    {/* Tax Type Toggle */}
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-500 font-medium">Tax Type</span>
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                            <button 
                                onClick={() => setIsInterState(false)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isInterState ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Local
                            </button>
                            <button 
                                onClick={() => setIsInterState(true)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isInterState ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                IGST
                            </button>
                        </div>
                    </div>

                    {/* Credits Toggle (Only if available) */}
                    {availableCredits > 0 && (
                       <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-blue-800">Use Wallet Credits</span>
                             <span className="text-[10px] text-blue-600">Max available: ₹{availableCredits.toFixed(2)}</span>
                          </div>
                          <button 
                             onClick={() => setUseCredits(!useCredits)}
                             className={`relative w-10 h-5 rounded-full transition-colors ${useCredits ? 'bg-blue-600' : 'bg-gray-300'}`}
                          >
                             <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useCredits ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </button>
                       </div>
                    )}
                    
                    {/* Collapsible Details Trigger */}
                    <div 
                       onClick={() => setIsBillingSummaryOpen(!isBillingSummaryOpen)}
                       className="flex items-center gap-2 cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium select-none"
                    >
                       {isBillingSummaryOpen ? 'Hide Tax & Discounts' : 'Show Tax & Discounts'}
                       {isBillingSummaryOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </div>

                    {/* Collapsible Details Content */}
                    <div className={`overflow-hidden transition-all duration-300 space-y-2 ${isBillingSummaryOpen ? 'max-h-48 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Total MRP</span>
                            <span>₹ {totalMrp.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Item Discounts</span>
                            <span className="text-green-600 font-medium">- ₹ {itemLevelDiscount.toFixed(2)}</span>
                        </div>
                        {!isInterState ? (
                            <>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">SGST (6%)</span>
                                    <span>₹ {sgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">CGST (6%)</span>
                                    <span>₹ {cgst.toFixed(2)}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">IGST (12%)</span>
                                <span>₹ {igst.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Final Total */}
                    <div className="flex justify-between items-center text-base mt-4 pt-4 border-t border-dashed border-gray-300">
                        <span className="text-gray-800 font-bold">Final Amount</span>
                        <div className="text-right">
                           <span className="font-bold text-green-600 text-2xl">₹ {finalPayable.toFixed(2)}</span>
                           {creditsToDeduct > 0 && <div className="text-[10px] text-gray-400 font-medium mt-0.5">Includes ₹{creditsToDeduct.toFixed(2)} credit usage</div>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg text-xs font-bold transition-all">
                       <Save size={14}/> Save Draft
                   </button>
                   <button className="flex items-center justify-center gap-2 bg-[#1a237e] hover:bg-blue-800 text-white py-3 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all">
                       <Printer size={14}/> Print & Pay
                   </button>
                </div>
           </div>
        </div>

        {/* SECTION B: HISTORY */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 border-t border-gray-200">
          <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
            <h3 className="font-bold text-gray-600 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <History size={14} className="text-gray-400"/> Recent Sales
            </h3>
            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-default">
            {MOCK_HISTORY.map((sale) => (
              <div key={sale.id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex justify-between items-center">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-gray-800">{sale.billNo}</span>
                          <span className={`text-[9px] font-bold px-1.5 rounded-full ${sale.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {sale.status}
                          </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">{sale.date}</div>
                  </div>
                  <div className="text-right">
                      <div className="font-bold text-sm text-gray-900">₹{sale.amount.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400">{sale.items.length} Items</div>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. MEDICINE SELECTION MODAL */}
      {isMedicineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
               {/* Modal Header */}
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-800">Select Medicine & Batch</h3>
                  <button onClick={() => setIsMedicineModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"><X size={18}/></button>
               </div>
               
               {/* Search & Tabs */}
               <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="relative mb-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input 
                       autoFocus 
                       type="text" 
                       placeholder="Search By Product Name, Batch or Salt..." 
                       value={medicineSearchTerm}
                       onChange={e => setMedicineSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     />
                  </div>
                  <div className="flex gap-6 border-b border-gray-200 text-sm">
                     <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-bold px-1">Product</button>
                     <button className="pb-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 px-1 font-medium">Manufacturer</button>
                     <button className="pb-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 px-1 font-medium">Salt Composition</button>
                  </div>
               </div>

               {/* Table List */}
               <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                        <tr>
                           <th className="px-4 py-3 border-b text-center w-12"><input type="checkbox"/></th>
                           <th className="px-4 py-3 border-b">Product Description</th>
                           <th className="px-4 py-3 border-b text-center">Pack</th>
                           <th className="px-4 py-3 border-b text-center">Batch</th>
                           <th className="px-4 py-3 border-b text-center">Exp</th>
                           <th className="px-4 py-3 border-b text-center">Stock</th>
                           <th className="px-4 py-3 border-b text-right">MRP</th>
                           <th className="px-4 py-3 border-b text-right">Rate</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredMedicines.map((m) => (
                           <tr key={m.id} className="hover:bg-blue-50 cursor-pointer group" onClick={() => handleAddMedicine(m)}>
                              <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded text-blue-600"/></td>
                              <td className="px-4 py-3">
                                 <div className="font-bold text-gray-800 text-sm">{m.name}</div>
                                 <div className="text-[10px] text-gray-400">{m.salt}</div>
                              </td>
                              <td className="px-4 py-3 text-center text-xs text-gray-600">{m.pack}'s</td>
                              <td className="px-4 py-3 text-center text-xs font-mono text-gray-600">{m.batch}</td>
                              <td className="px-4 py-3 text-center text-xs font-medium text-gray-700">{m.expiry}</td>
                              <td className="px-4 py-3 text-center text-xs font-bold text-gray-800">{m.stock}</td>
                              <td className="px-4 py-3 text-right text-xs text-gray-600">{m.mrp.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-xs font-bold text-blue-700">{m.price.toFixed(2)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               {/* Modal Footer (Shortcuts) */}
               <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
                  <div className="flex gap-4">
                     <span className="flex items-center gap-1"><span className="bg-white border px-1 rounded shadow-sm">⇅</span> Navigate</span>
                     <span className="flex items-center gap-1"><span className="bg-white border px-1 rounded shadow-sm">↔</span> Switch Tab</span>
                     <span className="flex items-center gap-1"><span className="bg-white border px-1 rounded shadow-sm">Space</span> Toggle</span>
                     <span className="flex items-center gap-1"><span className="bg-white border px-1 rounded shadow-sm">Enter</span> Confirm</span>
                  </div>
                  <div>
                     <span className="flex items-center gap-1"><span className="bg-white border px-1 rounded shadow-sm">Esc</span> Close</span>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* 2. CUSTOMER SEARCH MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[500px] flex flex-col overflow-hidden">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-800">Search Customer</h3>
                  <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"><X size={18}/></button>
               </div>
               
               <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input 
                       autoFocus 
                       type="text" 
                       placeholder="Search By Name, Phone No..." 
                       value={customerSearchTerm}
                       onChange={e => setCustomerSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                        <tr>
                           <th className="px-4 py-3 border-b">Mobile No.</th>
                           <th className="px-4 py-3 border-b">Name</th>
                           <th className="px-4 py-3 border-b">Address</th>
                           <th className="px-4 py-3 border-b">State</th>
                           <th className="px-4 py-3 border-b text-right">Credits</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.map((c) => (
                           <tr key={c.id} className="hover:bg-blue-50 cursor-pointer group" onClick={() => handleCustomerSelect(c)}>
                              <td className="px-4 py-3 text-xs font-mono text-gray-600 group-hover:text-blue-600">{c.phone}</td>
                              <td className="px-4 py-3 text-xs font-bold text-gray-800">{c.name}</td>
                              <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-[200px]">{c.address}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{c.state}</td>
                              <td className="px-4 py-3 text-xs text-right font-bold text-green-600">{c.credits ? `₹${c.credits}` : '-'}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-right text-[10px] text-gray-500">
                  <span className="bg-white border px-1.5 py-0.5 rounded shadow-sm mr-2">Enter</span> to Select
                  <span className="bg-white border px-1.5 py-0.5 rounded shadow-sm ml-4 mr-2">Esc</span> to Close
               </div>
           </div>
        </div>
      )}

      {/* 3. PAYMENT MODE SELECTION MODAL */}
      {isPaymentModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
               <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Select a Payment Mode</h3>
               </div>
               <div className="max-h-[60vh] overflow-y-auto">
                   {PAYMENT_ACCOUNTS.map((account) => (
                      <div 
                         key={account.id} 
                         className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer group transition-colors"
                         onClick={() => {
                            setSelectedPaymentAccount(account);
                            setIsPaymentModalOpen(false);
                         }}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${account.id === selectedPaymentAccount.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors`}>
                               {account.type === 'Cash' && <Banknote size={20}/>}
                               {account.type === 'Bank' && <Landmark size={20}/>}
                               {account.type === 'Cheque' && <CreditCard size={20}/>}
                            </div>
                            <div>
                               <div className="font-bold text-gray-800 text-sm">{account.name}</div>
                               {account.description && <div className="text-[11px] text-gray-400">{account.description}</div>}
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            {account.balance !== undefined && (
                               <span className="text-sm font-bold text-green-600 font-mono">
                                  {account.balance}
                               </span>
                            )}
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500"/>
                         </div>
                      </div>
                   ))}
                   <div className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                         <Plus size={20}/>
                      </div>
                      <div>
                         <div className="font-bold text-gray-800 text-sm">Add New Account (F4)</div>
                         <div className="text-[11px] text-gray-400">New Bank Account or Digital Wallet or POS</div>
                      </div>
                   </div>
               </div>
               <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right text-xs text-gray-500 flex justify-start gap-4">
                  <span className="flex items-center gap-1"><span className="bg-white border px-1.5 py-0.5 rounded shadow-sm font-bold text-gray-700">Enter</span> to Select</span>
                  <span className="flex items-center gap-1"><span className="bg-white border px-1.5 py-0.5 rounded shadow-sm font-bold text-gray-700">Esc</span> to Close</span>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default SalesRetail;
