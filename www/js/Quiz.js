// Quiz.js - Gestion des quiz interactifs

// État global du quiz
let currentQuiz = null;
let currentQuestionIndex = 0;
let selectedAnswer = null;
let answered = false;
let score = 0;
let quizFinished = false;

// Données des quiz par zone
const quizData = {
  1: { // Salles SUD
    zoneName: 'Salles SUD',
    zoneIcon: '🏫',
    questions: [
      {
        question: 'Dans quel bâtiment se trouvent les salles SUD ?',
        answers: ['Bâtiment A', 'Bâtiment B', 'Bâtiment C', 'Bâtiment D'],
        correctIndex: 0
      },
      {
        question: 'Quelles matières sont principalement enseignées dans les salles SUD ?',
        answers: ['Mathématiques et Sciences', 'Langues', 'Arts', 'Sport'],
        correctIndex: 0
      },
      {
        question: 'Combien de salles de cours y a-t-il dans l\'aile sud ?',
        answers: ['5 salles', '10 salles', '15 salles', '20 salles'],
        correctIndex: 1
      },
      {
        question: 'Les salles SUD sont-elles équipées de vidéoprojecteurs ?',
        answers: ['Oui, toutes', 'Non, aucune', 'Oui, quelques-unes', 'Uniquement les grandes salles'],
        correctIndex: 0
      }
    ]
  },
  2: { // Salles NORD/MELEC
    zoneName: 'Salles NORD/MELEC',
    zoneIcon: '🔬',
    questions: [
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
    questions: [
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
    questions: [
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
    questions: [
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
    questions: [
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
    questions: [
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
    const zoneCard = document.createElement('div');
    zoneCard.className = 'zone-card';
    zoneCard.onclick = () => startQuiz(parseInt(zoneId));
    
    zoneCard.innerHTML = `
      <div class="zone-icon">${zone.zoneIcon}</div>
      <div class="zone-badge">${zone.questions.length}Q</div>
      <h3 class="zone-name">${zone.zoneName}</h3>
      <p class="zone-description">Testez vos connaissances</p>
      <div class="zone-stats">
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          <span>${zone.questions.length} questions</span>
        </div>
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>~${zone.questions.length} min</span>
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
  currentQuiz = quizData[zoneId];
  
  if (!currentQuiz) {
    alert('❌ Quiz non disponible');
    return;
  }
  
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
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswer = null;
  answered = false;
  quizFinished = false;
  
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  
  document.getElementById('current-score').textContent = score;
  displayQuestion();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Retour à la sélection
function backToSelection() {
  currentQuiz = null;
  quizFinished = false;
  
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('zone-selection').style.display = 'block';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}