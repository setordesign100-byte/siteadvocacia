export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(action: string, options: {
  method?: 'GET' | 'POST';
  body?: unknown;
  csrfToken?: string;
  signal?: AbortSignal;
} = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const multipart = options.body instanceof FormData;
  if (options.body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
  if (options.csrfToken) headers['X-CSRF-Token'] = options.csrfToken;

  let response: Response;
  try {
    response = await fetch(`/api/blog.php?action=${action}`, {
      method: options.method || 'GET',
      headers,
      credentials: 'same-origin',
      cache: 'no-store',
      signal: options.signal,
      body: options.body === undefined ? undefined : multipart ? options.body as FormData : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Não foi possível conectar ao blog. Confira sua conexão e tente novamente.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('O blog precisa estar na hospedagem com PHP habilitado para carregar e salvar publicações.', response.status || 503);
  }
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new ApiError('A hospedagem retornou uma resposta incompleta. Tente novamente.', 502); }
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'Não foi possível concluir esta ação.';
    throw new ApiError(message, response.status);
  }
  return data as T;
}
