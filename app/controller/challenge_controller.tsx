import { 
  ChallengeQuestion, 
  UserProfile, 
  getChallengeQuestions, 
  getCurrentUser, 
  getUserProfile, 
  updateUserProfile, 
  calculateTimeLeft 
} from '@/app/model/challenge_model';

/**
 * Challenge Controller handling quiz challenge business logic
 * Manages challenge questions, user progress, scoring, and real-time operations
 */
export class ChallengeController {
  /**
   * Loads challenge questions from the database
   * @returns {Promise<Object>} Operation result with questions data or error
   * @returns {boolean} return.success - Whether questions were loaded successfully
   * @returns {ChallengeQuestion[]} [return.questions] - Array of challenge questions if successful
   * @returns {string} [return.error] - Error message if loading fails
   */
  static async loadQuestions(): Promise<{ 
    success: boolean; 
    questions?: ChallengeQuestion[]; 
    error?: string 
  }> {
    try {
      const { data, error } = await getChallengeQuestions();

      if (error) {
        return { success: false, error: `Failed to load questions: ${error.message}` };
      }

      return { success: true, questions: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error.message.includes('timed out') 
          ? 'Questions loading timed out' 
          : error.message 
      };
    }
  }

  /**
   * Loads user authentication data and profile information
   * Retrieves user session, green score, and existing quiz answers
   * @returns {Promise<Object>} Operation result with user profile data or error
   * @returns {boolean} return.success - Whether profile was loaded successfully
   * @returns {Object} [return.user] - Authenticated user object if successful
   * @returns {number} [return.greenScore] - User's current green score
   * @returns {Object} [return.quizAnswers] - User's existing quiz answers
   * @returns {string} [return.error] - Error message if loading fails
   */
  static async loadUserProfile(): Promise<{ 
    success: boolean; 
    user?: any; 
    greenScore?: number; 
    quizAnswers?: { [key: number]: string | null };
    error?: string 
  }> {
    try {
      const { data: userData, error: authError } = await getCurrentUser();

      if (authError || !userData?.user) {
        return { success: false, error: 'No authenticated user found' };
      }

      const user = userData.user;
      const { data: profile, error: profileError } = await getUserProfile(user.id);

      if (profileError) {
        return { success: false, error: `Failed to load profile: ${profileError.message}` };
      }

      return {
        success: true,
        user,
        greenScore: profile?.green_score || 0,
        quizAnswers: profile?.quiz_answers || {}
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message.includes('timed out') 
          ? 'Profile loading timed out' 
          : error.message 
      };
    }
  }

  /**
   * Handles user answer submission for a challenge question
   * Validates submission, checks correctness, updates score, and saves to database
   * @param {number} questionId - ID of the question being answered
   * @param {string} selectedOption - The answer option selected by the user
   * @param {string} correctAnswer - The correct answer for the question
   * @param {number} currentScore - User's current green score before submission
   * @param {Object} currentAnswers - Current state of user's answered questions
   * @param {string} userId - ID of the authenticated user
   * @param {ChallengeQuestion[]} questions - Array of all challenge questions
   * @returns {Promise<Object>} Submission result with updated data or error
   * @returns {boolean} return.success - Whether answer was submitted successfully
   * @returns {number} [return.newScore] - Updated green score if answer was correct
   * @returns {Object} [return.updatedAnswers] - Updated answers object with new submission
   * @returns {string} [return.error] - Error message if submission fails
   */
  static async submitAnswer(
    questionId: number,
    selectedOption: string,
    correctAnswer: string,
    currentScore: number,
    currentAnswers: { [key: number]: string | null },
    userId: string,
    questions: ChallengeQuestion[]
  ): Promise<{ 
    success: boolean; 
    newScore?: number; 
    updatedAnswers?: { [key: number]: string | null };
    error?: string 
  }> {
    try {
      // Prevent answering the same question twice
      if (currentAnswers[questionId]) {
        return { success: false, error: 'Question already answered' };
      }

      const question = questions.find((q) => q.id === questionId);
      if (!question) {
        return { success: false, error: 'Question not found' };
      }

      // Convert selected option text to letter
      const optionLetter = this.getOptionLetter(selectedOption, question);
      if (!optionLetter) {
        return { success: false, error: 'Invalid option selected' };
      }

      // Check if answer is correct
      const isCorrect = selectedOption === correctAnswer;
      const updatedAnswers = { ...currentAnswers, [questionId]: optionLetter };

      // Calculate new score if correct
      let newScore = currentScore;
      if (isCorrect) {
        newScore = currentScore + (question.points || 1);
      }

      // Prepare update data
      const updateData: any = { quiz_answers: updatedAnswers };
      if (isCorrect) {
        updateData.green_score = newScore;
      }

      // Update user profile in database
      const { error: updateError } = await updateUserProfile(userId, updateData);

      if (updateError) {
        return { success: false, error: `Failed to save answer: ${updateError.message}` };
      }

      return {
        success: true,
        newScore: isCorrect ? newScore : undefined,
        updatedAnswers
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message.includes('timed out') 
          ? 'Answer submission timed out' 
          : error.message 
      };
    }
  }

  /**
   * Converts selected option text to letter (A, B, or C)
   * @private
   * @param {string} option - The selected option text
   * @param {ChallengeQuestion} question - The question object containing all options
   * @returns {string} Corresponding letter (A, B, C) or empty string if no match
   */
  private static getOptionLetter(option: string, question: ChallengeQuestion): string {
    if (option === question.optionA) return 'A';
    if (option === question.optionB) return 'B';
    if (option === question.optionC) return 'C';
    return '';
  }

  /**
   * Validates if a question can be answered by the user
   * Checks if question exists and hasn't been answered already
   * @param {number} questionId - ID of the question to validate
   * @param {Object} currentAnswers - Current state of user's answered questions
   * @param {ChallengeQuestion[]} questions - Array of all challenge questions
   * @returns {Object} Validation result with status and optional error message
   * @returns {boolean} return.isValid - Whether the question can be answered
   * @returns {string} [return.error] - Error message if validation fails
   */
  static validateAnswerSubmission(
    questionId: number,
    currentAnswers: { [key: number]: string | null },
    questions: ChallengeQuestion[]
  ): { isValid: boolean; error?: string } {
    if (currentAnswers[questionId]) {
      return { isValid: false, error: 'You have already answered this question' };
    }

    const questionExists = questions.some(q => q.id === questionId);
    if (!questionExists) {
      return { isValid: false, error: 'Question not found' };
    }

    return { isValid: true };
  }

  /**
   * Gets the current countdown timer until next challenge reset
   * Calculates time remaining until next Sunday at 11:59 PM
   * @returns {string} Formatted countdown string (e.g., "3 days 5 hours left")
   */
  static getTimeLeft(): string {
    return calculateTimeLeft();
  }
}
