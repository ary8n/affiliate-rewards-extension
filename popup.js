document.addEventListener('DOMContentLoaded', () => {
  const pointsEl = document.getElementById('points');
  const redeemBtn = document.getElementById('redeemBtn');

  function loadPoints() {
    chrome.storage.local.get(['points'], data => {
      pointsEl.textContent = (data.points || 0).toFixed(1).replace(/\.0$/, '');
    });
  }

  redeemBtn.addEventListener('click', () => {
    alert('Redemption feature coming soon. Stay tuned!');
  });

  loadPoints();
});
