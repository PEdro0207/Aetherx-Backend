const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/produtos", async (req, res) => {
  const cat = req.query.cat || "MLB1648";

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?category=${cat}&limit=8`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
  console.log('Servidor rodando na porta 3000');
});

// falta isso no final do server.js
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});