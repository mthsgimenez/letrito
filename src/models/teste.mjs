import { connection as knex } from "./knex-config.mjs";

async function teste() {
   const musics = await knex.select().from("musics");

   for (let music of musics) {
      console.log(music);
   }
}

export { teste };
