let currentRankingData = []; // 現在のランキングデータを保持するための変数
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyeVCav3Vt8qLtLUpLwDYnpdLfGiM-MoQlOHtvIAxMtFEQfKet3uEW-MCip6nfT5pVVXg/exec';

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

    currentRankingData = data; // ★変更点: 取得したデータを変数に保存

    const podiumArea = document.getElementById('podium-area');
    const rankingBody = document.getElementById('ranking-body');
    podiumArea.innerHTML = '';
    rankingBody.innerHTML = '';

    if (Array.isArray(data)) {
      let rank = 1;
      data.forEach(item => {
        if (item.name && String(item.name).trim() !== '') {
          if (rank <= 3) {
            const rankSuffix = rank === 1 ? 'st' : (rank === 2 ? 'nd' : 'rd');
            const podiumItem = document.createElement('div');
            podiumItem.id = `rank-${rank}`; // ★変更点: IDを付与
            podiumItem.classList.add('podium-item', `podium-${rank}${rankSuffix}`);

            const classHtml = item.class && String(item.class).trim() !== '' ? `<div class="podium-class">${item.class}</div>` : '';
            podiumItem.innerHTML = `
              <img src="${rankImages[rank]}" alt="${rank}位">
              <div class="podium-text-content">
                ${classHtml}
                <div class="podium-name">${item.name}</div>
                <div class="podium-score">${item.score}点</div>
              </div>
            `;
            podiumArea.appendChild(podiumItem);
          } else {
            const row = document.createElement('tr');
            row.id = `rank-${rank}`; // ★変更点: IDを付与

            const classText = item.class && String(item.class).trim() !== '' ? item.class : '';
            row.innerHTML = `<td>${rank}位</td><td>${classText}</td><td>${item.name}</td><td>${item.score}点</td>`;
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

// --- 検索機能 ---

// 検索を実行する関数
function performSearch() {
  const searchInput = document.getElementById('search-input');
  const messageEl = document.getElementById('search-result-message');
  const searchTerm = searchInput.value.trim().toLowerCase(); // 入力値を小文字に変換

  if (!searchTerm) return; // 入力が空なら何もしない

  // 既存のハイライトを全て削除
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

  // 保存しておいたランキングデータから名前を検索（大文字・小文字を区別しない）
  const foundIndex = currentRankingData.findIndex(item =>
    item.name && String(item.name).toLowerCase().includes(searchTerm)
  );

  if (foundIndex !== -1) {
    // 見つかった場合
    const rank = foundIndex + 1;
    const targetElement = document.getElementById(`rank-${rank}`);

    if (targetElement) {
      // 該当要素までスムーズスクロール（要素が画面中央に来るように）
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // ハイライト用のクラスを追加
      targetElement.classList.add('highlight');
      messageEl.textContent = ''; // エラーメッセージを消す
    }
  } else {
    // 見つからなかった場合
    messageEl.textContent = '該当する名前が見つかりませんでした。';
  }
}

// ページの読み込みが完了したら、検索ボタンなどのイベントを設定
document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');

  // 検索ボタンがクリックされたら実行
  searchButton.addEventListener('click', performSearch);

  // 入力欄でEnterキーが押されたら実行
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  });
});