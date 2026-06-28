# Guide de Gestion Financière - Veco IA

Ce guide explique en détail le fonctionnement du système de paiements, des cautions et des reversements au sein de l'application Veco IA.

## 1. Architecture du Système de Paiement (PayDunya)
L'application utilise une architecture centralisée avec **PayDunya**.
* **Le Compte Maître :** Le logiciel est connecté uniquement à votre compte PayDunya principal (compte Super Admin).
* **Sécurité :** Les agents immobiliers ou propriétaires n'ont pas besoin de fournir de compte bancaire ou Mobile Money au système. Tout est centralisé sur votre compte pour éviter les fraudes et faciliter votre contrôle.

## 2. Le Paiement des Loyers par le Locataire
Lorsqu'un locataire doit payer son loyer, le processus est automatisé :
1. Le locataire reçoit une notification ou se connecte à son espace.
2. Il clique sur **"Payer mon loyer"**.
3. Le système génère une facture numérique et le redirige vers le portail sécurisé PayDunya.
4. Le locataire paie avec le moyen de son choix (Orange Money, MTN, Moov, Wave, Carte Bancaire).
5. Une fois le paiement validé, PayDunya informe instantanément l'application.
6. L'application marque le loyer comme **"Payé"**, met à jour la comptabilité et génère une quittance.

## 3. La Gestion de la Caution
La caution fonctionne exactement comme un loyer, mais elle a un statut comptable différent.
* **A l'entrée du locataire :** Le locataire paie la caution. L'argent arrive sur votre compte central PayDunya et y est conservé en toute sécurité.
* **A la sortie du locataire :** Lors de l'état des lieux de sortie, le logiciel calcule s'il y a des retenues à faire (loyers impayés, frais de remise en état).
* **Le Remboursement :** C'est à vous (le Super Admin) de valider et de transférer manuellement la somme restante au locataire (ou au propriétaire en cas de retenue).

## 4. Le Reversement aux Propriétaires (Payouts)
Une fois les loyers collectés sur votre compte central, vous devez reverser l'argent aux propriétaires respectifs. 
Actuellement, pour vous garantir le contrôle total de la trésorerie, **ce processus est manuel** :
1. **Calcul Automatique :** Le tableau de bord "Comptabilité" vous affiche exactement la somme collectée par propriétaire.
2. **Déduction de Commission :** Le système déduit automatiquement votre commission (ex: 10% d'utilisation du logiciel). Le chiffre affiché est le montant net à reverser.
3. **Le Transfert :** Vous utilisez votre téléphone ou l'interface PayDunya pour faire le virement du montant net au propriétaire.
4. **Validation :** Dans le logiciel Veco IA, vous marquez ce montant comme "Reversé" pour clôturer les comptes du mois.

*Note : Une automatisation complète des reversements (via l'API Disbursement de PayDunya) pourra être activée ultérieurement, lorsque votre volume de transaction sera très élevé.*
