export type Role = 'admin' | 'staff';
export type Dept = 'sales' | 'factory' | 'warehouse' | 'accountant' | 'logistics';
export const DEPTS: Dept[] = ['sales', 'factory', 'warehouse', 'accountant', 'logistics'];
export interface Profile { id: string; email: string; full_name: string | null; role: Role; department: Dept | null; is_active: boolean; created_at: string }
export interface OrderItem { id: string; product: string; qty: number }
export interface Order {
  id: string; ref: string; customer_name: string; phone: string | null; wilaya: string | null;
  priority: 'normal' | 'urgent'; stage: number; due_date: string | null; delivered_at: string | null;
  created_at: string; order_items: OrderItem[];
}
