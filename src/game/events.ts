export const addClickListener = (fun: EventListenerOrEventListenerObject) => {
  window.addEventListener('touchstart', fun); // must be first for mobile Safari
  window.addEventListener('pointerdown', fun);
  window.addEventListener('click', fun);
};

export const removeClickListener = (fun: EventListenerOrEventListenerObject) => {
  window.removeEventListener('touchstart', fun);
  window.removeEventListener('pointerdown', fun);
  window.removeEventListener('click', fun);
};
