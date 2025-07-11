
const elementContainer = document.getElementById('elementContainer');
const element1Display = document.getElementById('element1');
const element2Display = document.getElementById('element2');
const element1Text = document.getElementById('elementI');
const element2Text = document.getElementById('elementII');
const combineBtn = document.getElementById('combineBtn');
const clearBtn = document.getElementById('clearBtn');
const progressDisplay = document.getElementById('progressDisplay');
var soundtrack = new Audio('mirage.mp3');
var select = new Audio('select.mp3');
var combine = new Audio('combine.mp3');
var clear = new Audio('sweep.mp3');
var failed = new Audio('failed.mp3');

let unlockedElements = [];

const savedData = localStorage.getItem("unlockedElements");
if (savedData) {
    try {
        unlockedElements = JSON.parse(savedData);
    } catch (e) {
        console.error("Failed to parse saved unlockedElements:", e);
        unlockedElements = ["fire", "water", "earth", "air"];
    }
} else {
    unlockedElements = ["fire", "water", "earth", "air"];
}

let selectedElement1 = null;
let selectedElement2 = null;

let elementsData = {};
let combinationsData = [];

console.log("Input resetProgress() in the console in order to reset your progress. Warning! This action cannot be undone.");

async function fetchData() {
    try {
        const elementsResponse = await fetch('data/elements.json');
        const combinationsResponse = await fetch('data/combinations.json');
        elementsData = await elementsResponse.json();
        combinationsData = await combinationsResponse.json();

        updateProgress();
        renderElements();

    } catch (error) {
        console.error("Error loading JSON data: ", error);
    }
}

function music() {
    soundtrack.play()
}
function renderElements() {
    elementContainer.innerHTML = '';
    unlockedElements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.classList.add('element');
        elementDiv.innerHTML = `<img src="assets/${elementsData[element].texture}" draggable="false" alt="${element}" title="${element}">`;
        elementDiv.onclick = () => selectElement(element);
        elementContainer.appendChild(elementDiv);
    });
}

function updateProgress() {
    const totalElements = Object.keys(elementsData).length;
    const unlockedCount = unlockedElements.length;
    progressDisplay.textContent = `Elements: ${unlockedCount}/${totalElements}`;
}

function selectElement(element) {
    if (!selectedElement1) {
        selectedElement1 = element;
        element1Display.innerHTML = `<img src="assets/${elementsData[element].texture}" alt="${element}" title="${element}" style="width: 120px; height: 120px; object-fit: contain;">`;
        element1Text.innerHTML = element;
        select.cloneNode(true).play()
    } else if (!selectedElement2) {
        selectedElement2 = element;
        element2Display.innerHTML = `<img src="assets/${elementsData[element].texture}" alt="${element}" title="${element}" style="width: 120px; height: 120px; object-fit: contain; image-rendering: pixelated;">`;
        element2Text.innerHTML = element;
        select.cloneNode(true).play()
    }
}

combineBtn.onclick = () => {
    if (selectedElement1 && selectedElement2) {
        const combination = combinationsData.find(combo => {
            return (combo.elements[0] === selectedElement1 && combo.elements[1] === selectedElement2) ||
                   (combo.elements[0] === selectedElement2 && combo.elements[1] === selectedElement1);
        });

        if (combination && !unlockedElements.includes(combination.result)) {
            unlockedElements.push(combination.result);
            localStorage.setItem("unlockedElements", JSON.stringify(unlockedElements));
            combine.cloneNode(true).play()
            updateProgress();
        }
        else {
            failed.cloneNode(true).play()
        }

        selectedElement1 = null;
        selectedElement2 = null;
        element1Display.innerHTML = ' ';
        element2Display.innerHTML = ' ';
        element1Text.innerHTML = '-';
        element2Text.innerHTML = '-';

        renderElements();
    }
};

clearBtn.onclick = () => {
    selectedElement1 = null;
    selectedElement2 = null;
    element1Display.innerHTML = ' ';
    element2Display.innerHTML = ' ';
    element1Text.innerHTML = '-';
    element2Text.innerHTML = '-';
    clear.cloneNode(true).play()

    renderElements();
};
function getHint() {
    if (!combinationsData || combinationsData.length === 0) {
        alert("Hints not available yet. Try again in a moment.");
        return;
    }

    const possibleHints = combinationsData.filter(combo => {
        const result = combo.result;
        const [e1, e2] = combo.elements;
        return !unlockedElements.includes(result) &&
            unlockedElements.includes(e1) &&
            unlockedElements.includes(e2);
    });

    if (possibleHints.length > 0) {
        const hint = possibleHints[Math.floor(Math.random() * possibleHints.length)];
        if (Math.random() <= 0.5) {
            alert(`You can combine ${hint.elements[0]} + ${hint.elements[1]}.`);
        }
        else {
            alert(`You can create ${hint.result}.`);
        }
    } else {
        alert("No hints available");
    }
}
function resetProgress() {
    localStorage.removeItem("unlockedElements");
    location.reload();
}

fetchData();
