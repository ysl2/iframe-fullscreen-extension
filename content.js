
function addFullscreenButton(iframe) {
    // Prevent re-wrapping by checking if the parent is already a wrapper.
    if (iframe.parentNode.classList.contains('fullscreen-wrapper')) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('fullscreen-wrapper');

    // Copy essential layout styles from the iframe to the wrapper.
    const computedStyle = getComputedStyle(iframe);
    wrapper.style.display = computedStyle.display === 'inline' ? 'inline-block' : computedStyle.display;
    wrapper.style.width = computedStyle.width;
    wrapper.style.height = computedStyle.height;
    wrapper.style.position = 'relative'; // For the button's positioning.

    // Replace the iframe with the wrapper.
    iframe.parentNode.replaceChild(wrapper, iframe);
    // And put the iframe inside the wrapper.
    wrapper.appendChild(iframe);

    // Reset iframe styles to make it fill the wrapper.
    iframe.style.position = 'absolute';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.top = '0';
    iframe.style.left = '0';

    const button = document.createElement('button');
    button.innerText = 'Fullscreen';
    button.className = 'fullscreen-button';

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        }
    });

    wrapper.appendChild(button);
}

function processAllIframes() {
    document.querySelectorAll('iframe').forEach(addFullscreenButton);
}

// Run on initial load.
processAllIframes();

// Use a MutationObserver to detect iframes added later.
const observer = new MutationObserver((mutations) => {
    // Disconnect the observer to prevent it from triggering on its own changes.
    observer.disconnect();

    let newIframesFound = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes) {
            mutation.addedNodes.forEach(node => {
                // Check if the added node is an iframe or contains iframes.
                if (node.tagName === 'IFRAME' || (node.querySelector && node.querySelector('iframe'))) {
                    newIframesFound = true;
                }
            });
        }
    }

    if (newIframesFound) {
        processAllIframes();
    }

    // Reconnect the observer.
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Start observing.
observer.observe(document.body, {
    childList: true,
    subtree: true
});
