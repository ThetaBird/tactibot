const Canvas = require("canvas");
//const Util = require("../Util");

let opImages = {};
let ruOpImages = {};
let images = {};

const loadImages = async () => {
  const allOperators = [
    "rookie",
    "hawk",
    "jason",
    "boris",
    "thor",
    "rick",
    "mishka",
    "klaus",
    "shi",
    "victor",
    "spencer",
    "travis",
    "batya",
    "varg",
    "david",
    "syndrome",
    "joe",
    "valera",
    "capisce",
    "owen",
    "mcmean",
    "epic",
  ];
  for (const operator of allOperators) {
    opImages[operator] = await Canvas.loadImage(
      `./assets/faces/en/${operator}.png`
    );
    ruOpImages[operator] = await Canvas.loadImage(
      `./assets/faces/ru/${operator}.png`
    );
  }
  const allOtherImages = [
    "headerImg",
    "count1",
    "count2",
    "count3",
    "count4",
    "count5",
    "count6",
    "count7",
    "count8",
  ];
  for (const image of allOtherImages) {
    images[image] = await Canvas.loadImage(
      `./assets/placementImages/${image}.png`
    );
  }
};
const loadFonts = async () => {
  Canvas.registerFont("./Fonts/gidole.otf", {
    family: "Gidole",
    weight: "normal",
  });
  Canvas.registerFont("./Fonts/Inter-Bold.ttf", {
    family: "Inter-Bold",
    weight: "bold",
  });
  Canvas.registerFont("./Fonts/Inter-Regular.ttf", {
    family: "Inter",
    weight: "regular",
  });
  Canvas.registerFont("./Fonts/ubuntu.ttf", {
    family: "Ubuntu",
    weight: "normal",
  });
  Canvas.registerFont("./Fonts/notoregular.ttf", {
    family: "Noto",
    weight: "normal",
  });
  Canvas.registerFont("./Fonts/notomedium.ttf", {
    family: "NotoMed",
    weight: "normal",
  });
  Canvas.registerFont("./Fonts/notolight.ttf", {
    family: "NotoLight",
    weight: "normal",
  });
  Canvas.registerFont("./Fonts/notodisplaysemibold.ttf", {
    family: "NotoSemiBold",
    weight: "normal",
  });
  Canvas.registerFont("./Fonts/notodisplaybold.ttf", {
    family: "NotoBold",
    weight: "normal",
  });
};

loadImages();
loadFonts();

const getImageBuffer = (totalPlacements, parsedOptions) => {
  const { height, componentList } = getImageComponents(
    totalPlacements,
    parsedOptions
  );
  const imageBuffer = getImageFromComponentList(height, componentList);

  return imageBuffer;
};

module.exports = {
  getImageBuffer,
};

const getImageComponents = (totalPlacements, parsedOptions) => {
  let componentList = [];

  componentList.push({
    type: "image",
    image: images.headerImg,
    y: 0,
    x: 0,
    width: 500,
    height: 100,
  });
  componentList.push({
    type: "text",
    content: parsedOptions.displayText,
    y: 85,
    x: 30,
    fillStyle: "#f5f5f5",
    font: "16pt Inter-Bold",
    textAlign: "left",
  });

  let height = 130; //padding at top

  for (const missionPlacementNum in totalPlacements) {
    const missionPlacements = totalPlacements[missionPlacementNum];
    if (!missionPlacements.mission) continue;
    missionPlacements.displayMissions =
      missionPlacements.displayMissions.split("/");
    const { num, operators, displayMissions, displayOperators } =
      missionPlacements;

    const newHeight = parseMissionLine(displayMissions, height);
    const missionLine = `${displayMissions.join(", ")}`;

    componentList.push({
      type: "image",
      image: images[`count${num}`],
      y: height - 23,
      x: 0,
      width: 45,
      height: 30,
    });

    componentList.push({
      type: "text",
      content: missionLine,
      y: height,
      x: 45,
      fillStyle: "#f5f5f5",
      font: "16pt Inter-Bold",
      textAlign: "left",
    });

    height = newHeight + 20; //padding after mission line

    if (!operators.length) {
      const operatorLine = parseNoOperatorLine(`${displayOperators[0]}`); //"No operators" in languages

      componentList.push({
        type: "text",
        content: operatorLine,
        y: height + 50,
        x: 45,
        fillStyle: "#ff776e",
        font: "14pt Inter-Bold",
        textAlign: "left",
      });

      height += 150; //padding after each mission
      continue;
    }

    let count = 0;
    const LEFT_INITIAL = 20;
    const IMG_DIMENSION = 120;
    let left = LEFT_INITIAL; //initial padding for operators

    for (const operator of operators) {
      if (count && count % 4 == 0) {
        height += IMG_DIMENSION;
        left = LEFT_INITIAL; //reset left
      }
      count++;

      const opImage =
        parsedOptions.mainLang == "ru"
          ? ruOpImages[operator]
          : opImages[operator];
      componentList.push({
        type: "image",
        image: opImage,
        y: height,
        x: left,
        width: IMG_DIMENSION,
        height: IMG_DIMENSION,
      });

      left += IMG_DIMENSION - 5; //shuffle ops closer together
    }

    left = LEFT_INITIAL; //reset left after mission
    height += IMG_DIMENSION; //move height right below inserted operator images

    height += 50; //padding after each mission
  }

  height -= 30; //remove extra padding from last mission at bottom

  return { height, componentList };
};

const getImageFromComponentList = (cHeight, componentList) => {
  let canvas = Canvas.createCanvas(500, cHeight);
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000"; //"#111111"; //Background color
  ctx.fillRect(0, 0, canvas.width, canvas.height); //Background

  ctx.fillStyle = "#f5f5f5"; //text color
  ctx.textAlign = "left";
  ctx.font = "16pt Inter-Bold";

  for (component of componentList) {
    const { x, y, type } = component;
    switch (type) {
      case "text":
        const { content, fillStyle, font, textAlign } = component;
        ctx.fillStyle =
          fillStyle && ctx.fillStyle != fillStyle ? fillStyle : ctx.fillStyle;
        ctx.font = font && ctx.font != font ? font : ctx.font;
        ctx.textAlign =
          textAlign && ctx.textAlign != textAlign ? textAlign : ctx.textAlign;
        ctx.fillText(content, x, y);
        break;
      case "image":
        const { image, width, height } = component;
        ctx.drawImage(image, x, y, width, height);
        break;
    }
  }

  return canvas.toBuffer();
};

const parseMissionLine = (missionInLanguages, height) => {
  let count = 0;
  const length = missionInLanguages.length;
  for (let i = 0; i < length; i++) {
    if (count + missionInLanguages[i].length > 30) {
      height += 23; //padding after mission line in multi-line
      missionInLanguages[i] = `\n${missionInLanguages[i]}`;
      count = missionInLanguages[i].length;
    } else {
      count += missionInLanguages[i].length;
    }
  }

  return height;
};

const parseNoOperatorLine = (noOpLine) => {
  let arr = noOpLine.split("/");
  let count = 0;
  const length = arr.length;

  for (let i = 0; i < length; i++) {
    const lineLen = arr[i].length;
    if (count + lineLen > 30) {
      arr[i] = `\n${arr[i]}`;
      count = lineLen;
    } else {
      count += lineLen;
    }
  }
  return arr.join(" / ");
};
