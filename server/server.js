// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/mongodb.js";
// import authRouter from "./routes/auth.routes.js";
// import userRouter from "./routes/user.routes.js";

// const app = express();
// const port = process.env.PORT || 4000;
// // const allowedOrigins = ['https://mern-auth-psi-pink.vercel.app/', 'http://localhost:5173'];
// const corsOpts = {
//     origin: '*',

//     methods: [
//         'GET',
//         'POST',
//     ],

//     allowedHeaders: [
//         'Content-Type'
//     ],
//     credentials: true
// };

// connectDB();

// app.use(express.json());
// app.use(cookieParser());
// // app.use(cors({ credentials: true, origin: allowedOrigins }));
// app.use(cors(corsOpts));

// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// app.listen(port, () => console.log('Server started'));



import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();
const port = process.env.PORT || 4000;


const allowedOrigins = [
    "https://mern-auth-psi-pink.vercel.app",
    "http://localhost:5173"
];

const corsOpts = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOpts));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.options("*", cors(corsOpts));

app.listen(port, () => console.log(`Server started on port ${port}`));
