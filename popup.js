document.addEventListener('DOMContentLoaded', () => {
  const modeSelect = document.getElementById('mode');
  const blacklistSection = document.getElementById('blacklist-section');
  const whitelistSection = document.getElementById('whitelist-section');
  const blacklistText = document.getElementById('blacklist');
  const whitelistText = document.getElementById('whitelist');
  const saveButton = document.getElementById('save');
  const statusEl = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['mode', 'blacklist', 'whitelist'], (result) => {
    modeSelect.value = result.mode || 'default-on';
    blacklistText.value = (result.blacklist || []).join('\n');
    whitelistText.value = (result.whitelist || []).join('\n');
    updateSections();
  });

  // Toggle sections based on mode
  modeSelect.addEventListener('change', updateSections);

  function updateSections() {
    if (modeSelect.value === 'default-on') {
      blacklistSection.style.display = 'block';
      whitelistSection.style.display = 'none';
    } else {
      blacklistSection.style.display = 'none';
      whitelistSection.style.display = 'block';
    }
  }

  // Save settings
  saveButton.addEventListener('click', () => {
    const mode = modeSelect.value;
    const blacklist = blacklistText.value.split('\n').filter(Boolean); // Filter out empty lines
    const whitelist = whitelistText.value.split('\n').filter(Boolean);

    chrome.storage.sync.set({ mode, blacklist, whitelist }, () => {
      statusEl.textContent = 'Settings saved!';
      setTimeout(() => statusEl.textContent = '', 2000);
    });
  });
});