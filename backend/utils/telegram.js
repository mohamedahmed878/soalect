// Sends a Telegram message to the admin's chat whenever a new order
// comes in — near-instant, no app needed, just Telegram.
//
// Setup (already done if you're reading this after pasting your token):
//   1. Message @BotFather on Telegram → /newbot → get a bot token.
//   2. Message your new bot once (anything), then open:
//      https://api.telegram.org/bot<TOKEN>/getUpdates
//      and find your numeric "chat":{"id": ...} — that's TELEGRAM_CHAT_ID.
//   3. Set both as environment variables (never commit them to code):
//        TELEGRAM_BOT_TOKEN=...
//        TELEGRAM_CHAT_ID=...
//
// Until both are set, this silently no-ops (logs only) instead of
// throwing — a missing/invalid Telegram config should never break order
// creation.

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const configured = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

export async function sendTelegramMessage(text) {
  if (!configured) {
    console.log(`[Telegram غير مفعّل] كانت هتتبعت:\n${text}`);
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Telegram] API error:", res.status, errText);
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (err) {
    console.error("[Telegram] send failed:", err.message);
    return { sent: false, reason: "network_error" };
  }
}

export function buildNewOrderTelegramMessage(order) {
  const total = order.subtotal - (order.discountAmount || 0);
  const itemsList = order.items.map((it) => `• ${it.name} (${it.color}, ${it.size}) × ${it.qty}`).join("\n");

  return (
    `🛎️ <b>طلب جديد في SOOLECT</b>\n\n` +
    `رقم الطلب: <b>${order.orderNumber}</b>\n` +
    `العميل: ${order.customer.fullName}\n` +
    `الهاتف: ${order.customer.phone}\n` +
    `المحافظة: ${order.customer.governorate} — ${order.customer.city}\n\n` +
    `${itemsList}\n\n` +
    `الإجمالي: <b>${total.toLocaleString("en-US")} ج.م</b>\n` +
    `الدفع: ${order.paymentMethod === "instapay" ? "تحويل InstaPay" : "عند الاستلام"}`
  );
}
