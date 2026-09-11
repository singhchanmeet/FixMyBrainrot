const infoButtons = document.querySelectorAll('[data-info-dialog]');

infoButtons.forEach(button => {
  const dialog = document.getElementById(button.dataset.infoDialog);
  if (!dialog) return;

  const closeButton = dialog.querySelector('[data-dialog-close]');
  let lastFocusedElement = null;

  button.addEventListener('click', () => {
    lastFocusedElement = document.activeElement;
    dialog.showModal();
    closeButton?.focus();
  });

  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => lastFocusedElement?.focus());
});
