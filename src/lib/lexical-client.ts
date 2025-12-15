"use client";

import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";

export async function lexicalToHtml(editorStateString: string) {
  const editorNodes = [
    HeadingNode,
    QuoteNode,
    ListItemNode,
    ListNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    LinkNode,
  ];

  const editor = createHeadlessEditor({
    nodes: editorNodes,
  });
  
  try {
    const editorState = editor.parseEditorState(editorStateString);
    editor.setEditorState(editorState);
    let html = "";
    editor.update(() => {
      html = $generateHtmlFromNodes(editor, null);
    });
    return html;
  } catch (error) {
    console.error("Error converting lexical to HTML:", error);
    return "<p>Error converting content</p>";
  }
}

