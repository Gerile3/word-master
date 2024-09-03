const resetButton = document.querySelector(".reset")
const playPrevious = document.querySelector(".previous")
const inputs = document.querySelectorAll('.word-row input');
const intro = document.querySelector('.intro')
const text = document.querySelector(".intro p")

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

async function loadcomplete(){
    correctWord = await getWord(false)
    reversedCorrectWord = correctWord.split("").reverse().join("")
}

async function getWord(randomDay){
    if (randomDay){
        try {
            const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
            const data = await response.json();
            const correctWord = data.word;
            const puzzleNumber = data.puzzleNumber
            console.log(correctWord, puzzleNumber);
            return correctWord.toUpperCase(), puzzleNumber;
        } catch (error){
            console.log(error);
            return false;
        }
    } else {
        try {
            const response = await fetch("https://words.dev-apis.com/word-of-the-day");
            const data = await response.json();
            const correctWord = data.word;
            console.log(correctWord);
            return correctWord.toUpperCase();
        } catch (error){
            console.log(error);
            return false;
        }
    }
}


async function validateWord(wordArray){
    console.log(wordArray)
    try {
        const response = await fetch("https://words.dev-apis.com/validate-word", {
          method: "POST",
          body: JSON.stringify({ word: wordArray })
        });
        const data = await response.json();
        const validness = data.validWord;
        console.log(validness);
        return validness;
      } catch (error) {
        console.log(error);
        return false;
      }
}


const resetGame = () => {
    minIndex = 0
    maxIndex = 5
    currentIndex = 0
    wordArray = ""
    checkedChars = ""
    remaningLife = 5
    gameState = "Normal"
    resetButton.classList.add("hidden")
    playPrevious.classList.add("hidden")
    postText.textContent = `Lets try once more!`
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
    console.log("here")
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

        const valid = await validateWord(wordArray);

        if (valid){
            text.textContent = "Type 5-length word!"
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
        console.log(currentIndex, minIndex)
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
    loadcomplete()
});

