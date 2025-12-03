const express = require("express");
const cors = require("cors");
const app = express();
const port = 2222;

// CORS ve JSON işleyici middleware'ler
app.use(cors());
app.use(express.json());

// Basit veri deposu (sadece örnek için, bu rotada kullanılmayacak)
let users = [
  { id: 1, name: "Ali", email: "ali@example.com" },
  { id: 2, name: "Veli", email: "veli@example.com" },
];

// Basit bir GET isteği
app.get("/", (req, res) => {
  res.send("Merhaba, bu bir GET isteği yanıtı!");
});

// Veri almak için GET isteği
app.get("/api/users", (req, res) => {
  res.json(users);
});

// YORUM VERİLERİNİ KABUL ETMEK İÇİN GÜNCELLENMİŞ POST ROTASI
app.post("/api/users", (req, res) => {
  // İstemciden gelen "yorumlar" dizisini çek
  const yorumlar = req.body.yorumlar;

  // Veri Doğrulama: Yorumlar dizisi var mı ve geçerli bir dizi mi?
  if (!yorumlar || !Array.isArray(yorumlar) || yorumlar.length === 0) {
    // İstemcinin hatalı veri gönderdiğini belirtmek için 400 Bad Request
    return res.status(400).json({
      message:
        "Hata: Geçerli bir 'yorumlar' dizisi zorunludur. Lütfen [{id: '...', yorum: '...'}] formatında gönderin.",
    });
  }

  // Yorumları işleme kısmı (Burada yapay zeka servisine gönderebilir veya DB'ye kaydedebilirsiniz)
  console.log(`\n--- YENİ YORUMLAR ALINDI (${yorumlar.length} adet) ---`);
  yorumlar.forEach((yorumObjesi) => {
    // Kontrol amaçlı konsola yazdırma
    console.log(
      `ID: ${yorumObjesi.id}, Yorum: ${yorumObjesi.yorum.substring(0, 50)}...`
    );
  });
  console.log("--------------------------------------------------\n");

  // Başarılı yanıt gönder
  res.status(200).json({
    message: `${yorumlar.length} adet yorum başarıyla alındı ve işlenmeye hazır.`,
    alinanYorumSayisi: yorumlar.length,
    // İsteğe bağlı olarak ilk yorumun içeriğini geri gönderebiliriz
    ilkYorum: yorumlar[0],
  });
});

app.listen(port, () => {
  console.log(`API çalışıyor: http://localhost:${port}`);
});
