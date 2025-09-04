const express = require('express');
const cors = require('cors');

const app = express();

// Autoriser uniquement ton frontend Vercel
app.use(cors({
  origin: 'https://dzloc.vercel.app',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Exemple de route
app.post('/auth/register', (req, res) => {
  res.json({ message: 'Inscription réussie !' });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend lancé sur le port ${PORT}`));

