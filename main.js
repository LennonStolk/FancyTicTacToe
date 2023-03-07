const xSVG = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style="width: 60%; height: 60%;"><defs></defs><polygon style="fill: rgb(101, 109, 164);" points="15.506 383.96 124.367 494.766 253.77 351.995 393.441 485.178 488.953 370.109 354.414 244.383 476.629 111.201 368.796 11.046 247.606 144.23 114.095 14.241 5.233 126.116 143.879 248.645"></polygon></svg>`;
const oSVG = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style="width: 60%; height: 60%;"><defs></defs><circle style="stroke-width: 92px; stroke: rgb(168, 108, 108); fill: rgba(0, 0, 0, 0);" transform="matrix(1.412608, 0, 0, 1.410337, -420.489624, -496.149445)" cx="473" cy="530.5" r="128"></circle></svg>`;

class Game {
  currentBoard;
  optionBoards;
  currentPlayer;
  boardOrigin;
  aiOn;

  constructor(startingPlayer, aiOn) {
    // Set up a new game state
    this.currentPlayer = startingPlayer;
    this.currentBoard = getEmptyBoard();
    this.optionBoards = getOptionBoards(this.currentBoard, this.currentPlayer);
    this.boardOrigin = document.getElementById("origin");
    this.aiOn = aiOn;

    this.render();
  }

  render() {
    // Unrender everything
    this.boardOrigin.innerHTML = "";

    // Render main board
    let mainBoardElement = renderBoard(this.currentBoard, false);
    this.boardOrigin.appendChild(mainBoardElement);

    // If a player has won, do an animation and don't render the new options
    setTimeout(() => {
      if (checkWin(this.currentBoard, "x"))
        mainBoardElement.classList.add("x-win");
      if (checkWin(this.currentBoard, "o"))
        mainBoardElement.classList.add("o-win");
    }, 200);

    // If a player has won or has tied, make the main board clickable
    let hasTied = this.currentBoard.every((cell) => cell != "-");
    let hasWon =
      checkWin(this.currentBoard, "x") || checkWin(this.currentBoard, "o");
    if (hasWon || hasTied) {
      // Reset the game if the main board is clicked
      mainBoardElement.onclick = () => (game = new Game("x", this.aiOn));
      return;
    }

    // Render option boards
    let optionsAmount = this.optionBoards.length;
    let optionBoardSize = 100 / optionsAmount;
    this.optionBoards.forEach((optionBoard, index) => {
      // Create option board
      let optionBoardElement = renderBoard(optionBoard, true);
      this.boardOrigin.appendChild(optionBoardElement);

      // Render the correct size and position for the option board
      moveBoard(
        optionBoard,
        index * optionBoardSize - 50 + optionBoardSize * 0.5,
        20
      );
      setBoardSize(optionBoard, optionBoardSize * 0.9);
      fadeInBoard(optionBoard);
    });
  }

  optionClicked(id) {
    let clickedBoardState = id.split("");
    if (clickedBoardState == this.currentBoard) return;

    // Fade out the boards that weren't clicked
    fadeOutBoard(this.currentBoard);
    this.optionBoards.forEach((board) => {
      if (id != board.join("")) fadeOutBoard(board);
    });

    // Move the clicked board towards the origin
    moveBoard(clickedBoardState, 0, 0);
    setBoardSize(clickedBoardState, 12);
    this.currentBoard = clickedBoardState;
    this.switchPlayer();
    this.optionBoards = getOptionBoards(this.currentBoard, this.currentPlayer);

    // Render new (option) boards
    setTimeout(() => {
      this.render();
    }, 500);
  }

  switchPlayer() {
    // Toggle the player symbol
    if (this.currentPlayer == "x") {
      this.currentPlayer = "o";
      return;
    }
    if (this.currentPlayer == "o") {
      this.currentPlayer = "x";
      return;
    }
  }
}

function getEmptyBoard() {
  // Generate a new board with 9 empty cells
  return Array(9).fill("-");
}

function getOptionBoards(currentBoard, currentPlayer) {
  // Calculate the different options, based on the current board
  let optionBoards = [];

  // Loop through all of the cells
  currentBoard.forEach((cell, index) => {
    if (cell == "-") {
      // If one of the cells is "-", then generate a new option board where the "-" is replaced with the current player symbol
      let optionBoard = [...currentBoard];
      optionBoard[index] = currentPlayer;
      // Add the generated option board to the output collection
      optionBoards.push(optionBoard);
    }
  });
  return optionBoards;
}

function renderBoard(boardState, isOption) {
  // Render board element
  let board = document.createElement("div");
  board.classList.add("board");
  board.id = boardState.join("");
  if (isOption) {
    board.style.opacity = 0;
    board.onclick = (e) => game.optionClicked(board.id);
  }

  boardState.forEach((cellState) => {
    // Render cell elements
    let cell = document.createElement("div");
    cell.classList.add("cell");

    if (cellState == "x") {
      cell.innerHTML = xSVG;
    }
    if (cellState == "o") {
      cell.innerHTML = oSVG;
    }

    board.appendChild(cell);
  });

  return board;
}

function fadeOutBoard(boardState) {
  // Find the correct board and do a fade out animation

  let id = boardState.join("");
  let board = document.getElementById(id);
  board.style.opacity = 0;
}

function fadeInBoard(boardState) {
  // Find the correct board and do a fade in animation
  let id = boardState.join("");
  let board = document.getElementById(id);
  setTimeout(() => {
    board.style.opacity = 1;
  }, 200);
}

function moveBoard(boardState, x, y) {
  // Find the correct board and move it to a position (Position: absolute)
  let id = boardState.join("");
  let board = document.getElementById(id);
  board.style.left = x + "vw";
  board.style.top = y + "vw";
}

function setBoardSize(boardState, size) {
  // Set the size to a max of 12
  if (size > 12) size = 12;

  // Find the correct board and set it to a size based on the parameters and the view width
  let id = boardState.join("");
  let board = document.getElementById(id);
  board.style.width = size + "vw";
  board.style.height = size + "vw";

  // Also set all the cells to the correct size, which is 1/3 of the board
  let cells = board.childNodes;

  cells.forEach((cell) => {
    cell.style.width = size / 3 + "vw";
    cell.style.height = size / 3 + "vw";
  });
}

function checkWin(boardState, player) {
  // Example: "x" -> "xxx"
  let threeRow = player + player + player;

  // Check rows
  if (boardState[0] + boardState[1] + boardState[2] == threeRow) return true;
  if (boardState[3] + boardState[4] + boardState[5] == threeRow) return true;
  if (boardState[6] + boardState[7] + boardState[8] == threeRow) return true;
  // Check columns
  if (boardState[0] + boardState[3] + boardState[6] == threeRow) return true;
  if (boardState[1] + boardState[4] + boardState[7] == threeRow) return true;
  if (boardState[2] + boardState[5] + boardState[8] == threeRow) return true;
  // Check diagonals
  if (boardState[0] + boardState[4] + boardState[8] == threeRow) return true;
  if (boardState[2] + boardState[4] + boardState[6] == threeRow) return true;

  // If no winning lines are found then return false
  return false;
}

// This is how the game is started when the page is loaded
let game = new Game("x", false);

// AI button toggling
let aiButton = document.getElementById("ai");
let aiOn = false;
aiButton.addEventListener("click", (e) => {
  // Toggle AI mode in game state
  aiOn = !aiOn;
  game.aiOn = aiOn;
  // Animation
  if (aiOn) aiButton.style.opacity = 1.0;
  else aiButton.style.opacity = 0.3;
});
