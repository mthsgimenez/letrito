import Jimp from "jimp";

async function controller(req, res) {
   console.log(req.body);

   const artist = req.body.artist;
   const song = req.body.song;
   const verses = req.body.verses;
   const coverArt = req.body.coverArt;

   if (artist == undefined || song == undefined || verses.length < 1 || coverArt == undefined) {
      res.send("Invalid");
   }

   const image = await generateImage(song, artist, verses, "#cac9e2", coverArt);
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
* @returns {string} path - Path on the filesystem to the generated image
*/
async function generateImage(song, artist, verses, color, coverArt) {
   const image = new Jimp(800, 600, color);

   const coverArtSize = 85;
   const padding = 15;

   const coverPromise = await Jimp.read(coverArt);
   const maskPromise = await Jimp.read("./src/resources/mask.png");
   const boldFontPromise = await Jimp.loadFont("./src/resources/Inter24_pt-Bold.fnt");
   const regularFontPromise = await Jimp.loadFont("./src/resources/Inter24_pt-Regular.fnt");

   const [cover, mask, boldFont, regularFont] = await Promise.all([coverPromise, maskPromise, boldFontPromise, regularFontPromise]);

   const boldFontHeight = Jimp.measureTextHeight(boldFont, "A", 30);

   let longestVerse = "";
   let y = coverArtSize + boldFontHeight;
   for (let verse of verses) {
      image.print(boldFont, padding, y, verse);
      y += boldFontHeight;
      if (verse.length > longestVerse.length) longestVerse = verse;
   }

   image.print(boldFont, padding * 2 + coverArtSize, boldFontHeight, song);
   image.print(regularFont, padding * 2 + coverArtSize, boldFontHeight * 2, artist);

   cover.resize(coverArtSize, coverArtSize);
   cover.mask(mask, 0, 0);

   image.composite(cover, padding, padding);

   image.crop(0, 0, padding * 3 + Jimp.measureText(boldFont, longestVerse), coverArtSize + boldFontHeight * verses.length + padding * 2);

   const path = "./src/public/img/" + Date.now() + ".png";
   await image.writeAsync(path);

   return path;
}

export default controller;
