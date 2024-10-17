import express, { Express, Request, Response } from "express";
import { port } from './config';
import { initializeDB } from './data-source'
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan";
import routes from "./route";

const app: Express = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))

app.use("/api", routes)
const server = app.listen(port, async () => {
  await initializeDB()
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default server