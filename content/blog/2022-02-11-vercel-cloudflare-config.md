+++
title = "Comment configurer Cloudflare avec Vercel"
date = 2022-02-11
[taxonomies]
tags = ["dns", "web"]
+++

Je fais la gestion DNS de mes projets sur Cloudflare. J'ai eu quelques pépins techniques en configurant mes noms de domaine avec des projets hébergés chez Vercel. Je recevais quotidiennement des courriels de Vercel me signalant que la configuration DNS de mes projets était incorrecte. Je me suis penché sur le problème pour tenter de trouver une solution.

![vercel-not-configured](/images/vercel-not-configured.png)

Vercel annonce d'emblé dans sa [documentation](https://vercel.com/support/articles/using-cloudflare-with-vercel) qu'ils ne recommandent pas l'utilisation du proxy Cloudflare:

> It is highly recommended that you don't use the Cloudflare CDN with Vercel. [^1]

Si on veut quand même utiliser le proxy Cloudflare, Vercel indique qu'on doit permettre les requête HTTP (sans SSL) sur le path `/.well-known/*`.

## Désactiver HTTPS pour `.well-known`

On peut désactiver le trafic HTTPS avec les Pages rules de Cloudflare:

1. Visiter Rules > Pages Rules
2. Create Page Rules
3. Dans le champ `If the URL matches`, entrer le domaine avec les wildcards nécessaires: `*exemple.com/.well-known/*`
4. Sélectionner `SSL > Off`

## Forcer le trafic HTTPS

Il faut par ailleurs rediriger toutes les autres requêtes HTTP vers HTTPS manuellement avec une autre règle (même si Cloudflare a une option pour le faire automatiquement):

1. Visiter SSL/TLS > Edge Certificates
2. Désactiver `Always Use HTTPS`
3. Visiter Rules > Pages Rules
4. Create Page Rule
5. Dans le champ `If the URL matches`, entrer le domaine `*domaine.com/*`
6. Sélectionner `Always Use HTTPS`
7. Enregistrer, et mettre cette règle en 2e position

## Tester la configuration

On peut confirmer que la nouvelle configuration fonctionne avec la commande suivante, qui devrait retourner un 404:
`curl http://example.com/.well-known/acme-challenge -I`

L'interface de Vercel se met rapidement à jour quand la configuration est tip top 🎉
![vercel-configured](/images/vercel-configured.png)

[^1]: https://vercel.com/support/articles/using-cloudflare-with-vercel
