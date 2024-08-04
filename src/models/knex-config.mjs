import pkg from "knex";
const { knex } = pkg;

const connection = knex({
   client: "pg",
   connection: {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
   },
});

export { connection };
