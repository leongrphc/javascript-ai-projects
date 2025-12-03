var readline = require("readline"); //kullanıcıdan veri almak için
var fs = require("fs"); //dosya işlemleri için
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
console.log("Hesaplama Modülü");
console.log("Uyarı : Verileriniz 'veriler.txt' dosyasına kaydedilecektir.");
console.log("Uygulamadan çıkış yapmak için q tuşuna basın.");
const soruSor = () => {
  rl.question("Lütfen bir sayı giriniz: ", function (sayi) {
    console.log("Girilen Sayı: " + sayi);
    if (sayi.toLowerCase() === "q" || sayi.toLocaleLowerCase() === "exit") {
      console.log("Uygulamadan çıkılıyor...");
      rl.close();
      return;
    }
    var sayi = parseFloat(sayi);
    if (isNaN(sayi)) {
      console.log("Geçersiz giriş! Lütfen bir sayı giriniz.");
      // hata durumunda tekrar soru sor
      soruSor();
      return;
    } else {
      var sonuc = sayi * sayi;
      var durum = sayi % 2 === 0 ? "Çift" : "Tek";
      console.log("Sayı: " + sayi + ", Kare: " + sonuc + ", Durum: " + durum);
      var tarih = new Date().toLocaleString("tr-TR");
      var log = `[${tarih}] Girdi: ${sayi}, Kare: ${sonuc}, Durum: ${durum}\n`;
      // Verileri dosyaya ekleme işlemi
      fs.appendFile("veriler.txt", log, function (err) {
        if (err) {
          console.log("HATA " + err);
        }
        soruSor();
      });
    }
  });
};

soruSor();
