const resetButton = document.querySelector(".reset")
const playPrevious = document.querySelector(".previous")
const inputs = document.querySelectorAll('.word-row input');
const intro = document.querySelector('.intro')
const text = document.querySelector(".intro p")
const loadingIcon = document.querySelector(".intro img")

let minIndex = 0
let maxIndex = 5
let currentIndex = 0
let wordArray = ""
let checkedChars = ""
let correctWord = "MEMET"
let reversedCorrectWord = correctWord.split("").reverse().join("")
let postText = document.createElement("p")
let remaningLife = 5
let gameState = "Normal"

async function loadcomplete(randomState){
    correctWord= await getWord(randomState)
    reversedCorrectWord = correctWord.split("").reverse().join("")
}

async function getWord(randomState){
    if (randomState){
        try {
            const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
            const data = await response.json();
            const correctWord = data.word;
            console.log(correctWord)
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
}

const winScreen = () => {
    gameState = "Win"
    postText.textContent = `You correctly guessed the word, it was indeed ${correctWord}!`
    intro.appendChild(postText)
    text.classList.add("hidden")
    resetButton.classList.remove("hidden")
    playPrevious.classList.remove("hidden")

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
}

async function processWord(){
    if(gameState == "Normal"){
        for (minIndex = currentIndex-4; minIndex < maxIndex; minIndex++) {
            wordArray += inputs[minIndex].value
        }
        text.textContent = ""
        loadingIcon.classList.remove("hidden")
        const valid = await validateWord(wordArray);

        if (valid){
            for (minIndex = currentIndex-4; minIndex < maxIndex; minIndex++) {
                word = inputs[minIndex].value

                if (correctWord.includes(word)) {
                    checkedChars += inputs[minIndex].value
                    if (word === reversedCorrectWord[maxIndex - minIndex-1]){
                        inputs[minIndex].style.backgroundColor = "green";
                    } 
                    else if(checkedChars.includes(word) && inputs[minIndex].style.backgroundColor !== "green") {
                        inputs[minIndex].style.backgroundColor = "yellow";
                    }
                } else{
                    inputs[minIndex].style.backgroundColor = "red";
                }
            }
            continueGame(checkedChars)
        } else {
            text.textContent = "You did not enter a valid word!"
            for (let index = currentIndex-4; index < maxIndex; index++) {
                inputs[index].value = "";
            }
            minIndex = currentIndex-4
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

document.addEventListener("keyup", (event) => {
    if (gameState === "Win" || gameState === "Lose"){
        console.log("game over")
        event.preventDefault
        return
    }

    if (isLetter(event.key)) {
        inputs[currentIndex].value = event.key.toUpperCase();
        if ((currentIndex + 1) % 5 !== 0 && currentIndex < 25){
            currentIndex++;
        }
    }
    
    if (event.key === "Backspace" && currentIndex >= 0){
        if (inputs[currentIndex].value !== "") {
            inputs[currentIndex].value = "";
            } else if (currentIndex > minIndex) {
                currentIndex--;
                inputs[currentIndex].value = "";
          }
    }
    
    if (event.key === "Enter" && (currentIndex + 1) % 5 === 0 && inputs[currentIndex].value !== "" ){
        processWord()
    }
});

window.addEventListener("load", () => {
    loadcomplete(false)
});

