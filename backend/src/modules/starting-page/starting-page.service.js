const startingPageDto = require('./starting-page.dto');
const startingPageRepository = require('./starting-page.repository');
const startingPageValidator = require('./starting-page.validator');

const getMainMenuData = async () => startingPageRepository.getMenuItems();

const getAvailableGames = async () => startingPageRepository.getGamesList();

const createNewMatch = async (matchData) => {
  const validatedMatch = startingPageValidator.validateCreateMatchDto(
    startingPageDto.toCreateMatchDto(matchData)
  );

  return startingPageRepository.createMatch(validatedMatch);
};

module.exports = {
  getMainMenuData,
  getAvailableGames,
  createNewMatch,
};
