import { LISTINGS_URL } from '../api/api.mjs';
import { initCarousel } from '../components/carousel.mjs';
import { initToTopButton } from '../components/toTopButton.mjs';
import { updateNav } from '../components/nav.mjs';
import { getTimeLeft } from '../utilities.mjs';

updateNav();

const latestGrid = document.getElementById('latest-listings-grid');
const feedGrid = document.getElementById('feed-listings-grid');

const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

const featuredCarousel = document.getElementById('featured-carousel');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');

const params = new URLSearchParams(window.location.search);
const searchQuery = params.get('search');

let currentPage = 1;
const feedLimit = 12;

let totalPages = 1;
let allActiveFeedListings = [];

async function fetchListings(limit = 9, page = 1) {
    try {
        const response = await fetch(
            `${LISTINGS_URL}?_seller=true&_bids=true&sort=created&sortOrder=desc&limit=${limit}&page=${page}`,
            {
                method: 'GET'
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.errors?.[0]?.message ||
                'Could not fetch listings'
            );
        }

        const activeListings = result.data.filter((listing) => {
            const now = new Date();
            const end = new Date(listing.endsAt);

            return end > now;
        });

        return activeListings;

    } catch (error) {
        console.error('Error fetching listings:', error.message);
        return [];
    }
}

async function fetchAllActiveListings() {
    try {
        let page = 1;
        let isLastPage = false;

        let allListings = [];

        while (!isLastPage) {
            const response = await fetch(
                `${LISTINGS_URL}?_seller=true&_bids=true&sort=created&sortOrder=desc&limit=100&page=${page}`,
                {
                    method: 'GET'
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.errors?.[0]?.message ||
                    'Could not fetch listings'
                );
            }

            allListings = [
                ...allListings,
                ...result.data
            ];

            isLastPage = result.meta?.isLastPage;

            page++;
        }

        const now = new Date();

        return allListings.filter((listing) => {
            return new Date(listing.endsAt) > now;
        });

    } catch (error) {
        console.error(
            'Error fetching all active listings:',
            error.message
        );

        return [];
    }
}

function updatePaginationButtons() {
    if (!prevButton || !nextButton || !pageInfo) return;

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;

    if (currentPage <= 1) {
        prevButton.classList.add('hidden');
    } else {
        prevButton.classList.remove('hidden');
    }

    nextButton.disabled =
        currentPage >= totalPages;
}

function renderListings(listings, container) {
    if (!container) return;

    container.innerHTML = '';

    listings.forEach((listing) => {
        container.innerHTML +=
            createListingCard(listing);
    });
}

function renderFeedPage() {
    const filteredListings =
        filterListingsBySearch(
            allActiveFeedListings,
            searchQuery
        );

    totalPages =
        Math.ceil(filteredListings.length / feedLimit) || 1;

    const start =
        (currentPage - 1) * feedLimit;

    const end =
        start + feedLimit;

    const listingsToRender =
        filteredListings.slice(start, end);

    renderListings(listingsToRender, feedGrid);

    updatePaginationButtons();
}

function getSingleListingPath(listingId) {
    const isOnAuctionsPage =
        window.location.pathname.includes('/auctions');

    if (isOnAuctionsPage) {
        return `./single.html?id=${listingId}`;
    }

    return `./auctions/single.html?id=${listingId}`;
}

function getRandomListings(listings) {
    return [...listings]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
}

function createListingCard(listing) {
    const imageUrl =
        listing.media?.[0]?.url ||
        './src/images/placeholder.jpg';

    const imageAlt =
        listing.media?.[0]?.alt ||
        listing.title;

    const sellerName =
        listing.seller?.name ||
        'Unknown Seller';

    const timeLeft =
        getTimeLeft(listing.endsAt);

    const currentBid =
        getCurrentBid(listing.bids);

    const listingPath =
        getSingleListingPath(listing.id);

    return `
        <a 
            href="${listingPath}"
            class="group block cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-md transition duration-200 ease-in-out hover:border-primary"
        >
            <div class="relative aspect-square w-full overflow-hidden bg-gray-200">
                <img
                    src="${imageUrl}"
                    alt="${imageAlt}"
                    class="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-110"
                >

                <div class="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/10"></div>
            </div>

            <div class="flex flex-col gap-2 p-4">
                <h2 class="truncate text-lg font-bold text-primary">
                    ${listing.title}
                </h2>

                <p class="truncate text-sm text-gray-600">
                    Seller: ${sellerName}
                </p>

                <div class="flex items-center justify-between gap-3 text-sm text-gray-700">
                    <span class="truncate">
                        ${timeLeft}
                    </span>

                    <span class="whitespace-nowrap font-semibold text-primary">
                        ${currentBid} credits
                    </span>
                </div>
            </div>
        </a>
    `;
}

function getCurrentBid(bids = []) {
    if (!bids.length) {
        return 0;
    }

    return Math.max(
        ...bids.map((bid) => bid.amount)
    );
}

function filterListingsBySearch(listings, query) {
    if (!query) return listings;

    const lowerCaseQuery =
        query.toLowerCase();

    return listings.filter((listing) => {
        const title =
            listing.title?.toLowerCase() || '';

        const description =
            listing.description?.toLowerCase() || '';

        const seller =
            listing.seller?.name?.toLowerCase() || '';

        return (
            title.includes(lowerCaseQuery) ||
            description.includes(lowerCaseQuery) ||
            seller.includes(lowerCaseQuery)
        );
    });
}

async function initListings() {

    if (latestGrid) {
        const listings = await fetchListings(24);

        if (featuredCarousel) {
            const featuredListings =
                getRandomListings(listings);

            initCarousel({
                container: featuredCarousel,
                items: featuredListings,
                prevButton: carouselPrev,
                nextButton: carouselNext,

                renderItem: (listing) => {
                    const imageUrl =
                        listing.media?.[0]?.url ||
                        './src/images/placeholder.jpg';

                    const imageAlt =
                        listing.media?.[0]?.alt ||
                        listing.title;

                    const sellerName =
                        listing.seller?.name ||
                        'Unknown Seller';

                    const timeLeft =
                        getTimeLeft(listing.endsAt);

                    const currentBid =
                        getCurrentBid(listing.bids);

                    const listingPath =
                        getSingleListingPath(listing.id);

                    return `
                        <a href="${listingPath}" 
                        class="group grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-md">

                            <div class="relative h-80 overflow-hidden bg-gray-200">
                                <img
                                    src="${imageUrl}"
                                    alt="${imageAlt}"
                                    class="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-110"
                                >
                                
                                <div class="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/10"></div>
                            </div>

                            <div class="flex flex-col justify-center gap-4 p-10">
                                <p class="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Recommended listing
                                </p>

                                <h3 class="text-3xl font-bold text-primary">
                                    ${listing.title}
                                </h3>

                                <p class="text-gray-600">
                                    Seller: ${sellerName}
                                </p>

                                <div class="flex gap-6 text-sm text-gray-700">
                                    <span>${timeLeft}</span>

                                    <span class="font-semibold text-primary">
                                        ${currentBid} credits
                                    </span>
                                </div>
                            </div>
                        </a>
                    `;
                }
            });
        }

        renderListings(
            listings.slice(0, 12),
            latestGrid
        );
    }

    if (feedGrid) {
        allActiveFeedListings =
            await fetchAllActiveListings();

        renderFeedPage();
    }
}

if (prevButton) {
    prevButton.addEventListener('click', () => {

        if (currentPage <= 1) return;

        currentPage--;

        renderFeedPage();
    });
}

if (nextButton) {
    nextButton.addEventListener('click', () => {

        if (currentPage >= totalPages) return;

        currentPage++;

        renderFeedPage();
    });
}

initListings();
initToTopButton();