export interface Medicine {
  id: string;
  name: string;
  batch: string;
  expiry: string;
  pack: number;
  strip: number;
  tab: number;
  free: number;
  mrp: number;
  price: number;
  disc: number;
  gst: number;
  amount: number;
  salt: string;
  manufacturer: string;
  category: string;
  stock: number;
}

export interface MasterMedicine {
  _id: string;
  medicineId: string;
  medicineName: string;
  manufacturerName: string;
  saltComposition: string;
  hsnCode: string;
  sgstPercent: number;
  cgstPercent: number;
  igstPercent: number;
  unitPerPack: number;
  medicinePackingType: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  credits?: number;
  state?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  mobile: string;
  altMobile?: string;
  address: string;
  type: 'Wholesaler' | 'Manufacturer' | 'Distributor';
  drugLicenseNo: string;
  gstin: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  walletBalance?: number;
}

export interface BillItem extends Medicine {
  qty: number;
}

export interface PurchaseItem extends MasterMedicine {
  uniqueId: string; // for React keys since we might add same medicine multiple times for different batches
  batchNumber: string;
  expiryDate: string;
  mrp: number;
  rate: number;
  qty: number;
  free: number;
  discountPercent: number;
  amount: number;
}

export interface SalesHistoryItem {
  id: string;
  billNo: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
  items: { name: string; qty: number }[];
}