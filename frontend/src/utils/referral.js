const REF_KEY = "soolect_ref";

// Call once near the app root. If the current URL has ?ref=CODE, store it
// so it survives browsing and gets sent along with the order at checkout —
// this is how a sale gets attributed to the affiliate who shared the link.
export function captureReferralFromURL(search) {
  const params = new URLSearchParams(search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem(REF_KEY, ref.trim().toUpperCase());
  }
}

// Same code can also be typed manually as a discount/referral code in
// the cart — same storage key, same attribution at checkout.
export function setStoredReferral(code) {
  localStorage.setItem(REF_KEY, code.trim().toUpperCase());
}

export function clearStoredReferral() {
  localStorage.removeItem(REF_KEY);
}

export function getStoredReferral() {
  return localStorage.getItem(REF_KEY);
}
