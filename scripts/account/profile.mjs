import { PROFILES_URL, getHeaders } from "../api/api.mjs";
import { requireAuth } from "../auth/authGuard.mjs";
import { updateNav } from "../components/nav.mjs";
import { initToTopButton } from "../components/toTopButton.mjs";
import { getFromStorage, getTimeLeft } from "../utilities.mjs";

requireAuth();
updateNav();

const profileAvatar = document.getElementById('profile-avatar');
const profileBanner = document.getElementById('profile-banner');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');

const profileCredits = document.getElementById('profile-credits');

const activeCount = document.getElementById('profile-active-count');
const endedCount = document.getElementById('profile-ended-count');

const listingsGrid = document.getElementById('profile-listings-grid');
const listingsMessage = document.getElementById('profile-listings-message');

const activeTab = document.getElementById('active-listings-tab');
const endedTab = document.getElementById('ended-listings-tab');

const ownerActions = document.getElementById('profile-owner-actions');

let activeListings = [];
let endedListings = [];

async function fetchProfile() {
    try {
        const token = getFromStorage('accessToken');
        const params = new URLSearchParams(window.location.search);
        const profileNameFromUrl = params.get('name');

        const loggedInUser = getFromStorage('userName');
        const userName = profileNameFromUrl || loggedInUser;

        const response = await fetch(
            `${PROFILES_URL}/${userName}?_listings=true`,
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
        console.error('Error fetching profile:', error.message);
        return null;
    }
}

function splitListings(listings = []) {
    const now = new Date();

    activeListings = listings.filter((listing) => {
        return new Date(listing.endsAt) > now;
    });

    endedListings = listings.filter((listing) => {
        return new Date(listing.endsAt) <= now;
    });
}

function renderProfile(profile) {

    if (profileBanner && profile.banner?.url) {
        profileBanner.src =
            profile.banner.url;

        profileBanner.alt =
            profile.banner.alt ||
            `${profile.name} profile banner`;

        profileBanner.classList.remove('hidden');
    }

    profileAvatar.src =
        profile.avatar?.url ||
        '../src/images/placeholder.jpg';

    profileAvatar.alt =
        profile.avatar?.alt ||
        profile.name;

    profileName.textContent =
        profile.name;

    profileEmail.textContent =
        profile.email;

    profileCredits.textContent =
        profile.credits || 0;

    activeCount.textContent =
        activeListings.length;

    endedCount.textContent =
        endedListings.length;

    const loggedInUser = getFromStorage('userName');

    if (loggedInUser === profile.name) {
        ownerActions.classList.remove('hidden');
    }
}

function createListingCard(listing) {
    const imageUrl =
        listing.media?.[0]?.url ||
        '../src/images/placeholder.jpg';

    const imageAlt =
        listing.media?.[0]?.alt ||
        listing.title;

    const currentBid =
        listing._count?.bids || 0;

    return `
        <a
            href="../auctions/single.html?id=${listing.id}"
            class="group block overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-md transition duration-200 ease-in-out hover:border-primary"
        >
            <div class="aspect-square overflow-hidden bg-gray-200">
                <img
                    src="${imageUrl}"
                    alt="${imageAlt}"
                    class="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
                >
            </div>

            <div class="flex flex-col gap-2 p-4">
                <h3 class="truncate text-lg font-bold text-primary">
                    ${listing.title}
                </h3>

                <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>${getTimeLeft(listing.endsAt)}</span>
                    <span>${currentBid} bids</span>
                </div>
            </div>
        </a>
    `;
}

function renderListings(listings) {
    listingsGrid.innerHTML = '';

    if (!listings.length) {
        listingsMessage.textContent = 'No listings found.';
        listingsMessage.classList.remove('hidden');
        return;
    }

    listingsMessage.classList.add('hidden');

    listings.forEach((listing) => {
        listingsGrid.innerHTML += createListingCard(listing);
    });
}

function setActiveTab(tab = 'active') {
    if (tab === 'active') {
        activeTab.classList.add('bg-primary', 'text-white');
        activeTab.classList.remove('border', 'border-primary', 'text-primary');

        endedTab.classList.remove('bg-primary', 'text-white');
        endedTab.classList.add('border', 'border-primary', 'text-primary');

        renderListings(activeListings);
        return;
    }

    endedTab.classList.add('bg-primary', 'text-white');
    endedTab.classList.remove('border', 'border-primary', 'text-primary');

    activeTab.classList.remove('bg-primary', 'text-white');
    activeTab.classList.add('border', 'border-primary', 'text-primary');

    renderListings(endedListings);
}

async function initProfilePage() {
    const profile = await fetchProfile();

    if (!profile) return;

    splitListings(profile.listings);

    renderProfile(profile);

    setActiveTab('active');
}

if (activeTab) {
    activeTab.addEventListener('click', () => {
        setActiveTab('active');
    });
}

if (endedTab) {
    endedTab.addEventListener('click', () => {
        setActiveTab('ended');
    });
}

initProfilePage();
initToTopButton();