const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export function apiUrl(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE.replace(/\/+$/, '');
  if (normalizedPath === base || normalizedPath.startsWith(`${base}/`)) return normalizedPath;
  if (normalizedPath === '/api/v1' || normalizedPath.startsWith('/api/v1/')) {
    return `${base}${normalizedPath.slice('/api/v1'.length)}`;
  }
  return `${base}${normalizedPath}`;
}

export function mediaUrl(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!normalizedPath.startsWith('/storage/')) return apiUrl(normalizedPath);

  try {
    return `${new URL(API_BASE).origin}${normalizedPath}`;
  } catch {
    return normalizedPath;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('ppa_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...options,
      headers,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'خطای شبکه نامشخص';
    throw new Error(`اتصال به API برقرار نشد؛ سرور Laravel و پراکسی Vite را بررسی کنید. (${reason})`);
  }

  if (!res.ok) {
    const endpoint = apiUrl(path);
    let msg = `سرور درخواست را با خطای HTTP ${res.status} رد کرد.`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {
      // ignore non-json error
    }
    throw new ApiError(res.status, `${msg} (${endpoint})`);
  }

  return res.json() as Promise<T>;
}

export async function apiBlob(path: string): Promise<Blob> {
  const token = localStorage.getItem('ppa_token');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { headers });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'خطای شبکه نامشخص';
    throw new Error(`دریافت فایل از API ناموفق بود. (${reason})`);
  }

  if (!response.ok) {
    let message = `دریافت فایل با خطای HTTP ${response.status} ناموفق بود.`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // The error response may not contain JSON.
    }
    throw new ApiError(response.status, `${message} (${apiUrl(path)})`);
  }

  return response.blob();
}

export async function apiMultipartRequest<T>(path: string, body: FormData): Promise<T> {
  const token = localStorage.getItem('ppa_token');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { method: 'POST', headers, body });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'خطای شبکه نامشخص';
    throw new Error(`ارسال فایل به API ناموفق بود. (${reason})`);
  }

  if (!response.ok) {
    let message = `سرور درخواست را با خطای HTTP ${response.status} رد کرد.`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // The error response may not contain JSON.
    }
    throw new ApiError(response.status, `${message} (${apiUrl(path)})`);
  }

  return response.json() as Promise<T>;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsDataURL(file);
  });
}
