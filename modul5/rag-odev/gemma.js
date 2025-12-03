const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function sor(prompt) {
  const model = "gemma:7b";
  const url = "http://localhost:11434/api/generate";
  console.log("Gemma API'ye istek gönderiliyor...");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false, // yanıt tek parça gelir
      }),
    });
    const yanit = await response.json();
    console.log("Gemma'nın yanıtı:", yanit.response);
    var tarih = new Date().toLocaleString("tr-TR");
    var log = `[Tarih: ${tarih}]\nSoru: ${prompt}\nCevap: ${yanit.response}`;
    fs.appendFile("original-log.txt", log + "\n", function (err) {
      if (err) {
        console.log("HATA " + err);
      }
    });
  } catch (error) {
    console.error("Gemma API'ye istek gönderilirken hata oluştu:", error);
    console.log(
      "-> Ollama uygulamasının çalıştığından ve modelin (gemma:7b) indirildiğinden emin olun."
    );
  }
}
function soruSor() {
  rl.question("Soru: ", (soru) => {
    sor(soru).then(() => {
      soruSor(); // tekrar soru sor
    });
  });
}
soruSor();
