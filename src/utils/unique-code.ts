/**
 * Genera un código alfanumérico (A-Z, 0-9): hasta 3 iniciales del nombre sin
 * acentos ni símbolos + 3 dígitos. `isTaken` decide si ya existe.
 */
export async function generateUniqueCode(
  fullName: string,
  isTaken: (code: string) => Promise<boolean>,
): Promise<string> {
  const initials =
    fullName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 3) || "X";

  let code: string;
  let attempts = 0;
  do {
    const randomPart = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
    code = `${initials}${randomPart}`;
    if (!(await isTaken(code))) break;
    attempts++;
  } while (attempts < 10);

  return code;
}

export const isAlphanumeric = (code: string) => /^[A-Za-z0-9]+$/.test(code);
