const resetButton = document.querySelector(".reset")
const playPrevious = document.querySelector(".previous")
const inputs = document.querySelectorAll('.word-row input');
const intro = document.querySelector('.intro')
const text = document.querySelector(".intro p")
const loadingIcon = document.querySelector(".intro img")
const postText = document.createElement("p")

let minIndex = 0
let maxIndex = 5
let currentIndex = 0
let wordArray = ""
let checkedChars = ""
let correctWord = "DEBUG" // in case api fails to give word
let reversedCorrectWord = correctWord.split("").reverse().join("")
let remaningLife = 5
let gameState = "Normal"
let isProcessingInput = false  // Flag to prevent double input

function updateInputState() {
    inputs.forEach((input, index) => {
        if (index >= minIndex && index < maxIndex) {
            input.removeAttribute('readonly');
        } else {
            input.setAttribute('readonly', 'readonly');
        }
    });
}

function handleInput(index, value) {
    if (gameState === "Win" || gameState === "Lose" || isProcessingInput) {
        return;
    }

    isProcessingInput = true;

    if (index >= minIndex && index < maxIndex) {
        if (isLetter(value)) {
            inputs[index].value = value.toUpperCase();
            if (index + 1 < maxIndex) {
                currentIndex = index + 1;
                inputs[currentIndex].focus();
            }
        } else {
            inputs[index].value = '';
        }
    }

    isProcessingInput = false;
}

inputs.forEach((input, index) => {
    input.addEventListener('focus', () => {
        if (index >= minIndex && index < maxIndex) {
            currentIndex = index;
        } else {
            inputs[currentIndex].focus();
        }
    });

    input.addEventListener('input', (event) => {
        event.preventDefault();
        if (isProcessingInput) return;
        
        const value = event.target.value;
        if (value.length > 0) {
            handleInput(index, value[value.length - 1].toUpperCase());
        } else if (event.inputType === "deleteContentBackward") {
            if (index > minIndex) {
                currentIndex = index - 1;
                inputs[currentIndex].focus();
            }
        }
        
        // Ensure only one character is in the input
        if (input.value.length > 1) {
            input.value = input.value[input.value.length - 1].toUpperCase();
        }
    });
});

async function loadcomplete(randomState){
    correctWord = await getWord(randomState)
    reversedCorrectWord = correctWord.split("").reverse().join("")
    updateInputState()
}

async function getWord(randomState){
    if (randomState){
        try {
            const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
            const data = await response.json();
            const correctWord = data.word;
            loadingIcon.classList.add("hidden")
            return correctWord.toUpperCase();
        } catch (error){
            console.log(error);
            return false;
        }
    } else {
        try {
            const response = await fetch("https://words.dev-apis.com/word-of-the-day");
            const data = await response.json();
            const correctWord = data.word;
            loadingIcon.classList.add("hidden")
            return correctWord.toUpperCase();
        } catch (error){
            console.log(error);
            return false;
        }
    }
}

async function validateWord(wordArray){
    try {
        const response = await fetch("https://words.dev-apis.com/validate-word", {
          method: "POST",
          body: JSON.stringify({ word: wordArray })
        });
        const data = await response.json();
        const validness = data.validWord;
        loadingIcon.classList.add("hidden")
        return validness;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const resetGame = (randomState = false) => {
    minIndex = 0
    maxIndex = 5
    currentIndex = 0
    wordArray = ""
    checkedChars = ""
    remaningLife = 5
    gameState = "Normal"
    resetButton.classList.add("hidden")
    playPrevious.classList.add("hidden")

    if (randomState) {
        postText.textContent = `Random times, random words. Good luck!`
    } else {
        postText.textContent = `Lets try once more!`
    }

    intro.appendChild(postText)
    for (let index = 0; index < inputs.length; index++) {
        inputs[index].value = "";
        inputs[index].style.backgroundColor = "white";
    }
    updateInputState();
}

const winScreen = () => {
    gameState = "Win"
    postText.textContent = `You correctly guessed the word, it was indeed ${correctWord}!`
    intro.appendChild(postText)
    text.classList.add("hidden")
    resetButton.classList.remove("hidden")
    playPrevious.classList.remove("hidden")

    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

const loseScreen = () => {
    gameState = "Lose"
    postText.textContent = `Failed to guess the word, it was ${correctWord}!`
    intro.appendChild(postText)
    text.classList.add("hidden")
    resetButton.classList.remove("hidden")
    playPrevious.classList.remove("hidden")
}

const isLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
}

const continueGame = (word) => {
    if (word === correctWord) {
        winScreen()
    } else {
        remaningLife--
        if(remaningLife <= 0){ loseScreen() }
        maxIndex += 5
        currentIndex++
        wordArray = ""
        checkedChars = ""
    }
    updateInputState();
}

async function processWord() {
    if (gameState == "Normal") {
        for (minIndex = currentIndex - 4; minIndex < maxIndex; minIndex++) {
            wordArray += inputs[minIndex].value
        }
        text.textContent = ""
        loadingIcon.classList.remove("hidden")
        const valid = await validateWord(wordArray);

        if (valid) {
            let remainingCorrectWord = correctWord;
            for (let i = currentIndex - 4; i < maxIndex; i++) {
                const word = inputs[i].value;
                if (word === correctWord[i - (currentIndex - 4)]) {
                    inputs[i].style.backgroundColor = "green";
                    remainingCorrectWord = remainingCorrectWord.replace(word, '_');
                }
            }
            for (let i = currentIndex - 4; i < maxIndex; i++) {
                const word = inputs[i].value;
                if (inputs[i].style.backgroundColor !== "green") {
                    if (remainingCorrectWord.includes(word)) {
                        inputs[i].style.backgroundColor = "yellow";
                        remainingCorrectWord = remainingCorrectWord.replace(word, '_');
                    } else {
                        inputs[i].style.backgroundColor = "red";
                    }
                }
            }
            continueGame(wordArray)
        } else {
            text.textContent = "You did not enter a valid word!"
            for (let index = currentIndex - 4; index < maxIndex; index++) {
                inputs[index].value = "";
            }
            minIndex = currentIndex - 4
            currentIndex -= 4
            wordArray = ""
        }
    }
}

resetButton.addEventListener("click", () => {
    resetGame()
})

playPrevious.addEventListener("click", () => {
    loadcomplete(true)
    resetGame(true)
})

document.addEventListener("keydown", (event) => {
    if (gameState === "Win" || gameState === "Lose" || isProcessingInput){
        return;
    }

    if (isLetter(event.key)) {
        event.preventDefault();
        handleInput(currentIndex, event.key);
    } else if (event.key === "Backspace") {
        event.preventDefault();
        if (currentIndex >= minIndex) {
            if (inputs[currentIndex].value !== "") {
                inputs[currentIndex].value = "";
            } else if (currentIndex > minIndex) {
                currentIndex--;
                inputs[currentIndex].value = "";
                inputs[currentIndex].focus();
            }
        }
    } else if (event.key === "Enter" && (currentIndex + 1) % 5 === 0 && inputs[currentIndex].value !== "") {
        event.preventDefault();
        processWord();
    }
});

window.addEventListener("load", () => {
    inputs.forEach(input => {
        input.value = "";
    });
    loadcomplete(false)
});