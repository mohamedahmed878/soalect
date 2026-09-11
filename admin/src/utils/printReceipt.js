import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "./format";

const SHARED_STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: "Tajawal", "Segoe UI", Arial, sans-serif;
    color: #111;
    margin: 0;
    padding: 24px;
  }
  .receipt { max-width: 420px; margin: 0 auto; }
  .receipt + .receipt { margin-top: 40px; page-break-before: always; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  .sub { color: #555; font-size: 12px; margin: 0 0 14px; }
  .section { margin-bottom: 16px; }
  .section h2 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #888;
    margin: 0 0 6px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }
  .row { display: flex; justify-content: space-between; font-size: 13px; margin: 3px 0; }
  .muted { color: #777; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: right; padding: 6px 4px; border-bottom: 1px solid #eee; }
  th { font-size: 11px; color: #888; font-weight: 600; }
  .num { text-align: left; white-space: nowrap; }
  .totals { margin-top: 10px; }
  .totals .row { font-size: 13px; }
  .totals .grand { font-size: 16px; font-weight: 800; border-top: 1px solid #111; padding-top: 8px; margin-top: 6px; }
  .status-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: #111;
    color: #fff;
  }
  .paid-badge { color: #0a7a3d; font-weight: 800; }
  .barcode-block { text-align: center; margin: 18px 0 6px; }
  .barcode-block svg { max-width: 100%; }
  .barcode-block .order-no { font-size: 13px; font-weight: 700; letter-spacing: 1px; margin-top: 2px; direction: ltr; }
  .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #999; }
  @media print {
    body { padding: 0; }
    .receipt { max-width: 100%; }
  }
`;

function buildReceiptBlock(order) {
  const total = order.subtotal - (order.discountAmount || 0);

  const itemsRows = order.items
    .map(
      (it) => `
        <tr>
          <td>${escapeHtml(it.name)}<div class="muted">${escapeHtml(it.color)} · ${escapeHtml(it.size)}</div></td>
          <td class="num">${it.qty}</td>
          <td class="num">${formatPrice(it.price)}</td>
          <td class="num">${formatPrice(it.price * it.qty)}</td>
        </tr>`
    )
    .join("");

  const paymentLine =
    order.paymentMethod === "instapay"
      ? `<span class="paid-badge">تم الدفع (تحويل InstaPay)</span>`
      : `<span>الدفع عند الاستلام (COD)</span>`;

  return `
  <div class="receipt">
    <h1>SOOLECT</h1>
    <p class="sub">فاتورة طلب — ${formatDate(order.createdAt)}</p>

    <div class="section">
      <h2>الطلب</h2>
      <div class="row"><span>رقم الطلب</span><strong>${escapeHtml(order.orderNumber)}</strong></div>
      <div class="row"><span>الحالة</span><span class="status-badge">${ORDER_STATUS_LABELS[order.status] || order.status}</span></div>
      <div class="row"><span>طريقة الدفع</span>${paymentLine}</div>
    </div>

    <div class="section">
      <h2>بيانات العميل</h2>
      <div class="row"><span>الاسم</span><strong>${escapeHtml(order.customer.fullName)}</strong></div>
      <div class="row"><span>الهاتف</span><strong>${escapeHtml(order.customer.phone)}</strong></div>
      ${order.customer.email ? `<div class="row"><span>الإيميل</span><span>${escapeHtml(order.customer.email)}</span></div>` : ""}
      <div class="row"><span>المحافظة / المدينة</span><span>${escapeHtml(order.customer.governorate)} — ${escapeHtml(order.customer.city)}</span></div>
      <div class="row"><span>العنوان</span><span>${escapeHtml(order.customer.address)}</span></div>
      ${order.customer.notes ? `<div class="row"><span>ملاحظات</span><span>${escapeHtml(order.customer.notes)}</span></div>` : ""}
    </div>

    <div class="section">
      <h2>المنتجات</h2>
      <table>
        <thead>
          <tr><th>المنتج</th><th class="num">الكمية</th><th class="num">السعر</th><th class="num">الإجمالي</th></tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>

    <div class="totals">
      <div class="row"><span>الإجمالي الفرعي</span><span>${formatPrice(order.subtotal)}</span></div>
      ${
        order.discountAmount > 0
          ? `<div class="row"><span>خصم${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""}</span><span>-${formatPrice(order.discountAmount)}</span></div>`
          : ""
      }
      <div class="row grand"><span>الإجمالي النهائي</span><span>${formatPrice(total)}</span></div>
    </div>

    <!-- Barcode of the order number, for the shipping company to scan -->
    <div class="barcode-block">
      <svg class="barcode" data-code="${escapeHtml(order.orderNumber)}"></svg>
      <div class="order-no">${escapeHtml(order.orderNumber)}</div>
    </div>

    <p class="footer">SOOLECT · شكرًا لتعاملك معانا</p>
  </div>`;
}

function buildDocument(bodyHtml, title) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>${SHARED_STYLES}</style>
</head>
<body>
  ${bodyHtml}

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
  <script>
    // Render a barcode into every .barcode svg (one per order number),
    // then print — this runs after JsBarcode has fully loaded because
    // the script tag above is synchronous/blocking.
    (function () {
      try {
        document.querySelectorAll('svg.barcode').forEach(function (el) {
          JsBarcode(el, el.getAttribute('data-code'), {
            format: 'CODE128',
            displayValue: false,
            height: 40,
            margin: 0,
          });
        });
      } catch (e) {
        // If the barcode library failed to load (no internet at print
        // time), the receipt still prints fine — just without a barcode.
      }
      window.print();
    })();
  </script>
</body>
</html>`;
}

function openAndPrint(html, popupBlockedMessage) {
  const win = window.open("", "_blank", "width=480,height=720");
  if (!win) {
    alert(popupBlockedMessage);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// Opens the given orders' receipts in ONE print job, each on its own
// page (with its own barcode) — used both for a single order (pass an
// array of one) and for bulk-printing a whole selected batch at once.
export function printOrderReceipts(orders) {
  if (!orders || orders.length === 0) return;
  const body = orders.map(buildReceiptBlock).join("\n");
  const title = orders.length === 1 ? `فاتورة طلب ${orders[0].orderNumber}` : `فواتير ${orders.length} طلب`;
  const html = buildDocument(body, title);
  openAndPrint(html, "المتصفح منع فتح نافذة الطباعة — اسمح بالنوافذ المنبثقة (popups) لهذا الموقع وحاول تاني.");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
