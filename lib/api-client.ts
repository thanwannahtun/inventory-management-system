export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    console.log("Fetch Token Existed:", token);

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        // Logic to handle expired tokens (e.g., clear storage and redirect)
        window.location.href = '/auth/login';
    }

    return response;
}