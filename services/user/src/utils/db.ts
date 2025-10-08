import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.info("MongoDB Connected");
    } catch (error) {
        console.error(error);
    }
}

export default connectDb;