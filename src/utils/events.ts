let registeredListeners: { type: string; listener: EventListenerOrEventListenerObject }[] = [];

const userEventTypes = ['click', 'pointerdown', 'touchstart'];

export const addClickListener = (fun: EventListenerOrEventListenerObject) => {
  userEventTypes.forEach((type) => {
    window.addEventListener(type, fun);
    registeredListeners.push({ type, listener: fun });
  });
};

export const removeClickListener = (fun: EventListenerOrEventListenerObject) => {
  userEventTypes.forEach((type) => {
    window.removeEventListener(type, fun);
    registeredListeners = registeredListeners.filter(
      (listener) => listener.type !== type || listener.listener !== fun
    );
  });
};

export const removeWindowEventListeners = () => {
  registeredListeners.forEach(({ type, listener }) => {
    window.removeEventListener(type, listener);
  });
  registeredListeners = [];
};
