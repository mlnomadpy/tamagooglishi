/**
 * LLM Service for Tamagooglishi
 * Uses the browser's built-in AI API (Chrome's Prompt API) or falls back to a simple response system
 */

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

export class LLMService {
  constructor() {
    this.session = null;
    this.isAvailable = false;
    this.currentStage = 'BABY';
    this.petStats = null;
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
  }

  /**
   * Initialize the LLM service
   * Attempts to use Chrome's built-in AI, falls back to simple responses
   */
  async initialize() {
    // Check if the browser supports the Prompt API
    if (typeof window !== 'undefined' && window.ai && window.ai.languageModel) {
      try {
        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities.available === 'readily' || capabilities.available === 'after-download') {
          this.isAvailable = true;
          console.log('LLM Service: Browser AI available');
          return true;
        }
      } catch (error) {
        console.warn('LLM Service: Browser AI not available', error);
      }
    }
    
    console.log('LLM Service: Using fallback response system');
    this.isAvailable = false;
    return false;
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
- Hunger: ${this.petStats.hunger}% (${this.petStats.hunger > 70 ? 'very hungry!' : this.petStats.hunger > 40 ? 'getting hungry' : 'well fed'})
- Energy: ${this.petStats.energy}% (${this.petStats.energy < 30 ? 'very tired!' : this.petStats.energy < 60 ? 'a bit tired' : 'energetic'})
- Happiness: ${this.petStats.happiness}% (${this.petStats.happiness < 30 ? 'sad' : this.petStats.happiness < 60 ? 'okay' : 'happy'})
- Hygiene: ${this.petStats.hygiene}% (${this.petStats.hygiene < 30 ? 'very dirty!' : this.petStats.hygiene < 60 ? 'could use cleaning' : 'clean'})

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

    let response;
    
    if (this.isAvailable) {
      response = await this.chatWithBrowserAI(userMessage);
    } else {
      response = this.generateFallbackResponse(userMessage);
    }

    // Add response to history
    this.conversationHistory.push({ role: 'assistant', content: response.message });

    return response;
  }

  /**
   * Chat using the browser's built-in AI
   */
  async chatWithBrowserAI(userMessage) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      
      // Create or reuse session
      if (!this.session) {
        this.session = await window.ai.languageModel.create({
          systemPrompt: systemPrompt
        });
      }

      const response = await this.session.prompt(userMessage);
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
      return this.generateFallbackResponse(userMessage);
    }
  }

  /**
   * Generate a fallback response when AI is not available
   */
  generateFallbackResponse(userMessage) {
    const personality = this.getPersonality();
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let suggestedAction = null;

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
          if (action === 'feed' && this.petStats.hunger > 40) return action;
          if (action === 'sleep' && this.petStats.energy < 60) return action;
          if (action === 'play' && this.petStats.happiness < 70) return action;
          if (action === 'clean' && this.petStats.hygiene < 60) return action;
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
    return mostUrgent.urgency > 40 ? mostUrgent.action : null;
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
