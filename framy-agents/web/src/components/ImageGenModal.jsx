import React from "react";
import ImageGenerator from "./ImageGenerator.jsx";

export default function ImageGenModal({ title, initialPrompt, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>✦ Обложка{title ? ` · ${title}` : ""}</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <ImageGenerator initialPrompt={initialPrompt} />
        </div>
      </div>
    </div>
  );
}
