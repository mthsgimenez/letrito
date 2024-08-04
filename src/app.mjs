import express from "express";
import { engine } from "express-handlebars";
import defaultRouter from "./routes/default.mjs";
import searchRouter from "./routes/search.mjs";

const app = express();
const port = process.env.PORT || 3000;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.static("./src/public"));

app.use("/", defaultRouter);
app.use("/search", searchRouter);

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
