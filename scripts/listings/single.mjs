import { LISTINGS_URL, getHeaders } from "../api/api.mjs";
import { initCarousel } from "../components/carousel.mjs";
import { initToTopButton } from "../components/toTopButton.mjs";
import { updateNav } from "../components/nav.mjs";
import { getFromStorage, getTimeLeft } from "../utilities.mjs";

updateNav();

const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

const carousel = document.getElementById('single-listing-carousel');
const carouselPrev = document.getElementById('single-carousel-prev');
const carouselNext = document.getElementById('single-carousel-next');
const carouselCounter = document.getElementById('single-carousel-counter');

const titleElement = document.getElementById('single-title');
const sellerElement = document.getElementById('single-seller');
const sellerLink = document.getElementById('single-seller-link');
const descriptionElement = document.getElementById('single-description');
const currentBidElement = document.getElementById('single-current-bid');
const timeLeftElement = document.getElementById('single-time-left');
const bidHistoryElement = document.getElementById('bid-history');
const tagsElement = document.getElementById('single-tags');

const bidInput = document.getElementById('bid-amount');
const bidForm = document.getElementById('bid-form');
const bidButton = document.getElementById('bid-button');
const clearBidButton = document.getElementById('clear-bid-button');

const ownerActions = document.getElementById('owner-actions');
const editListingButton = document.getElementById('edit-listing-button');
const deleteListingButton = document.getElementById('delete-listing-button');

let countdownInterval;

async function fetchSingleListing(id) {
    try {
        const token = getFromStorage('accessToken');

        const response = await fetch(`${LISTINGS_URL}/${id}?_seller=true&_bids=true`, {
            method: 'GET',
            headers: getHeaders(token)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Could not fetch listing');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching single listing:', error.message);
        return null;
    }
}

function getCurrentBid(bids = []) {
    if (!bids.length) {
        return 0;
    }

    return Math.max(...bids.map((bid) => bid.amount));
}

async function placeBid(listing) {
    if (!listing) return;

    const token = getFromStorage('accessToken');
    const userName = getFromStorage('userName');

    if (!token || !userName) {
        window.location.href = '../account/login.html';
        return;
    }

    const bidAmount = Number(bidInput.value);
    const currentBid = getCurrentBid(listing.bids);

    if (!bidAmount) {
        alert('Please enter a bid amount.');
        return;
    }

    if (bidAmount <= currentBid) {
        alert(`Your bid must be higher than ${currentBid} credits.`);
        return;
    }

    try {
        const response = await fetch(`${LISTINGS_URL}/${listing.id}/bids`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({
                amount: bidAmount
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Could not place bid');
        }

        window.location.reload();
    } catch (error) {
        console.error('Error placing bid:', error.message);
        alert(error.message);
    }
}

function startCountdown(endDate) {
    if (!timeLeftElement) return;

    clearInterval(countdownInterval);

    function updateCountdown() {
        timeLeftElement.textContent = getTimeLeft(endDate, true);

        if (new Date(endDate) <= new Date()) {
            clearInterval(countdownInterval);
        }
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function renderSingleListing(listing) {
    if (!listing) return;

    titleElement.textContent = listing.title;
    sellerElement.textContent = listing.seller?.name || 'Unknown seller';

    if (sellerLink && listing.seller?.name) {
        sellerLink.href = `../account/profile.html?name=${listing.seller.name}`;
    }
    
    descriptionElement.textContent = listing.description || 'No description available.';
    currentBidElement.textContent = `${getCurrentBid(listing.bids)} credits`;

    startCountdown(listing.endsAt);

    renderImageCarousel(listing);
    renderBidHistory(listing.bids);
    updateBidFormState(listing);
    renderTags(listing.tags);
    renderOwnerActions(listing);
}

function renderOwnerActions(listing) {
    if (!ownerActions || !editListingButton || !deleteListingButton) return;

    const loggedInUser = getFromStorage('userName');

    if (listing.seller?.name !== loggedInUser) {
        return;
    }

    ownerActions.classList.remove('hidden');

    editListingButton.href = `../auctions/edit.html?id=${listing.id}`;

    deleteListingButton.addEventListener('click', () => {
        deleteListing(listing.id);
    });
}

async function deleteListing(id) {
    const confirmed = confirm('Are you sure you want to delete this listing?');

    if (!confirmed) return;

    try {
        const token = getFromStorage('accessToken');

        const response = await fetch(`${LISTINGS_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(token)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.errors?.[0]?.message || 'Could not delete listing');
        }

        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error deleting listing:', error.message);
        alert('Could not delete listing. Please try again.');
    }
}

function renderImageCarousel(listing) {
    const media = listing.media?.length
        ? listing.media
        : [{ url: '../src/placeholder-image.png', alt: listing.title }];

    initCarousel({
        container: carousel,
        items: media,
        prevButton: carouselPrev,
        nextButton: carouselNext,
        counter: carouselCounter,

        renderItem: (image) => {
            return `
                <div class="relative h-80 overflow-hidden border-2 border-gray-200 bg-gray-200 shadow-sm md:h-[520px]">
                    <img
                        src="${image.url}"
                        alt="${image.alt || listing.title}"
                        class="h-full w-full object-cover"
                    >
                </div>
            `;
        }
    });
}

function renderTags(tags = []) {
    if (!tagsElement) return;

    if (!tags.length) {
        tagsElement.innerHTML = '';
        return;
    }

    tagsElement.innerHTML = tags
        .map((tag) => {
            return `
                <span class="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                    ${tag}
                </span>
            `;
        })
        .join('');
}

function updateBidClearButton() {
    if (!bidInput || !clearBidButton) return;

    if (bidInput.value.trim().length > 0) {
        clearBidButton.classList.remove('hidden');
    } else {
        clearBidButton.classList.add('hidden');
    }
}

function updateBidFormState(listing) {
    const isEnded = new Date(listing.endsAt) <= new Date();

    if (!bidInput || !bidButton) return;

    if (isEnded) {
        bidInput.disabled = true;
        bidInput.placeholder = 'This auction has ended';

        bidButton.disabled = true;
        bidButton.textContent = 'Auction ended';

        bidButton.classList.add('opacity-50', 'cursor-not-allowed');
        bidButton.classList.remove('hover:opacity-80', 'active:scale-95');
    }
}

function renderBidHistory(bids = []) {
    if (!bidHistoryElement) return;

    if (!bids.length) {
        bidHistoryElement.innerHTML = `
            <p class="text-sm text-gray-600">
                No bids placed yet.
            </p>
        `;

        return;
    }

    const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);

    bidHistoryElement.innerHTML = sortedBids
        .map((bid) => {
            return `
                <div class="flex items-center justify-between border-b border-gray-200 py-3 last:border-b-0">
                    <p class="font-medium text-primary">
                        ${bid.bidder?.name || 'Unknown bidder'}
                    </p>

                    <p class="font-bold text-primary">
                        ${bid.amount} credits
                    </p>
                </div>
            `;
        })
        .join('');
}

async function initSingleListing() {
    if (!listingId) {
        console.error('No listing id found in URL');
        return;
    }

    const listing = await fetchSingleListing(listingId);

    renderSingleListing(listing);
}

if (bidInput) {
    bidInput.addEventListener('input', () => {
        bidInput.value = bidInput.value.replace(/\D/g, '');
        updateBidClearButton();
    });
}

if (clearBidButton) {
    clearBidButton.addEventListener('click', () => {
        bidInput.value = '';
        bidInput.focus();
        updateBidClearButton();
    });
}

if (bidForm) {
    bidForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const listing = await fetchSingleListing(listingId);
        placeBid(listing);
    });
}

initSingleListing();
initToTopButton();