// Sends WhatsApp notifications via Twilio's WhatsApp Business API.
//
// ⚠️ Requires a real Twilio account with WhatsApp enabled — this file
// does NOT create one for you. Until these env vars are set, every call
// just logs and returns { sent: false } instead of throwing, so the
// rest of the app (checkout, order confirmation) keeps working fine
// without WhatsApp configured.
//
// To activate:
//   1. Sign up at https://www.twilio.com and enable WhatsApp messaging
//      (sandbox for testing, or a verified WhatsApp Business sender for
//      production — see https://www.twilio.com/docs/whatsapp).
//   2. Set these in backend/.env (and in your hosting platform's env vars):
//        TWILIO_ACCOUNT_SID=...
//        TWILIO_AUTH_TOKEN=...
//        TWILIO_WHATSAPP_FROM=+14155238886   (your Twilio WhatsApp number)

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;

const configured = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM);

function normalizeEgyptianPhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("20") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("1")) return `+20${digits}`;
  return null;
}

// Never throws — a failed/unconfigured WhatsApp send should never break
// an order confirmation or any other flow that triggers it.
export async function sendWhatsAppMessage(rawPhone, body) {
  if (!configured) {
    console.log(`[WhatsApp غير مفعّل] كانت هتتبعت لـ ${rawPhone}:\n${body}`);
    return { sent: false, reason: "not_configured" };
  }

  const to = normalizeEgyptianPhone(rawPhone);
  if (!to) {
    console.warn(`[WhatsApp] رقم غير صحيح، تم التجاهل: ${rawPhone}`);
    return { sent: false, reason: "invalid_phone" };
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const params = new URLSearchParams({
      From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      To: `whatsapp:${to}`,
      Body: body,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[WhatsApp] Twilio error:", res.status, errText);
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (err) {
    console.error("[WhatsApp] send failed:", err.message);
    return { sent: false, reason: "network_error" };
  }
}

export function buildOrderConfirmedMessage(order) {
  const total = order.subtotal - (order.discountAmount || 0);
  return (
    `تم تأكيد طلبك في SOOLECT ✅\n` +
    `رقم الطلب: ${order.orderNumber}\n` +
    `الإجمالي: ${total.toLocaleString("en-US")} ج.م\n` +
    `هيتم التواصل معاك قبل الشحن. شكرًا لثقتك في SOOLECT!`
  );
}
