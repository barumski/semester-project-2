export function initToTopButton() {
    document.addEventListener('DOMContentLoaded', () => {

        const toTopButton =
            document.getElementById('to-top-button') ||
            document.querySelector('.to-top');

        if (!toTopButton) {
            console.warn('No to-top button found in the document (#to-top-button / .to-top');
            return;
        }

        const footer = document.querySelector('footer');
        const baseBottom = 24;

        function handleScroll() {
            const scrolled =
                window.scrollY || document.documentElement.scrollTop;

            if (scrolled > 300) {
                toTopButton.classList.remove('opacity-0', 'pointer-events-none');
                toTopButton.classList.add('opacity-100');
            } else {
                toTopButton.classList.add('opacity-0', 'pointer-events-none');
                toTopButton.classList.remove('opacity-100');
            }

            if (footer) {
                const windowHeight = window.innerHeight;
                const footerRect = footer.getBoundingClientRect();

                const overlap = windowHeight - footerRect.top;

                if (overlap > 0) {
                    toTopButton.style.bottom = `${overlap + baseBottom}px`;
                } else {
                    toTopButton.style.bottom = `${baseBottom}px`;
                }
            }
        }

        handleScroll();

        window.addEventListener('scroll', handleScroll, {
            passive: true
        });

        toTopButton.addEventListener('click', (event) => {
            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}