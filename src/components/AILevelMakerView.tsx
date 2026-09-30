import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Play,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Star,
  Trash2,
  Clock,
  Target,
  ArrowRight,
  Layers,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Eye,
  EyeOff,
  Flame,
  ChevronRight,
  Cpu,
  Download,
  Upload,
  Copy,
  Check,
  Search,
  Settings2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AILevelBlueprint, Question, SavedCustomLevel } from '../types';
import {
  generateLevelBlueprint,
  PRESET_PROMPTS,
} from '../services/aiLevelService';
import { generateQuestionsFromBlueprint } from '../engine/generator';

export const AILevelMakerView: React.FC = () => {
  const {
    startSession,
    savedCustomLevels,
    saveCustomLevel,
    deleteCustomLevel,
    toggleCustomLevelFavorite,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedBlueprint, setGeneratedBlueprint] = useState<AILevelBlueprint | null>(null);
  const [generatedSource, setGeneratedSource] = useState<'ai' | 'fallback'>('ai');
  const [generatedEngine, setGeneratedEngine] = useState<string>('');
  const [sampleQuestions, setSampleQuestions] = useState<Question[]>([]);
  const [showSampleAnswers, setShowSampleAnswers] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  // Tuning controls state
  const [isTuning, setIsTuning] = useState(false);

  // Search & Filter in Saved tab
  const [savedSearch, setSavedSearch] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Import / Export JSON modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleGenerate = async (promptToUse?: string) => {
    const text = (promptToUse || prompt).trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setIsSaved(false);
    setShowSampleAnswers(false);
    setIsTuning(false);

    try {
      setGenerationStep('Interpreting mathematical intent...');
      await new Promise((r) => setTimeout(r, 250));

      setGenerationStep('Synthesizing structured level blueprint...');
      const result = await generateLevelBlueprint(text);
      setGeneratedBlueprint(result.blueprint);
      setGeneratedSource(result.source);
      setGeneratedEngine(result.engine);

      setGenerationStep('Generating and validating questions via exact rational engine...');
      await new Promise((r) => setTimeout(r, 200));

      const questions = generateQuestionsFromBlueprint(result.blueprint);
      setSampleQuestions(questions.slice(0, 4));

      setGenerationStep('Done');
    } catch (err) {
      console.error('Error generating level:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartLevel = (blueprint: AILevelBlueprint, customLevelId?: string) => {
    startSession({
      mode: 'custom',
      level: blueprint.difficulty,
      questionCount: blueprint.questionCount,
      hasTimer: blueprint.timeMode !== 'untimed',
      targetPace: blueprint.targetPace,
      customBlueprint: blueprint,
      customLevelId,
    });
  };

  const handleSaveCurrentLevel = () => {
    if (!generatedBlueprint) return;
    const newSaved: SavedCustomLevel = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      blueprint: generatedBlueprint,
      prompt: prompt || generatedBlueprint.title,
      createdAt: Date.now(),
      favorite: false,
      timesPlayed: 0,
    };
    saveCustomLevel(newSaved);
    setIsSaved(true);
  };

  // Re-generate samples after blueprint tuning
  const handleTuningUpdate = (updates: Partial<AILevelBlueprint>) => {
    if (!generatedBlueprint) return;
    const updated = {
      ...generatedBlueprint,
      ...updates,
      features: { ...generatedBlueprint.features, ...(updates.features || {}) },
    };
    setGeneratedBlueprint(updated);
    setIsSaved(false);
    try {
      const q = generateQuestionsFromBlueprint(updated);
      setSampleQuestions(q.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  };

  // Export levels as JSON
  const handleExportLevels = () => {
    const jsonStr = JSON.stringify(savedCustomLevels, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcrush_custom_levels_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import levels JSON
  const handleImportSubmit = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonText);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      let importedCount = 0;
      for (const item of list) {
        if (item.blueprint && item.blueprint.title && item.blueprint.operations) {
          saveCustomLevel({
            id: item.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            blueprint: item.blueprint,
            prompt: item.prompt || item.blueprint.title,
            createdAt: item.createdAt || Date.now(),
            favorite: false,
            timesPlayed: 0,
          });
          importedCount++;
        }
      }
      if (importedCount === 0) {
        setImportError('No valid CalcRush custom level blueprints found in JSON.');
        return;
      }
      setShowImportModal(false);
      setImportJsonText('');
      setActiveTab('saved');
    } catch {
      setImportError('Invalid JSON format. Please verify the copied text.');
    }
  };

  const filteredSaved = savedCustomLevels.filter((l) => {
    if (filterFavorites && !l.favorite) return false;
    if (savedSearch.trim()) {
      const q = savedSearch.toLowerCase();
      return (
        l.blueprint.title.toLowerCase().includes(q) ||
        l.blueprint.description.toLowerCase().includes(q) ||
        l.prompt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202833] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Level Maker</span>
            <span className="text-[10px] text-[#8B95A5]">· Authoritative Exact Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7FA]">
            Custom Calculation Levels
          </h1>
          <p className="text-sm text-[#8B95A5] mt-1 max-w-2xl">
            Describe your ideal training drill in natural language. AI designs the curriculum blueprint, and CalcRush generates and verifies every exact rational calculation.
          </p>
        </div>

        {/* Tab Switcher & Import/Export */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#111720] border border-[#202833]">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-cyan-500 text-[#080B10] shadow-sm'
                  : 'text-[#8B95A5] hover:text-[#F5F7FA]'
              }`}
            >
              Create Level
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-cyan-500 text-[#080B10] shadow-sm'
                  : 'text-[#8B95A5] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Saved Levels</span>
              {savedCustomLevels.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'saved' ? 'bg-[#080B10] text-cyan-400' : 'bg-[#202833] text-[#F5F7FA]'}`}>
                  {savedCustomLevels.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowImportModal(true)}
            className="p-2.5 rounded-xl bg-[#111720] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] transition-colors cursor-pointer"
            title="Import or Export Level Blueprint JSON"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <>
          {/* 2. Main Prompt Box */}
          <div className="p-6 rounded-2xl bg-[#111720] border border-[#202833] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-prompt-input" className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>What do you want to practice?</span>
              </label>
              <span className="text-[11px] text-[#8B95A5]">
                Natural Language Level Generator
              </span>
            </div>

            <div className="relative">
              <textarea
                id="ai-prompt-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Make me a hard 20-question Class 10 drill using fractions, decimals and negative numbers with PEMDAS."
                className="w-full rounded-xl bg-[#0D1219] border border-[#202833] px-4 py-3 text-sm text-[#F5F7FA] placeholder-[#8B95A5]/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                disabled={isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />
              {prompt && !isGenerating && (
                <button
                  onClick={() => setPrompt('')}
                  className="absolute top-3 right-3 text-xs text-[#8B95A5] hover:text-[#F5F7FA] px-2 py-1 rounded bg-[#111720]/80 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8B95A5] block">
                Quick Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(p.prompt);
                      handleGenerate(p.prompt);
                    }}
                    disabled={isGenerating}
                    className="p-3 rounded-xl bg-[#0D1219] hover:bg-[#18202c] border border-[#202833] hover:border-cyan-500/40 text-left transition-all flex flex-col justify-between group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs text-[#F5F7FA] group-hover:text-cyan-300 transition-colors flex items-center space-x-1.5">
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8B95A5] mt-1 line-clamp-1">
                      {p.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-[#8B95A5]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#0D1219] border border-[#202833] font-mono text-[10px] text-[#F5F7FA]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#0D1219] border border-[#202833] font-mono text-[10px] text-[#F5F7FA]">Enter</kbd> to generate
              </p>

              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isGenerating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-50 text-[#080B10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Blueprint...' : 'Generate Level'}</span>
              </button>
            </div>
          </div>

          {/* 3. Generating Status Indicator */}
          {isGenerating && (
            <div className="p-6 rounded-2xl bg-[#111720] border border-cyan-500/30 text-center space-y-3 animate-pulse">
              <Bot className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#F5F7FA]">
                  {generationStep || 'Analyzing mathematical requirements...'}
                </p>
                <p className="text-xs text-[#8B95A5]">
                  Constructing curriculum blueprint and verifying exact arithmetic rules...
                </p>
              </div>
            </div>
          )}

          {/* 4. Generated Level Blueprint Card */}
          {generatedBlueprint && !isGenerating && (
            <div className="p-6 rounded-2xl bg-[#111720] border border-cyan-500/30 shadow-xl space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#202833] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold font-math">
                      Level {generatedBlueprint.difficulty}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#8B95A5]">
                      {generatedBlueprint.purpose} drill
                    </span>
                    {generatedSource === 'ai' && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-cyan-400 font-mono">
                        <Cpu className="w-3 h-3" />
                        <span>{generatedEngine}</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
                    {generatedBlueprint.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8B95A5]">
                    {generatedBlueprint.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setIsTuning(!isTuning)}
                    className="py-2 px-3 rounded-xl bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isTuning ? 'Done Tuning' : 'Tune Parameters'}</span>
                  </button>
                </div>
              </div>

              {/* Tuning Panel if open */}
              {isTuning && (
                <div className="p-4 rounded-xl bg-[#0D1219] border border-cyan-500/40 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                      <Settings2 className="w-4 h-4" />
                      <span>Fine-Tune Blueprint Parameters</span>
                    </span>
                    <span className="text-[11px] text-[#8B95A5]">Changes update questions automatically</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#8B95A5] block mb-1">
                        Questions ({generatedBlueprint.questionCount})
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={50}
                        step={5}
                        value={generatedBlueprint.questionCount}
                        onChange={(e) => handleTuningUpdate({ questionCount: Number(e.target.value) })}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#8B95A5] block mb-1">
                        Difficulty (Level {generatedBlueprint.difficulty})
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={generatedBlueprint.difficulty}
                        onChange={(e) => handleTuningUpdate({ difficulty: Number(e.target.value) })}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#8B95A5] block mb-1">
                        Target Pace ({generatedBlueprint.targetPace || 4}s / question)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        step={0.5}
                        value={generatedBlueprint.targetPace || 4}
                        onChange={(e) => handleTuningUpdate({ targetPace: Number(e.target.value) })}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Feature Toggles */}
                  <div className="pt-2 border-t border-[#202833] flex flex-wrap gap-2">
                    {[
                      { key: 'fractions', label: 'Fractions' },
                      { key: 'decimals', label: 'Decimals' },
                      { key: 'negativeNumbers', label: 'Negative Numbers' },
                      { key: 'pemdas', label: 'PEMDAS Multi-Step' },
                      { key: 'mixedNumbers', label: 'Mixed Fractions' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => {
                          const cur = (generatedBlueprint.features as any)[f.key];
                          handleTuningUpdate({
                            features: {
                              ...generatedBlueprint.features,
                              [f.key]: !cur,
                            },
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          (generatedBlueprint.features as any)[f.key]
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-[#111720] text-[#8B95A5] border-[#202833]'
                        }`}
                      >
                        {(generatedBlueprint.features as any)[f.key] ? '✓ ' : '+ '}
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blueprint Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block mb-1">
                    Operations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {generatedBlueprint.operations.map((op) => {
                      const symbol = op === 'addition' ? '+' : op === 'subtraction' ? '−' : op === 'multiplication' ? '×' : '÷';
                      return (
                        <span key={op} className="text-xs font-math px-1.5 py-0.5 rounded bg-[#111720] border border-[#202833] text-cyan-300">
                          {symbol} {op}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block mb-1">
                    Active Features
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px] text-[#F5F7FA]">
                    {generatedBlueprint.features.fractions && <span className="px-1.5 py-0.5 rounded bg-[#111720] text-emerald-400">Fractions</span>}
                    {generatedBlueprint.features.decimals && <span className="px-1.5 py-0.5 rounded bg-[#111720] text-cyan-400">Decimals</span>}
                    {generatedBlueprint.features.negativeNumbers && <span className="px-1.5 py-0.5 rounded bg-[#111720] text-amber-400">Negatives</span>}
                    {generatedBlueprint.features.pemdas && <span className="px-1.5 py-0.5 rounded bg-[#111720] text-purple-400">PEMDAS</span>}
                    {generatedBlueprint.features.mixedNumbers && <span className="px-1.5 py-0.5 rounded bg-[#111720] text-blue-400">Mixed</span>}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block mb-1">
                    Time & Pacing
                  </span>
                  <div className="text-xs font-semibold text-[#F5F7FA] flex items-center space-x-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{generatedBlueprint.targetPace ? `${generatedBlueprint.targetPace}s / question` : 'Untimed'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B95A5] block mb-1">
                    Training Purpose
                  </span>
                  <span className="text-xs font-semibold text-cyan-300 capitalize">
                    {generatedBlueprint.purpose.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Sample Questions Generated via CalcRush Engine */}
              {sampleQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8B95A5] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Validated Sample Questions (CalcRush Exact Engine)</span>
                    </span>
                    <button
                      onClick={() => setShowSampleAnswers(!showSampleAnswers)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {showSampleAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSampleAnswers ? 'Hide Answers' : 'Reveal Answers'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sampleQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-[#0D1219] border border-[#202833] flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#111720] border border-[#202833] text-[10px] font-math text-[#8B95A5] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-math text-base font-bold text-[#F5F7FA]">
                            {q.expression}
                          </span>
                        </div>

                        {showSampleAnswers ? (
                          <div className="font-math font-bold text-sm text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                            = {q.correctAnswer}
                          </div>
                        ) : (
                          <span className="text-xs text-[#8B95A5] font-math">?</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#202833]">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveCurrentLevel}
                    disabled={isSaved}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all w-full sm:w-auto cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#0D1219] hover:bg-[#111720] text-[#F5F7FA] border border-[#202833]'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved to Custom Levels' : 'Save Level'}</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#0D1219] hover:bg-[#111720] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    title="Reroll with fresh calculations"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reroll Questions</span>
                  </button>
                </div>

                <button
                  onClick={() => handleStartLevel(generatedBlueprint)}
                  className="py-3 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/25 w-full sm:w-auto cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START TRAINING</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Saved Custom Levels Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B95A5]">
              Your Saved Custom Levels ({savedCustomLevels.length})
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border flex items-center space-x-1 transition-colors cursor-pointer ${
                  filterFavorites
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#111720] text-[#8B95A5] border-[#202833]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-current' : ''}`} />
                <span>Favorites</span>
              </button>

              <button
                onClick={handleExportLevels}
                disabled={savedCustomLevels.length === 0}
                className="py-1.5 px-3 rounded-lg bg-[#111720] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-semibold flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          {savedCustomLevels.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8B95A5]" />
              <input
                type="text"
                value={savedSearch}
                onChange={(e) => setSavedSearch(e.target.value)}
                placeholder="Search saved drills by title, description, or topic..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111720] border border-[#202833] text-xs text-[#F5F7FA] placeholder-[#8B95A5]/60 focus:border-cyan-400 outline-none"
              />
            </div>
          )}

          {filteredSaved.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#111720] border border-[#202833] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0D1219] border border-[#202833] flex items-center justify-center text-2xl mx-auto">
                🤖
              </div>
              <h3 className="font-bold text-base text-[#F5F7FA]">
                {savedCustomLevels.length === 0
                  ? 'No Saved Custom Levels Yet'
                  : 'No custom levels match your filter.'}
              </h3>
              <p className="text-xs text-[#8B95A5] max-w-sm mx-auto">
                Generate drills with the AI Level Maker and click &quot;Save Level&quot; to practice them anytime.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="py-2 px-4 rounded-xl bg-cyan-500 text-[#080B10] font-bold text-xs cursor-pointer"
              >
                Create Drill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSaved.map((saved) => (
                <div
                  key={saved.id}
                  className="p-5 rounded-2xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-math">
                          Lvl {saved.blueprint.difficulty}
                        </span>
                        <span className="text-[11px] text-[#8B95A5] capitalize">
                          {saved.blueprint.purpose}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleCustomLevelFavorite(saved.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            saved.favorite ? 'text-amber-400' : 'text-[#8B95A5] hover:text-[#F5F7FA]'
                          }`}
                          title="Toggle favorite"
                        >
                          <Star className={`w-4 h-4 ${saved.favorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => deleteCustomLevel(saved.id)}
                          className="p-1.5 rounded-lg text-[#8B95A5] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete level"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-[#F5F7FA] group-hover:text-cyan-300 transition-colors">
                      {saved.blueprint.title}
                    </h3>
                    <p className="text-xs text-[#8B95A5] line-clamp-2">
                      {saved.blueprint.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#202833] flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-[#8B95A5] font-math">
                      <span>{saved.blueprint.questionCount} Qs</span>
                      {saved.timesPlayed > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-400 font-semibold">{saved.bestAccuracy ?? 0}% Best</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartLevel(saved.blueprint, saved.id)}
                      className="py-1.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#111720] border border-[#202833] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F7FA]">Import Custom Level JSON</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8B95A5]">
              Paste a custom level blueprint JSON or exported backup array below:
            </p>

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                {importError}
              </div>
            )}

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full p-3 rounded-xl bg-[#0D1219] border border-[#202833] text-xs font-mono text-[#F5F7FA] outline-none focus:border-cyan-400"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="py-2.5 px-4 rounded-xl bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={!importJsonText.trim()}
                className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                Import Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
