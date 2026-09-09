# RSA — Racailles Sans Avenir

Un site public de présentation, un espace privé pour les membres connectés avec Discord, et un bot qui donne une nouvelle fréquence radio chaque jour.

## La fréquence du jour

- Un nombre tiré au hasard entre 30.0 et 512.0, avec une décimale (ex. 84.3, 411.9).
- Générée automatiquement une fois par jour et postée dans un salon Discord choisi.
- Jamais deux jours de suite la même valeur.
- Commande Discord `/radio` pour regénérer immédiatement une nouvelle fréquence (réservée aux responsables), et `/radio-actuelle` pour afficher celle en cours.
- Chaque fréquence est enregistrée avec sa date, donc l'historique est consultable.

## Le site public

Une page d'accueil simple qui présente le groupe :

- Bandeau avec le nom, le logo/emblème et une phrase d'accroche.
- Section "Qui sommes-nous" et quelques valeurs/activités.
- Bouton "Se connecter avec Discord".
- Style sombre, urbain, marqué — pas un site corporate.

## L'espace membre (connexion Discord)

Après connexion :

- Le pseudo et l'avatar Discord du membre.
- Son rang dans le groupe.
- La fréquence radio du jour, bien visible, avec l'heure du prochain changement.
- Les dernières fréquences.

Les rangs sont gérés depuis le panel chef ; par défaut un nouveau membre arrive en "Recrue".

## Le panel chef

Visible uniquement par le compte Discord `494628972013944837` (d'autres chefs pourront être ajoutés depuis ce panel) :

- Liste des membres, changement de rang, retrait d'accès.
- Journal du bot : chaque fréquence générée, par qui, quand, et les erreurs.
- Contrôle du bot directement depuis le site : changer son nom, changer son avatar, forcer une nouvelle fréquence, choisir le salon de publication.

## L'adresse

Le site sera relié à `rsa.baccuarnaud.dev`. Le retour de connexion Discord se fera sur `https://rsa.baccuarnaud.dev/auth/discord/callback` (c'est cette adresse qu'il faudra coller dans les réglages de l'application Discord — le mot exact est "callback", pas "fallback"). L'adresse de test actuelle sera aussi autorisée pour pouvoir se connecter avant la mise en ligne.

## Ce qu'il me faudra de ta part

Après validation du plan, je te demanderai dans un formulaire sécurisé :

- Le token du bot Discord
- L'ID de l'application et sa clé publique
- Le secret client OAuth
- L'ID du serveur et l'ID du salon où poster la radio

## Détails techniques

- Lovable Cloud activé : tables `profiles` (lien vers l'ID Discord, pseudo, avatar, rang), `user_roles` (`membre` / `chef`, table séparée + fonction `has_role` en security definer), `radio_frequencies` (valeur, date, auteur, source), `bot_settings` (salon, dernier avatar/nom), `bot_logs`.
- Connexion Discord : flux OAuth2 code géré par des routes serveur (`/auth/discord/login`, `/auth/discord/callback`), puis création/récupération du compte Lovable Cloud correspondant côté serveur et ouverture de session. Le secret client ne quitte jamais le serveur.
- Bot Discord en HTTP Interactions (pas de gateway persistante) : route publique `/api/public/discord/interactions` avec vérification de la signature Ed25519, enregistrement des commandes `/radio` et `/radio-actuelle` au déploiement.
- Génération quotidienne : `pg_cron` + `pg_net` appelant `/api/public/cron/daily-radio` protégé par un secret partagé ; publication du message via l'API Discord avec le token bot.
- Actions bot (rename, avatar, post) via des server functions protégées par `has_role(auth.uid(), 'chef')`.
- RLS partout : lecture des fréquences réservée aux membres connectés, écriture réservée au serveur, tables de logs et réglages réservées aux chefs.
