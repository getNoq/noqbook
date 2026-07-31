// Small fetch wrapper you can build on once the Django backend is wired up.
// In dev, point VITE_API_BASE_URL at your Django server (e.g. http://localhost:8000)
// or rely on the Vite proxy in vite.config.ts.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
