import mongoose, { Schema, Document, Types } from "mongoose";

// Interface defining the structure of an individual Question within a Quiz
interface IQuestion {
  text: string; // The text of the question
  image?: string; // Optional image URL for the question
  options: string[]; // Possible answers
  isMultiCorrect: boolean; // Does this question have more than one right answer?
  correctAnswers: number[]; // Indices of the correct option(s)
  marks: number; // How many points this question is worth
  type: 'mcq' | 'multi-mcq' | 'tf' | 'short' | 'paragraph' | 'code';
  explanation?: string; // Text shown after answering to explain the correct answer
  timer?: number; // Optional seconds per question limit
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Interface defining the Quiz document
export interface IQuiz extends Document {
  title: string;
  description?: string;
  category?: string;
  timeLimit: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number; // 0 for infinite
  creator: Types.ObjectId;
  questions: IQuestion[];
  isPublished: boolean;
  status: 'draft' | 'published';
  isActive: boolean;
  startDate?: Date; // Only populated when published
  endDate?: Date;   // Optional expiration date
  publishedAt?: Date; // Timestamp of when the quiz was published
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

// Schema definition for the questions embedded inside the Quiz document
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
    min: 1, // Every question must be worth at least 1 point
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

// Schema definition for the Quiz
const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, index: true }, // Indexed for faster tag/category searches
    timeLimit: { type: Number, required: true }, // in minutes
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    maxAttempts: { type: Number, default: 0 }, // 0 means unlimited
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User", // Links to the User who authored the quiz
      required: true,
    },
    // The questions are stored as an array of embedded sub-documents
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
      default: true, // Represents logical deletion or archiving if false
    },
    startDate: Date,
    endDate: Date,
    publishedAt: Date,
    // Settings configuration objects embedded in the quiz document
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