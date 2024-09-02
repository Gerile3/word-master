const resetButton = document.querySelector(".reset")
const inputs = document.querySelectorAll('.word-row input');
let minIndex = 0
let maxIndex = 5
let currentIndex = 0
let wordArray = ""
let correctWord = "MEMET"
let reversedCorrectWord = correctWord.split("").reverse().join("")
let remaningLife = 5
let gameWin = false

const isLetter = (letter) => {
    return /^[a-zA-Z]$/.test(letter);
}

const continueGame = (word) => {
    if (word === correctWord) {
        console.log("Correct, you win")
        gameWin = true
    } else {
        remaningLife--
        if(remaningLife > 0){
            maxIndex += 5
            currentIndex++
            wordArray = ""
        }
    }
}

document.addEventListener("keydown", (event) => {
    //console.log("life", remaningLife, "currentindx", currentIndex)

    if (remaningLife === 0 || gameWin){
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
            } else if (currentIndex > 0) {
                currentIndex--;
                inputs[currentIndex].value = "";
          }
    }
    
    if (event.key === "Enter" && (currentIndex + 1) % 5 === 0){
        if(remaningLife > 0){

        for (minIndex = currentIndex-4; minIndex < maxIndex; minIndex++) {
            word = inputs[minIndex].value


            if (correctWord.includes(word)) {
                wordArray += inputs[minIndex].value

                if (word === reversedCorrectWord[maxIndex - minIndex-1]){

                    inputs[minIndex].style.backgroundColor = "green";
                } 
            
                else if(wordArray.includes(word) && inputs[minIndex].style.backgroundColor !== "green") {
                    inputs[minIndex].style.backgroundColor = "yellow";

                }

            } else{
                inputs[minIndex].style.backgroundColor = "red";
            }
        }



            continueGame(wordArray)
        }
    }
  });