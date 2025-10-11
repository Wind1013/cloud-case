"use client";

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconList,
  IconListNumbers,
  IconQuote,
  IconUnderline,
  IconVariable,
} from "@tabler/icons-react";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

const LowPriority = 1;

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [elementFormat, setElementFormat] = useState("left");

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setElementFormat(String(element.getFormat()));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  interface FormatHeadingProps {
    headingSize: string;
  }

  const formatHeading = (headingSize: HeadingTagType): void => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const insertVariable = () => {
    const variableName = prompt("Enter variable name:");
    if (variableName) {
      const text = `{{${variableName}}}`;
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
        }
      });
    }
  };

  return (
    <div
      className="flex items-center p-2 bg-gray-100 rounded-t-lg border-b border-gray-300"
      ref={toolbarRef}
    >
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="p-1.5 mr-1 rounded hover:bg-gray-200 disabled:opacity-50"
        aria-label="Undo"
      >
        <IconArrowBackUp className="h-5 w-5" />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="p-1.5 mr-1 rounded hover:bg-gray-200 disabled:opacity-50"
        aria-label="Redo"
      >
        <IconArrowForwardUp className="h-5 w-5" />
      </button>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <button
        type="button"
        onClick={() => formatHeading("h1")}
        className={`p-1.5 mr-1 rounded ${
          blockType === "h1" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Heading 1"
      >
        <IconH1 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => formatHeading("h2")}
        className={`p-1.5 mr-1 rounded ${
          blockType === "h2" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Heading 2"
      >
        <IconH2 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => formatHeading("h3")}
        className={`p-1.5 mr-1 rounded ${
          blockType === "h3" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Heading 3"
      >
        <IconH3 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`p-1.5 mr-1 rounded ${
          isBold ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Format Bold"
      >
        <IconBold className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`p-1.5 mr-1 rounded ${
          isItalic ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Format Italic"
      >
        <IconItalic className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`p-1.5 rounded ${
          isUnderline ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Format Underline"
      >
        <IconUnderline className="h-5 w-5" />
      </button>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <button
        type="button"
        onClick={formatQuote}
        className={`p-1.5 mr-1 rounded ${
          blockType === "quote" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Quote"
      >
        <IconQuote className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={formatBulletList}
        className={`p-1.5 mr-1 rounded ${
          blockType === "bullet" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Bulleted List"
      >
        <IconList className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={formatNumberedList}
        className={`p-1.5 rounded ${
          blockType === "number" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Numbered List"
      >
        <IconListNumbers className="h-5 w-5" />
      </button>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        className={`p-1.5 mr-1 rounded ${
          elementFormat === "left" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Left Align"
      >
        <IconAlignLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        className={`p-1.5 mr-1 rounded ${
          elementFormat === "center" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Center Align"
      >
        <IconAlignCenter className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        className={`p-1.5 mr-1 rounded ${
          elementFormat === "right" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Right Align"
      >
        <IconAlignRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        className={`p-1.5 rounded ${
          elementFormat === "justify" ? "bg-gray-300" : "hover:bg-gray-200"
        }`}
        aria-label="Justify Align"
      >
        <IconAlignJustified className="h-5 w-5" />
      </button>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <button
        type="button"
        onClick={insertVariable}
        className="p-1.5 rounded hover:bg-gray-200 ml-auto"
        aria-label="Insert Variable"
      >
        + Insert variable
      </button>
    </div>
  );
}
