import { PROFILES_URL, getHeaders } from "../api/api.mjs";
import { getFromStorage } from "../utilities.mjs";
import { logoutUser } from "../auth/logout.mjs";

function getBasePath() {
    const path = window.location.pathname;

    if (
        path.includes('/account/') ||
        path.includes('/auctions/') ||
        path.includes('/docs/')
    ) {
        return '../';
    }

    return './';
}

async function updateNavCredits() {
    const navCredits = document.getElementById('nav-credits');

    if (!navCredits) return;

    try {
        const token = getFromStorage('accessToken');
        const userName = getFromStorage('userName');

        const response = await fetch(`${PROFILES_URL}/${userName}`, {
            method: 'GET',
            headers: getHeaders(token)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Could not fetch credits');
        }

        navCredits.textContent = result.data.credits || 0;
    }   catch (error) {
        console.error('Error updating nav credits', error.message);
    }
}

export function updateNav() {
    const navLinkOne = document.getElementById('nav-link-one');
    const navLinkTwo = document.getElementById('nav-link-two');

    const accountLink = document.getElementById('account-link');
    const creditsLink = document.getElementById('credits-link');

    if (!navLinkOne || !navLinkTwo) return;

    const basePath = getBasePath();

    const token = getFromStorage('accessToken');
    const userName = getFromStorage('userName');

    if (token && userName) {

        if (accountLink) {
            accountLink.classList.remove('hidden');
        }

        if (creditsLink) {
            creditsLink.classList.remove('hidden');
        }

        updateNavCredits();

        navLinkOne.textContent = 'Create listing';
        navLinkOne.href = `${basePath}auctions/create.html`;

        navLinkTwo.textContent = 'Logout';
        navLinkTwo.href = '#';

        navLinkTwo.addEventListener('click', (event) => {
            event.preventDefault();

            logoutUser(basePath);
        });

        return;
    }

    if (accountLink) {
        accountLink.classList.add('hidden');
    }

    if (creditsLink) {
        creditsLink.classList.add('hidden');
    }

    navLinkOne.textContent = 'Login';
    navLinkOne.href = `${basePath}account/login.html`;

    navLinkTwo.textContent = 'Register';
    navLinkTwo.href = `${basePath}account/register.html`;
}