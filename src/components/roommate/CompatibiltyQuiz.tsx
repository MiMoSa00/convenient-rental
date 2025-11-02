import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Home, Heart, Building2, Clock, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { RoommateProfile, Question, QuizStep } from '@/types/roommate';

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-muted rounded-full h-2 sm:h-3">
      <div 
        className="bg-gradient-to-r from-primary to-accent h-2 sm:h-3 rounded-full transition-all duration-500 ease-out transform"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

interface CompatibilityQuizProps {
  onComplete: (profile: RoommateProfile) => void;
  onCancel: () => void;
}

const CompatibilityQuiz: React.FC<CompatibilityQuizProps> = ({ onComplete, onCancel }) => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetRange, setBudgetRange] = useState({ min: 150000, max: 500000 });
  const [ageValue, setAgeValue] = useState(22);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Generate user-scoped localStorage keys
  const getUserScopedKey = (baseKey: string): string => {
    const userId = session?.user?.id || 'anonymous';
    return `${baseKey}_${userId}`;
  };

  // Load saved progress with user scoping
  useEffect(() => {
    if (!session?.user?.id) return;

    const progressKey = getUserScopedKey('roommate_quiz_progress');
    const savedProgress = localStorage.getItem(progressKey);
    
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCurrentStep(parsed.step || 0);
        setAnswers(parsed.answers || {});
        if (parsed.answers.budget) {
          setBudgetRange(parsed.answers.budget);
        }
        if (parsed.answers.age) {
          setAgeValue(parsed.answers.age);
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, [session?.user?.id]);

  // Save progress whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0 && session?.user?.id) {
      const progressKey = getUserScopedKey('roommate_quiz_progress');
      localStorage.setItem(progressKey, JSON.stringify({ 
        step: currentStep, 
        answers,
        userId: session.user.id,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [currentStep, answers, session?.user?.id]);

  // Scroll to top when step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const mapValueToProfile = (option: string, field: keyof RoommateProfile): any => {
    const mappings: Record<string, Record<string, any>> = {
      gender: {
        'male': 'male',
        'female': 'female',
        'non-binary': 'non-binary',
        'prefer-not-to-say': 'prefer-not-to-say'
      },
      preferredGender: {
        'male-roommates': 'male',
        'female-roommates': 'female',
        'same-gender-as-me': 'same-gender',
        'no-preference': 'any'
      },
      leaseDuration: {
        'short-term--1-6-months-': 'short-term',
        'long-term--6--months-': 'long-term',
        'flexible': 'flexible'
      },
      sleepSchedule: {
        'early-bird--sleep-before-11pm-': 'early-bird',
        'night-owl--sleep-after-midnight-': 'night-owl',
        'flexible-varies': 'flexible'
      },
      socialLevel: {
        'very-social---love-hanging-out': 'very-social',
        'moderately-social---sometimes': 'moderately-social',
        'prefer-quiet-private-time': 'prefer-quiet'
      },
      workFromHome: {
        'always': 'always',
        'sometimes': 'sometimes',
        'never': 'never'
      },
      studyHabits: {
        'need-quiet-space-to-focus': 'quiet-studier',
        'like-group-study-collaboration': 'group-studier',
        'flexible-with-noise': 'flexible'
      },
      cleanlinessLevel: {
        'very-clean-and-organized': 'very-clean',
        'moderately-clean': 'moderately-clean',
        'relaxed-about-cleanliness': 'relaxed'
      },
      smokingTolerance: {
        'no-smoking-at-all': 'no-smoking',
        'outdoor-smoking-only': 'outdoor-only',
        'smoking-anywhere-is-fine': 'anywhere'
      },
      drinkingHabits: {
        'non-drinker': 'non-drinker',
        'social-drinker': 'social-drinker',
        'regular-drinker': 'regular-drinker'
      },
      petPreference: {
        'love-pets-have-pets': 'love-pets',
        'okay-with-pets': 'okay-with-pets',
        'no-pets-please': 'no-pets'
      },
      guestPolicy: {
        'frequently--multiple-times-per-week-': 'frequent-guests',
        'occasionally--few-times-per-month-': 'occasional-guests',
        'rarely--special-occasions-only-': 'rare-guests'
      }
    };

    const fieldMappings = mappings[field as string];
    if (fieldMappings && fieldMappings[option]) {
      return fieldMappings[option];
    }
    
    return option;
  };

  const quizSteps: QuizStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us a bit about yourself',
      icon: <User className="h-5 w-5 sm:h-6 sm:w-6" />,
      questions: [
        {
          id: 'age',
          text: 'How old are you?',
          type: 'range',
          required: true,
          field: 'age'
        },
        {
          id: 'gender',
          text: 'What is your gender?',
          type: 'single-choice',
          options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
          required: true,
          field: 'gender'
        },
        {
          id: 'occupation',
          text: 'What is your occupation?',
          type: 'text',
          required: true,
          field: 'occupation'
        },
        {
          id: 'location',
          text: 'Where are you looking to live?',
          type: 'text',
          required: true,
          field: 'location'
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget & Housing',
      description: 'Your housing preferences',
      icon: <Home className="h-5 w-5 sm:h-6 sm:w-6" />,
      questions: [
        {
          id: 'budget',
          text: 'What is your monthly budget range?',
          type: 'range',
          required: true,
          field: 'budget'
        },
        {
          id: 'moveInDate',
          text: 'When do you want to move in?',
          type: 'text',
          required: true,
          field: 'moveInDate'
        },
        {
          id: 'leaseDuration',
          text: 'How long do you want to stay?',
          type: 'single-choice',
          options: ['Short-term (1-6 months)', 'Long-term (6+ months)', 'Flexible'],
          required: true,
          field: 'leaseDuration'
        },
        {
          id: 'preferredGender',
          text: 'Do you have a roommate gender preference?',
          type: 'single-choice',
          options: ['Male roommates', 'Female roommates', 'Same gender as me', 'No preference'],
          required: true,
          field: 'preferredGender'
        }
      ]
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle & Schedule',
      description: 'Your daily habits and schedule',
      icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
      questions: [
        {
          id: 'sleepSchedule',
          text: 'What is your sleep schedule like?',
          type: 'single-choice',
          options: ['Early bird (sleep before 11pm)', 'Night owl (sleep after midnight)', 'Flexible/varies'],
          required: true,
          field: 'sleepSchedule'
        },
        {
          id: 'socialLevel',
          text: 'How social are you at home?',
          type: 'single-choice',
          options: ['Very social - love hanging out', 'Moderately social - sometimes', 'Prefer quiet/private time'],
          required: true,
          field: 'socialLevel'
        },
        {
          id: 'workFromHome',
          text: 'Do you work/study from home?',
          type: 'single-choice',
          options: ['Always', 'Sometimes', 'Never'],
          required: true,
          field: 'workFromHome'
        },
        {
          id: 'studyHabits',
          text: 'What are your study/work habits?',
          type: 'single-choice',
          options: ['Need quiet space to focus', 'Like group study/collaboration', 'Flexible with noise'],
          required: true,
          field: 'studyHabits'
        }
      ]
    },
    {
      id: 'habits',
      title: 'Personal Habits',
      description: 'Your personal preferences',
      icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6" />,
      questions: [
        {
          id: 'cleanlinessLevel',
          text: 'How would you describe your cleanliness?',
          type: 'single-choice',
          options: ['Very clean and organized', 'Moderately clean', 'Relaxed about cleanliness'],
          required: true,
          field: 'cleanlinessLevel'
        },
        {
          id: 'smokingTolerance',
          text: 'What is your smoking policy?',
          type: 'single-choice',
          options: ['No smoking at all', 'Outdoor smoking only', 'Smoking anywhere is fine'],
          required: true,
          field: 'smokingTolerance'
        },
        {
          id: 'drinkingHabits',
          text: 'What are your drinking habits?',
          type: 'single-choice',
          options: ['Non-drinker', 'Social drinker', 'Regular drinker'],
          required: true,
          field: 'drinkingHabits'
        },
        {
          id: 'petPreference',
          text: 'How do you feel about pets?',
          type: 'single-choice',
          options: ['Love pets/have pets', 'Okay with pets', 'No pets please'],
          required: true,
          field: 'petPreference'
        }
      ]
    },
    {
      id: 'social',
      title: 'Social Preferences',
      description: 'Your social and guest preferences',
      icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />,
      questions: [
        {
          id: 'guestPolicy',
          text: 'How often do you have guests over?',
          type: 'single-choice',
          options: ['Frequently (multiple times per week)', 'Occasionally (few times per month)', 'Rarely (special occasions only)'],
          required: true,
          field: 'guestPolicy'
        },
        {
          id: 'sharedActivities',
          text: 'What activities would you like to share?',
          type: 'multiple-choice',
          options: ['Cooking together', 'Movie nights', 'Studying together', 'Exercise/gym', 'Gaming', 'None - keep separate lives'],
          required: false,
          field: 'sharedActivities'
        },
        {
          id: 'dealBreakers',
          text: 'What are your absolute deal breakers?',
          type: 'multiple-choice',
          options: ['Smoking indoors', 'Loud music/noise', 'Messy common areas', 'Too many guests', 'Different sleep schedules', 'Pets'],
          required: false,
          field: 'dealBreakers'
        }
      ]
    }
  ];

  const currentQuizStep = quizSteps[currentStep];

  const handleAnswerChange = (questionId: string, value: any, field: keyof RoommateProfile) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (field === 'budget') setBudgetRange(value);
    if (field === 'age') setAgeValue(value);
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const convertAnswersToProfile = (): RoommateProfile => {
    const now = new Date();
    return {
      id: `profile_${Date.now()}`,
      userId: session?.user?.id || `user_${Date.now()}`,
      age: answers.age || 22,
      gender: answers.gender || 'prefer-not-to-say',
      occupation: answers.occupation || '',
      budget: answers.budget || { min: 150000, max: 500000 },
      preferredGender: answers.preferredGender || 'any',
      location: answers.location || '',
      moveInDate: answers.moveInDate || '',
      leaseDuration: answers.leaseDuration || 'flexible',
      sleepSchedule: answers.sleepSchedule || 'flexible',
      socialLevel: answers.socialLevel || 'moderately-social',
      cleanlinessLevel: answers.cleanlinessLevel || 'moderately-clean',
      smokingTolerance: answers.smokingTolerance || 'no-smoking',
      drinkingHabits: answers.drinkingHabits || 'social-drinker',
      petPreference: answers.petPreference || 'okay-with-pets',
      studyHabits: answers.studyHabits || 'flexible',
      workFromHome: answers.workFromHome || 'sometimes',
      guestPolicy: answers.guestPolicy || 'occasional-guests',
      sharedActivities: answers.sharedActivities || [],
      dealBreakers: answers.dealBreakers || [],
      isComplete: true,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      console.error('No user session');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = convertAnswersToProfile();
      const profileKey = getUserScopedKey('roommate_profile_data');
      const progressKey = getUserScopedKey('roommate_quiz_progress');
      
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(getUserScopedKey('roommate_profile_timestamp'), new Date().toISOString());
      localStorage.removeItem(progressKey);
      
      try {
        await fetch('/api/roommate/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
      } catch (apiError) {
        console.log('API save failed, using local storage only');
      }
      
      onComplete(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNaira = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderQuestion = (question: Question) => {
    const currentValue = answers[question.field];

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-2 sm:space-y-3 animate-fadeIn">
            {question.options?.map((option: string, index: number) => {
              const kebabValue = option.toLowerCase().replace(/[^a-z0-9]/g, '-');
              const profileValue = mapValueToProfile(kebabValue, question.field);
              const isSelected = currentValue === profileValue;
              
              return (
                <button
                  key={index}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-primary bg-gradient-to-r from-primary/10 to-accent/10 text-primary shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
                  }`}
                  onClick={() => handleAnswerChange(question.id, profileValue, question.field)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base break-words flex-1">{option}</span>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2 sm:space-y-3 animate-fadeIn">
            {question.options?.map((option: string, index: number) => {
              const kebabValue = option.toLowerCase().replace(/[^a-z0-9]/g, '-');
              const selectedValues = currentValue || [];
              const isSelected = selectedValues.includes(kebabValue);
              
              return (
                <button
                  key={index}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-primary bg-gradient-to-r from-primary/10 to-accent/10 text-primary shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
                  }`}
                  onClick={() => {
                    const newValues = isSelected 
                      ? selectedValues.filter((v: string) => v !== kebabValue)
                      : [...selectedValues, kebabValue];
                    handleAnswerChange(question.id, newValues, question.field);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base break-words flex-1">{option}</span>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'range':
        if (question.field === 'budget') {
          return (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-primary/20">
                <div className="text-center mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary break-words">
                    {formatNaira(budgetRange.min)} - {formatNaira(budgetRange.max)}
                  </span>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">per month</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-foreground">
                      Minimum: <span className="text-primary">{formatNaira(budgetRange.min)}</span>
                    </label>
                    <input
                      type="range"
                      min="50000"
                      max="800000"
                      step="25000"
                      value={budgetRange.min}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        const newRange = { 
                          min: newMin, 
                          max: Math.max(newMin + 50000, budgetRange.max)
                        };
                        setBudgetRange(newRange);
                        handleAnswerChange(question.id, newRange, question.field);
                      }}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-foreground">
                      Maximum: <span className="text-primary">{formatNaira(budgetRange.max)}</span>
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="1200000"
                      step="25000"
                      value={budgetRange.max}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        const newRange = { 
                          min: Math.min(budgetRange.min, newMax - 50000), 
                          max: newMax
                        };
                        setBudgetRange(newRange);
                        handleAnswerChange(question.id, newRange, question.field);
                      }}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (question.field === 'age') {
          return (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-6 rounded-lg sm:rounded-xl text-center border border-primary/20">
                <span className="text-3xl sm:text-4xl font-bold text-primary">{ageValue}</span>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">years old</p>
              </div>
              <input
                type="range"
                min="18"
                max="65"
                value={ageValue}
                onChange={(e) => {
                  const newAge = parseInt(e.target.value);
                  setAgeValue(newAge);
                  handleAnswerChange(question.id, newAge, question.field);
                }}
                className="w-full h-2 sm:h-3 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>18</span>
                <span>65</span>
              </div>
            </div>
          );
        }
        return null;

      case 'text':
        return (
          <div className="animate-fadeIn">
            <input
              type="text"
              value={currentValue || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value, question.field)}
              className="w-full p-3 sm:p-4 border-2 border-border bg-card text-foreground rounded-lg sm:rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 text-base sm:text-lg"
              placeholder="Enter your answer..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  const canContinue = () => {
    const requiredQuestions = currentQuizStep.questions.filter(q => q.required);
    return requiredQuestions.every(q => answers[q.field] !== undefined && answers[q.field] !== '');
  };

  const isLastStep = currentStep === quizSteps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Roommate Compatibility Quiz
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Find your perfect living match</p>
        </div>

        {/* Progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Step {currentStep + 1} of {quizSteps.length}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / quizSteps.length) * 100)}% Complete
            </span>
          </div>
          <ProgressBar current={currentStep + 1} total={quizSteps.length} />
        </div>

        {/* Quiz Card */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          {/* Step Header */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-primary to-accent p-2 sm:p-3 rounded-lg sm:rounded-xl text-primary-foreground flex-shrink-0">
              {currentQuizStep.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-words">
                {currentQuizStep.title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words">
                {currentQuizStep.description}
              </p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6 sm:space-y-8">
            {currentQuizStep.questions.map((question) => (
              <div key={question.id} className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground flex items-start gap-1">
                  <span className="break-words flex-1">{question.text}</span>
                  {question.required && <span className="text-destructive flex-shrink-0">*</span>}
                </h3>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
            <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
              {currentStep > 0 && (
                <button
                  onClick={handlePreviousStep}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <button
                onClick={onCancel}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Next/Complete Button */}
            <div className="order-1 sm:order-2">
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canContinue() || isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Complete Quiz'}
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  disabled={!canContinue()}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  Next
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)));
          cursor: pointer;
          border: 2px solid hsl(var(--card));
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)));
          cursor: pointer;
          border: 2px solid hsl(var(--card));
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: hsl(var(--muted));
        }
        
        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: hsl(var(--muted));
        }

        @media (min-width: 640px) {
          .slider::-webkit-slider-thumb {
            height: 20px;
            width: 20px;
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompatibilityQuiz;