import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, User, Home, Heart, Briefcase, Moon, Users } from 'lucide-react';

// Import types from the main types file
import { RoommateProfile, Question, QuizStep } from '@/types/roommate';

// Progress Bar Component
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out transform"
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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetRange, setBudgetRange] = useState({ min: 150000, max: 500000 }); // Changed to naira values
  const [ageValue, setAgeValue] = useState(22);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Storage functions
  const saveToStorage = (key: string, data: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const getFromStorage = (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error('Storage error:', error);
    }
    return null;
  };

  // Load saved progress
  useEffect(() => {
    const savedProgress = getFromStorage('roommate_quiz_progress');
    if (savedProgress) {
      setCurrentStep(savedProgress.step);
      setAnswers(savedProgress.answers);
      if (savedProgress.answers.budget) {
        setBudgetRange(savedProgress.answers.budget);
      }
      if (savedProgress.answers.age) {
        setAgeValue(savedProgress.answers.age);
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveToStorage('roommate_quiz_progress', { step: currentStep, answers });
    }
  }, [currentStep, answers]);

  // Scroll to top when step changes
  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  // Helper function to map UI values to profile values
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
    
    // For arrays (sharedActivities, dealBreakers), return the kebab-case version
    return option;
  };

  const quizSteps: QuizStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us a bit about yourself',
      icon: <User className="h-6 w-6" />,
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
      icon: <Home className="h-6 w-6" />,
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
      icon: <Moon className="h-6 w-6" />,
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
      icon: <Heart className="h-6 w-6" />,
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
      icon: <Users className="h-6 w-6" />,
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

  // Enhanced next step function with scroll
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
    // The useEffect will handle the scroll automatically
  };

  // Enhanced previous step function with scroll
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
    // The useEffect will handle the scroll automatically
  };

  const convertAnswersToProfile = (): RoommateProfile => {
    const now = new Date();
    return {
      id: `profile_${Date.now()}`,
      userId: `user_${Date.now()}`,
      age: answers.age || 22,
      gender: answers.gender || 'prefer-not-to-say',
      occupation: answers.occupation || '',
      budget: answers.budget || { min: 150000, max: 500000 }, // Changed to naira values
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
      status: 'ACTIVE', // Added missing status property
      createdAt: now,
      updatedAt: now
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const profile = convertAnswersToProfile();
      
      // Save to localStorage
      saveToStorage('roommate_profile', profile);
      
      // Clear quiz progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem('roommate_quiz_progress');
      }
      
      // Try to save to API (optional, will fail gracefully if no backend)
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

  // Helper function to format naira currency
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
          <div className="space-y-3 animate-fadeIn">
            {question.options?.map((option: string, index: number) => {
              const kebabValue = option.toLowerCase().replace(/[^a-z0-9]/g, '-');
              const profileValue = mapValueToProfile(kebabValue, question.field);
              const isSelected = currentValue === profileValue;
              
              return (
                <button
                  key={index}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                  onClick={() => handleAnswerChange(question.id, profileValue, question.field)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3 animate-fadeIn">
            {question.options?.map((option: string, index: number) => {
              const kebabValue = option.toLowerCase().replace(/[^a-z0-9]/g, '-');
              const selectedValues = currentValue || [];
              const isSelected = selectedValues.includes(kebabValue);
              
              return (
                <button
                  key={index}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                  onClick={() => {
                    const newValues = isSelected 
                      ? selectedValues.filter((v: string) => v !== kebabValue)
                      : [...selectedValues, kebabValue];
                    handleAnswerChange(question.id, newValues, question.field);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
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
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">
                    {formatNaira(budgetRange.min)} - {formatNaira(budgetRange.max)}
                  </span>
                  <p className="text-gray-600 mt-1">per year</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Budget: {formatNaira(budgetRange.min)}</label>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Budget: {formatNaira(budgetRange.max)}</label>
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (question.field === 'age') {
          return (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl text-center">
                <span className="text-3xl font-bold text-purple-600">{ageValue}</span>
                <p className="text-gray-600 mt-1">years old</p>
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
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-500">
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
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg"
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
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Roommate Compatibility Quiz
          </h1>
          <p className="text-gray-600">Find your perfect living match</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {quizSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / quizSteps.length) * 100)}% Complete
            </span>
          </div>
          <ProgressBar current={currentStep + 1} total={quizSteps.length} />
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          {/* Step Header */}
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl text-white mr-4">
              {currentQuizStep.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentQuizStep.title}</h2>
              <p className="text-gray-600">{currentQuizStep.description}</p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {currentQuizStep.questions.map((question) => (
              <div key={question.id} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePreviousStep}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
              )}
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={!canContinue() || isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Quiz'}
                <Check className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={!canContinue()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 transform hover:scale-105"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            )}
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
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(45deg, #e5e7eb, #f3f4f6);
        }
      `}</style>
    </div>
  );
};

export default CompatibilityQuiz;