import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

import { responseMessage , status_code } from "../../common/index";

const MongoDB_URL : any = process.env.MONGODB_URL

export const ConnectDB = async ()=>{
    try {
        // console.log("url",MongoDB_URL)
        await mongoose.connect(MongoDB_URL)
        console.log(responseMessage.DB_connection_successFull);

    } catch (error) {
        console.log(responseMessage.DB_connection_failed , "error" , error.message)
    }
}
