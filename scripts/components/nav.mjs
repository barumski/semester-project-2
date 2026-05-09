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
    const mobileNavCredits = document.getElementById('mobile-nav-credits');

    if (!navCredits && !mobileNavCredits) return;

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

        const credits = result.data.credits || 0;

        if (navCredits) {
            navCredits.textContent = credits;
        }

        if (mobileNavCredits) {
            mobileNavCredits.textContent = credits;
        }
    } catch (error) {
        console.error('Error updating nav credits:', error.message);
    }
}

function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('pointer-events-none');
        mobileMenu.classList.toggle('opacity-0');
        mobileMenu.classList.toggle('-translate-y-3');
    });
}

export function updateNav() {
    const navLinkOne = document.getElementById('nav-link-one');
    const navLinkTwo = document.getElementById('nav-link-two');

    const mobileNavLinkOne = document.getElementById('mobile-nav-link-one');
    const mobileNavLinkTwo = document.getElementById('mobile-nav-link-two');

    const accountLink = document.getElementById('account-link');
    const creditsLink = document.getElementById('credits-link');

    const mobileAccountLink = document.getElementById('mobile-account-link');
    const mobileCreditsLink = document.getElementById('mobile-credits-link');

    if (!navLinkOne || !navLinkTwo) return;

    initMobileMenu();

    const basePath = getBasePath();

    const token = getFromStorage('accessToken');
    const userName = getFromStorage('userName');

    if (token && userName) {
        if (accountLink) accountLink.classList.remove('hidden');
        if (creditsLink) creditsLink.classList.remove('hidden');
        if (mobileAccountLink) mobileAccountLink.classList.remove('hidden');
        if (mobileCreditsLink) mobileCreditsLink.classList.remove('hidden');

        updateNavCredits();

        navLinkOne.textContent = 'Create listing';
        navLinkOne.href = `${basePath}auctions/create.html`;

        navLinkTwo.textContent = 'Logout';
        navLinkTwo.href = '#';

        if (mobileNavLinkOne) {
            mobileNavLinkOne.textContent = 'Create listing';
            mobileNavLinkOne.href = `${basePath}auctions/create.html`;
        }

        if (mobileNavLinkTwo) {
            mobileNavLinkTwo.textContent = 'Logout';
            mobileNavLinkTwo.href = '#';
        }

        navLinkTwo.addEventListener('click', (event) => {
            event.preventDefault();
            logoutUser(basePath);
        });

        if (mobileNavLinkTwo) {
            mobileNavLinkTwo.addEventListener('click', (event) => {
                event.preventDefault();
                logoutUser(basePath);
            });
        }

        return;
    }

    if (accountLink) accountLink.classList.add('hidden');
    if (creditsLink) creditsLink.classList.add('hidden');
    if (mobileAccountLink) mobileAccountLink.classList.add('hidden');
    if (mobileCreditsLink) mobileCreditsLink.classList.add('hidden');

    navLinkOne.textContent = 'Login';
    navLinkOne.href = `${basePath}account/login.html`;

    navLinkTwo.textContent = 'Register';
    navLinkTwo.href = `${basePath}account/register.html`;

    if (mobileNavLinkOne) {
        mobileNavLinkOne.textContent = 'Login';
        mobileNavLinkOne.href = `${basePath}account/login.html`;
    }

    if (mobileNavLinkTwo) {
        mobileNavLinkTwo.textContent = 'Register';
        mobileNavLinkTwo.href = `${basePath}account/register.html`;
    }
}