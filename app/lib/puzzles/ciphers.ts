/**
 * Cipher toolkit for encoding puzzle content
 * 
 * Classic ciphers that feel "solvable" - the player should feel
 * like they're cracking something real
 */

// Caesar cipher (shift)
export function caesar(text: string, shift: number, decode = false): string {
  const actualShift = decode ? -shift : shift;
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const base = char === char.toUpperCase() ? 65 : 97;
        const code = char.charCodeAt(0);
        return String.fromCharCode(((code - base + actualShift + 26) % 26) + base);
      }
      return char;
    })
    .join("");
}

// ROT13 (special case of Caesar)
export function rot13(text: string): string {
  return caesar(text, 13);
}

// Vigenère cipher
export function vigenere(text: string, key: string, decode = false): string {
  const keyUpper = key.toUpperCase();
  let keyIndex = 0;
  
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const base = char === char.toUpperCase() ? 65 : 97;
        const charCode = char.charCodeAt(0) - base;
        const keyChar = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
        keyIndex++;
        
        const shift = decode ? -keyChar : keyChar;
        return String.fromCharCode(((charCode + shift + 26) % 26) + base);
      }
      return char;
    })
    .join("");
}

// Atbash cipher (reverse alphabet)
export function atbash(text: string): string {
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/)) {
        return String.fromCharCode(219 - char.charCodeAt(0)); // 'z' + 'a' = 219
      }
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(155 - char.charCodeAt(0)); // 'Z' + 'A' = 155
      }
      return char;
    })
    .join("");
}

// A1Z26 (letter to number)
export function a1z26Encode(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/)) {
        return (char.charCodeAt(0) - 96).toString();
      }
      return char;
    })
    .join("-");
}

export function a1z26Decode(text: string): string {
  return text
    .split("-")
    .map((part) => {
      const num = parseInt(part, 10);
      if (num >= 1 && num <= 26) {
        return String.fromCharCode(num + 96);
      }
      return part;
    })
    .join("");
}

// Binary encoding
export function toBinary(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

export function fromBinary(binary: string): string {
  return binary
    .split(" ")
    .map((b) => String.fromCharCode(parseInt(b, 2)))
    .join("");
}

// Morse code
const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  " ": "/",
};

const MORSE_REVERSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

export function toMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((char) => MORSE_MAP[char] || char)
    .join(" ");
}

export function fromMorse(morse: string): string {
  return morse
    .split(" ")
    .map((code) => MORSE_REVERSE[code] || code)
    .join("");
}

// Bacon cipher (steganographic binary)
export function baconEncode(text: string): string {
  const baconMap: Record<string, string> = {
    A: "AAAAA", B: "AAAAB", C: "AAABA", D: "AAABB", E: "AABAA",
    F: "AABAB", G: "AABBA", H: "AABBB", I: "ABAAA", J: "ABAAB",
    K: "ABABA", L: "ABABB", M: "ABBAA", N: "ABBAB", O: "ABBBA",
    P: "ABBBB", Q: "BAAAA", R: "BAAAB", S: "BAABA", T: "BAABB",
    U: "BABAA", V: "BABAB", W: "BABBA", X: "BABBB", Y: "BBAAA",
    Z: "BBAAB",
  };
  
  return text
    .toUpperCase()
    .split("")
    .filter((c) => c.match(/[A-Z]/))
    .map((c) => baconMap[c])
    .join("");
}

// Pig Latin
export function toPigLatin(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      if (word.match(/^[aeiou]/i)) {
        return word + "way";
      }
      const match = word.match(/^([^aeiou]+)(.*)$/i);
      if (match) {
        return match[2] + match[1].toLowerCase() + "ay";
      }
      return word;
    })
    .join(" ");
}

// Reverse text
export function reverse(text: string): string {
  return text.split("").reverse().join("");
}

// First letter acrostic
export function acrosticEncode(message: string, words: string[]): string {
  const letters = message.toUpperCase().replace(/[^A-Z]/g, "").split("");
  return letters
    .map((letter) => {
      const matching = words.filter((w) => w.toUpperCase().startsWith(letter));
      return matching[Math.floor(Math.random() * matching.length)] || `[${letter}]`;
    })
    .join(" ");
}

export function acrosticDecode(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => word[0] || "")
    .join("");
}

// Number substitution (custom mapping)
export function numberSubstitute(text: string, mapping?: Record<string, string>): string {
  const defaultMapping: Record<string, string> = {
    A: "4", E: "3", I: "1", O: "0", S: "5", T: "7", B: "8", G: "9",
  };
  const m = mapping || defaultMapping;
  
  return text
    .toUpperCase()
    .split("")
    .map((c) => m[c] || c)
    .join("");
}

// Generate a random cipher challenge
export interface CipherChallenge {
  encoded: string;
  cipher: string;
  key?: string;
  hint: string;
  solution: string;
}

export function generateChallenge(
  message: string,
  difficulty: "easy" | "medium" | "hard"
): CipherChallenge {
  switch (difficulty) {
    case "easy": {
      const shift = Math.floor(Math.random() * 25) + 1;
      return {
        encoded: caesar(message, shift),
        cipher: "caesar",
        key: shift.toString(),
        hint: `Shift ${shift} positions in the alphabet`,
        solution: message,
      };
    }
    case "medium": {
      const keys = ["LOGOS", "RABBIT", "CICADA", "ONERIO", "SIGNAL"];
      const key = keys[Math.floor(Math.random() * keys.length)];
      return {
        encoded: vigenere(message, key),
        cipher: "vigenere",
        key,
        hint: `The key is a ${key.length}-letter word`,
        solution: message,
      };
    }
    case "hard": {
      // Chain multiple ciphers
      const step1 = rot13(message);
      const step2 = reverse(step1);
      const step3 = a1z26Encode(step2);
      return {
        encoded: step3,
        cipher: "chain:rot13+reverse+a1z26",
        hint: "Three steps: numbers hide letters, which are reversed, which are rotated",
        solution: message,
      };
    }
  }
}

// Utility: detect potential cipher in text
export function detectCipher(text: string): string[] {
  const possibilities: string[] = [];
  
  // Check for numbers that could be A1Z26
  if (text.match(/^\d+(-\d+)+$/)) {
    possibilities.push("a1z26");
  }
  
  // Check for binary
  if (text.match(/^[01\s]+$/) && text.replace(/\s/g, "").length % 8 === 0) {
    possibilities.push("binary");
  }
  
  // Check for morse
  if (text.match(/^[.\-\s\/]+$/)) {
    possibilities.push("morse");
  }
  
  // Check for possible Caesar (frequency analysis hint)
  if (text.match(/^[A-Za-z\s]+$/)) {
    possibilities.push("caesar", "rot13", "vigenere", "atbash");
  }
  
  return possibilities;
}
