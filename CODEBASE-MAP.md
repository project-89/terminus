# Project 89 Terminal - Codebase Map

## 📂 Directory Structure

```
terminus/
├── app/
│   ├── api/                      # API routes
│   │   ├── adventure/           # AI text adventure responses
│   │   ├── generate-content/    # Content generation
│   │   ├── generate-items/      # Item generation
│   │   ├── override/           # ⭐ Secret code validation
│   │   └── project89cli/        # CLI interface
│   │
│   ├── components/
│   │   └── TerminalCanvas.tsx   # ⭐ Main React component (mobile handling)
│   │
│   ├── lib/
│   │   ├── terminal/
│   │   │   ├── Terminal.ts           # ⭐ Core terminal class
│   │   │   ├── ScreenManager.ts      # ⭐ Screen registry
│   │   │   ├── ScreenRouter.ts       # ⭐ Navigation & routing
│   │   │   ├── TerminalContext.ts    # ⭐ Global state (wallet, access)
│   │   │   │
│   │   │   ├── screens/              # All screen implementations
│   │   │   │   ├── BaseScreen.ts     # ⭐ Base class (global middlewares)
│   │   │   │   ├── FluidScreen.ts    # Home menu
│   │   │   │   ├── AdventureScreen.ts # Text adventure
│   │   │   │   ├── ArchiveScreen.ts  # File browser
│   │   │   │   ├── ScanningScreen.ts # Neural scan
│   │   │   │   ├── ConsentScreen.ts  # Warning screen
│   │   │   │   ├── MainScreen.ts     # Internal interface
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── middleware/           # ⭐ Command interceptors
│   │   │   │   ├── override.ts       # Secret code unlock
│   │   │   │   ├── system.ts         # Wallet & system commands
│   │   │   │   ├── navigation.ts     # Screen navigation
│   │   │   │   └── adventure.ts      # Adventure mode commands
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── CommandHandler.ts # Command processing
│   │   │   │   ├── InputHandler.ts   # Keyboard input
│   │   │   │   ├── Renderer.ts       # Canvas rendering
│   │   │   │   └── ToolHandler.ts    # ⭐ Tool registration
│   │   │   │
│   │   │   ├── tools/
│   │   │   │   ├── registry.ts       # Tool event system
│   │   │   │   └── types.ts          # Tool type definitions
│   │   │   │
│   │   │   ├── effects/
│   │   │   │   ├── TerminalEffects.ts # CRT, glow, scanlines
│   │   │   │   └── fluidAscii.ts     # Fluid particle system
│   │   │   │
│   │   │   └── types/                # TypeScript definitions
│   │   │
│   │   ├── wallet/
│   │   │   └── WalletService.ts      # ⭐ Phantom wallet integration
│   │   │
│   │   └── ai/
│   │       ├── prompts.ts            # AI prompt helpers
│   │       └── models.ts             # AI model configs
│   │
│   ├── layout.tsx                    # ⭐ Root layout (viewport meta)
│   ├── page.tsx                      # Main page component
│   └── globals.css                   # Global styles
│
├── public/                           # Static assets
├── prisma/                           # Database schema
└── netlify.toml                      # Deployment config

⭐ = Critical files for activation & mobile
```

---

## 🔑 Critical Files for Hidden Flows

### **1. Terminal.ts** - Core Terminal Engine

**Location:** `app/lib/terminal/Terminal.ts`

**Key Methods:**

```typescript
// Input control
setCommandAccess(boolean)    // Enable/disable user input
getCommandAccess()           // Check if input allowed

// Scrolling & layout
setBottomPadding(number)     // Adjust for mobile keyboard
scrollToLatest({ extraPadding }) // Scroll with padding
getHeight()                   // Account for bottom padding

// Commands & events
processCommand(string)        // Execute user command
emit("screen:transition", {...}) // Navigate screens

// Content
print(text, options)          // Display text
processAIStream(stream)       // Handle AI responses
```

**Event Handlers:**

- `screen:transition` → Calls `screenManager.navigate()`

---

### **2. ScreenManager.ts** - Screen Registry

**Location:** `app/lib/terminal/ScreenManager.ts`

**Registered Screens:**

```typescript
"home"      → FluidScreen      // Main menu
"adventure" → AdventureScreen  // Text adventure
"archive"   → ArchiveScreen    // File browser
"scanning"  → ScanningScreen   // Neural scan animation
"consent"   → ConsentScreen    // Warning + acceptance
"main"      → MainScreen       // Internal interface
"static"    → StaticScreen     // Static content
```

**Methods:**

```typescript
navigate(screenName, options); // Switch screens
```

---

### **3. BaseScreen.ts** - Screen Base Class

**Location:** `app/lib/terminal/screens/BaseScreen.ts`

**Global Middlewares (applied to ALL screens):**

```typescript
1. overrideMiddleware       // Secret code unlock
2. systemCommandsMiddleware // Wallet, identify, help
3. navigationMiddleware     // "main" command
4. [screen-specific]        // Custom screen handlers
```

**Protected Methods:**

```typescript
transition(screenName, options); // Navigate to screen
registerMiddleware(handler); // Add custom middleware
registerCommand(config); // Add screen command
```

**Lifecycle:**

```typescript
beforeRender() → render() → afterRender()
cleanup() // Called on screen exit
```

---

### **4. TerminalContext.ts** - Global State

**Location:** `app/lib/terminal/TerminalContext.ts`

**State Interface:**

```typescript
interface TerminalState {
  hasFullAccess: boolean; // ⭐ Unlocked via override code
  walletConnected: boolean; // Phantom wallet status
  walletAddress?: string; // Connected wallet address
  tokenBalance?: number; // P89 token balance
  lastSeen?: Date; // Last connection time
  gameMessages?: Message[]; // Adventure mode history
}
```

**Methods:**

```typescript
getInstance(); // Singleton
getState(); // Read state
setState(partial); // Update state (saves to localStorage)
clearState(); // Reset everything
```

---

### **5. Middleware System**

#### **override.ts** - Secret Code Unlock

**Location:** `app/lib/terminal/middleware/override.ts`

**Trigger:** `override YOUR_CODE`

**Flow:**

1. POST to `/api/override` with code
2. If valid → `hasFullAccess = true`
3. AI welcome message
4. System commands unlocked

---

#### **system.ts** - System Commands

**Location:** `app/lib/terminal/middleware/system.ts`

**Only works if:** `hasFullAccess === true`

**Commands:**

```typescript
"connect"; // Connect Phantom wallet
"disconnect"; // Disconnect wallet
"identify"; // Start neural scan flow
"help"; // Show system commands
```

---

#### **navigation.ts** - Navigation

**Location:** `app/lib/terminal/middleware/navigation.ts`

**Commands:**

```typescript
"main" → navigate("home") // Always returns to home
```

---

### **6. TerminalCanvas.tsx** - React Component

**Location:** `app/components/TerminalCanvas.tsx`

**Mobile Keyboard Handling:**

```typescript
// visualViewport event handling
window.visualViewport?.addEventListener("resize", ...)

// Dynamic padding based on keyboard
setBottomPadding(totalBottomPadding)

// Hidden input for keyboard
<input ref={hiddenInputRef} ... />

// Global tap fallback
document.addEventListener("touchend", handleGlobalTap)
```

**Key State:**

```typescript
viewport: {
  top, height;
} // Visual viewport tracking
baseViewportHeightRef; // Original height
hiddenInputRef; // Input element
terminalRef; // Terminal instance
```

---

### **7. WalletService.ts** - Wallet Integration

**Location:** `app/lib/wallet/WalletService.ts`

**Methods:**

```typescript
connect(); // Connect Phantom, return address
disconnect(); // Disconnect wallet
checkTokenBalance(); // Check P89 token balance
isConnected(); // Check connection status
```

**Token Info:**

```typescript
PROJECT89_MINT = "Bz4MhmVRQENiCou7ZpJ575wpjNFjBjVBSiVhuNg1pump";
```

---

### **8. ToolHandler.ts** - Client Tools

**Location:** `app/lib/terminal/components/ToolHandler.ts`

**Built-in Tools:**

```typescript
"glitch_screen"; // Glitch effect
"matrix_rain"; // Matrix rain animation
"generate_sound"; // AI-generated sounds
```

**Registration:**

```typescript
terminal.toolHandler.registerTool({
  name: "custom_tool",
  handler: async (params) => {
    // Your logic
  },
});
```

**Triggering:**

```typescript
import { toolEvents } from "@/app/lib/terminal/tools/registry";
toolEvents.emit("tool:custom_tool", { param: value });
```

---

## 🔄 Navigation Flow

### **URL-Based Navigation**

```
?screen=home       → FluidScreen (menu)
?screen=adventure  → AdventureScreen
?screen=archive    → ArchiveScreen
?screen=main       → MainScreen (after unlock)
```

### **Event-Based Navigation**

```typescript
terminal.emit("screen:transition", {
  to: "consent",
  options: { type: "fade", duration: 500 },
});
```

### **Method-Based Navigation**

```typescript
// From any screen
await this.transition("main", { type: "instant" });
```

---

## 🎭 Screen Lifecycle

```
1. User triggers navigation
   ↓
2. ScreenManager.navigate(screenName)
   ↓
3. Current screen cleanup()
   ↓
4. Terminal.clear()
   ↓
5. New screen instantiated
   ↓
6. beforeRender() [optional]
   ↓
7. render() [required]
   ↓
8. afterRender() [optional]
   ↓
9. Screen active (handles commands via middleware chain)
```

---

## 🛡️ Middleware Chain Order

**For every command:**

```
1. overrideMiddleware       // Check for "override CODE"
   ↓
2. systemCommandsMiddleware // Check for system commands (if unlocked)
   ↓
3. navigationMiddleware     // Check for "main"
   ↓
4. Screen-specific middleware // Custom screen handlers
   ↓
5. If not handled → fallback (usually AI processing)
```

---

## 📱 Mobile-Specific Code

### **TerminalCanvas.tsx**

```typescript
// Detect keyboard
window.visualViewport?.addEventListener("resize", handleViewportResize);

// Adjust container
container.style.height = `${visualViewport.height}px`;

// Set terminal padding
terminal.setBottomPadding(totalBottomPadding);

// Focus input on tap
document.addEventListener("touchend", handleGlobalTap);
```

### **layout.tsx**

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, 
               maximum-scale=1.0, user-scalable=no, 
               viewport-fit=cover"
/>
```

---

## 🔧 Environment Variables

```bash
# Required for override code unlock
OVERRIDE_CODE=your-secret-code

# Optional: Solana RPC (defaults to public endpoint)
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://...

# AI provider credentials
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local and set OVERRIDE_CODE

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Database commands
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:push      # Push schema to database
pnpm prisma:studio    # Open database GUI
```

---

## 📊 Data Flow

### **Command Input → Processing → Output**

```
User types → TerminalCanvas (React)
             ↓
          Terminal.handleInput()
             ↓
          Terminal.processCommand()
             ↓
          CommandHandler.processCommand()
             ↓
          Screen.handleCommand() → Middleware chain
             ↓
          [Handler executes]
             ↓
          Terminal.print() → Display result
```

### **AI Integration Flow**

```
User command → AdventureScreen.processCommand()
                ↓
             POST /api/adventure
                ↓
             AI generates response (streaming)
                ↓
             Terminal.processAIStream()
                ↓
             Parse for tool calls
                ↓
             [Execute tools if found]
                ↓
             Terminal.print() → Display text
```

---

## 🎯 Key Patterns

### **Singleton Pattern**

- `Terminal.getInstance()`
- `TerminalContext.getInstance()`

### **Middleware Pattern**

- Command interception
- Ordered execution
- Early return on `handled = true`

### **Event-Driven**

- Screen transitions via events
- Tool execution via `toolEvents`
- Terminal lifecycle events

### **React + Canvas Hybrid**

- React manages lifecycle
- Canvas for rendering
- Hidden input for keyboard

---

**Quick Reference:** ⭐ marks files critical for hidden flows
**Mobile Focus:** Visual viewport, bottom padding, touch events
**Hidden Flows:** Override → System commands → Internal screens

