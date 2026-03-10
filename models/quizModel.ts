import mongoose, { Schema, Document, Types } from "mongoose";

interface IQuestion {
  text: string;
  image?: string;
  options: string[];
  isMultiCorrect: boolean;
  correctAnswers: number[];
  marks: number;
  type: 'mcq' | 'multi-mcq' | 'tf' | 'short' | 'paragraph' | 'code';
  explanation?: string;
  timer?: number; // seconds per question
  difficulty?: 'easy' | 'medium' | 'hard';
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
  status: 'draft' | 'published';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  negativeMarking?: {
    enabled: boolean;
    penalty: number;
  };
  randomization?: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    preventBackNavigation: boolean;
  };
  antiCheat?: {
    disableCopyPaste: boolean;
    disableTabSwitching: boolean;
    webcamMonitoring: boolean;
    fullscreenMode: boolean;
  };
  tags?: string[];
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
  type: {
    type: String,
    enum: ['mcq', 'multi-mcq', 'tf', 'short', 'paragraph', 'code'],
    default: 'mcq',
  },
  explanation: String,
  timer: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
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
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: Date,
    endDate: Date,
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      penalty: { type: Number, default: 0.25 },
    },
    randomization: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      preventBackNavigation: { type: Boolean, default: false },
    },
    antiCheat: {
      disableCopyPaste: { type: Boolean, default: false },
      disableTabSwitching: { type: Boolean, default: false },
      webcamMonitoring: { type: Boolean, default: false },
      fullscreenMode: { type: Boolean, default: false },
    },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>("Quiz", quizSchema);