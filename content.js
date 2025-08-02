let settings = {
  mode: 'default-on',
  blacklist: [],
  whitelist: []
};

// Map to store iframe-button pairs and their state
const iframeButtonMap = new Map();

chrome.storage.sync.get(['mode', 'blacklist', 'whitelist'], (result) => {
  settings.mode = result.mode || 'default-on';
  settings.blacklist = result.blacklist || [];
  settings.whitelist = result.whitelist || [];
  processPage();
});

function shouldAddButton(url) {
  if (!url || url === 'about:blank') return false;
  const { mode, blacklist, whitelist } = settings;
  try {
    if (mode === 'default-on') {
      return !blacklist.some(pattern => new RegExp(pattern).test(url));
    } else {
      return whitelist.some(pattern => new RegExp(pattern).test(url));
    }
  } catch (e) {
    console.error("Iframe Fullscreen Button: Invalid regex pattern", e);
    return true;
  }
}

function createOrUpdateButtonForIframe(iframe) {
  if (!shouldAddButton(window.location.href)) return;

  let button;
  if (iframeButtonMap.has(iframe)) {
    // Button already exists, just update its position
    button = iframeButtonMap.get(iframe).button;
  } else {
    // Create a new button
    button = document.createElement('button');
    button.innerText = 'Fullscreen';
    button.className = 'fullscreen-button';
    document.body.appendChild(button);

    iframeButtonMap.set(iframe, { button, visible: false });

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      }
    });

    // Show/hide logic
    const show = () => {
      button.style.visibility = 'visible';
      button.style.opacity = '0.7';
    };
    const hide = () => {
      button.style.visibility = 'hidden';
      button.style.opacity = '0';
    };

    let timeoutId;

    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      show();
    };

    const handleMouseLeave = () => {
      timeoutId = setTimeout(hide, 100);
    };

    iframe.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseenter', handleMouseEnter);
    iframe.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mouseleave', handleMouseLeave);
  }

  // Update position
  const rect = iframe.getBoundingClientRect();
  button.style.top = `${rect.top + window.scrollY + 10}px`;
  button.style.left = `${rect.left + window.scrollX + rect.width - button.offsetWidth - 10}px`;
}

function updateAllButtonPositions() {
  for (const iframe of iframeButtonMap.keys()) {
    // Check if the iframe is still in the DOM
    if (document.body.contains(iframe)) {
      createOrUpdateButtonForIframe(iframe);
    } else {
      // Clean up if the iframe was removed
      const { button } = iframeButtonMap.get(iframe);
      button.remove();
      iframeButtonMap.delete(iframe);
    }
  }
}

function processAllIframes() {
  document.querySelectorAll('iframe').forEach(createOrUpdateButtonForIframe);
}

function processPage() {
  processAllIframes();

  // Periodically update positions to handle scroll, resize, and dynamic changes
  setInterval(updateAllButtonPositions, 200);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'IFRAME') {
              createOrUpdateButtonForIframe(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll('iframe').forEach(createOrUpdateButtonForIframe);
            }
          }
        });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}