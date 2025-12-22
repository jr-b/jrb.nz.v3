+++
title = "Projet: Radio-Canada Mini"
date = 2022-01-10
[taxonomies]
tags = ["projets", "Radio-Canada Mini", "web"]
[extra]
archive = "This post was published more than 2 years ago. It's content is most probably out of date!"
+++

> En 2021, j’ai découvert la version _lite_ de CBC.ca, disponible à la page https://cbc.ca/lite. Je me suis lancé le défi de créer une version équivalente pour le contenu de Radio-Canada.ca.<br>
> Le projet est en ligne depuis 2021 → https://radiocanadamini.ca<br>
> Cet article présente le projet et fait un survol de quelques détails techniques.

## Pourquoi faire ce site?

L’objectif initial était d’apprendre à utiliser le générateur de site statique [Eleventy](https://11ty.dev/) tout en produisant un site utile et pertinent, autant pour moi que pour d’autres. Entre 2015 et 2017, j’avais exploré [Hugo](https://gohugo.io/) et [Jekyll](https://jekyllrb.com/). Je voulais maintenant essayer quelque chose de nouveau.

L’expérience de navigation et de lecture sur [Radio-Canada.ca](https://ici.radio-canada.ca/) me décevait depuis plusieurs mois, et j'avais envie d'améliorer les points suivants avec un site léger et minimaliste:

**1. Omniprésence de la publicité**: sans un bloqueur de publicités, Radio-Canada.ca est rempli de publicités (en images ou en vidéos). Les contenus publicitaires sont continuellement rechargés.

**2. Lourdeur des pages**: le chargement de toutes les images et de tous les modules d’une page sur Radio-Canada.ca peut prendre plusieurs secondes. La page d’accueil fait environ [3 Mb](https://tools.pingdom.com/#5fb5936b21800000). 140 requêtes sont faites pendant le chargement.

**3. Espace visuel surchargé**: la lecture d’un texte ne se fait pas sans voir plusieurs fils de nouvelles divers, la liste des articles les plus lus, l’espace accordé aux commentaires, etc.

## CBC Lite

[En 2021, CBC lançait la version _lite_ de son site](https://cbc.radio-canada.ca/en/your-public-broadcaster/blog/introducing-cbc-lite). Voici comment le projet est présenté:

> The internet is getting bigger, and with it, the amount of information sent for each web page load continues to increase exponentially. For those of us lucky enough to have high-speed internet access, we’ve now been opened up to the options of high-definition video and audio streaming. Pages can load large, complicated components, and data can zip back and forth at lightning speeds. <br>
> Unfortunately these kinds of advances tend to leave others behind.<br>
> More than a million users in Canada access CBC.ca on dial-up internet speeds each month. This often results in wait times of 30-plus seconds (up to multiple minutes) for a single page load. When you factor in video and audio streams, many pages quickly become inaccessible. Besides dial-up, CBC.ca has more than 10 million users each month visiting using cellular data, and the majority of users are not on unlimited data plans. Large page sizes quickly eat up data, leading to poor experiences.

Radio-Canada, de son côté, n'a jamais lancé de projet similaire. J'ai donc profité de l'occasion pour me lancer dans le projet de reproduire, en quelques semaines, un site équivalent.

D’ailleurs, plusieurs autres projets similaires existent ailleurs sur le web:

- Version _text-only_ de [NPR](https://text.npr.org/)
- Version _lite_ de [CNN](http://lite.cnn.com/en)
- Version _skinny_ [The Guardian](https://www.skinnyguardian.xyz/)

## Quelle est la pertinence d’un site de ce genre en 2022?

Avec la montée fulgurante des nouvelles technologies du web et des réseaux sociaux, avec la centralisation excessive des services vers les <abbr title="Google, Apple, Facebook, Amazon, Microsoft">GAFAM</abbr>, on pourrait croire que des sites légers (qui consomment peu de données) tels que [CBC Lite](https://cbc.ca/lite) sont maintenat désuets, inutiles. Qu’ils seraient des artéfacts du web d’avant, du petit web.

Il faut par contre rappeler que l’accès à Internet est un privilège, tout autant que l’accès à une connexion Internet de qualité. Dans un rapport publié en 2019, le <abbr title="Conseil des académies canadiennes">CAC</abbr> constatait l’écart de connectivité à travers le Canada:

> Seulement 46% des ménages ruraux (et 35% des ménages dans les réserves des Premières Nations) avaient accès à des connexions Internet qui répondaient aux critères du gouvernement du Canada (50/10 illimité).[^1]

Dans cette optique, ça devient pertinent — par souci d’accessibilité — d’offrir des sites légers, qui pourront s’afficher rapidement pour tous les ménages à connexion Internet réduite (ou dont la consommation en données est limitée).

## Avantages

Outre les points déjà mentionnés, voici d'autres aspects qui donnent de la pertinence au projet:

- **Épuré**: L’interface est volontairement minimaliste. Retour à l’essentiel. Le texte est mis de l’avant, les images sont facultatives.

- **Sans publicités**: Aucune publicité n’est ajoutée au site. Radio-Canada Mini ne rapporte aucun revenu.

- **Respect de la vie privée**: Aucun _trackers_, aucun _cookies_. Le site ne récupère aucune information sur votre navigateur et votre configuration. La seule métrie qui est utilisée est celle disponible via Cloudflare (les statistiques de requêtes DNS).

- **Faible consommation de données**: La page d’accueil de Radio-Canada.ca fait 3200 kb (3.2 MB), alors que Radio-Canada Mini et la plupart de ses pages font moins de 20 kb. _Environ 160 fois moins de données sont consommées en visitant Radio-Canada Mini._

- **Empreinte carbone réduite**: [Radio-Canada Mini a une empreinte carbone exemplaire (source: WebsiteCarbon.com)](https://www.websitecarbon.com/website/radiocanadamini-ca/).

### Affiliation à CBC/Radio-Canada

Radio-Canada Mini est un projet indépendant. Il s’agit d’un projet personnel mis en ligne sans aucune intervention de la société d’État.

## Aspects techniques

Quelques détails techniques sur le projet.

Le code source est publiquement accessible sur [Github](https://github.com/jr-b/radiocanadalite).

### Structure des données

Dans le projet Eleventy, le dossier `_data` contient tous les fichiers Javascript qui appellent les endpoints de l'API public de Radio-Canada (À la une, Politique, Arts, etc.). Chaque fichier Javascript réalise la série de tâches suivante:

1. Fetch le endpoint du lineup, par exemple `https://services.radio-canada.ca/neuro/v1/lineups/771`
2. Récupérer tous les `items` (les articles) du lineup
3. Filtre la liste des `items` pour exclure les documents atypiques (redirection, etc.)
4. Fetch tous les articles à partir des URL récupérés (`https://services.radio-canada.ca/neuro/v1/news-stories/{ID}`)
5. Retourne un objet Javascript qui contient toutes les données de tous les articles du lineup (images, auteur-e-s, catégories, texte, etc.)

Je peux ensuite appeler les données d'une section dans un template Nunjucks en utilisant une boucle comme ceci:

{% raw %}
{% for newsstories in economie %} ... {% endfor %}
{% endraw %}

### Fréquence de mise à jour

Le _build_ du projet est lancé toutes les 30 minutes via un `cron`. Une requête POST est faite sur le _webhook_ du projet, ce qui déclenche le build. Toutes les sections du site sont donc rafraichies à chaque 30 minutes.

À chaque build, tous les articles dans tous les lineups sont générés. Les articles générés par les builds passés restent disponibles, mais ne sont pas indexés sur le site (ce qui permet d'accéder à un article du passé si on a le lien direct).

### Coûts

Le site n'a demandé qu'une seule dépense: le nom de domaine. J'ai payé `rc-lite.xyz` environ 1.50$ CAD en 2021. Le renouvellement devrait être aux alentours de 10$ CAD par an.

> J'ai depuis changé le nom de domaine pour `radiocanadamini.ca`, mais je n'ai pas eu d'autres dépenses.

Initialement, le projet roulait chez Vercel. J'ai testé différentes approches au fil du temps (bucket S3 chez AWS, Netlify). Actuellement, le site est généré via une action GitHub, qui écrit les fichiers dans un repo GitHub où j'ai configuré [GitHub Pages](https://pages.github.com/).

## Statistiques

Environ 1 mois après avoir fait le transfert du domaine chez Cloudflare, voyons voir quelques statistiques de visite.

Entre début janvier et début février, Cloudflare rapporte 1630 visites uniques. Quotidiennement, il y a eu au moins 71 visites sur le site, et au plus 180.

![statistiques-rc-lite](/images/stats-rc-lite-8fev.png)

Il faut signaler que je n'ai pas vraiment fait de publicité pour le site. J'ai ajouté le projet sur https://250kb.club, https://512kb.club et https://1mb.club, qui sont des listes de sites web légers.

J'ai mentionné Radio-Canada Mini dans les commentaires de l'article [A List Of Text-Only News Sites](https://greycoder.com/a-list-of-text-only-new-sites/).

Sinon j'ai aussi mentionné le site à quelques reprises sur Twitter et dans la communauté autour du projet 11ty.

## Mise à jour : juin 2023

Le projet a changé de nom au cours de l'année 2022. Le nom initial, `Radio-Canada Lite` faisait écho à `CBC Lite`, mais je trouvais qu'un nom francophone ferait plus de sens.

J'ai donc renommé le site **Radio-Canada Mini**, avec le nom de domaine [radiocanadamini.ca](https://radiocanadamini.ca), sous le TLD `.ca` (qui est beaucoup plus cohérent avec le projet que `.xyz`).

Suite au changement de nom, j'ai partagé le projet sur deux communautés Reddit, `/r/montreal` et [`/r/Quebec`](https://www.reddit.com/r/Quebec/comments/1187h9c/radiocanada_mini_une_version_légère_de/), et ç'a été assez bien reçu. Un développeur de Radio-Canada m'a même contacté en privé pour me féliciter et me proposer de partager mon CV à l'interne.

Un [internaute](https://hugo.soucy.cc) m'a aussi contacté (via une `issue` sur le projet Github) pour mentionner le fait qu'il aimerait que le contenu soit disponible via fil RSS. J'ai pris un peu de temps le weekend suivant pour rendre disponible chaque section via un fil RSS (https://radiocanadamini.ca/rss/politique.xml)

En date du 16 juin 2023, le site reçoit en moyenne 600 visiteurs uniques par jour. Sur un mois, c'est environ 7000 visiteurs uniques, et environ 100 000 requêtes faites sur le nom de domaine.

_Requêtes reçues par Cloudflare dans les 30 derniers jours._
![statistiques-rc-lite](/images/rad-can-mini-16-juin2023-requests.png)

_Visiteurs uniques rapportés par Cloudflare dans les 30 derniers jours._
![statistiques-rc-lite](/images/rad-can-mini-uniq-16juin2023.png)

[^1]: Rapport _En attente de connexion_: [consulter les principales constations](https://www.rapports-cac.ca/wp-content/uploads/2021/10/2021-10-26-HTSN-1P-FRE-FINAL-1.pdf)
