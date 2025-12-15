import "server-only";

/**
 * Simple Lexical to HTML converter that doesn't require jsdom
 * This manually parses the Lexical JSON structure and converts it to HTML
 */
export function lexicalToHtmlSimple(editorStateString: string): string {
  try {
    const editorState = JSON.parse(editorStateString);
    
    if (!editorState?.root?.children) {
      return "<p>Invalid editor state</p>";
    }

    function convertNode(node: any): string {
      if (!node) return "";

      switch (node.type) {
        case "paragraph":
          const paragraphText = node.children
            ? node.children.map(convertNode).join("")
            : "";
          return `<p>${paragraphText}</p>`;

        case "heading":
          const level = node.tag || "h1";
          const headingText = node.children
            ? node.children.map(convertNode).join("")
            : "";
          return `<${level}>${headingText}</${level}>`;

        case "quote":
          const quoteText = node.children
            ? node.children.map(convertNode).join("")
            : "";
          return `<blockquote>${quoteText}</blockquote>`;

        case "list":
          const listItems = node.children
            ? node.children.map(convertNode).join("")
            : "";
          const listTag = node.listType === "number" ? "ol" : "ul";
          return `<${listTag}>${listItems}</${listTag}>`;

        case "listitem":
          const itemText = node.children
            ? node.children.map(convertNode).join("")
            : "";
          return `<li>${itemText}</li>`;

        case "text":
          let text = node.text || "";
          if (node.format) {
            if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
            if (node.format & 2) text = `<em>${text}</em>`; // Italic
            if (node.format & 4) text = `<s>${text}</s>`; // Strikethrough
            if (node.format & 8) text = `<u>${text}</u>`; // Underline
            if (node.format & 16) text = `<code>${text}</code>`; // Code
          }
          return text;

        case "link":
          const linkText = node.children
            ? node.children.map(convertNode).join("")
            : "";
          const url = node.url || "#";
          return `<a href="${url}">${linkText}</a>`;

        case "table":
          const tableRows = node.children
            ? node.children.map(convertNode).join("")
            : "";
          return `<table>${tableRows}</table>`;

        case "tablerow":
          const rowCells = node.children
            ? node.children.map(convertNode).join("")
            : "";
          return `<tr>${rowCells}</tr>`;

        case "tablecell":
          const cellText = node.children
            ? node.children.map(convertNode).join("")
            : "";
          const header = node.header ? "th" : "td";
          return `<${header}>${cellText}</${header}>`;

        case "linebreak":
          return "<br>";

        default:
          // For unknown node types, try to extract text from children
          if (node.children) {
            return node.children.map(convertNode).join("");
          }
          return "";
      }
    }

    const html = editorState.root.children
      .map(convertNode)
      .join("");

    return html || "<p></p>";
  } catch (error) {
    console.error("Error in simple lexical conversion:", error);
    // Fallback: try to extract plain text
    try {
      const editorState = JSON.parse(editorStateString);
      if (editorState?.root?.children) {
        function extractText(node: any): string {
          if (node.type === "text") return node.text || "";
          if (node.children) {
            return node.children.map(extractText).join("");
          }
          return "";
        }
        const text = editorState.root.children.map(extractText).join(" ");
        return `<p>${text}</p>`;
      }
    } catch (e) {
      // If all else fails, return error message
    }
    return "<p>Error converting content</p>";
  }
}

