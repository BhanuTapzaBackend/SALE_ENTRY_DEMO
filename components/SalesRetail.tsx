import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Plus, 
  Search, 
  Trash2, 
  Info, 
  Save, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  Receipt, 
  History, 
  ChevronRight, 
  Pill, 
  Factory, 
  Layers, 
  Printer, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { BillItem, Medicine, SalesHistoryItem } from '../types';

// --- Mock Data ---
const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', batch: 'B2023', expiry: '12/27', pack: 10, strip: 10, tab: 1, free: 0, mrp: 20, price: 15, disc: 0, gst: 12, amount: 0, salt: 'Paracetamol IP 500mg', manufacturer: 'GSK Pharmaceuticals', category: 'Analgesic', stock: 240 },
  { id: '2', name: 'Amoxyclav 625', batch: 'A9921', expiry: '10/25', pack: 6, strip: 1, tab: 1, free: 0, mrp: 120, price: 105, disc: 5, gst: 18, amount: 0, salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg', manufacturer: 'Sun Pharma', category: 'Antibiotic', stock: 50 },
  { id: '3', name: 'Pantop 40', batch: 'P442', expiry: '05/26', pack: 15, strip: 1, tab: 1, free: 1, mrp: 140, price: 110, disc: 0, gst: 12, amount: 0, salt: 'Pantoprazole 40mg', manufacturer: 'Aristo Pharma', category: 'Antacid', stock: 120 },
  { id: '4', name: 'Dolo 650', batch: 'D001', expiry: '01/26', pack: 15, strip: 1, tab: 1, free: 0, mrp: 35, price: 28, disc: 2, gst: 12, amount: 0, salt: 'Paracetamol IP 650mg', manufacturer: 'Micro Labs', category: 'Analgesic', stock: 400 },
  { id: '5', name: 'Montair LC', batch: 'M882', expiry: '09/25', pack: 10, strip: 1, tab: 1, free: 0, mrp: 180, price: 150, disc: 10, gst: 18, amount: 0, salt: 'Montelukast 10mg + Levocetirizine 5mg', manufacturer: 'Cipla', category: 'Anti-Allergic', stock: 85 },
];

const MOCK_HISTORY: SalesHistoryItem[] = [
  { id: 'A000101', billNo: 'A000101', date: 'Today, 10:42 AM', amount: 120.00, status: 'Paid', items: [{name: 'Dolo 650', qty: 8}] },
  { id: 'A000100', billNo: 'A000100', date: 'Today, 09:15 AM', amount: 450.50, status: 'Paid', items: [{name: 'Azithral 500', qty: 3}, {name: 'Limcee', qty: 2}] },
  { id: 'A000099', billNo: 'A000099', date: 'Yesterday', amount: 1200.00, status: 'Pending', items: [{name: 'Shelcal 500', qty: 30}] },
];

const SalesRetail: React.FC = () => {
  // State
  const [billDate] = useState('2025-09-28');
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  
  // Initialize with some items
  useEffect(() => {
    const initialItems = MOCK_MEDICINES.slice(0, 3).map(m => ({ ...m, qty: 1, amount: m.price }));
    setSelectedItems(initialItems);
    if(initialItems.length > 0) setActiveRowId(initialItems[0].id);
  }, []);

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

  // Calculations for Billing Panel
  const mrpValue = selectedItems.reduce((acc, item) => acc + (item.mrp * item.qty), 0);
  const subTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalDiscount = selectedItems.reduce((acc, item) => acc + (item.price * item.qty * (item.disc / 100)), 0);
  const taxableValue = subTotal - totalDiscount;
  
  // Fake Tax split for demo
  const sgst = taxableValue * 0.06;
  const cgst = taxableValue * 0.06;
  const gstTotal = sgst + cgst;
  
  const grandTotal = taxableValue + gstTotal;

  // Internal Metrics (Mock)
  const purRate = 11500; 
  const margin = 22.5;

  return (
    <div className="flex h-full bg-gray-50/50 font-sans">
      
      {/* LEFT COLUMN: Main Transaction Area */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
        
        {/* 1. TOP: Patient & Payment Info (Replicating User Screenshot Layout) */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <User className="text-gray-500" size={18}/>
                <h2 className="text-base font-bold text-gray-800">Patient Information</h2>
             </div>
             <div className="flex items-center gap-3">
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                    <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border-r border-gray-200">Bill Number</span>
                    <input type="text" value="INV-001" readOnly className="w-24 px-2 py-1.5 text-sm font-bold text-gray-700 bg-transparent outline-none"/>
                 </div>
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                    <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border-r border-gray-200">Date</span>
                    <input type="date" value={billDate} className="px-2 py-1.5 text-xs font-bold text-gray-700 bg-transparent outline-none"/>
                 </div>
                 <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-md transition-colors flex items-center gap-1 shadow-sm">
                    <Plus size={14} /> New Customer
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
              {/* Customer Details Box */}
              <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100/50 flex flex-col h-full">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Customer Details</label>
                  <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                      <input 
                        type="text" 
                        placeholder="Search Customer" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      />
                  </div>
                  <div className="flex-1 bg-white rounded border border-gray-200 p-3 text-xs space-y-1.5 text-gray-600 shadow-sm">
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">Mob no.</span> <span className="font-semibold text-gray-800">9876543210</span></div>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">Company</span> <span>-</span></div>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">GST</span> <span>-</span></div>
                      <div className="flex justify-between"><span className="text-gray-400 font-medium">Address</span> <span>123 Main St, Springfield</span></div>
                  </div>
              </div>

              {/* Payment Details Box */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Payment</label>
                     <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 hover:border-blue-400 px-3 py-1 pr-8 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm">
                           <option>Payment: Cash</option>
                           <option>Payment: UPI</option>
                           <option>Payment: Card</option>
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 transform rotate-90 text-gray-400 pointer-events-none" size={12}/>
                     </div>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Due Date</label>
                          <input type="date" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white shadow-sm font-medium" defaultValue="2025-12-12"/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Due Amount</label>
                          <input type="text" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-gray-100 text-gray-500" placeholder="Auto populate" disabled/>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 font-bold block mb-1">Applicable Credits</label>
                          <input type="text" className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-gray-100 text-gray-500" placeholder="No credits available" disabled/>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
             <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none hover:text-blue-600 transition-colors">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-gray-300"/>
                Send Whatsapp Notification
             </label>
             <button className="text-[10px] font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
                <Receipt size={12}/> Media Upload
             </button>
          </div>
        </div>

        {/* 2. MIDDLE: Medicines Table */}
        <div className="flex-1 overflow-auto bg-white relative pb-10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 border-b text-center w-10">
                   <input type="checkbox" className="rounded text-blue-600 focus:ring-0 border-gray-300" />
                </th>
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
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" checked={activeRowId === item.id} readOnly className="rounded text-blue-600 focus:ring-0 border-gray-300" />
                  </td>
                  
                  {/* Medicine Name with Smart Hover Card */}
                  <td className="px-3 py-3 relative">
                    <div className="font-semibold text-gray-800 flex items-center gap-2 cursor-pointer">
                      {item.name}
                      {activeRowId === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.manufacturer}</div>

                    {/* HOVER CARD: High Z-Index to float above everything */}
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
                             <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Rack Location</div>
                                <div className="text-xs font-medium text-gray-700 flex items-center gap-1"><Layers size={10}/> Rack A-04</div>
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Manufacturer</div>
                                <div className="text-xs font-medium text-gray-700 truncate">{item.manufacturer}</div>
                             </div>
                         </div>
                      </div>
                      
                      {/* Arrow */}
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
              {/* Search Row */}
              <tr>
                <td className="px-3 py-3 text-center"></td>
                <td colSpan={11} className="px-3 py-2">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={16}/>
                    <input 
                      type="text" 
                      placeholder="Type to search medicine... (F2)" 
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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

      {/* RIGHT COLUMN: Sidebar with Top Billing & Bottom History */}
      <div className="w-[420px] bg-white flex flex-col z-30 shadow-2xl h-full border-l border-gray-200">
        
        {/* SECTION A: BILLING INFORMATION (Top - Scrollable if needed, but designed to fit) */}
        <div className="bg-white p-5 border-b border-gray-200 overflow-y-auto max-h-[65%] scrollbar-default">
           
           {/* Header */}
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                 <Receipt size={16} className="text-blue-600"/> Billing Summary
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                 {selectedItems.length} Items
              </span>
           </div>

           {/* GRAND TOTAL CARD */}
           <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden mb-6">
              {/* Abstract shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay opacity-10 blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400 rounded-full mix-blend-overlay opacity-20 blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-200 uppercase tracking-wider">Final Amount</span>
                    <span className="bg-green-500/20 text-green-200 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/30">Paid</span>
                 </div>
                 <div className="text-5xl font-bold tracking-tight mb-2">
                    <span className="text-2xl opacity-60 font-normal align-top mr-1">₹</span>{grandTotal.toFixed(2)}
                 </div>
                 <div className="flex gap-2 text-[10px] text-blue-200 font-medium">
                    <span>Cash Disc: ₹0.00</span>
                    <span className="opacity-50">|</span>
                    <span>Coupons: ₹0.00</span>
                 </div>
              </div>
           </div>

           {/* DETAILED DATAPOINTS (Grid Layout) */}
           <div className="space-y-4">
               
               {/* 1. Invoice Breakdown */}
               <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                   <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Invoice Breakdown</h3>
                   <div className="space-y-2 text-sm">
                       <div className="flex justify-between items-center">
                           <span className="text-gray-600 text-xs">MRP Value :</span>
                           <span className="font-semibold text-gray-800">₹{mrpValue.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-gray-600 text-xs">Amount :</span>
                           <span className="font-semibold text-gray-800">₹0.00</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-gray-600 text-xs">Value of Goods :</span>
                           <span className="font-semibold text-gray-800">₹{subTotal.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-gray-600 text-xs">Discount :</span>
                           <span className="font-semibold text-green-600">-₹{totalDiscount.toFixed(2)}</span>
                       </div>
                       <div className="h-px bg-gray-200 my-1"></div>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500">SGST :</span>
                              <span>₹{sgst.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500">CGST :</span>
                              <span>₹{cgst.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500">GST% :</span>
                              <span>₹{gstTotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Coup :</span>
                              <span>₹0.00</span>
                           </div>
                       </div>
                   </div>
               </div>

               {/* 2. Store Metrics (Internal) */}
               <div className="bg-yellow-50 rounded-lg border border-yellow-100 p-3 relative overflow-hidden group">
                   <div className="absolute right-2 top-2 text-yellow-300 opacity-20"><Info size={40}/></div>
                   <h3 className="text-[10px] font-bold text-yellow-700 uppercase mb-2 relative z-10">Store Metrics</h3>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs relative z-10">
                       <div className="flex justify-between">
                           <span className="text-yellow-800/70 font-medium">PurRate :</span>
                           <span className="font-bold text-yellow-900">₹{purRate.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-yellow-800/70 font-medium">Cost :</span>
                           <span className="font-bold text-yellow-900">₹0.00</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-yellow-800/70 font-medium">Tax-T-I :</span>
                           <span className="font-bold text-yellow-900">₹0.00</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-yellow-800/70 font-medium">Margin% :</span>
                           <span className="font-bold text-green-700">{margin}%</span>
                       </div>
                   </div>
               </div>

               {/* 3. Credit Notes Selector */}
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Credit Notes</label>
                  <select className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium">
                      <option value="">Select Credit Note to Apply...</option>
                      <option value="CN-001">CN-2023-001 (₹500.00)</option>
                      <option value="CN-002">CN-2023-045 (₹120.00)</option>
                  </select>
               </div>

               {/* Action Buttons */}
               <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-xs font-bold transition-all">
                      <Save size={14}/> Save Draft
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all">
                      <Printer size={14}/> Print & Pay
                  </button>
               </div>
           </div>
        </div>

        {/* SECTION B: HISTORY (Bottom - Fills remaining space) */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 border-t border-gray-200">
          <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
            <h3 className="font-bold text-gray-600 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <History size={14} className="text-gray-400"/> Recent Sales
            </h3>
            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800">View All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-default">
            {MOCK_HISTORY.map((sale) => (
              <div key={sale.id} className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex justify-between items-center">
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
    </div>
  );
};

export default SalesRetail;