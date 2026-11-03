# Audit conformité et modifications — Crochet with Tessa

## 1. Pages obligatoires
Créées : `mentions-legales.html`, `confidentialite.html`, `cgu.html`, `cgv.html`, `cookies.html`, `retractation.html`. Toutes sont reliées au footer. Les informations inconnues sont marquées `[À REMPLIR]`.

## 2. Cookies et scripts tiers
- Stockage local `cwt-cart` : panier, strictement fonctionnel.
- Aucun script d’analyse d’audience, publicité ou pixel détecté.
- Google Fonts et Bootstrap sont chargés par CDN : connexions externes, à auto-héberger idéalement.
- FormSubmit reçoit les données seulement lors de l’envoi du formulaire personnalisé.
- Aucun bandeau de consentement ajouté car aucun traceur non essentiel n’a été détecté dans le projet. À réévaluer si Stripe, PayPal, Analytics, Meta Pixel, YouTube intégré, etc. sont ajoutés.

## 3. Vente et rétractation
Page dédiée créée, avec délai de 14 jours, exceptions à vérifier, formulaire type et formulaire de rétractation en ligne. Le panier affiche les liens CGV/rétractation avant la finalisation. Le formulaire en ligne doit être testé sur l’hébergement réel, notamment l’accusé de réception.

## 4. Formulaires
Mention d’information courte ajoutée sous le formulaire personnalisé et sous le formulaire de rétractation. La case de consentement au devis a été supprimée car il ne s’agissait pas d’une newsletter/prospection ; l’information est conservée sous forme de texte.

## 5. Minimisation
Commande personnalisée : type de création, quantité, description, dimensions, couleurs, photo facultative, budget, date souhaitée, pays, précisions, prénom, e-mail. Rétractation : nom, e-mail, référence de commande, date facultative, produits concernés et précision facultative. Le champ `ville` a été supprimé car il n’est pas nécessaire au stade de la demande de devis.

## 6. Accessibilité
Maintien du lien d’évitement, labels de formulaire, alt utiles, boutons au clavier. Ajout de focus visibles sur la galerie et la recherche. Les informations importantes restent en texte HTML. Les couleurs principales vérifiées dans la feuille de style dépassent 4,5:1 sur leurs fonds habituels. Un audit complet page par page reste à faire avant publication finale.

## 7. Conformité locale — informations manquantes
- Pays d’établissement : [À REMPLIR]
- Statut : [À REMPLIR : particulier / micro-entrepreneur / société]
- Identité / raison sociale : [À REMPLIR]
- Adresse professionnelle : [À REMPLIR]
- SIREN/SIRET/RCS/RNE selon le cas : [À REMPLIR]
- TVA selon le cas : [À REMPLIR]
- Téléphone / e-mail professionnel : [À REMPLIR]
- Hébergeur : [À REMPLIR]
- Directeur/responsable de publication : [À REMPLIR]
- Médiateur de la consommation : [À REMPLIR]
- Durées de conservation internes : [À REMPLIR]
- Prestataire de paiement final : [À REMPLIR]
- Pays de clientèle effectivement acceptés : site configuré pour livraison physique en Europe, à confirmer contractuellement.

## Autres changements UX / technique
- Prix entiers affichés sans décimales : `55€`, `49€`, etc.
- Chaque fiche produit est maintenant un vrai fichier HTML `produit-*.html`. `js/catalogue.js` a été supprimé.
- Sur une fiche produit, cliquer sur la grande image passe à la photo suivante ; les miniatures restent utilisables.
- Calculateur vendeur `livraison.html` supprimé. L’estimateur client des frais de port reste disponible sur les fiches peluches.
- Barre de recherche ajoutée sur ordinateur et téléphone ; sur mobile elle reste visible même lorsque le menu hamburger est fermé.
- Section “Trois façons de profiter de l’atelier” redessinée comme trois grands panneaux inspirés de “À adopter, ou à crocheter”, avec numéros ronds, fonds distincts et bords arrondis.
- Responsive renforcé pour petits écrans.
- Les patrons sont désormais décrits comme vendus sur le site et envoyés manuellement par e-mail, pas sur Etsy.

## Tableau de statut
| Exigence | Statut | Reste à faire |
|---|---|---|
| Mentions légales | Partiel | Compléter tous les `[À REMPLIR]` |
| Politique de confidentialité | Partiel | Compléter responsable, durées, transferts et contact |
| CGU | Partiel | Compléter droit applicable / informations vendeur |
| CGV B2C | Partiel | Compléter vendeur, paiement, garanties, médiateur |
| Politique cookies | En place pour la version auditée | Réauditer après ajout paiement/analytics/embeds |
| Bandeau cookies | Non requis dans la version auditée | À ajouter seulement si traceurs non exemptés ajoutés |
| Rétractation / remboursement | Amélioré / partiel | Compléter adresse retours, frais et modalités de remboursement ; tester le formulaire en ligne et son accusé de réception ; finaliser le flux numérique |
| Formulaire / RGPD | Amélioré | Fixer les durées et vérifier FormSubmit |
| Minimisation | Améliorée | Revoir à chaque nouveau champ |
| Accessibilité | Améliorée | Audit automatique + test clavier complet avant publication |
| Paiement | Non finalisé | Connecter un prestataire et mettre à jour CGV/confidentialité/cookies |

Ce document est une aide technique de conformité et ne constitue pas un conseil juridique.

## Références officielles consultées (31 octobre 2026)
- Légifrance — LCEN, article 1-1 : https://www.legifrance.gouv.fr/
- CNIL — cookies et autres traceurs : https://www.cnil.fr/fr/cookies-et-autres-traceurs
- CNIL — information des personnes / RGPD : https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence
- Légifrance — Code de la consommation, article L221-18 : https://www.legifrance.gouv.fr/
- Économie.gouv.fr / DGCCRF — vente à distance, rétractation, CGV et médiation : https://www.economie.gouv.fr/
