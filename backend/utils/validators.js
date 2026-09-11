// Server-side mirror of the frontend's password rule — never trust the
// client alone. At least 8 characters, containing a letter and a number.
export function isStrongPassword(value) {
  return typeof value === "string" && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
}
