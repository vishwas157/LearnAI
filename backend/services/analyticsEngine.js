const QuizAttempt = require('../models/QuizAttempt');
const Material = require('../models/Material');
const LearningActivity = require('../models/LearningActivity');
const User = require('../models/User');
const demoStore = require('./demoStore');
const { isDBConnected } = require('../config/db');

/**
 * Calculates complete analytics for a user
 * @param {string} userId 
 */
const calculateUserAnalytics = async (userId) => {
  const userIdStr = (userId || '').toString();
  if (!isDBConnected() || userIdStr.startsWith('local-') || userIdStr.startsWith('demo-') || userIdStr.startsWith('user-')) {
    return demoStore.calculateAnalytics(userId);
  }


  try {
    // 1. Fetch materials stats
    const totalMaterials = await Material.countDocuments({ uploadedBy: userId });
    const completedMaterials = await Material.countDocuments({ uploadedBy: userId, isCompleted: true });

    // 2. Fetch quiz attempts
    const attempts = await QuizAttempt.find({ user: userId }).populate('quiz', 'title subject difficulty').sort({ createdAt: 1 });
    
    const totalQuizzesAttempted = attempts.length;
    let totalScore = 0;
    let totalPossibleScore = 0;
    let totalCorrect = 0;
    let totalQuestionsAnswered = 0;
    let totalTimeSeconds = 0;

    const scoreTrends = [];
    const subjectMap = {};

    attempts.forEach((att, index) => {
      totalScore += att.score || 0;
      totalPossibleScore += att.totalQuestions || 0;
      totalTimeSeconds += att.timeTakenSeconds || 0;

      const sub = att.quiz?.subject || 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { attempts: 0, totalScore: 0, totalQuestions: 0, accuracySum: 0 };
      }
      subjectMap[sub].attempts += 1;
      subjectMap[sub].totalScore += att.score || 0;
      subjectMap[sub].totalQuestions += att.totalQuestions || 0;
      subjectMap[sub].accuracySum += att.accuracy || 0;

      if (Array.isArray(att.answers)) {
        att.answers.forEach(a => {
          totalQuestionsAnswered++;
          if (a.isCorrect) totalCorrect++;
        });
      }

      scoreTrends.push({
        attemptIndex: index + 1,
        quizTitle: att.quiz?.title || `Quiz ${index + 1}`,
        score: att.score,
        totalQuestions: att.totalQuestions,
        percentage: att.percentage,
        accuracy: att.accuracy,
        date: att.createdAt ? att.createdAt.toISOString().split('T')[0] : 'Recent',
      });
    });

    const averageScore = totalPossibleScore > 0 
      ? Math.round((totalScore / totalPossibleScore) * 100) 
      : 0;

    const overallAccuracy = totalQuestionsAnswered > 0 
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
      : (totalQuizzesAttempted > 0 ? averageScore : 0);

    // Subject Performance Breakdown
    const subjectPerformance = Object.keys(subjectMap).map(subject => {
      const data = subjectMap[subject];
      return {
        subject,
        attempts: data.attempts,
        masteryRate: data.totalQuestions > 0 ? Math.round((data.totalScore / data.totalQuestions) * 100) : 0,
        avgAccuracy: Math.round(data.accuracySum / data.attempts),
      };
    });

    // 3. Learning Activity logs & Study time
    const user = await User.findById(userId);
    const activities = await LearningActivity.find({ user: userId }).sort({ createdAt: -1 }).limit(30);

    // Calculate total study time
    let totalActivityDuration = 0;
    activities.forEach(act => {
      totalActivityDuration += act.durationSeconds || 0;
    });

    const totalStudyMinutes = Math.round((totalTimeSeconds + totalActivityDuration) / 60) + (user?.totalStudyTimeMinutes || 0);

    // 4. Activity by Day (Last 7 Days)
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count activities on this day
      const dayActivities = activities.filter(a => a.createdAt && a.createdAt.toISOString().split('T')[0] === dateStr);
      const dayAttempts = attempts.filter(a => a.createdAt && a.createdAt.toISOString().split('T')[0] === dateStr);
      
      let minutesSpent = 0;
      dayActivities.forEach(a => minutesSpent += (a.durationSeconds || 0) / 60);
      dayAttempts.forEach(a => minutesSpent += (a.timeTakenSeconds || 0) / 60);

      last7Days.push({
        date: dateStr,
        day: dayName,
        quizzes: dayAttempts.length,
        activities: dayActivities.length,
        studyMinutes: Math.max(Math.round(minutesSpent), dayAttempts.length > 0 ? 15 : 0),
      });
    }

    return {
      totalMaterials,
      completedMaterials,
      materialsStudied: totalMaterials,
      totalQuizzesAttempted,
      averageScore,
      overallAccuracy,
      totalCorrectAnswers: totalCorrect,
      totalIncorrectAnswers: Math.max(0, totalQuestionsAnswered - totalCorrect),
      totalStudyTimeMinutes: totalStudyMinutes,
      studyStreakDays: user?.studyStreak || 1,
      scoreTrends,
      subjectPerformance,
      last7DaysActivity: last7Days,
      recentActivities: activities.slice(0, 10),
    };
  } catch (err) {
    console.warn(`[Analytics] Fallback to in-memory calculations: ${err.message}`);
    return demoStore.calculateAnalytics(userId);
  }
};

module.exports = { calculateUserAnalytics };

