export function initCarousel({
    container,
    items,
    prevButton,
    nextButton,
    renderItem,
    counter,
}) {
    if (!container || !items.length) return;

    let currentIndex = 0;

    function render() {
        container.innerHTML = renderItem(items[currentIndex]);
        
        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${items.length}`;
        }
    }

    prevButton?.addEventListener('click', () => {
        currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        render();
    });

    nextButton?.addEventListener('click', () => {
        currentIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
        render();
    });

    render();
}