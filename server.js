
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
    console.log("TOKEN COMPLETO:", JSON.stringify(data));

    // Mostra tudo na tela
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar token" });
  }
});

// Função para renovar o token automaticamente
async function refreshAccessToken() {
  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: ML_APP_ID,
        client_secret: ML_SECRET_KEY,
        refresh_token: process.env.ML_REFRESH_TOKEN
      })
    });

    const data = await response.json();
    
    if (data.access_token) {
      process.env.ML_TOKEN = data.access_token;
      process.env.ML_REFRESH_TOKEN = data.refresh_token;
      console.log("Token renovado com sucesso!");
    }
  } catch (err) {
    console.error("Erro ao renovar token:", err);
  }
}

// Renova o token a cada 5 horas (antes de expirar)
setInterval(refreshAccessToken, 5 * 60 * 60 * 1000);

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
    
    // Mostra tudo incluindo erros
    console.log("STATUS:", response.status);
    console.log("RESPOSTA:", JSON.stringify(data));
    res.json({ status: response.status, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Rota de debug — remove depois que funcionar
app.get("/debug", (req, res) => {
  res.json({
    token_existe: !!process.env.ML_TOKEN,
    token_inicio: process.env.ML_TOKEN ? process.env.ML_TOKEN.substring(0, 20) : "vazio",
    refresh_existe: !!process.env.ML_REFRESH_TOKEN
  });
});