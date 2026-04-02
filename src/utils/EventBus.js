class EventBus {
  constructor() {
    this._listeners = {};
  }

  on(event, callback, context) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push({ callback, context });
    return this;
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(
      (l) => l.callback !== callback
    );
  }

  emit(event, ...args) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(({ callback, context }) =>
      callback.apply(context || this, args)
    );
  }

  once(event, callback, context) {
    const wrapper = (...args) => {
      callback.apply(context || this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

const bus = new EventBus();
export default bus;
