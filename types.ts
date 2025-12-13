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

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  credits?: number;
}

export interface BillItem extends Medicine {
  qty: number;
}

export interface SalesHistoryItem {
  id: string;
  billNo: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
  items: { name: string; qty: number }[];
}
