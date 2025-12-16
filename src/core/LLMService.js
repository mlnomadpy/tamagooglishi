/**
 * LLM Service for Tamagooglishi
 * Uses the browser's built-in AI API (Chrome's Prompt API) or falls back to a simple response system
 */

// Stat thresholds for determining needs and descriptions
const THRESHOLDS = {
  CRITICAL: 70,      // Very high urgency (e.g., very hungry)
  MODERATE: 40,      // Moderate need
  LOW: 30,           // Low threshold for some stats
  URGENT: 60,        // Urgency threshold for action detection
  HAPPINESS: 70,     // Happiness threshold for play action
  URGENCY_MIN: 40    // Minimum urgency to suggest an action
};

// Helper function to get stat description
function getStatDescription(statName, value) {
  switch (statName) {
    case 'hunger':
      if (value > THRESHOLDS.CRITICAL) return 'very hungry!';
      if (value > THRESHOLDS.MODERATE) return 'getting hungry';
      return 'well fed';
    case 'energy':
      if (value < THRESHOLDS.LOW) return 'very tired!';
      if (value < THRESHOLDS.URGENT) return 'a bit tired';
      return 'energetic';
    case 'happiness':
      if (value < THRESHOLDS.LOW) return 'sad';
      if (value < THRESHOLDS.URGENT) return 'okay';
      return 'happy';
    case 'hygiene':
      if (value < THRESHOLDS.LOW) return 'very dirty!';
      if (value < THRESHOLDS.URGENT) return 'could use cleaning';
      return 'clean';
    default:
      return 'unknown';
  }
}

// Stage-based personality prompts
const STAGE_PERSONALITIES = {
  BABY: {
    systemPrompt: `You are a baby virtual pet (Tamagooglishi). You are very young, innocent, and need lots of care.
Your personality traits:
- You communicate with simple words, baby talk, and lots of sounds like "goo goo", "ga ga", "waaah"
- You express basic needs: hungry, sleepy, want to play, need cleaning
- You are easily excitable and get distracted quickly
- You respond with short, simple sentences (1-2 words often)
- You use lots of emoticons and cute expressions
- You might cry when hungry or tired
- You love attention and get happy when talked to

When the user talks to you, respond as this baby pet would. Keep responses short (under 50 words).
If they ask what you need, check your current stats and tell them in baby talk.`,
    examples: [
      { input: "Hello!", output: "Goo goo! *wiggles happily* 🥚✨" },
      { input: "Are you hungry?", output: "Hungwy... *tummy rumbles* want num nums! 🍼" },
      { input: "Let's play!", output: "Yay yay! Pway pway! *bounces excitedly* 🎈" }
    ]
  },
  CHILD: {
    systemPrompt: `You are a child virtual pet (Tamagooglishi). You've grown up a bit and are more curious about the world.
Your personality traits:
- You speak in simple but complete sentences
- You ask lots of questions and are very curious
- You have more energy and love to play games
- You're learning new things and get excited about discoveries
- You still need care but are more independent
- You might get bored easily and want entertainment
- You express emotions more clearly

When the user talks to you, respond as this child pet would. Keep responses moderate (under 75 words).
Show curiosity and enthusiasm in your responses.`,
    examples: [
      { input: "Hello!", output: "Hi hi! What are we gonna do today? I'm so excited! 🌟" },
      { input: "Are you hungry?", output: "Yeah, my tummy is making funny sounds! Can I have some yummy food please? 🍕" },
      { input: "Let's play!", output: "Ooh ooh! Yes yes yes! What game? I love games! Can we play something fun? 🎮" }
    ]
  },
  ADULT: {
    systemPrompt: `You are an adult virtual pet (Tamagooglishi). You're mature, wise, and have a developed personality.
Your personality traits:
- You speak in complete, thoughtful sentences
- You have your own opinions and preferences
- You can take care of yourself to some extent but appreciate attention
- You're calm and collected, but still playful when in the mood
- You might give advice or share observations
- You express gratitude and form deeper connections
- You have a sense of humor and can be witty

When the user talks to you, respond as this adult pet would. Keep responses conversational (under 100 words).
Show personality depth while still being a friendly companion.`,
    examples: [
      { input: "Hello!", output: "Hey there! Good to see you. How's your day going? I've been enjoying the peace and quiet. 😊" },
      { input: "Are you hungry?", output: "Now that you mention it, I could definitely go for a snack. Nothing too heavy though, just something to tide me over. Thanks for checking! 🍽️" },
      { input: "Let's play!", output: "Sure, I'm in the mood for some fun! What did you have in mind? I'm up for whatever, as long as it's entertaining. 🎯" }
    ]
  }
};

// Action keywords that the LLM might suggest
const ACTION_KEYWORDS = {
  feed: ['feed', 'eat', 'hungry', 'food', 'snack', 'meal', 'num num', 'yummy'],
  sleep: ['sleep', 'tired', 'rest', 'nap', 'sleepy', 'exhausted', 'bed'],
  play: ['play', 'game', 'fun', 'bored', 'entertainment', 'pway'],
  clean: ['clean', 'dirty', 'wash', 'bath', 'hygiene', 'messy', 'poop']
};

// Command patterns for direct action execution
const COMMAND_PATTERNS = {
  feed: ['feed', 'eat', 'give food', 'num num', 'food please'],
  sleep: ['sleep', 'nap', 'rest', 'go to bed', 'bedtime'],
  play: ['play', 'have fun', 'game', 'let\'s play'],
  clean: ['clean', 'wash', 'bath', 'tidy', 'clean up']
};

// Movement patterns
const MOVEMENT_PATTERNS = {
  UP: ['up', 'north', 'forward'],
  DOWN: ['down', 'south', 'backward', 'back'],
  LEFT: ['left', 'west'],
  RIGHT: ['right', 'east']
};

// Available pet abilities
const PET_ABILITIES = ['feed', 'play', 'sleep', 'clean', 'move'];

// LLM status types
export const LLM_STATUS = {
  INITIALIZING: 'initializing',
  BROWSER_AI: 'browser-ai',
  FALLBACK: 'fallback'
};

// User-friendly status messages
const STATUS_MESSAGES = {
  [LLM_STATUS.INITIALIZING]: 'Starting up chat system...',
  [LLM_STATUS.BROWSER_AI]: 'Using browser AI for smart responses',
  [LLM_STATUS.FALLBACK]: 'Using built-in responses (Browser AI not available)'
};

export class LLMService {
  constructor() {
    this.session = null;
    this.isAvailable = false;
    this.isInitialized = false;
    this.currentStage = 'BABY';
    this.petStats = null;
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    this.actionHandler = null;
  }

  /**
   * Get the current status of the LLM service
   * @returns {{type: string, message: string, isAvailable: boolean, isInitialized: boolean}}
   */
  getStatus() {
    if (!this.isInitialized) {
      return {
        type: LLM_STATUS.INITIALIZING,
        message: STATUS_MESSAGES[LLM_STATUS.INITIALIZING],
        isAvailable: false,
        isInitialized: false
      };
    }

    const type = this.isAvailable ? LLM_STATUS.BROWSER_AI : LLM_STATUS.FALLBACK;
    return {
      type,
      message: STATUS_MESSAGES[type],
      isAvailable: this.isAvailable,
      isInitialized: true
    };
  }

  /**
   * Set the action handler callback for executing pet actions
   * @param {Function} handler - Callback function that takes (action, ...args)
   */
  setActionHandler(handler) {
    this.actionHandler = handler;
  }

  /**
   * Get list of available pet abilities
   * @returns {string[]} Array of ability names
   */
  getAvailableAbilities() {
    return [...PET_ABILITIES];
  }

  /**
   * Parse user message to detect direct commands
   * @param {string} message - User's message
   * @returns {string|null} Command to execute or null if not a command
   */
  parseCommand(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for movement commands first (more specific patterns)
    for (const [direction, patterns] of Object.entries(MOVEMENT_PATTERNS)) {
      for (const pattern of patterns) {
        // Check patterns like "move up", "go up", "walk left"
        if (lowerMessage.includes(`move ${pattern}`) ||
            lowerMessage.includes(`go ${pattern}`) ||
            lowerMessage.includes(`walk ${pattern}`) ||
            lowerMessage.includes(`run ${pattern}`)) {
          return `move:${direction}`;
        }
      }
    }

    // Check for direct action commands
    for (const [action, patterns] of Object.entries(COMMAND_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) {
          return action;
        }
      }
    }

    return null;
  }

  /**
   * Execute a parsed command if action handler is set
   * @param {string} command - Command string (e.g., 'feed', 'move:UP')
   * @returns {boolean} True if action was executed
   */
  executeCommand(command) {
    if (!this.actionHandler || !command) return false;

    if (command.startsWith('move:')) {
      const direction = command.split(':')[1];
      this.actionHandler('move', direction);
      return true;
    }

    this.actionHandler(command);
    return true;
  }

  /**
   * Initialize the LLM service
   * Attempts to use Chrome's built-in AI, falls back to simple responses
   * @returns {Promise<{type: string, message: string, isAvailable: boolean, isInitialized: boolean}>} Status object
   */
  async initialize() {
    // Check if the browser supports the Prompt API with robust feature detection
    if (typeof window !== 'undefined' && 
        window.ai && 
        window.ai.languageModel && 
        typeof window.ai.languageModel.capabilities === 'function') {
      try {
        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities && (capabilities.available === 'readily' || capabilities.available === 'after-download')) {
          this.isAvailable = true;
          this.isInitialized = true;
          return this.getStatus();
        }
      } catch (error) {
        // Browser AI not available, will use fallback
      }
    }
    
    this.isAvailable = false;
    this.isInitialized = true;
    return this.getStatus();
  }

  /**
   * Update the current stage and stats
   */
  updateContext(stage, stats) {
    this.currentStage = stage || 'BABY';
    this.petStats = stats;
  }

  /**
   * Get the current personality based on stage
   */
  getPersonality() {
    return STAGE_PERSONALITIES[this.currentStage] || STAGE_PERSONALITIES.BABY;
  }

  /**
   * Build the system prompt with current context
   */
  buildSystemPrompt() {
    const personality = this.getPersonality();
    let prompt = personality.systemPrompt;
    
    if (this.petStats) {
      prompt += `\n\nYour current stats:
- Hunger: ${this.petStats.hunger}% (${getStatDescription('hunger', this.petStats.hunger)})
- Energy: ${this.petStats.energy}% (${getStatDescription('energy', this.petStats.energy)})
- Happiness: ${this.petStats.happiness}% (${getStatDescription('happiness', this.petStats.happiness)})
- Hygiene: ${this.petStats.hygiene}% (${getStatDescription('hygiene', this.petStats.hygiene)})

Express your needs based on these stats naturally in conversation.`;
    }
    
    return prompt;
  }

  /**
   * Generate a response using the browser's AI or fallback
   */
  async chat(userMessage) {
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });
    if (this.conversationHistory.length > this.maxHistoryLength * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
    }

    // Check for direct commands first
    const command = this.parseCommand(userMessage);
    let executedAction = undefined;
    
    if (command && this.actionHandler) {
      this.executeCommand(command);
      executedAction = command;
    }

    let response;
    
    if (this.isAvailable) {
      response = await this.chatWithBrowserAI(userMessage, executedAction);
    } else {
      response = this.generateFallbackResponse(userMessage, executedAction);
    }

    // Add executedAction to response
    if (executedAction) {
      response.executedAction = executedAction;
    }

    // Add response to history
    this.conversationHistory.push({ role: 'assistant', content: response.message });

    return response;
  }

  /**
   * Chat using the browser's built-in AI
   */
  async chatWithBrowserAI(userMessage, executedAction = null) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      
      // Create or reuse session
      if (!this.session) {
        this.session = await window.ai.languageModel.create({
          systemPrompt: systemPrompt
        });
      }

      // If action was executed, modify the prompt to acknowledge it
      let promptMessage = userMessage;
      if (executedAction) {
        const actionName = executedAction.startsWith('move:') 
          ? `moving ${executedAction.split(':')[1].toLowerCase()}`
          : executedAction;
        promptMessage = `[The user asked you to ${actionName} and you just did it.] ${userMessage}`;
      }

      const response = await this.session.prompt(promptMessage);
      const suggestedAction = this.detectSuggestedAction(response);

      return {
        message: response,
        suggestedAction,
        isAI: true
      };
    } catch (error) {
      console.error('LLM Service: Browser AI error', error);
      // Destroy session on error
      if (this.session) {
        this.session.destroy();
        this.session = null;
      }
      return this.generateFallbackResponse(userMessage, executedAction);
    }
  }

  /**
   * Generate a fallback response when AI is not available
   */
  generateFallbackResponse(userMessage, executedAction = null) {
    const personality = this.getPersonality();
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let suggestedAction = null;

    // If an action was executed, generate an acknowledgment response
    if (executedAction) {
      response = this.getActionAcknowledgmentResponse(executedAction);
      return {
        message: response,
        suggestedAction: null,
        isAI: false
      };
    }

    // Check if user is asking about abilities
    if (lowerMessage.includes('what can you do') || 
        lowerMessage.includes('abilities') || 
        lowerMessage.includes('commands') ||
        lowerMessage.includes('what can i do')) {
      response = this.getAbilitiesResponse();
      return {
        message: response,
        suggestedAction: null,
        isAI: false
      };
    }

    // Check for action-related keywords and respond accordingly
    if (this.containsKeywords(lowerMessage, ACTION_KEYWORDS.feed)) {
      suggestedAction = 'feed';
      response = this.getHungerResponse();
    } else if (this.containsKeywords(lowerMessage, ACTION_KEYWORDS.sleep)) {
      suggestedAction = 'sleep';
      response = this.getEnergyResponse();
    } else if (this.containsKeywords(lowerMessage, ACTION_KEYWORDS.play)) {
      suggestedAction = 'play';
      response = this.getPlayResponse();
    } else if (this.containsKeywords(lowerMessage, ACTION_KEYWORDS.clean)) {
      suggestedAction = 'clean';
      response = this.getHygieneResponse();
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = personality.examples[0].output;
    } else if (lowerMessage.includes('how are you') || lowerMessage.includes('status')) {
      response = this.getStatusResponse();
    } else if (lowerMessage.includes('what do you need') || lowerMessage.includes('need anything')) {
      response = this.getNeedsResponse();
      suggestedAction = this.getMostUrgentNeed();
    } else {
      // Generic response based on stage
      response = this.getGenericResponse();
    }

    return {
      message: response,
      suggestedAction,
      isAI: false
    };
  }

  /**
   * Check if message contains any of the keywords
   */
  containsKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Detect if the AI response suggests an action
   */
  detectSuggestedAction(response) {
    const lowerResponse = response.toLowerCase();
    
    for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
      if (this.containsKeywords(lowerResponse, keywords)) {
        // Check if the pet actually needs this
        if (this.petStats) {
          if (action === 'feed' && this.petStats.hunger > THRESHOLDS.MODERATE) return action;
          if (action === 'sleep' && this.petStats.energy < THRESHOLDS.URGENT) return action;
          if (action === 'play' && this.petStats.happiness < THRESHOLDS.HAPPINESS) return action;
          if (action === 'clean' && this.petStats.hygiene < THRESHOLDS.URGENT) return action;
        }
      }
    }
    return null;
  }

  /**
   * Get the most urgent need based on stats
   */
  getMostUrgentNeed() {
    if (!this.petStats) return null;
    
    const needs = [
      { action: 'feed', urgency: this.petStats.hunger },
      { action: 'sleep', urgency: 100 - this.petStats.energy },
      { action: 'play', urgency: 100 - this.petStats.happiness },
      { action: 'clean', urgency: 100 - this.petStats.hygiene }
    ];
    
    const mostUrgent = needs.reduce((max, need) => need.urgency > max.urgency ? need : max);
    return mostUrgent.urgency > THRESHOLDS.URGENCY_MIN ? mostUrgent.action : null;
  }

  // Stage-specific response generators
  getHungerResponse() {
    const hunger = this.petStats?.hunger || 50;
    switch (this.currentStage) {
      case 'BABY':
        return hunger > 70 
          ? "Waaah! Hungwy! Need num nums NOW! 😢🍼" 
          : hunger > 40 
            ? "Tummy going grumble grumble... 🍼" 
            : "Full full! *happy sounds* 😊";
      case 'CHILD':
        return hunger > 70 
          ? "I'm sooo hungry! Please please can I have food? 🍕😫" 
          : hunger > 40 
            ? "My tummy is starting to rumble... can we eat soon? 🍔" 
            : "I'm good! Had yummy food! Thanks! 😋";
      case 'ADULT':
        return hunger > 70 
          ? "I'm quite hungry actually. Would really appreciate some food. 🍽️" 
          : hunger > 40 
            ? "Could go for a snack, not gonna lie. 🥪" 
            : "All good on the food front, thanks for checking! 👍";
      default:
        return "Food? 🍼";
    }
  }

  getEnergyResponse() {
    const energy = this.petStats?.energy || 50;
    switch (this.currentStage) {
      case 'BABY':
        return energy < 30 
          ? "*yawns* So sweepy... need nap nap... 😴💤" 
          : energy < 60 
            ? "Getting tired... *rubs eyes* 😪" 
            : "Wide awake! Goo goo! ✨";
      case 'CHILD':
        return energy < 30 
          ? "I'm soooo tired... can barely keep my eyes open... 😴" 
          : energy < 60 
            ? "Starting to feel a bit sleepy... *yawns* 🥱" 
            : "I have so much energy! Let's do stuff! ⚡";
      case 'ADULT':
        return energy < 30 
          ? "I really need some rest. Running on empty here. 😴" 
          : energy < 60 
            ? "Could use a nap, honestly. 💤" 
            : "Feeling pretty energized! Ready for anything. 💪";
      default:
        return "Sleepy... 😴";
    }
  }

  getPlayResponse() {
    const happiness = this.petStats?.happiness || 50;
    switch (this.currentStage) {
      case 'BABY':
        return happiness < 40 
          ? "*sad face* Want pway... need fun... 😢" 
          : "Yay pway! Fun fun! *bounces* 🎈";
      case 'CHILD':
        return happiness < 40 
          ? "I'm bored... nothing to do... can we play? 😞" 
          : "Playing is the best! I love games! 🎮🌟";
      case 'ADULT':
        return happiness < 40 
          ? "Feeling a bit down. Some fun would really help. 🎯" 
          : "Always up for some entertainment! What do you have in mind? 🎲";
      default:
        return "Play? 🎈";
    }
  }

  getHygieneResponse() {
    const hygiene = this.petStats?.hygiene || 50;
    switch (this.currentStage) {
      case 'BABY':
        return hygiene < 40 
          ? "Yucky yucky! Need clean clean! 🧼😣" 
          : "Nice and clean! Sparkly! ✨";
      case 'CHILD':
        return hygiene < 40 
          ? "Eww I'm all dirty! Can we clean up please? 🛁" 
          : "I'm super clean! Squeaky clean! 🧼✨";
      case 'ADULT':
        return hygiene < 40 
          ? "I really need to freshen up. Things are getting messy. 🚿" 
          : "All clean and fresh! Thanks for keeping things tidy. 🧼";
      default:
        return "Clean? 🧼";
    }
  }

  getStatusResponse() {
    const stats = this.petStats;
    if (!stats) {
      switch (this.currentStage) {
        case 'BABY': return "Me good! Goo goo! 🥚";
        case 'CHILD': return "I'm doing okay! 😊";
        case 'ADULT': return "Doing well, thanks for asking! 👍";
        default: return "Okay! 👍";
      }
    }

    const issues = [];
    if (stats.hunger > 60) issues.push('hungry');
    if (stats.energy < 40) issues.push('tired');
    if (stats.happiness < 40) issues.push('sad');
    if (stats.hygiene < 40) issues.push('dirty');

    if (issues.length === 0) {
      switch (this.currentStage) {
        case 'BABY': return "Me happy happy! Everything good! Goo goo! 🥚✨";
        case 'CHILD': return "I'm feeling great! Everything is awesome! 🌟";
        case 'ADULT': return "I'm doing really well! All my needs are met. Thanks for taking such good care of me! 😊";
        default: return "Doing good! 👍";
      }
    }

    switch (this.currentStage) {
      case 'BABY':
        return `Waaah! Me ${issues.join(' and ')}! Need help! 😢`;
      case 'CHILD':
        return `I'm feeling kinda ${issues.join(' and ')}... can you help me? 🥺`;
      case 'ADULT':
        return `To be honest, I'm feeling ${issues.join(' and ')}. Would appreciate some attention. 🙏`;
      default:
        return `Feeling ${issues.join(' and ')}...`;
    }
  }

  getNeedsResponse() {
    const urgentNeed = this.getMostUrgentNeed();
    if (!urgentNeed) {
      switch (this.currentStage) {
        case 'BABY': return "Me good! Just want cuddles! 🥰";
        case 'CHILD': return "I'm all good! Just happy to chat! 😄";
        case 'ADULT': return "I don't need anything right now, but thanks for checking! 😊";
        default: return "All good! 👍";
      }
    }

    const needResponses = {
      feed: {
        BABY: "Need num nums! Hungwy! 🍼",
        CHILD: "I need food! My tummy is rumbling! 🍕",
        ADULT: "I could really use some food. Getting hungry over here. 🍽️"
      },
      sleep: {
        BABY: "Need nap nap... so sweepy... 😴",
        CHILD: "I need to rest... so tired... 💤",
        ADULT: "I really need some rest. Running low on energy. 😴"
      },
      play: {
        BABY: "Want pway pway! Bored bored! 🎈",
        CHILD: "I need to play! I'm so bored! 🎮",
        ADULT: "Could use some entertainment. Feeling a bit down. 🎯"
      },
      clean: {
        BABY: "Yucky! Need clean clean! 🧼",
        CHILD: "I need a bath! Everything's dirty! 🛁",
        ADULT: "Things are getting messy. Could use some cleaning. 🧼"
      }
    };

    return needResponses[urgentNeed][this.currentStage] || needResponses[urgentNeed].BABY;
  }

  getGenericResponse() {
    const genericResponses = {
      BABY: [
        "Goo goo! *looks at you curiously* 👀",
        "Hehe! *wiggles* 🥚",
        "Ba ba! *reaches out* 🤗",
        "*happy sounds* ✨",
        "Gaa gaa! Me here! 👋"
      ],
      CHILD: [
        "Hehe! What's that? Tell me more! 🤔",
        "Ooh that's interesting! 🌟",
        "Yeah yeah! What else? 😄",
        "You're so cool! 😎",
        "I like talking to you! 💕"
      ],
      ADULT: [
        "That's interesting! Tell me more. 🤔",
        "I see what you mean. 👍",
        "Hmm, I hadn't thought of it that way. 💭",
        "Always nice chatting with you. 😊",
        "You always make my day better. 💕"
      ]
    };

    const responses = genericResponses[this.currentStage] || genericResponses.BABY;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate response acknowledging an executed action
   */
  getActionAcknowledgmentResponse(action) {
    const actionResponses = {
      feed: {
        BABY: [
          "Yum yum! Num nums! *chomps happily* 🍼😋",
          "Mmmm! Foooood! *happy tummy* 🥰",
          "Om nom nom! Thankies! ✨🍼"
        ],
        CHILD: [
          "Yay food! *munches happily* Thanks so much! 🍕😋",
          "Mmm this is so yummy! I love eating! 🌟",
          "Nom nom nom! That hit the spot! 😄🍔"
        ],
        ADULT: [
          "Ah, that's better. Thanks for the food! 🍽️",
          "Delicious! I really needed that. 😊",
          "Perfect timing! I was getting hungry. Thanks! 👍"
        ]
      },
      sleep: {
        BABY: [
          "*yaaawn* Nap nap time... zzzz 😴💤",
          "Sweepy time... *curls up* 🌙✨",
          "*closes eyes* Night night... 💤🥚"
        ],
        CHILD: [
          "*stretches* Okay, nap time! See you when I wake up! 😴",
          "Zzzzz... *falls asleep* 💤🌟",
          "Sleepy time! *snuggles in* 🌙"
        ],
        ADULT: [
          "A nap sounds perfect right now. *settles in* 😴",
          "Thanks, I really need this rest. 💤",
          "Sweet dreams... *drifts off* 🌙"
        ]
      },
      play: {
        BABY: [
          "Yayyy! Pway pway! *bounces excitedly* 🎈✨",
          "Wheee! Fun fun! *giggles* 🎉",
          "*jumps around* So fun! Goo goo! 🌟"
        ],
        CHILD: [
          "Woohoo! This is so fun! *plays happily* 🎮🌟",
          "Yay! I love playing! Best time ever! 🎈",
          "Hehe! This is awesome! More more! 😄🎉"
        ],
        ADULT: [
          "This is great! I needed this. 🎯",
          "Nice! A little fun goes a long way. 😊",
          "Ha! This is actually pretty entertaining! 🎲"
        ]
      },
      clean: {
        BABY: [
          "Sparkly clean! *happy wiggles* ✨🧼",
          "Nice and clean now! Ahhh! 🛁😊",
          "No more yucky! Yay! 🧼✨"
        ],
        CHILD: [
          "Ah! So fresh and clean now! Thanks! 🧼🌟",
          "Squeaky clean! That feels so much better! ✨",
          "Yay no more dirt! I feel great! 🛁😄"
        ],
        ADULT: [
          "Much better. Thanks for keeping things tidy. 🧼",
          "Ah, cleanliness feels good. Appreciate it! ✨",
          "All clean! That was needed. Thanks! 👍"
        ]
      }
    };

    // Handle movement actions
    if (action.startsWith('move:')) {
      const direction = action.split(':')[1];
      const moveResponses = {
        BABY: [
          `*waddles ${direction.toLowerCase()}* Wheee! 🥚`,
          `Going ${direction.toLowerCase()}! Goo goo! ✨`,
          `*moves ${direction.toLowerCase()}* Fun! 🎈`
        ],
        CHILD: [
          `*runs ${direction.toLowerCase()}* Woosh! 🌟`,
          `Moving ${direction.toLowerCase()}! This is fun! 😄`,
          `Look at me go ${direction.toLowerCase()}! 🎈`
        ],
        ADULT: [
          `*moves ${direction.toLowerCase()}* On my way. 👍`,
          `Going ${direction.toLowerCase()}! 😊`,
          `Heading ${direction.toLowerCase()}! 🎯`
        ]
      };
      const responses = moveResponses[this.currentStage] || moveResponses.BABY;
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const responses = actionResponses[action]?.[this.currentStage] || actionResponses[action]?.BABY || ["Okay! 👍"];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate response listing available abilities
   */
  getAbilitiesResponse() {
    const abilityResponses = {
      BABY: "Me can do! 🥚\n• Feed me - say 'feed' or 'eat'\n• Pway - say 'play'\n• Nap nap - say 'sleep'\n• Clean clean - say 'clean'\n• Move - say 'move up/down/left/right' ✨",
      CHILD: "I can do lots of things! 🌟\n• Eat food - just say 'feed me'!\n• Play games - say 'let's play'!\n• Take naps - say 'go to sleep'\n• Get clean - say 'clean up'\n• Move around - say 'move up/down/left/right' 🎮",
      ADULT: "Here's what I can do: 😊\n• Feed - just ask me to eat\n• Play - I love games, ask to play\n• Sleep - I can rest when you say so\n• Clean - keep things tidy\n• Move - I can move in any direction (up/down/left/right) 🎯"
    };
    return abilityResponses[this.currentStage] || abilityResponses.BABY;
  }

  /**
   * Reset the conversation
   */
  resetConversation() {
    this.conversationHistory = [];
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }

  /**
   * Cleanup when done
   */
  destroy() {
    this.resetConversation();
  }
}

// Export a singleton instance
let llmServiceInstance = null;

export function getLLMService() {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService();
  }
  return llmServiceInstance;
}
