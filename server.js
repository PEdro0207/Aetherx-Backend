require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const ML_APP_ID = process.env.ML_APP_ID;
const ML_SECRET_KEY = process.env.ML_SECRET_KEY;
const REDIRECT_URI = "https://aetherx-backend-production.up.railway.app/callback";

// Rota de callback — troca o code pelo access_token
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Code não encontrado" });
  }

  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: ML_APP_ID,
        client_secret: ML_SECRET_KEY,
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await response.json();

    // Mostra o token no navegador — copia e salva no Railway
    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      message: "Copie o access_token e adicione no Railway em Variables!"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar token" });
  }
});

// Rota de produtos
app.get("/api/produtos", async (req, res) => {
  const cat = req.query.cat || "MLB1648";

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?category=${cat}&limit=8`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.ML_TOKEN}`,
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});