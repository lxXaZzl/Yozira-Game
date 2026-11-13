# [-] Yozira game

Bot de casino/économie, séparé du bot de modération. Préfixe : `-` (modifiable avec `PREFIX`).

## Installation
1. Crée une application sur le [Discord Developer Portal](https://discord.com/developers/applications) (distincte du bot de modération).
2. Active les intents **Server Members Intent** et **Message Content Intent**.
3. Invite le bot avec la permission **Administrateur**.
4. Copie `.env.example` en `.env` et mets ton token.
5. `npm install` puis `npm start`.

## Déploiement sur Railway
1. Pousse ce dossier sur un dépôt GitHub.
2. Sur [railway.app](https://railway.app) : **New Project > Deploy from GitHub repo**, choisis le dépôt.
3. Dans l'onglet **Variables** du service, ajoute `TOKEN` avec le token du bot.
4. Pour garder l'argent des membres entre les redéploiements : onglet **Volumes**, crée un volume monté sur `/data`, puis ajoute la variable `DB_PATH=/data/bot.db`.
5. Railway installe les dépendances et lance `npm start` automatiquement (grâce à `package.json`).

## Mise en place sur le serveur
- `-setcasino` : crée le salon `🎰・casino` et le rôle **Casino**. Cliquer sur l'embed donne le rôle, qui débloque les commandes de jeu si configuré (sinon tout le monde peut jouer).
- `-setcasino off` : supprime le salon et désactive le rôle requis.

## Commandes joueur
- `-bal [@user]` : solde (portefeuille + banque)
- `-daily` : 1000¥ par jour, reset à minuit (UTC)
- `-work` : petit boulot, toutes les 30 minutes
- `-bd <montant|all>` / `-br <montant|all>` : dépôt / retrait à la banque (la banque protège de `-rob`)
- `-bj <montant|all>` : blackjack avec boutons Tirer/Rester
- `-pkr <montant|all>` : poker simplifié (5 cartes contre la table)
- `-sl <montant|all>` : machine à sous
- `-cf <montant|all> <pile|face>` : pile ou face
- `-rl <montant|all> <rouge|noir>` : roulette
- `-rob @user` : tente de voler quelqu'un (cooldown 45 min, 40% de réussite)
- `-drop <montant>` : fait tomber de l'argent (le tien), premier arrivé premier servi
- `-lb` : classement des plus riches
- `-shop` / `-buy <faucheur|vip>` : boutique

Gains par défaut : x2 la mise. Avec le VIP acheté en boutique : x4.

## Boutique
- **Faucheur** (rôle, 5000¥) : cosmétique
- **VIP** (100 000¥) : rôle + passe le multiplicateur des jeux de x2 à x4

## Commandes admin (permission "Gérer le serveur")
- `-giv£ <montant> <@user>` (alias `-givl`)
- `-d£l <montant> <@user>` (alias `-dell`)
- `-cadeaux <montant>` : argent gratuit pour le premier qui clique

## Commande propriétaire
- `-reset all CONFIRMER` : remet à zéro l'argent de tout le monde sur le serveur. Réservée au propriétaire du serveur et aux IDs dans `OWNER_IDS` (ou `utils/owners.js`).

## Limites à connaître
- La roulette, les slots et la machine à voler ont un avantage pour la maison (comme un vrai casino) : ce n'est pas un bug.
- `node:sqlite` est une fonctionnalité expérimentale de Node, un avertissement peut apparaître dans les logs, c'est normal.
