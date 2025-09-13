let currentRankingData = [];
let searchResults = []; // ★追加: 検索結果のインデックスを保持
let currentSearchIndex = 0; // ★追加: 現在表示している検索結果の番号
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzAYeM6Y5QCeRT4YEhfV4XDZ-GC4DypOJK0gCicMwqiVDFUHugtJNgD9_1yQTdaxM8w6g/exec';

const rankImages = {
  1: 'ranking_1.png',
  2: 'ranking_2.png',
  3: 'ranking_3.png'
};

async function fetchAndUpdateRanking() {
  try {
    const response = await fetch(GAS_URL);
    if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
    const data = await response.json();

    currentRankingData = data;

    const podiumArea = document.getElementById('podium-area');
    const rankingBody = document.getElementById('ranking-body');
    podiumArea.innerHTML = '';
    rankingBody.innerHTML = '';

    if (Array.isArray(data)) {
      let rank = 1;
      data.forEach(item => {
        if (item.name && String(item.name).trim() !== '') {
          if (rank <= 3) {
            // === ここからが新しい表彰台のコード ===
            const rankSuffix = rank === 1 ? 'st' : (rank === 2 ? 'nd' : 'rd');
            const podiumRankContainer = document.createElement('div');
            podiumRankContainer.id = `rank-${rank}`;
            podiumRankContainer.classList.add('podium-rank-container', `podium-${rank}${rankSuffix}`);

            const classHtml = item.class && String(item.class).trim() !== '' ? `<div class="podium-class">${item.class}</div>` : '';

            podiumRankContainer.innerHTML = `
              <div class="podium-content">
                <img src="${rankImages[rank]}" alt="${rank}位">
                <div class="podium-text-content">
                  ${classHtml}
                  <div class="podium-name">${item.name}</div>
                  <div class="podium-score">${item.score}点</div>
                </div>
              </div>
              <div class="podium-base"></div>
            `;
            podiumArea.appendChild(podiumRankContainer);
            // === ここまでが新しい表彰台のコード ===
          } else {
            const row = document.createElement('tr');
            row.id = `rank-${rank}`;

            const classText = item.class && String(item.class).trim() !== '' ? item.class : '';
            row.innerHTML = `<td>${rank}位</td><td>${classText}</td><td>${item.name}</td><td>${item.score}点</td>`;
            rankingBody.appendChild(row);
          }
          rank++;
        }
      }); // forEachの閉じ括弧
    } // if (Array.isArray)の閉じ括弧
  } catch (error) { // tryに対応するcatch
    console.error('ランキング更新失敗:', error);
  } // catchの閉じ括弧
} // fetchAndUpdateRanking関数の閉じ括弧

fetchAndUpdateRanking();
setInterval(fetchAndUpdateRanking, 10000);

// 【変更前】の「--- 検索機能 ---」以降のブロックをまるごと削除し、以下に差し替え

// --- 検索機能 ---

function updateNavButtons() {
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  if (searchResults.length <= 1) {
    prevButton.disabled = true;
    nextButton.disabled = true;
  } else {
    prevButton.disabled = (currentSearchIndex === 0);
    nextButton.disabled = (currentSearchIndex === searchResults.length - 1);
  }
}

function scrollToResult(index) {
  const rank = searchResults[index] + 1;
  const targetElement = document.getElementById(`rank-${rank}`);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    targetElement.classList.add('highlight');
  }
}

// 検索を実行する関数
function performSearch() {
  const searchInput = document.getElementById('search-input');
  const messageEl = document.getElementById('search-result-message');
  const searchTerm = searchInput.value.trim().toLowerCase();

  searchResults = [];
  currentSearchIndex = 0;

  if (searchTerm) {
    currentRankingData.forEach((item, index) => {
      if (item.name && String(item.name).toLowerCase().includes(searchTerm)) {
        searchResults.push(index);
      }
    });
  }

  if (searchResults.length > 0) {
    messageEl.textContent = '';
    scrollToResult(0);
  } else {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    if (searchTerm) {
      messageEl.textContent = '該当する名前が見つかりませんでした。';
    } else {
      messageEl.textContent = '';
    }
  }
  updateNavButtons();
}

// ページの読み込みが完了したら、イベントを設定
document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') performSearch();
  });
  searchInput.addEventListener('input', () => {
    // 入力中はナビゲーションを無効化
    document.getElementById('prev-button').disabled = true;
    document.getElementById('next-button').disabled = true;
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  });

  prevButton.addEventListener('click', () => {
    if (currentSearchIndex > 0) {
      currentSearchIndex--;
      scrollToResult(currentSearchIndex);
      updateNavButtons();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentSearchIndex < searchResults.length - 1) {
      currentSearchIndex++;
      scrollToResult(currentSearchIndex);
      updateNavButtons();
    }
  });
});