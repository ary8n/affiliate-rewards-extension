document.addEventListener('DOMContentLoaded', () => {
  const bannerEnabledEl = document.getElementById('bannerEnabled');
  const remoteDataUrlEl = document.getElementById('remoteDataUrl');
  const statusEl = document.getElementById('status');
  const saveBtn = document.getElementById('saveBtn');

  chrome.storage.sync.get(['bannerEnabled', 'remoteDataUrl'], data => {
    bannerEnabledEl.checked = data.bannerEnabled !== false; // default true
    remoteDataUrlEl.value = data.remoteDataUrl || '';
  });

  saveBtn.addEventListener('click', () => {
    const payload = {
      bannerEnabled: bannerEnabledEl.checked,
      remoteDataUrl: remoteDataUrlEl.value.trim() || null
    };
    chrome.storage.sync.set(payload, () => {
      statusEl.textContent = 'Saved!';
      setTimeout(() => statusEl.textContent = '', 2000);
    });
  });
});
