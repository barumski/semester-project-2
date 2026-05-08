import { getFromStorage } from "../utilities.mjs";

export function requireAuth() {
    const token = getFromStorage('accessToken');
    const userName = getFromStorage('userName');

    if (!token || !userName) {
        window.location.href = '../account/login.html';
    }
}