const {
  sortMissionOperators,
  sortOperatorEarning,
  filterOperatorEarning,
  findLastNonNullIndex,
  findFirstNonNullIndex,
} = require("./PlacementsManager_Util");
function PlacementsManager(tactiClan) {
  this.tactiClan = tactiClan;
  this.createPlacements = (missions, completed) => {
    return buildPlacements(this.tactiClan, missions, completed);
  };
}

module.exports = { PlacementsManager };

const allOperatorEarnings = {
  //Mission:SHW   LOG  HAM  BSC   BSS  CLN CMN  KNF  LOC  REC  HIL  RAR  BAY  UNC  COV  BRC null
  rookie: {
    sho: 55,
    log: 55,
    ham: 50,
    bas: 80,
    bss: 50,
    cle: 55,
    com: 150,
    kni: 45,
    loc: 50,
    rec: 55,
    hildr: 50,
    rar: 30,
    bay: 35,
    unc: 30,
    cov: 55,
    bre: 55,
    null: 0,
  },
  hawk: {
    sho: 70,
    log: 70,
    ham: 60,
    bas: 100,
    bss: 60,
    cle: 70,
    com: 150,
    kni: 55,
    loc: 140,
    rec: 150,
    hildr: 60,
    rar: 40,
    bay: 40,
    unc: 40,
    cov: 70,
    bre: 70,
    null: 0,
  },
  jason: {
    sho: 70,
    log: 150,
    ham: 60,
    bas: 100,
    bss: 160,
    cle: 70,
    com: 150,
    kni: 55,
    loc: 60,
    rec: 70,
    hildr: 60,
    rar: 40,
    bay: 150,
    unc: 40,
    cov: 70,
    bre: 70,
    null: 0,
  },
  boris: {
    sho: 70,
    log: 70,
    ham: 190,
    bas: 100,
    bss: 60,
    cle: 70,
    com: 150,
    kni: 55,
    loc: 60,
    rec: 70,
    hildr: 60,
    rar: 40,
    bay: 150,
    unc: 40,
    cov: 70,
    bre: 150,
    null: 0,
  },
  thor: {
    sho: 70,
    log: 70,
    ham: 60,
    bas: 100,
    bss: 60,
    cle: 150,
    com: 150,
    kni: 55,
    loc: 60,
    rec: 70,
    hildr: 300,
    rar: 40,
    bay: 150,
    unc: 40,
    cov: 70,
    bre: 70,
    null: 0,
  },
  rick: {
    sho: 70,
    log: 70,
    ham: 190,
    bas: 100,
    bss: 60,
    cle: 70,
    com: 150,
    kni: 55,
    loc: 60,
    rec: 70,
    hildr: 60,
    rar: 40,
    bay: 150,
    unc: 40,
    cov: 150,
    bre: 70,
    null: 0,
  },
  mishka: {
    sho: 150,
    log: 70,
    ham: 190,
    bas: 100,
    bss: 60,
    cle: 70,
    com: 150,
    kni: 55,
    loc: 140,
    rec: 70,
    hildr: 60,
    rar: 40,
    bay: 40,
    unc: 40,
    cov: 70,
    bre: 70,
    null: 0,
  },

  klaus: {
    sho: 85,
    log: 85,
    ham: 240,
    bas: 120,
    bss: 70,
    cle: 85,
    com: 50,
    kni: 65,
    loc: 70,
    rec: 180,
    hildr: 70,
    rar: 50,
    bay: 155,
    unc: 180,
    cov: 85,
    bre: 85,
    null: 0,
  },
  shi: {
    sho: 85,
    log: 180,
    ham: 70,
    bas: 120,
    bss: 70,
    cle: 85,
    com: 50,
    kni: 240,
    loc: 70,
    rec: 85,
    hildr: 70,
    rar: 50,
    bay: 155,
    unc: 180,
    cov: 85,
    bre: 85,
    null: 0,
  },
  victor: {
    sho: 85,
    log: 85,
    ham: 70,
    bas: 120,
    bss: 70,
    cle: 85,
    com: 50,
    kni: 240,
    loc: 70,
    rec: 85,
    hildr: 70,
    rar: 50,
    bay: 155,
    unc: 180,
    cov: 85,
    bre: 180,
    null: 0,
  },
  spencer: {
    sho: 85,
    log: 85,
    ham: 70,
    bas: 120,
    bss: 190,
    cle: 180,
    com: 50,
    kni: 65,
    loc: 70,
    rec: 85,
    hildr: 70,
    rar: 50,
    bay: 155,
    unc: 180,
    cov: 85,
    bre: 85,
    null: 0,
  },
  travis: {
    sho: 85,
    log: 85,
    ham: 70,
    bas: 120,
    bss: 70,
    cle: 85,
    com: 50,
    kni: 240,
    loc: 70,
    rec: 85,
    hildr: 70,
    rar: 50,
    bay: 155,
    unc: 180,
    cov: 180,
    bre: 85,
    null: 0,
  },
  batya: {
    sho: 180,
    log: 85,
    ham: 240,
    bas: 120,
    bss: 70,
    cle: 85,
    com: 50,
    kni: 65,
    loc: 170,
    rec: 85,
    hildr: 70,
    rar: 50,
    bay: 50,
    unc: 180,
    cov: 85,
    bre: 85,
    null: 0,
  },

  varg: {
    sho: 115,
    log: 115,
    ham: 95,
    bas: 160,
    bss: 95,
    cle: 115,
    com: 65,
    kni: 90,
    loc: 95,
    rec: 240,
    hildr: 480,
    rar: 240,
    bay: 65,
    unc: 65,
    cov: 115,
    bre: 115,
    null: 0,
  },
  david: {
    sho: 115,
    log: 240,
    ham: 95,
    bas: 160,
    bss: 255,
    cle: 115,
    com: 65,
    kni: 90,
    loc: 95,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 210,
    unc: 65,
    cov: 115,
    bre: 115,
    null: 0,
  },
  syndrome: {
    sho: 115,
    log: 115,
    ham: 95,
    bas: 160,
    bss: 95,
    cle: 115,
    com: 65,
    kni: 90,
    loc: 225,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 65,
    unc: 65,
    cov: 115,
    bre: 240,
    null: 0,
  },
  joe: {
    sho: 115,
    log: 115,
    ham: 95,
    bas: 160,
    bss: 95,
    cle: 240,
    com: 65,
    kni: 90,
    loc: 225,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 65,
    unc: 65,
    cov: 115,
    bre: 115,
    null: 0,
  },
  valera: {
    sho: 115,
    log: 115,
    ham: 95,
    bas: 160,
    bss: 95,
    cle: 115,
    com: 65,
    kni: 320,
    loc: 95,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 65,
    unc: 65,
    cov: 240,
    bre: 115,
    null: 0,
  },
  capisce: {
    sho: 240,
    log: 115,
    ham: 95,
    bas: 160,
    bss: 95,
    cle: 115,
    com: 65,
    kni: 90,
    loc: 225,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 65,
    unc: 65,
    cov: 115,
    bre: 115,
    null: 0,
  },
  owen: {
    sho: 115,
    log: 240,
    ham: 95,
    bas: 160,
    bss: 255,
    cle: 115,
    com: 65,
    kni: 90,
    loc: 225,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 210,
    unc: 65,
    cov: 115,
    bre: 115,
    null: 0,
  },
  mcmean: {
    sho: 115,
    log: 115,
    ham: 95,
    bas: 160,
    bss: 95,
    cle: 240,
    com: 65,
    kni: 90,
    loc: 225,
    rec: 115,
    hildr: 100,
    rar: 240,
    bay: 65,
    unc: 65,
    cov: 115,
    bre: 115,
    null: 0,
  },

  epic: {
    sho: 0,
    log: 0,
    ham: 0,
    bas: 0,
    bss: 0,
    cle: 0,
    com: 0,
    kni: 0,
    loc: 0,
    rec: 0,
    hildr: 0,
    rar: 0,
    bay: 0,
    unc: 0,
    cov: 0,
    bre: 0,
    null: 0,
  },
};

function buildPlacements(tactiClan, missions, completed = null) {
  const operatorPriority =
    tactiClan["placementPreferences"]["operator_priority"];
  const epicPriority = tactiClan["placementPreferences"]["epic_position"];
  const repositions = tactiClan["placementPreferences"]["show_movements"];

  const operatorEarningsForMissions = getAllOperatorEarnings(missions);
  const processedOperatorEarnings = processAllOperatorEarnings(
    operatorEarningsForMissions,
    operatorPriority
  );
  const placements = processOperatorEarningsIntoMissions(
    processedOperatorEarnings,
    missions,
    epicPriority
  );

  let specificMovements = null;
  if (completed) {
    const repo = getSpecificRepositions(placements, completed);
    specificMovements = formatRepositions(repo);
  }

  if (repositions) {
    const lastMissionIndx = findLastNonNullIndex(missions);
    getAllOperatorRepositions(placements, lastMissionIndx);
  }

  const formattedPlacements = formatPlacements(placements);
  return { formattedPlacements, specificMovements };
}

const formatPlacements = (placements) => {
  let totalMissionPlacements = {};
  for (const missionPlacements of placements) {
    const { num, name, operators, repositions } = missionPlacements;
    const mappedOperators = operators.map((operator) => operator.name);
    const mappedRepositions = formatRepositions(repositions);
    const displayMissionPlacements =
      //new PlacementOptions.MissionPlacements(num+1, name, mappedOperators, mappedRepositions)
      {
        num: num + 1,
        mission: name,
        operators: mappedOperators,
        operatorMovements: mappedRepositions,
      };

    totalMissionPlacements[`${num}`] = displayMissionPlacements;
  }

  return totalMissionPlacements; //new PlacementOptions.TotalPlacements(totalMissionPlacements);
};
const formatRepositions = (repositions) => {
  let formattedRepositions = [];
  for (const operator of repositions) {
    const { name, repositionNum } = operator;
    let foundRepositionMission = formattedRepositions.find(
      (mission) => mission.repositionNum == repositionNum
    );
    if (!foundRepositionMission) {
      formattedRepositions.push({ repositionNum, operators: [name] });
      continue;
    }
    foundRepositionMission.operators.push(name);
  }
  return formattedRepositions;
};
const getSpecificRepositions = (placements, done) => {
  done.sort();

  let lostOperators = [];
  let repositions = [];
  for (missionNum of done) {
    const operators = placements[missionNum].operators;
    if (!operators) {
      continue;
    }
    lostOperators.push(...operators);
  }

  for (const operator of lostOperators) {
    const nextMission_index = operator.operatorEarning.findIndex(
      (mission) => !done.includes(`${mission.num}`)
    );
    if (nextMission_index == -1) continue;

    const nextMission = operator.operatorEarning[nextMission_index];
    repositions.push({ name: operator.name, repositionNum: nextMission.num });

    operator.operatorEarning.splice(0, nextMission_index + 1);
    placements[nextMission.num].operators.push(operator);
  }

  for (missionNum of done) {
    placements[missionNum].name = null;
    placements[missionNum].operators = [];
  }

  return repositions;
  //placements has been modified to exclude the completed missions & the operators have been moved to their new places;
};

/**
 * operators:
 * [
 *  operator {
 *    name,
 *    operatorEarning : [
 *      {num, earning}
 *    ]
 *  }
 * ]
 */

const getAllOperatorEarnings = (missions) => {
  const len = missions.length;
  let operatorEarnings = {};
  for (const operatorName in allOperatorEarnings) {
    let operatorEarning = [];
    const specificOperatorEarnings = allOperatorEarnings[operatorName];

    for (let num = 0; num < len; num++) {
      operatorEarning.push({
        num,
        earning: specificOperatorEarnings[missions[`${num}`]],
      });
    }

    operatorEarnings[operatorName] = operatorEarning;
  }

  return operatorEarnings;
};

const getAllOperatorRepositions = (placements, lastMissionIndx) => {
  let placementsCopy = JSON.parse(JSON.stringify(placements));
  for (const mission of placementsCopy) {
    const { num, operators } = mission;
    if (num == lastMissionIndx) continue;

    for (const operator of operators) {
      const { name, operatorEarning } = operator;
      if (!operatorEarning[0]) continue;

      const foundMissionIndex = operatorEarning.findIndex((e) => e.num > num);
      if (foundMissionIndex == -1) continue;

      const foundOperatorEarning = operatorEarning
        .splice(foundMissionIndex, 1)
        .at(0);

      const repositionNum = foundOperatorEarning.num;
      placementsCopy[repositionNum].operators.push(operator);
      placements[num].repositions.push({ name, repositionNum });
    }
    //sortMissionOperators(placementsCopy[repositionNum].operators);
  }
};

const processOperatorEarningsIntoMissions = (
  operatorEarnings,
  missions,
  epicPriority
) => {
  let placements = missions.map((mission, index) => {
    return { num: index, name: mission, operators: [], repositions: [] };
  });

  for (const operator in operatorEarnings) {
    const operatorEarning = operatorEarnings[operator];
    console.log(operatorEarning);
    const { num, earning } = operatorEarning.shift();
    const actualNum =
      operator == "epic" ? getEpicPosition(missions, epicPriority) : num;
    if (actualNum == -1) continue;
    placements[actualNum].operators.push({
      name: operator,
      operatorEarning,
      earning,
    });
  }

  for (const mission of placements) {
    sortMissionOperators(mission.operators);
  }

  return placements;
};

const processAllOperatorEarnings = (operatorEarnings, priority) => {
  let processedOperatorEarnings = {};
  for (const operator in operatorEarnings) {
    const operatorEarning = operatorEarnings[operator];
    const sorted = sortOperatorEarning(operatorEarning, priority);
    const filtered = filterOperatorEarning(sorted);
    processedOperatorEarnings[operator] = filtered;
  }

  return processedOperatorEarnings;
};

const getEpicPosition = (missions, epic) => {
  const lastMissionIndx = findLastNonNullIndex(missions);
  const firstMissionIndx = findFirstNonNullIndex(missions);

  if (epic == "first") return firstMissionIndx;
  if (epic == "last" && lastMissionIndx != -1) return lastMissionIndx;

  if (epic == "prelast" && lastMissionIndx >= 1) {
    var preLastIndx = lastMissionIndx;
    for (var i = lastMissionIndx - 1; i >= 0; i--) {
      if (missions[i] != null) {
        preLastIndx = i;
        break;
      }
    }
    return preLastIndx;
  }

  return -1;
};
