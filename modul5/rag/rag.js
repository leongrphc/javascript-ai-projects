/*
    RAG (Retrieval-Augmented Generation)
    Rag'nin temel amacı yapay zeka modellerinin ürettiği yanıtların doğrulunu
    güvenilirliği ve güncelliğini artırmaktır.
    Modellerin sağladığı bilgiler:
    - Güncel olmayabilir
    - Özel olmayabilir => Spesifik konular, şirket içi dökümanlar, özel bilgiler
        eksikliği
    - Halüsinasyon içerebilir

    RAG Aşamaları:
    1. Bilgi Toplama (Retrieval):
        - İlgili ve güvenilir bilgi kaynaklarından veri toplama
        - Veri tabanları, dokümanlar, web sayfaları vb.
    2. Üretim (Generation):
        - Toplanan bilgiler ışığında yanıt üretme
        - Dil modelleri (GPT-4, BERT vb.) kullanılarak
    3. Entegrasyon:
        - Toplanan bilgiler ile üretilen yanıtları birleştirme
        - Yanıtların doğruluğunu ve güvenilirliğini artırma

    RAG Mimarisi:
    - Indexing: Bilgi kaynaklarının indekslenmesi
    - Veri toplama ve Parçalama (Chunking)
        Kurumsal belgeleriniz okunur ve anlam bütünlüğü korunarak küçük parçalara ayrılır.
    - Vektörleştirme (Embedding)
    Her bir metin parçası (chunk) sayısal vektörlere dönüştürülür.
    Bu vektörler, metinlerin anlamsal benzerliklerine göre düzenlenir.
    - İndeksleme ve Depolama
    Bu vektörler özel olarak tasarlanmış veri tabanlarında depolanır.

    RAG sistem adımları:
    - Sorgu Vektörleştirme
     İşlem = Kullanıcının sorusunun sayısal temsile çevrilmesi
     Kullanıcının soru da aynı embedding modelinden geçirilir.
     - Retrieval
     İşlem = En alakalı belgelerin bulunması
        Sorgu vektörü ile depolanan vektörler karşılaştırılır.En yüksek
        benzerlik skoruna sahip 3-10 adet belge (chunk) seçilir.
    - Bağlam Zenginleştirme
        İşlem = Sorunun bulunan bilgi ile birleştirilmesi
        Orijinal kullanıcı sorusu, bulunan belgelerle (chunk) zenginleştirilir.
    -Üretme
        İşlem = Yanıtın oluşturulması
        Dil modeli sadece kendi genel bilgisine değil, aynı zamanda güncel ve 
        harici bağlama dayanarak yanıtı oluşturur. Yanıt genelliikle hangi kaynaklardan
        bilgi alındığını gösteren atıflarla birlikte gelir.
    

    Bir insan kaynakları uzmanı olduğunu düşün. 
    

*/
// dosya okuma yazma
const fs = require("fs");
// kullanıcıdan veri almak için
const readline = require("readline");
// terminal komutlarını node.js üzerinden çalıştırmak için
const { execSync } = require("child_process");
// Basit bir Veri Seti
const documents = [
  {
    id: 1,
    text: "Bugünün tarihi 23 Kasım 2025.",
  },
  {
    id: 2,
    text: "23 Kasım 2025 tarihinde İstanbul'da hava sıcak ve gökyüzü açık.",
  },
  {
    id: 3,
    text: "Fenerbahçe, Türkiyenin En büyük Futbol kulüplerinden biridir.",
  },
  {
    id: 4,
    text: "İstanbul, Türkiye'nin en kalabalık şehridir.",
  },
];
// embedding yerine basiit bir skorlayıcı
function scoreSimilarity(query, docText) {
  // Soru kelimelerini küçük harfe çevir ve boşluklardan ayır
  const queryWords = query.toLowerCase().split(/\s+/);
  // Belge kelimelerini küçük harfe çevir ve boşluklardan ayır
  const docWords = docText.toLowerCase().split(/\s+/);
  var score = 0;
  for (const w of queryWords) {
    // Eğer belge kelimeleri arasında soru kelimesi varsa skoru artır
    if (docWords.includes(w)) {
      score += 1;
    }
  }
  return score;
}
// en alakalı belgeleri getir
function retrieveRelevantDoc(query) {
  // en iyi belgeyi saklamak için
  var bestDoc = null;
  // en iyi skoru saklamak için
  var bestScore = -1;
  for (const doc of documents) {
    // skoru hesapla
    const s = scoreSimilarity(query, doc.text);
    // eğer bu skor en iyiyse, en iyi belgeyi ve skoru güncelle
    if (s > bestScore) {
      bestScore = s;
      bestDoc = doc;
    }
  }
  // en iyi belgeyi döndür
  return bestDoc;
}
// ollama ile cevap al
function askOllama(model, prompt) {
  try {
    // node js ile komut satırında komut çalıştır
    const response = execSync(`ollama run ${model}`, {
      input: prompt, // prompt'u komuta girdi olarak ver
      encoding: "utf-8", // çıktı kodlaması
    });
    return response.trim(); // yanıtı döndür
  } catch (error) {
    return "Ollama API Hatası: " + error.message;
  }
}
// kullanıcı arayüzü
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
console.log("Node.JS Local RAG - Sorunuzu Yazınız:");
rl.setPrompt("Soru : "); // terminalde görünen prompt
rl.prompt(); // prompt başlat
// soru yazıncca rag çalışsın
rl.on("line", (question) => {
  // kullanıcıdan enter basıldığında soru al
  const doc = retrieveRelevantDoc(question); // en alakalı belgeyi getir
  const finalPrompt = `
     Sen bir RAG sistemisin.
     Aşağıdaki belgeyi kullanarak soruyu cevapla:
     Belge: ${doc.text}
      Soru: ${question}
      Cevap:
     `;
  const answer = askOllama("llama3.1", finalPrompt); // ollama ile cevap al
  console.log("Cevap:", answer); // cevabı yazdır
  rl.prompt(); // tekrar soru sor
});
