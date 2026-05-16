-- Shadow Fitness System — Schema PostgreSQL 17 (Neon)
-- Utilisateur unique : user_id TEXT = 'anne-lise' (pas d'auth externe)

CREATE TABLE IF NOT EXISTS profil_chasseur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  prenom TEXT NOT NULL DEFAULT 'Anne-Lise',
  grade_actuel TEXT NOT NULL DEFAULT 'E',
  xp_total INTEGER NOT NULL DEFAULT 0,
  streak_actuel INTEGER NOT NULL DEFAULT 0,
  streak_record INTEGER NOT NULL DEFAULT 0,
  heure_rappel_quotidien TIME DEFAULT '19:00',
  sons_actifs BOOLEAN DEFAULT true,
  notifs_repas_actives BOOLEAN DEFAULT true,
  notifs_eau_actives BOOLEAN DEFAULT true,
  phase_entrainement INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  xp_gagne INTEGER DEFAULT 0,
  completion_pct NUMERIC(5,2) DEFAULT 0,
  quete_urgente BOOLEAN DEFAULT false,
  statut TEXT DEFAULT 'en_cours',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);

CREATE TABLE IF NOT EXISTS exercice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  type_exercice TEXT NOT NULL,
  reps_objectif INTEGER,
  reps_realise INTEGER,
  distance_objectif NUMERIC(6,2),
  distance_realise NUMERIC(6,2),
  duree_secondes INTEGER,
  niveau_exercice INTEGER,
  douleur BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS douleurs_historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  exercice TEXT NOT NULL,
  intensite INTEGER
);

CREATE TABLE IF NOT EXISTS quetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  statut TEXT DEFAULT 'en_cours',
  description TEXT,
  xp_recompense INTEGER DEFAULT 100,
  expire_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progression_exercice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type_exercice TEXT NOT NULL,
  niveau_actuel INTEGER DEFAULT 1,
  date_derniere_progression DATE,
  UNIQUE(user_id, type_exercice)
);

CREATE TABLE IF NOT EXISTS jours_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  date DATE NOT NULL,
  motif TEXT
);

CREATE TABLE IF NOT EXISTS jour_repos_course_semaine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  semaine_iso TEXT NOT NULL,
  jour_repos DATE,
  jour_reduit DATE,
  UNIQUE(user_id, semaine_iso)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strava_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  athlete_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS strava_activites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  strava_id BIGINT UNIQUE NOT NULL,
  date DATE NOT NULL,
  distance_m NUMERIC(10,2),
  duree_secondes INTEGER,
  allure_moyenne NUMERIC(6,2),
  type_activite TEXT,
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  repas_type TEXT NOT NULL,
  statut TEXT DEFAULT 'pas_fait',
  verres_eau INTEGER DEFAULT 0,
  UNIQUE(user_id, date, repas_type)
);

CREATE TABLE IF NOT EXISTS plan_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  semaine_iso TEXT NOT NULL,
  jour INTEGER NOT NULL,
  repas_type TEXT NOT NULL,
  recette_id UUID
);

CREATE TABLE IF NOT EXISTS recettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  temps_preparation INTEGER,
  ingredients JSONB NOT NULL DEFAULT '[]',
  etapes JSONB NOT NULL DEFAULT '[]',
  calories_approx INTEGER,
  proteines_approx NUMERIC(5,2),
  glucides_approx NUMERIC(5,2),
  lipides_approx NUMERIC(5,2),
  sans_lactose BOOLEAN DEFAULT true,
  sans_saumon BOOLEAN DEFAULT true,
  type_repas TEXT
);

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE quetes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
INSERT INTO profil_chasseur (user_id, prenom) VALUES ('anne-lise', 'Anne-Lise')
ON CONFLICT (user_id) DO NOTHING;

-- Seed jours de repos fixes (globaux, sans user_id)
INSERT INTO jours_repos (date, motif) VALUES
  ('2026-06-13', 'Jour off programmé'),
  ('2026-06-20', 'Jour off programmé'),
  ('2026-06-21', 'Jour off programmé')
ON CONFLICT DO NOTHING;

-- Seed recettes sans lactose, sans saumon, sans œuf brouillé, quinoa, brocoli
INSERT INTO recettes (nom, temps_preparation, ingredients, etapes, calories_approx, proteines_approx, glucides_approx, lipides_approx, sans_lactose, sans_saumon, type_repas) VALUES
('Pancakes banane sans lait', 15,
 '["1 banane mûre","100g farine complète","1 œuf","100ml lait d''avoine","1 pincée sel","1 c.à.c levure"]',
 '["Écraser la banane à la fourchette","Mélanger banane, œuf, lait d''avoine, farine, sel, levure","Faire cuire des petites crêpes épaisses dans une poêle légèrement huilée 2-3 min par face","Servir avec 2 œufs au plat"]',
 480, 22, 65, 12, true, true, 'petit_dejeuner'),

('Flocons avoine lait d''avoine banane', 10,
 '["80g flocons d''avoine","250ml lait d''avoine","1 banane","1 c.à.s beurre d''amande","2 œufs"]',
 '["Faire chauffer le lait d''avoine avec les flocons 5 min en remuant","Couper la banane en rondelles","Disposer sur les flocons avec le beurre d''amande","Faire cuire 2 œufs à la coque 6 min"]',
 520, 24, 68, 14, true, true, 'petit_dejeuner'),

('Pain complet beurre amande', 5,
 '["2 tranches pain complet","2 c.à.s beurre d''amande","1 pomme ou banane","2 œufs"]',
 '["Toaster le pain","Étaler généreusement le beurre d''amande","Accompagner d''un fruit frais","Faire cuire 2 œufs au plat"]',
 460, 20, 52, 18, true, true, 'petit_dejeuner'),

('Riz poulet grillé légumes rôtis', 25,
 '["150g riz complet","180g filet de poulet","1 courgette","1 poivron rouge","1 oignon","2 c.à.s huile olive","sel, poivre, herbes de Provence"]',
 '["Cuire le riz selon les instructions","Couper les légumes en morceaux et les rôtir au four 200°C 20 min avec huile et herbes","Griller le poulet à la poêle 6-7 min par face","Assembler dans la boîte"]',
 550, 42, 58, 12, true, true, 'dejeuner'),

('Pâtes complètes thon tomates', 20,
 '["150g pâtes complètes","1 boîte thon au naturel (140g)","250g tomates cerises","1 c.à.s huile olive","basilic frais","sel, poivre"]',
 '["Cuire les pâtes al dente","Égoutter le thon","Couper les tomates en deux","Mélanger pâtes, thon, tomates, huile, basilic"]',
 490, 38, 55, 11, true, true, 'dejeuner'),

('Lentilles légumes viande blanche', 30,
 '["150g lentilles vertes","180g blanc de dinde","1 carotte","1 branche céleri","1 oignon","2 gousses ail","bouquet garni","sel, poivre"]',
 '["Cuire les lentilles avec le bouquet garni 20 min","Faire revenir la dinde coupée en dés avec oignon et ail","Ajouter carotte et céleri","Mélanger lentilles et viande assaisonnés"]',
 520, 46, 52, 8, true, true, 'dejeuner'),

('Riz bœuf haché courgettes', 25,
 '["150g riz","180g bœuf haché 5%","2 courgettes","1 oignon","2 gousses ail","2 c.à.s sauce soja","sel, poivre"]',
 '["Cuire le riz","Faire revenir l''oignon et l''ail","Ajouter le bœuf haché et cuire 8 min","Ajouter les courgettes coupées en dés 5 min","Assaisonner sauce soja"]',
 540, 40, 58, 14, true, true, 'dejeuner'),

('Riz œufs durs salade composée', 20,
 '["150g riz","4 œufs","100g salade verte","1 tomate","50g maïs","1 c.à.s huile olive","1 c.à.c moutarde","vinaigre"]',
 '["Cuire le riz et laisser refroidir","Faire cuire les œufs durs 10 min","Préparer une vinaigrette moutarde-huile-vinaigre","Composer la salade avec tous les éléments"]',
 480, 28, 60, 14, true, true, 'dejeuner'),

('Banane amandes', 2,
 '["1 banane","30g amandes"]',
 '["Peler la banane","Servir avec les amandes"]',
 210, 6, 28, 10, true, true, 'collation'),

('Pain complet beurre amande collation', 5,
 '["2 tranches pain complet","2 c.à.s beurre d''amande"]',
 '["Toaster le pain","Étaler le beurre d''amande"]',
 290, 10, 34, 12, true, true, 'collation'),

('Barre céréales avoine miel', 15,
 '["100g flocons d''avoine","2 c.à.s miel","30g amandes concassées","30g raisins secs","2 c.à.s huile de coco"]',
 '["Mélanger tous les ingrédients","Étaler sur plaque recouverte papier cuisson","Cuire au four 160°C 20 min","Laisser refroidir et couper en barres","Se conserve 1 semaine"]',
 180, 5, 26, 7, true, true, 'collation'),

('Riz poisson blanc haricots verts', 25,
 '["150g riz","200g cabillaud ou lieu noir","200g haricots verts surgelés","1 citron","1 c.à.s huile olive","herbes fraîches","sel, poivre"]',
 '["Cuire le riz","Cuire les haricots verts 5 min eau bouillante","Poêler le poisson avec huile et herbes 4-5 min par face","Assaisonner de jus de citron","Assembler dans l''assiette"]',
 480, 44, 52, 8, true, true, 'diner'),

('Patate douce poulet épinards', 30,
 '["1 grosse patate douce (300g)","200g filet de poulet","200g épinards frais","2 gousses ail","1 c.à.s huile olive","cumin, paprika, sel"]',
 '["Cuire la patate douce au four 200°C 30 min ou micro-ondes 8 min","Faire revenir l''ail dans l''huile","Ajouter le poulet en lamelles et cuire 8 min","Ajouter les épinards et laisser tomber 2 min","Assaisonner avec épices"]',
 520, 46, 48, 10, true, true, 'diner'),

('Pâtes complètes bœuf haché légumes', 25,
 '["150g pâtes complètes","200g bœuf haché 5%","1 courgette","1 tomate","1 oignon","2 gousses ail","basilic","sel, poivre"]',
 '["Cuire les pâtes","Faire revenir oignon et ail","Ajouter le bœuf haché 8 min","Ajouter courgette en dés et tomate","Cuire 5 min","Mélanger avec les pâtes"]',
 580, 44, 60, 14, true, true, 'diner'),

('Omelette légumes pain complet', 15,
 '["4 œufs","1 poivron rouge","1 oignon","100g champignons","1 c.à.s huile olive","2 tranches pain complet","sel, poivre, herbes"]',
 '["Faire revenir les légumes coupés en dés 5 min","Battre les œufs avec sel, poivre et herbes","Verser sur les légumes","Cuire à feu moyen jusqu''à prise","Servir avec le pain complet toasté"]',
 520, 36, 38, 20, true, true, 'diner'),

('Riz crevettes légumes wok', 20,
 '["150g riz","250g crevettes décortiquées","1 poivron","100g pois mange-tout","2 c.à.s sauce soja","1 c.à.s huile sésame","gingembre frais","ail"]',
 '["Cuire le riz","Faire chauffer l''huile de sésame dans un wok","Faire revenir ail et gingembre 1 min","Ajouter les crevettes 3 min","Ajouter les légumes 3 min","Assaisonner sauce soja","Servir sur le riz"]',
 490, 40, 56, 10, true, true, 'diner')
ON CONFLICT DO NOTHING;
