// Simple script to test if canvas is properly installed
const { createCanvas } = require("canvas");

try {
  console.log("Creating canvas...");
  const canvas = createCanvas(200, 200);
  console.log("Canvas created successfully!");
  const ctx = canvas.getContext("2d");
  console.log("Context created successfully!");
  ctx.fillStyle = "green";
  ctx.fillRect(10, 10, 100, 100);
  console.log("Drew a rectangle on canvas. Canvas is working properly!");
} catch (error) {
  console.error("Error testing canvas:", error);
}
