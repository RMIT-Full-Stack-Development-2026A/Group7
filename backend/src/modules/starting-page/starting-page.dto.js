const pickFields = (payload, allowedFields) => {
  return allowedFields.reduce((accumulator, field) => {
    if (payload[field] !== undefined) {
      accumulator[field] = payload[field];
    }

    return accumulator;
  }, {});
};

const MATCH_FIELDS = [
  'mode',
  'gameMode',
  'opponentType',
  'visibility',
  'userId',
];

const toCreateMatchDto = (payload = {}) => pickFields(payload, MATCH_FIELDS);

module.exports = {
  MATCH_FIELDS,
  toCreateMatchDto,
};
