export function formatPrice(value) {
  return `${value.toLocaleString("en-US")} ج.م`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const ORDER_STATUS_LABELS = {
  New: "طلب جديد",
  Confirmed: "تم التأكيد",
  Shipped: "تم الشحن",
  Delivered: "تم التسليم",
  Cancelled: "ملغي",
};

// The 4-step progression shown in the status tracker. "Cancelled" is a
// separate terminal state handled on its own, not part of the stepper.
export const ORDER_STATUS_STEPS = ["New", "Confirmed", "Shipped", "Delivered"];
