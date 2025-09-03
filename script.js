const GAS_URL = 'https://script.google.com/macros/s/AKfycby1HRb733jZ2ACnKxKagRCXLy6AP1eoQlC_6Gjbxnge30UAgs4Yjy48DXWSumwCOS2EcQ/exec';

const rankImages = {
  1: 'IMG_0412.PNG',
  2: 'https://api.iconify.design/fluent-emoji/2nd-place-medal.svg',
  3: 'https://api.iconify.design/fluent-emoji/3rd-place-medal.svg'
};

async function fetchAndUpdateRanking() {
  try {
    const response = await fetch(GAS_URL);
    if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
    const data = await response.json();

    const podiumArea = document.getElementById('podium-area');
    const rankingBody = document.getElementById('ranking-body');
    podiumArea.innerHTML = '';
    rankingBody.innerHTML = '';

    if (Array.isArray(data)) {
      let rank = 1;
      data.forEach(item => {
        if (item.name && item.name.trim() !== '') {
          if (rank <= 3) {
            const rankSuffix = rank === 1 ? 'st' : (rank === 2 ? 'nd' : 'rd');
            const podiumItem = document.createElement('div');
            podiumItem.classList.add('podium-item', `podium-${rank}${rankSuffix}`);
            podiumItem.innerHTML = `
              <img src="${rankImages[rank]}" alt="${rank}位">
              <div class="podium-text-content">
              <div class="podium-name">${item.name}</div>
              <div class="podium-score">${item.score}点</div>
              </div>
            `;
            podiumArea.appendChild(podiumItem);
          } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${rank}位</td><td>${item.name}</td><td>${item.score}点</td>`;
            rankingBody.appendChild(row);
          }
          rank++;
        }
      });
    }
  } catch (error) {
    console.error('ランキング更新失敗:', error);
  }
}

fetchAndUpdateRanking();
setInterval(fetchAndUpdateRanking, 5000);