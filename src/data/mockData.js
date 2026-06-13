/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — Mental Wellness Tracker
   Simulated AI analysis results including stress triggers,
   emotional patterns, coping strategies, and mindfulness
   exercises tailored for competitive exam students.
   ═══════════════════════════════════════════════════════════════ */

/**
 * List of supported competitive exams.
 * Used for the exam-selection dropdown and to contextualize
 * AI-generated coping strategies and motivational content.
 * @type {Array<{id: string, name: string, fullName: string}>}
 */
export const examTypes = [
  { id: 'neet', name: 'NEET', fullName: 'National Eligibility cum Entrance Test' },
  { id: 'jee', name: 'JEE', fullName: 'Joint Entrance Examination' },
  { id: 'cuet', name: 'CUET', fullName: 'Common University Entrance Test' },
  { id: 'cat', name: 'CAT', fullName: 'Common Admission Test' },
  { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering' },
  { id: 'upsc', name: 'UPSC', fullName: 'Union Public Service Commission' },
];

/**
 * Available mood options for the daily mood selector.
 * Each mood has an emoji icon, label, numeric value (1-5),
 * and an associated color for the UI.
 * @type {Array<{emoji: string, label: string, value: number, color: string}>}
 */
export const moodOptions = [
  { emoji: '😢', label: 'Terrible', value: 1, color: '#f43f5e' },
  { emoji: '😟', label: 'Bad',      value: 2, color: '#fb7185' },
  { emoji: '😐', label: 'Okay',     value: 3, color: '#fbbf24' },
  { emoji: '🙂', label: 'Good',     value: 4, color: '#7cc49a' },
  { emoji: '😄', label: 'Great',    value: 5, color: '#34d399' },
];

/**
 * Simulated AI-detected hidden stress triggers.
 * These represent patterns an AI model would uncover
 * from analyzing journal entries over time.
 * @type {Array<{trigger: string, frequency: string, severity: string, insight: string, icon: string}>}
 */
export const stressTriggers = [
  {
    trigger: 'Late-night study sessions',
    frequency: 'Almost daily',
    severity: 'high',
    insight: 'Consistently studying past midnight correlates with next-day anxiety spikes. Your performance actually peaks between 8-11 AM.',
    icon: '🌙',
  },
  {
    trigger: 'Mock test comparisons',
    frequency: '3-4 times/week',
    severity: 'high',
    insight: 'Checking peer scores triggers self-doubt spirals. Your score trajectory shows steady 12% improvement — focus on your own curve.',
    icon: '📊',
  },
  {
    trigger: 'Skipping meals during revision',
    frequency: '2-3 times/week',
    severity: 'medium',
    insight: 'Meal-skipping days show 23% lower focus ratings in your logs. Brain function drops significantly without regular glucose intake.',
    icon: '🍽️',
  },
  {
    trigger: 'Social media before bed',
    frequency: 'Daily',
    severity: 'medium',
    insight: 'Screen time within 1 hour of sleep delays your sleep onset by ~40 minutes based on your logged patterns.',
    icon: '📱',
  },
  {
    trigger: 'Parental expectations discussions',
    frequency: 'Weekly',
    severity: 'medium',
    insight: 'Conversations about results with family precede 2-day dips in mood. Consider setting gentle boundaries around exam talk.',
    icon: '👨‍👩‍👧',
  },
];

/**
 * Simulated emotional pattern analysis data.
 * Each entry represents a day of the week with mood score,
 * stress level, and the dominant emotion detected by AI.
 * @type {Array<{day: string, moodScore: number, stressLevel: number, emotion: string}>}
 */
export const emotionalPatterns = [
  { day: 'Mon', moodScore: 3.2, stressLevel: 7, emotion: 'Anxious' },
  { day: 'Tue', moodScore: 3.8, stressLevel: 5, emotion: 'Focused' },
  { day: 'Wed', moodScore: 2.5, stressLevel: 8, emotion: 'Overwhelmed' },
  { day: 'Thu', moodScore: 4.1, stressLevel: 4, emotion: 'Confident' },
  { day: 'Fri', moodScore: 3.0, stressLevel: 6, emotion: 'Tired' },
  { day: 'Sat', moodScore: 4.5, stressLevel: 3, emotion: 'Relieved' },
  { day: 'Sun', moodScore: 3.6, stressLevel: 5, emotion: 'Hopeful' },
];

/**
 * Personalized coping strategies tailored for exam stress.
 * Organized by category with actionable steps and
 * estimated time commitments.
 * @type {Array<{category: string, icon: string, strategies: Array<{title: string, description: string, duration: string, difficulty: string}>}>}
 */
export const copingStrategies = [
  {
    category: 'Cognitive Reframing',
    icon: '🧠',
    strategies: [
      {
        title: 'Challenge Negative Thought Patterns',
        description: 'When you think "I\'ll never crack this exam," rewrite it: "I haven\'t mastered this topic YET. Each revision strengthens my neural pathways."',
        duration: '5 min',
        difficulty: 'Easy',
      },
      {
        title: 'Success Visualization',
        description: 'Spend 3 minutes each morning vividly imagining yourself solving problems confidently during the exam. Research shows this activates the same neural circuits as actual practice.',
        duration: '3 min',
        difficulty: 'Easy',
      },
    ],
  },
  {
    category: 'Study-Life Balance',
    icon: '⚖️',
    strategies: [
      {
        title: 'Pomodoro with Purpose',
        description: 'Study for 45 minutes, then take a 10-minute break doing something physical. Your brain consolidates memory during rest, not during cramming.',
        duration: '55 min cycles',
        difficulty: 'Medium',
      },
      {
        title: 'Digital Sunset Protocol',
        description: 'No screens 45 minutes before sleep. Switch to handwritten revision or light reading. This alone can improve your sleep quality by 35%.',
        duration: '45 min',
        difficulty: 'Medium',
      },
    ],
  },
  {
    category: 'Physical Wellness',
    icon: '💪',
    strategies: [
      {
        title: '7-Minute Morning Movement',
        description: 'A brief combination of stretching, jumping jacks, and pushups releases endorphins that boost mood and focus for the next 2-3 hours of study.',
        duration: '7 min',
        difficulty: 'Easy',
      },
      {
        title: 'Tactical Hydration',
        description: 'Keep a 1L bottle at your desk. Dehydration reduces cognitive performance by up to 25%. Set hourly sip reminders.',
        duration: 'All day',
        difficulty: 'Easy',
      },
    ],
  },
];

/**
 * Adaptive mindfulness exercises specifically designed
 * for exam-stressed students. Includes breathing, focus,
 * and grounding techniques with step-by-step instructions.
 * @type {Array<{title: string, type: string, icon: string, duration: string, description: string, steps: string[]}>}
 */
export const mindfulnessExercises = [
  {
    title: 'Box Breathing Reset',
    type: 'Breathing',
    icon: '🌬️',
    duration: '4 min',
    description: 'A technique used by Navy SEALs to calm the nervous system instantly. Perfect before mock tests or stressful study sessions.',
    steps: [
      'Breathe in slowly for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale slowly for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat 4 cycles',
    ],
  },
  {
    title: '5-4-3-2-1 Grounding',
    type: 'Focus',
    icon: '🎯',
    duration: '3 min',
    description: 'When exam anxiety peaks, this sensory grounding technique brings you back to the present moment immediately.',
    steps: [
      'Notice 5 things you can SEE around you',
      'Touch 4 things you can FEEL',
      'Listen for 3 things you can HEAR',
      'Identify 2 things you can SMELL',
      'Notice 1 thing you can TASTE',
    ],
  },
  {
    title: 'Focused Attention Meditation',
    type: 'Meditation',
    icon: '🧘',
    duration: '5 min',
    description: 'Train the same focus muscle you use during exams. Studies show 10 days of this practice improves concentration by 14%.',
    steps: [
      'Sit comfortably with eyes closed',
      'Focus entirely on your breathing rhythm',
      'When your mind wanders, gently return focus',
      'Count each exhale from 1 to 10, then restart',
      'Notice thoughts without judgment — just observe',
    ],
  },
];

/**
 * Motivational messages tailored for specific exam types.
 * Keyed by exam ID so the correct motivation displays
 * when the user selects their target exam.
 * @type {Object<string, Array<{quote: string, context: string}>>}
 */
export const motivationalContent = {
  neet: [
    { quote: 'Every NCERT page you revise is a patient you\'ll save someday.', context: 'Medicine is a marathon, not a sprint. Your persistence today builds diagnostic intuition tomorrow.' },
    { quote: 'Dr. APJ Abdul Kalam failed his fighter pilot exam — then became India\'s Missile Man.', context: 'Setbacks are setups for comebacks. NEET is one test, not your entire medical career.' },
  ],
  jee: [
    { quote: 'The problems you struggle with today are building your engineering instinct for tomorrow.', context: 'Every hard integral and mechanics problem literally rewires your brain for systems thinking.' },
    { quote: 'Sundar Pichai didn\'t have a computer until college — then built Google Chrome.', context: 'Your current resources don\'t define your ceiling. Focus on depth, not breadth.' },
  ],
  cuet: [
    { quote: 'Your diverse knowledge is your superpower — CUET rewards breadth of understanding.', context: 'The ability to connect concepts across domains is the hallmark of a great scholar.' },
    { quote: 'Every great university began with students who believed they belonged there.', context: 'Imposter syndrome is normal. Your curiosity already qualifies you.' },
  ],
  cat: [
    { quote: 'The logical thinking you\'re building will serve you in every boardroom.', context: 'CAT doesn\'t just test math — it tests how you think under pressure. That\'s the real skill.' },
    { quote: 'Narayan Murthy cleared CAT while working a full-time job.', context: 'If time is tight, efficiency matters more than hours logged.' },
  ],
  gate: [
    { quote: 'Deep mastery of fundamentals separates good engineers from great ones.', context: 'GATE preparation forces you to truly understand concepts, not just memorize procedures.' },
    { quote: 'Every concept you master now compounds throughout your engineering career.', context: 'This isn\'t just exam prep — it\'s building your professional foundation.' },
  ],
  upsc: [
    { quote: 'You\'re not just preparing for an exam — you\'re preparing to serve 1.4 billion people.', context: 'The weight of UPSC preparation reflects the weight of public responsibility.' },
    { quote: 'IAS officer Tina Dabi scored 1st in her first attempt with consistent daily effort.', context: 'Small daily improvements compound into extraordinary results over months.' },
  ],
};
