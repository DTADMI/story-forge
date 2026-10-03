# Lecture audio des fiches d'encyclopedie

> **Owner**: Nebula Forge Digital Studio | **Last Updated**: 2026-10-03

StoryForge lit les fiches d'encyclopedie a voix haute avec le **moteur vocal du
navigateur**. Rien n'est stocke, rien ne se perime, aucun cout de stockage. Cette
page decrit l'integration; la procedure transversale est dans le skill
`.agents/skills/audio-articles/SKILL.md` (NF-AUDIO-001).

## Objectif

Offrir une version audio de chaque fiche, au debut du contenu, a la vitesse
choisie. Aucun autoplay, aucun pistage: l'audio reste une option et le texte
demeure la source de verite.

## Principe

Le navigateur expose `window.speechSynthesis`. Le composant lui confie le texte de
la fiche, une langue et un debit (`utterance.rate`), puis appelle `speak()`. Le
texte est decoupe en phrases (moins de 240 caracteres) pour que l'avancement, la
pause/reprise et la navigation fonctionnent meme la ou les enonces longs sont
tronques. Aucun fichier, aucun appel reseau gere par StoryForge.

Le lecteur ne se rend **que si l'appareil expose un moteur vocal**: sinon la fiche
reste un simple article, sans controle mort.

## Fichiers

| Fichier | Role |
| --- | --- |
| `components/audio/article-audio-player.tsx` | Composant canonique, sans dependance UI (boutons HTML + Tailwind) |
| `lib/audio/plain-text.ts` | `markdownToPlainText`, `splitIntoSpeechChunks` |
| `app/(main)/world/encyclopedia/[category]/[id]/page.tsx` | Monte le lecteur en tete du contenu de la fiche |
| `lib/i18n/translations/{en,fr}.ts` | Cles `audio.*` |

Le composant est **copie** depuis `ascent-legacy` (pas de dependance partagee,
conformement aux regles NF). Props: `text`, `title`, `lang`, `speeds`, `labels`.

## Comportement

- Lecture / pause, phrase precedente / suivante, barre de progression.
- Vitesse (0,75x a 2x) et voix memorisees dans `localStorage`.
- Voix filtrees par langue (`fr` / `en`).
- Aucun autoplay; la lecture demarre sur une action de l'utilisateur.
- Erreur affichee en `role="alert"`, jamais de bouton mort silencieux.

## Verification

Test unitaire: `__tests__/components/article-audio-player.test.tsx` (helpers de
texte + rendu vide cote serveur).

La matrice navigateurs de StoryForge couvre Chromium, Firefox, WebKit, Chrome
mobile et Safari mobile (`playwright.config.ts`). Les fiches etant derriere
l'authentification, la verification de bout en bout du lecteur est couverte par
les projets `ascent-legacy` et `nebula-forge-web`, dont les tests
`e2e/article-audio.spec.ts` et `e2e/blog-audio.spec.ts` s'executent sur les cinq
profils (rendu sans 404, aucun element `<audio>`, aucun URL audio stocke, aucun
debordement a 320px).

## Voir aussi

- `.agents/skills/audio-articles/SKILL.md` (procedure transversale)
- `ascent-legacy/docs/technical/audio-articles.md` (implementation de reference)
- `nebula-forge-web/docs/technical/audio-articles.md` (blog)
