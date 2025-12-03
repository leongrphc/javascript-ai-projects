// Node.js local sunucu kurulumu

const http = require("http");   // çekirdek modül

// Sunucu Oluştur
const server = http.createServer((req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"});         // application/json => api geliştirirken
    res.end("Bu basit bir Node.js sunucusu...");  // sunucu sayfasında yazıcak yazı
});

// Sunucunun dinleyeceği port
const PORT = 3000;

// Sunucuyu başlat
server.listen(PORT, () => {
    console.log("Sunucu çalışıyor: Port:"+PORT);
});