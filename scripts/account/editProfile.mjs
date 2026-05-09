import { PROFILES_URL, getHeaders } from "../api/api.mjs";
import { requireAuth } from "../auth/authGuard.mjs";
import { updateNav } from "../components/nav.mjs";
import { initToTopButton } from "../components/toTopButton.mjs";
import { getFromStorage } from "../utilities.mjs";

requireAuth();
updateNav();

const form = document.getElementById('edit-profile-form');

const avatarUrlInput = document.getElementById('avatar-url');
const avatarAltInput = document.getElementById('avatar-alt');

const bannerUrlInput = document.getElementById('banner-url');
const bannerAltInput = document.getElementById('banner-alt');

const messageContainer = document.getElementById('edit-profile-message');

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
    } else {
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

        const response = await fetch(
            `${PROFILES_URL}/${userName}`,
            {
                method: 'GET',
                headers: getHeaders(token)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.errors?.[0]?.message ||
                'Could not fetch profile'
            );
        }

        return result.data;

    } catch (error) {
        console.error(
            'Error fetching profile',
            error.message
        );

        showMessage(error.message);

        return null;
    }
}

function fillForm(profile) {
    avatarUrlInput.value =
        profile.avatar?.url || '';

    avatarAltInput.value =
        profile.avatar?.alt || '';

    bannerUrlInput.value =
        profile.banner?.url || '';

    bannerAltInput.value =
        profile.banner?.alt || '';
}

async function updateProfile(event) {
    event.preventDefault();

    try {
        const token = getFromStorage('accessToken');
        const userName = getFromStorage('userName');

        const profileData = {
            avatar: {
                url: avatarUrlInput.value.trim(),
                alt: avatarAltInput.value.trim() || 'Profile avatar'
            },

            banner: {
                url: bannerUrlInput.value.trim(),
                alt: bannerAltInput.value.trim() || 'Profile banner'
            }
        };

        const response = await fetch(
            `${PROFILES_URL}/${userName}`,
            {
                method: 'PUT',
                headers: getHeaders(token),
                body: JSON.stringify(profileData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.errors?.[0]?.message ||
                'Could not update profile'
            );
        }

        showMessage(
            'Profile updated successfully!',
            'success'
        );

        setTimeout(() => {
            window.location.href =
                '../account/profile.html';
        }, 1000);

    } catch (error) {
        console.error(
            'Error updating profile',
            error.message
        );

        showMessage(error.message);
    }
}

async function initEditProfile() {
    const profile = await fetchProfile();

    if (!profile) return;

    fillForm(profile);
}

if (form) {
    form.addEventListener(
        'submit',
        updateProfile
    );
}

initEditProfile();
initToTopButton();