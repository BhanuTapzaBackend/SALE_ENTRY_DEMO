import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  CreditCard, 
  FileText, 
  MapPin, 
  Phone, 
  Mail,
  Landmark,
  Banknote,
  History,
  Pill,
  Calendar,
  Layers,
  X,
  Wallet
} from 'lucide-react';
import { Supplier, SalesHistoryItem, MasterMedicine, PurchaseItem } from '../types';

// --- Mock Data ---
const MOCK_SUPPLIERS: Supplier[] = [
  { 
    id: 'S001', 
    name: 'Apollo Pharmacy Distributors', 
    email: 'orders@apollo.com', 
    mobile: '9876543210', 
    address: 'Plot 45, Ind. Area, Hyderabad', 
    type: 'Wholesaler', 
    drugLicenseNo: 'TG/20B/1234', 
    gstin: '36ABCDE1234F1Z5',
    bankName: 'HDFC Bank',
    accountNumber: '50100234567890',
    ifscCode: 'HDFC0001234',
    upiId: 'apollo@hdfcbank',
    walletBalance: 2500.00
  },
  { 
    id: 'S002', 
    name: 'Sun Pharma Agencies', 
    email: 'sales@sunpharma.com', 
    mobile: '8877665544', 
    address: 'Koti, Hyderabad, Telangana', 
    type: 'Manufacturer', 
    drugLicenseNo: 'TG/21B/5678', 
    gstin: '36XYZDE9876F1Z5',
    bankName: 'SBI',
    accountNumber: '30201040506',
    ifscCode: 'SBIN0004567',
    upiId: 'sunpharma@sbi',
    walletBalance: 0
  }
];

const MOCK_MASTER_MEDICINES: MasterMedicine[] = [
  {
      "_id": "693dc24fa4519ca048c03c87",
      "medicineId": "MED000000004",
      "medicineName": "Dolo 650",
      "manufacturerName": "Micro Labs Limited",
      "saltComposition": "Paracetamol 650mg",
      "hsnCode": "30049099",
      "sgstPercent": 6,
      "cgstPercent": 6,
      "igstPercent": 12,
      "unitPerPack": 10,
      "medicinePackingType": "STRIP"
  },
  {
      "_id": "693dc24fa4519ca048c03c88",
      "medicineId": "MED000000005",
      "medicineName": "Amoxyclav 625",
      "manufacturerName": "Sun Pharma",
      "saltComposition": "Amoxicillin + Clavulanic Acid",
      "hsnCode": "30049000",
      "sgstPercent": 9,
      "cgstPercent": 9,
      "igstPercent": 18,
      "unitPerPack": 6,
      "medicinePackingType": "STRIP"
  }
];

const MOCK_HISTORY: SalesHistoryItem[] = [
  { id: 'P001', billNo: 'PUR-2025-001', date: '2025-09-20', amount: 15400.00, status: 'Paid', items: [{name: 'Dolo 650', qty: 500}] },
];

const PurchaseEntry: React.FC = () => {
  // --- STATE ---
  const [purchaseDate] = useState('2025-09-28');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  
  // Collapsibles
  const [isSupplierInfoOpen, setIsSupplierInfoOpen] = useState(true);
  const [isBillingSummaryOpen, setIsBillingSummaryOpen] = useState(false);
  
  // Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  
  // Search
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');

  // Payment State
  const [cashDiscountInput, setCashDiscountInput] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [useWallet, setUseWallet] = useState(false);
  const [isInterState, setIsInterState] = useState(false);

  // --- CALCULATIONS ---
  const subTotal = selectedItems.reduce((acc, item) => acc + (item.rate * item.qty), 0);
  const itemLevelDiscount = selectedItems.reduce((acc, item) => acc + (item.rate * item.qty * (item.discountPercent / 100)), 0);
  const taxableValue = subTotal - itemLevelDiscount;
  
  const sgst = isInterState ? 0 : taxableValue * 0.06; // Simplified tax calc for demo, ideally per item
  const cgst = isInterState ? 0 : taxableValue * 0.06;
  const igst = isInterState ? taxableValue * 0.12 : 0;
  const gstTotal = sgst + cgst + igst;
  
  const billTotal = taxableValue + gstTotal;
  const cashDiscount = parseFloat(cashDiscountInput) || 0;
  
  // Wallet Logic
  const walletBalance = selectedSupplier?.walletBalance || 0;
  const walletToDeduct = useWallet ? Math.min(walletBalance, billTotal - cashDiscount) : 0;
  
  const finalPayable = Math.max(0, billTotal - cashDiscount - walletToDeduct);

  // --- HANDLERS ---
  const handleAddMasterMedicine = (masterItem: MasterMedicine) => {
    const newItem: PurchaseItem = {
      ...masterItem,
      uniqueId: Date.now().toString(),
      batchNumber: '',
      expiryDate: '',
      mrp: 0,
      rate: 0,
      qty: 0,
      free: 0,
      discountPercent: 0,
      amount: 0
    };
    setSelectedItems([...selectedItems, newItem]);
    setIsMedicineModalOpen(false);
  };

  const handleItemChange = (id: string, field: keyof PurchaseItem, value: any) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.uniqueId === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate amount
        const baseAmount = updatedItem.rate * updatedItem.qty;
        const discountAmount = baseAmount * (updatedItem.discountPercent / 100);
        updatedItem.amount = baseAmount - discountAmount;
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.uniqueId !== id));
    if (activeRowId === id) setActiveRowId(null);
  };

  const handleSupplierSelect = (supplier: Supplier) => {
     setSelectedSupplier(supplier);
     setUseWallet(false);
     setIsSupplierModalOpen(false);
     if (supplier.address && !supplier.address.toLowerCase().includes('telangana')) {
        setIsInterState(true);
     } else {
        setIsInterState(false);
     }
  };

  // Filtered Lists
  const filteredSuppliers = useMemo(() => {
    return MOCK_SUPPLIERS.filter(s => 
      s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) || 
      s.gstin.toLowerCase().includes(supplierSearchTerm.toLowerCase())
    );
  }, [supplierSearchTerm]);

  const filteredMedicines = useMemo(() => {
    return MOCK_MASTER_MEDICINES.filter(m => 
      m.medicineName.toLowerCase().includes(medicineSearchTerm.toLowerCase())
    );
  }, [medicineSearchTerm]);

  return (
    <div className="flex h-full bg-gray-50/50 font-sans relative">
       {/* LEFT COLUMN: Main Transaction Area */}
       <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
          
          {/* 1. TOP: Purchase & Supplier Information */}
          <div className={`bg-white border-b border-gray-200 shadow-sm flex-shrink-0 transition-all duration-300 ease-in-out ${isSupplierInfoOpen ? 'max-h-[600px]' : 'max-h-[57px] overflow-hidden'}`}>
             <div 
                className="px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => setIsSupplierInfoOpen(!isSupplierInfoOpen)}
             >
                <div className="flex items-center gap-2">
                   <Building2 className="text-gray-500" size={18}/>
                   <h2 className="text-base font-bold text-gray-800">Purchase Information</h2>
                   {!isSupplierInfoOpen && selectedSupplier && (
                      <span className="ml-4 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedSupplier.name}</span>
                   )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden" onClick={e => e.stopPropagation()}>
                       <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border-r border-gray-200">Invoice No</span>
                       <input 
                          type="text" 
                          placeholder="Enter No."
                          value={invoiceNo} 
                          onChange={e => setInvoiceNo(e.target.value)}
                          className="w-24 px-2 py-1.5 text-sm font-bold text-gray-700 bg-transparent outline-none placeholder-gray-400"
                       />
                    </div>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden" onClick={e => e.stopPropagation()}>
                       <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border-r border-gray-200">Date</span>
                       <input type="date" value={purchaseDate} className="px-2 py-1.5 text-xs font-bold text-gray-700 bg-transparent outline-none"/>
                    </div>
                    {isSupplierInfoOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                </div>
             </div>

             {/* Detailed Supplier Form */}
             <div className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-12 gap-6">
                   
                   {/* Col 1: General Info */}
                   <div className="col-span-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-800 uppercase tracking-wide">
                        <User size={12}/> Supplier Details
                      </div>
                      <div className="relative">
                         <label className="text-[10px] font-bold text-gray-500">Supplier Name <span className="text-red-500">*</span></label>
                         <div className="relative mt-1">
                            <input 
                              type="text" 
                              placeholder="Search or Enter Supplier Name"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={selectedSupplier ? selectedSupplier.name : ''}
                              onClick={() => setIsSupplierModalOpen(true)}
                              readOnly
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[10px] font-bold text-gray-500">Mobile Number</label>
                            <div className="relative mt-1">
                               <input type="text" value={selectedSupplier?.mobile || ''} className="w-full pl-7 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium" placeholder="-" readOnly/>
                               <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                            </div>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-gray-500">Email</label>
                            <div className="relative mt-1">
                               <input type="text" value={selectedSupplier?.email || ''} className="w-full pl-7 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium" placeholder="-" readOnly/>
                               <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12}/>
                            </div>
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-gray-500">Address</label>
                         <div className="relative mt-1">
                            <textarea rows={2} value={selectedSupplier?.address || ''} className="w-full pl-7 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium resize-none" placeholder="-" readOnly></textarea>
                            <MapPin className="absolute left-2 top-2 text-gray-400" size={12}/>
                         </div>
                      </div>
                   </div>

                   {/* Col 2: Legal & Type */}
                   <div className="col-span-4 space-y-3 border-l border-dashed border-gray-200 pl-6">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-800 uppercase tracking-wide">
                        <FileText size={12}/> Legal & Type
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[10px] font-bold text-gray-500">Type</label>
                            <input type="text" value={selectedSupplier?.type || ''} className="w-full mt-1 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium" placeholder="-" readOnly/>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-gray-500">Drug License No</label>
                            <input type="text" value={selectedSupplier?.drugLicenseNo || ''} className="w-full mt-1 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium" placeholder="-" readOnly/>
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-gray-500">GSTIN Number</label>
                         <div className="flex items-center gap-2 mt-1">
                            <input type="text" value={selectedSupplier?.gstin || ''} className="flex-1 px-3 py-2 border border-blue-200 bg-blue-50/50 rounded text-sm font-bold text-blue-800 tracking-wide" placeholder="-" readOnly/>
                            {selectedSupplier?.gstin && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-200">Active</span>}
                         </div>
                      </div>
                   </div>

                   {/* Col 3: Bank Details */}
                   <div className="col-span-4 space-y-3 border-l border-dashed border-gray-200 pl-6">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-800 uppercase tracking-wide">
                        <Landmark size={12}/> Bank Details
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="col-span-2">
                             <label className="text-[10px] font-bold text-gray-500">Bank Name</label>
                             <input type="text" value={selectedSupplier?.bankName || ''} className="w-full mt-1 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium" placeholder="-" readOnly/>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-gray-500">Account Number</label>
                            <input type="text" value={selectedSupplier?.accountNumber || ''} className="w-full mt-1 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-mono text-gray-600" placeholder="-" readOnly/>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-gray-500">IFSC Code</label>
                            <input type="text" value={selectedSupplier?.ifscCode || ''} className="w-full mt-1 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-mono text-gray-600" placeholder="-" readOnly/>
                         </div>
                         <div className="col-span-2">
                            <label className="text-[10px] font-bold text-gray-500">UPI ID</label>
                            <div className="relative mt-1">
                               <input type="text" value={selectedSupplier?.upiId || ''} className="w-full pl-8 px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-xs font-medium" placeholder="-" readOnly/>
                               <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">UPI</span>
                            </div>
                         </div>
                      </div>
                   </div>

                </div>
             </div>
          </div>

          {/* 2. MIDDLE: Items Table */}
          <div className="flex-1 overflow-auto bg-white relative pb-10 flex flex-col">
            <div className="flex justify-between items-center px-4 py-2 bg-white sticky top-0 z-10 border-b border-dashed border-gray-200">
               <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  Items <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{selectedItems.length} Items</span>
               </div>
               <button 
                  onClick={() => setIsMedicineModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-transform active:scale-95"
               >
                  <Plus size={14}/> Add Products
               </button>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-3 border-b text-center w-10">#</th>
                  <th className="px-3 py-3 border-b w-[25%]">Medicine / Master Info</th>
                  <th className="px-3 py-3 border-b text-center w-24">Batch No.</th>
                  <th className="px-3 py-3 border-b text-center w-20">Exp</th>
                  <th className="px-3 py-3 border-b text-center w-16">Pack</th>
                  <th className="px-3 py-3 border-b text-center w-16">Qty</th>
                  <th className="px-3 py-3 border-b text-center w-16">Free</th>
                  <th className="px-3 py-3 border-b text-right w-24">MRP</th>
                  <th className="px-3 py-3 border-b text-right w-24">Rate</th>
                  <th className="px-3 py-3 border-b text-center w-16">Dis%</th>
                  <th className="px-3 py-3 border-b text-right w-24">Total</th>
                  <th className="px-3 py-3 border-b text-center w-10">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {selectedItems.length === 0 && (
                   <tr>
                      <td colSpan={12} className="py-20 text-center text-gray-400">
                         <div className="flex flex-col items-center justify-center">
                            <Layers size={32} className="opacity-30 mb-2"/>
                            <p className="text-sm">No items added. Click "Add Products" to create new batches.</p>
                         </div>
                      </td>
                   </tr>
                )}
                {selectedItems.map((item, idx) => (
                  <tr 
                    key={item.uniqueId} 
                    className={`group hover:bg-blue-50/40 transition-colors relative ${activeRowId === item.uniqueId ? 'bg-blue-50/60' : ''}`}
                    onClick={() => setActiveRowId(item.uniqueId)}
                  >
                    <td className="px-3 py-3 text-center text-xs text-gray-400">{idx+1}</td>
                    
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-800 text-xs">{item.medicineName}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{item.manufacturerName}</div>
                      <div className="text-[9px] text-gray-400">{item.saltComposition}</div>
                    </td>

                    <td className="px-2 py-3">
                      <input 
                        type="text" 
                        placeholder="Batch"
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(item.uniqueId, 'batchNumber', e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-1.5 py-1 focus:border-blue-500 outline-none uppercase font-mono"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={item.expiryDate}
                        onChange={(e) => handleItemChange(item.uniqueId, 'expiryDate', e.target.value)}
                        className="w-full text-center text-xs border border-gray-300 rounded px-1 py-1 focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.unitPerPack}'s</td>
                    <td className="px-2 py-3 text-center">
                       <input 
                         type="number" 
                         value={item.qty} 
                         className="w-full text-center border border-gray-300 rounded text-xs py-1 font-bold focus:border-blue-500 outline-none"
                         onChange={(e) => handleItemChange(item.uniqueId, 'qty', parseFloat(e.target.value) || 0)}
                         onFocus={(e) => e.target.select()}
                       />
                    </td>
                    <td className="px-2 py-3 text-center">
                        <input 
                         type="number" 
                         value={item.free} 
                         className="w-full text-center border border-gray-300 rounded text-xs py-1 text-gray-500 focus:border-blue-500 outline-none"
                         onChange={(e) => handleItemChange(item.uniqueId, 'free', parseFloat(e.target.value) || 0)}
                         onFocus={(e) => e.target.select()}
                       />
                    </td>
                    <td className="px-2 py-3 text-right">
                        <input 
                         type="number" 
                         value={item.mrp} 
                         className="w-full text-right border border-gray-300 rounded text-xs py-1 text-gray-600 focus:border-blue-500 outline-none"
                         onChange={(e) => handleItemChange(item.uniqueId, 'mrp', parseFloat(e.target.value) || 0)}
                         onFocus={(e) => e.target.select()}
                       />
                    </td>
                    <td className="px-2 py-3 text-right">
                        <input 
                         type="number" 
                         value={item.rate} 
                         className="w-full text-right border border-gray-300 rounded text-xs py-1 font-bold text-gray-800 focus:border-blue-500 outline-none"
                         onChange={(e) => handleItemChange(item.uniqueId, 'rate', parseFloat(e.target.value) || 0)}
                         onFocus={(e) => e.target.select()}
                       />
                    </td>
                    <td className="px-2 py-3 text-center">
                        <input 
                         type="number" 
                         value={item.discountPercent} 
                         className="w-full text-center border border-gray-300 rounded text-xs py-1 text-gray-600 focus:border-blue-500 outline-none"
                         onChange={(e) => handleItemChange(item.uniqueId, 'discountPercent', parseFloat(e.target.value) || 0)}
                         onFocus={(e) => e.target.select()}
                       />
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-gray-800 text-xs">₹{item.amount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeItem(item.uniqueId); }}
                        className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. MINIMAL FOOTER */}
          <div className="bg-[#1a237e] text-blue-200 text-xs py-1.5 px-4 flex justify-between items-center select-none mt-auto z-20">
             <div className="flex gap-6">
                <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">F10</span> Save</span>
                <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">F3</span> New Supplier</span>
             </div>
             <div className="flex gap-6">
                <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">Alt+P</span> Print</span>
                <span className="flex items-center gap-1"><span className="bg-blue-700/50 px-1 rounded text-white font-mono">Esc</span> Clear</span>
             </div>
          </div>
       </div>

       {/* RIGHT COLUMN: Sidebar with Collapsible Billing & History */}
       <div className="w-[350px] bg-white flex flex-col z-30 shadow-2xl h-full border-l border-gray-200">
        
        {/* SECTION A: BILLING INFORMATION */}
        <div className="flex-shrink-0 bg-white">
           <div className="p-5 space-y-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                   <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Purchase Bill Summary</h2>
                </div>

                {/* Primary Calculations (Always Visible) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm group">
                        <span className="text-gray-500 font-medium">Subtotal (Excl. Tax)</span>
                        <span className="font-bold text-gray-800">₹ {subTotal.toFixed(2)}</span>
                    </div>

                    {/* Payment Info */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <div>
                             <label className="text-[10px] font-bold text-gray-500 block mb-1">Due Date</label>
                             <input 
                               type="date" 
                               value={dueDate}
                               onChange={(e) => setDueDate(e.target.value)}
                               className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-medium"
                             />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Cash Discount</label>
                            <input 
                               type="number" 
                               value={cashDiscountInput}
                               onChange={(e) => setCashDiscountInput(e.target.value)}
                               className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-bold text-right"
                               placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Wallet Logic */}
                    {walletBalance > 0 && (
                        <div className="flex justify-between items-center bg-purple-50 p-2 rounded border border-purple-100 mt-2">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-purple-800 flex items-center gap-1"><Wallet size={12}/> Supplier Wallet</span>
                              <span className="text-[10px] text-purple-600">Bal: ₹{walletBalance.toFixed(2)}</span>
                           </div>
                           <button 
                              onClick={() => setUseWallet(!useWallet)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${useWallet ? 'bg-purple-600' : 'bg-gray-300'}`}
                           >
                              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useWallet ? 'translate-x-4' : 'translate-x-0'}`}></div>
                           </button>
                        </div>
                    )}
                    
                    {/* Tax Type Toggle */}
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-500 font-medium">Tax Mode</span>
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
                    
                    {/* Collapsible Details Trigger */}
                    <div 
                       onClick={() => setIsBillingSummaryOpen(!isBillingSummaryOpen)}
                       className="flex items-center gap-2 cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium select-none"
                    >
                       {isBillingSummaryOpen ? 'Hide Tax Details' : 'Show Tax Details'}
                       {isBillingSummaryOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </div>

                    {/* Collapsible Details Content */}
                    <div className={`overflow-hidden transition-all duration-300 space-y-2 ${isBillingSummaryOpen ? 'max-h-48 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Item Discounts</span>
                            <span className="text-green-600 font-medium">- ₹ {itemLevelDiscount.toFixed(2)}</span>
                        </div>
                        {!isInterState ? (
                            <>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">SGST (Output)</span>
                                    <span>₹ {sgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">CGST (Output)</span>
                                    <span>₹ {cgst.toFixed(2)}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">IGST (Output)</span>
                                <span>₹ {igst.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Final Total */}
                    <div className="flex justify-between items-center text-base mt-4 pt-4 border-t border-dashed border-gray-300">
                        <span className="text-gray-800 font-bold">Net Amount</span>
                        <div className="text-right">
                           <span className="font-bold text-blue-800 text-2xl">₹ {finalPayable.toFixed(2)}</span>
                           {walletToDeduct > 0 && <div className="text-[10px] text-purple-600 font-medium mt-0.5">Paid via Wallet: ₹{walletToDeduct.toFixed(2)}</div>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg text-xs font-bold transition-all">
                       <FileText size={14}/> Save Draft
                   </button>
                   <button className="flex items-center justify-center gap-2 bg-[#1a237e] hover:bg-blue-800 text-white py-3 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all">
                       <Save size={14}/> Save Purchase
                   </button>
                </div>
           </div>
        </div>

        {/* SECTION B: HISTORY */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 border-t border-gray-200">
          <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
            <h3 className="font-bold text-gray-600 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <History size={14} className="text-gray-400"/> Purchase History
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
       
       {/* 1. SUPPLIER SEARCH MODAL */}
       {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[500px] flex flex-col overflow-hidden">
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-800">Search Supplier</h3>
                  <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"><X size={18}/></button>
               </div>
               
               <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input 
                       autoFocus 
                       type="text" 
                       placeholder="Search By Name, GSTIN..." 
                       value={supplierSearchTerm}
                       onChange={e => setSupplierSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                        <tr>
                           <th className="px-4 py-3 border-b">Supplier Name</th>
                           <th className="px-4 py-3 border-b">Mobile</th>
                           <th className="px-4 py-3 border-b">GSTIN</th>
                           <th className="px-4 py-3 border-b">Type</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredSuppliers.map((s) => (
                           <tr key={s.id} className="hover:bg-blue-50 cursor-pointer group" onClick={() => handleSupplierSelect(s)}>
                              <td className="px-4 py-3 text-xs font-bold text-gray-800">{s.name}</td>
                              <td className="px-4 py-3 text-xs font-mono text-gray-600">{s.mobile}</td>
                              <td className="px-4 py-3 text-xs font-mono text-blue-600 bg-blue-50 inline-block m-2 px-1 rounded">{s.gstin}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">{s.type}</td>
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

      {/* 2. MEDICINE SELECTION MODAL (MASTER LIST) */}
      {isMedicineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden">
               {/* Modal Header */}
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-800">Select Medicine to Add Batch</h3>
                  <button onClick={() => setIsMedicineModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"><X size={18}/></button>
               </div>
               
               <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input 
                       autoFocus 
                       type="text" 
                       placeholder="Search Master Product List..." 
                       value={medicineSearchTerm}
                       onChange={e => setMedicineSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase sticky top-0 z-10 shadow-sm">
                        <tr>
                           <th className="px-4 py-3 border-b">Product Description</th>
                           <th className="px-4 py-3 border-b">Manufacturer</th>
                           <th className="px-4 py-3 border-b text-center">Packing</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredMedicines.map((m) => (
                           <tr key={m._id} className="hover:bg-blue-50 cursor-pointer group" onClick={() => handleAddMasterMedicine(m)}>
                              <td className="px-4 py-3">
                                 <div className="font-bold text-gray-800 text-sm">{m.medicineName}</div>
                                 <div className="text-[10px] text-gray-400">{m.saltComposition}</div>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600">{m.manufacturerName}</td>
                              <td className="px-4 py-3 text-center text-xs font-medium text-gray-700">{m.medicinePackingType} ({m.unitPerPack})</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-right text-[10px] text-gray-500">
                  <span className="bg-white border px-1.5 py-0.5 rounded shadow-sm mr-2">Enter</span> to Select
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseEntry;