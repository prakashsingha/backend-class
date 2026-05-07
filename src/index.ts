import express, { Application, Request, Response } from "express";
import subjectRouter from "./routes/subject";
import cors from "cors";

const app: Application = express();
const PORT = process.env.PORT || 8000;

const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
  throw new Error("FRONTEND_URL is not defined");
}

app.use(
  cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// routes
app.use("/api/subjects", subjectRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}...`);
});
