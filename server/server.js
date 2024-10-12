import express from "express";
import { getWeather } from "./controllers/weatherController.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle JSON body data
app.use(bodyParser.json());

app.get("/weather/:location", getWeather);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
