import mongoose from "mongoose";
import { modelName, ROLES } from "../common";

const authSchema = new mongoose.Schema({
    name : {type : String , },
    email : {type : String , },
    password : {type : String , },
    role : {type : String , enum : Object.values(ROLES) , default : ROLES.user},
    phone : {type : String , default : ""},
    address : {type : String , default : ""},
    city : {type : String , default : ""},
    state : {type : String , default : ""},
    pincode : {type : String , default : ""},
    isDeleted : {type : Boolean , default : false}
} , {timestamps : true  , versionKey : false})

export const Auth_Collection = mongoose.model(modelName.authModelName , authSchema);
