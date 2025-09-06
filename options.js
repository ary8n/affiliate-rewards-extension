document.addEventListener('DOMContentLoaded', () => {
  const bannerEnabledEl = document.getElementById('bannerEnabled');
  const remoteDataUrlEl = document.getElementById('remoteDataUrl');
  const statusEl = document.getElementById('status');
  const analyticsEnabledEl = document.getElementById('analyticsEnabled');
  const saveBtn = document.getElementById('saveBtn');

  chrome.storage.sync.get(['bannerEnabled', 'remoteDataUrl', 'analyticsEnabled'], data => {
    bannerEnabledEl.checked = data.bannerEnabled !== false; // default true
    remoteDataUrlEl.value = data.remoteDataUrl || '';
    analyticsEnabledEl.checked = data.analyticsEnabled === true; // default false
  });

  saveBtn.addEventListener('click', () => {
    const payload = {
      bannerEnabled: bannerEnabledEl.checked,
      remoteDataUrl: remoteDataUrlEl.value.trim() || null,
      analyticsEnabled: analyticsEnabledEl.checked
    };
    chrome.storage.sync.set(payload, () => {
      statusEl.textContent = 'Saved!';
      setTimeout(() => statusEl.textContent = '', 2000);
    });
  });
});
