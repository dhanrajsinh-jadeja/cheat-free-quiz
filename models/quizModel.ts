import mongoose, { Schema, Document, Types } from "mongoose";

interface IQuestion {
  text: string;
  image?: string;
  options: string[];
  isMultiCorrect: boolean;
  correctAnswers: number[];
  marks: number;
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  category?: string;
  timeLimit: number;
  totalMarks: number;
  passingMarks: number;
  creator: Types.ObjectId;
  questions: IQuestion[];
  isPublished: boolean;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  image: String,
  options: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length >= 2, "Minimum 2 options required"],
  },
  isMultiCorrect: {
    type: Boolean,
    default: false,
  },
  correctAnswers: {
    type: [Number],
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
  },
});

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, index: true },
    timeLimit: { type: Number, required: true }, // minutes
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>("Quiz", quizSchema);