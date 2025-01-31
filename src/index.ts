import "reflect-metadata";
import express from "express";
import productRoute from "./routes/productRoute";
import { PORT } from "./constants/environment";

const app = express();
app.use(express.json());

app.use(productRoute);

app.listen(PORT, () => {
  console.log("Listening to: ", PORT);
});
