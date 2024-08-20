async function controller(req, res) {
   const query = req.query.q;
   if (query != undefined) {
      const results = await searchGenius(query);
      res.render("search", { results: results, title: "Results" });
   } else {
      res.render("search", { results: [], title: "Results" });
   }
}

/**
* Searches genius.com and returns an array of results
* @param {string} query - Music to search for
* @returns {Array.<Object>} results
*/
async function searchGenius(query) {
   const url = "https://genius.com/api/search/multi?per_page=5&q=" + encodeURIComponent(query);

   const req = await fetch(url);

   if (!req.ok) {
      console.log(req.status, req.statusText);
      return [];
   } else {
      const data = await req.json();
      const iter = data["response"]["sections"];

      const results = [];
      for (let result of iter) {
         if (result["type"] === "song") {
            try {
               for (let hit of result["hits"]) {
                  results.push(hit["result"]);
               }
               return results;
            } catch (error) {
               console.log("Couldn't find " + query);
               return [];
            }
         }
      }
      return [];
   }
}


export default controller;
