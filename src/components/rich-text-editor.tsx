"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $createParagraphNode, $getRoot, EditorState } from "lexical";
import React from "react";
import ToolbarPlugin from "./ToolbarPlugin";

const theme = {
  // Theme styling goes here
  // ...
};

// Lexical React plugins are React components, so they must begin with an uppercase letter.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  return null;
}

function OnChange(onChange: (editorState: EditorState) => void) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });
  }, [editor, onChange]);
  return null;
}

export default function RichTextEditor({
  onChange,
  initialContent,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
}: {
  onChange: (content: string) => void;
  initialContent?: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}) {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError(error: Error) {
      throw error;
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      LinkNode,
    ],
    editorState: initialContent
      ? initialContent
      : (editor: { update: (arg0: () => void) => void }) => {
          editor.update(() => {
            const root = $getRoot();
            if (root.isEmpty()) {
              root.append($createParagraphNode());
            }
          });
        },
  };

  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = editorState.toJSON();
    onChange(JSON.stringify(editorStateJSON));
  };

  const editorStyle = {
    marginTop: `${marginTop}in`,
    marginRight: `${marginRight}in`,
    marginBottom: `${marginBottom}in`,
    marginLeft: `${marginLeft}in`,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container relative border border-gray-300 rounded-lg">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-input min-h-[100px] p-4 focus:outline-none"
              style={editorStyle}
            />
          }
          placeholder={
            <div className="editor-placeholder absolute top-14 left-4 text-gray-400">
              Enter some text...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
        <OnChangePlugin onChange={handleOnChange} />
      </div>
    </LexicalComposer>
  );
}
