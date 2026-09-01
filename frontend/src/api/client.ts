

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.urbancool.example/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Use mock data if API is not real yet, or allow fetch to fail to test loading/error states
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}
