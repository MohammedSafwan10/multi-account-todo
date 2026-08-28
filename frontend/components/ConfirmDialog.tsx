import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  dangerous?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  dangerous = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  return (
    <div className="dialog-backdrop" onMouseDown={onCancel} role="presentation">
      <section
        aria-describedby="dialog-message"
        aria-labelledby="dialog-title"
        aria-modal="true"
        className="confirm-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button onClick={onCancel} ref={cancelButton} type="button">
            Cancel
          </button>
          <button className={dangerous ? "dialog-danger" : "dialog-confirm"} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
