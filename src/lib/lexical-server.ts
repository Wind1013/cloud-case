import "server-only";
import { lexicalToHtmlSimple } from "./lexical-simple";

/**
 * Convert Lexical editor state to HTML
 * Uses a simple converter that doesn't require jsdom to avoid ESM issues
 */
export async function lexicalToHtml(editorStateString: string): Promise<string> {
  try {
    // Use the simple converter that doesn't require jsdom
    return lexicalToHtmlSimple(editorStateString);
  } catch (error) {
    console.error("Error converting lexical to HTML:", error);
    return "<p>Error converting content</p>";
  }
}

