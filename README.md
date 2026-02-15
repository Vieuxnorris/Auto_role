# Discord Auto Role Bot

Bot Discord Node.js qui attribue automatiquement un role defini a chaque nouveau membre humain qui rejoint un serveur cible.

## Features

- Attribution automatique d un role sur `guildMemberAdd`
- Ignore les comptes bot
- Validation fail-fast au demarrage (config, serveur, role, permissions, hierarchie)
- Logs console simples avec niveaux `error`, `warn`, `info`
- Execution 24/7 via Fly.io (recommande) ou PM2 (local/VPS)

## Prerequis

- Node.js 18+
- npm
- Un bot cree dans le Discord Developer Portal

## Setup

1. Installer les dependances:
   ```bash
   npm install
   ```
2. Copier le fichier d exemple et renseigner les valeurs:
   ```bash
   copy .env.example .env
   ```
3. Remplir `.env`:
   - `DISCORD_TOKEN`: token du bot
   - `GUILD_ID`: ID du serveur cible
   - `AUTO_ROLE_ID`: ID du role a attribuer
   - `LOG_LEVEL`: `info` (par defaut), `warn`, ou `error`

## Configuration Discord

1. Ouvrir le [Discord Developer Portal](https://discord.com/developers/applications).
2. Creer une application puis un bot.
3. Copier le token du bot vers `DISCORD_TOKEN`.
4. Dans `Bot`, activer **Server Members Intent**.
5. Dans `OAuth2 > URL Generator`:
   - Scopes: cocher `bot`
   - Bot Permissions: cocher au minimum `Manage Roles` et `View Channels`
6. Copier l URL generee, l ouvrir dans le navigateur, puis selectionner ton serveur.
7. Valider l ajout du bot.
8. Verifier la hierarchie des roles:
   - Le role du bot doit etre au dessus du role cible (`AUTO_ROLE_ID`).

Exemple de lien d invitation (remplacer `CLIENT_ID`):

```text
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=268436480
```

## Tutoriel: ajouter le bot au serveur

1. Recuperer le `CLIENT_ID`:
   - Developer Portal > ton application > `General Information` > copier `Application ID`.
2. Construire le lien d invitation:
   - Coller le `CLIENT_ID` ici:
     ```text
     https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot&permissions=268436480
     ```
3. Ouvrir le lien dans le navigateur.
4. Choisir le serveur dans lequel tu veux installer le bot.
5. Cliquer `Continuer`, verifier les permissions, puis `Autoriser`.
6. Sur Discord, verifier que le bot apparait dans la liste des membres du serveur.
7. Monter le role du bot au-dessus du role a donner automatiquement.
8. Activer le mode Developpeur dans Discord:
   - `Parametres utilisateur > Avance > Mode developpeur`.
9. Copier les IDs necessaires:
   - `GUILD_ID`: clic droit sur le serveur > `Copier l identifiant`.
   - `AUTO_ROLE_ID`: `Parametres du serveur > Roles`, clic droit sur le role cible > `Copier l identifiant`.
10. Mettre ces valeurs dans `.env`, puis lancer le bot:
   ```bash
   npm run start
   ```

## Run

- Production:
  ```bash
  npm run start
  ```
- Developpement (auto-reload):
  ```bash
  npm run dev
  ```

## Fly.io (24/7 recommande)

Sur Fly.io, le bot tourne en process unique via `node index.js`.
Ne pas lancer PM2 dans le conteneur Fly.

1. Installer flyctl:
   - https://fly.io/docs/flyctl/install/
2. Se connecter:
   ```bash
   fly auth login
   ```
3. Creer l app (une seule fois):
   ```bash
   fly apps create auto-role-vieuxnorris --yes
   ```
4. Ajouter les secrets (remplacer les valeurs):
   ```bash
   fly secrets set DISCORD_TOKEN="..." GUILD_ID="..." AUTO_ROLE_ID="..." LOG_LEVEL="info" -a auto-role-vieuxnorris
   ```
5. Deploy:
   ```bash
   fly deploy -a auto-role-vieuxnorris
   ```
6. Forcer la taille machine et 1 instance:
   ```bash
   fly scale vm shared-cpu-1x --vm-memory=256 -a auto-role-vieuxnorris
   fly scale count 1 -a auto-role-vieuxnorris
   ```
7. Monitoring:
   ```bash
   fly status -a auto-role-vieuxnorris
   fly logs -a auto-role-vieuxnorris
   fly secrets list -a auto-role-vieuxnorris
   ```
8. Rollback:
   ```bash
   fly releases -a auto-role-vieuxnorris
   fly deploy --image <image_ref> -a auto-role-vieuxnorris
   ```

## PM2 (24/7)

Section utile si tu heberges en local/VPS classique.

Demarrage:

```bash
pm2 start ecosystem.config.js --update-env
```

Commandes utiles:

```bash
pm2 status
pm2 logs discord-auto-role-bot
pm2 restart discord-auto-role-bot
pm2 save
pm2 startup
```

## Validation comportement

Scenarios manuels recommandes:

1. Demarrage avec `.env` valide -> bot ready.
2. Sans `DISCORD_TOKEN` -> sortie non-zero et erreur claire.
3. `GUILD_ID` invalide -> echec de validation au `ready`.
4. `AUTO_ROLE_ID` invalide -> echec de validation au `ready`.
5. Permission `Manage Roles` manquante -> echec au `ready`.
6. Hierarchie incorrecte -> echec au `ready`.
7. Arrivee d un membre humain -> role attribue.
8. Arrivee d un bot -> ignore.
9. Bot invite sur un autre serveur -> evenements ignores hors `GUILD_ID`.
10. Erreur API Discord ponctuelle -> erreur loggee, process reste vivant.

## Notes de securite

- Ne jamais commit `.env`.
- Le token n est jamais affiche dans les logs.
