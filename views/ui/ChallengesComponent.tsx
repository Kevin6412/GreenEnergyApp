import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChallengeController } from '@/app/controller/challenge_controller';
import { ChallengeQuestion } from '@/app/model/challenge_model';
import Loading from '@/views/ui/LoadingComponent';
import { useUser } from '@/app/context/UserProfileContext';

import { styles } from '@/app/styles/challenge_style';

export default function ChallengesComponent() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});
  const [greenScore, setGreenScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load challenges data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Timer effect - Updates countdown every hour
  useEffect(() => {
    function updateCountdown() {
      setTimeLeft(ChallengeController.getTimeLeft());
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await loadQuestions();
      await loadUserProfile();
    } catch (error) {
      console.error('Error initializing challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    const result = await ChallengeController.loadQuestions();
    
    if (result.success && result.questions) {
      setQuestions(result.questions);
    } else if (result.error) {
      console.error('Error loading questions:', result.error);
      if (result.error.includes('timed out')) {
        Alert.alert('Timeout', 'Failed to load questions. Please check your connection.');
      }
    }
  };

  const loadUserProfile = async () => {
    const result = await ChallengeController.loadUserProfile();
    
    if (result.success) {
      setGreenScore(result.greenScore || 0);
      setSelectedAnswers(result.quizAnswers || {});
    } else if (result.error) {
      console.error('Error loading profile:', result.error);
      if (result.error.includes('timed out')) {
        Alert.alert('Timeout', 'Failed to load user profile. Please check your connection.');
      }
    }
  };

  const handleAnswer = async (
    qid: number,
    option: string,
    correctAnswer: string,
    points: number
  ) => {
    // Validate submission first
    const validation = ChallengeController.validateAnswerSubmission(
      qid, 
      selectedAnswers, 
      questions
    );
    
    if (!validation.isValid) {
      Alert.alert('Cannot Submit', validation.error || 'Unable to submit answer.');
      return;
    }

    // Submit answer using controller
    const result = await ChallengeController.submitAnswer(
      qid,
      option,
      correctAnswer,
      greenScore,
      selectedAnswers,
      profile?.id || '',
      questions
    );

    if (result.success) {
      // Update local state
      if (result.updatedAnswers) {
        setSelectedAnswers(result.updatedAnswers);
      }
      if (result.newScore !== undefined) {
        setGreenScore(result.newScore);
        // Refresh profile in context to sync across app
        await refreshProfile();
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to submit answer.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.header}>QUIZ CHALLENGE</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{greenScore}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TIME LEFT</Text>
            <Text style={styles.timeValue}>⏰ {timeLeft}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.quizContainer}
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}>
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>NO CHALLENGES AVAILABLE</Text>
          </View>
        ) : (
          questions.map((q, idx) => {
            const selectedLetter = selectedAnswers[q.id];
            const selectedOption =
              selectedLetter === 'A'
                ? q.optionA
                : selectedLetter === 'B'
                  ? q.optionB
                  : selectedLetter === 'C'
                    ? q.optionC
                    : null;

            const selected = selectedOption;

            return (
              <View key={q.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>QUESTION {idx + 1}</Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>+{q.points} pts</Text>
                  </View>
                </View>

                <Text style={styles.questionText}>{q.question_desc}</Text>

                <View style={styles.optionsContainer}>
                  {[
                    { letter: 'A', option: q.optionA },
                    { letter: 'B', option: q.optionB },
                    { letter: 'C', option: q.optionC },
                  ].map(({ letter, option }, i) => {
                    const isSelected = selected === option;
                    const isCorrect = isSelected && option === q.answer;
                    const isWrong = isSelected && option !== q.answer;
                    const showCorrect = selected && option === q.answer && !isSelected;

                    const bgColor = isCorrect
                      ? '#4CAF50' // ✅ green for correct
                      : isWrong
                        ? '#FF6B6B' // ❌ red for wrong
                        : showCorrect
                          ? '#6bdcff' // light blue for actual answer when another is wrong
                          : '#FFFFFF'; // ⬜ normal if not answered yet

                    const borderColor = isCorrect
                      ? '#2E7D32'
                      : isWrong
                        ? '#C62828'
                        : showCorrect
                          ? '#0288D1'
                          : '#FF9800';

                    return (
                      <Pressable
                        key={i}
                        onPress={() => handleAnswer(q.id, option, q.answer, q.points)}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                          },
                        ]}
                        disabled={!!selectedAnswers[q.id]} // Disable if already answered
                      >
                        <View style={styles.optionContent}>
                          <View style={styles.optionLetter}>
                            <Text style={styles.optionLetterText}>{letter}</Text>
                          </View>
                          <Text style={styles.optionText}>{option}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => router.push('/menu')} style={styles.backButton}>
        <Text style={styles.backButtonText}>BACK TO HOME</Text>
      </Pressable>
    </View>
  );
}

