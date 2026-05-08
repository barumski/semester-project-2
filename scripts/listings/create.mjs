import { LISTINGS_URL, getHeaders } from "../api/api.mjs";
import { requireAuth } from "../auth/authGuard.mjs";
import { updateNav } from "../components/nav.mjs";
import { getFromStorage } from "../utilities.mjs";
import { initToTopButton } from "../components/toTopButton.mjs";

requireAuth();
updateNav();

const form = document.getElementById('create-listing-form');

const titleInput = document.getElementById('listing-title');
const descriptionInput = document.getElementById('listing-description');
const imageUrlInput = document.getElementById('listing-image-url');
const imageAltInput = document.getElementById('listing-image-alt');
const tagsInput = document.getElementById('listing-tags');
const endsAtInput = document.getElementById('listing-end-date');

const messageContainer = document.getElementById('create-listing-message');

function showMessage(message, type = 'error') {
    if (!messageContainer) return;

    messageContainer.textContent = message;

    messageContainer.className = 'mb-6 rounded-xl px-4 py-3 text-sm';

    if (type === 'success') {
        messageContainer.classList.add('bg-green-100', 'text-green-700');
    } else {
        messageContainer.classList.add('bg-red-100', 'text-red-700');
    }

    messageContainer.classList.remove('hidden');
}

function formatTags(tags) {
    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
}

async function createListing(event) {
    event.preventDefault();

    const token = getFromStorage('accessToken');

    if (!token) {
        showMessage('You must be logged in to create a listing.');
        return;
    }

    const listingData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        endsAt: new Date(endsAtInput.value).toISOString()
    };

    const imageUrl = imageUrlInput.value.trim();
    const imageAlt = imageAltInput.value.trim();

    if (imageUrl) {
        listingData.media = [
            {
                url: imageUrl,
                alt: imageAlt || listingData.title
            }
        ];
    }

    const tags = formatTags(tagsInput.value);

    if (tags.length) {
        listingData.tags = tags;
    }

    try {
        const response = await fetch(LISTINGS_URL, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(listingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.errors?.[0]?.message ||
                'Could not create listing'
            );
        }

        showMessage('Listing created successfully!', 'success');

        setTimeout(() => {
            window.location.href = `../auctions/single.html?id=${result.data.id}`;
        }, 1000);
    } catch (error) {
        console.error('Error creating listing:', error.message);
        showMessage(error.message);
    }
}

if (form) {
    form.addEventListener('submit', createListing);
}

initToTopButton();