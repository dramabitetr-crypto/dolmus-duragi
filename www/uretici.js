/* Dolmuş Durağı – bölüm üretici
   Her bölüm, bölüm numarasından türetilen sabit bir tohumla (seed) üretilir:
   aynı bölüm her açılışta aynı çıkar. Üretilen her bölümün çözülebilir olduğu
   "açgözlü çözücü" ile kontrol edilir: önü açık araçları çıkarmak başka hiçbir
   aracın önünü kapatmadığı için, açgözlü çözücü takılıyorsa bölüm gerçekten çözümsüzdür. */
(function (kok) {
  "use strict";

  const YON = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
  const YONLER = ["U", "D", "L", "R"];
  const RENKLER = 6;

  function rastgele(tohum) { // mulberry32
    let a = tohum >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function boyutlar(n) {
    if (n <= 1) return { sat: 4, sut: 4, dolu: 0.6, derin: 2 };
    if (n <= 2) return { sat: 5, sut: 4, dolu: 0.65, derin: 2 };
    if (n <= 4) return { sat: 5, sut: 5, dolu: 0.7, derin: 3 };
    if (n <= 8) return { sat: 6, sut: 5, dolu: 0.72, derin: 3 };
    if (n <= 15) return { sat: 7, sut: 6, dolu: 0.75, derin: 4 };
    if (n <= 30) return { sat: 8, sut: 6, dolu: 0.78, derin: 5 };
    if (n <= 60) return { sat: 9, sut: 7, dolu: 0.8, derin: 6 };
    return { sat: 10, sut: 7, dolu: 0.82, derin: 7 };
  }

  // Aracın baş hücresinden kenara kadar olan yol
  function yol(arac, sat, sut) {
    const [dr, dc] = YON[arac.yon];
    let [r, c] = arac.hucreler[0];
    const y = [];
    r += dr; c += dc;
    while (r >= 0 && r < sat && c >= 0 && c < sut) { y.push([r, c]); r += dr; c += dc; }
    return y;
  }

  function izgara(araclar, sat, sut) {
    const g = Array.from({ length: sat }, () => new Array(sut).fill(-1));
    araclar.forEach((a) => a.hucreler.forEach(([r, c]) => (g[r][c] = a.id)));
    return g;
  }

  // Önü açık mı? Açıksa -1, kapalıysa [engel aracın id'si, engele kadar boş hücre sayısı]
  function engel(arac, araclar, sat, sut, g) {
    g = g || izgara(araclar, sat, sut);
    const y = yol(arac, sat, sut);
    for (let i = 0; i < y.length; i++) {
      const v = g[y[i][0]][y[i][1]];
      if (v !== -1 && v !== arac.id) return { id: v, mesafe: i };
    }
    return null;
  }

  // Açgözlü çözücü: tur sayısını (derinlik) ya da çözümsüzse -1 döndürür
  function coz(araclar, sat, sut) {
    let kalan = araclar.slice();
    let tur = 0;
    while (kalan.length) {
      const g = izgara(kalan, sat, sut);
      const serbest = kalan.filter((a) => !engel(a, kalan, sat, sut, g));
      if (!serbest.length) return { derinlik: -1, takilan: kalan };
      const ids = new Set(serbest.map((a) => a.id));
      kalan = kalan.filter((a) => !ids.has(a.id));
      tur++;
    }
    return { derinlik: tur, takilan: [] };
  }

  function dene(n, tohum) {
    const b = boyutlar(n);
    const rnd = rastgele(tohum);
    const g = Array.from({ length: b.sat }, () => new Array(b.sut).fill(false));
    let araclar = [];
    let dolu = 0, id = 0;
    const hedef = Math.floor(b.sat * b.sut * b.dolu);
    for (let deneme = 0; deneme < 600 && dolu < hedef; deneme++) {
      const yon = YONLER[Math.floor(rnd() * 4)];
      const x = rnd();
      const boy = x < 0.18 ? 1 : x < 0.78 ? 2 : 3;
      const r0 = Math.floor(rnd() * b.sat), c0 = Math.floor(rnd() * b.sut);
      const [dr, dc] = YON[yon];
      const hucreler = [];
      let uygun = true;
      for (let k = 0; k < boy; k++) {
        const r = r0 - dr * k, c = c0 - dc * k; // baş önde, gövde arkada
        if (r < 0 || r >= b.sat || c < 0 || c >= b.sut || g[r][c]) { uygun = false; break; }
        hucreler.push([r, c]);
      }
      if (!uygun) continue;
      const arac = { id: id++, yon, hucreler, renk: Math.floor(rnd() * RENKLER) };
      // Doğrudan karşı karşıya bakan iki aracı baştan engelle (kesin kilit)
      const gecici = araclar.concat([arac]);
      const e = engel(arac, gecici, b.sat, b.sut);
      if (e) {
        const karsi = gecici.find((a) => a.id === e.id);
        const e2 = engel(karsi, gecici, b.sat, b.sut);
        if (e2 && e2.id === arac.id) continue;
      }
      hucreler.forEach(([r, c]) => (g[r][c] = true));
      araclar.push(arac);
      dolu += boy;
    }
    // Çözümsüzse, takılan araçlardan rastgele çıkararak çözülebilir hale getir
    let s = coz(araclar, b.sat, b.sut);
    while (s.derinlik === -1) {
      const at = s.takilan[Math.floor(rnd() * s.takilan.length)];
      araclar = araclar.filter((a) => a.id !== at.id);
      s = coz(araclar, b.sat, b.sut);
    }
    araclar.forEach((a, i) => (a.id = i));
    return { sat: b.sat, sut: b.sut, araclar, derinlik: s.derinlik, hedefDerinlik: b.derin };
  }

  function bolum(n) {
    let en = null;
    for (let k = 0; k < 40; k++) {
      const d = dene(n, n * 7919 + k * 104729 + 17);
      const puan = Math.min(d.derinlik, d.hedefDerinlik) * 1000 + d.araclar.length;
      if (!en || puan > en.puan) en = Object.assign(d, { puan });
      if (d.derinlik >= d.hedefDerinlik && d.araclar.length >= 3) break;
    }
    return en;
  }

  const api = { bolum, coz, engel, yol, boyutlar, YON };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else kok.Uretici = api;
})(this);
