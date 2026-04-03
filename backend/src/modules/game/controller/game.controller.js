const gameService = require('../service/game.service');

async function createGame(req, res, next) {
  try {
    const game = await gameService.createGame(req.user.userId, req.body);
    res.status(201).json(game);
  } catch (err) { next(err); }
}

async function listRooms(req, res, next) {
  try {
    const rooms = await gameService.listWaitingRooms();
    res.json(rooms);
  } catch (err) { next(err); }
}

async function getRoom(req, res, next) {
  try {
    const room = await gameService.getRoom(req.params.roomId);
    res.json(room);
  } catch (err) { next(err); }
}

async function joinRoom(req, res, next) {
  try {
    const room = await gameService.joinRoom(req.params.roomId, req.user.userId);
    res.json(room);
  } catch (err) { next(err); }
}

async function abortGame(req, res, next) {
  try {
    const result = await gameService.abortGame(req.params.roomId, req.user.userId, false);
    res.json(result);
  } catch (err) { next(err); }
}

async function makeLocalMove(req, res, next) {
  try {
    const result = await gameService.makeLocalMove(req.params.roomId, req.user.userId, req.body);
    res.json(result);
  } catch (err) { next(err); }
}

async function getReplay(req, res, next) {
  try {
    const replay = await gameService.getReplay(req.params.roomId);
    res.json(replay);
  } catch (err) { next(err); }
}

module.exports = { createGame, listRooms, getRoom, joinRoom, abortGame, makeLocalMove, getReplay };
