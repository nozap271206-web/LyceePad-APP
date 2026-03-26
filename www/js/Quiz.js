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
  2: { // Salles NORD/MELEC
    zoneName: 'Salles NORD/MELEC',
    zoneIcon: '🔬',
    questionsPool: [
      {
        question: 'Que signifie MELEC ?',
        answers: ['Métiers de l\'Électricité', 'Mécanique Électrique', 'Maintenance Électronique', 'Menuiserie Électrique'],
        correctIndex: 0
      },
      {
        question: 'Quel type d\'ateliers trouve-t-on dans cette zone ?',
        answers: ['Ateliers électricité', 'Ateliers cuisine', 'Ateliers menuiserie', 'Ateliers peinture'],
        correctIndex: 0
      },
      {
        question: 'Les salles NORD sont-elles accessibles aux visiteurs ?',
        answers: ['Oui, librement', 'Non, jamais', 'Oui, avec accompagnement', 'Uniquement les jours portes ouvertes'],
        correctIndex: 2
      },
      {
        question: 'Combien d\'élèves peuvent être accueillis simultanément dans les ateliers MELEC ?',
        answers: ['10 élèves', '15 élèves', '20 élèves', '30 élèves'],
        correctIndex: 2
      },
      {
        question: 'Quel diplôme prépare-t-on dans la section MELEC ?',
        answers: ['CAP', 'BAC Pro', 'BTS', 'Licence'],
        correctIndex: 1
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
  6: { // Bâtiment Principal
    zoneName: 'Bâtiment Principal',
    zoneIcon: '🏛️',
    questionsPool: [
      {
        question: 'Que trouve-t-on dans le bâtiment principal ?',
        answers: ['Accueil et administration', 'Ateliers', 'Gymnase', 'Cantine'],
        correctIndex: 0
      },
      {
        question: 'Le bâtiment principal est-il accessible aux personnes à mobilité réduite ?',
        answers: ['Oui', 'Non', 'Partiellement', 'En projet'],
        correctIndex: 0
      },
      {
        question: 'Où se trouve le bureau du directeur ?',
        answers: ['Rez-de-chaussée', '1er étage', '2ème étage', 'Bâtiment annexe'],
        correctIndex: 1
      }
    ]
  },
  8: { // Salles BAC Pro
    zoneName: 'Salles BAC Pro',
    zoneIcon: '💻',
    questionsPool: [
      {
        question: 'Combien de BAC Pro différents sont proposés au lycée ?',
        answers: ['2', '4', '6', '8'],
        correctIndex: 1
      },
      {
        question: 'La formation BAC Pro dure combien d\'années ?',
        answers: ['1 an', '2 ans', '3 ans', '4 ans'],
        correctIndex: 2
      },
      {
        question: 'Les élèves de BAC Pro font-ils des stages en entreprise ?',
        answers: ['Oui', 'Non', 'Seulement en dernière année', 'C\'est facultatif'],
        correctIndex: 0
      },
      {
        question: 'Quel est le principal objectif du BAC Pro ?',
        answers: ['Insertion professionnelle', 'Poursuite d\'études longues', 'Formation artistique', 'Formation sportive'],
        correctIndex: 0
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
        answers: ['Oui, toutes', 'Non, toutes partagées', 'Mixte', 'Selon les niveaux'],
        correctIndex: 2
      },
      {
        question: 'Quels sont les horaires de fermeture de l\'internat ?',
        answers: ['20h', '21h', '22h', '23h'],
        correctIndex: 2
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
    const questionCount = zoneId === '1' ? 8 : zone.questionsPool.length; // 8 questions pour zone 1

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

  // Pour la zone 1 (BTS CIEL IR), sélectionner 8 questions aléatoires
  if (zoneId === 1) {
    selectedQuestions = selectRandomQuestions(zoneData.questionsPool, 8);
  } else {
    selectedQuestions = [...zoneData.questionsPool];
  }

  // Mélanger l'ordre des questions
  selectedQuestions = shuffleArray(selectedQuestions);

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
