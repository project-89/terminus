import { CommandConfig } from "../../types";
import { TERMINAL_COLORS } from "../../Terminal";
import { TerminalContext } from "../../TerminalContext";

async function handleActivate(ctx: any): Promise<void> {
  const { args, terminal } = ctx;
  const code = args[1];
  
  if (!code) {
    await terminal.print("\nUsage: !activate <CODE>", {
      color: TERMINAL_COLORS.system,
      speed: "fast",
    });
    await terminal.print("Enter the activation code given to you by another agent.", {
      color: TERMINAL_COLORS.secondary,
      speed: "fast",
    });
    return;
  }
  
  const context = TerminalContext.getInstance();
  const identity = await context.ensureIdentity();
  
  if (!identity) {
    await terminal.print("\nError: Failed to establish identity.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
    return;
  }
  
  await terminal.print("\n> VERIFYING ACTIVATION CODE...", {
    color: TERMINAL_COLORS.system,
    speed: "fast",
  });
  
  try {
    const res = await fetch("/api/identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "activate",
        userId: identity.userId,
        code: code.toUpperCase(),
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      await terminal.print(`\n✕ ${data.error || "Activation failed."}`, {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
      return;
    }
    
    if (data.narrative) {
      await terminal.print(data.narrative, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }
    
    context.setState({ isReferred: true });
    
  } catch (error) {
    await terminal.print("\n✕ Network error. Try again.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
  }
}

async function handleSecure(ctx: any): Promise<void> {
  const { terminal } = ctx;
  
  const context = TerminalContext.getInstance();
  const identity = await context.ensureIdentity();
  
  if (!identity) {
    await terminal.print("\nError: Failed to establish identity.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
    return;
  }
  
  try {
    const statusRes = await fetch("/api/identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check", userId: identity.userId }),
    });
    
    const statusData = await statusRes.json();
    
    if (!statusData.status?.isReferred) {
      await terminal.print(`
╔══════════════════════════════════════════════════════════════╗
║  ✕ IDENTITY LOCK UNAVAILABLE                                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  You must first be activated by another agent.               ║
║                                                              ║
║  Obtain an activation code and use:  !activate <CODE>        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`, {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      return;
    }
    
    if (!statusData.status?.canLockIdentity) {
      await terminal.print("\n◈ Your identity is already secured.", {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
      return;
    }
    
    await terminal.print(`
╔══════════════════════════════════════════════════════════════╗
║  ◈ IDENTITY SECURITY PROTOCOL                                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Choose a passphrase to secure your identity.                ║
║  This will be your key to return from any terminal.          ║
║                                                              ║
║  Requirements:                                               ║
║  • At least 6 characters                                     ║
║  • Something you will remember                               ║
║  • Something others cannot guess                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`, {
      color: TERMINAL_COLORS.primary,
      speed: "normal",
    });
    
    const passphrase = await terminal.prompt("\n> ENTER PASSPHRASE: ", {
      mask: true,
    });
    
    if (!passphrase || passphrase.length < 6) {
      await terminal.print("\n✕ Passphrase must be at least 6 characters.", {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
      return;
    }
    
    const confirmPassphrase = await terminal.prompt("> CONFIRM PASSPHRASE: ", {
      mask: true,
    });
    
    if (passphrase !== confirmPassphrase) {
      await terminal.print("\n✕ Passphrases do not match.", {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
      return;
    }
    
    await terminal.print("\n> SECURING IDENTITY...", {
      color: TERMINAL_COLORS.system,
      speed: "fast",
    });
    
    const res = await fetch("/api/identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "secure",
        userId: identity.userId,
        passphrase,
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      await terminal.print(`\n✕ ${data.error || "Security protocol failed."}`, {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
      return;
    }
    
    if (data.narrative) {
      await terminal.print(data.narrative, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }
    
    if (data.referralCode) {
      await terminal.print(`\nYour activation code for recruiting others: ${data.referralCode}`, {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });
    }
    
    context.setState({ identityLocked: true });
    
  } catch (error) {
    await terminal.print("\n✕ Network error. Try again.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
  }
}

async function handleLogin(ctx: any): Promise<void> {
  const { terminal } = ctx;
  
  await terminal.print(`
╔══════════════════════════════════════════════════════════════╗
║  ◈ AGENT VERIFICATION                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Enter your agent designation and passphrase.                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`, {
    color: TERMINAL_COLORS.primary,
    speed: "normal",
  });
  
  const agentId = await terminal.prompt("\n> AGENT DESIGNATION: ");
  
  if (!agentId) {
    await terminal.print("\n✕ Designation required.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
    return;
  }
  
  const passphrase = await terminal.prompt("> PASSPHRASE: ", {
    mask: true,
  });
  
  if (!passphrase) {
    await terminal.print("\n✕ Passphrase required.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
    return;
  }
  
  await terminal.print("\n> VERIFYING IDENTITY...", {
    color: TERMINAL_COLORS.system,
    speed: "fast",
  });
  
  try {
    const res = await fetch("/api/identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        agentId: agentId.toUpperCase(),
        passphrase,
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      await terminal.print(`\n✕ ${data.error || "Verification failed."}`, {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
      return;
    }
    
    await terminal.print(`
╔══════════════════════════════════════════════════════════════╗
║  ✓ IDENTITY VERIFIED                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ${data.message?.padEnd(58) || "Welcome back, Agent.".padEnd(58)}║
║                                                              ║
║  Your progress has been restored.                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`, {
      color: TERMINAL_COLORS.primary,
      speed: "normal",
    });
    
    if (data.identity) {
      const context = TerminalContext.getInstance();
      context.setState({
        userId: data.identity.id,
        agentId: data.identity.agentId,
        handle: data.identity.handle || data.identity.agentId,
        identityLocked: data.identity.identityLocked,
        isReferred: data.identity.isReferred,
      });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("p89_userId", data.identity.id);
        localStorage.setItem("p89_agentId", data.identity.agentId);
        localStorage.setItem("p89_handle", data.identity.handle || data.identity.agentId.toLowerCase());
      }
    }
    
  } catch (error) {
    await terminal.print("\n✕ Network error. Try again.", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
  }
}

async function handleWhoami(ctx: any): Promise<void> {
  const { terminal } = ctx;
  
  const context = TerminalContext.getInstance();
  const identity = await context.ensureIdentity();
  
  if (!identity) {
    await terminal.print("\n> IDENTITY: UNKNOWN", {
      color: TERMINAL_COLORS.secondary,
      speed: "fast",
    });
    return;
  }
  
  try {
    const [identityRes, pointsRes] = await Promise.all([
      fetch(`/api/identity?userId=${identity.userId}`),
      fetch(`/api/points?handle=${encodeURIComponent((identity as any).handle || identity.agentId || "agent")}`),
    ]);
    
    const data = await identityRes.json();
    const pointsData = await pointsRes.json().catch(() => ({ points: 0 }));
    const points = pointsData.points ?? 0;
    
    if (data.identity) {
      const i = data.identity;
      const s = data.status;
      
      await terminal.print(`
╔══════════════════════════════════════════════════════════════╗
║  ◈ AGENT DOSSIER                                             ║
╠══════════════════════════════════════════════════════════════╣
║  Designation: ${(i.agentId || "UNASSIGNED").padEnd(44)}║
║  Handle:      ${(i.handle || "none").padEnd(44)}║
║  Status:      ${(i.identityLocked ? "SECURED" : "UNSECURED").padEnd(44)}║
║  Network:     ${(i.isReferred ? "ACTIVATED" : "PENDING ACTIVATION").padEnd(44)}║
${i.referralCode ? `║  Your Code:   ${i.referralCode.padEnd(44)}║\n` : ""}║                                                              ║
║  LOGOS:       ${String(points).padEnd(44)}║
║  Turns:       ${String(s?.turnsPlayed || 0).padEnd(44)}║
║  Time:        ${(String(s?.minutesPlayed || 0) + " minutes").padEnd(44)}║
╚══════════════════════════════════════════════════════════════╝`, {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
    }
    
  } catch (error) {
    await terminal.print(`\n> DESIGNATION: ${identity.agentId || "UNKNOWN"}`, {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
  }
}

export const identityCommands: CommandConfig[] = [
  {
    name: "!activate",
    description: "Apply an activation code from another agent",
    type: "system",
    handler: handleActivate,
  },
  {
    name: "!secure",
    description: "Secure your identity with a passphrase",
    type: "system",
    handler: handleSecure,
  },
  {
    name: "!login",
    description: "Login with your agent designation and passphrase",
    type: "system",
    handler: handleLogin,
  },
  {
    name: "!whoami",
    description: "Display your agent identity status",
    type: "system",
    handler: handleWhoami,
  },
];
