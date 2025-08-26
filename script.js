let currentMode = null;
let recognition = null;
let micActive = false;
let fetchInterval = null;
let finalWord = '';  // <-- Variable global para la palabra o frase actual

const signImages = {
  'A': 'https://i.imgur.com/gAHnBJd.jpg',
  'Á': 'https://i.imgur.com/gAHnBJd.jpg',
  'B': 'https://i.imgur.com/0DCd0TA.jpg',
  'C': 'https://i.imgur.com/ugahC5H.jpg',
  'Ç': 'https://i.imgur.com/ugahC5H.jpg',
  'D': 'https://i.imgur.com/RW1N9pj.jpg',
  'E': 'https://i.imgur.com/ZBbSPjF.jpg',
  'É': 'https://i.imgur.com/ZBbSPjF.jpg',
  'F': 'https://i.imgur.com/1I5HKbk.jpg',
  'G': 'https://i.imgur.com/4B6x6yC.jpg',
  'H': 'https://i.imgur.com/Edq7D6K.jpg',
  'I': 'https://i.imgur.com/hHfIXug.jpg',
  'Í': 'https://i.imgur.com/hHfIXug.jpg',
  'J': 'https://i.imgur.com/ytKVvOD.jpg',
  'K': 'https://i.imgur.com/qe8NqNQ.jpg',
  'L': 'https://i.imgur.com/qZhTQok.jpg',
  'M': 'https://i.imgur.com/dQdFTuY.jpg',
  'N': 'https://i.imgur.com/Qn04zfB.jpg',
  'O': 'https://i.imgur.com/csR7DmR.jpg',
  'Ó': 'https://i.imgur.com/csR7DmR.jpg',
  'P': 'https://i.imgur.com/VQERMJB.jpg',
  'Q': 'https://i.imgur.com/t3sfrgx.jpg',
  'R': 'https://i.imgur.com/fhAjlqF.jpg',
  'S': 'https://i.imgur.com/2AMn3Ba.jpg',
  'T': 'https://i.imgur.com/dZk82aN.jpg',
  'U': 'https://i.imgur.com/K2iX6KH.jpg',
  'Ú': 'https://i.imgur.com/K2iX6KH.jpg',
  'V': 'https://i.imgur.com/68F7ELp.jpg',
  'W': 'https://i.imgur.com/q70OWnY.jpg',
  'X': 'https://i.imgur.com/1nB25N9.jpg',
  'Y': 'https://i.imgur.com/h3O1ka5.jpg',
  'Ý': 'https://i.imgur.com/h3O1ka5.jpg',
  'Z': 'https://i.imgur.com/RKbG0co.jpg',
  ' ': 'https://i.imgur.com/DKcGUAL.jpg'
};

function startTranslation(mode) {
  currentMode = mode;
  document.getElementById("main-menu").style.display = "none";

  if (mode === 'images') {
    document.getElementById("images-translator").style.display = "flex";
    document.getElementById("translator").style.display = "none";
    stopRecognition();
    document.getElementById('input-word').value = '';
    clearSignImages();
  } else {
    document.getElementById("translator").style.display = "flex";
    document.getElementById("images-translator").style.display = "none";

    const speakBtn = document.getElementById("speak-btn");
    speakBtn.style.display = mode === 'audio' ? "inline-block" : "none";

    document.getElementById('translated-text').value = "";

    startFetchingLetters();
  }
}

function startFetchingLetters() {
  if (fetchInterval) clearInterval(fetchInterval);

  fetchInterval = setInterval(async () => {
    try {
      const response = await fetch('http://localhost:5000/letter');
      if (!response.ok) throw new Error('Error en respuesta');

      const data = await response.json();
      const texto = data.letra.trim();  

      if (texto && texto !== "") {
        const textarea = document.getElementById('translated-text');
        textarea.value += texto;  // acumular letras
      }
    } catch (error) {
      console.error('Error al obtener letra:', error);
    }
  }, 800);
}



function speakText() {
  const text = document.getElementById('translated-text').value;
  if (text && text.trim() !== "") {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  }
}

function goBack() {
  if (recognition && micActive) {
    recognition.stop();
    micActive = false;
    document.getElementById('mic-btn').textContent = '🎤 Activar micrófono';
  }

  if (fetchInterval) {
    clearInterval(fetchInterval);
    fetchInterval = null;
  }

  document.getElementById("translator").style.display = "none";
  document.getElementById("images-translator").style.display = "none";
  document.getElementById("main-menu").style.display = "block";

  document.getElementById('translated-text').value = "";
  document.getElementById('input-word').value = '';
  clearSignImages();
}

function toggleMic() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return;
  }

  if (!recognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
      const spokenWord = event.results[0][0].transcript;
      const input = document.getElementById('input-word');
      input.value = input.value.trim() + ' ' + spokenWord;
      translateWord();
    };

    recognition.onend = function() {
      if (micActive) {
        recognition.start();
      } else {
        const micBtn = document.getElementById('mic-btn-images');
        if (micBtn) micBtn.textContent = 'Activar micrófono🎤';
      }
    };
  }

  const micBtn = document.getElementById('mic-btn-images');
  if (!micActive) {
    recognition.start();
    micActive = true;
    if (micBtn) micBtn.textContent = 'Detener micrófono🔴';
  } else {
    recognition.stop();
    micActive = false;
    if (micBtn) micBtn.textContent = 'Activar micrófono🎤';
  }
}


function stopRecognition() {
  if (recognition && micActive) {
    recognition.stop();
    micActive = false;
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.textContent = 'Activar micrófono';
    console.log('Mic stopped by stopRecognition — button text set to Activar micrófono');
  }
}



function translateWord() {
  const input = document.getElementById('input-word').value.trim();
  const container = document.getElementById('sign-images-container');
  container.innerHTML = '';

  if (!input) {
    alert('Por favor escribe o habla una palabra para traducir');
    return;
  }

  finalWord = input.toUpperCase();

  showLettersBigFirst(finalWord);
}

// Nueva función para mostrar letras grandes una por una
function showLettersBigFirst(word) {
  const container = document.getElementById('sign-images-container');
  container.innerHTML = '';
  container.style.opacity = '1';

  const letters = word.split('');
  let index = 0;

  const bigLetterContainer = document.createElement('div');
  bigLetterContainer.style.position = 'relative';
  bigLetterContainer.style.width = '100%';
  bigLetterContainer.style.height = '800px';
  bigLetterContainer.style.marginTop = '40px';
  container.appendChild(bigLetterContainer);

  function showNextLetter() {
    if (index >= letters.length) {
      setTimeout(() => showAllLettersSmall(), 300);
      return;
    }

    const char = letters[index];
    index++;

    const prevElem = bigLetterContainer.querySelector('.big-letter');

    // Fade-out de la letra anterior
    if (prevElem) {
      prevElem.classList.remove('fade-in');
      prevElem.classList.add('fade-out');
      setTimeout(() => prevElem.remove(), 500);
    }

    // Crear siguiente letra o espacio
    let elem;
    let delay = 700; // tiempo normal entre letras

    if (char === ' ' || !signImages[char]) {
      elem = document.createElement('div'); // espacio transparente
      elem.style.width = '250px';
      elem.style.height = '250px';
      elem.style.backgroundColor = 'transparent';
      elem.style.borderRadius = '12px';
      delay = 650; // un poco más largo para espacios
    } else {
      elem = document.createElement('img');
      elem.src = signImages[char];
      elem.alt = char;
      elem.title = char;
      elem.style.width = '250px';
      elem.style.height = '250px';
      elem.style.objectFit = 'contain';
      elem.style.border = 'none';
    }

    elem.className = 'big-sign-image big-letter fade-in';
    elem.style.position = 'absolute';
    elem.style.left = 'calc(50% + -242px)'; // más a la derecha
    elem.style.top = '160px';               // más abajo

    bigLetterContainer.appendChild(elem);

    // Tiempo hasta la siguiente letra
    setTimeout(showNextLetter, delay);
  }

  showNextLetter();
}




function showAllLettersSmall() {
  const container = document.getElementById('sign-images-container');
  container.innerHTML = '';
  container.style.opacity = '0';

  const inputText = document.getElementById('input-word').value.trim().toUpperCase();
  if (!inputText) return;

  const words = inputText.split(' ');

  const maxLettersPerLine = 11;
  let currentLine = [];
  let currentLineLength = 0;
  const lines = [];

  for (const word of words) {
    const wordLength = word.length;

    if (currentLineLength + wordLength > maxLettersPerLine) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [word];
      currentLineLength = wordLength;
    } else {
      currentLine.push(word);
      currentLineLength += wordLength;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  lines.forEach(lineWords => {
    const lineContainer = document.createElement('div');
    lineContainer.classList.add('line-container');

    lineWords.forEach(word => {
      const wordContainer = document.createElement('div');
      wordContainer.classList.add('word-container');

      for (const char of word) {
        if (!signImages[char]) continue;
        const img = document.createElement('img');
        img.src = signImages[char];
        img.alt = char;
        img.title = char;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.border = 'none';
        img.style.borderRadius = '0';
        img.style.boxShadow = 'none';
        wordContainer.appendChild(img);
      }

      lineContainer.appendChild(wordContainer);
    });

    container.appendChild(lineContainer);
  });

  setTimeout(() => {
    container.style.opacity = '1';
  }, 100);
}

function clearSignImages() {
  const container = document.getElementById('sign-images-container');
  container.innerHTML = '';
}

function clearText(id) {
  document.getElementById(id).value = '';
  if(id === 'input-word') clearSignImages();
}

// --- NUEVO: Traducción automática al presionar Enter en el input de texto ---
document.getElementById('input-word').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    translateWord();
  }
});
// Borra la última letra detectada
function deleteLastLetter() {
  const textarea = document.getElementById('translated-text');
  if (textarea.value.length > 0) {
    textarea.value = textarea.value.slice(0, -1);
  }
}

