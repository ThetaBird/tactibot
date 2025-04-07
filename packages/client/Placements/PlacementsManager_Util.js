//Sort operators placed in a mission by their earning.
const sortMissionOperators = (operators) =>
  operators.sort((a, b) => {
    return b.earning - a.earning;
  });

const MID_MISSION = 4;
//Sort missions timeline for an operator by the priority & earning.
const sortOperatorEarning = (operatorEarning, priority) => {
  const toRet = [...operatorEarning].sort((a, b) => {
    return (
      b.earning - a.earning ||
      (priority == "last"
        ? b.num - a.num
        : priority == "first"
        ? a.num - b.num
        : Math.abs(a.num - MID_MISSION) - Math.abs((b.num = MID_MISSION)) ||
          b.num - a.num)
    );
  });
  return toRet;
};

//Earnings are sorted by earning power & mission number. Filter out lower-positioned missions from the earnings array
//[{num: 5, e:100},{num: 6, e:80},{num: 2, e:75},{num: 8, e:70}] -> [{num: 5, e:100},{num: 6, e:80},{num: 8, e:70}]
const filterOperatorEarning = (operatorEarning) => {
  const filtered = operatorEarning.filter((missionEarnings, index) => {
    return index == 0 || missionEarnings.num > operatorEarning[index - 1].num;
  });
  return filtered;
};

const findLastNonNullIndex = (arr) => {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null) {
      return i;
    }
  }
  return -1;
};

const findFirstNonNullIndex = (arr) => {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] != null) {
      return i;
    }
  }
  return -1;
};
module.exports = {
  sortMissionOperators,
  sortOperatorEarning,
  filterOperatorEarning,
  findLastNonNullIndex,
  findFirstNonNullIndex,
};
