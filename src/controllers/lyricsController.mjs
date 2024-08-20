async function controller(req, res) {
   const path = req.body.path;
   const artist = req.body.artist;
   const song = req.body.song;
   const coverArt = req.body.coverArt;

   if (path == undefined || artist == undefined || song == undefined || coverArt == undefined) {
      res.sendStatus(400);
      return;
   }

   const url = "https://genius.com" + path;
   
   const lyrics = await getLyrics(url);
   res.render("lyrics", { title: "Letrito", lyrics: lyrics, song: song, coverArt: coverArt, artist: artist });
}

/**
* Scrapes genius.com for lyrics
* @param {string} url - genius.com music url
* @returns {Array.string} An array where each element is a verse from the lyrics
*/
async function getLyrics(url) {
   const req = await fetch(url);
   if (!req.ok) {
      console.log(req.status, req.statusText);
   } else {
      const html = await req.text();

      // Find json inside script tag
      const regex = /JSON\.parse\('(.*)'\);/g;
      const match = regex.exec(html);

      // Get json
      let data = safeJSONParse(match[1]);
      // Get lyrics inside json and strip html tags
      data = data["songPage"]["lyricsData"]["body"]["html"].replace(/<[^>]*>?/gm, '');
      // Removes annotations like "[Chorus]"
      data.replace(/\[.*?\]/gm, '');

      data = data.split("\n");
      const lyrics = [];
      for (let line of data) {
         if (line[0] != "[") {
            lyrics.push(line);
         }
      }
      return lyrics;
   }
}

function safeJSONParse(jsonString) {
   try {
      // Step 1: Unescape JSON strings to handle double-escaped characters
      const unescapedJSON = jsonString.replace(/\\./g, (match) => {
         switch (match) {
            case '\\"': return '"';
            case '\\n': return '\n';
            case '\\t': return '\t';
               // Add more escape sequences as needed
            default: return match[1]; // Remove the backslash
         }
      });

      // Step 2: Parse the unescaped JSON
      const parsedData = JSON.parse(unescapedJSON);

      return parsedData;
   } catch (error) {
      console.error('Error parsing JSON:', error);
      return null; // Handle the error gracefully or throw an exception if necessary
   }
}

export default controller;
