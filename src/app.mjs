import express from "express";
import bodyParser from "body-parser";
import { create } from "express-handlebars";
import router from "./routes/router.mjs";

const app = express();
const port = process.env.PORT || 3000;

const hbs = create({
   helpers: {
      encode(str) { return encodeURIComponent(str); },
   },
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.json());
app.use(express.urlencoded());

app.use(express.static("./src/public"));

app.use("/", router);

app.use((req, res) => {
   res.type("text/plain");
   res.status(404);
   res.send("404 - Not Found");
});

app.use((err, req, res, next) => {
   console.error(err.message);
   res.type("text/plain");
   res.status(500);
   res.send("500 - Internal Server Error");
});

app.listen(port, () => console.log(`Express started on http://localhost:${port}`));