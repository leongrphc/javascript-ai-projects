import ollama from "ollama";
const MODEL_NAME = "llama3.1";
async function runAI() {
  console.log("Ollama3.1 başlatılıyor...");
  var prompt = "Merhaba, nasılsın?";
  console.log("Soru: " + prompt);
  try {
    const response = await ollama.chat({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    process.stdout.write("Cevap: ");
    for await (const part of response) {
      process.stdout.write(part.message.content);
    }
  } catch (error) {
    console.error("Hata oluştu:", error);
  }
}
runAI();
