import { removeFromStorage } from "../utilities.mjs";

export function logoutUser(basePath = './') {
    removeFromStorage('accessToken');
    removeFromStorage('userName');

    window.location.href = `${basePath}index.html`;
}