const express = require("express");
const app = express();
const port = 4141;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/odev.html");
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
