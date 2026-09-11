export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value) {
  return /^01[0-2,5]{1}[0-9]{8}$/.test(value.trim());
}

export function required(value) {
  return String(value ?? "").trim().length > 0;
}

// At least 8 chars, one letter, one number — matches the backend rule
// enforced in backend/controllers/authController.js on register.
export function isStrongPassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
}
