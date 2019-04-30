const BOARD_ROWS = 20
const BOARD_COLUMNS = 10
const SQUARE = 40
const VACANT = 'white'
const BORDER = '#43464B'

const canvas = init(BOARD_ROWS, BOARD_COLUMNS, SQUARE)
const scoreElement = document.querySelector('#score')
const gameoverElement = document.querySelector('#gameover')
const newGameButton = gameoverElement.querySelector('button')
const ctx = canvas.getContext('2d')

document.addEventListener('keydown', handleInput)
newGameButton.addEventListener('click', handleNewGame)

function handleInput (event) {
  if (event.keyCode == 37) {
    p.moveLeft()
    dropStart = Date.now()
  } else if (event.keyCode == 38) {
    p.rotate()
    dropStart = Date.now()
  } else if (event.keyCode == 39) {
    p.moveRight()
    dropStart = Date.now()
  } else if (event.keyCode == 40) {
    p.moveDown()
  }
}

function handleNewGame () {
  score = 0
  gameOver = false
  emptyBoard()
  drawBoard()
  p = randomPiece()
  scoreElement.innerHTML = score
  gameoverElement.classList.add('hide')
}

const pieces = [
  [Z, '#73956F'],
  [S, '#413F54'],
  [T, '#2E5EAA'],
  [O, '#8F6593'],
  [L, '#3D2B56'],
  [I, '#D7BE82'],
  [J, '#FE7F2D']
]
let p = randomPiece()

let score = 0
let board = []
emptyBoard()

function emptyBoard () {
  for (row = 0; row < BOARD_ROWS; row++) {
    board[row] = []
    for (col = 0; col < BOARD_COLUMNS; col++) {
      board[row][col] = VACANT
    }
  }
}

function init (rows, cols, square) {
  const canvas = document.querySelector('#tetris')

  canvas.width = cols * square
  canvas.height = rows * square

  return canvas
}

function drawSquare (x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x*SQUARE, y*SQUARE, SQUARE, SQUARE)
  ctx.strokeStyle = BORDER
  ctx.strokeRect(x*SQUARE, y*SQUARE, SQUARE, SQUARE)
}

function drawBoard () {
  for (row = 0; row < BOARD_ROWS; row++) {
    for (col = 0; col < BOARD_COLUMNS; col++) {
      drawSquare(col, row, board[row][col])
    }
  }
}

drawBoard()

function randomPiece () {
  let random = Math.floor(Math.random() * pieces.length)
  return new Piece(pieces[random][0], pieces[random][1]) 
}

function Piece (tetromino, color) {
  this.tetromino = tetromino
  this.color = color

  this.tetrominoIndex = 0
  this.activeTetromino = this.tetromino[this.tetrominoIndex]

  this.x = 3
  this.y = -2
}

Piece.prototype.fill = function (color) {
  for (row = 0; row < this.activeTetromino.length; row++) {
    for (col = 0; col < this.activeTetromino.length; col++) {
      if (this.activeTetromino[row][col]) {
        drawSquare(this.x + col, this.y + row, color)
      }
    }
  }
}

Piece.prototype.draw = function () {
  this.fill(this.color)
}

Piece.prototype.clear = function () {
  this.fill(VACANT)
}

Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.clear()
    this.y++
    this.draw()
  } else {
    // lock piece and make new piece
    this.lock()
    p = randomPiece()
  }
}

Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.clear()
    this.x++
    this.draw()
  }
}

Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.clear()
    this.x--
    this.draw()
  }
}

Piece.prototype.rotate = function () {
  let nextIndex = (this.tetrominoIndex + 1) %this.tetromino.length
  let nextPattern = this.tetromino[nextIndex]
  let kick = 0

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > BOARD_COLUMNS / 2) {
      kick = -1
    } else {
      kick = 1
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.clear()
    this.x += kick
    this.tetrominoIndex = nextIndex
    this.activeTetromino = this.tetromino[this.tetrominoIndex]
    this.draw()
  }  
}

Piece.prototype.lock = function () {
  for (row = 0; row < this.activeTetromino.length; row++) {
    for (col = 0; col < this.activeTetromino.length; col++) {
      if (!this.activeTetromino[row][col]) {
        continue
      }

      if (this.y + row < 0) {
        gameoverElement.classList.remove('hide')
        gameOver = true
        break
      }

      board[this.y + row][this.x + col] = this.color
    }
  }

  for (row = 0; row < BOARD_ROWS; row++) {
    let isRowFull = true
    for (col = 0; col < BOARD_COLUMNS; col++) {
      isRowFull = isRowFull && (board[row][col] != VACANT)
    }
    if (isRowFull) {
      for (y = row; y > 1; y--) {
        for (col = 0; col < BOARD_COLUMNS; col++) {
          board[y][col] = board[y-1][col]
        }
      }

      for (col = 0; col < BOARD_COLUMNS; col++) {
        board[0][col] = VACANT
      }

      score += 10
    }
  }
  drawBoard()
  scoreElement.innerHTML = score
}

Piece.prototype.collision = function (x, y, piece) {
  for (row = 0; row < piece.length; row++) {
    for (col = 0; col < piece.length; col++) {
      if (!piece[row][col]) {
        continue
      }
      
      let futureX = this.x + col + x
      let futureY = this.y + row + y

      if (futureX < 0 || futureX >= BOARD_COLUMNS || futureY >= BOARD_ROWS) {
        return true
      }

      if (futureY < 0) {
        continue
      }

      if (board[futureY][futureX] != VACANT) {
        return true
      }
    }
  }
  return false
}

let dropStart = Date.now()
let gameOver = true

function drop () {
  let now = Date.now()
  let delta = now - dropStart

  if (delta > 1000) {
    p.moveDown()
    dropStart = Date.now()
  }
  
  if (!gameOver) {
    requestAnimationFrame(drop)
  }
}

drop()

