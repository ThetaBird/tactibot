const langOrder = [
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
const operators = {
  rookie: ["Rookie", "Новобранец"],
  hawk: ["Hawk", "Ястреб"],
  jason: ["Jason", "Джейсон"],
  boris: ["Boris", "Борис"],
  thor: ["Thor", "Тор"],
  rick: ["Rick", "Рик"],
  mishka: ["Mishka", "Мишка"],

  klaus: ["Klaus", "Клаус"],
  shi: ["Shi", "Ши"],
  victor: ["Victor", "Виктор"],
  spencer: ["Spencer", "Спенсер"],
  travis: ["Travis", "Трэвис"],
  batya: ["Batya", "Батя"],

  varg: ["Varg", "Варг"],
  david: ["David", "Дэвид"],
  syndrome: ["Syndrome", "Синдром"],
  joe: ["Joe", "Джо"],
  valera: ["Valera", "Валера"],
  capisce: ["Capisce", "Дерзкий"],
  owen: ["Owen", "Оуэн"],
  mcmean: ["McMean", "Макмин"],

  epic: [
    "ALL EPICS",
    "ВСЕ ЭПИКИ",
    "EPIC",
    "EPICKIE",
    "EPOS",
    "EPICA",
    "EPICO",
    "TODOS OS ÉPICOS",
    "TODOS OS ÉPICOS",
    "EFSANEVI",
    "EPIK",
    "すべてのエピック オペレーター",
  ],
  noOps: [
    "NO OPERATORS",
    "НЕТ ОПЕРАТИВНИКОВ",
    "AUCUN OPÉRATEUR",
    "BRAK OPERATORÓW",
    "KEINE BETREIBER",
    "NESSUN OPERATORE",
    "SIN OPERADORES",
    "NÃO OPERADORES",
    "SEM OPERADORES",
    "OPERATÖR YOK",
    "TIDAK ADA OPERATOR",
    "オペレーターなし",
  ],
};

const getOperatorInLanguages = (op, langs) => {
  let toRet = [];
  for (lang of langs) {
    const langIndex = langOrder.indexOf(lang);
    toRet.push(operators[op][langIndex]);
  }
  return toRet.join("/");
};

module.exports = { getOperatorInLanguages };
