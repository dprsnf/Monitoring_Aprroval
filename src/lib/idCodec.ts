const SECRET = process.env.NEXT_PUBLIC_DOC_ID_SECRET || "doc-id-secret";

const base64UrlEncode = (input: string): string => {
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(input, "utf-8").toString("base64")
      : window.btoa(input);

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const base64UrlDecode = (input: string): string => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return typeof window === "undefined"
    ? Buffer.from(padded, "base64").toString("utf-8")
    : window.atob(padded);
};

export const encodeDocumentId = (id: number): string => {
  const payload = `${id}:${SECRET}`;
  return base64UrlEncode(payload);
};

export const decodeDocumentId = (token: string): number | null => {
  try {
    const decoded = base64UrlDecode(token);
    const [value, ...secretParts] = decoded.split(":");
    const secret = secretParts.join(":");

    if (secret !== SECRET) {
      return null;
    }

    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
};
