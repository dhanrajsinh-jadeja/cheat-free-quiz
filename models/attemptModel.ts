import mongoose, { Schema, Document, Types } from "mongoose";

interface IAnswer {
  questionId: Types.ObjectId;
  selectedOptions: number[];
}

export interface IAttempt extends Document {
  quiz: Types.ObjectId;
  user: Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalMarks: number;
  isPassed: boolean;
  status: "IN_PROGRESS" | "COMPLETED" | "AUTO_SUBMITTED";
  startTime: Date;
  endTime?: Date;
  proctoringViolations: number;
}

const answerSchema = new Schema<IAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  selectedOptions: {
    type: [Number],
    default: [],
  },
});

const attemptSchema = new Schema<IAttempt>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED", "AUTO_SUBMITTED"],
      default: "IN_PROGRESS",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    proctoringViolations: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate attempts
 */
attemptSchema.index({ quiz: 1, user: 1 }, { unique: true });

export default mongoose.model<IAttempt>("Attempt", attemptSchema);