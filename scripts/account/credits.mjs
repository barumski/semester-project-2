import { PROFILES_URL, getHeaders } from "../api/api.mjs";
import { requireAuth } from "../auth/authGuard.mjs";
import { updateNav } from "../components/nav.mjs";
import { initToTopButton } from "../components/toTopButton.mjs";
import { getFromStorage } from "../utilities.mjs";

requireAuth();
updateNav();

const creditsElement = document.getElementById('current-credits');

const form = document.getElementById('credits-form');
const amountInput = document.getElementById('credits-amount');

const messageContainer = document.getElementById('credits-message');

function showMessage(message, type = 'error') {
    if (!messageContainer) return;

    messageContainer.textContent = message;

    messageContainer.className = 
        'rounded-xl px-4 py-3 text-sm';

    if (type === 'success') {
        messageContainer.classList.add(
            'bg-green-100',
            'text-green-700'
        );
    }   else {
        messageContainer.classList.add(
            'bg-red-100',
            'text-red-700'
        );
    }

    messageContainer.classList.remove('hidden');
}

async function fetchProfile() {
    try {
        const token = getFromStorage('accessToken');
        const userName = getFromStorage('userName');

        const response = await fetch(`${PROFILES_URL}/${userName}`, {
            method: 'GET',
            headers: getHeaders(token)
        });

        const result = await response.json();

        if(!response.ok) {
            throw new Error(
                result.errors?.[0]?.message ||
                'Could not fetch profile'
            );
        }

        return result.data;

    }   catch (error){
        console.error('Error fetching profile', error.message);
        showMessage(error.message);

        return null;
    }
}

function renderCredits(profile) {
    if(!creditsElement || !profile) return;

    creditsElement.textContent = profile.credits || 0;
}

async function addCredits(event) {
    event.preventDefault();

    const currentCredits =
        Number(creditsElement.textContent);

    const amount =
        Number(amountInput.value);

    if (!amount || amount <= 0) {
        showMessage('Please enter a valid amount.');
        return;
    }

    const updatedCredits =
        currentCredits + amount;

    creditsElement.textContent = updatedCredits;

    showMessage(
        `${amount} credits added successfully!`,
        'success'
    );

    form.reset();
}

async function initCreditsPage() {
    const profile = await fetchProfile();

    if (!profile) return;

    renderCredits(profile);
}

if (form) {
    form.addEventListener('submit', addCredits);
}

initCreditsPage();
initToTopButton();