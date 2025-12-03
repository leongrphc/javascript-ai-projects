const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const documents = [
  {
    id: "fb_takim",
    content: "fenerbahçe bir takımdır ve şampiyonluklar kazanmıştır.",
  },
  {
    id: "mokkoma_dil",
    content: "MOKKOMA bir dildir.",
  },
  {
    id: "rag_tanim",
    content:
      "RAG (Retrieval-Augmented Generation), bilgi getirme ve metin oluşturmayı birleştiren bir yaklaşımdır.",
  },
];
function scoreSimilarity(query, docContent) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const docWords = docContent.toLowerCase().split(/\s+/);
  let score = 0;
  for (const w of queryWords) {
    if (docWords.includes(w)) {
      score += 1;
    }
  }
  return score;
}
function retrieveRelevantDoc(query) {
  let bestDoc = null;
  let bestScore = -1;
  for (const doc of documents) {
    const s = scoreSimilarity(query, doc.content);
    if (s > bestScore) {
      bestScore = s;
      bestDoc = doc;
    }
  }
  return bestScore > 0 ? bestDoc : null;
}

async function generateResponse(soru) {
  const relevantDoc = retrieveRelevantDoc(soru);

  if (!relevantDoc) {
    return "Üzgünüm, sorunuzla eşleşen bir cevap bulamadım.";
  }

  const prompt = `Aşağıdaki belgeyi kullanarak soruyu yanıtla. Belge: ${relevantDoc.content}\n\nSoru: ${soru}\n\nCevap:`;

  // Ollama API endpoint
  const apiUrl = "http://localhost:11434/api/generate";
  const modelAdi = "gemma:7b";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelAdi,
        prompt: prompt,
        stream: false, // Yanıtın tek seferde gelmesi için
      }),
    });

    if (!response.ok) {
      console.log("\nAPI isteği başarısız oldu:", response.statusText);
    }
    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error("Ollama API Hata Oluştu:", error.message);
    console.log(
      "-> Ollama uygulamasının çalıştığından ve modelin ('gemma:7b') indirildiğinden emin olun."
    );
    return "Üzgünüm, yanıt oluşturulurken bir hata oluştu.";
  }
}

function askQuestion() {
  rl.question("Sorunuzu girin: ", async (soru) => {
    if (soru.toLowerCase() === "exit") {
      console.log("Programdan çıkılıyor.");
      rl.close();
      return;
    }

    console.log("...Yanıt hazırlanıyor...");
    const response = await generateResponse(soru);
    console.log("Cevap:", response);
    var tarih = new Date().toLocaleString("tr-TR");
    var log = `[Tarih: ${tarih}]\nSoru: ${soru}\nCevap: ${response}`;
    fs.appendFile("rag-log.txt", log + "\n", function (err) {
      if (err) {
        console.log("HATA " + err);
      }
    });
    askQuestion();
  });
}

console.log("Ollama (Gemma 7B) RAG Sistemi Başladı");
console.log("Çıkmak için 'exit' yazın.");
askQuestion();
