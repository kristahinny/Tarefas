const PBKDF2_ITERATIONS = 100_000;

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function pbkdf2(senha: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(senha),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

export async function hashSenha(senha: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(senha, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function checkSenha(senha: string, senhaHash: string): Promise<boolean> {
  const partes = senhaHash.split("$");
  if (partes.length !== 4 || partes[0] !== "pbkdf2") return false;
  const iterations = parseInt(partes[1], 10);
  if (iterations !== PBKDF2_ITERATIONS) return false;
  const salt = fromBase64(partes[2]);
  const esperado = fromBase64(partes[3]);
  const calculado = await pbkdf2(senha, salt);
  if (calculado.length !== esperado.length) return false;
  let diff = 0;
  for (let i = 0; i < calculado.length; i++) diff |= calculado[i] ^ esperado[i];
  return diff === 0;
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64(sig);
}

export async function criarSessionCookie(userId: number, secret: string): Promise<string> {
  const payload = String(userId);
  const assinatura = await hmac(secret, payload);
  return `${payload}.${assinatura}`;
}

export async function lerSessionCookie(valor: string | undefined, secret: string): Promise<number | null> {
  if (!valor) return null;
  const [payload, assinatura] = valor.split(".");
  if (!payload || !assinatura) return null;
  const esperada = await hmac(secret, payload);
  if (esperada !== assinatura) return null;
  const id = parseInt(payload, 10);
  return Number.isNaN(id) ? null : id;
}
