import type {
  CheckoutErrors,
  CheckoutField,
  CheckoutFormData,
} from "@/lib/types/checkout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\s()-]{7,20}$/;

const REQUIRED_FIELDS: Array<[CheckoutField, string]> = [
  ["fullName", "Ingresa tu nombre completo."],
  ["email", "Ingresa tu correo electrónico."],
  ["phone", "Ingresa tu teléfono."],
  ["addressLine1", "Ingresa la dirección de entrega."],
  ["city", "Ingresa la ciudad o municipio."],
  ["zone", "Selecciona o escribe la zona de entrega."],
];

export const CHECKOUT_DRAFT_STORAGE_KEY = "picaflor-checkout-draft-v1";

export const EMPTY_CHECKOUT_FORM: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "Medellín",
  zone: "",
  notes: "",
};

export function normalizeCheckoutForm(
  data: CheckoutFormData
): CheckoutFormData {
  return {
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    addressLine1: data.addressLine1.trim(),
    addressLine2: data.addressLine2.trim(),
    city: data.city.trim(),
    zone: data.zone.trim(),
    notes: data.notes.trim(),
  };
}

export function validateCheckoutForm(data: CheckoutFormData): CheckoutErrors {
  const normalized = normalizeCheckoutForm(data);
  const errors: CheckoutErrors = {};

  for (const [field, message] of REQUIRED_FIELDS) {
    if (!normalized[field]) {
      errors[field] = message;
    }
  }

  if (normalized.email && !EMAIL_PATTERN.test(normalized.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (normalized.phone && !PHONE_PATTERN.test(normalized.phone)) {
    errors.phone = "Ingresa un teléfono válido.";
  }

  return errors;
}

export function hasCheckoutErrors(errors: CheckoutErrors): boolean {
  return Object.keys(errors).length > 0;
}

