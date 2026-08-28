import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Language = 'en' | 'hi'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

/* ── Hindi Translation Dictionary ─────────────────────────────────── */

const HI: Record<string, string> = {
  // Common
  'Save': 'सहेजें',
  'Cancel': 'रद्द करें',
  'Delete': 'हटाएं',
  'Edit': 'संपादित करें',
  'Close': 'बंद करें',
  'Back': 'वापस',
  'Next': 'अगला',
  'Submit': 'जमा करें',
  'Yes': 'हाँ',
  'No': 'नहीं',
  'Loading...': 'लोड हो रहा है...',
  'Done': 'हो गया',
  'New': 'नया',
  'Search': 'खोजें',

  // Navigation
  'Home': 'होम',
  'Games': 'खेल',
  'Assistant': 'सहायक',
  'Caregiver': 'देखभालकर्ता',
  'Login': 'लॉगिन',
  'Sign Up': 'साइन अप',
  'Profile': 'प्रोफ़ाइल',
  'Logout': 'लॉगआउट',
  'Settings': 'सेटिंग्स',

  // Login Page
  'Welcome back': 'वापसी पर स्वागत है',
  'Create your account': 'अपना खाता बनाएं',
  'Sign in to continue your cognitive journey.': 'अपनी संज्ञानात्मक यात्रा जारी रखने के लिए साइन इन करें।',
  'Join AURA-NER to start your memory wellness journey.': 'अपनी स्मृति कल्याण यात्रा शुरू करने के लिए AURA-NER से जुड़ें।',
  'Full Name': 'पूरा नाम',
  'Your name': 'आपका नाम',
  'Email': 'ईमेल',
  'you@example.com': 'you@example.com',
  'Password': 'पासवर्ड',
  'At least 6 characters': 'कम से कम 6 अक्षर',
  'Show password': 'पासवर्ड दिखाएं',
  'Hide password': 'पासवर्ड छुपाएं',
  'Sign In': 'साइन इन',
  'Create Account': 'खाता बनाएं',
  "Don't have an account?": 'खाता नहीं है?',
  'Already have an account?': 'पहले से खाता है?',
  'An account with this email already exists.': 'इस ईमेल से पहले से खाता मौजूद है।',
  'Password must be at least 6 characters.': 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।',
  'No account found with this email.': 'इस ईमेल से कोई खाता नहीं मिला।',
  'Incorrect password.': 'गलत पासवर्ड।',

  // Landing Page
  'Every Memory': 'हर स्मृति',
  'Matters.': 'मायने रखती है।',
  'AI-powered cognitive gaming and memory assistance for elderly people in the North Eastern Region.': 'उत्तर पूर्वी क्षेत्र के बुजुर्गों के लिए AI-संचालित संज्ञानात्मक गेमिंग और स्मृति सहायता।',
  'Explore AURA-NER': 'AURA-NER देखें',
  'Scroll to explore': 'स्क्रॉल करके देखें',

  // Features Section
  'Why AURA-NER?': 'AURA-NER क्यों?',
  'Built with care for the North Eastern Region': 'उत्तर पूर्वी क्षेत्र के लिए देखभाल से बनाया गया',
  'Memory Games': 'स्मृति खेल',
  'Personalized cognitive exercises': 'व्यक्तिगत संज्ञानात्मक व्यायाम',
  'Voice Assistant': 'वॉइस सहायक',
  'Natural conversation for daily help': 'दैनिक सहायता के लिए प्राकृतिक बातचीत',
  'Caregiver Dashboard': 'देखभालकर्ता डैशबोर्ड',
  'Stay connected with family care': 'पारिवारिक देखभाल से जुड़े रहें',

  // Games Page
  'Cognitive Games': 'संज्ञानात्मक खेल',
  'Choose an activity to engage your mind. Each game gently adapts to your pace.': 'अपने दिमाग को सक्रिय करने के लिए एक गतिविधि चुनें। हर खेल आपकी गति के अनुसार ढल जाता है।',
  'Your Cognitive Profile': 'आपका संज्ञानात्मक प्रोफ़ाइल',
  'Based on your initial assessment': 'आपके प्रारंभिक मूल्यांकन पर आधारित',
  'Overall': 'कुल',
  'Memory': 'स्मृति',
  'Sequence': 'क्रम',
  'Focus': 'ध्यान',
  'Words': 'शब्द',
  'Your Progress': 'आपकी प्रगति',
  'Overall Accuracy': 'कुल सटीकता',
  'Games Played': 'खेले गए खेल',
  'Current Level': 'वर्तमान स्तर',
  'Recommended': 'सुझाया गया',
  'Retake Assessment': 'पुनः मूल्यांकन करें',
  'Play Again': 'फिर से खेलें',
  'Next Round': 'अगला राउंड',
  'Game Complete!': 'खेल पूरा हुआ!',
  'Wonderful!': 'अद्भुत!',
  'Great Job!': 'बहुत अच्छा!',
  'Accuracy': 'सटीकता',
  'Time': 'समय',
  'Check My Answer': 'मेरा उत्तर जांचें',
  'Check Pattern': 'पैटर्न जांचें',
  'Submit Answer': 'उत्तर जमा करें',
  'Start Round': 'राउंड शुरू करें',

  // Game Names
  'Memory Match': 'मेमोरी मैच',
  'Flip cards and find matching pairs. A classic way to exercise memory.': 'कार्ड पलटें और मिलते जोड़े खोजें। स्मृति का अभ्यास करने का एक शास्त्रीय तरीका।',
  'Object Recall': 'वस्तु स्मरण',
  'Study objects briefly, then identify which ones you remember.': 'वस्तुओं को संक्षेप में देखें, फिर बताएं कि आपको कौन सी याद हैं।',
  'Sequence Recall': 'क्रम स्मरण',
  'Watch a sequence of items, then reproduce it from memory.': 'वस्तुओं का एक क्रम देखें, फिर उसे स्मृति से दोहराएं।',
  'Word Association': 'शब्द संबंध',
  'Memorize related word pairs, then match them from memory.': 'संबंधित शब्द जोड़ियों को याद करें, फिर उन्हें स्मृति से मिलाएं।',
  'Pattern Grid': 'पैटर्न ग्रिड',
  'Watch cells light up in a grid, then recreate the pattern.': 'ग्रिड में सेल जलते हुए देखें, फिर पैटर्न दोहराएं।',
  'Story Recall': 'कहानी स्मरण',
  'Read a short story, then answer questions about the details.': 'एक छोटी कहानी पढ़ें, फिर विवरण के बारे में सवालों के जवाब दें।',
  'Color Sequence': 'रंग क्रम',
  'Watch colors light up in order, then reproduce the pattern.': 'रंगों को क्रम में जलते हुए देखें, फिर पैटर्न दोहराएं।',

  // Difficulty
  'Easy': 'आसान',
  'Moderate': 'मध्यम',
  'Hard': 'कठिन',
  'easy': 'आसान',
  'moderate': 'मध्यम',
  'hard': 'कठिन',

  // Assessment
  'Cognitive Assessment': 'संज्ञानात्मक मूल्यांकन',
  "Let's check how you're doing today. This helps us personalize your experience.": 'आज आप कैसे हैं, देखते हैं। इससे हम आपका अनुभव व्यक्तिगत बना सकते हैं।',
  'Ready to begin?': 'शुरू करने के लिए तैयार?',
  'Start Assessment': 'मूल्यांकन शुरू करें',
  'Step': 'चरण',
  'of': 'में से',
  'Your Results': 'आपके परिणाम',
  'Continue to Home': 'होम पर जाएं',

  // Assistant Page
  'Speak naturally — I\'ll set reminders, make calls, and help with your daily routine.': 'प्राकृतिक रूप से बोलें — मैं रिमाइंडर सेट करूंगा, कॉल करूंगा, और आपकी दिनचर्या में मदद करूंगा।',
  'Hi! I\'m your voice assistant': 'नमस्ते! मैं आपका वॉइस सहायक हूँ',
  'Tap the microphone and speak naturally. Try saying:': 'माइक्रोफ़ोन पर टैप करें और प्राकृतिक रूप से बोलें। यह कहकर देखें:',
  'Reminders': 'रिमाइंडर',
  "Today's Tasks": 'आज के कार्य',
  'Add a task for today...': 'आज के लिए एक कार्य जोड़ें...',
  'No reminders yet': 'अभी कोई रिमाइंडर नहीं',
  'Say "Remind me to..." to create one': 'एक बनाने के लिए कहें "मुझे याद दिलाएं..."',
  'Voice Tips': 'वॉइस टिप्स',
  'Set Reminder': 'रिमाइंडर सेट करें',
  'Make a Call': 'कॉल करें',
  'Play Game': 'खेल खेलें',
  'What Time?': 'कितने बजे?',
  'Thinking...': 'सोच रहा हूँ...',
  'Listening...': 'सुन रहा हूँ...',
  'Clear conversation': 'बातचीत साफ़ करें',

  // Caregiver Page
  "Monitor your loved one's cognitive health and daily activities.": 'अपने प्रियजन के संज्ञानात्मक स्वास्थ्य और दैनिक गतिविधियों की निगरानी करें।',

  // Footer
  'AI-powered cognitive gaming and memory assistance for elderly people and their families.': 'बुजुर्गों और उनके परिवारों के लिए AI-संचालित संज्ञानात्मक गेमिंग और स्मृति सहायता।',
  'Platform': 'प्लेटफ़ॉर्म',
  'About': 'हमारे बारे में',
  'Built for the North Eastern Region': 'उत्तर पूर्वी क्षेत्र के लिए बनाया गया',
  'Accessible cognitive support': 'सुलभ संज्ञानात्मक सहायता',
  'AI-assisted personalization': 'AI-सहायित व्यक्तिगतकरण',
  'Disclaimer': 'अस्वीकरण',
  'AURA-NER is a support platform prototype. It is not a diagnostic tool, dementia severity detector, or replacement for medical professionals.': 'AURA-NER एक सहायता प्लेटफ़ॉर्म प्रोटोटाइप है। यह न तो नैदानिक उपकरण है, न ही डिमेंशिया गंभीरता डिटेक्टर, और न ही चिकित्सा पेशेवरों का विकल्प।',
  'Made with': 'से बनाया गया',
  'for memory that matters': 'उस स्मृति के लिए जो मायने रखती है',
  'Developed by Team OriginX': 'Team OriginX द्वारा विकसित',

  // Profile Menu
  'About AURA-NER': 'AURA-NER के बारे में',
  'View Mode': 'व्यू मोड',
  'Elder Mode': 'वरिष्ठ मोड',
  'Adult Mode': 'वयस्क मोड',
  'Language': 'भाषा',
  'English': 'अंग्रेज़ी',
  'Hindi': 'हिंदी',

  // Accessibility
  'Elder Mode Active — Tap to switch': 'वरिष्ठ मोड सक्रिय — स्विच करने के लिए टैप करें',
  'Adult Mode — Tap to switch to Elder Mode': 'वयस्क मोड — वरिष्ठ मोड में बदलने के लिए टैप करें',
  'Larger text & buttons': 'बड़ा टेक्स्ट और बटन',
  'Standard view': 'मानक दृश्य',

  // Generic
  'Minutes': 'मिनट',
  'minutes': 'मिनट',
  'seconds': 'सेकंड',
  'pairs': 'जोड़ियाँ',
  'attempts': 'प्रयास',
  'round': 'राउंड',
  'rounds': 'राउंड',
  'correct': 'सही',
  'Incorrect': 'गलत',
  'Missed': 'छूट गया',
  'Not shown': 'नहीं दिखाया गया',
  'Your answer': 'आपका उत्तर',
  'Correct answer': 'सही उत्तर',
  'No tasks yet. Add one above!': 'अभी कोई कार्य नहीं। ऊपर एक जोड़ें!',
  'completed': 'पूर्ण',
}

/* ── Provider ──────────────────────────────────────────────────────── */

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useLocalStorage<Language>('aura-language', 'en')

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [setLanguageState])

  const t = useCallback((key: string): string => {
    if (language === 'en') return key
    return HI[key] || key
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(TranslationContext)
  if (!ctx) throw new Error('useTranslation must be used within TranslationProvider')
  return ctx
}
