# Bot Discord RSA — installation sur un VPS Linux

Ce dossier contient le bot à faire tourner sur ton serveur. Il se connecte à Discord
en permanence, souhaite la bienvenue aux nouveaux membres, écoute les commandes `/radio`,
`/radio-actuelle`, `/rsa` et `/serveur`, et demande au site `rsa.baccuarnaud.dev` de générer
ou de lire la fréquence du jour. `/serveur` affiche l'état du serveur Arma 3 suivi
(en ligne / hors ligne et nombre de joueurs). Toutes les réponses sont des embeds
aux couleurs RSA.

---

## 1. Ce qu'il te faut

- Un VPS Linux (Ubuntu/Debian recommandé)
- Node.js 20 ou plus
- Le token de ton bot Discord
- Le secret `RSA_CRON_SECRET` du site (il est dans les secrets du projet)

## 2. Installer Node.js (si absent)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v
```

## 3. Récupérer le code

```bash
sudo mkdir -p /opt/rsa-bot
sudo chown $USER:$USER /opt/rsa-bot
git clone https://github.com/<ton-compte>/<ton-repo>.git /opt/rsa-bot
cd /opt/rsa-bot/bot
npm install
```

> Remplace `<ton-compte>/<ton-repo>` par ton dépôt GitHub (celui synchronisé avec Lovable).
> Pour mettre à jour plus tard : `cd /opt/rsa-bot && git pull && cd bot && npm install`.

## 4. Configurer

```bash
cp .env.example .env
nano .env
```

Remplis :

| Variable                 | Où la trouver                                                        |
| ------------------------ | -------------------------------------------------------------------- |
| `DISCORD_BOT_TOKEN`      | Developer Portal → ton application → **Bot** → *Reset Token*          |
| `DISCORD_APPLICATION_ID` | Developer Portal → **General Information** → *Application ID*         |
| `DISCORD_GUILD_ID`       | Discord → clic droit sur ton serveur → *Copier l'identifiant*         |
| `RSA_API_URL`            | `https://rsa.baccuarnaud.dev`                                         |
| `DISCORD_WELCOME_CHANNEL_ID` | salon de bienvenue (optionnel, sinon le salon système du serveur) |
| `RSA_BOT_SECRET`         | la valeur du secret `RSA_CRON_SECRET` du site                         |

Enregistre avec `Ctrl+O` puis `Ctrl+X`.

Protège le fichier :

```bash
chmod 600 .env
```

## 5. Installer les commandes sur ton serveur Discord

À faire une seule fois (et à refaire si tu ajoutes une commande) :

```bash
npm run deploy
```

## 6. Tester

```bash
npm start
```

Tu dois voir `Bot connecte en tant que ...`. Tape `/radio-actuelle` dans Discord pour vérifier.
Arrête avec `Ctrl+C`.

## 7. Le faire tourner 24/7 (systemd)

```bash
sudo cp /opt/rsa-bot/bot/rsa-bot.service /etc/systemd/system/rsa-bot.service
sudo nano /etc/systemd/system/rsa-bot.service   # ajuste User= si besoin
sudo systemctl daemon-reload
sudo systemctl enable --now rsa-bot
```

Commandes utiles :

```bash
sudo systemctl status rsa-bot     # état
sudo systemctl restart rsa-bot    # redémarrer
sudo systemctl stop rsa-bot       # arrêter
journalctl -u rsa-bot -f          # voir les logs en direct
```

Si tu as gardé `User=rsa` dans le fichier, crée l'utilisateur avant :

```bash
sudo useradd -r -s /usr/sbin/nologin rsa
sudo chown -R rsa:rsa /opt/rsa-bot
```

## 8. Inviter le bot + activer le message de bienvenue

Developer Portal → **OAuth2 → URL Generator** :
- Scopes : `bot` et `applications.commands`
- Permissions : `Send Messages`, `Embed Links`

**Important pour la bienvenue** : Developer Portal → **Bot** → active
*SERVER MEMBERS INTENT*, puis redémarre le bot (`sudo systemctl restart rsa-bot`).
Sans ça, Discord n'envoie pas les arrivées et le bot ne dira rien.

Ouvre l'URL générée et choisis ton serveur. Vérifie que le bot a bien accès au salon
où la fréquence doit être publiée.

---

## Important

Comme ce bot est connecté en permanence, tu n'as **plus besoin** de l'URL
« Interactions Endpoint » dans le Developer Portal : laisse ce champ vide.
La publication automatique de la fréquence chaque matin reste gérée par le site,
pas par ce bot.
