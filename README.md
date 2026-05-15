# OùSkier

Application web de classement et de prévisions des stations de ski françaises. Agrège les données météo, l'enneigement et l'état des remontées mécaniques pour produire un score global (0–100) par station, mis à jour 4 fois par jour.

## Fonctionnalités

- **Classement en temps réel** de 50+ stations françaises par score de conditions
- **Sélection de date** : re-classe les stations par les conditions prévues sur les 7 prochains jours
- **Comparaison** : vue côte à côte de jusqu'à 3 stations
- **Page de station** : score détaillé, prévisions 7 jours, enneigement, remontées ouvertes, neige récente
- **Tags automatiques** : Jackpot Poudreuse, Grosse Neige, Grand Beau, Vent Fort, etc.
- **SEO** : sitemap dynamique, Open Graph, Twitter Card par station
- **Sécurité** : headers HTTP stricts (X-Frame-Options, X-Content-Type-Options, etc.)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router, ISR) |
| Langage | TypeScript 5 |
| CSS | Tailwind CSS 3 |
| Scraping | Axios + Cheerio |
| Déploiement | Vercel (Hobby) |

## Sources de données

| Source | Données | Méthode |
|--------|---------|---------|
| [Open-Meteo](https://open-meteo.com) | Météo 7 jours à l'altitude de la station | API REST (gratuite, sans clé) |
| [snow-forecast.com](https://www.snow-forecast.com) | Hauteur de neige, cumuls prévus | Scraping Cheerio |
| [skiinfo.fr](https://www.skiinfo.fr) | Remontées ouvertes, neige récente, qualité | Scraping `__NEXT_DATA__` JSON |

## Algorithme de scoring

Le score (0–100) combine 5 critères pondérés :

| Critère | Poids | Description |
|---------|-------|-------------|
| Météo | 30% | Qualité des 3 meilleures journées (ciel + température idéale) |
| Enneigement frais | 25% | Cumul de neige sur 3 jours |
| Manteau neigeux | 25% | Hauteur de neige au sommet et en bas |
| Remontées | 10% | % de remontées ouvertes (skiinfo.fr) |
| Vent | 10% | Vitesse de vent sur les meilleures journées |

## Stations couvertes (50+)

- **Alpes du Nord** : Val Thorens, Tignes, Val d'Isère, Les Arcs, La Plagne, Courchevel, Méribel, Les Menuires, Avoriaz, Chamonix, Flaine...
- **Alpes du Sud** : Serre Chevalier, Alpe d'Huez, Les 2 Alpes, Montgenèvre, Vars, Isola 2000, Auron...
- **Pyrénées** : Grand Tourmalet, Saint-Lary, Cauterets, Font-Romeu, Les Angles, Peyragudes...
- **Massif Central / Jura / Vosges** : Super Besse, Le Mont-Dore, Le Lioran, Métabief, La Bresse

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Classement homepage
│   ├── comparer/page.tsx           # Comparaison de stations
│   ├── station/[slug]/page.tsx     # Détail d'une station
│   ├── api/revalidate/route.ts     # Endpoint cron ISR
│   ├── sitemap.ts                  # Sitemap dynamique
│   └── robots.ts                   # Robots.txt dynamique
├── components/
│   ├── StationList.tsx             # Leaderboard avec filtres
│   ├── StationCard.tsx             # Carte station dans le classement
│   ├── DateSelector.tsx            # Sélecteur de date 7 jours
│   ├── Filters.tsx                 # Filtres massif / altitude / score
│   ├── CompareBar.tsx              # Barre flottante de comparaison
│   ├── CompareClient.tsx           # Vue comparaison côte à côte
│   ├── ScoreBadge.tsx              # Badge score circulaire
│   ├── ScoreBreakdown.tsx          # Détail des composantes du score
│   ├── DailyForecast.tsx           # Carte prévision journalière
│   ├── SnowChart.tsx               # Graphe neige récente
│   └── TagBadge.tsx                # Badge tag emoji
└── lib/
    ├── data-service.ts             # Orchestrateur principal des données
    ├── stations.ts                 # Définition des 50 stations
    ├── scoring.ts                  # Algorithme de scoring
    ├── weather.ts                  # Client Open-Meteo
    ├── types.ts                    # Interfaces TypeScript
    └── scraping/
        ├── snow-forecast.ts        # Scraper snow-forecast.com
        └── skiinfo.ts              # Scraper skiinfo.fr
```

## Stratégie de cache

- **Pages statiques (ISR)** : générées au build, revalidées toutes les 24h ou à la demande
- **Cache mémoire scraping** : TTL 3h pour éviter de surcharger les sources
- **Cron Vercel** : appelle `/api/revalidate` à 4h, 10h, 16h, 22h UTC — régénère toutes les pages

## Installation locale

**Prérequis :** Node.js 20+

```bash
# Cloner le repo
git clone https://github.com/Romgua/SkiWeather.git
cd SkiWeather

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local et renseigner CRON_SECRET

# Lancer en développement
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Variables d'environnement

| Variable | Description | Génération |
|----------|-------------|------------|
| `CRON_SECRET` | Secret pour sécuriser l'endpoint `/api/revalidate` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

## Déploiement sur Vercel

1. Connecter le repo GitHub sur [vercel.com](https://vercel.com)
2. Ajouter `CRON_SECRET` dans `Settings > Environment Variables`
3. Déployer — le cron se configure automatiquement via `vercel.json`

## Commandes

```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run start      # Serveur de production
npm run lint       # Lint ESLint
npm run type-check # Vérification TypeScript
```
