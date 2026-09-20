// 日記ページのもくじを、日記の見出しと日付から自動で作るスクリプト
// 使い方：archive.html の </body> の直前に <script src="toc.js"></script> を1行入れるだけ
(function () {
  var main = document.querySelector('.archive');
  var articles = document.querySelectorAll('article.diary');
  if (!main || !articles.length) return;

  // ---------- 見た目（サイトの色に合わせてあるよ） ----------
  var style = document.createElement('style');
  style.textContent = [
    'html { scroll-behavior: smooth; }',
    '@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }',
    'article.diary { scroll-margin-top: 20px; }',
    '.toc { background: rgba(255, 253, 248, 0.7); border-top: 1px solid #ded4c5; border-bottom: 1px solid #ded4c5; padding: 26px 35px; margin-bottom: 40px; }',
    '.toc-title { font-size: 1.05rem; font-weight: normal; text-align: center; letter-spacing: 0.12em; margin: 0 0 16px; color: #766556; }',
    '.toc details { margin: 0 0 10px; }',
    '.toc summary { cursor: pointer; font-size: 0.9rem; color: #766556; letter-spacing: 0.06em; padding: 4px 0; }',
    '.toc ul { list-style: none; margin: 4px 0 0; padding: 0; }',
    '.toc li { margin: 0; }',
    '.toc a { display: flex; gap: 14px; padding: 5px 0; color: #6d5c4d; text-decoration: none; font-size: 0.9rem; }',
    '.toc a:hover .toc-name { text-decoration: underline; }',
    '.toc-date { flex: none; font-size: 0.78rem; color: #9a8d7f; }',
    '.toc-back { text-align: right; margin-top: 24px; font-size: 0.78rem; }',
    '.toc-back a { color: #897d70; text-decoration: none; }',
    '.toc-back a:hover { color: #66594d; text-decoration: underline; }',
    '@media (max-width: 600px) { .toc { padding: 22px 15px; } .toc a { font-size: 0.88rem; } }'
  ].join('\n');
  document.head.appendChild(style);

  // ---------- 日記の情報を集める ----------
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var used = {};
  var groups = [];
  var byKey = {};

  Array.prototype.forEach.call(articles, function (article, index) {
    var h2 = article.querySelector('h2');
    var dateEl = article.querySelector('.date');
    var name = h2 ? h2.textContent.trim() : '（タイトルなし）';
    var dateText = dateEl ? dateEl.textContent.trim() : '';
    var m = dateText.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);

    // ジャンプ先の目印（id）をつける
    var id = article.id;
    if (!id) {
      id = m ? 'diary-' + m[1] + pad(+m[2]) + pad(+m[3]) : 'diary-' + (index + 1);
      var base = id;
      var n = 2;
      while (used[id] || document.getElementById(id)) {
        id = base + '-' + n;
        n++;
      }
      article.id = id;
    }
    used[id] = true;

    // 月ごとにグループ分け
    var key = m ? m[1] + '-' + pad(+m[2]) : 'other';
    var label = m ? m[1] + '年' + (+m[2]) + '月' : 'そのほか';
    var shortDate = m ? pad(+m[2]) + '.' + pad(+m[3]) : '';
    if (!byKey[key]) {
      byKey[key] = { label: label, items: [] };
      groups.push(byKey[key]);
    }
    byKey[key].items.push({ id: id, name: name, date: shortDate });

    // 日記の最後に「もくじへ戻る」を付ける
    var back = document.createElement('div');
    back.className = 'toc-back';
    back.innerHTML = '<a href="#toc">↑ もくじへ</a>';
    article.appendChild(back);
  });

  // ---------- もくじを組み立てる ----------
  var nav = document.createElement('nav');
  nav.className = 'toc';
  nav.id = 'toc';
  nav.setAttribute('aria-label', 'もくじ');

  var heading = document.createElement('h2');
  heading.className = 'toc-title';
  heading.textContent = 'もくじ';
  nav.appendChild(heading);

  groups.forEach(function (g, gi) {
    var details = document.createElement('details');
    if (gi === 0) details.open = true; // いちばん新しい月だけ開いておく

    var summary = document.createElement('summary');
    summary.textContent = g.label + '（' + g.items.length + '）';
    details.appendChild(summary);

    var ul = document.createElement('ul');
    g.items.forEach(function (it) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + it.id;
      if (it.date) {
        var d = document.createElement('span');
        d.className = 'toc-date';
        d.textContent = it.date;
        a.appendChild(d);
      }
      var t = document.createElement('span');
      t.className = 'toc-name';
      t.textContent = it.name;
      a.appendChild(t);
      li.appendChild(a);
      ul.appendChild(li);
    });
    details.appendChild(ul);
    nav.appendChild(details);
  });

  // ---------- ヘッダーのすぐ下に置く ----------
  var header = main.querySelector('header');
  if (header && header.parentNode === main) {
    main.insertBefore(nav, header.nextSibling);
  } else {
    main.insertBefore(nav, main.firstChild);
  }
})();