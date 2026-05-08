const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');
const clearIcon = document.getElementById('clear-icon');

function getFeedPath(query) {
    const isInAuctionsFolder = window.location.pathname.includes('/auctions/');

    if (isInAuctionsFolder) {
        return `./feed.html?search=${encodeURIComponent(query)}`;
    }

    return `./auctions/feed.html?search=${encodeURIComponent(query)}`;
}

function updateSearchIcons() {
    if (!searchInput || !searchIcon || !clearIcon) return;

    if (searchInput.value.trim().length > 0) {
        searchIcon.classList.add('hidden');
        clearIcon.classList.remove('hidden');
    } else {
        searchIcon.classList.remove('hidden');
        clearIcon.classList.add('hidden');
    }
}

if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) return;

        window.location.href = getFeedPath(query);
    });

    searchInput.addEventListener('input', updateSearchIcons);

    if (clearIcon) {
        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            updateSearchIcons();
        });
    }

    updateSearchIcons();
}
