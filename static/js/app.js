const tasks = [
    {
        instruction: "Use the TWEEZERS to remove the Rat from Kenny's chest!",
        action: "remove",
        targetZone: "chest",
        requiredTool: "tweezers",
        questionIndex: 0
    },
    {
        instruction: "Select the MECHANICAL HEART and place it in his chest.",
        action: "insert",
        targetZone: "chest",
        requiredOrgan: "heart",
        questionIndex: 1
    },
    {
        instruction: "Use the SCALPEL to extract the Cheesy Poofs from his stomach.",
        action: "remove",
        targetZone: "stomach",
        requiredTool: "scalpel",
        questionIndex: 2
    },
    {
        instruction: "Select the TACO and place it in his stomach.",
        action: "insert",
        targetZone: "stomach",
        requiredOrgan: "taco",
        questionIndex: 3
    },
    {
        instruction: "Use the SYRINGE to extract the Alien Probe from his leg.",
        action: "remove",
        targetZone: "leg",
        requiredTool: "syringe",
        questionIndex: 4
    }
];

const questions = [
    {
        text: "If the surgeon ___ careful, the patient would have survived.",
        options: [
            { text: "had been", correct: true },
            { text: "has been", correct: false },
            { text: "was", correct: false }
        ]
    },
    {
        text: "The operation ___ successfully yesterday.",
        options: [
            { text: "is performed", correct: false },
            { text: "was performed", correct: true },
            { text: "has performed", correct: false }
        ]
    },
    {
        text: "You ___ sterilize your instruments before an operation.",
        options: [
            { text: "might", correct: false },
            { text: "must", correct: true },
            { text: "could", correct: false }
        ]
    },
    {
        text: "The scalpel, ___ is very sharp, is on the table.",
        options: [
            { text: "which", correct: true },
            { text: "who", correct: false },
            { text: "whose", correct: false }
        ]
    },
    {
        text: "A ___ tumor is not cancerous.",
        options: [
            { text: "malignant", correct: false },
            { text: "fatal", correct: false },
            { text: "benign", correct: true }
        ]
    }
];

const initialZones = {
    chest: "🐀",
    stomach: "🧀",
    leg: "👽"
};

const organsToPlace = [
    { id: "heart", emoji: "🫀", title: "Mechanical Heart" },
    { id: "taco", emoji: "🌮", title: "Taco" }
];

let currentTaskIndex = 0;
let score = 0;
let selectedItemType = null; // 'tool' or 'organ'
let selectedItemId = null; // e.g., 'scalpel', 'heart'
let selectedElement = null;

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen')
};

const instructionText = document.getElementById('instruction-text');
const organsContainer = document.getElementById('organs-container');
const zones = document.querySelectorAll('.organ-zone');
const trayItems = document.querySelectorAll('.item');
const questionModal = document.getElementById('question-modal');
const scoreDisplay = document.getElementById('score-display');
const totalScoreDisplay = document.getElementById('total-score');
const finalScoreDisplay = document.getElementById('final-score');
const nextBtn = document.getElementById('next-btn');

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

function startGame() {
    currentTaskIndex = 0;
    score = 0;
    
    // Reset Zones
    let activeZones = document.querySelectorAll('.organ-zone');
    activeZones.forEach(zone => {
        const zoneId = zone.getAttribute('data-zone');
        zone.innerHTML = initialZones[zoneId] || "";
        zone.className = 'organ-zone'; // reset classes
    });

    // Populate Organs Tray
    organsContainer.innerHTML = '';
    organsToPlace.forEach(organ => {
        const div = document.createElement('div');
        div.className = 'item organ';
        div.setAttribute('data-item', organ.id);
        div.setAttribute('title', organ.title);
        div.innerHTML = organ.emoji;
        div.addEventListener('click', () => selectTrayItem(div, 'organ', organ.id));
        organsContainer.appendChild(div);
    });

    // Reattach tool listeners
    document.querySelectorAll('.tool').forEach(tool => {
        // clone to remove old listeners just in case
        const clone = tool.cloneNode(true);
        tool.parentNode.replaceChild(clone, tool);
        clone.addEventListener('click', () => selectTrayItem(clone, 'tool', clone.getAttribute('data-item')));
    });

    activeZones.forEach(zone => {
        const clone = zone.cloneNode(true);
        zone.parentNode.replaceChild(clone, zone);
        clone.addEventListener('click', () => handleZoneClick(clone));
    });

    clearSelection();
    loadTask();
    switchScreen('game');
}

function selectTrayItem(element, type, id) {
    clearSelection();
    selectedItemType = type;
    selectedItemId = id;
    selectedElement = element;
    element.classList.add('selected');
}

function clearSelection() {
    document.querySelectorAll('.item.selected').forEach(el => el.classList.remove('selected'));
    selectedItemType = null;
    selectedItemId = null;
    selectedElement = null;
}

function loadTask() {
    if (currentTaskIndex >= tasks.length) {
        endGame();
        return;
    }

    const task = tasks[currentTaskIndex];
    instructionText.innerText = `Task ${currentTaskIndex + 1}: ${task.instruction}`;
    
    // Highlight correct zone slightly to help player
    document.querySelectorAll('.organ-zone').forEach(z => z.classList.remove('highlight'));
    document.getElementById(`zone-${task.targetZone}`).classList.add('highlight');
}

function handleZoneClick(zone) {
    const task = tasks[currentTaskIndex];
    const zoneId = zone.getAttribute('data-zone');

    if (zoneId !== task.targetZone) {
        showError("Wrong area! Read the monitor carefully.");
        return;
    }

    if (task.action === "remove") {
        if (selectedItemType !== 'tool' || selectedItemId !== task.requiredTool) {
            showError(`You need to use the ${task.requiredTool} to remove this!`);
            return;
        }
        // Success remove
        zone.innerHTML = "";
        triggerQuestion(task.questionIndex);

    } else if (task.action === "insert") {
        if (selectedItemType !== 'organ' || selectedItemId !== task.requiredOrgan) {
            showError(`You need to select the correct organ from the right tray!`);
            return;
        }
        // Success insert
        zone.innerHTML = selectedElement.innerHTML;
        selectedElement.style.visibility = 'hidden'; // Hide from tray
        triggerQuestion(task.questionIndex);
    }
}

function showError(msg) {
    instructionText.innerText = msg;
    instructionText.style.color = "red";
    setTimeout(() => {
        if (currentTaskIndex < tasks.length) {
            instructionText.innerText = `Task ${currentTaskIndex + 1}: ${tasks[currentTaskIndex].instruction}`;
        }
        instructionText.style.color = "#0f0";
    }, 2000);
}

function triggerQuestion(index) {
    clearSelection();
    const q = questions[index];
    document.getElementById('question-text').innerText = q.text;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    document.getElementById('feedback-message').className = 'hidden';
    nextBtn.classList.add('hidden');
    scoreDisplay.innerText = `Score: ${score}`;

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.addEventListener('click', () => handleAnswer(opt.correct, btn, q.options));
        optionsContainer.appendChild(btn);
    });

    questionModal.classList.remove('hidden');
}

function handleAnswer(isCorrect, selectedBtn, allOptions) {
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    const feedback = document.getElementById('feedback-message');
    feedback.classList.remove('hidden');

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        feedback.innerText = "Correct! Great job!";
        feedback.className = "success";
        score++;
    } else {
        selectedBtn.classList.add('wrong');
        feedback.innerText = "Incorrect!";
        feedback.className = "error";
        // Highlight correct one
        buttons.forEach((btn, idx) => {
            if (allOptions[idx].correct) btn.classList.add('correct');
        });
    }

    scoreDisplay.innerText = `Score: ${score}`;
    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    questionModal.classList.add('hidden');
    currentTaskIndex++;
    loadTask();
});

function endGame() {
    switchScreen('end');
    finalScoreDisplay.innerText = score;
    totalScoreDisplay.innerText = tasks.length;
    
    const endMsg = document.getElementById('end-message');
    if (score === tasks.length) {
        endMsg.innerText = "Perfect! Kenny survived and is healthy!";
        endMsg.style.color = "lime";
    } else if (score >= tasks.length / 2) {
        endMsg.innerText = "Good job! Kenny survived, but you need more practice.";
        endMsg.style.color = "yellow";
    } else {
        endMsg.innerText = "Oh my god, they killed Kenny! (And your English needs work!)";
        endMsg.style.color = "red";
    }
}
