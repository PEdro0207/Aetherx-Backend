const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const ML_APP_ID = process.env.ML_APP_ID;
const ML_SECRET_KEY = process.env.ML_SECRET_KEY;
const ML_TOKEN = process.env.ML_TOKEN;
const REDIRECT_URI = "https://aetherx-backend-production.up.railway.app/callback";

app.get("/", (req, res) => {
  res.json({ status: "online", message: "Aetherx Backend funcionando!" });
});

app.get("/debug", (req, res) => {
  res.json({
    token_existe: !!process.env.ML_TOKEN,
    app_id_existe: !!process.env.ML_APP_ID,
  });
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Code não encontrado" });

  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: ML_APP_ID,
        client_secret: ML_SECRET_KEY,
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});