# Padel Sporting Club Évreux — refonte du site vitrine

Refonte du site [padelsportingclub.fr](https://www.padelsportingclub.fr) (Squarespace),
suite à l'audit du site actuel. Même base technique que les autres sites (Éclat Auto Centre,
MBSR Auto, Édouard Automobiles) : HTML / CSS / JS statiques, **aucune étape de build**,
servi tel quel par Vercel.

## Direction : « Sous les projecteurs »

Le court vitré du club, éclairé la nuit, est déjà l'image la plus forte du lieu — toute la
direction artistique part de là. Fond marine profond `#0c0f1f` / `#171d36`, jaune électrique
`#fae789` repris de l'identité existante (logo, CTA), grandes lettres impact, données
(prix, heures, stats) en monospace façon tableau d'affichage de match.

- Typo : **Anton** (titres, condensé impact) / **Inter** (texte) / **JetBrains Mono** (prix, heures, labels)
- Animations : hero qui se révèle ligne par ligne, compteurs animés (m², pistes, parking),
  apparitions au scroll, parallaxe légère du hero, nav active au scroll. Tout se coupe avec
  `prefers-reduced-motion`.

## Stack

- `index.html` — page d'accueil : Hero / Stats / Complexe / Activités / Restauration / Tarifs / Crédits / Cours / Séminaires / Partenaires / Application / Nous situer
- `contact.html` — formulaire de contact (séminaire, partenariat, question générale) + plan
- `mentions-legales.html` — obligation légale ; **contient des champs `[à compléter]`**
- `robots.txt` / `sitemap.xml`
- `assets/styles.css` — design system complet (tokens, composants, responsive)
- `assets/main.js` — header au scroll, menu mobile (focus trap), nav active, reveals, compteurs, parallaxe
- `assets/fonts/` — polices **auto-hébergées** (Anton, Inter, JetBrains Mono, sous-ensemble latin) : aucune requête vers Google
- `assets/img/` — photos réelles du club (reprises du site Squarespace actuel, réoptimisées en WebP, plusieurs largeurs pour le `srcset`)
- `assets/favicon.svg` — monogramme P jaune sur fond marine
- `tools/` — scripts Node ponctuels utilisés pour générer `assets/img` et `assets/fonts` (nécessitent `npm install sharp` ; pas nécessaires pour servir le site)
- Aucune dépendance externe en prod, pas de framework, pas de build.

### Poids
Site complet ~3,4 Mo (photos comprises), toutes en WebP avec plusieurs résolutions servies via `srcset`.

## Ce qui a été corrigé par rapport au site actuel (voir audit)

- Données structurées `LocalBusiness` / `SportsActivityLocation` **complètes** (adresse, horaires, contact) — vides sur le site Squarespace actuel.
- Une seule page avec une hiérarchie de titres propre (un seul `<h1>`).
- Toutes les images ont un `alt` descriptif.
- `og:image` en HTTPS.
- Réservation, tarifs, cours, séminaires, partenariats : contenu repris et clarifié, sans rien inventer sur les prix ou les prestations.

## À personnaliser / compléter

| Élément | État actuel | À faire |
|---|---|---|
| **Mentions légales** | 7 champs `[à compléter]` | Renseigner forme juridique, capital, RCS, SIRET, TVA, directeur de publication, médiateur de la consommation |
| E-mail de contact | `pscaccueil@gmail.com` repris du site actuel (le site actuel utilise aussi `padelscevreux@gmail.com` pour les séminaires — à confirmer) | Confirmer l'adresse à utiliser partout |
| Formulaire de contact | `mailto:` pré-rempli, pas de backend | Brancher Formspree ou Web3Forms pour un envoi réel sans ouvrir la messagerie du visiteur |
| Plan | iframe OpenStreetMap, marqueur approché sur Rue Vulcain | Affiner les coordonnées exactes, ou passer à Google Maps si préféré |
| Photos | Reprises du site Squarespace actuel | Remplacer par des photos plus récentes / en meilleure résolution si disponibles (le hero notamment gagnerait à être retravaillé en format paysage large) |
| Réservation | Redirige toujours vers `padelevreux.mymobileapp.fr` (mini-site tiers) | Cf. audit : à terme, envisager un widget de réservation intégré au domaine du club pour réduire la rupture de marque |
| Domaine | `padel-sporting-club.vercel.app` (placeholder) | Chercher/remplacer dans les 3 pages HTML + `sitemap.xml` + `robots.txt` une fois un nom de domaine branché |

## Déploiement

Fichiers statiques → Vercel. `vercel.json` : `cleanUrls`, HTML/CSS/JS en `must-revalidate`,
images en cache long. Prévisualisation locale : `npx serve .`
