const { DisplayContent } = require("./DisplayContent");
const { MissionContent } = require("./MissionContent");
const { getOperatorInLanguages } = require("./OperatorContent");
function Content() {
  this.Missions = new MissionContent();
  this.getOperatorInLanguages = getOperatorInLanguages;
  this.Display = new DisplayContent();
}

module.exports = { Content: new Content() };
