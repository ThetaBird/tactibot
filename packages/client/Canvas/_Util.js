const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs");

const IMGURL = `https://club.tacticool.game`;

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
  tag_8: "#f2c94c", //efd866
  tag_9: "#f2c94c", //efd866

  common: "#faf7d5",
  uncommon: "#2385db",
  rare: "#7923db",
  epic: "#dc8c24",
  legendary: "#f2e935",
  empty: "#292b2b",
  clan: "#f2c94c",
};

Canvas.registerFont("./Fonts/Panzerdog-Bold.ttf", {
  family: "panzerdog",
  weight: "regular",
});
Canvas.registerFont("./Fonts/NotoSans-Bold.ttf", {
  family: "NotoSans",
  weight: "bold",
});
Canvas.registerFont("./Fonts/GGSans-Bold.ttf", {
  family: "GGSans",
  weight: "bold",
});
Canvas.registerFont("./Fonts/Inter-Bold.ttf", {
  family: "Inter",
  weight: "bold",
});
Canvas.registerFont("./Fonts/ubuntu.ttf", { family: "Ubuntu", weight: "bold" });
Canvas.registerFont("./Fonts/Panzerdog-Black.ttf", {
  family: "panzerdog",
  weight: "bold",
});

const measureCanvas = Canvas.createCanvas(1, 1);
const measureCtx = measureCanvas.getContext("2d");

const textWidth = (text, font) => {
  const _font = `${font}, Inter-Bold, sans-serif, serif`;
  measureCtx.font = _font;
  return measureCtx.measureText(text).width;
};

//Canvas.registerFont("./Fonts/Panzerdog-Regular.ttf", {family:'panzerdog',weight:'regular'} );

const getTemplate = (templateName) => {
  return Canvas.loadImage(`./assets/templates/${templateName}.png`);
};

const getFileFromPath = async (path, value, ext = "png") => {
  if (!path.length || !value) return;
  let img = null;
  try {
    img = await Canvas.loadImage(`./${path}/${value}.${ext}`);
  } catch (error) {
    console.log("Error1");
    console.error(error);
    try {
      const url = `${IMGURL}/${path}/${value}.${ext}`;
      console.log({ url });
      img = await Canvas.loadImage(url);
      saveFile(`${path}/${value}.${ext}`, url);
    } catch (error) {
      img = await Canvas.loadImage(`./${path}/0.${ext}`);
      console.log("error2");
      console.error(error);
    }

    //return getFileFromURL(path);
  }
  console.log(img);
  return img;
};

const getMatrixComponent = (matrix, x, y) => {
  return { type: "matrix", matrix, x, y };
};

const getImageComponent = (image, x, y, width, height, rotation) => {
  return {
    type: "image",
    image,
    x,
    y,
    width,
    height,
    rotation,
  };
};

const getTextComponent = (
  content,
  x,
  y,
  fillStyle,
  font,
  textAlign = "left",
  maxWidth
) => {
  return {
    type: "text",
    content,
    x,
    y,
    fillStyle,
    font,
    textAlign,
    maxWidth,
    width: textWidth(content, font),
  };
};

const getImageFromIMGURL = (url) => {
  return Canvas.loadImage(url);
};

const saveFile = async (path, url) => {
  const writer = fs.createWriteStream(`./${path}`);
  const { data, status } = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  if (status != 200) return;

  data.pipe(writer);
};

const getImageFromComponentList = (cWidth, cHeight, componentList) => {
  let canvas = Canvas.createCanvas(cWidth, cHeight);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0e0e12"; //"#111111"; //Background color
  ctx.fillRect(0, 0, canvas.width, canvas.height); //Background

  ctx.fillStyle = "#d4e7e5"; //text color
  ctx.textAlign = "left";
  ctx.font = "bold 16pt GGSans";

  for (component of componentList) {
    const { x, y, type } = component;
    switch (type) {
      case "text":
        const { content, fillStyle, font, textAlign, maxWidth } = component;
        if (!content?.length) continue;
        const lineHeight = 14;

        let _font = `${font}, GGSans, sans-serif`;
        ctx.fillStyle =
          fillStyle && ctx.fillStyle != fillStyle ? fillStyle : ctx.fillStyle;
        ctx.font = _font && ctx.font != _font ? _font : ctx.font;
        ctx.textAlign =
          textAlign && ctx.textAlign != textAlign ? textAlign : ctx.textAlign;

        let splitContent = content.split("\n");
        splitContent.forEach((line, i) => {
          if (maxWidth) {
            const fontSizeStr = ctx.font.match(/ (\d+)pt/);
            if (!fontSizeStr) return;
            const fIdx = ctx.font.indexOf("pt");
            const bIdx = ctx.font.indexOf(fontSizeStr);

            const beginningOfFont = ctx.font.substring(0, bIdx);
            const restOfFont = ctx.font.substring(fIdx);
            let fontSize = parseInt(fontSizeStr);
            while (maxWidth < ctx.measureText(line).width) {
              ctx.font = `${beginningOfFont}${fontSize--}${restOfFont}`;
            }
            //const tempW =
          }
          ctx.fillText(line, x, y + lineHeight * i);
        });

        break;
      case "image":
        const { image, width, height, rotation } = component;
        if (!image) continue;
        //if(rotation) drawImage(ctx, image, x, y, 1, - Math.PI / 2)
        ctx.drawImage(image, x, y, width, height);
        break;
      case "matrix":
        const { matrix } = component;
        drawMatrixComponent(ctx, x, y, matrix);
    }
  }

  return canvas.toBuffer();
};

const drawMatrixComponent = (ctx, rootX, rootY, matrix) => {
  //double matrix - [[],[],[]]

  //each first-level represents dots going horizontally
  //each second level goes down
  //each cell is a color

  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      const color = matrix[y][x];
      if (!color) continue;

      const [circleX, circleY] = [rootX + x * 10, rootY + y * 10];
      drawCircle(ctx, color, circleX, circleY);
    }
  }
};

const drawCircle = (ctx, color, x, y) => {
  ctx.beginPath();
  ctx.arc(x + 6, y, 3, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
};

function drawImage(ctx, image, x, y, scale, rotation) {
  ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
  ctx.rotate(rotation);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

module.exports = {
  Colors,
  getFileFromPath,
  getImageFromComponentList,
  getImageFromIMGURL,
  getImageComponent,
  getTextComponent,
  getMatrixComponent,
  getTemplate,
};
