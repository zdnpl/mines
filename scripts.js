document.addEventListener("DOMContentLoaded", () => {
  const boardSize = 5;
  const board = document.getElementById("game-board");
  const startButton = document.getElementById("start-game");
  const endButton = document.getElementById("end-game");
  const stopButton = document.getElementById("stop-game");
  const betAmountInput = document.getElementById("bet-amount");
  const coinCountDisplay = document.getElementById("coin-count");
  const betDisplay = document.getElementById("bet-display");
  const messageDisplay = document.getElementById("message");
  const maxBetButton = document.getElementById("max-bet");
  const currentMultiplyDisplay = document.getElementById("current-multiply");
  const minesSlider = document.getElementById("mines-slider");
  const minesValue = document.getElementById("mines-value");

  let cells = [];
  let gameOver = false;
  let coins = 2000;
  let currentBet = 10; // Initial bet amount
  let cellsOpened = 0;
  let totalCells = boardSize * boardSize;
  let minesCount = 1; // Default mines count

  startButton.addEventListener("click", startGame);
  endButton.addEventListener("click", endGame);
  stopButton.addEventListener("click", stopGame);
  maxBetButton.addEventListener("click", setMaxBet);

  minesSlider.addEventListener("input", () => {
    minesCount = parseInt(minesSlider.value);
    minesValue.textContent = minesCount;
    updateMultiplierDisplay();
  });

  function startGame() {
    const betAmount = parseInt(betAmountInput.value);
    if (betAmount < 10) {
      alert("Bet amount must be between 10 and 1000.");
      return;
    }
    if (betAmount > coins) {
      alert("Not enough coins.");
      return;
    }
    board.innerHTML = "";
    cells = [];
    gameOver = false;
    cellsOpened = 0;
    messageDisplay.textContent = "";
    endButton.style.display = "none";
    stopButton.style.display = "inline-block";
    currentBet = betAmount;
    betDisplay.textContent = `Current Bet: ${currentBet.toFixed(2)}`; // Limit to 2 decimal places
    coins -= betAmount;
    updateCoinDisplay();
    createBoard();
    updateMultiplierDisplay(); // Update multiplier display after starting game
  }

  function endGame() {
    gameOver = true;
    revealBombs();
    messageDisplay.textContent = "Game Ended!";
    endButton.style.display = "none";
    stopButton.style.display = "none";
  }

  function stopGame() {
    if (gameOver) return;
    coins += currentBet;
    updateCoinDisplay();
    currentBet = 0;
    betDisplay.textContent = `Current Bet: ${currentBet.toFixed(2)}`; // Limit to 2 decimal places
    messageDisplay.textContent = `Bet added to coins. Current coins: ${coins.toFixed(2)}`; // Limit to 2 decimal places
    endButton.style.display = "none";
    stopButton.style.display = "none";
  }

  function setMaxBet() {
    currentBet = coins;
    betAmountInput.value = coins;
    betDisplay.textContent = `Current Bet: ${currentBet.toFixed(2)}`; // Limit to 2 decimal places
  }

  function createBoard() {
    const gameArray = generateGameArray();
    gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.setAttribute("id", i);
      cell.classList.add("cell");
      cell.classList.add(gameArray[i]);
      board.appendChild(cell);
      cells.push(cell);

      cell.addEventListener("click", function () {
        if (!gameOver) click(cell);
      });
    }
  }

  function click(cell) {
    if (cell.classList.contains("bomb")) {
      cell.classList.add("exploded");
      revealBombs();
      currentBet = 0;
      betDisplay.textContent = `Current Bet: ${currentBet.toFixed(2)}`; // Limit to 2 decimal places
      messageDisplay.textContent = "Game Over!";
      gameOver = true;
      endButton.style.display = "block";
      stopButton.style.display = "none";
    } else {
      if (!cell.classList.contains("open")) {
        cell.classList.add("open");
        cellsOpened++;
        const multiplier = getMultiplier(cellsOpened);
        currentBet *= multiplier;
        betDisplay.textContent = `Current Bet: ${currentBet.toFixed(2)}`; // Limit to 2 decimal places
        currentMultiplyDisplay.textContent = `Current Multiply: ${multiplier.toFixed(2)}`; // Limit to 2 decimal places
        checkWin();
      }
    }
  }

  function revealBombs() {
    cells.forEach((cell) => {
      if (cell.classList.contains("bomb") && !cell.classList.contains("exploded")) {
        cell.classList.add("revealed");
      }
    });
  }

  function checkWin() {
    if (cellsOpened === totalCells - parseInt(betAmountInput.value)) {
      coins += currentBet;
      updateCoinDisplay();
      messageDisplay.textContent = `You Win! Bet amount ${currentBet.toFixed(2)} coins has been added to your total coins.`;
      gameOver = true;
      endButton.style.display = "block";
      stopButton.style.display = "none";
    }
  }

  function getMultiplier(cellsOpened) {
    // Custom function to determine the multiplier based on the number of opened cells
    const minMultiplier = getMinMultiplier();
    const maxMultiplier = getMaxMultiplier();
    const totalCellsWithoutMines = totalCells - parseInt(betAmountInput.value);
    const multiplierRange = maxMultiplier - minMultiplier;
    const step = multiplierRange / (totalCellsWithoutMines - 1);
    return minMultiplier + (cellsOpened - 1) * step;
  }

  function getMinMultiplier() {
    // Determine minimum multiplier based on mines count
    if (minesCount === 1) {
      return 1.1;
    } else if (minesCount === 24) {
      return 10;
    } else {
      // Linear interpolation for other values
      return 1.1 + ((minesCount - 1) * (10 - 1.1)) / (24 - 1);
    }
  }

  function getMaxMultiplier() {
    // Determine maximum multiplier based on mines count
    if (minesCount === 1) {
      return 20;
    } else if (minesCount === 24) {
      return 500;
    } else {
      // Linear interpolation for other values
      return 20 + ((minesCount - 1) * (500 - 20)) / (24 - 1);
    }
  }

  function updateCoinDisplay() {
    coinCountDisplay.textContent = coins.toFixed(2); // Limit to 2 decimal places
  }

  function updateMultiplierDisplay() {
    const minMultiplier = getMinMultiplier();
    const maxMultiplier = getMaxMultiplier();
    currentMultiplyDisplay.textContent = `Current Multiply: ${minMultiplier.toFixed(2)} - ${maxMultiplier.toFixed(2)}`; // Limit to 2 decimal places
  }

  function generateGameArray() {
    const gameArray = Array(totalCells).fill("valid");
    const bombIndices = Array(minesCount)
      .fill("bomb")
      .concat(Array(totalCells - minesCount).fill("valid"));
    bombIndices.sort(() => Math.random() - 0.5);
    for (let i = 0; i < totalCells; i++) {
      if (bombIndices[i] === "bomb") {
        gameArray[i] = "bomb";
      }
    }
    return gameArray;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});
