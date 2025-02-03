import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log('database connected'));

    await mongoose.connect(`${process.env.MONDOB_URL}auth`);
}

export default connectDB;