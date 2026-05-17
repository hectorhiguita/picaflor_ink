import type { CartData } from "@/lib/types/cart";
import type { ShippingCalculationResult } from "@/lib/types/shipping";

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  zone: string;
  notes: string;
}

export type CheckoutField = keyof CheckoutFormData;

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export interface CheckoutRequest {
  customer: CheckoutFormData;
}

export interface CheckoutResponse {
  orderNumber: string;
  paymentReference: string;
  paymentUrl: string;
  cart: CartData;
  shipping: ShippingCalculationResult;
}

