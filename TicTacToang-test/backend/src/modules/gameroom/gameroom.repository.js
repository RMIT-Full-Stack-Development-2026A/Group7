import Gameroom from './gameroom.model.js'

export const findAllGamerooms = () => Gameroom.find().sort({ updatedAt: -1 })

export const findByMongoId = (id) => Gameroom.findById(id)

export const findByRoomId = (roomId) => Gameroom.findOne({ roomId })

export const createGameroom = (roomData) => Gameroom.create(roomData)

export const updateGameroomById = (id, update, options = {}) =>
  Gameroom.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    ...options,
  })

export const deleteGameroomById = (id) => Gameroom.findByIdAndDelete(id)
