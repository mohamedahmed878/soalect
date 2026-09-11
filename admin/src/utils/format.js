export function formatPrice(value) {
  return `${Number(value).toLocaleString("en-US")} ج.م`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
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

export const ORDER_STATUS_STEPS = ["New", "Confirmed", "Shipped", "Delivered"];

export const CATEGORY_LABELS = {
  tshirts: "تيشيرتات",
  hoodies: "هوديز",
  pants: "بنطلونات",
  accessories: "إكسسوارات",
};
