const tf = require("@tensorflow/tfjs");
const readline = require("readline");
const http = require("http");
const positiveSamples = [
  "I love this",
  "This is great",
  "Amazing product",
  "I am so happy",
  "Fantastic service",
  "I really liked it",
  "Best purchase ever",
  "Highly recommended",
  "Superb experience",
  "Very satisfied",
  "I like it",
];

const negativeSamples = [
  "I hate this",
  "This is terrible",
  "Awful product",
  "I am so unhappy",
  "Worst service",
  "I didn't like it",
  "Very disappointed",
  "Not recommended",
  "Horrible experience",
  "I regret buying",
];
let model;
let wordIndex;
let maxLen = 6;
function buildTokenizer(sentences, vocabSize = 5000) {
  const freq = {};
  for (var s of sentences) {
    var tokens = s
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);
    for (var t of tokens) {
      if (!t) continue;
      freq[t] = (freq[t] || 0) + 1;
    }
  }
  var sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  var wi = {};
  var idx = 1;
  for (var w of sorted) {
    if (idx >= vocabSize) break;
    wi[w] = idx++;
  }
  return wi;
}

function textsToSequences(texts, wi, maxLen) {
  return texts.map((s) => {
    var tokens = s
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);
    var seq = tokens.map((t) => wi[t] || 0);
    if (seq.length > maxLen) {
      return seq.slice(0, maxLen);
    }
    return Array(maxLen - seq.length)
      .fill(0)
      .concat(seq);
  });
}

function predictSingle(text) {
  if (!model) return 0;
  const seq = textsToSequences([text], wordIndex, maxLen);
  const input = tf.tensor2d(seq, [1, maxLen], "int32");
  const pred = model.predict(input);
  const prob = pred.dataSync()[0];
  return prob;
}
async function setupAndTrain() {
  console.log("\n--- Sistem Hazırlanıyor ve Model Eğitiliyor... ---");
  const allTexts = positiveSamples.concat(negativeSamples);
  const labels = positiveSamples
    .map(() => 1)
    .concat(negativeSamples.map(() => 0));
  wordIndex = buildTokenizer(allTexts, 5000);
  const VOCAB_SIZE = Object.keys(wordIndex).length + 1;
  const EMBED_DIM = 16;

  // Veriyi tensora çevir
  const sequences = textsToSequences(allTexts, wordIndex, maxLen);
  const xs = tf.tensor2d(sequences, [sequences.length, maxLen], "int32");
  const ys = tf.tensor2d(labels, [labels.length, 1], "float32");

  // Modeli oluştur
  const newModel = tf.sequential();
  newModel.add(
    tf.layers.embedding({
      inputDim: VOCAB_SIZE,
      outputDim: EMBED_DIM,
      inputLength: maxLen,
    })
  );
  newModel.add(tf.layers.globalAveragePooling1d());
  newModel.add(tf.layers.dense({ units: 16, activation: "relu" }));
  newModel.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  newModel.compile({
    optimizer: tf.train.adam(0.01),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });
  await newModel.fit(xs, ys, {
    epochs: 25,
    batchSize: 4,
    shuffle: true,
    verbose: 0,
  });
  if (model) model.dispose();
  model = newModel;
  xs.dispose();
  ys.dispose();
  console.log("Model eğitimi tamamlandı!");
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showMenu() {
  console.log("\n--- ANA MENÜ ---");
  console.log("1. Modeli Kullan (Tahmin Et)");
  console.log("2. Modeli Eğit (Yeni Veri Ekle)");
  console.log("3. Çıkış");

  rl.question("Seçiminiz: ", async (choice) => {
    if (choice === "1") {
      predict();
    } else if (choice === "2") {
      train();
    } else if (choice === "3") {
      console.log("Çıkış yapılıyor...");
      rl.close();
      process.exit(0);
    } else {
      console.log("Geçersiz seçim!");
      showMenu();
    }
  });
}

function predict() {
  rl.question("Analiz edilecek cümleyi girin: ", (text) => {
    const prob = predictSingle(text);
    const label = prob > 0.5 ? "Olumlu" : "Olumsuz";
    console.log(`Sonuç: ${label} (Olasılık: %${(prob * 100).toFixed(2)})`);
    showMenu();
  });
}

function train() {
  rl.question("Eklenecek cümleyi girin: ", (text) => {
    rl.question("Bu cümle Olumlu mu? (e/h): ", async (ans) => {
      if (ans.toLowerCase() === "e") {
        positiveSamples.push(text);
        console.log("Veri 'Olumlu' olarak eklendi.");
      } else {
        negativeSamples.push(text);
        console.log("Veri 'Olumsuz' olarak eklendi.");
      }
      await setupAndTrain();
      showMenu();
    });
  });
}
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/predict") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const json = JSON.parse(body);
        const prob = predictSingle(json.text);
        const label = prob > 0.5 ? "Olumlu" : "Olumsuz";
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            text: json.text,
            probability: prob,
            sentiment: label,
          })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }
  // ödev yeni endpoint
  else if (req.method === "POST" && req.url === "/train") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const json = JSON.parse(body);
        const yeniVeri = json.text;
        const label = json.label; // "positive" veya "negative"

        // Veriyi ilgili diziye ekleme
        if (label === "positive") {
          positiveSamples.push(yeniVeri);
        } else if (label === "negative") {
          negativeSamples.push(yeniVeri);
        } else {
          throw new Error("Label sadece 'positive' veya 'negative' olabilir.");
        }

        console.log(`\nYeni veri geldi: "${yeniVeri}". Model güncelleniyor...`);
        await setupAndTrain();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Veri eklendi ve model eğitildi.",
            cümle: yeniVeri,
            label: label,
          })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Endpoint bulunamadı" }));
  }
});

async function start() {
  server.listen(3000, () => {
    console.log("Server http://localhost:3000 adresinde çalışıyor.");
  });
  await setupAndTrain();
  showMenu();
}

start();
