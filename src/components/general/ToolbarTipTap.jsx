// ToolbarTipTap.jsx
import React from "react";

const defaultButtons = [
  "bold",
  "italic",
  "strike",
  "underline",
  "link",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "undo",
  "redo",
];

const ToolbarTipTap = ({ editor, buttons }) => {
  if (!editor) return null;

  const availableButtons = buttons || defaultButtons;

  const handleClick = (action) => {
    switch (action) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "link":
        {
          const url = prompt("Entrez l'URL du lien :");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "codeBlock":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "undo":
        editor.chain().focus().undo().run();
        break;
      case "redo":
        editor.chain().focus().redo().run();
        break;
      default:
        break;
    }
  };

  return (
    <div className="tiptap-toolbar" style={{ marginBottom: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
      {availableButtons.map((btn) => (
        <button
          key={btn}
          type="button"
          onClick={() => handleClick(btn)}
          className={editor.isActive(btn) ? "active" : ""}
          style={{ padding: "4px 8px", cursor: "pointer", backgroundColor:"var(--color-input-bg)", border:"none", color:"var(--color-text)" }}
        >
          {btn}
        </button>
      ))}
    </div>
  );
};

export default ToolbarTipTap;
