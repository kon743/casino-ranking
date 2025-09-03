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

    const podiumArea = document.getElementById('podium-area');
    const rankingBody = document.getElementById('ranking-body');
    podiumArea.innerHTML = '';
    rankingBody.innerHTML = '';
    // 【JavaScript最終確認コード】
    // if (Array.isArray(data)) { ... } ブロックを削除し、以下に差し替え

    if (Array.isArray(data)) {
      let rank = 1;
      data.forEach(item => {
        // 名前(item.name)さえ存在すれば、処理を続ける
        if (item.name && String(item.name).trim() !== '') {

          if (rank <= 3) {
            // --- 表彰台の処理 ---
            const rankSuffix = rank === 1 ? 'st' : (rank === 2 ? 'nd' : 'rd');
            const podiumItem = document.createElement('div');
            podiumItem.classList.add('podium-item', `podium-${rank}${rankSuffix}`);

            // classの欄に「保護者」などが入っていても、空欄でも正しく処理
            const classHtml = item.class && String(item.class).trim() !== ''
              ? `<div class="podium-class">${item.class}</div>`
              : '';

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
            // --- テーブルの処理 ---
            const row = document.createElement('tr');

            // ★★★ 変更点: クラス用のセルと名前用のセルを別々に生成 ★★★

            // クラスの欄が空欄や空白の場合は、セルの中身を空にする
            const classText = item.class && String(item.class).trim() !== '' ? item.class : '';

            // 4つのセルを持つ行を生成
            row.innerHTML = `
              <td>${rank}位</td>
              <td>${classText}</td>
              <td>${item.name}</td>
              <td>${item.score}点</td>
            `;
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