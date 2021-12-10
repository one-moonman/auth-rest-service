import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    email: string;
    username: string;
    hash: string;
    salt: string;
    provider: string;
}

export interface IUserModel extends mongoose.Model<IUser> { }

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email is already registered"],
    },
    username: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
    provider: {
        type: String,
        required: [true, "Provider is not specified"]
    },
})


const UserModel: IUserModel = mongoose.model('users', schema);
export default UserModel;