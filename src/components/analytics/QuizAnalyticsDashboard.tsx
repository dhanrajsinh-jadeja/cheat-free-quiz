import React from 'react';
import ScoreDistributionChart from './charts/ScoreDistributionChart';
import QuestionDifficultyChart from './charts/QuestionDifficultyChart';
import OverallPerformanceChart from './charts/OverallPerformanceChart';
import AttemptsOverTimeChart from './charts/AttemptsOverTimeChart';
import AverageScoreTrendChart from './charts/AverageScoreTrendChart';
import TimeTakenDistributionChart from './charts/TimeTakenDistributionChart';
import OptionSelectionChart from './charts/OptionSelectionChart';
import QuestionAttemptRateChart from './charts/QuestionAttemptRateChart';
import ScoreVsTimeChart from './charts/ScoreVsTimeChart';
import PerformanceHeatmapChart from './charts/PerformanceHeatmapChart';
import ScorePercentileChart from './charts/ScorePercentileChart';
import QuestionAverageTimeChart from './charts/QuestionAverageTimeChart';
import DailyActivityChart from './charts/DailyActivityChart';
import PassFailRatioChart from './charts/PassFailRatioChart';
import LeaderboardChart from './charts/LeaderboardChart';

interface QuizAnalyticsDashboardProps {
    quizTitle: string;
}

const QuizAnalyticsDashboard: React.FC<QuizAnalyticsDashboardProps> = ({ quizTitle }) => {
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            <div className="mb-2">
                <h3 className="text-xl font-bold text-slate-800">Advanced Analytics Dashboard</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Comprehensive performance insights across 15 different metrics for <strong>{quizTitle}</strong>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <OverallPerformanceChart />
                <PassFailRatioChart />
                <ScoreDistributionChart />

                <QuestionDifficultyChart />
                <QuestionAttemptRateChart />
                <OptionSelectionChart />

                <AttemptsOverTimeChart />
                <DailyActivityChart />
                <AverageScoreTrendChart />

                <TimeTakenDistributionChart />
                <QuestionAverageTimeChart />
                <ScoreVsTimeChart />

                <PerformanceHeatmapChart />
                <ScorePercentileChart />
                <LeaderboardChart />
            </div>
        </div>
    );
};

export default QuizAnalyticsDashboard;
