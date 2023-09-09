import path from "path";
import express from "express";
import dotEnv from "dotenv";
// import userRoutes from "./router/userRoute.js";
// import uploadRoutes from "./router/uploadRoutes.js";
import chatbot from "./router/chatbotRoutes.js";

// import connectDb from "./config/db.js";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { port } from "./constants/envConstants.js";


dotEnv.config();

// connectDb();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running....");
});

// app.use("/api/user", userRoutes);
// app.use("/api/upload", uploadRoutes);
app.use("/api/chatbot", chatbot)

// app.get("/api/config/payPal", (req, res) => {
//   res.send(process.env.PAYPAL_CLIENT_ID);
// });

// const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", async (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);
app.use(errorHandler);

const Port = port;
app.listen(Port || 8080, console.log("Listening buddy"));
