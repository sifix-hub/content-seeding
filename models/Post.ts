import mongoose, { Schema, Document } from 'mongoose';
import User, {IUser} from './User';

export interface IPost  {
    
    content: string; // Ensure content is of type string
    date: string;
    user: IUser;
  }
  
  const postSchema: Schema = new Schema({
    
    content: { type: String, required:true },
    date:{type: String, required:true},
    user:{type:Schema.Types.ObjectId, ref: "User"},
  });
  
  export default mongoose.model<IPost>('Post', postSchema);