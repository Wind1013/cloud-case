import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { LinkNode } from "@lexical/link";
import { JSDOM } from "jsdom";

export function lexicalToHtml(editorStateString: string) {
  const dom = new JSDOM();
  global.window = dom.window as unknown as Window & typeof globalThis;
  global.document = dom.window.document;

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
  const editorState = editor.parseEditorState(editorStateString);
  editor.setEditorState(editorState);
  let html = "";
  editor.update(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return html;
}
