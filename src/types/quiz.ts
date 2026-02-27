export interface Question {
    id: string;
    text: string;
    image: string | null;
    options: string[];
    isMultiCorrect: boolean;
    correctAnswers: number[]; // Indices of correct options
    marks: number;
}

export type QuizCategory = 'General' | 'Programming' | 'Design' | 'Marketing' | string;

export interface QuizInfo {
    id: string;
    title: string;
    description: string;
    category: QuizCategory;
    timeLimit: number; // in minutes
    totalMarks: number;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Quiz extends QuizInfo {
    questions: Question[];
}
