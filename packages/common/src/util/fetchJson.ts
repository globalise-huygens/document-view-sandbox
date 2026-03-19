export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string
  ) {
    super(message);
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new FetchError(
      `${response.status} ${response.statusText}: ${url}`,
      response.status,
      response.url
    );
  }
  return response.json() as Promise<T>;
}