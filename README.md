# DZLoc – Backend (Node.js + Express + PostgreSQL)

Backend de l’application **DZLoc** pour la gestion des annonces immobilières (location d’appartements, maisons, studios).  
Il fournit une **API REST sécurisée** utilisée par le frontend (hébergé sur Vercel).  

---

## 🚀 Stack technique
- **Node.js + Express** (serveur API)
- **PostgreSQL** (base de données, Render Free Plan)
- **JWT** (authentification sécurisée)
- **BCrypt** (hash des mots de passe)
- **Cloudinary** (hébergement des images)
- **Helmet, CORS, Rate Limiting** (sécurité API)
- **Joi** (validation des entrées)

---

## 📂 Structure du projet
dzloc-backend/
├─ src/
│ ├─ app.js # Entrée principale Express
│ ├─ db.js # Connexion PostgreSQL
│ ├─ middleware/ # Auth, validation
│ ├─ routes/ # Routes API (auth, users, properties, visits, etc.)
│ ├─ validators/ # Schémas Joi
│ └─ utils/ # Fonctions utilitaires
├─ schema.sql # Schéma SQL de la base
├─ package.json
├─ render.yaml # Config Render (infra as code)
├─ .env.example # Exemple de configuration
└─ README.md # Documentation
