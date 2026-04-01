const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');
    
    // Set up headers
    const headers = new Headers(options.headers || {});
    
    // Add Authorization header if token exists and it wasn't explicitly passed
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    const config: RequestInit = {
        ...options,
        headers,
    };
    
    // Auto-prepend base URL if a relative path is provided
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);
        
        // Global handler for 401 Unauthorized
        if (response.status === 401) {
            if (localStorage.getItem('token')) {
                console.warn('Unauthorized access: Token is invalid or expired. Logging out.');
                localStorage.removeItem('token');
                
                // Redirect user to login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        
        return response;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};
