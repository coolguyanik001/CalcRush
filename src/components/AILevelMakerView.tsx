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

  const handleGenerate = async (promptToUse?: string) => {
    const text = (promptToUse || prompt).trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setIsSaved(false);
    setShowSampleAnswers(false);

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

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#111720] border border-[#202833] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-cyan-500 text-[#080B10] shadow-sm'
                : 'text-[#8B95A5] hover:text-[#F5F7FA]'
            }`}
          >
            Create Level
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
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
                  className="absolute top-3 right-3 text-xs text-[#8B95A5] hover:text-[#F5F7FA] px-2 py-1 rounded bg-[#111720]/80"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setPrompt(preset.prompt);
                      handleGenerate(preset.prompt);
                    }}
                    disabled={isGenerating}
                    className="p-2.5 rounded-xl bg-[#0D1219] border border-[#202833] hover:border-cyan-500/40 hover:bg-[#111720] transition-all text-left group flex flex-col justify-between"
                  >
                    <div className="text-base mb-1">{preset.icon}</div>
                    <span className="text-xs font-semibold text-[#F5F7FA] group-hover:text-cyan-300">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-[#8B95A5]">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Powered by Gemini 3.8 Flash & CalcRush Exact Rational Engine</span>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isGenerating}
                className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#080B10] font-bold text-sm flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#080B10] border-t-transparent animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Level</span>
                  </>
                )}
              </button>
            </div>

            {/* Multi-step progress notice during generation */}
            {isGenerating && (
              <div className="p-3.5 rounded-xl bg-[#0D1219] border border-cyan-500/30 flex items-center space-x-3 text-xs text-cyan-300 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span>{generationStep}</span>
              </div>
            )}
          </div>

          {/* 3. Generated Blueprint Card & Review */}
          {generatedBlueprint && (
            <div className="p-6 rounded-2xl bg-[#111720] border border-cyan-500/30 shadow-xl space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#202833] pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Level Blueprint
                    </span>
                    <span className="text-xs text-[#8B95A5]">
                      Engine: {generatedEngine}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
                    {generatedBlueprint.title}
                  </h2>
                  <p className="text-xs text-[#8B95A5] max-w-2xl leading-relaxed">
                    {generatedBlueprint.description}
                  </p>
                </div>

                {/* Difficulty & Question Count Badges */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833] text-center min-w-[80px]">
                    <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Difficulty</span>
                    <span className="text-lg font-bold font-math text-cyan-400">
                      {generatedBlueprint.difficulty} / 10
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833] text-center min-w-[80px]">
                    <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Questions</span>
                    <span className="text-lg font-bold font-math text-[#F5F7FA]">
                      {generatedBlueprint.questionCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blueprint Attributes Grid */}
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
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
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
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all w-full sm:w-auto ${
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
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#0D1219] hover:bg-[#111720] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] flex items-center justify-center space-x-1.5 transition-all"
                    title="Reroll with fresh calculations"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reroll Questions</span>
                  </button>
                </div>

                <button
                  onClick={() => handleStartLevel(generatedBlueprint)}
                  className="py-3 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/25 w-full sm:w-auto"
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8B95A5]">
              Your Saved Custom Levels ({savedCustomLevels.length})
            </h2>
            <button
              onClick={() => setActiveTab('create')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              + Create New Drill
            </button>
          </div>

          {savedCustomLevels.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#111720] border border-[#202833] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0D1219] border border-[#202833] flex items-center justify-center text-2xl mx-auto">
                🤖
              </div>
              <h3 className="font-bold text-base text-[#F5F7FA]">No Saved Custom Levels Yet</h3>
              <p className="text-xs text-[#8B95A5] max-w-sm mx-auto">
                Generate drills with the AI Level Maker and click "Save Level" to practice them anytime.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="py-2 px-4 rounded-xl bg-cyan-500 text-[#080B10] font-bold text-xs"
              >
                Create Your First Drill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedCustomLevels.map((saved) => (
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
                          className={`p-1.5 rounded-lg transition-colors ${
                            saved.favorite ? 'text-amber-400' : 'text-[#8B95A5] hover:text-[#F5F7FA]'
                          }`}
                          title="Toggle favorite"
                        >
                          <Star className={`w-4 h-4 ${saved.favorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => deleteCustomLevel(saved.id)}
                          className="p-1.5 rounded-lg text-[#8B95A5] hover:text-rose-400 transition-colors"
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
                      className="py-1.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
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
    </div>
  );
};
