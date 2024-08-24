import Jimp from "jimp";
import { fetchBuffer } from "../utility/spotify.mjs";

async function controller(req, res) {
   const artist = req.body.artist;
   const song = req.body.song;
   let verses = req.body.verses;
   const backgroundColor = req.body.backgroundColor;
   const whiteFont = req.body.whiteFont;
   const coverArt = req.body.coverArt;
   let useWhiteFont = false;
   if (whiteFont === "true") {
      useWhiteFont = true;
   }

   try {
      verses = JSON.parse(verses);
   } catch {
      res.sendStatus(400);
      return
   }

   if (artist == undefined || song == undefined || verses.length < 1 || backgroundColor == undefined || coverArt == undefined) {
      res.sendStatus(400);
      return;
   }

   const image = await generateImage(song, artist, verses, backgroundColor, coverArt, useWhiteFont);
   res.type("png");
   res.attachment(image);
   res.download(image);
}

/**
* Searches genius.com and returns an array of results
* @param {string} song - Song name
* @param {string} artist - Artist name
* @param {Array.string} verses - Array of strings containing the selected verses
* @param {string} color - Background color for the image in hexadecimal
* @param {string} coverArt - Url to a cover art
* @param {boolean} [white=false] white - Set to true to make font white
* @returns {string} path - Path on the filesystem to the generated image
*/
async function generateImage(song, artist, verses, color, coverArt, white = false) {
   const image = new Jimp(1000, 1000, color);

   const coverArtSize = 85;
   const padding = 15;
   const minWidth = 460;

   const coverBuffer = await fetchBuffer(coverArt);

   const coverPromise = Jimp.read(coverBuffer);
   const maskPromise = Jimp.read("./src/resources/mask.png");

   let fontColor = (white) ? "White" : "Black";
   const boldFontPromise = Jimp.loadFont(`./src/resources/InterBold${fontColor}.fnt`);
   const regularFontPromise = Jimp.loadFont(`./src/resources/InterRegular${fontColor}.fnt`);
   const smallFontPromise = Jimp.loadFont(`./src/resources/Inter20pt${fontColor}.fnt`);

   const logoPromise = Jimp.read(`./src/resources/github${fontColor}.png`);

   const [cover, mask, boldFont, regularFont, smallFont, logo] = await Promise.all([coverPromise, maskPromise, boldFontPromise, regularFontPromise, smallFontPromise, logoPromise]);

   // Song title or artist name width + padding + coverArt
   let width = Jimp.measureText(boldFont, ((artist.length >= song.length) ? artist : song)) + padding + coverArtSize;
   let maxWidth = width - padding;

   // If song title / artist name is too short set width to minWidth
   if (width < minWidth) {
      width = minWidth + padding;
      maxWidth = minWidth;
   }

   const boldCharHeight = Jimp.measureTextHeight(boldFont, "A", width);

   // Verses printing
   let verseHeight = 0;
   let y = coverArtSize + boldCharHeight * 2;
   for (let verse of verses) {
      image.print(boldFont, padding, y, verse, maxWidth);
      verseHeight = Jimp.measureTextHeight(boldFont, verse, maxWidth);
      // Due to weird spacing when text wraps, I have this if statement to make spacing look more uniform
      if (verseHeight > boldCharHeight) { // If text has wrapped
         y += verseHeight + 5;
      } else {
         y += boldCharHeight + 6;
      }
   }

   y += boldCharHeight * 2 - padding;

   // Watermark
   image.print(smallFont, padding * 2 + 20, y - 4, "xspt/letrito");
   image.composite(logo, padding, y);
   y += padding * 2 + 5;

   // Song and artist
   image.print(boldFont, padding * 2 + coverArtSize, boldCharHeight, song);
   image.print(regularFont, padding * 2 + coverArtSize, boldCharHeight * 2, artist);

   // Album cover
   cover.resize(coverArtSize, coverArtSize);
   cover.mask(mask, 0, 0);
   image.composite(cover, padding, padding);

   image.crop(0, 0, width + padding * 2, y);

   const path = "./cache/" + Date.now() + ".png";
   await image.writeAsync(path);

   return path;
}

export default controller;
