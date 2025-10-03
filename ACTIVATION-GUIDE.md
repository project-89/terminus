# Project 89 Terminal - Activation Guide

## ✅ What's Been Fixed & Enabled

### 1. **Mobile Keyboard & Input**

- ✅ `visualViewport` API integration for keyboard detection
- ✅ Dynamic viewport height adjustment when keyboard appears
- ✅ Hidden input with proper focus handling
- ✅ Global tap/click fallback for overlay canvases
- ✅ Safe area insets (`viewport-fit=cover`)
- ✅ Touch event handling with proper `preventDefault`
- ✅ Keyboard blur on mobile after command submission

### 2. **Screen Navigation System**

- ✅ All screens registered in `ScreenManager`
  - `home` → FluidScreen (menu)
  - `adventure` → AdventureScreen (text adventure)
  - `archive` → ArchiveScreen (file browser)
  - `scanning` → ScanningScreen (neural scan)
  - `consent` → ConsentScreen (warning screen)
  - `main` → MainScreen (internal interface)
  - `static` → StaticScreen
- ✅ `screen:transition` event handling
- ✅ URL-based navigation with query params
- ✅ Router timer utilities (setTimeout/setInterval)

### 3. **Hidden Flow System**

- ✅ Global middlewares on all screens:
  - Override middleware (secret code unlock)
  - System commands middleware (wallet, identify)
  - Navigation middleware
- ✅ Full access gating via `hasFullAccess` state
- ✅ Wallet integration (Phantom/Solana)
- ✅ Token balance checking (P89 token)

### 4. **Terminal Core APIs**

- ✅ `getCommandAccess()` / `setCommandAccess()` - input control
- ✅ `setBottomPadding()` - mobile keyboard space
- ✅ `scrollToLatest({ extraPadding })` - scroll with padding
- ✅ `handleInput()` - keyboard event processing
- ✅ `processCommand()` - command execution
- ✅ Event system for screen transitions

---

## 🔓 Activating Hidden Flows

### **Step 1: Unlock Full Access**

Type the override command with your secret code:

```
override YOUR_SECRET_CODE
```

**Setup:**

1. Set environment variable: `OVERRIDE_CODE=YOUR_SECRET_CODE`
2. The API endpoint `/api/override/route.ts` validates the code
3. Success grants `hasFullAccess = true` globally

**What it unlocks:**

- `connect` - Wallet connection
- `disconnect` - Wallet disconnection
- `identify` - Neural scan flow
- `help` - System commands list

---

### **Step 2: Connect Wallet (Optional)**

After unlocking access:

```
connect
```

**Flow:**

1. Detects Phantom wallet
2. Connects to Solana network
3. Checks P89 token balance
4. Saves wallet state to localStorage

**Next step if you have P89 tokens:**

```
identify
```

---

### **Step 3: Internal Flow (Neural Scan → Consent → Main)**

Command: `identify`

**Automatic flow:**

1. **ScanningScreen** - Shows neural signature scan
   - Emits: `screen:transition` → `consent`
2. **ConsentScreen** - Displays neurolinguistic virus warning
   - User accepts → transitions to `main`
   - User denies → returns to previous screen
3. **MainScreen** - Internal terminal interface
   - Shows system menu with 5 options
   - Full tool access enabled

---

## 📱 Mobile Testing Checklist

### **iOS Safari / Chrome**

- [ ] Tap anywhere to show keyboard
- [ ] Keyboard doesn't cover input area
- [ ] Container adjusts height when keyboard appears
- [ ] Safe areas respected (notch, home indicator)
- [ ] Arrow keys work (if on-screen keyboard supports)
- [ ] Enter key submits command and dismisses keyboard

### **Android Chrome / Firefox**

- [ ] Tap to focus input
- [ ] Keyboard appearance adjusts viewport
- [ ] Scroll still works with keyboard open
- [ ] Input visible above keyboard

**Debug Mode:**

- Input is currently semi-visible on mobile (`opacity: 0.01`)
- To make fully visible for debugging, change:
  ```tsx
  opacity: isMobile() ? 1 : 0;
  background: isMobile() ? "rgba(0,0,0,0.8)" : "transparent";
  ```

---

## 🛠️ Client-Side Tools

### **Registering Custom Tools**

Tools are registered via `ToolHandler` and triggered by AI responses or events:

```typescript
terminal.toolHandler.registerTool({
  name: "custom_effect",
  handler: async (params: { intensity: number }) => {
    // Your tool logic here
    console.log("Custom effect triggered", params);
  },
});
```

### **Built-in Tools**

Already registered in `ToolHandler`:

- `glitch_screen` - Glitch effect with intensity/duration
- `matrix_rain` - Matrix rain animation
- `generate_sound` - AI-generated sound effects

### **Triggering Tools**

From AI responses:

```json
{
  "tool": "glitch_screen",
  "parameters": { "intensity": 0.7, "duration": 3000 }
}
```

Or manually via events:

```typescript
import { toolEvents } from "@/app/lib/terminal/tools/registry";
toolEvents.emit("tool:glitch_screen", { intensity: 0.7, duration: 3000 });
```

---

## 🎯 Command Reference

### **System Commands** (after override unlock)

| Command      | Description                    |
| ------------ | ------------------------------ |
| `help`       | Show available system commands |
| `connect`    | Connect Phantom wallet         |
| `disconnect` | Disconnect wallet              |
| `identify`   | Begin neural scan flow         |

### **Utility Commands** (always available)

| Command     | Description           |
| ----------- | --------------------- |
| `!help`     | Terminal utilities    |
| `!clear`    | Clear terminal        |
| `!copy`     | Copy all content      |
| `!copylast` | Copy last message     |
| `!home`     | Return to home screen |

### **Navigation**

| Command    | Description                             |
| ---------- | --------------------------------------- |
| `main`     | Navigate to home (via middleware)       |
| `archive`  | Open file archive                       |
| Direct URL | `?screen=archive`, `?screen=main`, etc. |

---

## 🧪 Testing the Full Flow

### **Complete Activation Sequence:**

1. **Start at home screen** (`?screen=home`)

   ```
   # See the P89 logo and menu
   ```

2. **Enter adventure mode**

   - Click "ENTER THE SIMULATION"
   - Or navigate: `?screen=adventure`

3. **Unlock full access**

   ```
   override YOUR_SECRET_CODE
   ```

   ✅ Should see: "ACCESS GRANTED - SYSTEM COMMANDS UNLOCKED"

4. **Connect wallet** (if you have Phantom + P89 tokens)

   ```
   connect
   ```

   ✅ Should see wallet address and token balance

5. **Trigger internal flow**

   ```
   identify
   ```

   ✅ Flow: scanning → consent → main interface

6. **Verify main screen**
   - Should see 5 system options
   - Full tool access enabled
   - System commands available

---

## 📁 Key Files Modified

### **Core Terminal**

- `app/lib/terminal/Terminal.ts` - Added event handling, padding
- `app/lib/terminal/ScreenRouter.ts` - Added timer helpers
- `app/lib/terminal/ScreenManager.ts` - Registers all screens
- `app/lib/terminal/screens/BaseScreen.ts` - Global middlewares

### **Components**

- `app/components/TerminalCanvas.tsx` - Mobile keyboard handling
- `app/layout.tsx` - Added `viewport-fit=cover`

### **Middleware**

- `app/lib/terminal/middleware/override.ts` - Secret code unlock
- `app/lib/terminal/middleware/system.ts` - Wallet & system commands
- `app/lib/terminal/middleware/navigation.ts` - Screen navigation

### **API**

- `app/api/override/route.ts` - Validates override code

---

## 🚀 Next Steps

### **Immediate Testing**

1. Set `OVERRIDE_CODE` in `.env.local`
2. Run `pnpm dev`
3. Test override code unlock
4. Verify mobile keyboard on real device

### **Optional Enhancements**

1. **More visible input for debugging:**

   - Set `opacity: 1` and `background: rgba(0,0,0,0.8)` on mobile
   - Add border to see input position clearly

2. **Additional tools:**

   - Register custom visual effects
   - Add sound effects
   - Implement reality-altering tools

3. **Extended flows:**
   - Add more internal screens after `main`
   - Create branching narratives based on wallet state
   - Implement P89 token-gated features

---

## 🐛 Known Issues & Solutions

### **Keyboard doesn't appear on mobile**

- **Cause:** Input might be behind overlay canvas
- **Solution:** Global tap fallback added, triggers on any screen tap
- **Debug:** Set input `opacity: 1` to verify it's focusable

### **Arrow keys don't work**

- **Cause:** Mobile keyboards often don't have arrow keys
- **Solution:** Use swipe gestures or add on-screen controls
- **Note:** History navigation (↑/↓) might not work on all keyboards

### **Content behind keyboard**

- **Solution:** Already handled via `visualViewport` API
- **Fallback:** `setBottomPadding()` adds space when keyboard detected

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify `OVERRIDE_CODE` is set correctly
3. Test on both iOS Safari and Android Chrome
4. Use Chrome DevTools device mode for desktop debugging

**Mobile-specific debugging:**

- Enable Safari Web Inspector (iOS)
- Use `chrome://inspect` (Android)
- Add `console.log` in touch event handlers

---

**Status:** ✅ All core systems operational
**Last Updated:** Final pass complete
**Mobile:** Ready for testing
**Hidden Flows:** Fully wired and accessible

