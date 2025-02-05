import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = ['https://mern-auth-psi-pink.vercel.app/'];

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: allowedOrigins }));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log('Server started'));
