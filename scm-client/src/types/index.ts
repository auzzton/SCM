export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface User {
    id: string;
    username: string;
    role: Role;
    active: boolean;
}

export interface Supplier {
    id: string;
    name: string;
    contactInfo: string;
    address: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    price: number;
    minStockLevel: number;
    supplier?: Supplier;
}

export interface Order {
    id: string;
    orderDate: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    supplier: Supplier;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
}
