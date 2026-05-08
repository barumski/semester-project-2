export const BASE_API_URL = 'https://v2.api.noroff.dev';

// Auth
export const REGISTER_URL = `${BASE_API_URL}/auth/register`;
export const LOGIN_URL = `${BASE_API_URL}/auth/login`;

// Auction
export const LISTINGS_URL = `${BASE_API_URL}/auction/listings`;
export const PROFILES_URL = `${BASE_API_URL}/auction/profiles`;

// Key
export const NOROFF_API_KEY = '3e49b217-50e2-4ebb-9408-6d6a577d2c69';      

export function getHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'X-Noroff-API-Key': NOROFF_API_KEY,
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
}