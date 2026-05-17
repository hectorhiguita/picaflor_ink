import {
  EMPTY_CHECKOUT_FORM,
  hasCheckoutErrors,
  normalizeCheckoutForm,
  validateCheckoutForm,
} from "@/lib/checkout-validation";

describe("checkout validation", () => {
  it("requires contact and shipping fields", () => {
    const errors = validateCheckoutForm(EMPTY_CHECKOUT_FORM);

    expect(errors.fullName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.addressLine1).toBeDefined();
    expect(errors.zone).toBeDefined();
    expect(hasCheckoutErrors(errors)).toBe(true);
  });

  it("normalizes whitespace and email casing", () => {
    const normalized = normalizeCheckoutForm({
      ...EMPTY_CHECKOUT_FORM,
      fullName: "  Ana Pérez ",
      email: " ANA@EXAMPLE.COM ",
      phone: " 3223684981 ",
      addressLine1: " Calle 10 ",
      zone: " Medellín ",
    });

    expect(normalized.fullName).toBe("Ana Pérez");
    expect(normalized.email).toBe("ana@example.com");
    expect(normalized.phone).toBe("3223684981");
    expect(normalized.addressLine1).toBe("Calle 10");
    expect(normalized.zone).toBe("Medellín");
  });

  it("accepts a complete valid checkout form", () => {
    const errors = validateCheckoutForm({
      fullName: "Ana Pérez",
      email: "ana@example.com",
      phone: "3223684981",
      addressLine1: "Calle 10 # 20-30",
      addressLine2: "",
      city: "Medellín",
      zone: "Medellín",
      notes: "",
    });

    expect(hasCheckoutErrors(errors)).toBe(false);
  });
});

