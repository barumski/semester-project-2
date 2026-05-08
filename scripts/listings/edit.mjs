import { LISTINGS_URL, getHeaders } from "../api/api.mjs";
import { requireAuth } from "../auth/authGuard.mjs";
import { updateNav } from "../components/nav.mjs";
import { initToTopButton } from "../components/toTopButton.mjs";
import { getFromStorage } from "../utilities.mjs";

requireAuth();
updateNav();

const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

const form = document.getElementById('edit-listing-form');

const titleInput = document.getElementById('listing-title');
const descriptionInput = document.getElementById('listing-description');
const imageUrlInput = document.getElementById('listing-image-url');
const imageAltInput = document.getElementById('listing-image-alt');
const tagsInput = document.getElementById('listing-tags');
const endsAtInput = document.getElementById('listing-end-date');

const messageContainer = document.getElementById('edit-listing-message');

function showMessage(message, type = 'error') {
    if (!messageContainer) return;

    messageContainer.textContent = message;
    messageContainer.className = 'rounded-xl px-4 py-3 text-sm';

    if (type === 'success') {
        messageContainer.classList.add('bg-green-100', 'text-green-700');
    }   else {
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

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
}

async function fetchListing() {
    try {
        const token = getFromStorage('accessToken');

        const response = await fetch(`${LISTINGS_URL}/${listingId}?_seller=true`, {
            method: 'GET',
            headers: getHeaders(token)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Could not fetch listing');
        }

        return result.data;
    }   catch (error) {
        console.error('Error fetching listing', error.message);
        showMessage(error.message);
        return null;
    }
    
}

function fillForm(listing) {
    titleInput.value = listing.title || '';
    descriptionInput.value = listing.description || '';
    imageUrlInput.value = listing.media?.[0]?.url || '';
    imageAltInput.value = listing.media?.[0]?.alt || '';
    tagsInput.value = listing.tags?.join(', ') || '';
    endsAtInput.value = formatDateForInput(listing.endsAt);
}

async function updateListing(event) {
    event.preventDefault();

    const token = getFromStorage('accessToken');

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
    }   else {
        listingData.media = [];
    }

    const tags = formatTags(tagsInput.value);
    listingData.tags = tags;

    try {
        const response = await fetch(`${LISTINGS_URL}/${listingId}`, {
            method: 'PUT',
            headers: getHeaders(token),
            body: JSON.stringify(listingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Could not update listing');
        }

        showMessage('Listing updated successfully!', 'success');

        setTimeout(() => {
            window.location.href = `../auctions/single.html?id=${result.data.id}`;
        }, 1000);
    }   catch (error) {
        console.error('Error updating listing', error.message);
        showMessage(error.message);
    } 
}

async function initEditListing() {
    if (!listingId) {
        showMessage('No listing id found in URL.');
        return;
    }

    const listing = await fetchListing();

    if (!listing) return;

    const loggedInUser = getFromStorage('userName');

    if (listing.seller?.name !== loggedInUser) {
        showMessage('You can only edit your own listings.');
        return;
    }

    fillForm(listing);
}

if (form) {
    form.addEventListener('submit', updateListing);
}

initEditListing();
initToTopButton();