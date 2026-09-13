// Sends a Telegram message to the admin's chat whenever a new order
// comes in — near-instant, no app needed, just Telegram.

export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // التحقق المباشر عند كل طلب لتجنب مشكلة الـ Caching في Vercel
  if (!token || !chatId) {
    console.log(`[Telegram غير مفعّل] كانت هتتبعت:\n${text}`);
    return { sent: false, reason: "not_configured" };
  }

  // إضافة Timeout لحماية Vercel Serverless Function من التعليق
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Telegram] API error:", res.status, errText);
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error("[Telegram] send failed: Request timed out");
      return { sent: false, reason: "timeout" };
    }
    console.error("[Telegram] send failed:", err.message);
    return { sent: false, reason: "network_error" };
  }
}

export function buildNewOrderTelegramMessage(order) {
  const total = order.subtotal - (order.discountAmount || 0);
  const itemsList = order.items
    ? order.items.map((it) => `• ${it.name} (${it.color}, ${it.size}) × ${it.qty}`).join("\n")
    : "لا توجد تفاصيل للمنتجات";

  return (
    `🛎️ <b>طلب جديد في SOOLECT</b>\n\n` +
    `رقم الطلب: <b>${order.orderNumber}</b>\n` +
    `العميل: ${order.customer?.fullName || 'غير محدد'}\n` +
    `الهاتف: ${order.customer?.phone || 'غير محدد'}\n` +
    `المحافظة: ${order.customer?.governorate || ''} — ${order.customer?.city || ''}\n\n` +
    `${itemsList}\n\n` +
    `الإجمالي: <b>${total.toLocaleString("en-US")} ج.م</b>\n` +
    `الدفع: ${order.paymentMethod === "instapay" ? "تحويل InstaPay" : "عند الاستلام"}`
  );
}