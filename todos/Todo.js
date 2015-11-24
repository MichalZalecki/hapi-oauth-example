import mongoose from "mongoose";

const Todo = mongoose.model("Todo", {
  text: String,
  compleated: Boolean
});

export default Todo;
