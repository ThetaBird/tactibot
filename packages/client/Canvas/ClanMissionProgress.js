const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const {
  getImageFromComponentList,
  getImageComponent,
  getTextComponent,
  getTemplate,
  getImageFromIMGURL,
} = require("./_Util");

const width = 1000; // define width and height of canvas
const height = 1000;
const backgroundColour = "rgba(0,0,0,0)";
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

let template;

const loadImages = async () =>
  (template = await getTemplate("Stat_Template_M_PROG"));
loadImages();

const Colors = {
  PZDBlack: "#0e0e12",
  PZDWhite: "#d4e7e5",
  PZDGold: "#f2c94c",
  PZDGrey: "#828282",
  PZDBeige: "#faf7d5",
  tag_0: "#ffffff",
  tag_1: "#77d074",
  tag_2: "#5ec3c1",
  tag_3: "#3d76bb",
  tag_4: "#8d4dca",
  tag_5: "#d143b4",
  tag_6: "#cb4d48",
  tag_7: "#d18f3d",
  tag_8: "#efd866",
  tag_9: "#efd866",
  darkgrey: "#19191d",
  red: "#d74343",
};

const createClanMissionProgressImage = async (data) => {
  const imageComponentPromise = getImageComponents(data);
  const imageComponents = await imageComponentPromise;

  const test = getImageFromComponentList(1280, 705, imageComponents);
  return test;
};

const getImageComponents = async (data) => {
  const {
    mCount,
    mPct,
    pPoints,
    pRequired,
    timeLeft,
    tag,
    name,
    tagColor,
    bestPlayer,
    worstPlayer,
    avg,
  } = data;

  const componentList = [];

  try {
    const clanTagComponent = getTextComponent(
      `[${tag}] `,
      55,
      90,
      Colors[`tag_${tagColor}`],
      "bold 36pt panzerdog"
    );
    const clanNameComponent = getTextComponent(
      `${name} `,
      75 + clanTagComponent.width,
      90,
      Colors.PZDWhite,
      "bold 36pt panzerdog"
    );

    const bestPlayerPoints = getTextComponent(
      `${bestPlayer.progressPoints}`,
      80,
      470,
      Colors.PZDGold,
      "bold 40pt panzerdog"
    );
    const bestPlayerName = getTextComponent(
      `(${bestPlayer.name})`,
      100 + bestPlayerPoints.width,
      470,
      Colors.PZDWhite,
      "bold 40pt panzerdog"
    );

    const worstPlayerPoints = getTextComponent(
      `${worstPlayer.progressPoints}`,
      80,
      603,
      Colors.red,
      "bold 40pt panzerdog"
    );
    const worstPlayerName = getTextComponent(
      `(${worstPlayer.name})`,
      100 + worstPlayerPoints.width,
      603,
      Colors.PZDWhite,
      "bold 40pt panzerdog"
    );

    const progressDonut = await getImageFromIMGURL(
      await getMissionProgressDonut(pPoints, pRequired, timeLeft)
    );
    componentList.push(
      getImageComponent(template, 0, 0, 1280, 705),

      clanTagComponent,
      clanNameComponent,

      bestPlayerPoints,
      bestPlayerName,

      worstPlayerPoints,
      worstPlayerName,

      getImageComponent(progressDonut, 730, 112, 480, 480),
      //getTextComponent(`MISSION PROGRESS`, 50, 165, Colors.PZDWhite, "bold 70pt panzerdog", "left"),
      getTextComponent(
        `${avg}`,
        80,
        335,
        Colors.PZDGold,
        "bold 50pt panzerdog"
      ),
      getTextComponent(
        `${translateTimeLeft(timeLeft)}`,
        330,
        335,
        Colors.PZDWhite,
        "bold 50pt panzerdog"
      ),

      getTextComponent(
        `${mPct}%`,
        970,
        370,
        Colors.PZDWhite,
        "bold 72pt panzerdog",
        "center"
      ),
      getTextComponent(
        `${mCount} Missions`,
        970,
        450,
        Colors.PZDGrey,
        "20pt panzerdog",
        "center"
      ),
      getTextComponent(
        `${pPoints} / ${pRequired}`,
        970,
        415,
        Colors.PZDGrey,
        "20pt panzerdog",
        "center"
      )
    );
  } catch (error) {
    console.error(error);
  }

  return componentList;
};

const getMissionProgressDonut = (pPoints, pRequired, timeLeft) => {
  const TOTAL_TIME = 360_000_000;
  const points_per_ms = pRequired / TOTAL_TIME;
  const timePassed = TOTAL_TIME - timeLeft;
  const expectedPoints = Math.floor(points_per_ms * timePassed);

  const isBehind = pPoints < expectedPoints;
  const diff = Math.abs(pPoints - expectedPoints);

  const firstBar = isBehind ? pPoints : expectedPoints;
  const secondBar = diff;
  const thirdBar = pRequired - (firstBar + secondBar);

  console.log({
    timePassed,
    points_per_ms,
    expectedPoints,
  });

  console.log({
    pPoints,
    pRequired,
    firstBar,
    secondBar,
    thirdBar,
    isBehind,
  });

  //const pLeft = pRequired - pPoints;
  const data = {
    datasets: [
      {
        label: "My First Dataset",
        data: [firstBar, secondBar, thirdBar],
        backgroundColor: [
          "#f2c94c",
          isBehind ? "#8fff98" : "#8fff98",
          "rgba(255,255,255,0.05)",
        ],
      },
    ],
  };
  const config = {
    type: "doughnut",
    data: data,
    options: {
      borderColor: "rgba(0,0,0,0)",
      cutout: "85%",
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    },
  };

  return chartJSNodeCanvas.renderToDataURL(config); // converts chart to image
};

const translateTimeLeft = (num) => {
  const ONE_DAY = 86_400_000;
  const ONE_HOUR = 3_600_000;
  const ONE_MINUTE = 60_000;

  if (num <= ONE_MINUTE) return "0m";

  let days = 0;
  let hours = 0;
  let minutes = 0;

  let numLeft = num;

  while (numLeft > ONE_MINUTE) {
    if (numLeft >= ONE_DAY) {
      days++;
      numLeft -= ONE_DAY;
      continue;
    }

    if (numLeft >= ONE_HOUR) {
      hours++;
      numLeft -= ONE_HOUR;
      continue;
    }

    if (numLeft >= ONE_MINUTE) {
      minutes++;
      numLeft -= ONE_MINUTE;
      continue;
    }
  }

  console.log({ days, hours, minutes });
  let toRet = "";
  if (hours) toRet += hours + "h ";
  else toRet += minutes + "m";

  if (days) toRet = `${days}d ${toRet}`;
  else if (hours) toRet += minutes + "m";

  return toRet;
};

module.exports = {
  createClanMissionProgressImage,
};
