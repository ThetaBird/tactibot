const ValidLangs = [
  "en",
  "ru",
  "fr",
  "pl",
  "deu",
  "it",
  "es",
  "ptp",
  "ptb",
  "tr",
  "id",
  "ja",
];
const fillerMissionText = [
  "only",
  "nur",
  "mission",
  "apenas",
  "somente",
  "только",
  "uniquement",
  "tylko",
  "solo",
  "yalnizca",
  "khusus",
  "задание",
  "missione",
  "misja",
  "mision",
  "missao",
  "gorev",
  "misi",
  "de",
  "di",
  "ayarlar",
  "disi",
  "finale",
  "ミッション",
  "のみ",
];
const { Content } = require("../../Content/_Map");
const stringSimilarity = require("string-similarity");
const SPECIALCHARACTERREGEX = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;

const processMissions = (arr) => {
  let valid = [];
  let invalid = [];
  for (mission of arr) {
    if (["null", "", null].includes(mission) || mission.includes("(")) {
      valid.push(null);
      continue;
    }

    const condensedMission = removeFillerText(mission);
    const parsedValue = findMission(condensedMission);
    if (parsedValue) {
      valid.push(parsedValue);
      continue;
    }
    invalid.push(mission);
  }

  return invalid.length ? { invalid } : { valid };
};

const processOutputLanguages = (responseLangs) => {
  responseLangs = responseLangs.replace(SPECIALCHARACTERREGEX, " ").split(" ");
  let invalid = [];
  let valid = [];
  for (lang of responseLangs) {
    if (lang == "") {
      continue;
    }
    let testLang = lang.toLowerCase();
    if (ValidLangs.indexOf(testLang) == -1) {
      invalid.push(lang);
    } else {
      valid.push(testLang);
    }
  }
  return invalid.length ? { invalid } : { valid };
};

const removeFillerText = (mission) => {
  let condensedMission = mission.replaceAll(" ", "").toLowerCase();
  let largestFillerText = "";
  let largestFillerTextLength = 0;
  for (fillerWord of fillerMissionText) {
    if (
      condensedMission.includes(fillerWord) &&
      fillerWord.length > largestFillerTextLength
    ) {
      largestFillerText = fillerWord;
      largestFillerTextLength = fillerWord.length;
    }
  }
  condensedMission = condensedMission.replace(largestFillerText, "");

  return condensedMission;
};

const findMission = (mission) => {
  for (const missionName in Content.Missions.missionPossibilities) {
    const values = Content.Missions.missionPossibilities[missionName];
    if (values.includes(mission.toLowerCase())) {
      return missionName;
    }
  }
  return null;
};

/**
 * getAutocompleteMissionChoices
 * @date 1/6/2024 - 4:12:09 PM
 * @returns {Array.<{name: string, value: string}>}
 */
const getAutocompleteMissionChoices = (lang, optionValue, missionArr) => {
  let arr = Content.Missions.missionChoices[lang || "en"];
  let toRet = arr.filter((choice) => !missionArr.includes(choice.value));
  if (!optionValue) {
    return toRet;
  }
  let missionNames = toRet.map((object) =>
    object.name.replace(SPECIALCHARACTERREGEX, "")
  );
  let ratings = stringSimilarity.findBestMatch(
    optionValue,
    missionNames
  ).ratings;
  let combined = ratings.map((ratingsElement) => ({
    ...ratingsElement,
    ...toRet.find(
      (choiceElement) =>
        choiceElement.name.replace(SPECIALCHARACTERREGEX, "") ===
        ratingsElement.target
    ),
  }));
  let sorted = combined.sort((a, b) => (a.rating > b.rating ? -1 : 1));
  toRet = sorted.map((element) => ({
    name: element.name,
    value: element.value,
  }));

  return toRet;
};

/**
 * getAutocompleteLanguageChoices
 * @date 1/6/2024 - 4:12:09 PM
 * @returns {Array.<{name: string, value: string}>}
 */
const getAutocompleteLanguageChoices = (optionValue) => {
  let allLangs = [...ValidLangs];
  if (!optionValue)
    return allLangs.map((lang) => ({ name: lang, value: lang }));

  let output = [];
  const values = optionValue
    .replace(SPECIALCHARACTERREGEX, " ")
    .toLowerCase()
    .split(" ")
    .filter((item) => item.length != 0);

  let correctValues = [];
  for (const value of values) {
    let val;
    if (ValidLangs.includes(value)) {
      val = value;
    } else {
      const bestMatch = stringSimilarity.findBestMatch(
        value,
        ValidLangs
      ).bestMatch;
      val = bestMatch.target;
    }
    allLangs = allLangs.filter((lang) => lang != val);
    correctValues.push(val);
  }

  output.push(correctValues.join(" "));
  for (const lang of allLangs) {
    output.push([...correctValues, lang].join(" "));
  }
  return output.map((langString) => ({ name: langString, value: langString }));
};

const getDisplayTextInLanguage = (lang) => {
  return Content.Display.operatorPlacements[lang || "en"];
};

const getAfterTextInLanguages = (langs) => {
  let output = [];
  for (const lang of langs) {
    const afterText = Content.Display.after[lang];
    if (!output.includes(afterText)) output.push(afterText);
  }
  return output.join("/");
};

const getMissionInLanguages = (mission, languages) => {
  if (mission == "bss") {
    return ["b.s.s."];
  }
  if ([null, "hildr"].includes(mission)) {
    return [mission];
  }
  let allLanguagesForMission = Content.Missions.missionPossibilities[mission];
  let toRet = [];
  for (const language of languages) {
    let allMissionsInLanguage = Content.Missions.missionChoices[language];
    let nameInLanguage = allMissionsInLanguage.find((element) =>
      allLanguagesForMission.includes(element.value)
    ).name;
    if (!toRet.includes(nameInLanguage)) {
      toRet.push(nameInLanguage);
    }
  }

  return toRet;
};

const getOperatorsInLanguages = (operators, languages) => {
  let displayOperators = [];
  if (!operators.length) {
    return [Content.getOperatorInLanguages("noOps", languages)];
  }
  const russianIndex = languages.indexOf("ru");
  const langLen = languages.length;
  const opLangs =
    (russianIndex < 0 && ["en"]) ||
    (russianIndex == 0 && langLen == 1 && ["ru"]) ||
    (russianIndex == 0 && langLen > 1 && ["ru", "en"]) ||
    (russianIndex > 0 && ["en", "ru"]);

  for (const operator of operators) {
    const toPush = Content.getOperatorInLanguages(
      operator,
      operator == "epic" ? languages : opLangs
    );
    displayOperators.push(toPush);
  }

  return displayOperators;
};

const processPlacementsInLanguages = (totalPlacements, langs) => {
  createAllMovements(totalPlacements);
  for (const missionPlacementsNum in totalPlacements) {
    const missionPlacements = totalPlacements[missionPlacementsNum];
    const { mission, operators } = missionPlacements;
    if (!mission) continue;

    const displayMissions = getMissionInLanguages(mission, langs)
      .join(" / ")
      .toUpperCase();
    const displayOperators = getOperatorsInLanguages(operators, langs);

    Object.assign(missionPlacements, { displayMissions, displayOperators });
  }

  for (const missionPlacementsNum in totalPlacements) {
    const missionPlacements = totalPlacements[missionPlacementsNum];
    const { mission, operatorMovements } = missionPlacements;
    if (!mission || !operatorMovements) continue;

    let displayOperatorMovements = [];
    for (const receiverMission of operatorMovements) {
      const { missionNum } = receiverMission;
      const movedOperators = receiverMission.operators;

      const displayReceiverMission =
        totalPlacements[`${missionNum}`].displayMissions;
      const displayMovedOperators = getOperatorsInLanguages(
        movedOperators,
        langs
      );
      displayOperatorMovements.push({
        missionNum,
        displayReceiverMission,
        displayMovedOperators,
      });
    }
    Object.assign(missionPlacements, { displayOperatorMovements });
  }
  return totalPlacements;
};

const createAllMovements = (totalPlacements) => {
  for (const missionPlacementNum in totalPlacements) {
    const missionPlacements = totalPlacements[missionPlacementNum];
    if (!missionPlacements.mission || !missionPlacements.operatorMovements)
      continue;

    const { operatorMovements } = missionPlacements;

    let movementUnion = [];

    for (const movementObj of operatorMovements) {
      const missionObj = movementUnion.find(
        (obj) => obj.missionNum == movementObj.repositionNum
      );
      if (!missionObj) {
        movementUnion.push({
          missionNum: movementObj.repositionNum,
          operators: movementObj.operators,
        });
        continue;
      }
      missionObj.operators.push(...movementObj.operators);
    }

    movementUnion.sort((a, b) => {
      return a.missionNum - b.missionNum;
    });

    missionPlacements.operatorMovements = movementUnion;
  }
};

module.exports = {
  getAfterTextInLanguages,
  getDisplayTextInLanguage,
  processMissions,
  processOutputLanguages,
  getAutocompleteMissionChoices,
  getAutocompleteLanguageChoices,
  processPlacementsInLanguages,
};
