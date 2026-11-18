const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'خطای شبکه نامشخص';
    throw new Error(`اتصال به API برقرار نشد؛ سرور Laravel و پراکسی Vite را بررسی کنید. (${reason})`);
  }

  if (!res.ok) {
    const endpoint = `${API_BASE}${path}`;
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

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsDataURL(file);
  });
}
