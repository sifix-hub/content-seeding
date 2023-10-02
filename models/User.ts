import mongoose, { Schema, Document } from 'mongoose';
import Post, {IPost} from './Post';
export interface IUser  {
  username: string;
  avatar: string;
  interests: string[];
  posts: IPost[];
}

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  avatar: { type: String, required: true },
  interests: [{ type: String }],
  posts:[{type:Schema.Types.ObjectId, ref: "Post"}],
});

export default mongoose.model<IUser>('User', userSchema);



  