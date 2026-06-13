import re

def update_dashboard():
    with open('src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add imports
    if "import { analyzeJournal }" not in content:
        content = content.replace(
            "import { useState, useCallback, useMemo, useEffect, memo } from 'react';",
            "import { useState, useCallback, useMemo, useEffect, memo } from 'react';\nimport { analyzeJournal } from '../services/aiService';\nimport { useAuth } from '../context/AuthContext';"
        )

    # 2. Rename App to Dashboard
    content = content.replace('export default function App() {', 'export default function Dashboard() {')

    # 3. Add useAuth hook inside Dashboard
    if "const { user, logout } = useAuth();" not in content:
        content = content.replace(
            'export default function Dashboard() {\n  /**',
            'export default function Dashboard() {\n  const { user, logout } = useAuth();\n  /**'
        )

    # 4. Update the NavBar usage (pass user and logout)
    # Note: we need to update NavBar component definition too later, but for now just pass it.
    content = content.replace(
        '<NavBar',
        '<NavBar user={user} onLogout={logout}'
    )

    # 5. Update handleAnalyze to use AI
    old_handle_analyze = """    /* Simulate AI processing time */
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
    }, ANALYSIS_DELAY_MS);

    return () => clearTimeout(timer);"""
    
    new_handle_analyze = """    /* Call Gemini AI */
    analyzeJournal({ text: analysisData.text, mood: analysisData.mood, stressLevel: analysisData.stressLevel, exam: examName })
      .then((data) => {
        setLastAnalysis(prev => ({ ...prev, analysis: data.analysis, wellnessScore: data.wellnessScore }));
        setIsAnalyzing(false);
        setHasResults(true);
      })
      .catch(err => {
        console.error(err);
        setIsAnalyzing(false);
        setHasResults(true);
      });"""
    content = content.replace(old_handle_analyze, new_handle_analyze)

    # 6. Update the results area to use lastAnalysis.analysis data instead of mock variables directly
    content = content.replace('<StressTriggerSection triggers={stressTriggers} />', '{lastAnalysis.analysis && <StressTriggerSection triggers={lastAnalysis.analysis.stressTriggers} />}')
    content = content.replace('<EmotionalPatternsSection patterns={emotionalPatterns} />', '{lastAnalysis.analysis && <EmotionalPatternsSection patterns={lastAnalysis.analysis.emotionalPatterns} />}')
    content = content.replace('<CopingStrategiesSection strategies={copingStrategies} />', '{lastAnalysis.analysis && <CopingStrategiesSection strategies={lastAnalysis.analysis.copingStrategies} />}')
    content = content.replace('<MindfulnessSection exercises={mindfulnessExercises} />', '{lastAnalysis.analysis && <MindfulnessSection exercises={lastAnalysis.analysis.mindfulnessExercises} />}')
    content = content.replace('<MotivationalSection selectedExam={selectedExam} />', '{lastAnalysis.analysis && <MotivationalSection selectedExam={selectedExam} customQuote={lastAnalysis.analysis.motivationalQuote} />}')

    # Update MotivationalSection to accept customQuote
    content = content.replace('const MotivationalSection = memo(function MotivationalSection({ selectedExam }) {', 'const MotivationalSection = memo(function MotivationalSection({ selectedExam, customQuote }) {')
    content = content.replace(
        'motivationalContent[selectedExam] && motivationalContent[selectedExam].map((item, idx) => (',
        '[(customQuote || (motivationalContent[selectedExam] && motivationalContent[selectedExam][0]))].map((item, idx) => item && ('
    )

    # 7. Add WellnessScore override if present
    content = content.replace(
        'const wellnessScore = useMemo(() => {',
        'const wellnessScore = useMemo(() => {\n    if (lastAnalysis && lastAnalysis.wellnessScore) return lastAnalysis.wellnessScore;'
    )

    # 8. Add accessibility aria-live to the Loading/Result area wrapper
    content = content.replace('<div className="mt-8 space-y-6">', '<div className="mt-8 space-y-6" aria-live="polite">')

    # 9. Update NavBar to show user
    navbar_old = """        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-0)] p-1.5 border border-[var(--color-border)]">"""
    navbar_new = """        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Hi, {user.name}</span>
              <button onClick={onLogout} className="text-xs px-2 py-1 bg-[var(--color-surface-2)] rounded hover:bg-[var(--color-surface-3)]">Logout</button>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-0)] p-1.5 border border-[var(--color-border)]">"""
    content = content.replace(navbar_old, navbar_new)
    content = content.replace('const NavBar = memo(function NavBar({ selectedExam, onExamChange, entryCount, onToggleHistory }) {', 'const NavBar = memo(function NavBar({ selectedExam, onExamChange, entryCount, onToggleHistory, user, onLogout }) {')

    # 10. Update the import path for mockData since Dashboard is now in src/pages
    content = content.replace("from './data/mockData';", "from '../data/mockData';")

    with open('src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
update_dashboard()
