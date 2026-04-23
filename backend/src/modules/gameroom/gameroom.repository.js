const Gameroom = require('./gameroom.model')

const findAllGamerooms = () => Gameroom.find().sort({ updatedAt: -1 })

const findByMongoId = (id) => Gameroom.findById(id)

const findByRoomId = (roomId) => Gameroom.findOne({ roomId })

const createGameroom = (roomData) => Gameroom.create(roomData)

const updateGameroomById = (id, update, options = {}) =>
  Gameroom.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    ...options,
  })

const deleteGameroomById = (id) => Gameroom.findByIdAndDelete(id)

module.exports = {
  findAllGamerooms,
  findByMongoId,
  findByRoomId,
  createGameroom,
  updateGameroomById,
  deleteGameroomById,
}
