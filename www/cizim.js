/* Dolmuş Durağı – araç çizimleri (üstten görünüm, SVG)
   Her araç önce "yukarı bakan" hâliyle 100 birim genişlik × (100 × boy) uzunlukta çizilir,
   sonra baktığı yöne göre döndürülür. Hepsi kodla çizildiği için telif sorunu yoktur. */
(function (kok) {
  "use strict";

  // Klasik dolmuş boyaları: gövde, tavan, koyu ton
  // Klasik dolmuş boyaları: gövde, tavan, koyu ton. Renkler birbirinden kolay ayırt edilsin diye seçildi;
  // yolcular da kendi dolmuşlarının gövde rengini giyer.
  const BOYALAR = [
    { govde: "#F7C21B", tavan: "#FFF3C4", koyu: "#B98A00", ad: "sarı" },
    { govde: "#1FB5B0", tavan: "#F3EFE4", koyu: "#127C79", ad: "turkuaz" },
    { govde: "#E03A3E", tavan: "#F6E7C8", koyu: "#A3232A", ad: "kırmızı" },
    { govde: "#43A84F", tavan: "#F3EFE4", koyu: "#2C7A36", ad: "yeşil" },
    { govde: "#2F6FD6", tavan: "#F3EFE4", koyu: "#1E4E9E", ad: "mavi" },
    { govde: "#9B59D0", tavan: "#F3EFE4", koyu: "#6E3A9C", ad: "mor" },
  ];

  let TERS = false; // aşağı bakan araçta tabela yazısı ters görünmesin

  function dama(x, y1, y2, gen) {
    // Yan tarafta siyah-beyaz damalı şerit
    let s = "";
    const k = gen;
    let i = 0;
    for (let y = y1; y < y2 - 0.1; y += k, i++) {
      const h = Math.min(k, y2 - y);
      s += `<rect x="${x}" y="${y}" width="${k}" height="${h}" fill="${i % 2 ? "#fff" : "#111"}"/>`;
      s += `<rect x="${x + k}" y="${y}" width="${k}" height="${h}" fill="${i % 2 ? "#111" : "#fff"}"/>`;
    }
    return s;
  }

  // Klasik Amerikan dolmuş (boy 1 = minik, boy 2 = klasik)
  function otomobil(H, b, minik) {
    const x1 = minik ? 16 : 9, x2 = minik ? 84 : 91, W = x2 - x1;
    const y1 = 5, y2 = H - 5, L = y2 - y1;
    const f = (p) => y1 + L * p; // uzunluk boyunca oran
    const kaput = f(minik ? 0.26 : 0.27), on_cam = f(minik ? 0.40 : 0.38);
    const arka_cam = f(minik ? 0.70 : 0.70), bagaj = f(minik ? 0.80 : 0.78);
    const tx1 = x1 + W * 0.13, tx2 = x2 - W * 0.13;
    const damaGen = minik ? 3.2 : 3.6;
    return `
    <rect x="${x1 + 2}" y="${y1 + 4}" width="${W}" height="${L}" rx="18" fill="rgba(0,0,0,.35)"/>
    <rect x="${x1}" y="${y1}" width="${W}" height="${L}" rx="${minik ? 16 : 20}" fill="${b.govde}" stroke="${b.koyu}" stroke-width="2"/>
    <rect x="${x1 + 6}" y="${y1 - 1}" width="${W - 12}" height="5" rx="2.5" fill="#D9DDE3" stroke="#9aa1aa" stroke-width="1"/>
    <rect x="${x1 + 6}" y="${y2 - 4}" width="${W - 12}" height="5" rx="2.5" fill="#D9DDE3" stroke="#9aa1aa" stroke-width="1"/>
    <circle cx="${x1 + W * 0.2}" cy="${y1 + 9}" r="${minik ? 5 : 6}" fill="#FFF6C4" stroke="#8a7a3a" stroke-width="1.2"/>
    <circle cx="${x2 - W * 0.2}" cy="${y1 + 9}" r="${minik ? 5 : 6}" fill="#FFF6C4" stroke="#8a7a3a" stroke-width="1.2"/>
    <rect x="${x1 + W * 0.42}" y="${y1 + 5}" width="${W * 0.16}" height="5" rx="1.5" fill="#BFC5CC"/>
    <rect x="${x1 + 5}" y="${y2 - 12}" width="${minik ? 8 : 10}" height="6" rx="2" fill="#D3262E"/>
    <rect x="${x2 - 5 - (minik ? 8 : 10)}" y="${y2 - 12}" width="${minik ? 8 : 10}" height="6" rx="2" fill="#D3262E"/>
    <line x1="50" y1="${y1 + 14}" x2="50" y2="${kaput - 3}" stroke="${b.koyu}" stroke-width="1.6" opacity=".7"/>
    ${dama(x1 + 1.5, kaput, bagaj, damaGen)}${dama(x2 - 1.5 - 2 * damaGen, kaput, bagaj, damaGen)}
    <path d="M${x1 + W * 0.1} ${kaput} L${x2 - W * 0.1} ${kaput} L${tx2} ${on_cam} L${tx1} ${on_cam} Z" fill="#2E4053"/>
    <path d="M${x1 + W * 0.18} ${kaput + 2} L${x1 + W * 0.36} ${kaput + 2} L${x1 + W * 0.28} ${on_cam - 2} L${tx1 + 2} ${on_cam - 2} Z" fill="rgba(255,255,255,.35)"/>
    <rect x="${tx1}" y="${on_cam}" width="${tx2 - tx1}" height="${arka_cam - on_cam}" rx="7" fill="${b.tavan}" stroke="${b.koyu}" stroke-width="1"/>
    <path d="M${tx1} ${arka_cam} L${tx2} ${arka_cam} L${x2 - W * 0.1} ${bagaj} L${x1 + W * 0.1} ${bagaj} Z" fill="#2E4053"/>
    <ellipse cx="${x1 - 2}" cy="${kaput + 2}" rx="4" ry="3" fill="${b.koyu}"/>
    <ellipse cx="${x2 + 2}" cy="${kaput + 2}" rx="4" ry="3" fill="${b.koyu}"/>
    ${minik ? "" : tabela(50, (on_cam + arka_cam) / 2, tx2 - tx1)}
    ${yonOku(50, minik ? (on_cam + arka_cam) / 2 : on_cam + (arka_cam - on_cam) * 0.2, minik ? 9 : 8)}`;
  }

  // Minibüs (boy 3)
  function minibus(H, b) {
    const x1 = 9, x2 = 91, W = x2 - x1;
    const y1 = 5, y2 = H - 5, L = y2 - y1;
    const kaput = y1 + 16, on_cam = y1 + 36, arka = y2 - 14;
    let pencere = "";
    for (let y = on_cam + 8; y < arka - 14; y += 26) {
      pencere += `<rect x="${x1 + 3}" y="${y}" width="7" height="20" rx="2" fill="#2E4053"/>`;
      pencere += `<rect x="${x2 - 10}" y="${y}" width="7" height="20" rx="2" fill="#2E4053"/>`;
    }
    return `
    <rect x="${x1 + 2}" y="${y1 + 4}" width="${W}" height="${L}" rx="16" fill="rgba(0,0,0,.35)"/>
    <rect x="${x1}" y="${y1}" width="${W}" height="${L}" rx="16" fill="${b.govde}" stroke="${b.koyu}" stroke-width="2"/>
    <rect x="${x1 + 6}" y="${y1 - 1}" width="${W - 12}" height="5" rx="2.5" fill="#D9DDE3" stroke="#9aa1aa" stroke-width="1"/>
    <rect x="${x1 + 6}" y="${y2 - 4}" width="${W - 12}" height="5" rx="2.5" fill="#D9DDE3" stroke="#9aa1aa" stroke-width="1"/>
    <rect x="${x1 + 7}" y="${y1 + 6}" width="12" height="7" rx="2" fill="#FFF6C4" stroke="#8a7a3a" stroke-width="1"/>
    <rect x="${x2 - 19}" y="${y1 + 6}" width="12" height="7" rx="2" fill="#FFF6C4" stroke="#8a7a3a" stroke-width="1"/>
    <rect x="${x1 + 5}" y="${y2 - 12}" width="10" height="6" rx="2" fill="#D3262E"/>
    <rect x="${x2 - 15}" y="${y2 - 12}" width="10" height="6" rx="2" fill="#D3262E"/>
    <path d="M${x1 + 6} ${kaput} L${x2 - 6} ${kaput} L${x2 - 10} ${on_cam} L${x1 + 10} ${on_cam} Z" fill="#2E4053"/>
    <path d="M${x1 + 12} ${kaput + 2} L${x1 + 28} ${kaput + 2} L${x1 + 22} ${on_cam - 2} L${x1 + 13} ${on_cam - 2} Z" fill="rgba(255,255,255,.35)"/>
    <rect x="${x1 + 12}" y="${on_cam + 2}" width="${W - 24}" height="${arka - on_cam - 4}" rx="6" fill="${b.tavan}" stroke="${b.koyu}" stroke-width="1"/>
    <rect x="${x1 + 20}" y="${on_cam + 14}" width="${W - 40}" height="${Math.max(10, (arka - on_cam) * 0.12)}" rx="3" fill="rgba(0,0,0,.12)"/>
    ${pencere}
    <rect x="${x1 + 12}" y="${arka}" width="${W - 24}" height="7" rx="2" fill="#2E4053"/>
    <ellipse cx="${x1 - 2}" cy="${kaput + 4}" rx="4" ry="3" fill="${b.koyu}"/>
    <ellipse cx="${x2 + 2}" cy="${kaput + 4}" rx="4" ry="3" fill="${b.koyu}"/>
    
    ${tabela(50, on_cam + (arka - on_cam) * 0.55, W - 34)}
    ${yonOku(50, on_cam + 18 + (arka - on_cam) * 0.12, 10)}`;
  }

  function tabela(cx, cy, gen) {
    const ters = TERS ? ` transform="rotate(180 ${cx} ${cy})"` : "";
    const w = Math.min(gen - 6, 56), h = 14;
    return `<g${ters}><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" fill="#1B1B1B" stroke="#F7C21B" stroke-width="1.5"/>
      <text x="${cx}" y="${cy + 3.6}" font-size="10" font-weight="800" text-anchor="middle" fill="#F7C21B" font-family="Arial,sans-serif" letter-spacing=".5">DOLMU&#350;</text></g>`;
  }

  function yonOku(cx, cy, r) {
    return `<path d="M${cx} ${cy - r} L${cx + r} ${cy + r * 0.6} L${cx} ${cy + r * 0.15} L${cx - r} ${cy + r * 0.6} Z" fill="rgba(0,0,0,.55)" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/>`;
  }

  // Dışarıya açılan fonksiyon: boy (1-3), boya no, yön (U/D/L/R) → <svg> metni
  function aracSvg(boy, boyaNo, yon) {
    const b = BOYALAR[boyaNo % BOYALAR.length];
    const H = 100 * boy;
    TERS = yon === "D";
    const ic = boy >= 3 ? minibus(H, b) : otomobil(H, b, boy === 1);
    const yatay = yon === "L" || yon === "R";
    const W = yatay ? H : 100, Y = yatay ? 100 : H;
    const don = { U: "", D: `rotate(180 50 ${H / 2})`, R: `translate(${H} 0) rotate(90)`, L: `translate(0 100) rotate(-90)` }[yon];
    return `<svg viewBox="-4 -4 ${W + 8} ${Y + 8}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g transform="${don}">${ic}</g></svg>`;
  }

  // Yolcu: üstten bakınca baş + omuz, dolmuşunun renginde
  function yolcuSvg(boyaNo) {
    const b = BOYALAR[boyaNo % BOYALAR.length];
    return `<svg viewBox="0 0 40 52" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="48" rx="13" ry="3.5" fill="rgba(0,0,0,.3)"/>
      <path d="M6 46 Q6 26 20 26 Q34 26 34 46 Z" fill="${b.govde}" stroke="${b.koyu}" stroke-width="2"/>
      <circle cx="20" cy="15" r="10" fill="#F2C9A0" stroke="#B98A6A" stroke-width="1.5"/>
      <path d="M10 13 Q12 4 20 4 Q28 4 30 13 Q25 9 20 10 Q15 9 10 13 Z" fill="#4A3426"/>
    </svg>`;
  }

  const api = { aracSvg, yolcuSvg, BOYALAR };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else kok.Cizim = api;
})(this);
