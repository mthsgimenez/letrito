const token = {
   token: undefined,
   expires: undefined,
};

async function init() {
   await getToken();
}

async function searchCover(query) {
   if (token.expires < Date.now()) {
      await getToken();
      console.log("Refreshed");
   }

   const req = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
      headers: {
         "Authorization": "Bearer " + token.token
      }
   });

   if (!req.ok) {
      console.error(req.status, req.statusText);
   } else {
      const data = await req.json();
      const cover = data["tracks"]["items"][0]["album"]["images"][0]["url"];
      if (cover != undefined) return cover;
      return null;
   }
}

async function getToken() {
   const req = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
         "content-type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
         "grant_type": "client_credentials",
         "client_id": process.env.SPOTIFY_CLIENT_ID,
         "client_secret": process.env.SPOTIFY_CLIENT_SECRET,
      })
   });
   if (!req.ok) {
      console.error(req.status, req.statusText);
   } else {
      const data = await req.json();
      token["token"] = data["access_token"];
      token["expires"] = new Date(Date.now() + data["expires_in"] * 1000);
   }
}

export { init, searchCover };
