/*
    Doğrusal Regresyon
    Temel Mantık -> İlişkiyi bulmak
    Bağımsız Değişken -> Girdi (evin metrekaresi)
    Bağımlı Değişken -> Çıktı (evin fiyatı)

    Matematiksel Formül
    y = wx + b
    y(tahmin) = w(agirlik) * x(girdi) + b(sabit)
    Y = Ulaşılmak istenen değer
    X = Elimizdeki veri
    W = Girişin sonucu ne kadar etkilediği
      örnek w yüksekse metrekare fiyatı yüksek olur
      eğer w negatifse x arttıkça y azalır (evin yaşı arttıkça fiyatı düşer gibi)
    
    B(sapma/bias)= x sıfır bile olsa sonucun kaçtan başladığı
    Örnek: Ev sıfır metrekare olamaz ama matematiksel olarak 0 girdiğinde bile bir fiyat çıkması gerekebilir. 
    
    Basit Doğrusal Regresyon
    Tek bir girdi (x) vardır

    Çoklu Doğrusal Regresyon
    Birden fazla girdi vardır
    y = w1x1 + w2x2 + w3x3 + b
    y = w1(metrekare) + w2(oda sayısı) + w3(yaş) + b

    Nasıl öğrenir? (Gradient Descent)
    - Rastgele başlar : Model önce rastgele bir doğru çizer
    - Hatayı Ölçer : Çizdiği doğru ile gerçek veriler arasındaki farkı ölçer
    - eğimi ve yeri değiştir(türev): matematiksel türev hatayı azaltmak için eğimi ve yeri nasıl değiştirmesi gerektiğini söyler
    -tekrarla: bu işlem binlerce kez tekrarlanır çizgi yavaş yavaş gerçek verilere yaklaşır

*/
// node js ile bir bağımlılık olmadan basit bir regresyon modeli
// formül = 3x-1

const egitimVerisi = [
  { x: 1, y: 2 }, // 3*1 -1 = 2
  { x: 2, y: 5 }, // 3*2 -1 = 5
  { x: 3, y: 8 }, // 3*3 -1 = 8
  { x: 4, y: 11 }, // 3*4 -1 = 11
  { x: 5, y: 14 }, // 3*5 -1 = 14
];
// model ağırlıkları
var w = Math.random(); // weight(ağırlık)
var b = Math.random(); // bias(sapma)
// hiperparametreler (ayarlar)
const ogrenmeHizi = 0.01; // learning rate
const epochSayisi = 1000; // epoch sayısı
//tahmin fonksiyonu
function tahminEt(x) {
  return x * w + b;
}
console.log("--- EĞİTİME BAŞLANIYOR ---");
console.log(
  `Başlangıç Ağırlık (w): ${w.toFixed(4)}, Başlangıç Sapma (b): ${b.toFixed(4)}`
);
for (var i = 0; i < epochSayisi; i++) {
  var toplamHata = 0;
  var w_egimi = 0;
  var b_egimi = 0;
  var N = egitimVerisi.length;
  // tüm eğitim verisi üzerinde dön
  for (var j = 0; j < N; j++) {
    var x = egitimVerisi[j].x;
    var y_gercek = egitimVerisi[j].y;
    var y_tahmin = tahminEt(x);
    var hata = y_tahmin - y_gercek;
    toplamHata += hata * hata; // hata kareleri toplamı
    // türevleri hesapla
    w_egimi += (2 / N) * hata * x;
    b_egimi += (2 / N) * hata;
  }
  // ağırlıkları güncelle
  w -= ogrenmeHizi * w_egimi;
  b -= ogrenmeHizi * b_egimi;

  w = w - ogrenmeHizi * w_egimi;
  b = b - ogrenmeHizi * b_egimi;
  if (i % 100 === 0) {
    console.log(
      `Epoch ${i}: Hata: ${(toplamHata / N).toFixed(4)}, w: ${w.toFixed(
        4
      )}, b: ${b.toFixed(4)}`
    );
  }
}
console.log("--- EĞİTİM TAMAMLANDI ---");
console.log("Gerçek Formül: 3x-1");
console.log(`Model Formülü: ${w.toFixed(3)}x + ${b.toFixed(3)}`);
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("X değerini giriniz: ", (x) => {
  var tahmin = tahminEt(parseFloat(x));
  console.log(`Model tahmini: ${tahmin.toFixed(3)}`);
  rl.close();
});
