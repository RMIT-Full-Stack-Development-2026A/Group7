const aiLogicService = require('./AILogic.service')
const { ErrorResponse } = require('../../shared/errors/AppErrors')

const isValidBoard = (board) => {
  if (!Array.isArray(board) || board.length === 0) {
    return false
  }

  return board.every((row) => Array.isArray(row) && row.length === board.length)
}

const getMove = async (req, res, next) => {
  try {
    const {
      board,
      difficulty = 'medium',
      aiPlayer = 'O',
      humanPlayer = 'X',
    } = req.body || {}

    if (!isValidBoard(board)) {
      throw new ErrorResponse('A square board is required.', 400)
    }

    const move = aiLogicService.getAIMove(board, difficulty, aiPlayer, humanPlayer)

    res.json({
      ok: true,
      data: {
        move,
        difficulty,
        aiPlayer,
        humanPlayer,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMove,
}
