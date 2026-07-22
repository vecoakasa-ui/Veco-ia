-- Autoriser tout le monde (même les visiteurs non connectés) à lire le profil des propriétaires
-- Ceci est nécessaire pour afficher l'e-mail du propriétaire sur la page d'exploration publique.

CREATE POLICY "Anyone can view owner profiles"
  ON profiles FOR SELECT
  USING (role = 'owner');
