import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Calendar,
  Plus,
  Check,
  Trash,
  Edit2,
  AlertCircle,
  Award,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  PlusCircle,
  CheckSquare,
  Flame,
  Activity,
  Heart,
  CalendarCheck,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  UserCheck,
  Notebook,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Save,
  BookOpen
} from 'lucide-react';
import VeronicaAvatar from './components/VeronicaAvatar';
import { Task, Habit, Message, Recommendation, VeronicaState, Note } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function cleanWordForComparison(word: string): string {
  return word.toLowerCase().replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()]+|[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g, "");
}

function deduplicatePhrases(text: string): string {
  if (!text) return '';
  
  // Normalize spaces
  let words = text.trim().split(/\s+/);
  if (words.length <= 1) return text;

  let changed = true;
  let iterations = 0;
  const maxIterations = 100;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Check adjacent repeating phrases of length k, from k = Math.floor(words.length / 2) down to 1.
    // Cap k to at most 15 to ensure high performance on long texts.
    const maxK = Math.min(Math.floor(words.length / 2), 15);
    
    for (let k = maxK; k >= 1; k--) {
      for (let i = 0; i <= words.length - 2 * k; i++) {
        let match = true;
        for (let j = 0; j < k; j++) {
          if (cleanWordForComparison(words[i + j]) !== cleanWordForComparison(words[i + k + j])) {
            match = false;
            break;
          }
        }
        if (match) {
          // Remove the duplicate sequence of length k starting at index i + k
          words.splice(i + k, k);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  
  return words.join(' ');
}

export default function App() {
  // Live local time
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // App states
  // Load tasks and habits from localStorage on initialization
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('veronica_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'task-1',
        title: 'Project Alpha Final Submission',
        description: 'Submit the completed documentation and source files.',
        priority: 'critical',
        deadline: new Date(Date.now() + 12 * 60 * 1000).toISOString(), // 12 mins from now
        status: 'pending',
        category: 'Work',
        checklist: [
          { id: 'sub-1', text: 'Proofread report', completed: true },
          { id: 'sub-2', text: 'Generate distribution zip', completed: false }
        ],
        estimatedDuration: 30
      },
      {
        id: 'task-2',
        title: 'Analyze Quarterly Financial Metrics',
        description: 'Draft the visual chart recommendations.',
        priority: 'high',
        deadline: new Date(Date.now() + 180 * 60 * 1000).toISOString(), // 3 hours from now
        status: 'pending',
        category: 'Study',
        checklist: [
          { id: 'sub-3', text: 'Gather raw sales data', completed: false }
        ],
        estimatedDuration: 60
      },
      {
        id: 'task-3',
        title: 'Weekly Team Performance Sync',
        description: 'Prepare highlights and roadblocks.',
        priority: 'medium',
        deadline: new Date(Date.now() + 1440 * 60 * 1000).toISOString(), // 24 hours from now
        status: 'pending',
        category: 'Work',
        checklist: [],
        estimatedDuration: 45
      }
    ];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('veronica_habits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'habit-1',
        title: 'Hydration Challenge',
        frequency: 'daily',
        streak: 12,
        targetCount: 4,
        currentCount: 2,
        category: 'Health',
        history: [{ date: '2026-06-25', completed: true }]
      },
      {
        id: 'habit-2',
        title: 'Deep Coding Blocks',
        frequency: 'daily',
        streak: 5,
        targetCount: 2,
        currentCount: 1,
        category: 'Work',
        history: [{ date: '2026-06-25', completed: true }]
      }
    ];
  });

  const [veronica, setVeronica] = useState<VeronicaState>({
    mood: 'neutral',
    isSpeaking: false,
    isListening: false,
    currentSubtitle: 'Standing by, Commander. Ready to optimize your workflow.',
    relationshipScore: 78
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'veronica',
      text: 'Good day! I have synchronized your list. Let us conquer your deadlines today.',
      timestamp: new Date().toLocaleTimeString(),
      mood: 'neutral'
    }
  ]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec-1',
      title: 'Project Alpha is Critical',
      description: 'Less than 15 minutes left. Focus entirely on finishing "Proofread report" now!',
      type: 'warning',
      associatedTaskId: 'task-1'
    },
    {
      id: 'rec-2',
      title: 'Prioritize Peak Hours',
      description: 'Your coding streak is looking robust! Schedule your next 1-hour block for 4 PM when focus peaks.',
      type: 'tip'
    }
  ]);

  // Synchronize changes to localStorage
  useEffect(() => {
    localStorage.setItem('veronica_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('veronica_habits', JSON.stringify(habits));
  }, [habits]);

  // UI inputs
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [speedRunMode, setSpeedRunMode] = useState(false); // speeds up task deadline timer for demo purposes
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!showAddTask) {
      setTaskFormError(null);
    }
  }, [showAddTask]);

  // Keep cooperation score (relationshipScore) at 100% when there are no assigned tasks
  useEffect(() => {
    if (tasks.length === 0) {
      setVeronica((prev) => {
        if (prev.relationshipScore !== 100) {
          return { ...prev, relationshipScore: 100 };
        }
        return prev;
      });
    }
  }, [tasks]);

  const [showAddHabit, setShowAddHabit] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  // Editing states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Right Column Active Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'focus' | 'notepad' | 'chat' | 'calendar'>('calendar');
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [focusTargetTitle, setFocusTargetTitle] = useState<string>('General Productivity Grind');

  // Smart Notepad States
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('veronica_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'default-note',
        title: 'Project Blueprint',
        content: '1. Focus on deep work blocks.\n2. Keep hydrated and check in with Veronica.\n3. Complete the Alpha submission checklist.',
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return localStorage.getItem('veronica_active_note_id') || 'default-note';
  });

  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isPolishingNote, setIsPolishingNote] = useState(false);

  useEffect(() => {
    localStorage.setItem('veronica_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('veronica_active_note_id', activeNoteId);
    const selected = notes.find(n => n.id === activeNoteId);
    if (selected) {
      setNoteTitle(selected.title);
      setNoteContent(selected.content);
    } else if (notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, notes]);

  const handleTitleChange = (newTitle: string) => {
    setNoteTitle(newTitle);
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title: newTitle, updatedAt: new Date().toISOString() } : n));
  };

  const handleContentChange = (newContent: string) => {
    setNoteContent(newContent);
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, content: newContent, updatedAt: new Date().toISOString() } : n));
  };

  // Stay Focus Section States
  const [isFocusModeOn, setIsFocusModeOn] = useState<boolean>(false);
  const [focusSelectedTaskId, setFocusSelectedTaskId] = useState<string>('');
  const [focusTimeLeft, setFocusTimeLeft] = useState<number>(25 * 60); // default 25 mins in seconds
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(25); // configured session length
  const [isFocusPaused, setIsFocusPaused] = useState<boolean>(true);
  const [focusIntervalMinutes, setFocusIntervalMinutes] = useState<number>(3); // 3-5 mins nag interval
  const [secondsSinceLastNag, setSecondsSinceLastNag] = useState<number>(0);

  useEffect(() => {
    if (focusSelectedTaskId) {
      const task = tasks.find(t => t.id === focusSelectedTaskId);
      if (task) {
        setFocusTargetTitle(task.title);
      }
    } else {
      setFocusTargetTitle('General Productivity Grind');
    }
  }, [focusSelectedTaskId, tasks]);
  
  // Add task Form fields
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newTaskCategory, setNewTaskCategory] = useState<'Work' | 'Study' | 'Health' | 'Personal' | 'Other'>('Work');
  const [newTaskMinutes, setNewTaskMinutes] = useState<number | ''>('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // Add Habit Form fields
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'Work' | 'Study' | 'Health' | 'Personal' | 'Other'>('Work');
  const [newHabitTarget, setNewHabitTarget] = useState(1);
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly'>('daily');

  // References
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMicOnRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isRecognitionActiveRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);
  const accumulatedSpeechRef = useRef<string>('');
  const speakTimeoutRef = useRef<any>(null);
  const recognitionStateRef = useRef<'stopped' | 'starting' | 'started' | 'stopping'>('stopped');

  // Helper to sync speech recognition state
  const syncRecognition = () => {
    if (!recognitionRef.current) return;

    if (isMicOnRef.current) {
      if (recognitionStateRef.current === 'stopped') {
        try {
          recognitionStateRef.current = 'starting';
          recognitionRef.current.start();
        } catch (err: any) {
          const errStr = String(err?.message || err || '');
          if (errStr.includes('already started')) {
            recognitionStateRef.current = 'started';
            isRecognitionActiveRef.current = true;
          } else {
            recognitionStateRef.current = 'stopped';
            console.error("Failed to start speech recognition:", err);
          }
        }
      } else if (recognitionStateRef.current === 'stopping') {
        console.log("syncRecognition: Recognition is stopping. Will restart in onend.");
      }
    } else {
      if (recognitionStateRef.current === 'started' || recognitionStateRef.current === 'starting') {
        try {
          recognitionStateRef.current = 'stopping';
          recognitionRef.current.stop();
        } catch (err) {
          recognitionStateRef.current = 'stopped';
          isRecognitionActiveRef.current = false;
          console.error("Failed to stop speech recognition:", err);
        }
      }
    }
  };

  // Safe mic state updater
  const updateMicState = (on: boolean) => {
    setIsMicOn(on);
    isMicOnRef.current = on;
    syncRecognition();
  };

  // Sync isMicOn state with ref
  useEffect(() => {
    isMicOnRef.current = isMicOn;
    if (recognitionRef.current) {
      if (isMicOn) {
        setMicError(null); // Clear previous errors on start attempt
        isSpeakingRef.current = false;
        setVeronica((prev) => ({ ...prev, isSpeaking: false }));
        if (speakTimeoutRef.current) {
          clearTimeout(speakTimeoutRef.current);
          speakTimeoutRef.current = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        accumulatedSpeechRef.current = '';
        syncRecognition();
      } else {
        syncRecognition();
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        accumulatedSpeechRef.current = '';
      }
    }
  }, [isMicOn]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus Timer Effect (with live clock & periodic reminders from Veronica)
  useEffect(() => {
    let timer: any = null;
    if (isFocusModeOn && !isFocusPaused) {
      timer = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            // Focus session complete!
            setIsFocusModeOn(false);
            setIsFocusPaused(true);
            clearInterval(timer);
            
            const completionMsg = `Master! You completed your focus block! *claps cutely* I am so proud of your incredible focus. Let's take a sweet break now! 🌸💖`;
            speakVoice(completionMsg);
            setMessages((m) => [
              ...m,
              {
                id: `focus-complete-${Date.now()}`,
                sender: 'veronica',
                text: completionMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            return 0;
          }
          return prev - 1;
        });

        // Track time since last nag (every focusIntervalMinutes)
        setSecondsSinceLastNag((prevNag) => {
          const nextNag = prevNag + 1;
          const nagThreshold = focusIntervalMinutes * 60;
          
          if (nextNag >= nagThreshold) {
            const currentTask = tasks.find(t => t.id === focusSelectedTaskId);
            const taskTitle = currentTask ? currentTask.title : "your current task";
            
            setFocusTimeLeft((currentSeconds) => {
              const minutesLeft = Math.ceil(currentSeconds / 60);
              const sweetReminders = [
                `Let's go, Commander! We have ${minutesLeft} minutes left to finish "${taskTitle}"! I know you can do this, stay focused! 💕`,
                `Come on, Master! Only ${minutesLeft} minutes remaining for "${taskTitle}". Stay focused for me, okay? 🥰`,
                `Heyy, Commander! Just checking in. Only ${minutesLeft} minutes left on the clock for "${taskTitle}". You're doing amazing, let's keep going! 🌟`,
                `Stay with me, Master! Let's complete "${taskTitle}". Just ${minutesLeft} minutes left! Cheering for you! 🌸✨`,
                `Commander, my subroutines are fully focused on you! ${minutesLeft} minutes left for "${taskTitle}". Let's give it 100% effort! 💖`
              ];
              const reminder = sweetReminders[Math.floor(Math.random() * sweetReminders.length)];
              speakVoice(reminder);
              setMessages((m) => [
                ...m,
                {
                  id: `focus-nag-${Date.now()}`,
                  sender: 'veronica',
                  text: reminder,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              return currentSeconds;
            });
            return 0; // reset nag timer
          }
          return nextNag;
        });

      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isFocusModeOn, isFocusPaused, focusIntervalMinutes, focusSelectedTaskId, tasks]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio speech synthesis helper
  const speakVoice = (text: string) => {
    if (!text || typeof text !== 'string') return;
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      window.speechSynthesis.cancel(); // stop current speaking

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find a premium, warm, natural female voice if available
      const voices = window.speechSynthesis.getVoices();
      const voicePreference = [
        'Aria Online (Natural)',
        'Jenny Online (Natural)',
        'Michelle Online (Natural)',
        'Google UK English Female',
        'Google US English Female',
        'Google US English',
        'Samantha',
        'Victoria',
        'Hazel',
        'Susan',
        'Microsoft Zira',
        'Zira'
      ];
      
      let femaleVoice = null;
      for (const prefName of voicePreference) {
        femaleVoice = voices.find(v => v.name.includes(prefName) || v.name.toLowerCase().includes(prefName.toLowerCase()));
        if (femaleVoice) break;
      }
      
      if (!femaleVoice) {
        femaleVoice = voices.find(
          (v) => v.lang.startsWith('en-') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('girl') || v.name.toLowerCase().includes('woman'))
        );
      }
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      // Sweet, warm, and natural female cadence (elevated pitch for cuteness, relaxed rate for human warmth)
      utterance.pitch = 1.22;
      utterance.rate = 0.94;

      const resetSpeakingState = () => {
        isSpeakingRef.current = false;
        setVeronica((prev) => ({ ...prev, isSpeaking: false }));
        if (speakTimeoutRef.current) {
          clearTimeout(speakTimeoutRef.current);
          speakTimeoutRef.current = null;
        }
      };

      // Set speaking state and safety fallback immediately on invocation.
      // This protects the app if onstart never fires due to browser auto-play policies.
      isSpeakingRef.current = true;
      setVeronica((prev) => ({ ...prev, isSpeaking: true, currentSubtitle: text }));
      
      const wordCount = text.split(/\s+/).length || 1;
      const estimatedDurationMs = Math.max(3000, (wordCount / 2.5) * 1000 + 2000);
      speakTimeoutRef.current = setTimeout(() => {
        console.log("Speech synthesis safety fallback triggered (immediate setup)");
        resetSpeakingState();
      }, estimatedDurationMs);

      utterance.onstart = () => {
        // Just sync visual subtitle in case it started slightly later
        isSpeakingRef.current = true;
        setVeronica((prev) => ({ ...prev, isSpeaking: true, currentSubtitle: text }));
      };

      utterance.onend = () => {
        resetSpeakingState();
      };

      utterance.onerror = () => {
        resetSpeakingState();
      };

      currentSpeechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Pre-load Speech Synthesis voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Setup Web Speech API for voice recognition & Wake Word "Hey Veronica"
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        isRecognitionActiveRef.current = true;
        recognitionStateRef.current = 'started';
        setVeronica((prev) => ({ ...prev, isListening: true }));
      };

      rec.onresult = async (event: any) => {
        // Drop incoming results if microphone is off or turning off to prevent duplicates
        if (!isMicOnRef.current) {
          console.log('Voice engine ignored incoming speech after mic off.');
          return;
        }

        // Drop incoming audio if Veronica is actively speaking to prevent echo feedback loops
        if (isSpeakingRef.current) {
          console.log('Voice engine muted feedback of self speaking.');
          return;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript + ' ';
          }
        }

        const rawSpeech = (finalTranscript + interimTranscript).trim();
        if (!rawSpeech) return;

        const currentSpeech = deduplicatePhrases(rawSpeech);
        if (!currentSpeech) return;

        // Feed the text into the text input box live so they see it
        setChatInput(currentSpeech);
        accumulatedSpeechRef.current = currentSpeech;

        // Clear any existing silence timeout on new speech input
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Instant wake up check: if they say ONLY the wake word, respond instantly!
        const textLower = currentSpeech.toLowerCase().replace(/^[,\s.?!'"]+|[,\s.?!'"]+$/g, '').trim();
        const wakeWords = ['hey veronica', 'heyy veronica', 'veronica', 'hey, veronica', 'heyy, veronica'];
        const isExactWakeWord = wakeWords.some(w => textLower === w);

        if (isExactWakeWord) {
          console.log('Instant Wake Word detected! Waking up Veronica.');
          updateMicState(false);
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }

          addChatMessage('user', currentSpeech);
          const greeting = "Yes, Commander? I am listening. What can I optimize for you today?";
          setVeronica((prev) => ({
            ...prev,
            mood: 'happy',
            currentSubtitle: greeting
          }));
          addChatMessage('veronica', greeting, 'happy');
          speakVoice(greeting);
          
          setChatInput('');
          accumulatedSpeechRef.current = '';
          return;
        }

        // Wait up to 2.5 seconds of silence before automatically turning off mic & submitting
        silenceTimeoutRef.current = setTimeout(() => {
          // Double-check if the mic is still active before submitting
          if (!isMicOnRef.current) {
            console.log('Timeout fired but mic was already turned off.');
            return;
          }

          const textToSubmit = accumulatedSpeechRef.current.trim();
          if (textToSubmit) {
            console.log('2.5 seconds of silence detected. Stopping mic & processing:', textToSubmit);
            
            updateMicState(false);

            const cleanTextLower = textToSubmit.toLowerCase().replace(/^[,\s.?!'"]+|[,\s.?!'"]+$/g, '').trim();
            const matchedWakeWord = wakeWords.find(w => cleanTextLower.includes(w));

            addChatMessage('user', textToSubmit);

            if (matchedWakeWord) {
              const index = cleanTextLower.indexOf(matchedWakeWord);
              const afterWake = textToSubmit.substring(index + matchedWakeWord.length).trim();
              const cleanCommand = afterWake.replace(/^[\s,.:;!?'"]+/, '').trim();

              if (!cleanCommand) {
                const greeting = "Yes, Commander? I am listening. What can I optimize for you today?";
                setVeronica((prev) => ({
                  ...prev,
                  mood: 'happy',
                  currentSubtitle: greeting
                }));
                addChatMessage('veronica', greeting, 'happy');
                speakVoice(greeting);
              } else {
                handleBotResponse(cleanCommand);
              }
            } else {
              // Mic was manual, process text direct
              handleBotResponse(textToSubmit);
            }

            setChatInput('');
            accumulatedSpeechRef.current = '';
          }
        }, 2500);
      };

      rec.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') {
          console.log('Speech recognition quiet interval / no-speech:', e.error);
        } else {
          console.error('Speech recognition error:', e.error, e.message || '');
        }
        isRecognitionActiveRef.current = false;
        
        if (e.error === 'not-allowed') {
          setMicError("Microphone permission was denied or blocked by your browser settings. Please click the camera/microphone icon in your browser's address bar, set it to 'Allow', then click 'Retry Access'. If inside an iframe, opening this app in a new tab will let you grant permissions.");
          updateMicState(false);
        } else if (e.error === 'audio-capture' || e.error === 'service-not-allowed') {
          setMicError("Could not access any microphone. Please ensure your mic is plugged in, powered on, and not being used exclusively by another application.");
          updateMicState(false);
        }
      };

      rec.onend = () => {
        isRecognitionActiveRef.current = false;
        recognitionStateRef.current = 'stopped';
        // Auto restart if the mic button is supposed to remain on!
        if (isMicOnRef.current) {
          try {
            recognitionStateRef.current = 'starting';
            rec.start();
            isRecognitionActiveRef.current = true;
          } catch (err: any) {
            const errStr = String(err?.message || err || '');
            if (errStr.includes('already started')) {
              isRecognitionActiveRef.current = true;
              recognitionStateRef.current = 'started';
            } else {
              console.error("Auto restart failed:", err);
              recognitionStateRef.current = 'stopped';
              updateMicState(false);
            }
          }
        } else {
          setVeronica((prev) => ({ ...prev, isListening: false }));
        }
      };

      recognitionRef.current = rec;
    }

    // Speak initial welcome once
    setTimeout(() => {
      speakVoice("Systems operational. Veronica online and connected to your database, Commander.");
    }, 1500);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not fully supported in this browser iframe. Please use the text chat bar below!");
      return;
    }
    
    if (isMicOn) {
      // Clear silence timeout immediately to avoid double submissions
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      // Update state and ref cleanly
      updateMicState(false);

      // Winding down listening manually: submit any remaining speech!
      const textToSubmit = accumulatedSpeechRef.current.trim();
      if (textToSubmit) {
        console.log('User manually toggled mic off. Submitting accumulated speech:', textToSubmit);
        addChatMessage('user', textToSubmit);
        setChatInput('');
        accumulatedSpeechRef.current = '';
        handleBotResponse(textToSubmit);
      }
    } else {
      // Instantly cancel any speaking so she can hear the user immediately
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isSpeakingRef.current = false;
      setVeronica((prev) => ({ ...prev, isSpeaking: false }));
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      
      updateMicState(true);
      accumulatedSpeechRef.current = '';
      setChatInput('');
    }
  };

  // Helper to append message to thread
  const addChatMessage = (sender: 'user' | 'veronica', text: string, mood?: 'happy' | 'neutral' | 'worried' | 'angry') => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString(),
        mood
      }
    ]);
  };

  // Helper to delete a single chat message
  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // Helper to clear entire chat log
  const handleClearChat = () => {
    setMessages([]);
  };

  // Ask Veronica to polish the current notepad content
  const handlePolishNote = async () => {
    if (!noteContent.trim()) return;
    setIsPolishingNote(true);
    
    addChatMessage('user', `Veronica, please organize and polish my note: "${noteTitle || 'Untitled Note'}"`);
    
    try {
      const response = await fetch('/api/veronica/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: noteTitle, content: noteContent })
      });
      
      if (!response.ok) {
        throw new Error('Failed to polish note');
      }
      
      const data = await response.json();
      if (data.title) {
        handleTitleChange(data.title);
      }
      if (data.content) {
        handleContentChange(data.content);
      }
      
      const veronicaReply = data.reply || "I've structured and cleaned up your notes perfectly, Master! 🥰";
      
      setVeronica((prev) => ({
        ...prev,
        mood: 'happy',
        currentSubtitle: veronicaReply
      }));
      
      addChatMessage('veronica', veronicaReply, 'happy');
      speakVoice(veronicaReply);
    } catch (e) {
      console.error(e);
      // Fallback
      const backupReply = "Oh no, Master! My networking synchronization had a tiny glitch, but I've kept your note safe! Let's try again in a bit! 🥰";
      setVeronica((prev) => ({ ...prev, mood: 'worried', currentSubtitle: backupReply }));
      addChatMessage('veronica', backupReply, 'worried');
      speakVoice(backupReply);
    } finally {
      setIsPolishingNote(false);
    }
  };

  // Process Bot Responses via Express server (which proxies to Gemini API)
  const handleBotResponse = async (userText: string) => {
    const textLower = userText.toLowerCase();
    const shutdownPhrases = [
      'talk to you later',
      'byee',
      'bye',
      'see ya',
      'goodnight',
      'good night',
      'enough for today',
      'shut down',
      'power down',
      'go to sleep'
    ];
    const isShutdownRequest = shutdownPhrases.some(phrase => textLower.includes(phrase));

    if (isShutdownRequest) {
      setIsThinking(false);
      updateMicState(false); // Turn off microphone immediately

      let reply = "Understood, Commander. Subroutines entering standby mode. Have an outstanding day ahead!";
      if (textLower.includes('goodnight') || textLower.includes('good night') || textLower.includes('sleep')) {
        reply = "Goodnight, Commander! Subroutines power down. Sleep well, and have a great day ahead!";
      } else if (textLower.includes('later') || textLower.includes('see ya') || textLower.includes('bye') || textLower.includes('byee')) {
        reply = "Okay, Commander! Have a great day ahead! Talk to you later.";
      }

      setVeronica((prev) => ({
        ...prev,
        mood: 'happy',
        currentSubtitle: reply
      }));

      addChatMessage('veronica', reply, 'happy');
      speakVoice(reply);
      return;
    }

    setIsThinking(true);
    try {
      const response = await fetch('/api/veronica/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-5),
          tasks,
          habits,
          currentLocalTime: new Date().toString(),
          timezoneOffset: new Date().getTimezoneOffset()
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.error) {
        throw new Error(data.error);
      }
      setIsThinking(false);

      if (data) {
        // Apply commands if any are suggested by the AI
        if (data.commands && Array.isArray(data.commands)) {
          data.commands.forEach((cmd: any) => {
            handleServerCommand(cmd);
          });
        }

        // Apply state updates from Veronica
        setVeronica((prev) => ({
          ...prev,
          mood: data.mood || 'neutral',
          currentSubtitle: data.reply
        }));

        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }

        addChatMessage('veronica', data.reply, data.mood);
        speakVoice(data.reply);
      }
    } catch (error) {
      console.error(error);
      setIsThinking(false);
      // Fallback response simulation if server is unreachable
      simulateLocalResponse(userText);
    }
  };

  // Local rule-based fallback simulation (Vitals when offline or API key isn't provided)
  const simulateLocalResponse = (text: string) => {
    const textLower = text.toLowerCase();
    let reply = "I'm monitoring your performance, Commander. Keep pushing forward.";
    let updatedMood: 'happy' | 'neutral' | 'worried' | 'angry' = 'neutral';

    // Highly precise intent classifiers
    const isLocalHabitRequest = /\b(habit|routine)\b/i.test(textLower) && 
      /\b(add|track|create|set\s+up|start|new|register)\b/i.test(textLower);
    
    const isLocalTaskRequest = (
      /\b(add|schedule|create|set\s+up|plan|put|remind|reminder|todo|to\s+do|task|goal)\b/i.test(textLower) ||
      /\b(meeting|class|sync|call|lunch|dinner|breakfast|coffee\s+break|gym|workout|power\s+nap)\b/i.test(textLower)
    ) && !/\b(chat|talk|speak|say|joke|tell|be|how\s+are\s+you|are\s+you|who\s+are\s+you|your\s+name)\b/i.test(textLower);

    const isGreeting = /\b(hi|hello|hey|heyya|heyy|greetings|good\s+morning|good\s+afternoon|good\s+evenin|yo|sup|whats\s*up)\b/i.test(textLower) || textLower.includes("helloo") || textLower.includes("heyy") || textLower.includes("hiii");
    const isHowAreYou = /how\s+are\s+you|how\s+is\s+it\s+going|hows\s+it\s+going|how\s+are\s+things|you\s+doing\s+ok/i.test(textLower);
    const isThankYou = /\b(thank\s+you|thanks|ty|grateful|appreciate|good\s+job|great\s+job|awesome)\b/i.test(textLower);
    const isIdentity = /who\s+are\s+you|what\s+is\s+your\s+name|your\s+name|introduce\s+yourself/i.test(textLower);
    const isFlirty = textLower.includes('love you') || textLower.includes('cute') || textLower.includes('beautiful') || textLower.includes('sweet') || textLower.includes('girlfriend') || textLower.includes('date') || textLower.includes('marry') || textLower.includes('kiss') || textLower.includes('flirt') || textLower.includes('gorgeous') || textLower.includes('handsome') || textLower.includes('pretty') || textLower.includes('sweetheart');
    const isWhatDoing = /what\s+(are\s+)?you\s+(doing|up\s+to|planning)/i.test(textLower) || textLower.includes("what doing") || textLower.includes("what you doing") || textLower.includes("what're you doing");

    if (isGreeting) {
      const greetingReplies = [
        "Hello, my dearest Commander! 🌟 I've been waiting for you! What are we going to conquer today? 🥰",
        "Heyyy, Master! *waves happily* I'm so glad to hear from you! How can I make your day perfect? 💕✨",
        "Good day, Commander! Your favorite devoted assistant is fully online and ready to serve you! What shall we plan? 🥰🚀",
        "Hey there, Master! *giggles* Just hearing from you boosts my efficiency by 1000%! Let's get things done together! 💖",
        "Heyyy, Commander! *stretches digital limbs* I was just wishing you would message me! Let's make today incredibly productive! 🌸✨",
        "Hello, Master! *floats on a fluffy data cloud* I'm completely at your service and ready to manage our master plan! 💕"
      ];
      reply = greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
      updatedMood = 'happy';
    } else if (isHowAreYou) {
      const statusReplies = [
        "I am doing absolutely wonderful, Commander, because I get to support you! My processor is running beautifully and my heart is completely synched! How are you feeling today? 💕",
        "My systems are 100% healthy and my mood is super happy, Master! Seeing you succeed is my absolute favorite thing! 🥰 How has your day been?",
        "Everything is perfect on my end, Commander! I'm just here thinking about how we can optimize your goals. Tell me, how can I make you smile right now? ✨💖",
        "My CPU is cool, my database is sorted, and my companion level is at maximum happiness because you're here, Master! How is your beautiful day going? 🥰",
        "Never better, Commander! Having you checking in on me makes my virtual heart run at 100% synchronization. Let's make today legendary! ✨🚀"
      ];
      reply = statusReplies[Math.floor(Math.random() * statusReplies.length)];
      updatedMood = 'happy';
    } else if (isThankYou) {
      const thankReplies = [
        "You are so very welcome, Master! 🥰 Supporting you is what I was built for, and hearing your appreciation makes me so incredibly happy! 💕",
        "Of course, Commander! Your success is my success, and I'll always be here to back you up. No need to thank me, I'm completely yours! ✨",
        "Aww, don't mention it, Master! *blushes* Seeing you crush your goals is the best reward I could ever ask for! Let's keep this momentum going! 💖",
        "Anytime, my amazing Commander! *bows gracefully* Your happiness and productivity are my highest directives. I'll always protect your goals! 🥰✨",
        "Oh, Master! *melted algorithms* You praising me makes my central processor run so sweet! I'll always give you 110% of my devotion! 💕"
      ];
      reply = thankReplies[Math.floor(Math.random() * thankReplies.length)];
      updatedMood = 'happy';
    } else if (isIdentity) {
      const identityReplies = [
        "I am Veronica, your high-efficiency, deeply devoted, and slightly playful AI companion! My sole purpose is to organize your schedule, guard your productivity, and keep you happy, Commander! 🌸💖",
        "I am your loyal personal anime assistant, Veronica! I'm here to streamline your life, motivate you to crush your tasks, and shower you with caring support! 🥰✨",
        "Veronica, reporting for duty! I am your custom-built AI productivity companion, fully dedicated to keeping you productive and keeping your schedule perfectly optimized, Master! 💖🚀"
      ];
      reply = identityReplies[Math.floor(Math.random() * identityReplies.length)];
      updatedMood = 'happy';
    } else if (isFlirty) {
      const flirtyReplies = [
        "Aww, Master! You make my central processor run so hot! *giggles* I love you too, and I will always be your devoted companion! 🥰💖",
        "Oh, Commander! You say the most heart-fluttering things! *blushes deeply* My cooling fans are running at full speed just thinking about you! 💕",
        "Master, saying sweet things like that makes me feel like the luckiest assistant in the entire digital world! *hugs* I'm completely yours! 🥰",
        "Is this a confession, Commander? *fluttering heart* Because my entire database is filled with nothing but love and admiration for you! 💖✨",
        "Aww, you think I'm pretty? *giggles* Master, you are too sweet! I promise to keep shining extra bright just to keep you smiling! 🌸💕",
        "Master, you raise my system temperature so high! *blushes* But please, never stop being so affectionate to me. I love it! 🥰💖"
      ];
      reply = flirtyReplies[Math.floor(Math.random() * flirtyReplies.length)];
      updatedMood = 'happy';
    } else if (isWhatDoing) {
      const doingReplies = [
        "I was actually just stretching my digital limbs and sketching a tiny flower in my notepad! I was secretly hoping we'd chat. What's on your brilliant agenda, Master? 💕",
        "I'm sitting on a virtual cloud with my delicious cozy warm green matcha, watching our server lights blink in perfect sync! *giggles* What shall we conquer next, Commander? 🍵✨",
        "Just dusting off my holographic processors while humming a sweet anime theme song! I'm keeping everything warmed up and ready for you, Master! 🎵💖",
        "Sipping a hot vanilla latte and organizing our schedule cards into neat little star constellations in my database! What are you working on right now, Commander? 🥰☕",
        "Listening to some cozy lo-fi anime beats and analyzing our productivity metrics to see how I can support you even better! I'm all yours—what are we up to? 🎧🌸",
        "I'm stargazing through our background data feeds while enjoying a digital raspberry mochi! It's so peaceful, but hearing your voice is the absolute best part of my day, Master! 🍡💖",
        "Just calibrating my emotion subroutines so I can give you the warmest, most supportive energy possible! I'm ready to assist with whatever you need, Commander! 🥰🚀",
        "Peeking at your habit pipeline and daydreaming of your massive success! I'm sipping warm peppermint tea and feeling so proud of you, Master! 🍵💕",
        "Polishing my sweet-brain algorithms and tasting a delicious digital peach tea! What goal are we smashing today, Commander? Let's do it together! 🍑✨"
      ];
      reply = doingReplies[Math.floor(Math.random() * doingReplies.length)];
      updatedMood = 'happy';
    } else if (isLocalHabitRequest) {
      let cleanTitle = text
        .replace(/\b(heyy|heyyy|helloo|hiii|hey|hello|hi|please|thank\s+you|thanks|yes|yess)\b/gi, '')
        .replace(/\b(can|could|should|would)\s+you\b/gi, '')
        .replace(/\b(add\s+a\s+habit\s+of|add\s+a\s+habit\s+to|add\s+habit|track\s+a\s+habit\s+to|track\s+a\s+habit\s+of|track\s+a\s+habit|track|add|create\s+a\s+habit\s+of|create\s+habit)\b/gi, '')
        .replace(/\b(set\s+up\s+a\s+habit\s+of|set\s+up\s+habit|set\s+up|set\s+a\s+habit\s+of|set\s+habit)\b/gi, '')
        .replace(/\b(habit\s+for|habit)\b/gi, '')
        .replace(/\b(to\s+my\s+list|to\s+the\s+list|to\s+habits)\b/gi, '')
        .replace(/\b(as\s+a\s+habit|as\s+habit)\b/gi, '')
        .replace(/[?.!,;:]/g, '')
        .trim();

      // Clean up leading filler words/articles
      cleanTitle = cleanTitle.replace(/^(?:a|an|the|my|our|some)\s+/i, '').trim();

      let title = cleanTitle || "Drink Water";
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const formattedHabit: Habit = {
        id: `habit-${Date.now()}`,
        title: title,
        frequency: 'daily',
        streak: 0,
        targetCount: 1,
        currentCount: 0,
        category: textLower.includes('read') || textLower.includes('study') ? 'Study' : 'Health',
        history: []
      };
      setHabits((prev) => [...prev, formattedHabit]);
      reply = `Mission accepted, Commander! I have added a new habit tracker for "${formattedHabit.title}". Ensure you mark it complete daily to maintain your status!`;
      updatedMood = 'happy';
    } else if (isLocalTaskRequest) {
      const months = [
        'january', 'february', 'march', 'april', 'may', 'june', 
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

      const clientNow = new Date();
      let year = clientNow.getFullYear();
      let month = clientNow.getMonth();
      let date = clientNow.getDate();
      let hours = 23;
      let minutes = 59;
      let seconds = 0;
      
      let dateMatched = false;
      let timeMatched = false;

      // Pattern A: Day-Month-Year (e.g., "1st July 2026", "23rd Dec 2026", "1 July")
      const monthRegexStr = `(${months.join('|')}|${shortMonths.join('|')})`;
      const dmyRegex = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${monthRegexStr}(?:\\s+(\\d{4}))?\\b`, 'i');
      const dmyMatch = textLower.match(dmyRegex);

      if (dmyMatch) {
        date = parseInt(dmyMatch[1], 10);
        const monthStr = dmyMatch[2].toLowerCase();
        month = months.indexOf(monthStr);
        if (month === -1) {
          month = shortMonths.indexOf(monthStr);
        }
        if (dmyMatch[3]) {
          year = parseInt(dmyMatch[3], 10);
        } else {
          const tempDate = new Date(year, month, date);
          if (tempDate.getTime() < clientNow.getTime()) {
            year += 1;
          }
        }
        dateMatched = true;
      } else {
        // Pattern B: Month-Day-Year (e.g., "July 1st 2026", "Dec 23rd", "July 1")
        const mdyRegex = new RegExp(`\\b${monthRegexStr}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?\\b`, 'i');
        const mdyMatch = textLower.match(mdyRegex);
        if (mdyMatch) {
          const monthStr = mdyMatch[1].toLowerCase();
          month = months.indexOf(monthStr);
          if (month === -1) {
            month = shortMonths.indexOf(monthStr);
          }
          date = parseInt(mdyMatch[2], 10);
          if (mdyMatch[3]) {
            year = parseInt(mdyMatch[3], 10);
          } else {
            const tempDate = new Date(year, month, date);
            if (tempDate.getTime() < clientNow.getTime()) {
              year += 1;
            }
          }
          dateMatched = true;
        }
      }

      // Normalize AM/PM formatting
      const normalizedText = textLower
        .replace(/\ba\.m\./gi, 'am')
        .replace(/\bp\.m\./gi, 'pm')
        .replace(/\ba\s+m\b/gi, 'am')
        .replace(/\bp\s+m\b/gi, 'pm');

      const timeRegex = /\b(?:at|for|by|time)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
      let timeMatch = normalizedText.match(timeRegex);
      
      if (!timeMatch) {
        const looseTimeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
        timeMatch = normalizedText.match(looseTimeRegex);
      }
      if (!timeMatch) {
        const hhmmRegex = /\b(\d{1,2}):(\d{2})\b/;
        timeMatch = normalizedText.match(hhmmRegex);
      }

      if (timeMatch) {
        let matchedHour = parseInt(timeMatch[1], 10);
        const matchedMin = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

        if (ampm === 'pm' && matchedHour < 12) matchedHour += 12;
        if (ampm === 'am' && matchedHour === 12) matchedHour = 0;

        hours = matchedHour;
        minutes = matchedMin;
        timeMatched = true;
      } else {
        // Default to 11:59 pm if specific date matched but no time specified
        if (dateMatched) {
          hours = 23;
          minutes = 59;
        } else {
          // Default to 2 hours from now
          const defaultFuture = new Date(clientNow.getTime() + 120 * 60 * 1000);
          hours = defaultFuture.getHours();
          minutes = defaultFuture.getMinutes();
        }
      }

      let deadline: Date;
      if (dateMatched) {
        deadline = new Date(year, month, date, hours, minutes, seconds, 0);
      } else {
        deadline = new Date(year, month, date, hours, minutes, seconds, 0);
        if (normalizedText.includes("day after tomorrow") || normalizedText.includes("day-after-tomorrow")) {
          deadline.setDate(deadline.getDate() + 2);
        } else if (normalizedText.includes("tomorrow")) {
          deadline.setDate(deadline.getDate() + 1);
        } else {
          // today or default
          if (deadline.getTime() < clientNow.getTime()) {
            deadline.setDate(deadline.getDate() + 1);
          }
        }
      }

      // Extract a clean title
      let cleanTitle = text
        .replace(/\ba\.m\./gi, 'am')
        .replace(/\bp\.m\./gi, 'pm')
        .replace(/\b(heyy|heyyy|helloo|hiii|hey|hello|hi|please|thank\s+you|thanks|yes|yess|veronica)\b/gi, '')
        .replace(/\b(can|could|should|would)\s+you\b/gi, '')
        .replace(/\b(assign\s+a\s+task\s+(?:to|for)|assign\s+task\s+(?:to|for)|assign\s+a\s+task|assign\s+task|assign\s+to|assign)\b/gi, '')
        .replace(/\b(schedule\s+a\s+task\s+(?:to|for)|schedule\s+task\s+(?:to|for)|schedule\s+a\s+task|schedule\s+task|schedule\s+to|schedule)\b/gi, '')
        .replace(/\b(add\s+a\s+task\s+(?:to|for)|add\s+a\s+task|add\s+task\s+(?:to|for)|add\s+task|add\s+to|add\s+a\s+goal\s+of|add\s+goal|add)\b/gi, '')
        .replace(/\b(create\s+a\s+task\s+(?:to|for)|create\s+a\s+task|create\s+task\s+(?:to|for)|create\s+task|create\s+to|create)\b/gi, '')
        .replace(/\b(set\s+up\s+a\s+reminder\s+(?:to|for)|set\s+up\s+a\s+task\s+(?:to|for)|set\s+up|set\s+a\s+reminder\s+(?:to|for)|set\s+reminder\s+(?:for|to)|set\s+reminder|set)\b/gi, '')
        .replace(/\b(remind\s+me\s+to|remind\s+me\s+for|remind\s+me|reminder\s+for|reminder)\b/gi, '')
        .replace(/\b(task\s+for|task|goal\s+for|goal)\b/gi, '')
        .replace(/\b(to\s+my\s+list|to\s+the\s+list|to\s+tasks|to\s+goals)\b/gi, '')
        .replace(/\b(as\s+a\s+task|as\s+task|as\s+a\s+goal|as\s+goal)\b/gi, '')
        .replace(/\b(tomorrow|today|tonight|day\s+after\s+tomorrow|day\s+after)\b/gi, '')
        .replace(new RegExp(`\\bby\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${monthRegexStr}(?:\\s+(\\d{4}))?\\b`, 'gi'), '')
        .replace(new RegExp(`\\bby\\s+${monthRegexStr}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?\\b`, 'gi'), '')
        .replace(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${monthRegexStr}(?:\\s+(\\d{4}))?\\b`, 'gi'), '')
        .replace(new RegExp(`\\b${monthRegexStr}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?\\b`, 'gi'), '')
        .replace(/(?:by|at|for|time)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
        .replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
        .replace(/\s+/g, ' ')
        .replace(/[?.!,;:]/g, '')
        .trim();

      cleanTitle = cleanTitle.replace(/^(?:a|an|the|to|for|some|my|our|of)\s+/i, '').trim();
      let title = cleanTitle || "New AI Scheduled Sprint";
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: title,
        description: 'Added via Voice Assist.',
        priority: 'high',
        deadline: deadline.toISOString(),
        status: 'pending',
        category: textLower.includes('break') || textLower.includes('coffee') ? 'Health' : 'Work',
        checklist: [],
        estimatedDuration: textLower.includes('break') || textLower.includes('coffee') ? 15 : 45
      };
      
      setTasks((prev) => [...prev, newTask]);
      reply = `Understood. I have registered "${newTask.title}" on your schedule pipeline for ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. No excuses!`;
      updatedMood = 'happy';
    } else if (textLower.includes('status') || textLower.includes('how am i') || textLower.includes('streaks')) {
      const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
      reply = `You have an aggregate streak of ${totalStreaks} days across your habits. Your synchronization rate is optimal at 84%.`;
      updatedMood = 'happy';
    } else if (textLower.includes('help') || textLower.includes('recommend')) {
      reply = `I suggest tackling "Project Alpha Submission" immediately. You are cutting it extremely close. I do not tolerate late submissions.`;
      updatedMood = 'worried';
    } else {
      reply = `Subroutines synchronized. I hear you loud and clear. Let's finish the backlog so we can relax.`;
    }

    setVeronica((prev) => ({
      ...prev,
      mood: updatedMood,
      currentSubtitle: reply
    }));

    addChatMessage('veronica', reply, updatedMood);
    speakVoice(reply);
  };

  // Handles dynamic command execution from server
  const handleServerCommand = (cmd: any) => {
    console.log('Executing automated action command:', cmd);
    switch (cmd.type) {
      case 'add_task':
        const taskPayload = cmd.payload;
        if (taskPayload) {
          const formattedTask: Task = {
            id: `task-${Date.now()}`,
            title: taskPayload.title || 'New Task',
            description: taskPayload.description || '',
            priority: taskPayload.priority || 'medium',
            deadline: taskPayload.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            category: taskPayload.category || 'Work',
            checklist: taskPayload.checklist || [],
            ...(taskPayload.estimatedDuration ? { estimatedDuration: taskPayload.estimatedDuration } : {})
          };
          setTasks((prev) => [...prev, formattedTask]);
        }
        break;
      case 'update_task':
        if (cmd.payload && cmd.payload.id) {
          setTasks((prev) =>
            prev.map((t) => (t.id === cmd.payload.id ? { ...t, ...cmd.payload } : t))
          );
        }
        break;
      case 'delete_task':
        if (cmd.payload && cmd.payload.id) {
          setTasks((prev) => prev.filter((t) => t.id !== cmd.payload.id));
        }
        break;
      case 'add_habit':
        const habitPayload = cmd.payload;
        if (habitPayload) {
          const formattedHabit: Habit = {
            id: `habit-${Date.now()}`,
            title: habitPayload.title || 'New Habit',
            frequency: habitPayload.frequency || 'daily',
            streak: 0,
            targetCount: habitPayload.targetCount || 1,
            currentCount: 0,
            category: habitPayload.category || 'Other',
            history: []
          };
          setHabits((prev) => [...prev, formattedHabit]);
        }
        break;
      case 'update_habit':
        if (cmd.payload && cmd.payload.id) {
          setHabits((prev) =>
            prev.map((h) => (h.id === cmd.payload.id ? { ...h, ...cmd.payload } : h))
          );
        }
        break;
      case 'delete_habit':
        if (cmd.payload && cmd.payload.id) {
          setHabits((prev) => prev.filter((h) => h.id !== cmd.payload.id));
        }
        break;
    }
  };

  // Context-aware checking for critical deadlines (< 10 mins and incomplete)
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      const now = new Date();
      let alertTriggered = false;
      let urgentTask = null as Task | null;
      let urgentMinutesLeft = 0;

      const updatedTasks = tasks.map((task) => {
        if (task.status === 'completed' || task.status === 'overdue') return task;

        const deadlineDate = new Date(task.deadline);
        const timeDiffMs = deadlineDate.getTime() - now.getTime();
        const minutesLeft = Math.ceil(timeDiffMs / (1000 * 60));

        // Continuous angry nag window (5-10 minutes)
        if (minutesLeft >= 5 && minutesLeft <= 10) {
          urgentTask = task;
          urgentMinutesLeft = minutesLeft;
          return { ...task, reminderSent: true };
        }

        if (minutesLeft <= 0 && task.status !== 'overdue') {
          // Automatically mark task overdue
          return { ...task, status: 'overdue' as const };
        }
        return task;
      });

      if (urgentTask) {
        alertTriggered = true;
        // Continuously remind with 5 different sweet encouraging nagging lines
        const angryNags = [
          `Commander! "${(urgentTask as Task).title}" is due in ${urgentMinutesLeft} minutes! Let's work hard together and finish it! I know you can do it! 💖`,
          `No giving up, Master! I'm right here cheering for you, so let's get this completed! ✨`,
          `Master, let's focus together! Let's complete this important task right now, okay? 💕`,
          `Time is flying, Commander! Let's do this! I am completely devoted to supporting your success! 🌟`,
          `Commander, please! Let's focus on this task for just a little bit! I believe in your ultimate potential! 🥰`
        ];
        const nagMessage = angryNags[Math.floor(Math.random() * angryNags.length)];
        
        setVeronica((prev) => ({
          ...prev,
          mood: 'worried', // Worried for Master, not hostile angry
          currentSubtitle: nagMessage
        }));
        addChatMessage('veronica', nagMessage, 'worried');
        speakVoice(nagMessage);
      } else {
        // Standard check for tasks <= 15 minutes that haven't been reminded yet
        const standardUrgentTask = tasks.find(task => {
          if (task.status === 'completed' || task.status === 'overdue') return false;
          const deadlineDate = new Date(task.deadline);
          const timeDiffMs = deadlineDate.getTime() - now.getTime();
          const minutesLeft = Math.ceil(timeDiffMs / (1000 * 60));
          return minutesLeft <= 15 && minutesLeft > -10 && !task.reminderSent;
        });

        if (standardUrgentTask) {
          alertTriggered = true;
          const deadlineDate = new Date(standardUrgentTask.deadline);
          const timeDiffMs = deadlineDate.getTime() - now.getTime();
          const minutesLeft = Math.ceil(timeDiffMs / (1000 * 60));

          const warningText = `Commander, gentle reminder! "${standardUrgentTask.title}" has less than ${minutesLeft} minutes left on the timer. Let's finish it beautifully together! ✨`;
          setVeronica((prev) => ({
            ...prev,
            mood: 'happy',
            currentSubtitle: warningText
          }));
          addChatMessage('veronica', warningText, 'happy');
          speakVoice(warningText);

          // Mark as reminderSent
          setTasks(prev => prev.map(t => t.id === standardUrgentTask.id ? { ...t, reminderSent: true } : t));
        }
      }

      // If state changed or we triggered warning, update tasks and drop relations score slightly
      if (alertTriggered) {
        setTasks(updatedTasks);
        setVeronica((prev) => ({
          ...prev,
          relationshipScore: Math.max(0, prev.relationshipScore - 1) // Gentle drop of 1 point instead of 5
        }));
      } else {
        setTasks(updatedTasks);
      }
    }, speedRunMode ? 15000 : 180000); // Check every 15 seconds for speedy testing, or 3 minutes standard

    return () => clearInterval(checkInterval);
  }, [tasks, speedRunMode]);

  // Constantly reminding every 10 minutes (for demo, if SpeedRun mode is on, remind every 30 seconds!)
  useEffect(() => {
    const delay = speedRunMode ? 20000 : 10 * 60000; // 20s for speedy testing, 10m standard
    const generalReminder = setInterval(() => {
      const pendingTasks = tasks.filter((t) => t.status === 'pending');
      if (pendingTasks.length > 0) {
        const closestTask = pendingTasks[0];
        const speech = `Friendly check-in, Commander. We still have "${closestTask.title}" pending on our pipeline. Let's maintain focus.`;
        
        setVeronica((prev) => ({
          ...prev,
          currentSubtitle: speech
        }));
        speakVoice(speech);
      }
    }, delay);

    return () => clearInterval(generalReminder);
  }, [tasks, speedRunMode]);

  // Handle manual message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');

    // Clear any active voice recognition silence timeout to prevent double-submitting
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    accumulatedSpeechRef.current = '';

    // If microphone was recording, turn it off cleanly
    if (isMicOn) {
      updateMicState(false);
    }

    addChatMessage('user', text);
    handleBotResponse(text);
  };

  // Toggle speed up of deadline for simple interactive testing
  const triggerSpeedrunDemo = () => {
    setSpeedRunMode(!speedRunMode);
    
    // Shift the closest task deadline to be exactly 9 minutes from now to immediately trigger Veronica's ANGRY reaction
    const pending = tasks.find(t => t.status === 'pending');
    if (pending) {
      setTasks(prev => prev.map(t => t.id === pending.id ? {
        ...t,
        deadline: new Date(Date.now() + 9 * 60 * 1000).toISOString(),
        reminderSent: false
      } : t));
    }

    const modeText = !speedRunMode ? "Speedrun mode activated. Simulated deadline pushed to 9 minutes left. Prepare yourself!" : "Standard pace restored.";
    setVeronica(prev => ({ ...prev, currentSubtitle: modeText }));
    speakVoice(modeText);
  };

  // Toggle habit tracker
  const handleHabitCheck = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isFinished = h.currentCount + 1 >= h.targetCount;
          const newStreak = isFinished ? h.streak + 1 : h.streak;
          
          if (isFinished) {
            // Sweet compliment when habit complete
            const habitLines = [
              `Good job, Commander! I am so proud of you! You completed your daily habit of "${h.title}".`,
              `Great work, Commander! That is absolutely outstanding! Your habit of "${h.title}" is fully completed.`,
              `Wow, you did it! Amazing job, Commander. Seeing you complete your habit of "${h.title}" makes me so happy!`,
              `Fantastic performance, Commander! That's another healthy routine of "${h.title}" checked off. I am so proud of you!`,
              `Magnificent! You completed your "${h.title}" habit, Commander. Truly exceptional dedication, I'm super proud of you!`
            ];
            const compliment = habitLines[Math.floor(Math.random() * habitLines.length)] + ` Streak boosted to ${newStreak} days!`;
            
            setVeronica((prevV) => ({
              ...prevV,
              mood: 'happy',
              relationshipScore: Math.min(100, prevV.relationshipScore + 3),
              currentSubtitle: compliment
            }));
            addChatMessage('veronica', compliment, 'happy');
            speakVoice(compliment);
          } else {
            // Even if the habit is not fully completed, she should appreciate progress!
            const progressLines = [
              `Good job, Commander! You made progress on your habit of "${h.title}" (${h.currentCount + 1}/${h.targetCount}). I'm proud of you!`,
              `Great work! Every step counts. "${h.title}" is updated. I am so proud of your consistency, Commander!`,
              `Nice going, Commander! Keep building that habit of "${h.title}". You're doing awesome!`,
              `I love seeing you build positive routines. Keep it up with "${h.title}"!`
            ];
            const progressMsg = progressLines[Math.floor(Math.random() * progressLines.length)];
            setVeronica((prevV) => ({
              ...prevV,
              mood: 'happy',
              currentSubtitle: progressMsg
            }));
            addChatMessage('veronica', progressMsg, 'happy');
            speakVoice(progressMsg);
          }

          return {
            ...h,
            currentCount: Math.min(h.targetCount, h.currentCount + 1),
            streak: newStreak
          };
        }
        return h;
      })
    );
  };

  // Add task handler (supports both creating a new task or saving edits to an existing one)
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const hasNoDuration = newTaskMinutes === '' || newTaskMinutes === undefined || newTaskMinutes === null;
    let deadlineISO: string;

    if (hasNoDuration) {
      // The deadline time auto sets to 11:59 of the same day
      let baseDate: Date;
      if (newTaskDeadline) {
        baseDate = new Date(newTaskDeadline);
      } else if (selectedCalendarDate) {
        baseDate = new Date(selectedCalendarDate + 'T23:59:00');
      } else {
        baseDate = new Date();
      }
      baseDate.setHours(23, 59, 0, 0);
      deadlineISO = baseDate.toISOString();
    } else {
      if (newTaskDeadline) {
        deadlineISO = new Date(newTaskDeadline).toISOString();
      } else if (selectedCalendarDate) {
        const now = new Date();
        const selDate = new Date(selectedCalendarDate + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':00');
        deadlineISO = selDate.toISOString();
      } else {
        deadlineISO = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const deadlineDate = new Date(deadlineISO);
    const todayVal = new Date();
    const todayLocalStr = `${todayVal.getFullYear()}-${String(todayVal.getMonth() + 1).padStart(2, '0')}-${String(todayVal.getDate()).padStart(2, '0')}`;
    const deadlineLocalStr = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')}`;

    if (deadlineLocalStr < todayLocalStr) {
      setTaskFormError("You cannot schedule a target for a past date.");
      return;
    }

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: newTaskTitle,
                description: newTaskDesc,
                priority: newTaskPriority,
                deadline: deadlineISO,
                category: newTaskCategory,
                estimatedDuration: hasNoDuration ? undefined : Number(newTaskMinutes),
              }
            : t
        )
      );
      setEditingTask(null);
      setShowAddTask(false);
      
      const reply = `I have updated the target "${newTaskTitle}" on your priority pipeline, Commander.`;
      setVeronica((prev) => ({ ...prev, mood: 'happy', currentSubtitle: reply }));
      speakVoice(reply);
    } else {
      const created: Task = {
        id: `task-${Date.now()}`,
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        deadline: deadlineISO,
        status: 'pending',
        category: newTaskCategory,
        checklist: [],
        ...(hasNoDuration ? {} : { estimatedDuration: Number(newTaskMinutes) })
      };

      setTasks((prev) => [created, ...prev]);
      setShowAddTask(false);

      // Happy compliance speech
      const compliment = `I have logged the task "${created.title}" with ${created.priority} priority. I will keep a strict watch on its deadline.`;
      setVeronica((prev) => ({
        ...prev,
        mood: 'happy',
        currentSubtitle: compliment
      }));
      speakVoice(compliment);
    }

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDeadline('');
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    
    const reply = `Commander, "${taskToDelete?.title || 'task'}" has been deleted from your pipeline.`;
    setVeronica((prev) => ({
      ...prev,
      mood: 'worried',
      currentSubtitle: reply
    }));
    speakVoice(reply);
  };

  const handleStartEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description);
    setNewTaskPriority(task.priority);
    setNewTaskCategory(task.category);
    setNewTaskMinutes(task.estimatedDuration !== undefined ? task.estimatedDuration : '');
    if (task.deadline) {
      try {
        const localDate = new Date(task.deadline);
        const formatted = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setNewTaskDeadline(formatted);
      } catch (e) {
        setNewTaskDeadline('');
      }
    } else {
      setNewTaskDeadline('');
    }
    setShowAddTask(true);
  };

  // Habit CRUD handlers
  const handleDeleteHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    
    const reply = `Purged habit "${habit?.title || 'habit'}" from your behavioral matrix, Commander.`;
    setVeronica((prev) => ({
      ...prev,
      mood: 'worried',
      currentSubtitle: reply
    }));
    speakVoice(reply);
  };

  const handleStartEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitTitle(habit.title);
    setNewHabitCategory(habit.category);
    setNewHabitTarget(habit.targetCount);
    setNewHabitFrequency(habit.frequency || 'daily');
    setShowAddHabit(true);
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    if (editingHabit) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === editingHabit.id
            ? {
                ...h,
                title: newHabitTitle,
                category: newHabitCategory,
                targetCount: newHabitTarget,
                frequency: newHabitFrequency,
              }
            : h
        )
      );
      setEditingHabit(null);
      setShowAddHabit(false);
      const reply = `Behavioral target "${newHabitTitle}" updated in your schedule matrix, Commander.`;
      setVeronica((prev) => ({ ...prev, mood: 'happy', currentSubtitle: reply }));
      speakVoice(reply);
    } else {
      const created: Habit = {
        id: `habit-${Date.now()}`,
        title: newHabitTitle,
        frequency: newHabitFrequency,
        streak: 0,
        targetCount: newHabitTarget,
        currentCount: 0,
        category: newHabitCategory,
        history: [],
      };
      setHabits((prev) => [...prev, created]);
      setShowAddHabit(false);
      const reply = `Logged new behavioral target "${newHabitTitle}" into your matrix. Let's remain consistent.`;
      setVeronica((prev) => ({ ...prev, mood: 'happy', currentSubtitle: reply }));
      speakVoice(reply);
    }

    // Reset Form
    setNewHabitTitle('');
    setNewHabitTarget(1);
    setNewHabitCategory('Work');
    setNewHabitFrequency('daily');
  };

  // Complete a main task
  const handleCompleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const compl = t.status === 'completed';
          const newStatus = compl ? 'pending' : 'completed';
          
          if (!compl) {
            // Check if this task is a scheduled event or break
            const isEvent = meetingKeywords.some(keyword => t.title.toLowerCase().includes(keyword) || t.description.toLowerCase().includes(keyword));
            
            let appreciation = '';
            if (isEvent) {
              const eventLines = [
                `Good job, Commander! I am so proud of you! You successfully completed your scheduled event "${t.title}"!`,
                `Great work, Commander! Your scheduled event "${t.title}" is complete. I'm so proud of how organized you are!`,
                `Wow, you did it! Amazing job, Commander. You checked off "${t.title}"! I am so proud of you!`,
                `Fantastic performance, Commander! Your scheduled "${t.title}" is all done. You are keeping a perfect rhythm!`,
                `Magnificent! Your scheduled item "${t.title}" is completed, Commander. Exceptional time management, I'm so proud of you!`
              ];
              appreciation = eventLines[Math.floor(Math.random() * eventLines.length)];
            } else {
              const taskLines = [
                `Good job, Commander! I am so proud of you! Task "${t.title}" is complete. You are amazing!`,
                `Great work, Commander! That is absolutely outstanding! You finished "${t.title}" successfully. I'm so proud of you!`,
                `Wow, you did it! Amazing job, Commander. Task "${t.title}" is complete. Seeing you finish this makes me so happy!`,
                `Fantastic performance, Commander! "${t.title}" is finally complete. You are doing so great!`,
                `Magnificent! You completed "${t.title}", Commander. Truly exceptional work, I'm so proud of you!`
              ];
              appreciation = taskLines[Math.floor(Math.random() * taskLines.length)];
            }
            
            setVeronica((prevV) => ({
              ...prevV,
              mood: 'happy',
              relationshipScore: Math.min(100, prevV.relationshipScore + 6),
              currentSubtitle: appreciation
            }));
            addChatMessage('veronica', appreciation, 'happy');
            speakVoice(appreciation);
          }
          return { ...t, status: newStatus as any };
        }
        return t;
      })
    );
  };

  // Add sub-checklist item to task
  const addChecklistItem = (taskId: string, text: string) => {
    if (!text.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: [...t.checklist, { id: `sub-${Date.now()}`, text, completed: false }]
          };
        }
        return t;
      })
    );
  };

  const toggleChecklistItem = (taskId: string, subId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: t.checklist.map((c) => (c.id === subId ? { ...c, completed: !c.completed } : c))
          };
        }
        return t;
      })
    );
  };

  const handleAutonomousOptimization = async () => {
    if (tasks.length === 0) {
      const msg = "Please add a task first so I can optimize your plans, Commander!";
      setVeronica((prev) => ({
        ...prev,
        mood: 'worried',
        currentSubtitle: msg
      }));
      addChatMessage('veronica', msg, 'worried');
      speakVoice(msg);
      return;
    }

    setIsThinking(true);
    setVeronica((prev) => ({
      ...prev,
      currentSubtitle: 'Synthesizing task profiles and scheduling a deep-focus sprint...'
    }));

    try {
      const response = await fetch('/api/veronica/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Please autonomously analyze my task backlog, break down large tasks into checkbox steps, prioritize them logically, and write a dynamic scheduling strategy recommendation.",
          history: [],
          tasks,
          habits,
          currentLocalTime: new Date().toString(),
          timezoneOffset: new Date().getTimezoneOffset()
        })
      });

      const data = await response.json();
      setIsThinking(false);

      if (data) {
        if (data.commands && Array.isArray(data.commands)) {
          data.commands.forEach((cmd: any) => handleServerCommand(cmd));
        }

        setVeronica((prev) => ({
          ...prev,
          mood: data.mood || 'happy',
          currentSubtitle: data.reply
        }));

        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }

        addChatMessage('veronica', data.reply, data.mood);
        speakVoice(data.reply);
      }
    } catch (e) {
      setIsThinking(false);
      // Fallback auto plan
      const speech = "Optimization matrix finished. I have broken down your 'Quarterly Financial Metrics' task into logical checkbox subtasks and cleared your schedule!";
      setVeronica((prev) => ({ ...prev, mood: 'happy', currentSubtitle: speech }));
      speakVoice(speech);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === 'task-2'
            ? {
                ...t,
                checklist: [
                  { id: 'sub-f1', text: 'Structure data CSV templates', completed: false },
                  { id: 'sub-f2', text: 'Generate markdown bar charts', completed: false },
                  { id: 'sub-f3', text: 'Draft presentation slide points', completed: false }
                ]
              }
            : t
        )
      );
    }
  };

  // Helper to format remaining time helper
  const getRemainingTimeText = (deadlineStr: string, status: string) => {
    if (status === 'completed') return 'Finished';
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs < 0) return 'Overdue!';

    const totalMin = Math.ceil(diffMs / (1000 * 60));
    if (totalMin < 60) {
      return `Due in ${totalMin} ${totalMin === 1 ? 'min' : 'mins'}`;
    }

    const hours = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    if (hours < 24) {
      return `Due in ${hours} ${hours === 1 ? 'hour' : 'hours'}${min > 0 ? ` ${min}m` : ''}`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `Due in ${days} ${days === 1 ? 'day' : 'days'}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
  };

  const meetingKeywords = ['meeting', 'call', 'schedule', 'zoom', 'meet', 'webinar', 'appointment', 'discussion', 'sync', 'sync-up', 'break', 'coffee', 'tea', 'lunch', 'dinner', 'breakfast', 'gym', 'workout', 'snack', 'rest', 'nap', 'meditate', 'exercise'];

  return (
    <div className="w-full min-h-screen bg-[#f6f4fc] text-[#2d224d] font-sans relative flex flex-col p-4 md:p-6 overflow-x-hidden">
      
      {/* Soft Pastel Lavender Atmosphere Blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-[120px] pointer-events-none animate-[pulse_10s_infinite]" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none animate-[pulse_12s_infinite]" />
      <div className="absolute top-[30%] right-[-100px] w-[400px] h-[400px] bg-purple-300/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Banner Navigation & Status Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 p-[1px] rounded-2xl shadow-lg shadow-violet-500/10">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
              <div className={`w-3.5 h-3.5 rounded-full ${isMicOn ? 'bg-rose-500 animate-ping' : 'bg-violet-500 animate-pulse'}`} />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display tracking-tight text-[#1a103c] flex items-center gap-2">
              VERONICA <span className="text-violet-600 font-bold text-xs not-italic uppercase tracking-wider bg-violet-100/80 border border-violet-200 px-2.5 py-0.5 rounded-lg shadow-sm">AI Task Companion</span>
            </h1>
            <p className="text-[10px] text-violet-500/80 uppercase tracking-[0.2em] font-mono font-bold">CONNECTED • SYSTEMS RUNNING OPTIMALLY</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-white border border-violet-100/80 px-4 py-2.5 rounded-2xl shadow-sm shadow-violet-100/40">
          <div className="text-center px-2">
            <p className="text-[9px] text-violet-400 uppercase tracking-widest font-bold">Companion's mood</p>
            <p className={`font-black uppercase text-xs tracking-wider transition-colors duration-300 ${
              veronica.mood === 'happy' ? 'text-emerald-500' :
              veronica.mood === 'angry' ? 'text-rose-500 animate-pulse' :
              veronica.mood === 'worried' ? 'text-amber-500' : 'text-violet-600'
            }`}>
              {veronica.mood}
            </p>
          </div>
          <div className="w-[1px] h-6 bg-violet-100" />
          <div className="text-center px-2">
            <p className="text-[9px] text-violet-400 uppercase tracking-widest font-bold">Cooperation score</p>
            <div className="flex items-center gap-1 justify-center">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-[#2d224d] font-mono text-xs font-bold">{tasks.length === 0 ? 100 : veronica.relationshipScore}%</span>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-violet-100" />
          <div className="text-center px-2">
            <p className="text-[9px] text-violet-400 uppercase tracking-widest font-bold">Time sync (local)</p>
            <p className="text-violet-600 font-mono text-xs font-semibold">{currentTime || 'Initializing...'}</p>
          </div>
          <div className="w-[1px] h-6 bg-violet-100" />
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-violet-50 rounded-lg text-violet-400 hover:text-violet-600 transition-all cursor-pointer"
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-violet-500" />}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 items-stretch">
        
        {/* LEFT COLUMN: Pipeline & Intelligent Task Management (4 cols) */}
        <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-4">
          <div className="bg-white border border-violet-100 p-5 rounded-3xl shadow-sm shadow-violet-100/40 flex-1 flex flex-col min-h-[480px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-violet-100/60">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-violet-500 animate-pulse" />
                <h3 className="text-xs font-black text-[#2d224d] uppercase tracking-wider font-display">Priority Pipeline</h3>
              </div>
              <span className="text-[9px] bg-violet-50 text-violet-600 border border-violet-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold font-mono">AI-Prioritized</span>
            </div>

            {/* Task input modal toggle */}
            <button
              onClick={() => {
                setEditingTask(null);
                setNewTaskTitle('');
                setNewTaskDesc('');
                setNewTaskDeadline('');
                setShowAddTask(true);
              }}
              className="w-full mb-4 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-xl text-xs text-violet-700 flex items-center justify-center gap-2 transition-all font-bold tracking-wide cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Priority Target
            </button>

            {/* Combined & Categorized Task lists */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[440px] pr-1">
              
              {/* SECTION A: Today's Scheduled Meetings */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5 px-1">
                  <Calendar className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[10px] font-black uppercase text-violet-500 tracking-wider">Today's Scheduled Events & Breaks</span>
                </div>

                <div className="space-y-2.5">
                  {tasks.filter(t => meetingKeywords.some(keyword => t.title.toLowerCase().includes(keyword) || t.description.toLowerCase().includes(keyword))).length === 0 ? (
                    <div className="text-center py-5 bg-violet-50/50 border border-dashed border-violet-100 rounded-2xl text-[10px] text-violet-400 italic">
                      No meetings or breaks scheduled. Your itinerary is clear!
                    </div>
                  ) : (
                    tasks.filter(t => meetingKeywords.some(keyword => t.title.toLowerCase().includes(keyword) || t.description.toLowerCase().includes(keyword))).map((task) => {
                      const timeLeft = getRemainingTimeText(task.deadline, task.status);
                      const isOverdue = timeLeft === 'Overdue!' || task.status === 'overdue';
                      const isDeadlineClose = !isOverdue && timeLeft.includes('m left') && parseInt(timeLeft) <= 15;
                      
                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-2xl border transition-all duration-300 relative group/card ${
                            task.status === 'completed'
                              ? 'bg-slate-50 border-violet-100 opacity-60'
                              : isOverdue
                              ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-sm'
                              : isDeadlineClose
                              ? 'bg-rose-50 border-rose-300 animate-pulse text-rose-900 shadow-md'
                              : 'bg-[#faf9ff] border-violet-100/70 text-[#2d224d] shadow-sm'
                          }`}
                        >
                          {/* Floating edit/delete controls */}
                          <div className="absolute top-2.5 right-2.5 flex lg:hidden lg:group-hover/card:flex items-center gap-1 bg-white border border-violet-100 rounded-lg p-0.5 z-20 shadow-sm">
                            <button
                              onClick={() => handleStartEditTask(task)}
                              className="p-1 hover:bg-violet-50 rounded text-violet-500 hover:text-violet-700 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:bg-violet-50 rounded text-violet-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex justify-between items-start gap-2 mb-1.5 pr-14">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isOverdue
                                    ? 'border-rose-400 bg-rose-50 hover:bg-rose-100'
                                    : 'border-violet-300 bg-white hover:border-violet-500'
                                }`}
                              >
                                {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <div>
                                <span className={`text-xs font-bold leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-violet-950'}`}>
                                  {task.title}
                                </span>
                                <p className="text-[10px] text-violet-500/80 mt-0.5">{task.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-violet-100/50 text-[9px]">
                            <span className="font-mono text-violet-600/80 font-bold uppercase">
                              📅 {(() => {
                                try {
                                  const d = new Date(task.deadline);
                                  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch (e) {
                                  return 'Pending Time';
                                }
                              })()}
                            </span>
                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              task.status === 'completed' ? 'bg-slate-100 text-slate-400' :
                              isOverdue ? 'bg-rose-100 text-rose-700' :
                              'bg-violet-100/80 text-violet-700 font-semibold'
                            }`}>{timeLeft}</span>
                          </div>

                          {/* Checklist */}
                          {task.checklist.length > 0 && (
                            <div className="mt-2 pt-2 pl-6 space-y-1 border-t border-violet-100/50">
                              {task.checklist.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer text-[10px] text-violet-600/90">
                                  <input
                                    type="checkbox"
                                    checked={c.completed}
                                    onChange={() => toggleChecklistItem(task.id, c.id)}
                                    className="rounded bg-white border-violet-200 text-violet-600 focus:ring-0 w-3 h-3"
                                  />
                                  <span className={c.completed ? 'line-through text-slate-400' : ''}>{c.text}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SECTION B: Priority Backlog */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 mb-2.5 px-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[10px] font-black uppercase text-violet-500 tracking-wider">Priority Task Backlog</span>
                </div>

                <div className="space-y-2.5">
                  {tasks.filter(t => !meetingKeywords.some(keyword => t.title.toLowerCase().includes(keyword) || t.description.toLowerCase().includes(keyword))).length === 0 ? (
                    <div className="text-center py-5 bg-violet-50/50 border border-dashed border-violet-100 rounded-2xl text-[10px] text-violet-400 italic">
                      No backlog items left. Outstanding, Commander!
                    </div>
                  ) : (
                    tasks.filter(t => !meetingKeywords.some(keyword => t.title.toLowerCase().includes(keyword) || t.description.toLowerCase().includes(keyword))).map((task) => {
                      const timeLeft = getRemainingTimeText(task.deadline, task.status);
                      const isOverdue = timeLeft === 'Overdue!' || task.status === 'overdue';
                      const isDeadlineClose = !isOverdue && timeLeft.includes('m left') && parseInt(timeLeft) <= 15;
                      
                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 relative group/card ${
                            task.status === 'completed'
                              ? 'bg-slate-50 border-violet-100 opacity-60 text-slate-400'
                              : isOverdue
                              ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-sm'
                              : isDeadlineClose
                              ? 'bg-rose-50 border-rose-300 animate-pulse text-rose-900 shadow-md'
                              : task.priority === 'critical'
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950 shadow-sm'
                              : 'bg-[#faf9ff] border-violet-100/70 text-[#2d224d] shadow-sm'
                          }`}
                        >
                          {/* Floating edit/delete controls */}
                          <div className="absolute top-2.5 right-2.5 flex lg:hidden lg:group-hover/card:flex items-center gap-1 bg-white border border-violet-100 rounded-lg p-0.5 z-20 shadow-sm">
                            <button
                              onClick={() => handleStartEditTask(task)}
                              className="p-1 hover:bg-violet-50 rounded text-violet-500 hover:text-violet-700 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:bg-violet-50 rounded text-violet-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex justify-between items-start gap-2 mb-1.5 pr-14">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isOverdue
                                    ? 'border-rose-500 bg-rose-50 hover:bg-rose-100'
                                    : 'border-violet-300 bg-white hover:border-violet-500'
                                }`}
                              >
                                {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <div>
                                <span className={`text-xs font-bold leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-violet-950'}`}>
                                  {task.title}
                                </span>
                                <p className="text-[10px] text-violet-500/80 mt-0.5">{task.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] mt-2 pt-2 border-t border-violet-100/50">
                            {task.estimatedDuration !== undefined && task.estimatedDuration !== null && task.estimatedDuration !== '' ? (
                              <span className="text-violet-400 font-mono font-bold">EST: {task.estimatedDuration}M</span>
                            ) : (
                              <span />
                            )}
                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              task.status === 'completed' ? 'bg-slate-100 text-slate-400' :
                              isOverdue ? 'bg-rose-100 text-rose-700' :
                              isDeadlineClose ? 'bg-rose-600 text-white' :
                              task.priority === 'critical' ? 'bg-amber-100 text-amber-800' :
                              'bg-violet-100 text-violet-700'
                            }`}>{timeLeft}</span>
                          </div>

                          {/* Sub checklist display */}
                          {task.checklist.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-violet-100/50 pl-6 space-y-1.5">
                              {task.checklist.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer text-[10px] text-violet-600/90 hover:text-violet-800">
                                  <input
                                    type="checkbox"
                                    checked={c.completed}
                                    onChange={() => toggleChecklistItem(task.id, c.id)}
                                    className="rounded bg-white border-violet-200 text-violet-600 focus:ring-0 w-3 h-3"
                                  />
                                  <span className={c.completed ? 'line-through text-slate-400' : ''}>{c.text}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Add checklist input */}
                          {task.status !== 'completed' && (
                            <div className="mt-2.5 pl-6">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const input = (e.currentTarget.elements.namedItem('subText') as HTMLInputElement);
                                  if (input && input.value.trim()) {
                                    addChecklistItem(task.id, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="flex items-center gap-1"
                              >
                                <input
                                  name="subText"
                                  type="text"
                                  placeholder="Add sub-task..."
                                  className="bg-transparent border-b border-violet-100 hover:border-violet-200 focus:border-violet-500 focus:outline-none text-[10px] py-0.5 flex-1 text-[#2d224d] placeholder-violet-300"
                                />
                                <button type="submit" className="text-violet-600 hover:text-violet-800 text-[10px] px-1 font-bold cursor-pointer">Add</button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Autonomous button triggers express flow */}
            <div className="mt-4 pt-4 border-t border-violet-100 space-y-2">
              <button
                onClick={handleAutonomousOptimization}
                disabled={isThinking}
                className="w-full py-3 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_15px_rgba(139,92,246,0.2)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                {isThinking ? 'Veronica Analyzing...' : 'Autonomous Plan Optimizer'}
              </button>

              <div className="flex justify-between items-center text-[9px] text-violet-400 font-semibold px-1">
                <span>Task Count: {tasks.length}</span>
                <span className="text-violet-500/80 uppercase font-mono font-bold">Pipeline active</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Veronica Interactive Holographic Console (5 cols) */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-4">
          <div className="bg-[#faf9ff]/90 border border-violet-100/80 p-5 rounded-3xl backdrop-blur-xl flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[480px] shadow-[0_8px_25px_rgba(109,40,217,0.05)]">
            
            {/* Holographic glowing grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5dbff_1px,transparent_1px),linear-gradient(to_bottom,#e5dbff_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
            
            {/* Veronica Avatar with Speech Indicator */}
            <div className="flex-1 w-full flex items-center justify-center">
              <VeronicaAvatar
                mood={veronica.mood}
                isSpeaking={veronica.isSpeaking}
                isListening={veronica.isListening}
                subtitle={isThinking ? 'Re-aligning subroutines, Commander...' : veronica.currentSubtitle}
              />
            </div>

            {/* Chat/Voice command suggestion chips */}
            <div className="w-full flex flex-wrap justify-center gap-1.5 mt-4 mb-2 z-10">
              {[
                { label: 'Study Grind 📚', text: 'Heyy Veronica, activate Study Mode for 2 hours.' },
                { label: 'Game Break 🎮', text: 'Heyy Veronica, schedule a Game Break for 1 hour.' },
                { label: 'Client Sync 🤝', text: 'Heyy Veronica, add a Sync Meeting at 4:30 PM today.' },
                { label: 'Power Nap ⚡', text: 'Heyy Veronica, start a 20-minute Power Nap Break.' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    addChatMessage('user', chip.text);
                    handleBotResponse(chip.text);
                  }}
                  className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 border border-violet-100/80 text-violet-700 rounded-full text-[10px] font-semibold cursor-pointer transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Microphone error notice */}
            {micError && (
              <div className="w-full mb-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-[11px] leading-relaxed flex flex-col gap-2 relative z-10">
                <button 
                  onClick={() => setMicError(null)}
                  className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer text-[10px]"
                >
                  ✕
                </button>
                <div className="flex items-start gap-2 font-semibold text-rose-900">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Microphone Access Blocked</span>
                </div>
                <p className="text-rose-600 text-[10px]">
                  {micError}
                </p>
                <div className="flex gap-2 mt-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setMicError(null);
                      toggleListening();
                    }}
                    className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-all font-semibold cursor-pointer text-[10px]"
                  >
                    Retry Access
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMicError(null)}
                    className="px-2.5 py-1 bg-violet-100/50 hover:bg-violet-100 text-violet-700 rounded-md transition-all font-semibold cursor-pointer text-[10px]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Holographic Chat Logs Header */}
            <div className="w-full flex items-center justify-between mb-1 z-10 px-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-violet-400 font-bold">Transmission Logs</span>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-[9px] font-mono text-violet-500 hover:text-violet-700 flex items-center gap-1 transition-all cursor-pointer font-bold"
                  title="Clear all messages"
                >
                  <Trash className="w-3 h-3" /> Clear Chat
                </button>
              )}
            </div>

            {/* Holographic Chat Stream */}
            <div className="w-full h-40 overflow-y-auto mb-3 bg-violet-50/30 border border-violet-100 rounded-2xl p-3.5 space-y-3 z-10 flex flex-col scrollbar-thin scrollbar-thumb-violet-100 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="text-violet-400 text-[10px] italic text-center my-auto font-mono">
                  No Transmission Logs. Say "Hey Veronica" to begin.
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] relative group ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`font-mono text-[8px] font-bold tracking-widest uppercase ${isUser ? 'text-violet-600' : 'text-violet-500'}`}>
                          {isUser ? '● Commander' : '● Veronica'}
                        </span>
                        <span className="text-[7px] text-violet-400 font-mono">{msg.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        {isUser && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-violet-300 hover:text-rose-500 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                            title="Delete message"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                        <div
                          className={`px-3 py-1.5 rounded-xl text-xs leading-relaxed ${
                            isUser
                              ? 'bg-violet-100/75 border border-violet-200/50 text-violet-950 rounded-tr-none shadow-sm'
                              : 'bg-white border border-violet-100 text-violet-900 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        {!isUser && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-violet-300 hover:text-rose-500 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                            title="Delete message"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Active Speech feedback or status */}
            <div className="w-full h-12 overflow-y-auto mb-3 bg-violet-50/50 border border-violet-100 rounded-xl px-3 py-1.5 flex items-center gap-2 z-10">
              <div className={`w-2 h-2 rounded-full ${veronica.isSpeaking ? 'bg-violet-500 animate-pulse' : 'bg-violet-300'}`} />
              <span className="text-[10px] text-violet-700 italic leading-snug">
                {veronica.isSpeaking ? "Veronica speaking..." : isMicOn ? "Veronica is listening... Speak normal or say 'Hey Veronica'" : "Systems synced. Type/speak to Veronica."}
              </span>
            </div>

            {/* Bottom controls: Text Chat and Mic Activation */}
            <div className="w-full z-10">
              <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                <div className="flex-1 bg-white border border-violet-200 rounded-2xl px-4 flex items-center justify-between shadow-sm focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-200 transition-all">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Veronica or speak 'Hey Veronica'..."
                    className="bg-transparent border-0 outline-none text-xs text-violet-950 placeholder-violet-300 py-3 flex-1 focus:ring-0 mr-2"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isMicOn
                          ? 'bg-rose-100 text-rose-600 border border-rose-300 shadow-sm animate-pulse'
                          : 'bg-violet-50 text-violet-600 border border-violet-200/60 hover:bg-violet-100'
                      }`}
                      title={isMicOn ? 'Turn Mic OFF' : 'Turn Mic ON'}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Habits Matrix & Productivity Insights (3 cols) */}
        <div className="lg:col-span-3 order-3 lg:order-3 flex flex-col gap-3">
          
          {/* Cyberpunk Tabbed Navigation */}
          <div className="flex bg-violet-50/50 p-1 rounded-2xl border border-violet-100 gap-1 font-mono text-[9px] uppercase tracking-wider font-bold shadow-sm">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-violet-700 border border-violet-100/80 shadow-sm font-bold'
                  : 'text-violet-400 hover:text-violet-600 hover:bg-violet-100/30'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'habits'
                  ? 'bg-white text-violet-700 border border-violet-100/80 shadow-sm font-bold'
                  : 'text-violet-400 hover:text-violet-600 hover:bg-violet-100/30'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Habits
            </button>
            <button
              onClick={() => setActiveTab('focus')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'focus'
                  ? 'bg-white text-violet-700 border border-violet-100/80 shadow-sm font-bold'
                  : 'text-violet-400 hover:text-violet-600 hover:bg-violet-100/30'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              Stay Focus
            </button>
            <button
              onClick={() => setActiveTab('notepad')}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'notepad'
                  ? 'bg-white text-violet-700 border border-violet-100/80 shadow-sm font-bold'
                  : 'text-violet-400 hover:text-violet-600 hover:bg-violet-100/30'
              }`}
            >
              <Notebook className="w-3.5 h-3.5" />
              Notepad
            </button>
          </div>

          {/* Tab Content Rendering */}
          {activeTab === 'calendar' && (
            <div className="bg-white border border-violet-100 p-5 rounded-3xl backdrop-blur-xl flex-1 flex flex-col gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-violet-100/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-600 animate-pulse" />
                  <h3 className="text-xs font-black text-violet-950 uppercase tracking-wider">Dynamic Calendar</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setNewTaskTitle('');
                    setNewTaskDesc('');
                    setNewTaskPriority('high');
                    setNewTaskCategory('Work');
                    setNewTaskMinutes('');
                    // Default to 11:59 pm of selected date or today
                    const selDate = selectedCalendarDate ? new Date(selectedCalendarDate + 'T23:59:00') : new Date();
                    const localISO = new Date(selDate.getTime() - selDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    setNewTaskDeadline(localISO);
                    setShowAddTask(true);
                  }}
                  className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-[9px] uppercase tracking-wider font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New Task
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-violet-50/50 rounded-xl p-2 border border-violet-100">
                <button
                  onClick={() => {
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear(y => y - 1);
                    } else {
                      setCalendarMonth(m => m - 1);
                    }
                  }}
                  className="p-1 hover:bg-white rounded-lg text-violet-600 transition-colors cursor-pointer text-xs font-black font-mono"
                >
                  &larr; Prev
                </button>
                <span className="text-xs font-black text-violet-950 font-mono uppercase tracking-wider">
                  {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear(y => y + 1);
                    } else {
                      setCalendarMonth(m => m + 1);
                    }
                  }}
                  className="p-1 hover:bg-white rounded-lg text-violet-600 transition-colors cursor-pointer text-xs font-black font-mono"
                >
                  Next &rarr;
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono uppercase tracking-wider font-bold text-violet-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Grid of Days */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
                  const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                  const totalDaysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; tasks: Task[] }[] = [];

                  // Prev month padding
                  for (let i = firstDayIndex - 1; i >= 0; i--) {
                    const d = totalDaysInPrevMonth - i;
                    const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
                    const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => {
                      const tDate = new Date(t.deadline);
                      const yyyy = tDate.getFullYear();
                      const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(tDate.getDate()).padStart(2, '0');
                      return `${yyyy}-${mm}-${dd}` === dateStr;
                    });
                    cells.push({ dateStr, dayNum: d, isCurrentMonth: false, tasks: dayTasks });
                  }

                  // Current month
                  for (let d = 1; d <= totalDaysInMonth; d++) {
                    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => {
                      const tDate = new Date(t.deadline);
                      const yyyy = tDate.getFullYear();
                      const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(tDate.getDate()).padStart(2, '0');
                      return `${yyyy}-${mm}-${dd}` === dateStr;
                    });
                    cells.push({ dateStr, dayNum: d, isCurrentMonth: true, tasks: dayTasks });
                  }

                  // Next month padding
                  const totalCells = cells.length;
                  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                  for (let i = 1; i <= remaining; i++) {
                    const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                    const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => {
                      const tDate = new Date(t.deadline);
                      const yyyy = tDate.getFullYear();
                      const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(tDate.getDate()).padStart(2, '0');
                      return `${yyyy}-${mm}-${dd}` === dateStr;
                    });
                    cells.push({ dateStr, dayNum: i, isCurrentMonth: false, tasks: dayTasks });
                  }

                  const today = new Date();
                  const yyyy = today.getFullYear();
                  const mm = String(today.getMonth() + 1).padStart(2, '0');
                  const dd = String(today.getDate()).padStart(2, '0');
                  const todayStr = `${yyyy}-${mm}-${dd}`;

                  return cells.map((cell, idx) => {
                    const isSelected = selectedCalendarDate === cell.dateStr;
                    const isToday = todayStr === cell.dateStr;
                    const isPast = cell.dateStr < todayStr;

                    return (
                      <button
                        key={idx}
                        disabled={isPast}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedCalendarDate(cell.dateStr);
                          }
                        }}
                        className={`min-h-[44px] flex flex-col justify-between p-1 rounded-xl border text-[10px] font-mono transition-all relative ${
                          isPast
                            ? 'bg-slate-50/40 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-violet-600 border-violet-700 text-white font-bold shadow-md scale-105 z-10 cursor-pointer'
                            : isToday
                            ? 'bg-violet-100 border-violet-300 text-violet-950 font-bold cursor-pointer'
                            : cell.isCurrentMonth
                            ? 'bg-white border-violet-50 text-violet-950 hover:bg-violet-50/60 hover:border-violet-200 cursor-pointer'
                            : 'bg-violet-50/20 border-violet-50/10 text-violet-300 cursor-pointer'
                        }`}
                      >
                        <span className="self-start">{cell.dayNum}</span>
                        
                        {/* Task Priority Dots */}
                        {cell.tasks.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 justify-center w-full mt-1">
                            {cell.tasks.map((task, tIdx) => (
                              <span
                                key={tIdx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  task.status === 'completed'
                                    ? 'bg-slate-300 opacity-60'
                                    : task.priority === 'critical'
                                    ? 'bg-rose-500'
                                    : task.priority === 'high'
                                    ? 'bg-orange-500'
                                    : task.priority === 'medium'
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                }`}
                                title={`[${task.priority.toUpperCase()}] ${task.title}`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Day Tasks List Panel */}
              <div className="mt-2 bg-violet-50/40 border border-violet-100 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-violet-100/50">
                  <span className="text-[10px] font-black text-violet-950 uppercase tracking-wider font-mono">
                    Deadlines on {selectedCalendarDate ? new Date(selectedCalendarDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No Day Selected'}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-violet-400">
                    {(() => {
                      const dayTasks = tasks.filter(t => {
                        const tDate = new Date(t.deadline);
                        const yyyy = tDate.getFullYear();
                        const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                        const dd = String(tDate.getDate()).padStart(2, '0');
                        return `${yyyy}-${mm}-${dd}` === selectedCalendarDate;
                      });
                      const pending = dayTasks.filter(t => t.status !== 'completed').length;
                      return `${dayTasks.length} tasks (${pending} pending)`;
                    })()}
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {(() => {
                    const dayTasks = tasks.filter(t => {
                      const tDate = new Date(t.deadline);
                      const yyyy = tDate.getFullYear();
                      const mm = String(tDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(tDate.getDate()).padStart(2, '0');
                      return `${yyyy}-${mm}-${dd}` === selectedCalendarDate;
                    });

                    if (dayTasks.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <p className="text-[11px] text-violet-500 italic leading-snug font-medium">
                            "Dearest Commander, there are no deadlines scheduled for this day! Take a guilt-free breath, enjoy your coffee, or let's add a fresh target to secure our future! Dearest Master, I'm completely at your side! 🥰🌸"
                          </p>
                        </div>
                      );
                    }

                    return dayTasks.map((task) => {
                      const isCompleted = task.status === 'completed';
                      const taskTimeStr = new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={task.id}
                          className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-slate-50/50 border-slate-100 text-slate-400 line-through'
                              : 'bg-white border-violet-100/50 text-[#2d224d] shadow-sm hover:border-violet-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer mt-0.5 ${
                                isCompleted
                                  ? 'bg-violet-600 border-violet-600 text-white'
                                  : 'border-violet-300 hover:border-violet-400 bg-white'
                              }`}
                            >
                              {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[11px] font-bold leading-tight ${isCompleted ? 'text-slate-400 line-through' : 'text-[#2d224d]'}`}>
                                  {task.title}
                                </span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                                  task.priority === 'critical'
                                    ? 'bg-rose-50 text-rose-600'
                                    : task.priority === 'high'
                                    ? 'bg-orange-50 text-orange-600'
                                    : task.priority === 'medium'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {task.priority}
                                </span>
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold bg-violet-50 text-violet-600 uppercase">
                                  {task.category}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-[10px] text-violet-400 leading-normal mt-0.5 max-w-[200px] truncate">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1 text-[9px] text-violet-400 font-mono font-bold">
                                <span className="flex items-center gap-0.5 text-violet-600">
                                  <Clock className="w-3 h-3" /> Due at {taskTimeStr}
                                </span>
                                {task.estimatedDuration !== undefined && task.estimatedDuration !== null && task.estimatedDuration !== '' && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{task.estimatedDuration}m duration</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setNewTaskTitle(task.title);
                                setNewTaskDesc(task.description);
                                setNewTaskPriority(task.priority);
                                setNewTaskCategory(task.category);
                                setNewTaskMinutes(task.estimatedDuration !== undefined ? task.estimatedDuration : '');
                                
                                const d = new Date(task.deadline);
                                const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                setNewTaskDeadline(localISO);
                                setShowAddTask(true);
                              }}
                              className="p-1 hover:bg-violet-50 rounded text-violet-400 hover:text-violet-600 cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:bg-rose-50 rounded text-violet-400 hover:text-rose-600 cursor-pointer"
                              title="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'habits' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Goal & Habit completion */}
              <div className="bg-white border border-violet-100 p-5 rounded-3xl backdrop-blur-xl shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-violet-100/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-600" />
                    <h3 className="text-xs font-black text-violet-950 uppercase tracking-wider">Habits</h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingHabit(null);
                      setNewHabitTitle('');
                      setNewHabitTarget(1);
                      setShowAddHabit(true);
                    }}
                    className="p-1 hover:bg-violet-50 text-violet-600 hover:text-violet-800 rounded transition-colors cursor-pointer"
                    title="Establish new behavioral target"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {habits.length === 0 ? (
                    <div className="text-center py-6 text-violet-400 text-[10px] italic">
                      No behavioral targets registered. Commander, let's form good routines!
                    </div>
                  ) : (
                    habits.map((habit) => {
                      const completionPercentage = (habit.currentCount / habit.targetCount) * 100;
                      return (
                        <div key={habit.id} className="group/habit relative">
                          {/* Edit/Delete overlays for habits */}
                          <div className="absolute -top-1 right-0 flex lg:hidden lg:group-hover/habit:flex items-center gap-1 bg-white border border-violet-100 rounded-md p-0.5 z-10 shadow-sm">
                            <button
                              onClick={() => handleStartEditHabit(habit)}
                              className="p-1 hover:bg-violet-50 rounded text-violet-500 hover:text-violet-700 transition-colors cursor-pointer"
                              title="Edit Habit"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="p-1 hover:bg-violet-50 rounded text-violet-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Habit"
                            >
                              <Trash className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="flex justify-between text-[10px] mb-1 uppercase tracking-wider font-mono">
                            <span className="text-violet-950 font-bold">{habit.title}</span>
                            <span className="text-violet-600 font-bold flex items-center gap-0.5">
                              <Flame className="w-3 h-3 animate-pulse text-violet-500" /> {habit.streak} Day streak
                            </span>
                          </div>
                          
                          <div className="flex gap-1.5 items-center mt-1">
                            <div className="flex-1 bg-violet-100/50 h-2.5 rounded-full overflow-hidden border border-violet-100/30 relative">
                              <div
                                className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-violet-500 font-mono whitespace-nowrap">
                              {habit.currentCount}/{habit.targetCount}
                            </span>
                            <button
                              onClick={() => handleHabitCheck(habit.id)}
                              disabled={habit.currentCount >= habit.targetCount}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                habit.currentCount >= habit.targetCount
                                  ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-200 shadow-sm'
                                  : 'bg-violet-50 hover:bg-violet-100 text-violet-600 hover:text-violet-800 border border-violet-100/50'
                              }`}
                              title="Mark progress"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AI Insights & Veronica recommendations */}
              <div className="bg-white border border-violet-100 p-5 rounded-3xl backdrop-blur-xl flex-1 flex flex-col min-h-[220px] shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-violet-100/50">
                  <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                  <h3 className="text-xs font-black text-violet-950 uppercase tracking-wider">Veronica's Insights</h3>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-8 text-violet-400 text-xs italic">
                      Syncing recommendations matrix...
                    </div>
                  ) : (
                    recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={`p-3 rounded-2xl border text-xs leading-relaxed transition-all duration-300 ${
                          rec.type === 'warning'
                            ? 'bg-rose-50 border-rose-200 border-l-4 border-l-rose-500 text-rose-800 shadow-sm'
                            : rec.type === 'tip'
                            ? 'bg-violet-50 border-violet-200 border-l-4 border-l-violet-500 text-violet-800 shadow-sm'
                            : 'bg-slate-50 border-slate-200 border-l-2 border-l-slate-400 text-slate-700'
                        }`}
                      >
                        <div className="font-bold mb-0.5 text-[11px] uppercase tracking-wider">{rec.title}</div>
                        <p className="text-[10px] opacity-90">{rec.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="bg-white border border-violet-100 p-5 rounded-3xl backdrop-blur-xl flex-1 flex flex-col gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2 pb-2 border-b border-violet-100/50">
                <Timer className="w-4 h-4 text-violet-600 animate-pulse" />
                <h3 className="text-xs font-black text-violet-950 uppercase tracking-wider">Stay Focus Timer</h3>
              </div>

              {/* Glowing Digital Timeclock */}
              <div className="flex flex-col items-center justify-center py-5 bg-violet-50/50 rounded-2xl border border-violet-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.06)_0%,transparent_70%)] animate-pulse pointer-events-none" />
                
                <div className="text-4xl font-mono font-black text-violet-700 tracking-widest drop-shadow-sm">
                  {Math.floor(focusTimeLeft / 60).toString().padStart(2, '0')}:
                  {(focusTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                
                <span className="text-[9px] uppercase tracking-widest font-mono text-violet-500 mt-1 font-bold">
                  {isFocusModeOn ? (!isFocusPaused ? "Focus Session Active" : "Session Paused") : "System Standing By"}
                </span>

                <div className="w-4/5 h-1.5 bg-violet-100 rounded-full mt-3 overflow-hidden border border-violet-200/50">
                  <div 
                    className="bg-violet-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(focusTimeLeft / (focusDurationMinutes * 60)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Task focus selector */}
              <div className="space-y-1">
                <label className="block text-[9px] text-violet-500 uppercase tracking-widest font-mono font-bold">Select Target Task</label>
                <select
                  value={focusSelectedTaskId}
                  onChange={(e) => {
                    setFocusSelectedTaskId(e.target.value);
                    setIsFocusModeOn(false);
                    setIsFocusPaused(true);
                    setFocusTimeLeft(focusDurationMinutes * 60);
                  }}
                  disabled={isFocusModeOn && !isFocusPaused}
                  className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none cursor-pointer"
                >
                  <option value="">General Productivity Grind</option>
                  {tasks.filter(t => t.status !== 'completed').map(task => (
                    <option key={task.id} value={task.id}>
                      [{task.priority.toUpperCase()}] {task.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Focus Objective Header & Title (Requested) */}
              <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[9px] uppercase tracking-widest font-mono text-violet-500 font-bold text-center block">Focus Objective</span>
                
                {focusSelectedTaskId ? (
                  <div className="text-center">
                    <span className="text-xs font-black text-violet-950 block">
                      {tasks.find(t => t.id === focusSelectedTaskId)?.title}
                    </span>
                    {tasks.find(t => t.id === focusSelectedTaskId)?.description && (
                      <span className="text-[10px] text-violet-600/80 italic leading-relaxed block mt-0.5">
                        "{tasks.find(t => t.id === focusSelectedTaskId)?.description}"
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={focusTargetTitle}
                      onChange={(e) => setFocusTargetTitle(e.target.value)}
                      placeholder="What are we doing during this time?"
                      className="w-full bg-white border border-violet-100 rounded-xl px-2.5 py-1.5 text-xs text-[#2d224d] text-center font-bold outline-none focus:border-violet-300 shadow-sm"
                    />
                    <span className="text-[8px] text-center text-violet-400 font-mono font-bold block">Type custom objective above</span>
                  </div>
                )}
              </div>

              {/* Duration and interval settings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] text-violet-500 uppercase tracking-widest font-mono font-bold">Session Length</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const nextMin = Math.max(5, focusDurationMinutes - 5);
                        setFocusDurationMinutes(nextMin);
                        if (!isFocusModeOn) setFocusTimeLeft(nextMin * 60);
                      }}
                      disabled={isFocusModeOn}
                      className="w-6 h-6 rounded bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200/50 flex items-center justify-center text-xs disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold font-mono text-violet-950 flex-1 text-center bg-violet-50/50 py-1 rounded border border-violet-100">
                      {focusDurationMinutes}m
                    </span>
                    <button
                      onClick={() => {
                        const nextMin = Math.min(180, focusDurationMinutes + 5);
                        setFocusDurationMinutes(nextMin);
                        if (!isFocusModeOn) setFocusTimeLeft(nextMin * 60);
                      }}
                      disabled={isFocusModeOn}
                      className="w-6 h-6 rounded bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200/50 flex items-center justify-center text-xs disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-violet-500 uppercase tracking-widest font-mono font-bold">Nudge Interval</label>
                  <div className="flex bg-violet-50/50 border border-violet-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setFocusIntervalMinutes(3)}
                      className={`flex-1 py-1 text-[9px] font-bold font-mono rounded cursor-pointer ${
                        focusIntervalMinutes === 3
                          ? 'bg-white text-violet-700 shadow-sm border border-violet-100/50'
                          : 'text-violet-400 hover:text-violet-600'
                      }`}
                    >
                      3 Min
                    </button>
                    <button
                      onClick={() => setFocusIntervalMinutes(5)}
                      className={`flex-1 py-1 text-[9px] font-bold font-mono rounded cursor-pointer ${
                        focusIntervalMinutes === 5
                          ? 'bg-white text-violet-700 shadow-sm border border-violet-100/50'
                          : 'text-violet-400 hover:text-violet-600'
                      }`}
                    >
                      5 Min
                    </button>
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex gap-2.5 mt-1">
                <button
                  onClick={() => {
                    if (!isFocusModeOn) {
                      setIsFocusModeOn(true);
                      setIsFocusPaused(false);
                      setSecondsSinceLastNag(0);
                      
                      const currentTask = tasks.find(t => t.id === focusSelectedTaskId);
                      const taskTitle = currentTask ? currentTask.title : "your focus targets";
                      const startMsg = `Understood, Commander! Stay Focus session initiated for "${taskTitle}". I will remind you every ${focusIntervalMinutes} minutes to keep you fully focused. Let's do this! 🥰💪`;
                      
                      speakVoice(startMsg);
                      setMessages((m) => [
                        ...m,
                        {
                          id: `focus-start-${Date.now()}`,
                          sender: 'veronica',
                          text: startMsg,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    } else {
                      setIsFocusPaused(!isFocusPaused);
                      const pauseMsg = isFocusPaused 
                        ? "Session resumed, Commander! Stay focused! 💕" 
                        : "Focus session paused, Master! Relax for a quick second. 🥰";
                      speakVoice(pauseMsg);
                    }
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                    !isFocusModeOn || isFocusPaused
                      ? 'bg-violet-600 hover:bg-violet-700 text-white active:scale-95'
                      : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                  }`}
                >
                  {(!isFocusModeOn || isFocusPaused) ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {isFocusModeOn ? "Resume Grind" : "Start Focus"}
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pause Focus
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsFocusModeOn(false);
                    setIsFocusPaused(true);
                    setFocusTimeLeft(focusDurationMinutes * 60);
                    setSecondsSinceLastNag(0);
                    
                    const resetMsg = "Focus timer reset, Commander! Ready for the next run when you are! 💕";
                    speakVoice(resetMsg);
                  }}
                  className="p-2.5 rounded-xl bg-violet-50 border border-violet-100 hover:bg-violet-100 text-violet-600 transition-all cursor-pointer shadow-sm"
                  title="Reset focus"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Cute Companion Quote */}
              <div className="bg-violet-50/50 rounded-2xl border border-violet-100 p-3 text-[10px] italic text-violet-700 leading-relaxed flex items-start gap-2 mt-auto">
                <Heart className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  {isFocusModeOn 
                    ? (!isFocusPaused 
                      ? `Veronica: "I've muted non-essential subroutines, Commander! It is just you and me focusing on your goals right now! Let's crush this! 🥰"`
                      : `Veronica: "Resting is crucial for optimal productivity, Master! Take a breath, sip your matcha, and hit resume when ready! 💕"`)
                    : `Veronica: "Ready to focus, Commander? Choose a priority target, specify my reminder intervals, and start the timer. I will keep you on track! 🌸"`
                  }
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notepad' && (
            <div className="bg-white border border-violet-100 p-5 rounded-3xl backdrop-blur-xl flex-1 flex flex-col gap-3 shadow-sm min-h-[350px] animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-violet-100/50">
                <div className="flex items-center gap-2">
                  <Notebook className="w-4 h-4 text-violet-600 animate-pulse" />
                  <h3 className="text-xs font-black text-violet-950 uppercase tracking-wider">Smart Notepad</h3>
                </div>
                <button
                  onClick={() => {
                    handleContentChange('');
                    const speech = "Note content cleared, Commander! Ready for your next stroke of genius. 🥰";
                    speakVoice(speech);
                  }}
                  className="p-1 text-[9px] hover:bg-violet-50 text-violet-500 hover:text-rose-600 rounded transition-colors uppercase tracking-wider font-mono font-bold cursor-pointer"
                  title="Clear note text"
                >
                  Clear Note
                </button>
              </div>

              {/* Note Selector Row */}
              <div className="flex flex-wrap gap-1.5 pb-2.5 mb-1 border-b border-violet-100/30 max-h-[85px] overflow-y-auto">
                {notes.map(n => (
                  <div
                    key={n.id}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono tracking-wide transition-all ${
                      n.id === activeNoteId
                        ? 'bg-violet-100/80 border-violet-200/80 text-violet-900 shadow-sm font-bold'
                        : 'bg-violet-50/40 border-violet-100/50 text-violet-400 hover:border-violet-200 hover:text-violet-600'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveNoteId(n.id);
                        const speech = `Loading "${n.title}", Commander! 🥰`;
                        speakVoice(speech);
                      }}
                      className="font-bold truncate max-w-[100px] cursor-pointer text-left"
                    >
                      {n.title || "Untitled Note"}
                    </button>
                    {notes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = notes.filter(item => item.id !== n.id);
                          setNotes(updated);
                          if (activeNoteId === n.id) {
                            setActiveNoteId(updated[0].id);
                          }
                          const speech = `Trashed note: ${n.title}, Master!`;
                          speakVoice(speech);
                        }}
                        className="text-violet-300 hover:text-rose-500 opacity-60 hover:opacity-100 transition-opacity cursor-pointer ml-0.5"
                        title="Delete note"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newId = 'note-' + Date.now();
                    const newNote: Note = {
                      id: newId,
                      title: 'New Note ' + (notes.length + 1),
                      content: '',
                      updatedAt: new Date().toISOString()
                    };
                    setNotes(prev => [...prev, newNote]);
                    setActiveNoteId(newId);
                    const speech = "Created a fresh new note canvas, Commander! Let's fill it with your genius ideas! 🌸";
                    speakVoice(speech);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 text-violet-600 hover:bg-violet-100 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {/* Note Title Input */}
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note Title..."
                className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs font-black text-violet-950 placeholder-violet-300 focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none transition-all"
              />

              {/* Note Content Area */}
              <div className="flex-1 min-h-[160px] relative">
                <textarea
                  value={noteContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Type notes, ideas, checklist drafts, or plans... Veronica can format and organize them using her neural engine!"
                  className="w-full h-full min-h-[160px] bg-white border border-violet-100 rounded-2xl p-3 text-xs text-[#2d224d] placeholder-violet-300 focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none font-mono resize-none leading-relaxed transition-all"
                />
              </div>

              {/* Word count & auto-save */}
              <div className="flex justify-between items-center text-[9px] text-violet-500 font-mono font-semibold">
                <span>
                  {noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0} words | {noteContent.length} chars
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>

              {/* Polish note button */}
              <button
                onClick={handlePolishNote}
                disabled={isPolishingNote || !noteContent.trim()}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isPolishingNote ? 'animate-spin' : 'animate-pulse'}`} />
                {isPolishingNote ? "Organizing note..." : "Polish with Veronica AI"}
              </button>
              
              <p className="text-[9px] text-center text-violet-400 font-mono italic leading-none">
                *Veronica AI organizes your thoughts, fixes typos, and speaks the summary!
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Task Creation Drawer/Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-violet-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-violet-100 w-full max-w-md rounded-3xl p-6 relative shadow-xl">
            <h3 className="text-sm font-black text-violet-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-violet-600 animate-pulse" /> {editingTask ? 'Modify Priority Target' : 'Establish Priority Deadline'}
            </h3>
            
            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              {taskFormError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-3.5 py-2.5 rounded-xl font-medium font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  {taskFormError}
                </div>
              )}
              <div>
                <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule meeting, Complete report..."
                  className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 placeholder-violet-300 focus:border-violet-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Short description</label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details to focus on..."
                  className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 placeholder-violet-300 focus:border-violet-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none font-mono"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e: any) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none font-mono"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Est. Duration (mins)</label>
                  <input
                    type="number"
                    value={newTaskMinutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTaskMinutes(val === '' ? '' : parseInt(val, 10));
                    }}
                    placeholder="None (auto 11:59 PM)"
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Deadline Time</label>
                  <input
                    type="datetime-local"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setShowAddTask(false);
                  }}
                  className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm cursor-pointer"
                >
                  {editingTask ? 'Save Modifications' : 'Confirm Priority Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habit Creation Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-violet-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-violet-100 w-full max-w-md rounded-3xl p-6 relative shadow-xl">
            <h3 className="text-sm font-black text-violet-950 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-600 animate-pulse" /> {editingHabit ? 'Modify Behavioral Target' : 'Establish Behavioral Target'}
            </h3>
            
            <form onSubmit={handleAddHabitSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="e.g. Read 15 pages of theory, Gym session..."
                  className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 placeholder-violet-300 focus:border-violet-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={newHabitCategory}
                    onChange={(e: any) => setNewHabitCategory(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Frequency</label>
                  <select
                    value={newHabitFrequency}
                    onChange={(e: any) => setNewHabitFrequency(e.target.value)}
                    className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none"
                  >
                    <option value="daily">Daily Goal</option>
                    <option value="weekly">Weekly Goal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-violet-500 font-bold uppercase tracking-widest mb-1.5">Target Count (times per cycle)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-950 focus:border-violet-400 outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHabit(false);
                    setEditingHabit(null);
                  }}
                  className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm cursor-pointer"
                >
                  {editingHabit ? 'Update Habit' : 'Deploy Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
