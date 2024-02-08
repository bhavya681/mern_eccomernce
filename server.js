import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import auth from "./routes/auth.js";
import category from "./routes/category.js";
import product from "./routes/product.js";
import path from "path";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, "./client/build")));

const port = process.env.PORT || 8080;

app.use("/api/v1/auth", auth);

app.use("/api/v1/category", category);

app.use("/api/v1/product", product);

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
