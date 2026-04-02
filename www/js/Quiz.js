// Quiz.js - Gestion des quiz interactifs

// État global du quiz
let currentQuiz = null;
let currentQuestionIndex = 0;
let selectedAnswer = null;
let answered = false;
let score = 0;
let quizFinished = false;
let selectedQuestions = []; // Questions sélectionnées pour ce quiz

// Données des quiz par zone
const quizData = {
  1: { // Salles SUD - BTS CIEL Option IR
    zoneName: 'Salles SUD - BTS CIEL IR',
    zoneIcon: '🏫',
    questionsPool: [ // Pool de 20 questions, on en tire 8 aléatoirement
      {
        question: 'Que signifie l\'acronyme CIEL ?',
        answers: ['Cybersécurité, Informatique et réseaux, ELectronique', 'Cours Intensifs En Ligne', 'Communication Internet Et Local', 'Centre d\'Innovation Et Électronique'],
        correctIndex: 0
      },
      {
        question: 'Quel protocole utilise le port 80 par défaut ?',
        answers: ['FTP', 'HTTP', 'HTTPS', 'SSH'],
        correctIndex: 1
      },
      {
        question: 'Quelle est la classe de l\'adresse IP 192.168.1.1 ?',
        answers: ['Classe A', 'Classe B', 'Classe C', 'Classe D'],
        correctIndex: 2
      },
      {
        question: 'Combien de bits contient une adresse IPv4 ?',
        answers: ['16 bits', '32 bits', '64 bits', '128 bits'],
        correctIndex: 1
      },
      {
        question: 'Quel équipement réseau fonctionne au niveau 2 du modèle OSI ?',
        answers: ['Routeur', 'Switch', 'Hub', 'Répéteur'],
        correctIndex: 1
      },
      {
        question: 'Quel protocole permet de traduire une adresse IP en adresse MAC ?',
        answers: ['DHCP', 'DNS', 'ARP', 'ICMP'],
        correctIndex: 2
      },
      {
        question: 'Dans le modèle OSI, combien y a-t-il de couches ?',
        answers: ['5 couches', '6 couches', '7 couches', '8 couches'],
        correctIndex: 2
      },
      {
        question: 'Quel type de câble réseau est utilisé pour connecter deux ordinateurs directement ?',
        answers: ['Câble droit', 'Câble croisé', 'Câble coaxial', 'Câble console'],
        correctIndex: 1
      },
      {
        question: 'Quelle est la plage d\'adresses IP privées de classe A ?',
        answers: ['10.0.0.0 à 10.255.255.255', '172.16.0.0 à 172.31.255.255', '192.168.0.0 à 192.168.255.255', '127.0.0.0 à 127.255.255.255'],
        correctIndex: 0
      },
      {
        question: 'Quel protocole est utilisé pour la résolution de noms de domaine ?',
        answers: ['DHCP', 'DNS', 'FTP', 'SMTP'],
        correctIndex: 1
      },
      {
        question: 'Quel port utilise le protocole SSH par défaut ?',
        answers: ['21', '22', '23', '25'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un VLAN ?',
        answers: ['Virtual Local Area Network', 'Variable Link Access Node', 'Verified Login Access Network', 'Virtual Logical Application Network'],
        correctIndex: 0
      },
      {
        question: 'Quel masque de sous-réseau correspond à un /24 en CIDR ?',
        answers: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
        correctIndex: 2
      },
      {
        question: 'Quel protocole permet d\'attribuer automatiquement des adresses IP ?',
        answers: ['DNS', 'DHCP', 'ARP', 'ICMP'],
        correctIndex: 1
      },
      {
        question: 'Dans une trame Ethernet, quelle est la taille maximale des données (MTU) ?',
        answers: ['1000 octets', '1500 octets', '2000 octets', '2500 octets'],
        correctIndex: 1
      },
      {
        question: 'Quel protocole est utilisé pour tester la connectivité réseau ?',
        answers: ['FTP', 'HTTP', 'ICMP (ping)', 'SMTP'],
        correctIndex: 2
      },
      {
        question: 'Quelle technologie permet de segmenter un réseau physique en plusieurs réseaux logiques ?',
        answers: ['NAT', 'VLAN', 'VPN', 'Proxy'],
        correctIndex: 1
      },
      {
        question: 'Quel est le rôle principal d\'un pare-feu (firewall) ?',
        answers: ['Accélérer la connexion', 'Filtrer le trafic réseau', 'Attribuer des adresses IP', 'Traduire les noms de domaine'],
        correctIndex: 1
      },
      {
        question: 'Combien de bits contient une adresse IPv6 ?',
        answers: ['32 bits', '64 bits', '128 bits', '256 bits'],
        correctIndex: 2
      },
      {
        question: 'Quel protocole sécurisé utilise le port 443 par défaut ?',
        answers: ['HTTP', 'HTTPS', 'FTP', 'SSH'],
        correctIndex: 1
      }
    ]
  },
  2: { // Salles NORD/MELEC - BTS MS
    zoneName: 'Salles NORD/MELEC - BTS MS',
    zoneIcon: '🔬',
    questionsPool: [
      {
        question: 'Que signifie BTS MS ?',
        answers: ['Brevet de Technicien Supérieur Maintenance des Systèmes', 'Brevet de Technicien Supérieur Mécanique et Structures', 'Brevet de Technicien Supérieur Mesures Scientifiques', 'Brevet de Technicien Supérieur Management et Services'],
        correctIndex: 0
      },
      {
        question: 'Quelles sont les trois options du BTS MS ?',
        answers: ['Systèmes de production, Systèmes énergétiques et fluidiques, Systèmes éoliens', 'Informatique, Électronique, Mécanique', 'Automatisme, Robotique, Pneumatique', 'Hydraulique, Électrique, Thermique'],
        correctIndex: 0
      },
      {
        question: 'Qu\'est-ce que la maintenance préventive ?',
        answers: ['Réparer une machine après une panne', 'Effectuer des interventions planifiées avant qu\'une panne survienne', 'Remplacer immédiatement toutes les pièces usées', 'Surveiller une machine à distance uniquement'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce que la maintenance corrective ?',
        answers: ['Planifier des interventions régulières', 'Intervenir après une défaillance pour remettre le système en état', 'Former les opérateurs à l\'utilisation des machines', 'Améliorer les performances d\'un équipement'],
        correctIndex: 1
      },
      {
        question: 'Que signifie GMAO ?',
        answers: ['Gestion de la Maintenance Assistée par Ordinateur', 'Guide de Maintenance des Ateliers et Outillages', 'Gestion des Matériaux et des Approvisionnements Outil', 'Groupe de Maintenance Automatique et Opérationnelle'],
        correctIndex: 0
      },
      {
        question: 'Quel est le rôle d\'un technicien de maintenance en entreprise ?',
        answers: ['Uniquement produire des pièces', 'Assurer le bon fonctionnement des équipements et intervenir en cas de panne', 'Gérer les stocks de produits finis', 'Concevoir de nouveaux équipements industriels'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un système pneumatique ?',
        answers: ['Un système utilisant de l\'eau sous pression', 'Un système utilisant de l\'air comprimé pour transmettre de l\'énergie', 'Un système électrique haute tension', 'Un système de chauffage par convection'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un système hydraulique ?',
        answers: ['Un système utilisant de l\'air pour actionner des vérins', 'Un système utilisant un fluide liquide sous pression pour transmettre de l\'énergie', 'Un système de refroidissement par ventilation', 'Un système de gestion de l\'eau potable'],
        correctIndex: 1
      },
      {
        question: 'Quel appareil permet de mesurer la tension électrique dans un circuit ?',
        answers: ['Un ampèremètre', 'Un ohmmètre', 'Un voltmètre', 'Un wattmètre'],
        correctIndex: 2
      },
      {
        question: 'Que signifie MTBF en maintenance industrielle ?',
        answers: ['Méthode de Travail en Binôme et en Formation', 'Mean Time Between Failures (Temps Moyen Entre Pannes)', 'Maintenance Technique des Bâtiments et Fluides', 'Module de Test des Batteries et Fusibles'],
        correctIndex: 1
      },
      {
        question: 'Quel type de capteur mesure une température ?',
        answers: ['Un capteur inductif', 'Un capteur capacitif', 'Un thermocouple ou une sonde PT100', 'Un capteur photoélectrique'],
        correctIndex: 2
      },
      {
        question: 'Qu\'est-ce qu\'un automate programmable industriel (API) ?',
        answers: ['Un robot entièrement autonome', 'Un système électronique programmable qui contrôle des processus industriels', 'Un logiciel de dessin technique', 'Un capteur de pression industriel'],
        correctIndex: 1
      },
      {
        question: 'Quelle est la tension d\'alimentation standard en France pour les machines industrielles ?',
        answers: ['110V monophasé', '230V monophasé ou 400V triphasé', '48V continu uniquement', '600V triphasé'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un variateur de vitesse ?',
        answers: ['Un appareil qui modifie la fréquence du courant pour faire varier la vitesse d\'un moteur', 'Un frein électromagnétique', 'Un transformateur de courant continu', 'Un contacteur électromécanique'],
        correctIndex: 0
      },
      {
        question: 'Que signifie le terme "consignation" en sécurité industrielle ?',
        answers: ['Stocker des pièces dans un entrepôt', 'Mettre hors énergie une machine et s\'assurer qu\'elle ne peut pas être réalimentée pendant une intervention', 'Rédiger un rapport de panne', 'Vérifier la conformité d\'un équipement'],
        correctIndex: 1
      },
      {
        question: 'Quel document liste toutes les opérations de maintenance à effectuer sur une machine ?',
        answers: ['Le plan de production', 'La gamme de maintenance ou plan de maintenance préventive', 'Le bon de livraison', 'La fiche de poste opérateur'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce que la TPM (Total Productive Maintenance) ?',
        answers: ['Une méthode de maintenance impliquant tous les acteurs de l\'entreprise pour zéro panne et zéro défaut', 'Un logiciel de GMAO américain', 'Un type de maintenance uniquement corrective', 'Une norme européenne sur la sécurité des machines'],
        correctIndex: 0
      },
      {
        question: 'Qu\'est-ce que le MTR en maintenance ?',
        answers: ['Moyen Temps de Réparation', 'Maintenance Totale des Robots', 'Mode de Traitement et Révision', 'Mesure Technique de Résistance'],
        correctIndex: 0
      },
      {
        question: 'Quel document technique décrit le fonctionnement d\'un équipement et ses interventions ?',
        answers: ['Le bon de commande', 'Le logiciel GMAO', 'Le dossier technique ou notice de maintenance', 'Le planning de production'],
        correctIndex: 2
      },
      {
        question: 'Quel est le principal objectif du BTS MS option Systèmes de production ?',
        answers: ['Former des techniciens capables de maintenir des machines de production industrielle', 'Former des ingénieurs en robotique', 'Former des techniciens en informatique uniquement', 'Former des électriciens du bâtiment'],
        correctIndex: 0
      }
    ]
  },
  4: { // Salles BTS PME
    zoneName: 'Salles BTS PME',
    zoneIcon: '🏢',
    questionsPool: [
      {
        question: 'Que signifie PME ?',
        answers: ['Petites et Moyennes Entreprises', 'Projet Management Européen', 'Pédagogie Moderne Éducative', 'Production Mécanique et Électronique'],
        correctIndex: 0
      },
      {
        question: 'Combien d\'années dure la formation BTS PME ?',
        answers: ['1 an', '2 ans', '3 ans', '4 ans'],
        correctIndex: 1
      },
      {
        question: 'Les salles BTS PME sont-elles équipées d\'ordinateurs ?',
        answers: ['Oui, toutes', 'Non', 'Seulement certaines', 'Uniquement des portables'],
        correctIndex: 0
      },
      {
        question: 'Quel type de métiers prépare le BTS PME ?',
        answers: ['Gestion d\'entreprise', 'Médecine', 'Cuisine', 'Architecture'],
        correctIndex: 0
      }
    ]
  },
  6: { // CDI de Saint-Éloi
    zoneName: 'CDI de Saint-Éloi',
    zoneIcon: '📚',
    questionsPool: [
      {
        question: 'Que signifie CDI dans un établissement scolaire ?',
        answers: ['Centre de Documentation et d\'Information', 'Centre de Données Informatiques', 'Centre de Développement et d\'Innovation', 'Centre de Distribution Interne'],
        correctIndex: 0
      },
      {
        question: 'Quel est le rôle principal du CDI dans un lycée ?',
        answers: ['Servir des repas aux élèves', 'Mettre à disposition des ressources documentaires et numériques', 'Organiser les examens', 'Gérer les absences des élèves'],
        correctIndex: 1
      },
      {
        question: 'Qui est le professionnel responsable du CDI ?',
        answers: ['Un professeur principal', 'Un professeur documentaliste', 'Un conseiller d\'orientation', 'Un assistant d\'éducation'],
        correctIndex: 1
      },
      {
        question: 'Quel type de ressources trouve-t-on principalement au CDI ?',
        answers: ['Matériel sportif', 'Livres, magazines, ressources numériques et bases de données', 'Équipements scientifiques', 'Matériel informatique uniquement'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un SIGB utilisé dans un CDI ?',
        answers: ['Système Informatique de Gestion des Bulletins', 'Système Intégré de Gestion de Bibliothèque', 'Service Interne de Gestion des Bases de données', 'Système d\'Information et de Gestion des Budgets'],
        correctIndex: 1
      },
      {
        question: 'Quel est l\'objectif de l\'éducation aux médias dispensée au CDI ?',
        answers: ['Apprendre à réparer des ordinateurs', 'Développer l\'esprit critique face aux informations', 'Apprendre à créer des films', 'Former à la programmation informatique'],
        correctIndex: 1
      },
      {
        question: 'Comment appelle-t-on la classification utilisée dans la plupart des CDI pour organiser les livres ?',
        answers: ['Classification alphabétique', 'Classification Dewey', 'Classification numérique', 'Classification par couleur'],
        correctIndex: 1
      },
      {
        question: 'Quelle activité peut-on pratiquer au CDI en dehors de la lecture ?',
        answers: ['Jouer aux jeux vidéo librement', 'Effectuer des recherches documentaires sur internet', 'Regarder des films récents', 'Pratiquer des sports d\'intérieur'],
        correctIndex: 1
      },
      {
        question: 'Quel type de prêt propose généralement un CDI ?',
        answers: ['Prêt de matériel sportif uniquement', 'Prêt de livres, de magazines et parfois de ressources numériques', 'Prêt d\'ordinateurs portables uniquement', 'Prêt de calculatrices uniquement'],
        correctIndex: 1
      },
      {
        question: 'Le CDI de Saint-Éloi est-il accessible aux élèves pendant les heures de cours ?',
        answers: ['Non, uniquement pendant les pauses', 'Oui, sur demande auprès du professeur', 'Uniquement le mercredi', 'Seulement aux élèves de terminale'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'une base de données documentaire disponible au CDI ?',
        answers: ['Un fichier Excel de notes des élèves', 'Un ensemble structuré de ressources numériques accessibles pour la recherche', 'Un annuaire téléphonique', 'Un planning des cours'],
        correctIndex: 1
      },
      {
        question: 'Quel outil numérique utilise-t-on souvent au CDI pour faire des recherches ?',
        answers: ['Un magnétoscope', 'Un moteur de recherche ou une base de données en ligne', 'Un téléphone fixe', 'Une machine à écrire'],
        correctIndex: 1
      },
      {
        question: 'Comment s\'appelle le catalogue informatisé permettant de chercher un livre au CDI ?',
        answers: ['OPAC (Online Public Access Catalog)', 'GPS (Guide de Prêt Scolaire)', 'BNF (Bibliothèque Numérique de France)', 'ENT (Espace Numérique de Travail)'],
        correctIndex: 0
      },
      {
        question: 'Quel est le rôle de l\'éducation à l\'information (EMI) dispensée au CDI ?',
        answers: ['Apprendre à jouer d\'un instrument de musique', 'Former les élèves à rechercher, analyser et utiliser l\'information de manière responsable', 'Enseigner les mathématiques', 'Préparer aux examens de sport'],
        correctIndex: 1
      },
      {
        question: 'Quel type d\'espace trouve-t-on souvent dans un CDI moderne ?',
        answers: ['Un gymnase', 'Un espace de travail collaboratif avec ordinateurs et zone de lecture', 'Une cuisine pédagogique', 'Un laboratoire de chimie'],
        correctIndex: 1
      }
    ]
  },
  8: { // Salles BAC Pro CIEL & MELEC - 2 pools séparés
    zoneName: 'Salles BAC Pro CIEL & MELEC',
    zoneIcon: '💻',
    // Pool dédié BAC Pro CIEL (10 questions)
    questionsPoolCIEL: [
      {
        question: 'Que prépare le BAC Pro CIEL option A ?',
        answers: ['Cybersécurité, Informatique et réseaux', 'Électronique et communication', 'Maintenance industrielle', 'Automatismes et robotique'],
        correctIndex: 0
      },
      {
        question: 'Quel langage de programmation est souvent utilisé en BAC Pro CIEL ?',
        answers: ['Latin', 'Python ou C', 'Espagnol', 'HTML uniquement'],
        correctIndex: 1
      },
      {
        question: 'En BAC Pro CIEL, qu\'est-ce qu\'un réseau local (LAN) ?',
        answers: ['Un réseau téléphonique national', 'Un réseau informatique reliant des équipements dans une zone géographique limitée', 'Un réseau de transport en commun', 'Un réseau de distribution électrique'],
        correctIndex: 1
      },
      {
        question: 'En BAC Pro CIEL, qu\'est-ce qu\'une adresse MAC ?',
        answers: ['L\'adresse d\'un magasin Apple', 'Un identifiant unique attribué à une carte réseau', 'Un type de câble réseau', 'Un protocole de sécurité WiFi'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un câble VDI utilisé en BAC Pro CIEL ?',
        answers: ['Un câble Voix Données Images pour les réseaux informatiques et téléphoniques', 'Un câble haute tension industrielle', 'Un câble de recharge de véhicule électrique', 'Un câble d\'antenne TV'],
        correctIndex: 0
      },
      {
        question: 'En BAC Pro CIEL, que permet de faire un switch réseau ?',
        answers: ['Allumer et éteindre les ordinateurs à distance', 'Connecter plusieurs équipements sur un réseau local et gérer les communications entre eux', 'Bloquer l\'accès à internet', 'Convertir le WiFi en câble Ethernet'],
        correctIndex: 1
      },
      {
        question: 'En BAC Pro CIEL, qu\'est-ce qu\'un protocole de communication ?',
        answers: ['Une règle de politesse dans les réunions', 'Un ensemble de règles qui définissent comment les équipements échangent des données', 'Un document administratif de l\'école', 'Un logiciel antivirus'],
        correctIndex: 1
      },
      {
        question: 'Quel outil utilise-t-on principalement pour programmer en BAC Pro CIEL ?',
        answers: ['Un marteau', 'Un IDE comme Visual Studio Code ou PyCharm', 'Un oscilloscope uniquement', 'Un multimètre'],
        correctIndex: 1
      },
      {
        question: 'En BAC Pro CIEL, quel appareil permet de connecter un réseau local à internet ?',
        answers: ['Un hub', 'Un routeur', 'Un répéteur', 'Un pont réseau'],
        correctIndex: 1
      },
      {
        question: 'Après un BAC Pro CIEL, quelle poursuite d\'études est la plus adaptée ?',
        answers: ['Uniquement entrer dans la vie active', 'Préparer un BTS CIEL ou d\'autres BTS du secteur numérique', 'S\'inscrire en médecine uniquement', 'Passer directement un Master'],
        correctIndex: 1
      }
    ],
    // Pool dédié BAC Pro MELEC (10 questions)
    questionsPoolMELEC: [
      {
        question: 'Que signifie MELEC dans le BAC Pro ?',
        answers: ['Métiers de l\'Électricité et de ses Environnements Connectés', 'Mécanique Électrique et Connections', 'Maintenance des Équipements Locaux Et Connectés', 'Modules Électriques Liés aux Environnements Connectés'],
        correctIndex: 0
      },
      {
        question: 'Quel type de travaux pratiques réalise-t-on en BAC Pro MELEC ?',
        answers: ['Programmation de sites web', 'Câblage électrique, installation de tableaux et domotique', 'Réparation de voitures', 'Conception de meubles en bois'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'un tableau électrique basse tension (BT) en MELEC ?',
        answers: ['Un tableau blanc pour écrire', 'Un coffret regroupant les protections et disjoncteurs d\'une installation électrique', 'Un écran de contrôle industriel', 'Un panneau de signalisation'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce que la domotique abordée en BAC Pro MELEC ?',
        answers: ['La gestion automatisée des équipements d\'une maison (éclairage, chauffage, sécurité)', 'La fabrication de robots industriels', 'La programmation de sites internet', 'La maintenance des avions'],
        correctIndex: 0
      },
      {
        question: 'Quel appareil de mesure est indispensable en BAC Pro MELEC pour vérifier une installation ?',
        answers: ['Un thermomètre', 'Un multimètre (voltmètre, ampèremètre, ohmmètre)', 'Un chronomètre', 'Un microscope'],
        correctIndex: 1
      },
      {
        question: 'Que signifie NFC 15-100 en électricité ?',
        answers: ['Un type de connexion sans fil', 'La norme française régissant les installations électriques dans les bâtiments', 'Un protocole réseau informatique', 'Un calibre de câble électrique'],
        correctIndex: 1
      },
      {
        question: 'Quel est le rôle d\'un disjoncteur différentiel en installation électrique MELEC ?',
        answers: ['Augmenter la puissance électrique', 'Protéger les personnes contre les électrocutions et les installations contre les courts-circuits', 'Mesurer la consommation électrique', 'Transformer le courant alternatif en courant continu'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce que le courant alternatif (AC) utilisé dans les installations MELEC ?',
        answers: ['Un courant qui circule toujours dans le même sens', 'Un courant dont le sens change périodiquement (50 Hz en France)', 'Un courant produit uniquement par les panneaux solaires', 'Un courant de très basse tension'],
        correctIndex: 1
      },
      {
        question: 'Quel est l\'objectif principal du BAC Pro MELEC en matière d\'emploi ?',
        answers: ['Devenir programmeur informatique', 'Travailler comme électricien dans le bâtiment, l\'industrie ou les smart buildings', 'Devenir cuisinier', 'Travailler dans la grande distribution'],
        correctIndex: 1
      },
      {
        question: 'Quelle est la durée totale des périodes de formation en entreprise (PFMP) en BAC Pro MELEC ?',
        answers: ['4 semaines', '8 semaines', '22 semaines minimum', '52 semaines'],
        correctIndex: 2
      }
    ]
  },
  9: { // Théâtre
    zoneName: 'Théâtre',
    zoneIcon: '🎭',
    questionsPool: [
      {
        question: 'Combien de places a le théâtre du lycée ?',
        answers: ['50 places', '100 places', '200 places', '300 places'],
        correctIndex: 2
      },
      {
        question: 'Le théâtre est-il utilisé uniquement par le lycée ?',
        answers: ['Oui', 'Non, il accueille aussi des événements externes', 'Seulement pour les examens', 'Fermé au public'],
        correctIndex: 1
      },
      {
        question: 'Quand a été construit le théâtre ?',
        answers: ['1990', '2000', '2010', '2020'],
        correctIndex: 1
      }
    ]
  },
  10: { // Internat
    zoneName: 'Internat',
    zoneIcon: '🛏️',
    questionsPool: [
      {
        question: 'L\'internat peut accueillir combien d\'élèves ?',
        answers: ['50 élèves', '100 élèves', '150 élèves', '200 élèves'],
        correctIndex: 2
      },
      {
        question: 'Les chambres de l\'internat sont-elles individuelles ?',
        answers: ['Oui, toutes', 'Non, toutes partagées', 'Mixte (individuelles et partagées)', 'Selon les niveaux'],
        correctIndex: 1
      },
      {
        question: 'Quels sont les horaires de fermeture de l\'internat le soir ?',
        answers: ['20h', '21h', '22h', '23h'],
        correctIndex: 2
      },
      {
        question: 'Quel service est proposé aux élèves internes pour leurs repas ?',
        answers: ['Ils doivent cuisiner eux-mêmes', 'Un service de restauration est inclus', 'Ils commandent des repas livrés', 'Il n\'y a pas de service repas'],
        correctIndex: 1
      },
      {
        question: 'L\'internat dispose-t-il d\'une connexion internet pour les élèves ?',
        answers: ['Non, aucune connexion', 'Oui, une connexion WiFi est disponible', 'Seulement dans les couloirs', 'Uniquement le week-end'],
        correctIndex: 1
      },
      {
        question: 'Quel est l\'avantage principal de l\'internat pour un élève éloigné du lycée ?',
        answers: ['Éviter de faire ses devoirs', 'Bénéficier d\'un hébergement sécurisé proche du lycée', 'Ne pas aller en cours', 'Avoir plus de temps libre'],
        correctIndex: 1
      },
      {
        question: 'Qui supervise et encadre les élèves à l\'internat ?',
        answers: ['Les professeurs principaux uniquement', 'Des maîtres d\'internat (MI) ou conseillers principaux d\'éducation', 'Les élèves eux-mêmes', 'La direction uniquement'],
        correctIndex: 1
      },
      {
        question: 'L\'internat du lycée Saint-Éloi accueille-t-il des élèves de tous les niveaux ?',
        answers: ['Non, uniquement les terminales', 'Oui, des élèves de différentes formations', 'Non, uniquement les BTS', 'Uniquement les premières années'],
        correctIndex: 1
      },
      {
        question: 'Quel équipement trouve-t-on généralement dans une chambre d\'internat ?',
        answers: ['Une télévision personnelle et un réfrigérateur', 'Un lit, un bureau et un espace de rangement', 'Une cuisine équipée', 'Un canapé et une salle de bain privative'],
        correctIndex: 1
      },
      {
        question: 'Peut-on rentrer chez soi le week-end quand on est interne ?',
        answers: ['Non, on reste obligatoirement à l\'internat', 'Oui, l\'internat ferme généralement le week-end', 'Seulement un week-end sur deux', 'Uniquement pendant les vacances scolaires'],
        correctIndex: 1
      },
      {
        question: 'Qu\'est-ce qu\'une heure d\'étude surveillée à l\'internat ?',
        answers: ['Un cours supplémentaire payant', 'Un temps dédié au travail personnel encadré par un adulte', 'Une activité sportive obligatoire', 'Une réunion avec les parents'],
        correctIndex: 1
      },
      {
        question: 'Quel document est nécessaire pour s\'inscrire à l\'internat ?',
        answers: ['Un passeport uniquement', 'Un dossier d\'inscription avec justificatif de domicile et éloignement', 'Uniquement les bulletins scolaires', 'Aucun document, inscription libre'],
        correctIndex: 1
      }
    ]
  }
};

// Fonction pour mélanger un tableau (algorithme Fisher-Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fonction pour sélectionner N questions aléatoires
function selectRandomQuestions(questionsPool, count) {
  const shuffled = shuffleArray(questionsPool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Fonction pour mélanger les réponses d'une question
function shuffleAnswers(question) {
  const answers = question.answers.map((answer, index) => ({
    text: answer,
    originalIndex: index
  }));

  const shuffled = shuffleArray(answers);

  return {
    question: question.question,
    answers: shuffled.map(a => a.text),
    correctIndex: shuffled.findIndex(a => a.originalIndex === question.correctIndex)
  };
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si on vient d'une zone spécifique
  const urlParams = new URLSearchParams(window.location.search);
  const zoneId = urlParams.get('zone');

  if (zoneId) {
    startQuiz(parseInt(zoneId));
  } else {
    // Afficher la sélection des zones
    displayZoneSelection();
  }
});

// Afficher la sélection des zones
function displayZoneSelection() {
  const zonesGrid = document.getElementById('zones-grid');
  zonesGrid.innerHTML = '';

  // Créer une carte pour chaque zone
  Object.keys(quizData).forEach(zoneId => {
    const zone = quizData[zoneId];
    const randomZones = ['1', '2', '6', '10'];
    // Zone 8 : toujours 8 questions (4 CIEL + 4 MELEC)
    let questionCount;
    if (zoneId === '8') {
      questionCount = 8;
    } else if (randomZones.includes(zoneId)) {
      questionCount = 8;
    } else {
      questionCount = zone.questionsPool ? zone.questionsPool.length : 8;
    }

    const zoneCard = document.createElement('div');
    zoneCard.className = 'zone-card';
    zoneCard.onclick = () => startQuiz(parseInt(zoneId));

    zoneCard.innerHTML = `
      <div class="zone-icon">${zone.zoneIcon}</div>
      <div class="zone-badge">${questionCount}Q</div>
      <h3 class="zone-name">${zone.zoneName}</h3>
      <p class="zone-description">Testez vos connaissances</p>
      <div class="zone-stats">
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          <span>${questionCount} questions</span>
        </div>
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>~${questionCount} min</span>
        </div>
      </div>
      <button class="start-btn">
        Commencer
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    `;

    zonesGrid.appendChild(zoneCard);
  });
}

// Démarrer un quiz
function startQuiz(zoneId) {
  const zoneData = quizData[zoneId];

  if (!zoneData) {
    alert('❌ Quiz non disponible');
    return;
  }

  // Cas spécial zone 8 : 4 questions CIEL + 4 questions MELEC
  if (zoneId === 8) {
    const cielQuestions = selectRandomQuestions(zoneData.questionsPoolCIEL, 4);
    const melecQuestions = selectRandomQuestions(zoneData.questionsPoolMELEC, 4);
    selectedQuestions = shuffleArray([...cielQuestions, ...melecQuestions]);
  } else {
    // Zones avec 8 questions aléatoires
    const randomZones = [1, 2, 6, 10];
    if (randomZones.includes(zoneId)) {
      selectedQuestions = selectRandomQuestions(zoneData.questionsPool, 8);
    } else {
      selectedQuestions = [...zoneData.questionsPool];
    }
    selectedQuestions = shuffleArray(selectedQuestions);
  }

  // Mélanger les réponses de chaque question
  selectedQuestions = selectedQuestions.map(q => shuffleAnswers(q));

  currentQuiz = {
    zoneName: zoneData.zoneName,
    zoneIcon: zoneData.zoneIcon,
    questions: selectedQuestions
  };

  // Réinitialiser l'état
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer = null;
  answered = false;
  quizFinished = false;

  // Cacher sélection, afficher quiz
  document.getElementById('zone-selection').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('results-section').style.display = 'none';

  // Mettre à jour l'en-tête
  document.getElementById('quiz-zone-name').textContent = currentQuiz.zoneName;
  document.getElementById('current-score').textContent = score;
  document.getElementById('total-questions').textContent = currentQuiz.questions.length;

  // Afficher la première question
  displayQuestion();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Afficher une question
function displayQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];

  // Mettre à jour le numéro de question
  document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1}`;
  document.getElementById('question-title').textContent = question.question;

  // Mettre à jour la barre de progression
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  document.getElementById('progress-fill').style.width = progress + '%';
  document.getElementById('progress-text').textContent = `Question ${currentQuestionIndex + 1} sur ${currentQuiz.questions.length}`;

  // Créer les réponses
  const answersList = document.getElementById('answers-list');
  answersList.innerHTML = '';

  question.answers.forEach((answer, index) => {
    const answerBtn = document.createElement('button');
    answerBtn.className = 'answer-option';
    answerBtn.onclick = () => selectAnswer(index);

    answerBtn.innerHTML = `
      <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
      <span class="answer-text">${answer}</span>
      <span class="answer-icon"></span>
    `;

    answersList.appendChild(answerBtn);
  });

  // Cacher le feedback
  document.getElementById('feedback-section').style.display = 'none';

  // Réinitialiser l'état
  selectedAnswer = null;
  answered = false;
}

// Sélectionner une réponse
function selectAnswer(index) {
  if (answered) return;

  selectedAnswer = index;
  answered = true;

  const question = currentQuiz.questions[currentQuestionIndex];
  const answerButtons = document.querySelectorAll('.answer-option');

  // Désactiver tous les boutons
  answerButtons.forEach(btn => btn.disabled = true);

  // Marquer la réponse sélectionnée
  answerButtons[index].classList.add('selected');

  // Afficher correct/incorrect
  if (index === question.correctIndex) {
    score++;
    document.getElementById('current-score').textContent = score;
    answerButtons[index].classList.add('correct');
    answerButtons[index].querySelector('.answer-icon').textContent = '✓';

    // Afficher feedback succès
    showFeedback(true, question.answers[question.correctIndex]);
  } else {
    answerButtons[index].classList.add('incorrect');
    answerButtons[index].querySelector('.answer-icon').textContent = '✗';
    answerButtons[question.correctIndex].classList.add('correct');
    answerButtons[question.correctIndex].querySelector('.answer-icon').textContent = '✓';

    // Afficher feedback erreur
    showFeedback(false, question.answers[question.correctIndex]);
  }
}

// Afficher le feedback
function showFeedback(isCorrect, correctAnswer) {
  const feedbackSection = document.getElementById('feedback-section');
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

  feedbackSection.innerHTML = `
    <div class="feedback ${isCorrect ? 'success' : 'error'}">
      <div class="feedback-icon">${isCorrect ? '🎉' : '💡'}</div>
      <div class="feedback-content">
        <h4>${isCorrect ? 'Excellent !' : 'Pas tout à fait'}</h4>
        <p>${isCorrect ? 'C\'est la bonne réponse' : 'La bonne réponse était : <strong>' + correctAnswer + '</strong>'}</p>
      </div>
    </div>

    <button onclick="nextQuestion()" class="next-button">
      <span>${isLastQuestion ? 'Voir les résultats' : 'Question suivante'}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  `;

  feedbackSection.style.display = 'block';
}

// Question suivante
function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    showResults();
  }
}

// Afficher les résultats
function showResults() {
  quizFinished = true;

  // Cacher quiz, afficher résultats
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('results-section').style.display = 'block';

  const scorePercentage = Math.round((score / currentQuiz.questions.length) * 100);

  // Icône selon le score
  let icon = '💪';
  if (scorePercentage >= 70) icon = '🏆';
  else if (scorePercentage >= 50) icon = '👏';

  document.getElementById('results-icon').textContent = icon;

  // Score
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-total').textContent = '/' + currentQuiz.questions.length;
  document.getElementById('score-percentage').textContent = scorePercentage + '%';

  // Animation du cercle
  const circumference = 565.48;
  const offset = circumference - (circumference * scorePercentage / 100);
  document.getElementById('score-circle').style.strokeDashoffset = offset;

  // Message selon le score
  let messageHTML = '';
  if (scorePercentage >= 70) {
    messageHTML = '<p class="message excellent">🌟 <strong>Excellent !</strong> Vous maîtrisez parfaitement cette zone !</p>';
  } else if (scorePercentage >= 50) {
    messageHTML = '<p class="message good">👍 <strong>Bien joué !</strong> Vous avez de bonnes connaissances sur cette zone.</p>';
  } else {
    messageHTML = '<p class="message improve">💪 <strong>Continuez !</strong> Explorez davantage cette zone pour progresser.</p>';
  }

  document.getElementById('results-message').innerHTML = messageHTML;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Recommencer le quiz
function retryQuiz() {
  // Relancer le quiz avec de nouvelles questions aléatoires
  const urlParams = new URLSearchParams(window.location.search);
  const zoneId = urlParams.get('zone');

  if (zoneId) {
    startQuiz(parseInt(zoneId));
  } else {
    // Si pas de zone dans l'URL, utiliser la zone actuelle
    const currentZoneId = Object.keys(quizData).find(id => quizData[id].zoneName === currentQuiz.zoneName);
    if (currentZoneId) {
      startQuiz(parseInt(currentZoneId));
    }
  }
}

// Retour à la sélection
function backToSelection() {
  currentQuiz = null;
  quizFinished = false;
  selectedQuestions = [];

  document.getElementById('results-section').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('zone-selection').style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
