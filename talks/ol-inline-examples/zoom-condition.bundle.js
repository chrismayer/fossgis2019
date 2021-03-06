(function () {
  'use strict';

  /**
   * @module ol/util
   */

  /**
   * @return {?} Any return.
   */
  function abstract() {
    return /** @type {?} */ ((function() {
      throw new Error('Unimplemented abstract method.');
    })());
  }

  /**
   * Counter for getUid.
   * @type {number}
   * @private
   */
  var uidCounter_ = 0;

  /**
   * Gets a unique ID for an object. This mutates the object so that further calls
   * with the same object as a parameter returns the same value. Unique IDs are generated
   * as a strictly increasing sequence. Adapted from goog.getUid.
   *
   * @param {Object} obj The object to get the unique ID for.
   * @return {string} The unique ID for the object.
   * @function module:ol.getUid
   * @api
   */
  function getUid(obj) {
    return obj.ol_uid || (obj.ol_uid = String(++uidCounter_));
  }

  /**
   * OpenLayers version.
   * @type {string}
   */
  var VERSION = '5.3.1';

  /**
   * @module ol/AssertionError
   */

  /**
   * Error object thrown when an assertion failed. This is an ECMA-262 Error,
   * extended with a `code` property.
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error.
   */
  var AssertionError = /*@__PURE__*/(function (Error) {
    function AssertionError(code) {
      var path = 'v' + VERSION.split('-')[0];
      var message = 'Assertion failed. See https://openlayers.org/en/' + path +
      '/doc/errors/#' + code + ' for details.';

      Error.call(this, message);

      /**
       * Error code. The meaning of the code can be found on
       * https://openlayers.org/en/latest/doc/errors/ (replace `latest` with
       * the version found in the OpenLayers script's header comment if a version
       * other than the latest is used).
       * @type {number}
       * @api
       */
      this.code = code;

      /**
       * @type {string}
       */
      this.name = 'AssertionError';

      // Re-assign message, see https://github.com/Rich-Harris/buble/issues/40
      this.message = message;
    }

    if ( Error ) AssertionError.__proto__ = Error;
    AssertionError.prototype = Object.create( Error && Error.prototype );
    AssertionError.prototype.constructor = AssertionError;

    return AssertionError;
  }(Error));

  /**
   * @module ol/CollectionEventType
   */

  /**
   * @enum {string}
   */
  var CollectionEventType = {
    /**
     * Triggered when an item is added to the collection.
     * @event module:ol/Collection.CollectionEvent#add
     * @api
     */
    ADD: 'add',
    /**
     * Triggered when an item is removed from the collection.
     * @event module:ol/Collection.CollectionEvent#remove
     * @api
     */
    REMOVE: 'remove'
  };

  /**
   * @module ol/ObjectEventType
   */

  /**
   * @enum {string}
   */
  var ObjectEventType = {
    /**
     * Triggered when a property is changed.
     * @event module:ol/Object.ObjectEvent#propertychange
     * @api
     */
    PROPERTYCHANGE: 'propertychange'
  };

  /**
   * @module ol/obj
   */


  /**
   * Polyfill for Object.assign().  Assigns enumerable and own properties from
   * one or more source objects to a target object.
   * See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign.
   *
   * @param {!Object} target The target object.
   * @param {...Object} var_sources The source object(s).
   * @return {!Object} The modified target object.
   */
  var assign = (typeof Object.assign === 'function') ? Object.assign : function(target, var_sources) {
    var arguments$1 = arguments;

    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);
    for (var i = 1, ii = arguments.length; i < ii; ++i) {
      var source = arguments$1[i];
      if (source !== undefined && source !== null) {
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            output[key] = source[key];
          }
        }
      }
    }
    return output;
  };


  /**
   * Removes all properties from an object.
   * @param {Object} object The object to clear.
   */
  function clear(object) {
    for (var property in object) {
      delete object[property];
    }
  }


  /**
   * Get an array of property values from an object.
   * @param {Object<K,V>} object The object from which to get the values.
   * @return {!Array<V>} The property values.
   * @template K,V
   */
  function getValues(object) {
    var values = [];
    for (var property in object) {
      values.push(object[property]);
    }
    return values;
  }


  /**
   * Determine if an object has any properties.
   * @param {Object} object The object to check.
   * @return {boolean} The object is empty.
   */
  function isEmpty(object) {
    var property;
    for (property in object) {
      return false;
    }
    return !property;
  }

  /**
   * @module ol/events
   */


  /**
   * Key to use with {@link module:ol/Observable~Observable#unByKey}.
   * @typedef {Object} EventsKey
   * @property {Object} [bindTo]
   * @property {ListenerFunction} [boundListener]
   * @property {boolean} callOnce
   * @property {number} [deleteIndex]
   * @property {ListenerFunction} listener
   * @property {import("./events/Target.js").EventTargetLike} target
   * @property {string} type
   * @api
   */


  /**
   * Listener function. This function is called with an event object as argument.
   * When the function returns `false`, event propagation will stop.
   *
   * @typedef {function((Event|import("./events/Event.js").default)): (void|boolean)} ListenerFunction
   * @api
   */


  /**
   * @param {EventsKey} listenerObj Listener object.
   * @return {ListenerFunction} Bound listener.
   */
  function bindListener(listenerObj) {
    var boundListener = function(evt) {
      var listener = listenerObj.listener;
      var bindTo = listenerObj.bindTo || listenerObj.target;
      if (listenerObj.callOnce) {
        unlistenByKey(listenerObj);
      }
      return listener.call(bindTo, evt);
    };
    listenerObj.boundListener = boundListener;
    return boundListener;
  }


  /**
   * Finds the matching {@link module:ol/events~EventsKey} in the given listener
   * array.
   *
   * @param {!Array<!EventsKey>} listeners Array of listeners.
   * @param {!Function} listener The listener function.
   * @param {Object=} opt_this The `this` value inside the listener.
   * @param {boolean=} opt_setDeleteIndex Set the deleteIndex on the matching
   *     listener, for {@link module:ol/events~unlistenByKey}.
   * @return {EventsKey|undefined} The matching listener object.
   */
  function findListener(listeners, listener, opt_this, opt_setDeleteIndex) {
    var listenerObj;
    for (var i = 0, ii = listeners.length; i < ii; ++i) {
      listenerObj = listeners[i];
      if (listenerObj.listener === listener &&
          listenerObj.bindTo === opt_this) {
        if (opt_setDeleteIndex) {
          listenerObj.deleteIndex = i;
        }
        return listenerObj;
      }
    }
    return undefined;
  }


  /**
   * @param {import("./events/Target.js").EventTargetLike} target Target.
   * @param {string} type Type.
   * @return {Array<EventsKey>|undefined} Listeners.
   */
  function getListeners(target, type) {
    var listenerMap = getListenerMap(target);
    return listenerMap ? listenerMap[type] : undefined;
  }


  /**
   * Get the lookup of listeners.
   * @param {Object} target Target.
   * @param {boolean=} opt_create If a map should be created if it doesn't exist.
   * @return {!Object<string, Array<EventsKey>>} Map of
   *     listeners by event type.
   */
  function getListenerMap(target, opt_create) {
    var listenerMap = target.ol_lm;
    if (!listenerMap && opt_create) {
      listenerMap = target.ol_lm = {};
    }
    return listenerMap;
  }


  /**
   * Remove the listener map from a target.
   * @param {Object} target Target.
   */
  function removeListenerMap(target) {
    delete target.ol_lm;
  }


  /**
   * Clean up all listener objects of the given type.  All properties on the
   * listener objects will be removed, and if no listeners remain in the listener
   * map, it will be removed from the target.
   * @param {import("./events/Target.js").EventTargetLike} target Target.
   * @param {string} type Type.
   */
  function removeListeners(target, type) {
    var listeners = getListeners(target, type);
    if (listeners) {
      for (var i = 0, ii = listeners.length; i < ii; ++i) {
        /** @type {import("./events/Target.js").default} */ (target).
          removeEventListener(type, listeners[i].boundListener);
        clear(listeners[i]);
      }
      listeners.length = 0;
      var listenerMap = getListenerMap(target);
      if (listenerMap) {
        delete listenerMap[type];
        if (Object.keys(listenerMap).length === 0) {
          removeListenerMap(target);
        }
      }
    }
  }


  /**
   * Registers an event listener on an event target. Inspired by
   * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
   *
   * This function efficiently binds a `listener` to a `this` object, and returns
   * a key for use with {@link module:ol/events~unlistenByKey}.
   *
   * @param {import("./events/Target.js").EventTargetLike} target Event target.
   * @param {string} type Event type.
   * @param {ListenerFunction} listener Listener.
   * @param {Object=} opt_this Object referenced by the `this` keyword in the
   *     listener. Default is the `target`.
   * @param {boolean=} opt_once If true, add the listener as one-off listener.
   * @return {EventsKey} Unique key for the listener.
   */
  function listen(target, type, listener, opt_this, opt_once) {
    var listenerMap = getListenerMap(target, true);
    var listeners = listenerMap[type];
    if (!listeners) {
      listeners = listenerMap[type] = [];
    }
    var listenerObj = findListener(listeners, listener, opt_this, false);
    if (listenerObj) {
      if (!opt_once) {
        // Turn one-off listener into a permanent one.
        listenerObj.callOnce = false;
      }
    } else {
      listenerObj = /** @type {EventsKey} */ ({
        bindTo: opt_this,
        callOnce: !!opt_once,
        listener: listener,
        target: target,
        type: type
      });
      /** @type {import("./events/Target.js").default} */ (target).
        addEventListener(type, bindListener(listenerObj));
      listeners.push(listenerObj);
    }

    return listenerObj;
  }


  /**
   * Registers a one-off event listener on an event target. Inspired by
   * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
   *
   * This function efficiently binds a `listener` as self-unregistering listener
   * to a `this` object, and returns a key for use with
   * {@link module:ol/events~unlistenByKey} in case the listener needs to be
   * unregistered before it is called.
   *
   * When {@link module:ol/events~listen} is called with the same arguments after this
   * function, the self-unregistering listener will be turned into a permanent
   * listener.
   *
   * @param {import("./events/Target.js").EventTargetLike} target Event target.
   * @param {string} type Event type.
   * @param {ListenerFunction} listener Listener.
   * @param {Object=} opt_this Object referenced by the `this` keyword in the
   *     listener. Default is the `target`.
   * @return {EventsKey} Key for unlistenByKey.
   */
  function listenOnce(target, type, listener, opt_this) {
    return listen(target, type, listener, opt_this, true);
  }


  /**
   * Unregisters an event listener on an event target. Inspired by
   * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
   *
   * To return a listener, this function needs to be called with the exact same
   * arguments that were used for a previous {@link module:ol/events~listen} call.
   *
   * @param {import("./events/Target.js").EventTargetLike} target Event target.
   * @param {string} type Event type.
   * @param {ListenerFunction} listener Listener.
   * @param {Object=} opt_this Object referenced by the `this` keyword in the
   *     listener. Default is the `target`.
   */
  function unlisten(target, type, listener, opt_this) {
    var listeners = getListeners(target, type);
    if (listeners) {
      var listenerObj = findListener(listeners, listener, opt_this, true);
      if (listenerObj) {
        unlistenByKey(listenerObj);
      }
    }
  }


  /**
   * Unregisters event listeners on an event target. Inspired by
   * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
   *
   * The argument passed to this function is the key returned from
   * {@link module:ol/events~listen} or {@link module:ol/events~listenOnce}.
   *
   * @param {EventsKey} key The key.
   */
  function unlistenByKey(key) {
    if (key && key.target) {
      /** @type {import("./events/Target.js").default} */ (key.target).
        removeEventListener(key.type, key.boundListener);
      var listeners = getListeners(key.target, key.type);
      if (listeners) {
        var i = 'deleteIndex' in key ? key.deleteIndex : listeners.indexOf(key);
        if (i !== -1) {
          listeners.splice(i, 1);
        }
        if (listeners.length === 0) {
          removeListeners(key.target, key.type);
        }
      }
      clear(key);
    }
  }


  /**
   * Unregisters all event listeners on an event target. Inspired by
   * https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
   *
   * @param {import("./events/Target.js").EventTargetLike} target Target.
   */
  function unlistenAll(target) {
    var listenerMap = getListenerMap(target);
    if (listenerMap) {
      for (var type in listenerMap) {
        removeListeners(target, type);
      }
    }
  }

  /**
   * @module ol/Disposable
   */

  /**
   * @classdesc
   * Objects that need to clean up after themselves.
   */
  var Disposable = function Disposable() {
    /**
     * The object has already been disposed.
     * @type {boolean}
     * @private
     */
    this.disposed_ = false;
  };

  /**
   * Clean up.
   */
  Disposable.prototype.dispose = function dispose () {
    if (!this.disposed_) {
      this.disposed_ = true;
      this.disposeInternal();
    }
  };

  /**
   * Extension point for disposable objects.
   * @protected
   */
  Disposable.prototype.disposeInternal = function disposeInternal () {};

  /**
   * @module ol/functions
   */

  /**
   * Always returns true.
   * @returns {boolean} true.
   */
  function TRUE() {
    return true;
  }

  /**
   * Always returns false.
   * @returns {boolean} false.
   */
  function FALSE() {
    return false;
  }

  /**
   * A reusable function, used e.g. as a default for callbacks.
   *
   * @return {void} Nothing.
   */
  function VOID() {}

  /**
   * @module ol/events/Event
   */

  /**
   * @classdesc
   * Stripped down implementation of the W3C DOM Level 2 Event interface.
   * See https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface.
   *
   * This implementation only provides `type` and `target` properties, and
   * `stopPropagation` and `preventDefault` methods. It is meant as base class
   * for higher level events defined in the library, and works with
   * {@link module:ol/events/Target~Target}.
   */
  var Event = function Event(type) {

    /**
     * @type {boolean}
     */
    this.propagationStopped;

    /**
     * The event type.
     * @type {string}
     * @api
     */
    this.type = type;

    /**
     * The event target.
     * @type {Object}
     * @api
     */
    this.target = null;
  };

  /**
   * Stop event propagation.
   * @api
   */
  Event.prototype.preventDefault = function preventDefault () {
    this.propagationStopped = true;
  };

  /**
   * Stop event propagation.
   * @api
   */
  Event.prototype.stopPropagation = function stopPropagation () {
    this.propagationStopped = true;
  };


  /**
   * @param {Event|import("./Event.js").default} evt Event
   */
  function stopPropagation(evt) {
    evt.stopPropagation();
  }

  /**
   * @module ol/events/Target
   */


  /**
   * @typedef {EventTarget|Target} EventTargetLike
   */


  /**
   * @classdesc
   * A simplified implementation of the W3C DOM Level 2 EventTarget interface.
   * See https://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget.
   *
   * There are two important simplifications compared to the specification:
   *
   * 1. The handling of `useCapture` in `addEventListener` and
   *    `removeEventListener`. There is no real capture model.
   * 2. The handling of `stopPropagation` and `preventDefault` on `dispatchEvent`.
   *    There is no event target hierarchy. When a listener calls
   *    `stopPropagation` or `preventDefault` on an event object, it means that no
   *    more listeners after this one will be called. Same as when the listener
   *    returns false.
   */
  var Target = /*@__PURE__*/(function (Disposable) {
    function Target() {

      Disposable.call(this);

      /**
       * @private
       * @type {!Object<string, number>}
       */
      this.pendingRemovals_ = {};

      /**
       * @private
       * @type {!Object<string, number>}
       */
      this.dispatching_ = {};

      /**
       * @private
       * @type {!Object<string, Array<import("../events.js").ListenerFunction>>}
       */
      this.listeners_ = {};

    }

    if ( Disposable ) Target.__proto__ = Disposable;
    Target.prototype = Object.create( Disposable && Disposable.prototype );
    Target.prototype.constructor = Target;

    /**
     * @param {string} type Type.
     * @param {import("../events.js").ListenerFunction} listener Listener.
     */
    Target.prototype.addEventListener = function addEventListener (type, listener) {
      var listeners = this.listeners_[type];
      if (!listeners) {
        listeners = this.listeners_[type] = [];
      }
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    };

    /**
     * Dispatches an event and calls all listeners listening for events
     * of this type. The event parameter can either be a string or an
     * Object with a `type` property.
     *
     * @param {{type: string,
     *     target: (EventTargetLike|undefined),
     *     propagationStopped: (boolean|undefined)}|
     *     import("./Event.js").default|string} event Event object.
     * @return {boolean|undefined} `false` if anyone called preventDefault on the
     *     event object or if any of the listeners returned false.
     * @api
     */
    Target.prototype.dispatchEvent = function dispatchEvent (event) {
      var evt = typeof event === 'string' ? new Event(event) : event;
      var type = evt.type;
      evt.target = this;
      var listeners = this.listeners_[type];
      var propagate;
      if (listeners) {
        if (!(type in this.dispatching_)) {
          this.dispatching_[type] = 0;
          this.pendingRemovals_[type] = 0;
        }
        ++this.dispatching_[type];
        for (var i = 0, ii = listeners.length; i < ii; ++i) {
          if (listeners[i].call(this, evt) === false || evt.propagationStopped) {
            propagate = false;
            break;
          }
        }
        --this.dispatching_[type];
        if (this.dispatching_[type] === 0) {
          var pendingRemovals = this.pendingRemovals_[type];
          delete this.pendingRemovals_[type];
          while (pendingRemovals--) {
            this.removeEventListener(type, VOID);
          }
          delete this.dispatching_[type];
        }
        return propagate;
      }
    };

    /**
     * @inheritDoc
     */
    Target.prototype.disposeInternal = function disposeInternal () {
      unlistenAll(this);
    };

    /**
     * Get the listeners for a specified event type. Listeners are returned in the
     * order that they will be called in.
     *
     * @param {string} type Type.
     * @return {Array<import("../events.js").ListenerFunction>} Listeners.
     */
    Target.prototype.getListeners = function getListeners (type) {
      return this.listeners_[type];
    };

    /**
     * @param {string=} opt_type Type. If not provided,
     *     `true` will be returned if this event target has any listeners.
     * @return {boolean} Has listeners.
     */
    Target.prototype.hasListener = function hasListener (opt_type) {
      return opt_type ?
        opt_type in this.listeners_ :
        Object.keys(this.listeners_).length > 0;
    };

    /**
     * @param {string} type Type.
     * @param {import("../events.js").ListenerFunction} listener Listener.
     */
    Target.prototype.removeEventListener = function removeEventListener (type, listener) {
      var listeners = this.listeners_[type];
      if (listeners) {
        var index = listeners.indexOf(listener);
        if (type in this.pendingRemovals_) {
          // make listener a no-op, and remove later in #dispatchEvent()
          listeners[index] = VOID;
          ++this.pendingRemovals_[type];
        } else {
          listeners.splice(index, 1);
          if (listeners.length === 0) {
            delete this.listeners_[type];
          }
        }
      }
    };

    return Target;
  }(Disposable));

  /**
   * @module ol/events/EventType
   */

  /**
   * @enum {string}
   * @const
   */
  var EventType = {
    /**
     * Generic change event. Triggered when the revision counter is increased.
     * @event module:ol/events/Event~Event#change
     * @api
     */
    CHANGE: 'change',

    CLEAR: 'clear',
    CONTEXTMENU: 'contextmenu',
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    DRAGENTER: 'dragenter',
    DRAGOVER: 'dragover',
    DROP: 'drop',
    ERROR: 'error',
    KEYDOWN: 'keydown',
    KEYPRESS: 'keypress',
    LOAD: 'load',
    MOUSEDOWN: 'mousedown',
    MOUSEMOVE: 'mousemove',
    MOUSEOUT: 'mouseout',
    MOUSEUP: 'mouseup',
    MOUSEWHEEL: 'mousewheel',
    MSPOINTERDOWN: 'MSPointerDown',
    RESIZE: 'resize',
    TOUCHSTART: 'touchstart',
    TOUCHMOVE: 'touchmove',
    TOUCHEND: 'touchend',
    WHEEL: 'wheel'
  };

  /**
   * @module ol/Observable
   */

  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * An event target providing convenient methods for listener registration
   * and unregistration. A generic `change` event is always available through
   * {@link module:ol/Observable~Observable#changed}.
   *
   * @fires import("./events/Event.js").Event
   * @api
   */
  var Observable = /*@__PURE__*/(function (EventTarget) {
    function Observable() {

      EventTarget.call(this);

      /**
       * @private
       * @type {number}
       */
      this.revision_ = 0;

    }

    if ( EventTarget ) Observable.__proto__ = EventTarget;
    Observable.prototype = Object.create( EventTarget && EventTarget.prototype );
    Observable.prototype.constructor = Observable;

    /**
     * Increases the revision counter and dispatches a 'change' event.
     * @api
     */
    Observable.prototype.changed = function changed () {
      ++this.revision_;
      this.dispatchEvent(EventType.CHANGE);
    };

    /**
     * Get the version number for this object.  Each time the object is modified,
     * its version number will be incremented.
     * @return {number} Revision.
     * @api
     */
    Observable.prototype.getRevision = function getRevision () {
      return this.revision_;
    };

    /**
     * Listen for a certain type of event.
     * @param {string|Array<string>} type The event type or array of event types.
     * @param {function(?): ?} listener The listener function.
     * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
     *     called with an array of event types as the first argument, the return
     *     will be an array of keys.
     * @api
     */
    Observable.prototype.on = function on (type, listener) {
      if (Array.isArray(type)) {
        var len = type.length;
        var keys = new Array(len);
        for (var i = 0; i < len; ++i) {
          keys[i] = listen(this, type[i], listener);
        }
        return keys;
      } else {
        return listen(this, /** @type {string} */ (type), listener);
      }
    };

    /**
     * Listen once for a certain type of event.
     * @param {string|Array<string>} type The event type or array of event types.
     * @param {function(?): ?} listener The listener function.
     * @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
     *     called with an array of event types as the first argument, the return
     *     will be an array of keys.
     * @api
     */
    Observable.prototype.once = function once (type, listener) {
      if (Array.isArray(type)) {
        var len = type.length;
        var keys = new Array(len);
        for (var i = 0; i < len; ++i) {
          keys[i] = listenOnce(this, type[i], listener);
        }
        return keys;
      } else {
        return listenOnce(this, /** @type {string} */ (type), listener);
      }
    };

    /**
     * Unlisten for a certain type of event.
     * @param {string|Array<string>} type The event type or array of event types.
     * @param {function(?): ?} listener The listener function.
     * @api
     */
    Observable.prototype.un = function un (type, listener) {
      if (Array.isArray(type)) {
        for (var i = 0, ii = type.length; i < ii; ++i) {
          unlisten(this, type[i], listener);
        }
        return;
      } else {
        unlisten(this, /** @type {string} */ (type), listener);
      }
    };

    return Observable;
  }(Target));

  /**
   * @module ol/Object
   */


  /**
   * @classdesc
   * Events emitted by {@link module:ol/Object~BaseObject} instances are instances of this type.
   */
  var ObjectEvent = /*@__PURE__*/(function (Event) {
    function ObjectEvent(type, key, oldValue) {
      Event.call(this, type);

      /**
       * The name of the property whose value is changing.
       * @type {string}
       * @api
       */
      this.key = key;

      /**
       * The old value. To get the new value use `e.target.get(e.key)` where
       * `e` is the event object.
       * @type {*}
       * @api
       */
      this.oldValue = oldValue;

    }

    if ( Event ) ObjectEvent.__proto__ = Event;
    ObjectEvent.prototype = Object.create( Event && Event.prototype );
    ObjectEvent.prototype.constructor = ObjectEvent;

    return ObjectEvent;
  }(Event));


  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * Most non-trivial classes inherit from this.
   *
   * This extends {@link module:ol/Observable} with observable
   * properties, where each property is observable as well as the object as a
   * whole.
   *
   * Classes that inherit from this have pre-defined properties, to which you can
   * add your owns. The pre-defined properties are listed in this documentation as
   * 'Observable Properties', and have their own accessors; for example,
   * {@link module:ol/Map~Map} has a `target` property, accessed with
   * `getTarget()` and changed with `setTarget()`. Not all properties are however
   * settable. There are also general-purpose accessors `get()` and `set()`. For
   * example, `get('target')` is equivalent to `getTarget()`.
   *
   * The `set` accessors trigger a change event, and you can monitor this by
   * registering a listener. For example, {@link module:ol/View~View} has a
   * `center` property, so `view.on('change:center', function(evt) {...});` would
   * call the function whenever the value of the center property changes. Within
   * the function, `evt.target` would be the view, so `evt.target.getCenter()`
   * would return the new center.
   *
   * You can add your own observable properties with
   * `object.set('prop', 'value')`, and retrieve that with `object.get('prop')`.
   * You can listen for changes on that property value with
   * `object.on('change:prop', listener)`. You can get a list of all
   * properties with {@link module:ol/Object~BaseObject#getProperties}.
   *
   * Note that the observable properties are separate from standard JS properties.
   * You can, for example, give your map object a title with
   * `map.title='New title'` and with `map.set('title', 'Another title')`. The
   * first will be a `hasOwnProperty`; the second will appear in
   * `getProperties()`. Only the second is observable.
   *
   * Properties can be deleted by using the unset method. E.g.
   * object.unset('foo').
   *
   * @fires ObjectEvent
   * @api
   */
  var BaseObject = /*@__PURE__*/(function (Observable) {
    function BaseObject(opt_values) {
      Observable.call(this);

      // Call {@link module:ol/util~getUid} to ensure that the order of objects' ids is
      // the same as the order in which they were created.  This also helps to
      // ensure that object properties are always added in the same order, which
      // helps many JavaScript engines generate faster code.
      getUid(this);

      /**
       * @private
       * @type {!Object<string, *>}
       */
      this.values_ = {};

      if (opt_values !== undefined) {
        this.setProperties(opt_values);
      }
    }

    if ( Observable ) BaseObject.__proto__ = Observable;
    BaseObject.prototype = Object.create( Observable && Observable.prototype );
    BaseObject.prototype.constructor = BaseObject;

    /**
     * Gets a value.
     * @param {string} key Key name.
     * @return {*} Value.
     * @api
     */
    BaseObject.prototype.get = function get (key) {
      var value;
      if (this.values_.hasOwnProperty(key)) {
        value = this.values_[key];
      }
      return value;
    };

    /**
     * Get a list of object property names.
     * @return {Array<string>} List of property names.
     * @api
     */
    BaseObject.prototype.getKeys = function getKeys () {
      return Object.keys(this.values_);
    };

    /**
     * Get an object of all property names and values.
     * @return {Object<string, *>} Object.
     * @api
     */
    BaseObject.prototype.getProperties = function getProperties () {
      return assign({}, this.values_);
    };

    /**
     * @param {string} key Key name.
     * @param {*} oldValue Old value.
     */
    BaseObject.prototype.notify = function notify (key, oldValue) {
      var eventType;
      eventType = getChangeEventType(key);
      this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
      eventType = ObjectEventType.PROPERTYCHANGE;
      this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
    };

    /**
     * Sets a value.
     * @param {string} key Key name.
     * @param {*} value Value.
     * @param {boolean=} opt_silent Update without triggering an event.
     * @api
     */
    BaseObject.prototype.set = function set (key, value, opt_silent) {
      if (opt_silent) {
        this.values_[key] = value;
      } else {
        var oldValue = this.values_[key];
        this.values_[key] = value;
        if (oldValue !== value) {
          this.notify(key, oldValue);
        }
      }
    };

    /**
     * Sets a collection of key-value pairs.  Note that this changes any existing
     * properties and adds new ones (it does not remove any existing properties).
     * @param {Object<string, *>} values Values.
     * @param {boolean=} opt_silent Update without triggering an event.
     * @api
     */
    BaseObject.prototype.setProperties = function setProperties (values, opt_silent) {
      for (var key in values) {
        this.set(key, values[key], opt_silent);
      }
    };

    /**
     * Unsets a property.
     * @param {string} key Key name.
     * @param {boolean=} opt_silent Unset without triggering an event.
     * @api
     */
    BaseObject.prototype.unset = function unset (key, opt_silent) {
      if (key in this.values_) {
        var oldValue = this.values_[key];
        delete this.values_[key];
        if (!opt_silent) {
          this.notify(key, oldValue);
        }
      }
    };

    return BaseObject;
  }(Observable));


  /**
   * @type {Object<string, string>}
   */
  var changeEventTypeCache = {};


  /**
   * @param {string} key Key name.
   * @return {string} Change name.
   */
  function getChangeEventType(key) {
    return changeEventTypeCache.hasOwnProperty(key) ?
      changeEventTypeCache[key] :
      (changeEventTypeCache[key] = 'change:' + key);
  }

  /**
   * @module ol/Collection
   */


  /**
   * @enum {string}
   * @private
   */
  var Property = {
    LENGTH: 'length'
  };


  /**
   * @classdesc
   * Events emitted by {@link module:ol/Collection~Collection} instances are instances of this
   * type.
   */
  var CollectionEvent = /*@__PURE__*/(function (Event) {
    function CollectionEvent(type, opt_element) {
      Event.call(this, type);

      /**
       * The element that is added to or removed from the collection.
       * @type {*}
       * @api
       */
      this.element = opt_element;

    }

    if ( Event ) CollectionEvent.__proto__ = Event;
    CollectionEvent.prototype = Object.create( Event && Event.prototype );
    CollectionEvent.prototype.constructor = CollectionEvent;

    return CollectionEvent;
  }(Event));


  /**
   * @typedef {Object} Options
   * @property {boolean} [unique=false] Disallow the same item from being added to
   * the collection twice.
   */

  /**
   * @classdesc
   * An expanded version of standard JS Array, adding convenience methods for
   * manipulation. Add and remove changes to the Collection trigger a Collection
   * event. Note that this does not cover changes to the objects _within_ the
   * Collection; they trigger events on the appropriate object, not on the
   * Collection as a whole.
   *
   * @fires CollectionEvent
   *
   * @template T
   * @api
   */
  var Collection = /*@__PURE__*/(function (BaseObject) {
    function Collection(opt_array, opt_options) {

      BaseObject.call(this);

      var options = opt_options || {};

      /**
       * @private
       * @type {boolean}
       */
      this.unique_ = !!options.unique;

      /**
       * @private
       * @type {!Array<T>}
       */
      this.array_ = opt_array ? opt_array : [];

      if (this.unique_) {
        for (var i = 0, ii = this.array_.length; i < ii; ++i) {
          this.assertUnique_(this.array_[i], i);
        }
      }

      this.updateLength_();

    }

    if ( BaseObject ) Collection.__proto__ = BaseObject;
    Collection.prototype = Object.create( BaseObject && BaseObject.prototype );
    Collection.prototype.constructor = Collection;

    /**
     * Remove all elements from the collection.
     * @api
     */
    Collection.prototype.clear = function clear () {
      while (this.getLength() > 0) {
        this.pop();
      }
    };

    /**
     * Add elements to the collection.  This pushes each item in the provided array
     * to the end of the collection.
     * @param {!Array<T>} arr Array.
     * @return {Collection<T>} This collection.
     * @api
     */
    Collection.prototype.extend = function extend (arr) {
      for (var i = 0, ii = arr.length; i < ii; ++i) {
        this.push(arr[i]);
      }
      return this;
    };

    /**
     * Iterate over each element, calling the provided callback.
     * @param {function(T, number, Array<T>): *} f The function to call
     *     for every element. This function takes 3 arguments (the element, the
     *     index and the array). The return value is ignored.
     * @api
     */
    Collection.prototype.forEach = function forEach (f) {
      var array = this.array_;
      for (var i = 0, ii = array.length; i < ii; ++i) {
        f(array[i], i, array);
      }
    };

    /**
     * Get a reference to the underlying Array object. Warning: if the array
     * is mutated, no events will be dispatched by the collection, and the
     * collection's "length" property won't be in sync with the actual length
     * of the array.
     * @return {!Array<T>} Array.
     * @api
     */
    Collection.prototype.getArray = function getArray () {
      return this.array_;
    };

    /**
     * Get the element at the provided index.
     * @param {number} index Index.
     * @return {T} Element.
     * @api
     */
    Collection.prototype.item = function item (index) {
      return this.array_[index];
    };

    /**
     * Get the length of this collection.
     * @return {number} The length of the array.
     * @observable
     * @api
     */
    Collection.prototype.getLength = function getLength () {
      return this.get(Property.LENGTH);
    };

    /**
     * Insert an element at the provided index.
     * @param {number} index Index.
     * @param {T} elem Element.
     * @api
     */
    Collection.prototype.insertAt = function insertAt (index, elem) {
      if (this.unique_) {
        this.assertUnique_(elem);
      }
      this.array_.splice(index, 0, elem);
      this.updateLength_();
      this.dispatchEvent(
        new CollectionEvent(CollectionEventType.ADD, elem));
    };

    /**
     * Remove the last element of the collection and return it.
     * Return `undefined` if the collection is empty.
     * @return {T|undefined} Element.
     * @api
     */
    Collection.prototype.pop = function pop () {
      return this.removeAt(this.getLength() - 1);
    };

    /**
     * Insert the provided element at the end of the collection.
     * @param {T} elem Element.
     * @return {number} New length of the collection.
     * @api
     */
    Collection.prototype.push = function push (elem) {
      if (this.unique_) {
        this.assertUnique_(elem);
      }
      var n = this.getLength();
      this.insertAt(n, elem);
      return this.getLength();
    };

    /**
     * Remove the first occurrence of an element from the collection.
     * @param {T} elem Element.
     * @return {T|undefined} The removed element or undefined if none found.
     * @api
     */
    Collection.prototype.remove = function remove (elem) {
      var arr = this.array_;
      for (var i = 0, ii = arr.length; i < ii; ++i) {
        if (arr[i] === elem) {
          return this.removeAt(i);
        }
      }
      return undefined;
    };

    /**
     * Remove the element at the provided index and return it.
     * Return `undefined` if the collection does not contain this index.
     * @param {number} index Index.
     * @return {T|undefined} Value.
     * @api
     */
    Collection.prototype.removeAt = function removeAt (index) {
      var prev = this.array_[index];
      this.array_.splice(index, 1);
      this.updateLength_();
      this.dispatchEvent(new CollectionEvent(CollectionEventType.REMOVE, prev));
      return prev;
    };

    /**
     * Set the element at the provided index.
     * @param {number} index Index.
     * @param {T} elem Element.
     * @api
     */
    Collection.prototype.setAt = function setAt (index, elem) {
      var n = this.getLength();
      if (index < n) {
        if (this.unique_) {
          this.assertUnique_(elem, index);
        }
        var prev = this.array_[index];
        this.array_[index] = elem;
        this.dispatchEvent(
          new CollectionEvent(CollectionEventType.REMOVE, prev));
        this.dispatchEvent(
          new CollectionEvent(CollectionEventType.ADD, elem));
      } else {
        for (var j = n; j < index; ++j) {
          this.insertAt(j, undefined);
        }
        this.insertAt(index, elem);
      }
    };

    /**
     * @private
     */
    Collection.prototype.updateLength_ = function updateLength_ () {
      this.set(Property.LENGTH, this.array_.length);
    };

    /**
     * @private
     * @param {T} elem Element.
     * @param {number=} opt_except Optional index to ignore.
     */
    Collection.prototype.assertUnique_ = function assertUnique_ (elem, opt_except) {
      for (var i = 0, ii = this.array_.length; i < ii; ++i) {
        if (this.array_[i] === elem && i !== opt_except) {
          throw new AssertionError(58);
        }
      }
    };

    return Collection;
  }(BaseObject));

  /**
   * @module ol/MapEvent
   */

  /**
   * @classdesc
   * Events emitted as map events are instances of this type.
   * See {@link module:ol/PluggableMap~PluggableMap} for which events trigger a map event.
   */
  var MapEvent = /*@__PURE__*/(function (Event) {
    function MapEvent(type, map, opt_frameState) {

      Event.call(this, type);

      /**
       * The map where the event occurred.
       * @type {import("./PluggableMap.js").default}
       * @api
       */
      this.map = map;

      /**
       * The frame state at the time of the event.
       * @type {?import("./PluggableMap.js").FrameState}
       * @api
       */
      this.frameState = opt_frameState !== undefined ? opt_frameState : null;

    }

    if ( Event ) MapEvent.__proto__ = Event;
    MapEvent.prototype = Object.create( Event && Event.prototype );
    MapEvent.prototype.constructor = MapEvent;

    return MapEvent;
  }(Event));

  /**
   * @module ol/MapBrowserEvent
   */

  /**
   * @classdesc
   * Events emitted as map browser events are instances of this type.
   * See {@link module:ol/PluggableMap~PluggableMap} for which events trigger a map browser event.
   */
  var MapBrowserEvent = /*@__PURE__*/(function (MapEvent) {
    function MapBrowserEvent(type, map, browserEvent, opt_dragging, opt_frameState) {

      MapEvent.call(this, type, map, opt_frameState);

      /**
       * The original browser event.
       * @const
       * @type {Event}
       * @api
       */
      this.originalEvent = browserEvent;

      /**
       * The map pixel relative to the viewport corresponding to the original browser event.
       * @type {import("./pixel.js").Pixel}
       * @api
       */
      this.pixel = map.getEventPixel(browserEvent);

      /**
       * The coordinate in view projection corresponding to the original browser event.
       * @type {import("./coordinate.js").Coordinate}
       * @api
       */
      this.coordinate = map.getCoordinateFromPixel(this.pixel);

      /**
       * Indicates if the map is currently being dragged. Only set for
       * `POINTERDRAG` and `POINTERMOVE` events. Default is `false`.
       *
       * @type {boolean}
       * @api
       */
      this.dragging = opt_dragging !== undefined ? opt_dragging : false;

    }

    if ( MapEvent ) MapBrowserEvent.__proto__ = MapEvent;
    MapBrowserEvent.prototype = Object.create( MapEvent && MapEvent.prototype );
    MapBrowserEvent.prototype.constructor = MapBrowserEvent;

    /**
     * Prevents the default browser action.
     * See https://developer.mozilla.org/en-US/docs/Web/API/event.preventDefault.
     * @override
     * @api
     */
    MapBrowserEvent.prototype.preventDefault = function preventDefault () {
      MapEvent.prototype.preventDefault.call(this);
      this.originalEvent.preventDefault();
    };

    /**
     * Prevents further propagation of the current event.
     * See https://developer.mozilla.org/en-US/docs/Web/API/event.stopPropagation.
     * @override
     * @api
     */
    MapBrowserEvent.prototype.stopPropagation = function stopPropagation () {
      MapEvent.prototype.stopPropagation.call(this);
      this.originalEvent.stopPropagation();
    };

    return MapBrowserEvent;
  }(MapEvent));

  /**
   * @module ol/webgl
   */


  /** end of goog.webgl constants
   */


  /**
   * @const
   * @type {Array<string>}
   */
  var CONTEXT_IDS = [
    'experimental-webgl',
    'webgl',
    'webkit-3d',
    'moz-webgl'
  ];


  /**
   * @param {HTMLCanvasElement} canvas Canvas.
   * @param {Object=} opt_attributes Attributes.
   * @return {WebGLRenderingContext} WebGL rendering context.
   */
  function getContext(canvas, opt_attributes) {
    var ii = CONTEXT_IDS.length;
    for (var i = 0; i < ii; ++i) {
      try {
        var context = canvas.getContext(CONTEXT_IDS[i], opt_attributes);
        if (context) {
          return /** @type {!WebGLRenderingContext} */ (context);
        }
      } catch (e) {
        // pass
      }
    }
    return null;
  }


  /**
   * The maximum supported WebGL texture size in pixels. If WebGL is not
   * supported, the value is set to `undefined`.
   * @type {number|undefined}
   */
  var MAX_TEXTURE_SIZE; // value is set below


  /**
   * List of supported WebGL extensions.
   * @type {Array<string>}
   */
  var EXTENSIONS; // value is set below

  //TODO Remove side effects
  if (typeof window !== 'undefined' && 'WebGLRenderingContext' in window) {
    try {
      var canvas = /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
      var gl = getContext(canvas, {failIfMajorPerformanceCaveat: true});
      if (gl) {
        MAX_TEXTURE_SIZE = /** @type {number} */ (gl.getParameter(gl.MAX_TEXTURE_SIZE));
        EXTENSIONS = gl.getSupportedExtensions();
      }
    } catch (e) {
      // pass
    }
  }

  /**
   * @module ol/has
   */

  var ua = typeof navigator !== 'undefined' ?
    navigator.userAgent.toLowerCase() : '';

  /**
   * User agent string says we are dealing with Firefox as browser.
   * @type {boolean}
   */
  var FIREFOX = ua.indexOf('firefox') !== -1;

  /**
   * User agent string says we are dealing with Safari as browser.
   * @type {boolean}
   */
  var SAFARI = ua.indexOf('safari') !== -1 && ua.indexOf('chrom') == -1;

  /**
   * User agent string says we are dealing with a WebKit engine.
   * @type {boolean}
   */
  var WEBKIT = ua.indexOf('webkit') !== -1 && ua.indexOf('edge') == -1;

  /**
   * User agent string says we are dealing with a Mac as platform.
   * @type {boolean}
   */
  var MAC = ua.indexOf('macintosh') !== -1;


  /**
   * The ratio between physical pixels and device-independent pixels
   * (dips) on the device (`window.devicePixelRatio`).
   * @const
   * @type {number}
   * @api
   */
  var DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;


  /**
   * True if the browser's Canvas implementation implements {get,set}LineDash.
   * @type {boolean}
   */
  var CANVAS_LINE_DASH = function() {
    var has = false;
    try {
      has = !!document.createElement('canvas').getContext('2d').setLineDash;
    } catch (e) {
      // pass
    }
    return has;
  }();


  /**
   * True if browser supports touch events.
   * @const
   * @type {boolean}
   * @api
   */
  var TOUCH = 'ontouchstart' in window;


  /**
   * True if browser supports pointer events.
   * @const
   * @type {boolean}
   */
  var POINTER = 'PointerEvent' in window;


  /**
   * True if browser supports ms pointer events (IE 10).
   * @const
   * @type {boolean}
   */
  var MSPOINTER = !!(navigator.msPointerEnabled);

  /**
   * @module ol/MapBrowserEventType
   */

  /**
   * Constants for event names.
   * @enum {string}
   */
  var MapBrowserEventType = {

    /**
     * A true single click with no dragging and no double click. Note that this
     * event is delayed by 250 ms to ensure that it is not a double click.
     * @event module:ol/MapBrowserEvent~MapBrowserEvent#singleclick
     * @api
     */
    SINGLECLICK: 'singleclick',

    /**
     * A click with no dragging. A double click will fire two of this.
     * @event module:ol/MapBrowserEvent~MapBrowserEvent#click
     * @api
     */
    CLICK: EventType.CLICK,

    /**
     * A true double click, with no dragging.
     * @event module:ol/MapBrowserEvent~MapBrowserEvent#dblclick
     * @api
     */
    DBLCLICK: EventType.DBLCLICK,

    /**
     * Triggered when a pointer is dragged.
     * @event module:ol/MapBrowserEvent~MapBrowserEvent#pointerdrag
     * @api
     */
    POINTERDRAG: 'pointerdrag',

    /**
     * Triggered when a pointer is moved. Note that on touch devices this is
     * triggered when the map is panned, so is not the same as mousemove.
     * @event module:ol/MapBrowserEvent~MapBrowserEvent#pointermove
     * @api
     */
    POINTERMOVE: 'pointermove',

    POINTERDOWN: 'pointerdown',
    POINTERUP: 'pointerup',
    POINTEROVER: 'pointerover',
    POINTEROUT: 'pointerout',
    POINTERENTER: 'pointerenter',
    POINTERLEAVE: 'pointerleave',
    POINTERCANCEL: 'pointercancel'
  };

  /**
   * @module ol/MapBrowserPointerEvent
   */

  var MapBrowserPointerEvent = /*@__PURE__*/(function (MapBrowserEvent) {
    function MapBrowserPointerEvent(type, map, pointerEvent, opt_dragging, opt_frameState) {

      MapBrowserEvent.call(this, type, map, pointerEvent.originalEvent, opt_dragging, opt_frameState);

      /**
       * @const
       * @type {import("./pointer/PointerEvent.js").default}
       */
      this.pointerEvent = pointerEvent;

    }

    if ( MapBrowserEvent ) MapBrowserPointerEvent.__proto__ = MapBrowserEvent;
    MapBrowserPointerEvent.prototype = Object.create( MapBrowserEvent && MapBrowserEvent.prototype );
    MapBrowserPointerEvent.prototype.constructor = MapBrowserPointerEvent;

    return MapBrowserPointerEvent;
  }(MapBrowserEvent));

  /**
   * @module ol/pointer/EventType
   */

  /**
   * Constants for event names.
   * @enum {string}
   */
  var PointerEventType = {
    POINTERMOVE: 'pointermove',
    POINTERDOWN: 'pointerdown',
    POINTERUP: 'pointerup',
    POINTEROVER: 'pointerover',
    POINTEROUT: 'pointerout',
    POINTERENTER: 'pointerenter',
    POINTERLEAVE: 'pointerleave',
    POINTERCANCEL: 'pointercancel'
  };

  /**
   * @module ol/pointer/EventSource
   */

  var EventSource = function EventSource(dispatcher, mapping) {

    /**
     * @type {import("./PointerEventHandler.js").default}
     */
    this.dispatcher = dispatcher;

    /**
     * @private
     * @const
     * @type {!Object<string, function(Event)>}
     */
    this.mapping_ = mapping;
  };

  /**
   * List of events supported by this source.
   * @return {Array<string>} Event names
   */
  EventSource.prototype.getEvents = function getEvents () {
    return Object.keys(this.mapping_);
  };

  /**
   * Returns the handler that should handle a given event type.
   * @param {string} eventType The event type.
   * @return {function(Event)} Handler
   */
  EventSource.prototype.getHandlerForEvent = function getHandlerForEvent (eventType) {
    return this.mapping_[eventType];
  };

  /**
   * @module ol/pointer/MouseSource
   */


  /**
   * @type {number}
   */
  var POINTER_ID = 1;


  /**
   * @type {string}
   */
  var POINTER_TYPE = 'mouse';


  /**
   * Radius around touchend that swallows mouse events.
   *
   * @type {number}
   */
  var DEDUP_DIST = 25;

  /**
   * Handler for `mousedown`.
   *
   * @this {MouseSource}
   * @param {MouseEvent} inEvent The in event.
   */
  function mousedown(inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      // TODO(dfreedman) workaround for some elements not sending mouseup
      // http://crbug/149091
      if (POINTER_ID.toString() in this.pointerMap) {
        this.cancel(inEvent);
      }
      var e = prepareEvent(inEvent, this.dispatcher);
      this.pointerMap[POINTER_ID.toString()] = inEvent;
      this.dispatcher.down(e, inEvent);
    }
  }

  /**
   * Handler for `mousemove`.
   *
   * @this {MouseSource}
   * @param {MouseEvent} inEvent The in event.
   */
  function mousemove(inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      var e = prepareEvent(inEvent, this.dispatcher);
      this.dispatcher.move(e, inEvent);
    }
  }

  /**
   * Handler for `mouseup`.
   *
   * @this {MouseSource}
   * @param {MouseEvent} inEvent The in event.
   */
  function mouseup(inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      var p = this.pointerMap[POINTER_ID.toString()];

      if (p && p.button === inEvent.button) {
        var e = prepareEvent(inEvent, this.dispatcher);
        this.dispatcher.up(e, inEvent);
        this.cleanupMouse();
      }
    }
  }

  /**
   * Handler for `mouseover`.
   *
   * @this {MouseSource}
   * @param {MouseEvent} inEvent The in event.
   */
  function mouseover(inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      var e = prepareEvent(inEvent, this.dispatcher);
      this.dispatcher.enterOver(e, inEvent);
    }
  }

  /**
   * Handler for `mouseout`.
   *
   * @this {MouseSource}
   * @param {MouseEvent} inEvent The in event.
   */
  function mouseout(inEvent) {
    if (!this.isEventSimulatedFromTouch_(inEvent)) {
      var e = prepareEvent(inEvent, this.dispatcher);
      this.dispatcher.leaveOut(e, inEvent);
    }
  }


  var MouseSource = /*@__PURE__*/(function (EventSource) {
    function MouseSource(dispatcher) {
      var mapping = {
        'mousedown': mousedown,
        'mousemove': mousemove,
        'mouseup': mouseup,
        'mouseover': mouseover,
        'mouseout': mouseout
      };
      EventSource.call(this, dispatcher, mapping);

      /**
       * @const
       * @type {!Object<string, Event|Object>}
       */
      this.pointerMap = dispatcher.pointerMap;

      /**
       * @const
       * @type {Array<import("../pixel.js").Pixel>}
       */
      this.lastTouches = [];
    }

    if ( EventSource ) MouseSource.__proto__ = EventSource;
    MouseSource.prototype = Object.create( EventSource && EventSource.prototype );
    MouseSource.prototype.constructor = MouseSource;

    /**
     * Detect if a mouse event was simulated from a touch by
     * checking if previously there was a touch event at the
     * same position.
     *
     * FIXME - Known problem with the native Android browser on
     * Samsung GT-I9100 (Android 4.1.2):
     * In case the page is scrolled, this function does not work
     * correctly when a canvas is used (WebGL or canvas renderer).
     * Mouse listeners on canvas elements (for this browser), create
     * two mouse events: One 'good' and one 'bad' one (on other browsers or
     * when a div is used, there is only one event). For the 'bad' one,
     * clientX/clientY and also pageX/pageY are wrong when the page
     * is scrolled. Because of that, this function can not detect if
     * the events were simulated from a touch event. As result, a
     * pointer event at a wrong position is dispatched, which confuses
     * the map interactions.
     * It is unclear, how one can get the correct position for the event
     * or detect that the positions are invalid.
     *
     * @private
     * @param {MouseEvent} inEvent The in event.
     * @return {boolean} True, if the event was generated by a touch.
     */
    MouseSource.prototype.isEventSimulatedFromTouch_ = function isEventSimulatedFromTouch_ (inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX;
      var y = inEvent.clientY;
      for (var i = 0, l = lts.length, t = (void 0); i < l && (t = lts[i]); i++) {
        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t[0]);
        var dy = Math.abs(y - t[1]);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
      return false;
    };

    /**
     * Dispatches a `pointercancel` event.
     *
     * @param {Event} inEvent The in event.
     */
    MouseSource.prototype.cancel = function cancel (inEvent) {
      var e = prepareEvent(inEvent, this.dispatcher);
      this.dispatcher.cancel(e, inEvent);
      this.cleanupMouse();
    };

    /**
     * Remove the mouse from the list of active pointers.
     */
    MouseSource.prototype.cleanupMouse = function cleanupMouse () {
      delete this.pointerMap[POINTER_ID.toString()];
    };

    return MouseSource;
  }(EventSource));


  /**
   * Creates a copy of the original event that will be used
   * for the fake pointer event.
   *
   * @param {Event} inEvent The in event.
   * @param {import("./PointerEventHandler.js").default} dispatcher Event handler.
   * @return {Object} The copied event.
   */
  function prepareEvent(inEvent, dispatcher) {
    var e = dispatcher.cloneEvent(inEvent, inEvent);

    // forward mouse preventDefault
    var pd = e.preventDefault;
    e.preventDefault = function() {
      inEvent.preventDefault();
      pd();
    };

    e.pointerId = POINTER_ID;
    e.isPrimary = true;
    e.pointerType = POINTER_TYPE;

    return e;
  }

  /**
   * @module ol/pointer/MsSource
   */


  /**
   * @const
   * @type {Array<string>}
   */
  var POINTER_TYPES = [
    '',
    'unavailable',
    'touch',
    'pen',
    'mouse'
  ];

  /**
   * Handler for `msPointerDown`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msPointerDown(inEvent) {
    this.pointerMap[inEvent.pointerId.toString()] = inEvent;
    var e = this.prepareEvent_(inEvent);
    this.dispatcher.down(e, inEvent);
  }

  /**
   * Handler for `msPointerMove`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msPointerMove(inEvent) {
    var e = this.prepareEvent_(inEvent);
    this.dispatcher.move(e, inEvent);
  }

  /**
   * Handler for `msPointerUp`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msPointerUp(inEvent) {
    var e = this.prepareEvent_(inEvent);
    this.dispatcher.up(e, inEvent);
    this.cleanup(inEvent.pointerId);
  }

  /**
   * Handler for `msPointerOut`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msPointerOut(inEvent) {
    var e = this.prepareEvent_(inEvent);
    this.dispatcher.leaveOut(e, inEvent);
  }

  /**
   * Handler for `msPointerOver`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msPointerOver(inEvent) {
    var e = this.prepareEvent_(inEvent);
    this.dispatcher.enterOver(e, inEvent);
  }

  /**
   * Handler for `msPointerCancel`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msPointerCancel(inEvent) {
    var e = this.prepareEvent_(inEvent);
    this.dispatcher.cancel(e, inEvent);
    this.cleanup(inEvent.pointerId);
  }

  /**
   * Handler for `msLostPointerCapture`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msLostPointerCapture(inEvent) {
    var e = this.dispatcher.makeEvent('lostpointercapture', inEvent, inEvent);
    this.dispatcher.dispatchEvent(e);
  }

  /**
   * Handler for `msGotPointerCapture`.
   *
   * @this {MsSource}
   * @param {MSPointerEvent} inEvent The in event.
   */
  function msGotPointerCapture(inEvent) {
    var e = this.dispatcher.makeEvent('gotpointercapture', inEvent, inEvent);
    this.dispatcher.dispatchEvent(e);
  }

  var MsSource = /*@__PURE__*/(function (EventSource) {
    function MsSource(dispatcher) {
      var mapping = {
        'MSPointerDown': msPointerDown,
        'MSPointerMove': msPointerMove,
        'MSPointerUp': msPointerUp,
        'MSPointerOut': msPointerOut,
        'MSPointerOver': msPointerOver,
        'MSPointerCancel': msPointerCancel,
        'MSGotPointerCapture': msGotPointerCapture,
        'MSLostPointerCapture': msLostPointerCapture
      };
      EventSource.call(this, dispatcher, mapping);

      /**
       * @const
       * @type {!Object<string, MSPointerEvent|Object>}
       */
      this.pointerMap = dispatcher.pointerMap;
    }

    if ( EventSource ) MsSource.__proto__ = EventSource;
    MsSource.prototype = Object.create( EventSource && EventSource.prototype );
    MsSource.prototype.constructor = MsSource;

    /**
     * Creates a copy of the original event that will be used
     * for the fake pointer event.
     *
     * @private
     * @param {MSPointerEvent} inEvent The in event.
     * @return {Object} The copied event.
     */
    MsSource.prototype.prepareEvent_ = function prepareEvent_ (inEvent) {
      /** @type {MSPointerEvent|Object} */
      var e = inEvent;
      if (typeof inEvent.pointerType === 'number') {
        e = this.dispatcher.cloneEvent(inEvent, inEvent);
        e.pointerType = POINTER_TYPES[inEvent.pointerType];
      }

      return e;
    };

    /**
     * Remove this pointer from the list of active pointers.
     * @param {number} pointerId Pointer identifier.
     */
    MsSource.prototype.cleanup = function cleanup (pointerId) {
      delete this.pointerMap[pointerId.toString()];
    };

    return MsSource;
  }(EventSource));

  /**
   * @module ol/pointer/NativeSource
   */

  /**
   * Handler for `pointerdown`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function pointerDown(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `pointermove`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function pointerMove(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `pointerup`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function pointerUp(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `pointerout`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function pointerOut(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `pointerover`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function pointerOver(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `pointercancel`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function pointerCancel(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `lostpointercapture`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function lostPointerCapture(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  /**
   * Handler for `gotpointercapture`.
   *
   * @this {NativeSource}
   * @param {Event} inEvent The in event.
   */
  function gotPointerCapture(inEvent) {
    this.dispatcher.fireNativeEvent(inEvent);
  }

  var NativeSource = /*@__PURE__*/(function (EventSource) {
    function NativeSource(dispatcher) {
      var mapping = {
        'pointerdown': pointerDown,
        'pointermove': pointerMove,
        'pointerup': pointerUp,
        'pointerout': pointerOut,
        'pointerover': pointerOver,
        'pointercancel': pointerCancel,
        'gotpointercapture': gotPointerCapture,
        'lostpointercapture': lostPointerCapture
      };
      EventSource.call(this, dispatcher, mapping);
    }

    if ( EventSource ) NativeSource.__proto__ = EventSource;
    NativeSource.prototype = Object.create( EventSource && EventSource.prototype );
    NativeSource.prototype.constructor = NativeSource;

    return NativeSource;
  }(EventSource));

  /**
   * @module ol/pointer/PointerEvent
   */


  /**
   * Is the `buttons` property supported?
   * @type {boolean}
   */
  var HAS_BUTTONS = false;


  var PointerEvent = /*@__PURE__*/(function (_Event) {
    function PointerEvent(type, originalEvent, opt_eventDict) {
      _Event.call(this, type);

      /**
       * @const
       * @type {Event}
       */
      this.originalEvent = originalEvent;

      var eventDict = opt_eventDict ? opt_eventDict : {};

      /**
       * @type {number}
       */
      this.buttons = getButtons(eventDict);

      /**
       * @type {number}
       */
      this.pressure = getPressure(eventDict, this.buttons);

      // MouseEvent related properties

      /**
       * @type {boolean}
       */
      this.bubbles = 'bubbles' in eventDict ? eventDict['bubbles'] : false;

      /**
       * @type {boolean}
       */
      this.cancelable = 'cancelable' in eventDict ? eventDict['cancelable'] : false;

      /**
       * @type {Object}
       */
      this.view = 'view' in eventDict ? eventDict['view'] : null;

      /**
       * @type {number}
       */
      this.detail = 'detail' in eventDict ? eventDict['detail'] : null;

      /**
       * @type {number}
       */
      this.screenX = 'screenX' in eventDict ? eventDict['screenX'] : 0;

      /**
       * @type {number}
       */
      this.screenY = 'screenY' in eventDict ? eventDict['screenY'] : 0;

      /**
       * @type {number}
       */
      this.clientX = 'clientX' in eventDict ? eventDict['clientX'] : 0;

      /**
       * @type {number}
       */
      this.clientY = 'clientY' in eventDict ? eventDict['clientY'] : 0;

      /**
       * @type {boolean}
       */
      this.ctrlKey = 'ctrlKey' in eventDict ? eventDict['ctrlKey'] : false;

      /**
       * @type {boolean}
       */
      this.altKey = 'altKey' in eventDict ? eventDict['altKey'] : false;

      /**
       * @type {boolean}
       */
      this.shiftKey = 'shiftKey' in eventDict ? eventDict['shiftKey'] : false;

      /**
       * @type {boolean}
       */
      this.metaKey = 'metaKey' in eventDict ? eventDict['metaKey'] : false;

      /**
       * @type {number}
       */
      this.button = 'button' in eventDict ? eventDict['button'] : 0;

      /**
       * @type {Node}
       */
      this.relatedTarget = 'relatedTarget' in eventDict ?
        eventDict['relatedTarget'] : null;

      // PointerEvent related properties

      /**
       * @const
       * @type {number}
       */
      this.pointerId = 'pointerId' in eventDict ? eventDict['pointerId'] : 0;

      /**
       * @type {number}
       */
      this.width = 'width' in eventDict ? eventDict['width'] : 0;

      /**
       * @type {number}
       */
      this.height = 'height' in eventDict ? eventDict['height'] : 0;

      /**
       * @type {number}
       */
      this.tiltX = 'tiltX' in eventDict ? eventDict['tiltX'] : 0;

      /**
       * @type {number}
       */
      this.tiltY = 'tiltY' in eventDict ? eventDict['tiltY'] : 0;

      /**
       * @type {string}
       */
      this.pointerType = 'pointerType' in eventDict ? eventDict['pointerType'] : '';

      /**
       * @type {number}
       */
      this.hwTimestamp = 'hwTimestamp' in eventDict ? eventDict['hwTimestamp'] : 0;

      /**
       * @type {boolean}
       */
      this.isPrimary = 'isPrimary' in eventDict ? eventDict['isPrimary'] : false;

      // keep the semantics of preventDefault
      if (originalEvent.preventDefault) {
        this.preventDefault = function() {
          originalEvent.preventDefault();
        };
      }
    }

    if ( _Event ) PointerEvent.__proto__ = _Event;
    PointerEvent.prototype = Object.create( _Event && _Event.prototype );
    PointerEvent.prototype.constructor = PointerEvent;

    return PointerEvent;
  }(Event));


  /**
   * @param {Object<string, ?>} eventDict The event dictionary.
   * @return {number} Button indicator.
   */
  function getButtons(eventDict) {
    // According to the w3c spec,
    // http://www.w3.org/TR/DOM-Level-3-Events/#events-MouseEvent-button
    // MouseEvent.button == 0 can mean either no mouse button depressed, or the
    // left mouse button depressed.
    //
    // As of now, the only way to distinguish between the two states of
    // MouseEvent.button is by using the deprecated MouseEvent.which property, as
    // this maps mouse buttons to positive integers > 0, and uses 0 to mean that
    // no mouse button is held.
    //
    // MouseEvent.which is derived from MouseEvent.button at MouseEvent creation,
    // but initMouseEvent does not expose an argument with which to set
    // MouseEvent.which. Calling initMouseEvent with a buttonArg of 0 will set
    // MouseEvent.button == 0 and MouseEvent.which == 1, breaking the expectations
    // of app developers.
    //
    // The only way to propagate the correct state of MouseEvent.which and
    // MouseEvent.button to a new MouseEvent.button == 0 and MouseEvent.which == 0
    // is to call initMouseEvent with a buttonArg value of -1.
    //
    // This is fixed with DOM Level 4's use of buttons
    var buttons;
    if (eventDict.buttons || HAS_BUTTONS) {
      buttons = eventDict.buttons;
    } else {
      switch (eventDict.which) {
        case 1: buttons = 1; break;
        case 2: buttons = 4; break;
        case 3: buttons = 2; break;
        default: buttons = 0;
      }
    }
    return buttons;
  }


  /**
   * @param {Object<string, ?>} eventDict The event dictionary.
   * @param {number} buttons Button indicator.
   * @return {number} The pressure.
   */
  function getPressure(eventDict, buttons) {
    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;
    if (eventDict.pressure) {
      pressure = eventDict.pressure;
    } else {
      pressure = buttons ? 0.5 : 0;
    }
    return pressure;
  }


  /**
   * Checks if the `buttons` property is supported.
   */
  (function() {
    try {
      var ev = new MouseEvent('click', {buttons: 1});
      HAS_BUTTONS = ev.buttons === 1;
    } catch (e) {
      // pass
    }
  })();

  /**
   * @module ol/array
   */


  /**
   * Compare function for array sort that is safe for numbers.
   * @param {*} a The first object to be compared.
   * @param {*} b The second object to be compared.
   * @return {number} A negative number, zero, or a positive number as the first
   *     argument is less than, equal to, or greater than the second.
   */
  function numberSafeCompareFunction(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }


  /**
   * Whether the array contains the given object.
   * @param {Array<*>} arr The array to test for the presence of the element.
   * @param {*} obj The object for which to test.
   * @return {boolean} The object is in the array.
   */
  function includes(arr, obj) {
    return arr.indexOf(obj) >= 0;
  }


  /**
   * @param {Array<number>} arr Array.
   * @param {number} target Target.
   * @param {number} direction 0 means return the nearest, > 0
   *    means return the largest nearest, < 0 means return the
   *    smallest nearest.
   * @return {number} Index.
   */
  function linearFindNearest(arr, target, direction) {
    var n = arr.length;
    if (arr[0] <= target) {
      return 0;
    } else if (target <= arr[n - 1]) {
      return n - 1;
    } else {
      var i;
      if (direction > 0) {
        for (i = 1; i < n; ++i) {
          if (arr[i] < target) {
            return i - 1;
          }
        }
      } else if (direction < 0) {
        for (i = 1; i < n; ++i) {
          if (arr[i] <= target) {
            return i;
          }
        }
      } else {
        for (i = 1; i < n; ++i) {
          if (arr[i] == target) {
            return i;
          } else if (arr[i] < target) {
            if (arr[i - 1] - target < target - arr[i]) {
              return i - 1;
            } else {
              return i;
            }
          }
        }
      }
      return n - 1;
    }
  }


  /**
   * @param {Array<*>} arr Array.
   * @param {number} begin Begin index.
   * @param {number} end End index.
   */
  function reverseSubArray(arr, begin, end) {
    while (begin < end) {
      var tmp = arr[begin];
      arr[begin] = arr[end];
      arr[end] = tmp;
      ++begin;
      --end;
    }
  }


  /**
   * @param {Array<VALUE>} arr The array to modify.
   * @param {!Array<VALUE>|VALUE} data The elements or arrays of elements to add to arr.
   * @template VALUE
   */
  function extend(arr, data) {
    var extension = Array.isArray(data) ? data : [data];
    var length = extension.length;
    for (var i = 0; i < length; i++) {
      arr[arr.length] = extension[i];
    }
  }


  /**
   * @param {Array<VALUE>} arr The array to modify.
   * @param {VALUE} obj The element to remove.
   * @template VALUE
   * @return {boolean} If the element was removed.
   */
  function remove(arr, obj) {
    var i = arr.indexOf(obj);
    var found = i > -1;
    if (found) {
      arr.splice(i, 1);
    }
    return found;
  }


  /**
   * @param {Array|Uint8ClampedArray} arr1 The first array to compare.
   * @param {Array|Uint8ClampedArray} arr2 The second array to compare.
   * @return {boolean} Whether the two arrays are equal.
   */
  function equals(arr1, arr2) {
    var len1 = arr1.length;
    if (len1 !== arr2.length) {
      return false;
    }
    for (var i = 0; i < len1; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }


  /**
   * Sort the passed array such that the relative order of equal elements is preverved.
   * See https://en.wikipedia.org/wiki/Sorting_algorithm#Stability for details.
   * @param {Array<*>} arr The array to sort (modifies original).
   * @param {!function(*, *): number} compareFnc Comparison function.
   * @api
   */
  function stableSort(arr, compareFnc) {
    var length = arr.length;
    var tmp = Array(arr.length);
    var i;
    for (i = 0; i < length; i++) {
      tmp[i] = {index: i, value: arr[i]};
    }
    tmp.sort(function(a, b) {
      return compareFnc(a.value, b.value) || a.index - b.index;
    });
    for (i = 0; i < arr.length; i++) {
      arr[i] = tmp[i].value;
    }
  }


  /**
   * @param {Array<*>} arr The array to test.
   * @param {Function=} opt_func Comparison function.
   * @param {boolean=} opt_strict Strictly sorted (default false).
   * @return {boolean} Return index.
   */
  function isSorted(arr, opt_func, opt_strict) {
    var compare = opt_func || numberSafeCompareFunction;
    return arr.every(function(currentVal, index) {
      if (index === 0) {
        return true;
      }
      var res = compare(arr[index - 1], currentVal);
      return !(res > 0 || opt_strict && res === 0);
    });
  }

  /**
   * @module ol/pointer/TouchSource
   */


  /**
   * @type {number}
   */
  var CLICK_COUNT_TIMEOUT = 200;

  /**
   * @type {string}
   */
  var POINTER_TYPE$1 = 'touch';

  /**
   * Handler for `touchstart`, triggers `pointerover`,
   * `pointerenter` and `pointerdown` events.
   *
   * @this {TouchSource}
   * @param {TouchEvent} inEvent The in event.
   */
  function touchstart(inEvent) {
    this.vacuumTouches_(inEvent);
    this.setPrimaryTouch_(inEvent.changedTouches[0]);
    this.dedupSynthMouse_(inEvent);
    this.clickCount_++;
    this.processTouches_(inEvent, this.overDown_);
  }

  /**
   * Handler for `touchmove`.
   *
   * @this {TouchSource}
   * @param {TouchEvent} inEvent The in event.
   */
  function touchmove(inEvent) {
    this.processTouches_(inEvent, this.moveOverOut_);
  }

  /**
   * Handler for `touchend`, triggers `pointerup`,
   * `pointerout` and `pointerleave` events.
   *
   * @this {TouchSource}
   * @param {TouchEvent} inEvent The event.
   */
  function touchend(inEvent) {
    this.dedupSynthMouse_(inEvent);
    this.processTouches_(inEvent, this.upOut_);
  }

  /**
   * Handler for `touchcancel`, triggers `pointercancel`,
   * `pointerout` and `pointerleave` events.
   *
   * @this {TouchSource}
   * @param {TouchEvent} inEvent The in event.
   */
  function touchcancel(inEvent) {
    this.processTouches_(inEvent, this.cancelOut_);
  }


  var TouchSource = /*@__PURE__*/(function (EventSource) {
    function TouchSource(dispatcher, mouseSource) {
      var mapping = {
        'touchstart': touchstart,
        'touchmove': touchmove,
        'touchend': touchend,
        'touchcancel': touchcancel
      };
      EventSource.call(this, dispatcher, mapping);

      /**
       * @const
       * @type {!Object<string, Event|Object>}
       */
      this.pointerMap = dispatcher.pointerMap;

      /**
       * @const
       * @type {import("./MouseSource.js").default}
       */
      this.mouseSource = mouseSource;

      /**
       * @private
       * @type {number|undefined}
       */
      this.firstTouchId_ = undefined;

      /**
       * @private
       * @type {number}
       */
      this.clickCount_ = 0;

      /**
       * @private
       * @type {?}
       */
      this.resetId_;

      /**
       * Mouse event timeout: This should be long enough to
       * ignore compat mouse events made by touch.
       * @private
       * @type {number}
       */
      this.dedupTimeout_ = 2500;
    }

    if ( EventSource ) TouchSource.__proto__ = EventSource;
    TouchSource.prototype = Object.create( EventSource && EventSource.prototype );
    TouchSource.prototype.constructor = TouchSource;

    /**
     * @private
     * @param {Touch} inTouch The in touch.
     * @return {boolean} True, if this is the primary touch.
     */
    TouchSource.prototype.isPrimaryTouch_ = function isPrimaryTouch_ (inTouch) {
      return this.firstTouchId_ === inTouch.identifier;
    };

    /**
     * Set primary touch if there are no pointers, or the only pointer is the mouse.
     * @param {Touch} inTouch The in touch.
     * @private
     */
    TouchSource.prototype.setPrimaryTouch_ = function setPrimaryTouch_ (inTouch) {
      var count = Object.keys(this.pointerMap).length;
      if (count === 0 || (count === 1 && POINTER_ID.toString() in this.pointerMap)) {
        this.firstTouchId_ = inTouch.identifier;
        this.cancelResetClickCount_();
      }
    };

    /**
     * @private
     * @param {PointerEvent} inPointer The in pointer object.
     */
    TouchSource.prototype.removePrimaryPointer_ = function removePrimaryPointer_ (inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouchId_ = undefined;
        this.resetClickCount_();
      }
    };

    /**
     * @private
     */
    TouchSource.prototype.resetClickCount_ = function resetClickCount_ () {
      this.resetId_ = setTimeout(
        this.resetClickCountHandler_.bind(this),
        CLICK_COUNT_TIMEOUT);
    };

    /**
     * @private
     */
    TouchSource.prototype.resetClickCountHandler_ = function resetClickCountHandler_ () {
      this.clickCount_ = 0;
      this.resetId_ = undefined;
    };

    /**
     * @private
     */
    TouchSource.prototype.cancelResetClickCount_ = function cancelResetClickCount_ () {
      if (this.resetId_ !== undefined) {
        clearTimeout(this.resetId_);
      }
    };

    /**
     * @private
     * @param {TouchEvent} browserEvent Browser event
     * @param {Touch} inTouch Touch event
     * @return {PointerEvent} A pointer object.
     */
    TouchSource.prototype.touchToPointer_ = function touchToPointer_ (browserEvent, inTouch) {
      var e = this.dispatcher.cloneEvent(browserEvent, inTouch);
      // Spec specifies that pointerId 1 is reserved for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      e.pointerId = inTouch.identifier + 2;
      // TODO: check if this is necessary?
      //e.target = findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount_;
      e.button = 0;
      e.buttons = 1;
      e.width = inTouch.radiusX || 0;
      e.height = inTouch.radiusY || 0;
      e.pressure = inTouch.force || 0.5;
      e.isPrimary = this.isPrimaryTouch_(inTouch);
      e.pointerType = POINTER_TYPE$1;

      // make sure that the properties that are different for
      // each `Touch` object are not copied from the BrowserEvent object
      e.clientX = inTouch.clientX;
      e.clientY = inTouch.clientY;
      e.screenX = inTouch.screenX;
      e.screenY = inTouch.screenY;

      return e;
    };

    /**
     * @private
     * @param {TouchEvent} inEvent Touch event
     * @param {function(TouchEvent, PointerEvent)} inFunction In function.
     */
    TouchSource.prototype.processTouches_ = function processTouches_ (inEvent, inFunction) {
      var touches = Array.prototype.slice.call(inEvent.changedTouches);
      var count = touches.length;
      function preventDefault() {
        inEvent.preventDefault();
      }
      for (var i = 0; i < count; ++i) {
        var pointer = this.touchToPointer_(inEvent, touches[i]);
        // forward touch preventDefaults
        pointer.preventDefault = preventDefault;
        inFunction.call(this, inEvent, pointer);
      }
    };

    /**
     * @private
     * @param {TouchList} touchList The touch list.
     * @param {number} searchId Search identifier.
     * @return {boolean} True, if the `Touch` with the given id is in the list.
     */
    TouchSource.prototype.findTouch_ = function findTouch_ (touchList, searchId) {
      var l = touchList.length;
      for (var i = 0; i < l; i++) {
        var touch = touchList[i];
        if (touch.identifier === searchId) {
          return true;
        }
      }
      return false;
    };

    /**
     * In some instances, a touchstart can happen without a touchend. This
     * leaves the pointermap in a broken state.
     * Therefore, on every touchstart, we remove the touches that did not fire a
     * touchend event.
     * To keep state globally consistent, we fire a pointercancel for
     * this "abandoned" touch
     *
     * @private
     * @param {TouchEvent} inEvent The in event.
     */
    TouchSource.prototype.vacuumTouches_ = function vacuumTouches_ (inEvent) {
      var touchList = inEvent.touches;
      // pointerMap.getCount() should be < touchList.length here,
      // as the touchstart has not been processed yet.
      var keys = Object.keys(this.pointerMap);
      var count = keys.length;
      if (count >= touchList.length) {
        var d = [];
        for (var i = 0; i < count; ++i) {
          var key = Number(keys[i]);
          var value = this.pointerMap[key];
          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key != POINTER_ID && !this.findTouch_(touchList, key - 2)) {
            d.push(value.out);
          }
        }
        for (var i$1 = 0; i$1 < d.length; ++i$1) {
          this.cancelOut_(inEvent, d[i$1]);
        }
      }
    };

    /**
     * @private
     * @param {TouchEvent} browserEvent The event.
     * @param {PointerEvent} inPointer The in pointer object.
     */
    TouchSource.prototype.overDown_ = function overDown_ (browserEvent, inPointer) {
      this.pointerMap[inPointer.pointerId] = {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      };
      this.dispatcher.over(inPointer, browserEvent);
      this.dispatcher.enter(inPointer, browserEvent);
      this.dispatcher.down(inPointer, browserEvent);
    };

    /**
     * @private
     * @param {TouchEvent} browserEvent The event.
     * @param {PointerEvent} inPointer The in pointer.
     */
    TouchSource.prototype.moveOverOut_ = function moveOverOut_ (browserEvent, inPointer) {
      var event = inPointer;
      var pointer = this.pointerMap[event.pointerId];
      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      this.dispatcher.move(event, browserEvent);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        /** @type {Object} */ (event).relatedTarget = outTarget;
        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          this.dispatcher.leaveOut(outEvent, browserEvent);
          this.dispatcher.enterOver(event, browserEvent);
        } else {
          // clean up case when finger leaves the screen
          /** @type {Object} */ (event).target = outTarget;
          /** @type {Object} */ (event).relatedTarget = null;
          this.cancelOut_(browserEvent, event);
        }
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    };

    /**
     * @private
     * @param {TouchEvent} browserEvent An event.
     * @param {PointerEvent} inPointer The inPointer object.
     */
    TouchSource.prototype.upOut_ = function upOut_ (browserEvent, inPointer) {
      this.dispatcher.up(inPointer, browserEvent);
      this.dispatcher.out(inPointer, browserEvent);
      this.dispatcher.leave(inPointer, browserEvent);
      this.cleanUpPointer_(inPointer);
    };

    /**
     * @private
     * @param {TouchEvent} browserEvent The event.
     * @param {PointerEvent} inPointer The in pointer.
     */
    TouchSource.prototype.cancelOut_ = function cancelOut_ (browserEvent, inPointer) {
      this.dispatcher.cancel(inPointer, browserEvent);
      this.dispatcher.out(inPointer, browserEvent);
      this.dispatcher.leave(inPointer, browserEvent);
      this.cleanUpPointer_(inPointer);
    };

    /**
     * @private
     * @param {PointerEvent} inPointer The inPointer object.
     */
    TouchSource.prototype.cleanUpPointer_ = function cleanUpPointer_ (inPointer) {
      delete this.pointerMap[inPointer.pointerId];
      this.removePrimaryPointer_(inPointer);
    };

    /**
     * Prevent synth mouse events from creating pointer events.
     *
     * @private
     * @param {TouchEvent} inEvent The in event.
     */
    TouchSource.prototype.dedupSynthMouse_ = function dedupSynthMouse_ (inEvent) {
      var lts = this.mouseSource.lastTouches;
      var t = inEvent.changedTouches[0];
      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch_(t)) {
        // remember x/y of last touch
        var lt = [t.clientX, t.clientY];
        lts.push(lt);

        setTimeout(function() {
          // remove touch after timeout
          remove(lts, lt);
        }, this.dedupTimeout_);
      }
    };

    return TouchSource;
  }(EventSource));

  /**
   * @module ol/pointer/PointerEventHandler
   */


  /**
   * Properties to copy when cloning an event, with default values.
   * @type {Array<Array>}
   */
  var CLONE_PROPS = [
    // MouseEvent
    ['bubbles', false],
    ['cancelable', false],
    ['view', null],
    ['detail', null],
    ['screenX', 0],
    ['screenY', 0],
    ['clientX', 0],
    ['clientY', 0],
    ['ctrlKey', false],
    ['altKey', false],
    ['shiftKey', false],
    ['metaKey', false],
    ['button', 0],
    ['relatedTarget', null],
    // DOM Level 3
    ['buttons', 0],
    // PointerEvent
    ['pointerId', 0],
    ['width', 0],
    ['height', 0],
    ['pressure', 0],
    ['tiltX', 0],
    ['tiltY', 0],
    ['pointerType', ''],
    ['hwTimestamp', 0],
    ['isPrimary', false],
    // event instance
    ['type', ''],
    ['target', null],
    ['currentTarget', null],
    ['which', 0]
  ];


  var PointerEventHandler = /*@__PURE__*/(function (EventTarget) {
    function PointerEventHandler(element) {
      EventTarget.call(this);

      /**
       * @const
       * @private
       * @type {Element|HTMLDocument}
       */
      this.element_ = element;

      /**
       * @const
       * @type {!Object<string, Event|Object>}
       */
      this.pointerMap = {};

      /**
       * @type {Object<string, function(Event)>}
       * @private
       */
      this.eventMap_ = {};

      /**
       * @type {Array<import("./EventSource.js").default>}
       * @private
       */
      this.eventSourceList_ = [];

      this.registerSources();
    }

    if ( EventTarget ) PointerEventHandler.__proto__ = EventTarget;
    PointerEventHandler.prototype = Object.create( EventTarget && EventTarget.prototype );
    PointerEventHandler.prototype.constructor = PointerEventHandler;

    /**
     * Set up the event sources (mouse, touch and native pointers)
     * that generate pointer events.
     */
    PointerEventHandler.prototype.registerSources = function registerSources () {
      if (POINTER) {
        this.registerSource('native', new NativeSource(this));
      } else if (MSPOINTER) {
        this.registerSource('ms', new MsSource(this));
      } else {
        var mouseSource = new MouseSource(this);
        this.registerSource('mouse', mouseSource);

        if (TOUCH) {
          this.registerSource('touch', new TouchSource(this, mouseSource));
        }
      }

      // register events on the viewport element
      this.register_();
    };

    /**
     * Add a new event source that will generate pointer events.
     *
     * @param {string} name A name for the event source
     * @param {import("./EventSource.js").default} source The source event.
     */
    PointerEventHandler.prototype.registerSource = function registerSource (name, source) {
      var s = source;
      var newEvents = s.getEvents();

      if (newEvents) {
        newEvents.forEach(function(e) {
          var handler = s.getHandlerForEvent(e);

          if (handler) {
            this.eventMap_[e] = handler.bind(s);
          }
        }.bind(this));
        this.eventSourceList_.push(s);
      }
    };

    /**
     * Set up the events for all registered event sources.
     * @private
     */
    PointerEventHandler.prototype.register_ = function register_ () {
      var l = this.eventSourceList_.length;
      for (var i = 0; i < l; i++) {
        var eventSource = this.eventSourceList_[i];
        this.addEvents_(eventSource.getEvents());
      }
    };

    /**
     * Remove all registered events.
     * @private
     */
    PointerEventHandler.prototype.unregister_ = function unregister_ () {
      var l = this.eventSourceList_.length;
      for (var i = 0; i < l; i++) {
        var eventSource = this.eventSourceList_[i];
        this.removeEvents_(eventSource.getEvents());
      }
    };

    /**
     * Calls the right handler for a new event.
     * @private
     * @param {Event} inEvent Browser event.
     */
    PointerEventHandler.prototype.eventHandler_ = function eventHandler_ (inEvent) {
      var type = inEvent.type;
      var handler = this.eventMap_[type];
      if (handler) {
        handler(inEvent);
      }
    };

    /**
     * Setup listeners for the given events.
     * @private
     * @param {Array<string>} events List of events.
     */
    PointerEventHandler.prototype.addEvents_ = function addEvents_ (events) {
      events.forEach(function(eventName) {
        listen(this.element_, eventName, this.eventHandler_, this);
      }.bind(this));
    };

    /**
     * Unregister listeners for the given events.
     * @private
     * @param {Array<string>} events List of events.
     */
    PointerEventHandler.prototype.removeEvents_ = function removeEvents_ (events) {
      events.forEach(function(e) {
        unlisten(this.element_, e, this.eventHandler_, this);
      }.bind(this));
    };

    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} event Browser event.
     * @param {Event|Touch} inEvent An event that contains
     *    properties to copy.
     * @return {Object} An object containing shallow copies of
     *    `inEvent`'s properties.
     */
    PointerEventHandler.prototype.cloneEvent = function cloneEvent (event, inEvent) {
      var eventCopy = {};
      for (var i = 0, ii = CLONE_PROPS.length; i < ii; i++) {
        var p = CLONE_PROPS[i][0];
        eventCopy[p] = event[p] || inEvent[p] || CLONE_PROPS[i][1];
      }

      return eventCopy;
    };

    // EVENTS


    /**
     * Triggers a 'pointerdown' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.down = function down (data, event) {
      this.fireEvent(PointerEventType.POINTERDOWN, data, event);
    };

    /**
     * Triggers a 'pointermove' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.move = function move (data, event) {
      this.fireEvent(PointerEventType.POINTERMOVE, data, event);
    };

    /**
     * Triggers a 'pointerup' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.up = function up (data, event) {
      this.fireEvent(PointerEventType.POINTERUP, data, event);
    };

    /**
     * Triggers a 'pointerenter' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.enter = function enter (data, event) {
      data.bubbles = false;
      this.fireEvent(PointerEventType.POINTERENTER, data, event);
    };

    /**
     * Triggers a 'pointerleave' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.leave = function leave (data, event) {
      data.bubbles = false;
      this.fireEvent(PointerEventType.POINTERLEAVE, data, event);
    };

    /**
     * Triggers a 'pointerover' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.over = function over (data, event) {
      data.bubbles = true;
      this.fireEvent(PointerEventType.POINTEROVER, data, event);
    };

    /**
     * Triggers a 'pointerout' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.out = function out (data, event) {
      data.bubbles = true;
      this.fireEvent(PointerEventType.POINTEROUT, data, event);
    };

    /**
     * Triggers a 'pointercancel' event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.cancel = function cancel (data, event) {
      this.fireEvent(PointerEventType.POINTERCANCEL, data, event);
    };

    /**
     * Triggers a combination of 'pointerout' and 'pointerleave' events.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.leaveOut = function leaveOut (data, event) {
      this.out(data, event);
      if (!this.contains_(data.target, data.relatedTarget)) {
        this.leave(data, event);
      }
    };

    /**
     * Triggers a combination of 'pointerover' and 'pointerevents' events.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.enterOver = function enterOver (data, event) {
      this.over(data, event);
      if (!this.contains_(data.target, data.relatedTarget)) {
        this.enter(data, event);
      }
    };

    /**
     * @private
     * @param {Element} container The container element.
     * @param {Element} contained The contained element.
     * @return {boolean} Returns true if the container element
     *   contains the other element.
     */
    PointerEventHandler.prototype.contains_ = function contains_ (container, contained) {
      if (!container || !contained) {
        return false;
      }
      return container.contains(contained);
    };

    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `data`.
     *
     * @param {string} inType A string representing the type of event to create.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     * @return {PointerEvent} A PointerEvent of type `inType`.
     */
    PointerEventHandler.prototype.makeEvent = function makeEvent (inType, data, event) {
      return new PointerEvent(inType, event, data);
    };

    /**
     * Make and dispatch an event in one call.
     * @param {string} inType A string representing the type of event.
     * @param {Object} data Pointer event data.
     * @param {Event} event The event.
     */
    PointerEventHandler.prototype.fireEvent = function fireEvent (inType, data, event) {
      var e = this.makeEvent(inType, data, event);
      this.dispatchEvent(e);
    };

    /**
     * Creates a pointer event from a native pointer event
     * and dispatches this event.
     * @param {Event} event A platform event with a target.
     */
    PointerEventHandler.prototype.fireNativeEvent = function fireNativeEvent (event) {
      var e = this.makeEvent(event.type, event, event);
      this.dispatchEvent(e);
    };

    /**
     * Wrap a native mouse event into a pointer event.
     * This proxy method is required for the legacy IE support.
     * @param {string} eventType The pointer event type.
     * @param {Event} event The event.
     * @return {PointerEvent} The wrapped event.
     */
    PointerEventHandler.prototype.wrapMouseEvent = function wrapMouseEvent (eventType, event) {
      var pointerEvent = this.makeEvent(
        eventType, prepareEvent(event, this), event);
      return pointerEvent;
    };

    /**
     * @inheritDoc
     */
    PointerEventHandler.prototype.disposeInternal = function disposeInternal () {
      this.unregister_();
      EventTarget.prototype.disposeInternal.call(this);
    };

    return PointerEventHandler;
  }(Target));

  /**
   * @module ol/MapBrowserEventHandler
   */

  var MapBrowserEventHandler = /*@__PURE__*/(function (EventTarget) {
    function MapBrowserEventHandler(map, moveTolerance) {

      EventTarget.call(this);

      /**
       * This is the element that we will listen to the real events on.
       * @type {import("./PluggableMap.js").default}
       * @private
       */
      this.map_ = map;

      /**
       * @type {any}
       * @private
       */
      this.clickTimeoutId_;

      /**
       * @type {boolean}
       * @private
       */
      this.dragging_ = false;

      /**
       * @type {!Array<import("./events.js").EventsKey>}
       * @private
       */
      this.dragListenerKeys_ = [];

      /**
       * @type {number}
       * @private
       */
      this.moveTolerance_ = moveTolerance ?
        moveTolerance * DEVICE_PIXEL_RATIO : DEVICE_PIXEL_RATIO;

      /**
       * The most recent "down" type event (or null if none have occurred).
       * Set on pointerdown.
       * @type {import("./pointer/PointerEvent.js").default}
       * @private
       */
      this.down_ = null;

      var element = this.map_.getViewport();

      /**
       * @type {number}
       * @private
       */
      this.activePointers_ = 0;

      /**
       * @type {!Object<number, boolean>}
       * @private
       */
      this.trackedTouches_ = {};

      /**
       * Event handler which generates pointer events for
       * the viewport element.
       *
       * @type {PointerEventHandler}
       * @private
       */
      this.pointerEventHandler_ = new PointerEventHandler(element);

      /**
       * Event handler which generates pointer events for
       * the document (used when dragging).
       *
       * @type {PointerEventHandler}
       * @private
       */
      this.documentPointerEventHandler_ = null;

      /**
       * @type {?import("./events.js").EventsKey}
       * @private
       */
      this.pointerdownListenerKey_ = listen(this.pointerEventHandler_,
        PointerEventType.POINTERDOWN,
        this.handlePointerDown_, this);

      /**
       * @type {?import("./events.js").EventsKey}
       * @private
       */
      this.relayedListenerKey_ = listen(this.pointerEventHandler_,
        PointerEventType.POINTERMOVE,
        this.relayEvent_, this);

    }

    if ( EventTarget ) MapBrowserEventHandler.__proto__ = EventTarget;
    MapBrowserEventHandler.prototype = Object.create( EventTarget && EventTarget.prototype );
    MapBrowserEventHandler.prototype.constructor = MapBrowserEventHandler;

    /**
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @private
     */
    MapBrowserEventHandler.prototype.emulateClick_ = function emulateClick_ (pointerEvent) {
      var newEvent = new MapBrowserPointerEvent(
        MapBrowserEventType.CLICK, this.map_, pointerEvent);
      this.dispatchEvent(newEvent);
      if (this.clickTimeoutId_ !== undefined) {
        // double-click
        clearTimeout(this.clickTimeoutId_);
        this.clickTimeoutId_ = undefined;
        newEvent = new MapBrowserPointerEvent(
          MapBrowserEventType.DBLCLICK, this.map_, pointerEvent);
        this.dispatchEvent(newEvent);
      } else {
        // click
        this.clickTimeoutId_ = setTimeout(function() {
          this.clickTimeoutId_ = undefined;
          var newEvent = new MapBrowserPointerEvent(
            MapBrowserEventType.SINGLECLICK, this.map_, pointerEvent);
          this.dispatchEvent(newEvent);
        }.bind(this), 250);
      }
    };

    /**
     * Keeps track on how many pointers are currently active.
     *
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @private
     */
    MapBrowserEventHandler.prototype.updateActivePointers_ = function updateActivePointers_ (pointerEvent) {
      var event = pointerEvent;

      if (event.type == MapBrowserEventType.POINTERUP ||
          event.type == MapBrowserEventType.POINTERCANCEL) {
        delete this.trackedTouches_[event.pointerId];
      } else if (event.type == MapBrowserEventType.POINTERDOWN) {
        this.trackedTouches_[event.pointerId] = true;
      }
      this.activePointers_ = Object.keys(this.trackedTouches_).length;
    };

    /**
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @private
     */
    MapBrowserEventHandler.prototype.handlePointerUp_ = function handlePointerUp_ (pointerEvent) {
      this.updateActivePointers_(pointerEvent);
      var newEvent = new MapBrowserPointerEvent(
        MapBrowserEventType.POINTERUP, this.map_, pointerEvent);
      this.dispatchEvent(newEvent);

      // We emulate click events on left mouse button click, touch contact, and pen
      // contact. isMouseActionButton returns true in these cases (evt.button is set
      // to 0).
      // See http://www.w3.org/TR/pointerevents/#button-states
      // We only fire click, singleclick, and doubleclick if nobody has called
      // event.stopPropagation() or event.preventDefault().
      if (!newEvent.propagationStopped && !this.dragging_ && this.isMouseActionButton_(pointerEvent)) {
        this.emulateClick_(this.down_);
      }

      if (this.activePointers_ === 0) {
        this.dragListenerKeys_.forEach(unlistenByKey);
        this.dragListenerKeys_.length = 0;
        this.dragging_ = false;
        this.down_ = null;
        this.documentPointerEventHandler_.dispose();
        this.documentPointerEventHandler_ = null;
      }
    };

    /**
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @return {boolean} If the left mouse button was pressed.
     * @private
     */
    MapBrowserEventHandler.prototype.isMouseActionButton_ = function isMouseActionButton_ (pointerEvent) {
      return pointerEvent.button === 0;
    };

    /**
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @private
     */
    MapBrowserEventHandler.prototype.handlePointerDown_ = function handlePointerDown_ (pointerEvent) {
      this.updateActivePointers_(pointerEvent);
      var newEvent = new MapBrowserPointerEvent(
        MapBrowserEventType.POINTERDOWN, this.map_, pointerEvent);
      this.dispatchEvent(newEvent);

      this.down_ = pointerEvent;

      if (this.dragListenerKeys_.length === 0) {
        /* Set up a pointer event handler on the `document`,
         * which is required when the pointer is moved outside
         * the viewport when dragging.
         */
        this.documentPointerEventHandler_ =
            new PointerEventHandler(document);

        this.dragListenerKeys_.push(
          listen(this.documentPointerEventHandler_,
            MapBrowserEventType.POINTERMOVE,
            this.handlePointerMove_, this),
          listen(this.documentPointerEventHandler_,
            MapBrowserEventType.POINTERUP,
            this.handlePointerUp_, this),
          /* Note that the listener for `pointercancel is set up on
           * `pointerEventHandler_` and not `documentPointerEventHandler_` like
           * the `pointerup` and `pointermove` listeners.
           *
           * The reason for this is the following: `TouchSource.vacuumTouches_()`
           * issues `pointercancel` events, when there was no `touchend` for a
           * `touchstart`. Now, let's say a first `touchstart` is registered on
           * `pointerEventHandler_`. The `documentPointerEventHandler_` is set up.
           * But `documentPointerEventHandler_` doesn't know about the first
           * `touchstart`. If there is no `touchend` for the `touchstart`, we can
           * only receive a `touchcancel` from `pointerEventHandler_`, because it is
           * only registered there.
           */
          listen(this.pointerEventHandler_,
            MapBrowserEventType.POINTERCANCEL,
            this.handlePointerUp_, this)
        );
      }
    };

    /**
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @private
     */
    MapBrowserEventHandler.prototype.handlePointerMove_ = function handlePointerMove_ (pointerEvent) {
      // Between pointerdown and pointerup, pointermove events are triggered.
      // To avoid a 'false' touchmove event to be dispatched, we test if the pointer
      // moved a significant distance.
      if (this.isMoving_(pointerEvent)) {
        this.dragging_ = true;
        var newEvent = new MapBrowserPointerEvent(
          MapBrowserEventType.POINTERDRAG, this.map_, pointerEvent,
          this.dragging_);
        this.dispatchEvent(newEvent);
      }

      // Some native android browser triggers mousemove events during small period
      // of time. See: https://code.google.com/p/android/issues/detail?id=5491 or
      // https://code.google.com/p/android/issues/detail?id=19827
      // ex: Galaxy Tab P3110 + Android 4.1.1
      pointerEvent.preventDefault();
    };

    /**
     * Wrap and relay a pointer event.  Note that this requires that the type
     * string for the MapBrowserPointerEvent matches the PointerEvent type.
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @private
     */
    MapBrowserEventHandler.prototype.relayEvent_ = function relayEvent_ (pointerEvent) {
      var dragging = !!(this.down_ && this.isMoving_(pointerEvent));
      this.dispatchEvent(new MapBrowserPointerEvent(
        pointerEvent.type, this.map_, pointerEvent, dragging));
    };

    /**
     * @param {import("./pointer/PointerEvent.js").default} pointerEvent Pointer
     * event.
     * @return {boolean} Is moving.
     * @private
     */
    MapBrowserEventHandler.prototype.isMoving_ = function isMoving_ (pointerEvent) {
      return this.dragging_ ||
          Math.abs(pointerEvent.clientX - this.down_.clientX) > this.moveTolerance_ ||
          Math.abs(pointerEvent.clientY - this.down_.clientY) > this.moveTolerance_;
    };

    /**
     * @inheritDoc
     */
    MapBrowserEventHandler.prototype.disposeInternal = function disposeInternal () {
      if (this.relayedListenerKey_) {
        unlistenByKey(this.relayedListenerKey_);
        this.relayedListenerKey_ = null;
      }
      if (this.pointerdownListenerKey_) {
        unlistenByKey(this.pointerdownListenerKey_);
        this.pointerdownListenerKey_ = null;
      }

      this.dragListenerKeys_.forEach(unlistenByKey);
      this.dragListenerKeys_.length = 0;

      if (this.documentPointerEventHandler_) {
        this.documentPointerEventHandler_.dispose();
        this.documentPointerEventHandler_ = null;
      }
      if (this.pointerEventHandler_) {
        this.pointerEventHandler_.dispose();
        this.pointerEventHandler_ = null;
      }
      EventTarget.prototype.disposeInternal.call(this);
    };

    return MapBrowserEventHandler;
  }(Target));

  /**
   * @module ol/MapEventType
   */

  /**
   * @enum {string}
   */
  var MapEventType = {

    /**
     * Triggered after a map frame is rendered.
     * @event module:ol/MapEvent~MapEvent#postrender
     * @api
     */
    POSTRENDER: 'postrender',

    /**
     * Triggered when the map starts moving.
     * @event module:ol/MapEvent~MapEvent#movestart
     * @api
     */
    MOVESTART: 'movestart',

    /**
     * Triggered after the map is moved.
     * @event module:ol/MapEvent~MapEvent#moveend
     * @api
     */
    MOVEEND: 'moveend'

  };

  /**
   * @module ol/MapProperty
   */

  /**
   * @enum {string}
   */
  var MapProperty = {
    LAYERGROUP: 'layergroup',
    SIZE: 'size',
    TARGET: 'target',
    VIEW: 'view'
  };

  /**
   * @module ol/render/EventType
   */

  /**
   * @enum {string}
   */
  var RenderEventType = {
    /**
     * @event module:ol/render/Event~RenderEvent#postcompose
     * @api
     */
    POSTCOMPOSE: 'postcompose',
    /**
     * @event module:ol/render/Event~RenderEvent#precompose
     * @api
     */
    PRECOMPOSE: 'precompose',
    /**
     * @event module:ol/render/Event~RenderEvent#render
     * @api
     */
    RENDER: 'render',
    /**
     * Triggered when rendering is complete, i.e. all sources and tiles have
     * finished loading for the current viewport, and all tiles are faded in.
     * @event module:ol/render/Event~RenderEvent#rendercomplete
     * @api
     */
    RENDERCOMPLETE: 'rendercomplete'
  };

  /**
   * @module ol/TileState
   */

  /**
   * @enum {number}
   */
  var TileState = {
    IDLE: 0,
    LOADING: 1,
    LOADED: 2,
    /**
     * Indicates that tile loading failed
     * @type {number}
     */
    ERROR: 3,
    EMPTY: 4,
    ABORT: 5
  };

  /**
   * @module ol/asserts
   */

  /**
   * @param {*} assertion Assertion we expected to be truthy.
   * @param {number} errorCode Error code.
   */
  function assert(assertion, errorCode) {
    if (!assertion) {
      throw new AssertionError(errorCode);
    }
  }

  /**
   * @module ol/structs/PriorityQueue
   */


  /**
   * @type {number}
   */
  var DROP = Infinity;


  /**
   * @classdesc
   * Priority queue.
   *
   * The implementation is inspired from the Closure Library's Heap class and
   * Python's heapq module.
   *
   * See http://closure-library.googlecode.com/svn/docs/closure_goog_structs_heap.js.source.html
   * and http://hg.python.org/cpython/file/2.7/Lib/heapq.py.
   *
   * @template T
   */
  var PriorityQueue = function PriorityQueue(priorityFunction, keyFunction) {

    /**
     * @type {function(T): number}
     * @private
     */
    this.priorityFunction_ = priorityFunction;

    /**
     * @type {function(T): string}
     * @private
     */
    this.keyFunction_ = keyFunction;

    /**
     * @type {Array<T>}
     * @private
     */
    this.elements_ = [];

    /**
     * @type {Array<number>}
     * @private
     */
    this.priorities_ = [];

    /**
     * @type {!Object<string, boolean>}
     * @private
     */
    this.queuedElements_ = {};

  };

  /**
   * FIXME empty description for jsdoc
   */
  PriorityQueue.prototype.clear = function clear$1 () {
    this.elements_.length = 0;
    this.priorities_.length = 0;
    clear(this.queuedElements_);
  };


  /**
   * Remove and return the highest-priority element. O(log N).
   * @return {T} Element.
   */
  PriorityQueue.prototype.dequeue = function dequeue () {
    var elements = this.elements_;
    var priorities = this.priorities_;
    var element = elements[0];
    if (elements.length == 1) {
      elements.length = 0;
      priorities.length = 0;
    } else {
      elements[0] = elements.pop();
      priorities[0] = priorities.pop();
      this.siftUp_(0);
    }
    var elementKey = this.keyFunction_(element);
    delete this.queuedElements_[elementKey];
    return element;
  };


  /**
   * Enqueue an element. O(log N).
   * @param {T} element Element.
   * @return {boolean} The element was added to the queue.
   */
  PriorityQueue.prototype.enqueue = function enqueue (element) {
    assert(!(this.keyFunction_(element) in this.queuedElements_),
      31); // Tried to enqueue an `element` that was already added to the queue
    var priority = this.priorityFunction_(element);
    if (priority != DROP) {
      this.elements_.push(element);
      this.priorities_.push(priority);
      this.queuedElements_[this.keyFunction_(element)] = true;
      this.siftDown_(0, this.elements_.length - 1);
      return true;
    }
    return false;
  };


  /**
   * @return {number} Count.
   */
  PriorityQueue.prototype.getCount = function getCount () {
    return this.elements_.length;
  };


  /**
   * Gets the index of the left child of the node at the given index.
   * @param {number} index The index of the node to get the left child for.
   * @return {number} The index of the left child.
   * @private
   */
  PriorityQueue.prototype.getLeftChildIndex_ = function getLeftChildIndex_ (index) {
    return index * 2 + 1;
  };


  /**
   * Gets the index of the right child of the node at the given index.
   * @param {number} index The index of the node to get the right child for.
   * @return {number} The index of the right child.
   * @private
   */
  PriorityQueue.prototype.getRightChildIndex_ = function getRightChildIndex_ (index) {
    return index * 2 + 2;
  };


  /**
   * Gets the index of the parent of the node at the given index.
   * @param {number} index The index of the node to get the parent for.
   * @return {number} The index of the parent.
   * @private
   */
  PriorityQueue.prototype.getParentIndex_ = function getParentIndex_ (index) {
    return (index - 1) >> 1;
  };


  /**
   * Make this a heap. O(N).
   * @private
   */
  PriorityQueue.prototype.heapify_ = function heapify_ () {
    var i;
    for (i = (this.elements_.length >> 1) - 1; i >= 0; i--) {
      this.siftUp_(i);
    }
  };


  /**
   * @return {boolean} Is empty.
   */
  PriorityQueue.prototype.isEmpty = function isEmpty () {
    return this.elements_.length === 0;
  };


  /**
   * @param {string} key Key.
   * @return {boolean} Is key queued.
   */
  PriorityQueue.prototype.isKeyQueued = function isKeyQueued (key) {
    return key in this.queuedElements_;
  };


  /**
   * @param {T} element Element.
   * @return {boolean} Is queued.
   */
  PriorityQueue.prototype.isQueued = function isQueued (element) {
    return this.isKeyQueued(this.keyFunction_(element));
  };


  /**
   * @param {number} index The index of the node to move down.
   * @private
   */
  PriorityQueue.prototype.siftUp_ = function siftUp_ (index) {
    var elements = this.elements_;
    var priorities = this.priorities_;
    var count = elements.length;
    var element = elements[index];
    var priority = priorities[index];
    var startIndex = index;

    while (index < (count >> 1)) {
      var lIndex = this.getLeftChildIndex_(index);
      var rIndex = this.getRightChildIndex_(index);

      var smallerChildIndex = rIndex < count &&
          priorities[rIndex] < priorities[lIndex] ?
        rIndex : lIndex;

      elements[index] = elements[smallerChildIndex];
      priorities[index] = priorities[smallerChildIndex];
      index = smallerChildIndex;
    }

    elements[index] = element;
    priorities[index] = priority;
    this.siftDown_(startIndex, index);
  };


  /**
   * @param {number} startIndex The index of the root.
   * @param {number} index The index of the node to move up.
   * @private
   */
  PriorityQueue.prototype.siftDown_ = function siftDown_ (startIndex, index) {
    var elements = this.elements_;
    var priorities = this.priorities_;
    var element = elements[index];
    var priority = priorities[index];

    while (index > startIndex) {
      var parentIndex = this.getParentIndex_(index);
      if (priorities[parentIndex] > priority) {
        elements[index] = elements[parentIndex];
        priorities[index] = priorities[parentIndex];
        index = parentIndex;
      } else {
        break;
      }
    }
    elements[index] = element;
    priorities[index] = priority;
  };


  /**
   * FIXME empty description for jsdoc
   */
  PriorityQueue.prototype.reprioritize = function reprioritize () {
    var priorityFunction = this.priorityFunction_;
    var elements = this.elements_;
    var priorities = this.priorities_;
    var index = 0;
    var n = elements.length;
    var element, i, priority;
    for (i = 0; i < n; ++i) {
      element = elements[i];
      priority = priorityFunction(element);
      if (priority == DROP) {
        delete this.queuedElements_[this.keyFunction_(element)];
      } else {
        priorities[index] = priority;
        elements[index++] = element;
      }
    }
    elements.length = index;
    priorities.length = index;
    this.heapify_();
  };

  /**
   * @module ol/TileQueue
   */


  /**
   * @typedef {function(import("./Tile.js").default, string, import("./coordinate.js").Coordinate, number): number} PriorityFunction
   */


  var TileQueue = /*@__PURE__*/(function (PriorityQueue) {
    function TileQueue(tilePriorityFunction, tileChangeCallback) {

      PriorityQueue.call(
        /**
         * @param {Array} element Element.
         * @return {number} Priority.
         */
        this, function(element) {
          return tilePriorityFunction.apply(null, element);
        },
        /**
         * @param {Array} element Element.
         * @return {string} Key.
         */
        function(element) {
          return (/** @type {import("./Tile.js").default} */ (element[0]).getKey());
        });

      /**
       * @private
       * @type {function(): ?}
       */
      this.tileChangeCallback_ = tileChangeCallback;

      /**
       * @private
       * @type {number}
       */
      this.tilesLoading_ = 0;

      /**
       * @private
       * @type {!Object<string,boolean>}
       */
      this.tilesLoadingKeys_ = {};

    }

    if ( PriorityQueue ) TileQueue.__proto__ = PriorityQueue;
    TileQueue.prototype = Object.create( PriorityQueue && PriorityQueue.prototype );
    TileQueue.prototype.constructor = TileQueue;

    /**
     * @inheritDoc
     */
    TileQueue.prototype.enqueue = function enqueue (element) {
      var added = PriorityQueue.prototype.enqueue.call(this, element);
      if (added) {
        var tile = element[0];
        listen(tile, EventType.CHANGE, this.handleTileChange, this);
      }
      return added;
    };

    /**
     * @return {number} Number of tiles loading.
     */
    TileQueue.prototype.getTilesLoading = function getTilesLoading () {
      return this.tilesLoading_;
    };

    /**
     * @param {import("./events/Event.js").default} event Event.
     * @protected
     */
    TileQueue.prototype.handleTileChange = function handleTileChange (event) {
      var tile = /** @type {import("./Tile.js").default} */ (event.target);
      var state = tile.getState();
      if (state === TileState.LOADED || state === TileState.ERROR ||
          state === TileState.EMPTY || state === TileState.ABORT) {
        unlisten(tile, EventType.CHANGE, this.handleTileChange, this);
        var tileKey = tile.getKey();
        if (tileKey in this.tilesLoadingKeys_) {
          delete this.tilesLoadingKeys_[tileKey];
          --this.tilesLoading_;
        }
        this.tileChangeCallback_();
      }
    };

    /**
     * @param {number} maxTotalLoading Maximum number tiles to load simultaneously.
     * @param {number} maxNewLoads Maximum number of new tiles to load.
     */
    TileQueue.prototype.loadMoreTiles = function loadMoreTiles (maxTotalLoading, maxNewLoads) {
      var newLoads = 0;
      var abortedTiles = false;
      var state, tile, tileKey;
      while (this.tilesLoading_ < maxTotalLoading && newLoads < maxNewLoads &&
             this.getCount() > 0) {
        tile = /** @type {import("./Tile.js").default} */ (this.dequeue()[0]);
        tileKey = tile.getKey();
        state = tile.getState();
        if (state === TileState.ABORT) {
          abortedTiles = true;
        } else if (state === TileState.IDLE && !(tileKey in this.tilesLoadingKeys_)) {
          this.tilesLoadingKeys_[tileKey] = true;
          ++this.tilesLoading_;
          ++newLoads;
          tile.load();
        }
      }
      if (newLoads === 0 && abortedTiles) {
        // Do not stop the render loop when all wanted tiles were aborted due to
        // a small, saturated tile cache.
        this.tileChangeCallback_();
      }
    };

    return TileQueue;
  }(PriorityQueue));

  /**
   * @module ol/tilegrid/common
   */

  /**
   * Default maximum zoom for default tile grids.
   * @type {number}
   */
  var DEFAULT_MAX_ZOOM = 42;

  /**
   * Default tile size.
   * @type {number}
   */
  var DEFAULT_TILE_SIZE = 256;

  /**
   * @module ol/math
   */

  /**
   * Takes a number and clamps it to within the provided bounds.
   * @param {number} value The input number.
   * @param {number} min The minimum value to return.
   * @param {number} max The maximum value to return.
   * @return {number} The input number if it is within bounds, or the nearest
   *     number within the bounds.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }


  /**
   * Return the hyperbolic cosine of a given number. The method will use the
   * native `Math.cosh` function if it is available, otherwise the hyperbolic
   * cosine will be calculated via the reference implementation of the Mozilla
   * developer network.
   *
   * @param {number} x X.
   * @return {number} Hyperbolic cosine of x.
   */
  var cosh = (function() {
    // Wrapped in a iife, to save the overhead of checking for the native
    // implementation on every invocation.
    var cosh;
    if ('cosh' in Math) {
      // The environment supports the native Math.cosh function, use it…
      cosh = Math.cosh;
    } else {
      // … else, use the reference implementation of MDN:
      cosh = function(x) {
        var y = /** @type {Math} */ (Math).exp(x);
        return (y + 1 / y) / 2;
      };
    }
    return cosh;
  }());


  /**
   * Returns the square of the closest distance between the point (x, y) and the
   * line segment (x1, y1) to (x2, y2).
   * @param {number} x X.
   * @param {number} y Y.
   * @param {number} x1 X1.
   * @param {number} y1 Y1.
   * @param {number} x2 X2.
   * @param {number} y2 Y2.
   * @return {number} Squared distance.
   */
  function squaredSegmentDistance(x, y, x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    if (dx !== 0 || dy !== 0) {
      var t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x1 = x2;
        y1 = y2;
      } else if (t > 0) {
        x1 += dx * t;
        y1 += dy * t;
      }
    }
    return squaredDistance(x, y, x1, y1);
  }


  /**
   * Returns the square of the distance between the points (x1, y1) and (x2, y2).
   * @param {number} x1 X1.
   * @param {number} y1 Y1.
   * @param {number} x2 X2.
   * @param {number} y2 Y2.
   * @return {number} Squared distance.
   */
  function squaredDistance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return dx * dx + dy * dy;
  }


  /**
   * Solves system of linear equations using Gaussian elimination method.
   *
   * @param {Array<Array<number>>} mat Augmented matrix (n x n + 1 column)
   *                                     in row-major order.
   * @return {Array<number>} The resulting vector.
   */
  function solveLinearSystem(mat) {
    var n = mat.length;

    for (var i = 0; i < n; i++) {
      // Find max in the i-th column (ignoring i - 1 first rows)
      var maxRow = i;
      var maxEl = Math.abs(mat[i][i]);
      for (var r = i + 1; r < n; r++) {
        var absValue = Math.abs(mat[r][i]);
        if (absValue > maxEl) {
          maxEl = absValue;
          maxRow = r;
        }
      }

      if (maxEl === 0) {
        return null; // matrix is singular
      }

      // Swap max row with i-th (current) row
      var tmp = mat[maxRow];
      mat[maxRow] = mat[i];
      mat[i] = tmp;

      // Subtract the i-th row to make all the remaining rows 0 in the i-th column
      for (var j = i + 1; j < n; j++) {
        var coef = -mat[j][i] / mat[i][i];
        for (var k = i; k < n + 1; k++) {
          if (i == k) {
            mat[j][k] = 0;
          } else {
            mat[j][k] += coef * mat[i][k];
          }
        }
      }
    }

    // Solve Ax=b for upper triangular matrix A (mat)
    var x = new Array(n);
    for (var l = n - 1; l >= 0; l--) {
      x[l] = mat[l][n] / mat[l][l];
      for (var m = l - 1; m >= 0; m--) {
        mat[m][n] -= mat[m][l] * x[l];
      }
    }
    return x;
  }


  /**
   * Converts degrees to radians.
   *
   * @param {number} angleInDegrees Angle in degrees.
   * @return {number} Angle in radians.
   */
  function toRadians(angleInDegrees) {
    return angleInDegrees * Math.PI / 180;
  }

  /**
   * Returns the modulo of a / b, depending on the sign of b.
   *
   * @param {number} a Dividend.
   * @param {number} b Divisor.
   * @return {number} Modulo.
   */
  function modulo(a, b) {
    var r = a % b;
    return r * b < 0 ? r + b : r;
  }

  /**
   * Calculates the linearly interpolated value of x between a and b.
   *
   * @param {number} a Number
   * @param {number} b Number
   * @param {number} x Value to be interpolated.
   * @return {number} Interpolated value.
   */
  function lerp(a, b, x) {
    return a + x * (b - a);
  }

  /**
   * @module ol/centerconstraint
   */


  /**
   * @typedef {function((import("./coordinate.js").Coordinate|undefined)): (import("./coordinate.js").Coordinate|undefined)} Type
   */


  /**
   * @param {import("./extent.js").Extent} extent Extent.
   * @return {Type} The constraint.
   */
  function createExtent(extent) {
    return (
      /**
       * @param {import("./coordinate.js").Coordinate=} center Center.
       * @return {import("./coordinate.js").Coordinate|undefined} Center.
       */
      function(center) {
        if (center) {
          return [
            clamp(center[0], extent[0], extent[2]),
            clamp(center[1], extent[1], extent[3])
          ];
        } else {
          return undefined;
        }
      }
    );
  }


  /**
   * @param {import("./coordinate.js").Coordinate=} center Center.
   * @return {import("./coordinate.js").Coordinate|undefined} Center.
   */
  function none(center) {
    return center;
  }

  /**
   * @module ol/resolutionconstraint
   */


  /**
   * @typedef {function((number|undefined), number, number): (number|undefined)} Type
   */


  /**
   * @param {Array<number>} resolutions Resolutions.
   * @return {Type} Zoom function.
   */
  function createSnapToResolutions(resolutions) {
    return (
      /**
       * @param {number|undefined} resolution Resolution.
       * @param {number} delta Delta.
       * @param {number} direction Direction.
       * @return {number|undefined} Resolution.
       */
      function(resolution, delta, direction) {
        if (resolution !== undefined) {
          var z = linearFindNearest(resolutions, resolution, direction);
          z = clamp(z + delta, 0, resolutions.length - 1);
          var index = Math.floor(z);
          if (z != index && index < resolutions.length - 1) {
            var power = resolutions[index] / resolutions[index + 1];
            return resolutions[index] / Math.pow(power, z - index);
          } else {
            return resolutions[index];
          }
        } else {
          return undefined;
        }
      }
    );
  }


  /**
   * @param {number} power Power.
   * @param {number} maxResolution Maximum resolution.
   * @param {number=} opt_maxLevel Maximum level.
   * @return {Type} Zoom function.
   */
  function createSnapToPower(power, maxResolution, opt_maxLevel) {
    return (
      /**
       * @param {number|undefined} resolution Resolution.
       * @param {number} delta Delta.
       * @param {number} direction Direction.
       * @return {number|undefined} Resolution.
       */
      function(resolution, delta, direction) {
        if (resolution !== undefined) {
          var offset = -direction / 2 + 0.5;
          var oldLevel = Math.floor(
            Math.log(maxResolution / resolution) / Math.log(power) + offset);
          var newLevel = Math.max(oldLevel + delta, 0);
          if (opt_maxLevel !== undefined) {
            newLevel = Math.min(newLevel, opt_maxLevel);
          }
          return maxResolution / Math.pow(power, newLevel);
        } else {
          return undefined;
        }
      });
  }

  /**
   * @module ol/rotationconstraint
   */


  /**
   * @typedef {function((number|undefined), number): (number|undefined)} Type
   */


  /**
   * @param {number|undefined} rotation Rotation.
   * @param {number} delta Delta.
   * @return {number|undefined} Rotation.
   */
  function disable(rotation, delta) {
    if (rotation !== undefined) {
      return 0;
    } else {
      return undefined;
    }
  }


  /**
   * @param {number|undefined} rotation Rotation.
   * @param {number} delta Delta.
   * @return {number|undefined} Rotation.
   */
  function none$1(rotation, delta) {
    if (rotation !== undefined) {
      return rotation + delta;
    } else {
      return undefined;
    }
  }


  /**
   * @param {number} n N.
   * @return {Type} Rotation constraint.
   */
  function createSnapToN(n) {
    var theta = 2 * Math.PI / n;
    return (
      /**
       * @param {number|undefined} rotation Rotation.
       * @param {number} delta Delta.
       * @return {number|undefined} Rotation.
       */
      function(rotation, delta) {
        if (rotation !== undefined) {
          rotation = Math.floor((rotation + delta) / theta + 0.5) * theta;
          return rotation;
        } else {
          return undefined;
        }
      });
  }


  /**
   * @param {number=} opt_tolerance Tolerance.
   * @return {Type} Rotation constraint.
   */
  function createSnapToZero(opt_tolerance) {
    var tolerance = opt_tolerance || toRadians(5);
    return (
      /**
       * @param {number|undefined} rotation Rotation.
       * @param {number} delta Delta.
       * @return {number|undefined} Rotation.
       */
      function(rotation, delta) {
        if (rotation !== undefined) {
          if (Math.abs(rotation + delta) <= tolerance) {
            return 0;
          } else {
            return rotation + delta;
          }
        } else {
          return undefined;
        }
      });
  }

  /**
   * @module ol/ViewHint
   */

  /**
   * @enum {number}
   */
  var ViewHint = {
    ANIMATING: 0,
    INTERACTING: 1
  };

  /**
   * @module ol/ViewProperty
   */

  /**
   * @enum {string}
   */
  var ViewProperty = {
    CENTER: 'center',
    RESOLUTION: 'resolution',
    ROTATION: 'rotation'
  };

  /**
   * @module ol/string
   */

  /**
   * @module ol/coordinate
   */


  /**
   * An array of numbers representing an xy coordinate. Example: `[16, 48]`.
   * @typedef {Array<number>} Coordinate
   * @api
   */


  /**
   * A function that takes a {@link module:ol/coordinate~Coordinate} and
   * transforms it into a `{string}`.
   *
   * @typedef {function((Coordinate|undefined)): string} CoordinateFormat
   * @api
   */


  /**
   * Add `delta` to `coordinate`. `coordinate` is modified in place and returned
   * by the function.
   *
   * Example:
   *
   *     import {add} from 'ol/coordinate';
   *
   *     var coord = [7.85, 47.983333];
   *     add(coord, [-2, 4]);
   *     // coord is now [5.85, 51.983333]
   *
   * @param {Coordinate} coordinate Coordinate.
   * @param {Coordinate} delta Delta.
   * @return {Coordinate} The input coordinate adjusted by
   * the given delta.
   * @api
   */
  function add(coordinate, delta) {
    coordinate[0] += delta[0];
    coordinate[1] += delta[1];
    return coordinate;
  }


  /**
   * @param {Coordinate} coordinate1 First coordinate.
   * @param {Coordinate} coordinate2 Second coordinate.
   * @return {boolean} The two coordinates are equal.
   */
  function equals$1(coordinate1, coordinate2) {
    var equals = true;
    for (var i = coordinate1.length - 1; i >= 0; --i) {
      if (coordinate1[i] != coordinate2[i]) {
        equals = false;
        break;
      }
    }
    return equals;
  }


  /**
   * Rotate `coordinate` by `angle`. `coordinate` is modified in place and
   * returned by the function.
   *
   * Example:
   *
   *     import {rotate} from 'ol/coordinate';
   *
   *     var coord = [7.85, 47.983333];
   *     var rotateRadians = Math.PI / 2; // 90 degrees
   *     rotate(coord, rotateRadians);
   *     // coord is now [-47.983333, 7.85]
   *
   * @param {Coordinate} coordinate Coordinate.
   * @param {number} angle Angle in radian.
   * @return {Coordinate} Coordinate.
   * @api
   */
  function rotate(coordinate, angle) {
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);
    var x = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
    var y = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
    coordinate[0] = x;
    coordinate[1] = y;
    return coordinate;
  }


  /**
   * Scale `coordinate` by `scale`. `coordinate` is modified in place and returned
   * by the function.
   *
   * Example:
   *
   *     import {scale as scaleCoordinate} from 'ol/coordinate';
   *
   *     var coord = [7.85, 47.983333];
   *     var scale = 1.2;
   *     scaleCoordinate(coord, scale);
   *     // coord is now [9.42, 57.5799996]
   *
   * @param {Coordinate} coordinate Coordinate.
   * @param {number} scale Scale factor.
   * @return {Coordinate} Coordinate.
   */
  function scale(coordinate, scale) {
    coordinate[0] *= scale;
    coordinate[1] *= scale;
    return coordinate;
  }

  /**
   * @module ol/easing
   */


  /**
   * Start slow and speed up.
   * @param {number} t Input between 0 and 1.
   * @return {number} Output between 0 and 1.
   * @api
   */
  function easeIn(t) {
    return Math.pow(t, 3);
  }


  /**
   * Start fast and slow down.
   * @param {number} t Input between 0 and 1.
   * @return {number} Output between 0 and 1.
   * @api
   */
  function easeOut(t) {
    return 1 - easeIn(1 - t);
  }


  /**
   * Start slow, speed up, and then slow down again.
   * @param {number} t Input between 0 and 1.
   * @return {number} Output between 0 and 1.
   * @api
   */
  function inAndOut(t) {
    return 3 * t * t - 2 * t * t * t;
  }


  /**
   * Maintain a constant speed over time.
   * @param {number} t Input between 0 and 1.
   * @return {number} Output between 0 and 1.
   * @api
   */
  function linear(t) {
    return t;
  }

  /**
   * @module ol/extent/Corner
   */

  /**
   * Extent corner.
   * @enum {string}
   */
  var Corner = {
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right'
  };

  /**
   * @module ol/extent/Relationship
   */

  /**
   * Relationship to an extent.
   * @enum {number}
   */
  var Relationship = {
    UNKNOWN: 0,
    INTERSECTING: 1,
    ABOVE: 2,
    RIGHT: 4,
    BELOW: 8,
    LEFT: 16
  };

  /**
   * @module ol/extent
   */


  /**
   * An array of numbers representing an extent: `[minx, miny, maxx, maxy]`.
   * @typedef {Array<number>} Extent
   * @api
   */

  /**
   * Build an extent that includes all given coordinates.
   *
   * @param {Array<import("./coordinate.js").Coordinate>} coordinates Coordinates.
   * @return {Extent} Bounding extent.
   * @api
   */
  function boundingExtent(coordinates) {
    var extent = createEmpty();
    for (var i = 0, ii = coordinates.length; i < ii; ++i) {
      extendCoordinate(extent, coordinates[i]);
    }
    return extent;
  }


  /**
   * Return extent increased by the provided value.
   * @param {Extent} extent Extent.
   * @param {number} value The amount by which the extent should be buffered.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} Extent.
   * @api
   */
  function buffer(extent, value, opt_extent) {
    if (opt_extent) {
      opt_extent[0] = extent[0] - value;
      opt_extent[1] = extent[1] - value;
      opt_extent[2] = extent[2] + value;
      opt_extent[3] = extent[3] + value;
      return opt_extent;
    } else {
      return [
        extent[0] - value,
        extent[1] - value,
        extent[2] + value,
        extent[3] + value
      ];
    }
  }


  /**
   * Creates a clone of an extent.
   *
   * @param {Extent} extent Extent to clone.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} The clone.
   */
  function clone(extent, opt_extent) {
    if (opt_extent) {
      opt_extent[0] = extent[0];
      opt_extent[1] = extent[1];
      opt_extent[2] = extent[2];
      opt_extent[3] = extent[3];
      return opt_extent;
    } else {
      return extent.slice();
    }
  }


  /**
   * @param {Extent} extent Extent.
   * @param {number} x X.
   * @param {number} y Y.
   * @return {number} Closest squared distance.
   */
  function closestSquaredDistanceXY(extent, x, y) {
    var dx, dy;
    if (x < extent[0]) {
      dx = extent[0] - x;
    } else if (extent[2] < x) {
      dx = x - extent[2];
    } else {
      dx = 0;
    }
    if (y < extent[1]) {
      dy = extent[1] - y;
    } else if (extent[3] < y) {
      dy = y - extent[3];
    } else {
      dy = 0;
    }
    return dx * dx + dy * dy;
  }


  /**
   * Check if the passed coordinate is contained or on the edge of the extent.
   *
   * @param {Extent} extent Extent.
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
   * @return {boolean} The coordinate is contained in the extent.
   * @api
   */
  function containsCoordinate(extent, coordinate) {
    return containsXY(extent, coordinate[0], coordinate[1]);
  }


  /**
   * Check if one extent contains another.
   *
   * An extent is deemed contained if it lies completely within the other extent,
   * including if they share one or more edges.
   *
   * @param {Extent} extent1 Extent 1.
   * @param {Extent} extent2 Extent 2.
   * @return {boolean} The second extent is contained by or on the edge of the
   *     first.
   * @api
   */
  function containsExtent(extent1, extent2) {
    return extent1[0] <= extent2[0] && extent2[2] <= extent1[2] &&
        extent1[1] <= extent2[1] && extent2[3] <= extent1[3];
  }


  /**
   * Check if the passed coordinate is contained or on the edge of the extent.
   *
   * @param {Extent} extent Extent.
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   * @return {boolean} The x, y values are contained in the extent.
   * @api
   */
  function containsXY(extent, x, y) {
    return extent[0] <= x && x <= extent[2] && extent[1] <= y && y <= extent[3];
  }


  /**
   * Get the relationship between a coordinate and extent.
   * @param {Extent} extent The extent.
   * @param {import("./coordinate.js").Coordinate} coordinate The coordinate.
   * @return {Relationship} The relationship (bitwise compare with
   *     import("./extent/Relationship.js").Relationship).
   */
  function coordinateRelationship(extent, coordinate) {
    var minX = extent[0];
    var minY = extent[1];
    var maxX = extent[2];
    var maxY = extent[3];
    var x = coordinate[0];
    var y = coordinate[1];
    var relationship = Relationship.UNKNOWN;
    if (x < minX) {
      relationship = relationship | Relationship.LEFT;
    } else if (x > maxX) {
      relationship = relationship | Relationship.RIGHT;
    }
    if (y < minY) {
      relationship = relationship | Relationship.BELOW;
    } else if (y > maxY) {
      relationship = relationship | Relationship.ABOVE;
    }
    if (relationship === Relationship.UNKNOWN) {
      relationship = Relationship.INTERSECTING;
    }
    return relationship;
  }


  /**
   * Create an empty extent.
   * @return {Extent} Empty extent.
   * @api
   */
  function createEmpty() {
    return [Infinity, Infinity, -Infinity, -Infinity];
  }


  /**
   * Create a new extent or update the provided extent.
   * @param {number} minX Minimum X.
   * @param {number} minY Minimum Y.
   * @param {number} maxX Maximum X.
   * @param {number} maxY Maximum Y.
   * @param {Extent=} opt_extent Destination extent.
   * @return {Extent} Extent.
   */
  function createOrUpdate(minX, minY, maxX, maxY, opt_extent) {
    if (opt_extent) {
      opt_extent[0] = minX;
      opt_extent[1] = minY;
      opt_extent[2] = maxX;
      opt_extent[3] = maxY;
      return opt_extent;
    } else {
      return [minX, minY, maxX, maxY];
    }
  }


  /**
   * Create a new empty extent or make the provided one empty.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} Extent.
   */
  function createOrUpdateEmpty(opt_extent) {
    return createOrUpdate(
      Infinity, Infinity, -Infinity, -Infinity, opt_extent);
  }


  /**
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} Extent.
   */
  function createOrUpdateFromCoordinate(coordinate, opt_extent) {
    var x = coordinate[0];
    var y = coordinate[1];
    return createOrUpdate(x, y, x, y, opt_extent);
  }


  /**
   * @param {Array<import("./coordinate.js").Coordinate>} coordinates Coordinates.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} Extent.
   */
  function createOrUpdateFromCoordinates(coordinates, opt_extent) {
    var extent = createOrUpdateEmpty(opt_extent);
    return extendCoordinates(extent, coordinates);
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} Extent.
   */
  function createOrUpdateFromFlatCoordinates(flatCoordinates, offset, end, stride, opt_extent) {
    var extent = createOrUpdateEmpty(opt_extent);
    return extendFlatCoordinates(extent, flatCoordinates, offset, end, stride);
  }


  /**
   * Determine if two extents are equivalent.
   * @param {Extent} extent1 Extent 1.
   * @param {Extent} extent2 Extent 2.
   * @return {boolean} The two extents are equivalent.
   * @api
   */
  function equals$2(extent1, extent2) {
    return extent1[0] == extent2[0] && extent1[2] == extent2[2] &&
        extent1[1] == extent2[1] && extent1[3] == extent2[3];
  }


  /**
   * Modify an extent to include another extent.
   * @param {Extent} extent1 The extent to be modified.
   * @param {Extent} extent2 The extent that will be included in the first.
   * @return {Extent} A reference to the first (extended) extent.
   * @api
   */
  function extend$1(extent1, extent2) {
    if (extent2[0] < extent1[0]) {
      extent1[0] = extent2[0];
    }
    if (extent2[2] > extent1[2]) {
      extent1[2] = extent2[2];
    }
    if (extent2[1] < extent1[1]) {
      extent1[1] = extent2[1];
    }
    if (extent2[3] > extent1[3]) {
      extent1[3] = extent2[3];
    }
    return extent1;
  }


  /**
   * @param {Extent} extent Extent.
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
   */
  function extendCoordinate(extent, coordinate) {
    if (coordinate[0] < extent[0]) {
      extent[0] = coordinate[0];
    }
    if (coordinate[0] > extent[2]) {
      extent[2] = coordinate[0];
    }
    if (coordinate[1] < extent[1]) {
      extent[1] = coordinate[1];
    }
    if (coordinate[1] > extent[3]) {
      extent[3] = coordinate[1];
    }
  }


  /**
   * @param {Extent} extent Extent.
   * @param {Array<import("./coordinate.js").Coordinate>} coordinates Coordinates.
   * @return {Extent} Extent.
   */
  function extendCoordinates(extent, coordinates) {
    for (var i = 0, ii = coordinates.length; i < ii; ++i) {
      extendCoordinate(extent, coordinates[i]);
    }
    return extent;
  }


  /**
   * @param {Extent} extent Extent.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @return {Extent} Extent.
   */
  function extendFlatCoordinates(extent, flatCoordinates, offset, end, stride) {
    for (; offset < end; offset += stride) {
      extendXY(extent, flatCoordinates[offset], flatCoordinates[offset + 1]);
    }
    return extent;
  }


  /**
   * @param {Extent} extent Extent.
   * @param {number} x X.
   * @param {number} y Y.
   */
  function extendXY(extent, x, y) {
    extent[0] = Math.min(extent[0], x);
    extent[1] = Math.min(extent[1], y);
    extent[2] = Math.max(extent[2], x);
    extent[3] = Math.max(extent[3], y);
  }


  /**
   * This function calls `callback` for each corner of the extent. If the
   * callback returns a truthy value the function returns that value
   * immediately. Otherwise the function returns `false`.
   * @param {Extent} extent Extent.
   * @param {function(this:T, import("./coordinate.js").Coordinate): S} callback Callback.
   * @param {T=} opt_this Value to use as `this` when executing `callback`.
   * @return {S|boolean} Value.
   * @template S, T
   */
  function forEachCorner(extent, callback, opt_this) {
    var val;
    val = callback.call(opt_this, getBottomLeft(extent));
    if (val) {
      return val;
    }
    val = callback.call(opt_this, getBottomRight(extent));
    if (val) {
      return val;
    }
    val = callback.call(opt_this, getTopRight(extent));
    if (val) {
      return val;
    }
    val = callback.call(opt_this, getTopLeft(extent));
    if (val) {
      return val;
    }
    return false;
  }


  /**
   * Get the size of an extent.
   * @param {Extent} extent Extent.
   * @return {number} Area.
   * @api
   */
  function getArea(extent) {
    var area = 0;
    if (!isEmpty$1(extent)) {
      area = getWidth(extent) * getHeight(extent);
    }
    return area;
  }


  /**
   * Get the bottom left coordinate of an extent.
   * @param {Extent} extent Extent.
   * @return {import("./coordinate.js").Coordinate} Bottom left coordinate.
   * @api
   */
  function getBottomLeft(extent) {
    return [extent[0], extent[1]];
  }


  /**
   * Get the bottom right coordinate of an extent.
   * @param {Extent} extent Extent.
   * @return {import("./coordinate.js").Coordinate} Bottom right coordinate.
   * @api
   */
  function getBottomRight(extent) {
    return [extent[2], extent[1]];
  }


  /**
   * Get the center coordinate of an extent.
   * @param {Extent} extent Extent.
   * @return {import("./coordinate.js").Coordinate} Center.
   * @api
   */
  function getCenter(extent) {
    return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
  }


  /**
   * Get a corner coordinate of an extent.
   * @param {Extent} extent Extent.
   * @param {Corner} corner Corner.
   * @return {import("./coordinate.js").Coordinate} Corner coordinate.
   */
  function getCorner(extent, corner) {
    var coordinate;
    if (corner === Corner.BOTTOM_LEFT) {
      coordinate = getBottomLeft(extent);
    } else if (corner === Corner.BOTTOM_RIGHT) {
      coordinate = getBottomRight(extent);
    } else if (corner === Corner.TOP_LEFT) {
      coordinate = getTopLeft(extent);
    } else if (corner === Corner.TOP_RIGHT) {
      coordinate = getTopRight(extent);
    } else {
      assert(false, 13); // Invalid corner
    }
    return coordinate;
  }


  /**
   * @param {import("./coordinate.js").Coordinate} center Center.
   * @param {number} resolution Resolution.
   * @param {number} rotation Rotation.
   * @param {import("./size.js").Size} size Size.
   * @param {Extent=} opt_extent Destination extent.
   * @return {Extent} Extent.
   */
  function getForViewAndSize(center, resolution, rotation, size, opt_extent) {
    var dx = resolution * size[0] / 2;
    var dy = resolution * size[1] / 2;
    var cosRotation = Math.cos(rotation);
    var sinRotation = Math.sin(rotation);
    var xCos = dx * cosRotation;
    var xSin = dx * sinRotation;
    var yCos = dy * cosRotation;
    var ySin = dy * sinRotation;
    var x = center[0];
    var y = center[1];
    var x0 = x - xCos + ySin;
    var x1 = x - xCos - ySin;
    var x2 = x + xCos - ySin;
    var x3 = x + xCos + ySin;
    var y0 = y - xSin - yCos;
    var y1 = y - xSin + yCos;
    var y2 = y + xSin + yCos;
    var y3 = y + xSin - yCos;
    return createOrUpdate(
      Math.min(x0, x1, x2, x3), Math.min(y0, y1, y2, y3),
      Math.max(x0, x1, x2, x3), Math.max(y0, y1, y2, y3),
      opt_extent);
  }


  /**
   * Get the height of an extent.
   * @param {Extent} extent Extent.
   * @return {number} Height.
   * @api
   */
  function getHeight(extent) {
    return extent[3] - extent[1];
  }


  /**
   * Get the intersection of two extents.
   * @param {Extent} extent1 Extent 1.
   * @param {Extent} extent2 Extent 2.
   * @param {Extent=} opt_extent Optional extent to populate with intersection.
   * @return {Extent} Intersecting extent.
   * @api
   */
  function getIntersection(extent1, extent2, opt_extent) {
    var intersection = opt_extent ? opt_extent : createEmpty();
    if (intersects(extent1, extent2)) {
      if (extent1[0] > extent2[0]) {
        intersection[0] = extent1[0];
      } else {
        intersection[0] = extent2[0];
      }
      if (extent1[1] > extent2[1]) {
        intersection[1] = extent1[1];
      } else {
        intersection[1] = extent2[1];
      }
      if (extent1[2] < extent2[2]) {
        intersection[2] = extent1[2];
      } else {
        intersection[2] = extent2[2];
      }
      if (extent1[3] < extent2[3]) {
        intersection[3] = extent1[3];
      } else {
        intersection[3] = extent2[3];
      }
    } else {
      createOrUpdateEmpty(intersection);
    }
    return intersection;
  }


  /**
   * Get the top left coordinate of an extent.
   * @param {Extent} extent Extent.
   * @return {import("./coordinate.js").Coordinate} Top left coordinate.
   * @api
   */
  function getTopLeft(extent) {
    return [extent[0], extent[3]];
  }


  /**
   * Get the top right coordinate of an extent.
   * @param {Extent} extent Extent.
   * @return {import("./coordinate.js").Coordinate} Top right coordinate.
   * @api
   */
  function getTopRight(extent) {
    return [extent[2], extent[3]];
  }


  /**
   * Get the width of an extent.
   * @param {Extent} extent Extent.
   * @return {number} Width.
   * @api
   */
  function getWidth(extent) {
    return extent[2] - extent[0];
  }


  /**
   * Determine if one extent intersects another.
   * @param {Extent} extent1 Extent 1.
   * @param {Extent} extent2 Extent.
   * @return {boolean} The two extents intersect.
   * @api
   */
  function intersects(extent1, extent2) {
    return extent1[0] <= extent2[2] &&
        extent1[2] >= extent2[0] &&
        extent1[1] <= extent2[3] &&
        extent1[3] >= extent2[1];
  }


  /**
   * Determine if an extent is empty.
   * @param {Extent} extent Extent.
   * @return {boolean} Is empty.
   * @api
   */
  function isEmpty$1(extent) {
    return extent[2] < extent[0] || extent[3] < extent[1];
  }


  /**
   * @param {Extent} extent Extent.
   * @param {Extent=} opt_extent Extent.
   * @return {Extent} Extent.
   */
  function returnOrUpdate(extent, opt_extent) {
    if (opt_extent) {
      opt_extent[0] = extent[0];
      opt_extent[1] = extent[1];
      opt_extent[2] = extent[2];
      opt_extent[3] = extent[3];
      return opt_extent;
    } else {
      return extent;
    }
  }


  /**
   * @param {Extent} extent Extent.
   * @param {number} value Value.
   */
  function scaleFromCenter(extent, value) {
    var deltaX = ((extent[2] - extent[0]) / 2) * (value - 1);
    var deltaY = ((extent[3] - extent[1]) / 2) * (value - 1);
    extent[0] -= deltaX;
    extent[2] += deltaX;
    extent[1] -= deltaY;
    extent[3] += deltaY;
  }


  /**
   * Determine if the segment between two coordinates intersects (crosses,
   * touches, or is contained by) the provided extent.
   * @param {Extent} extent The extent.
   * @param {import("./coordinate.js").Coordinate} start Segment start coordinate.
   * @param {import("./coordinate.js").Coordinate} end Segment end coordinate.
   * @return {boolean} The segment intersects the extent.
   */
  function intersectsSegment(extent, start, end) {
    var intersects = false;
    var startRel = coordinateRelationship(extent, start);
    var endRel = coordinateRelationship(extent, end);
    if (startRel === Relationship.INTERSECTING ||
        endRel === Relationship.INTERSECTING) {
      intersects = true;
    } else {
      var minX = extent[0];
      var minY = extent[1];
      var maxX = extent[2];
      var maxY = extent[3];
      var startX = start[0];
      var startY = start[1];
      var endX = end[0];
      var endY = end[1];
      var slope = (endY - startY) / (endX - startX);
      var x, y;
      if (!!(endRel & Relationship.ABOVE) &&
          !(startRel & Relationship.ABOVE)) {
        // potentially intersects top
        x = endX - ((endY - maxY) / slope);
        intersects = x >= minX && x <= maxX;
      }
      if (!intersects && !!(endRel & Relationship.RIGHT) &&
          !(startRel & Relationship.RIGHT)) {
        // potentially intersects right
        y = endY - ((endX - maxX) * slope);
        intersects = y >= minY && y <= maxY;
      }
      if (!intersects && !!(endRel & Relationship.BELOW) &&
          !(startRel & Relationship.BELOW)) {
        // potentially intersects bottom
        x = endX - ((endY - minY) / slope);
        intersects = x >= minX && x <= maxX;
      }
      if (!intersects && !!(endRel & Relationship.LEFT) &&
          !(startRel & Relationship.LEFT)) {
        // potentially intersects left
        y = endY - ((endX - minX) * slope);
        intersects = y >= minY && y <= maxY;
      }

    }
    return intersects;
  }

  /**
   * @module ol/geom/GeometryType
   */

  /**
   * The geometry type. One of `'Point'`, `'LineString'`, `'LinearRing'`,
   * `'Polygon'`, `'MultiPoint'`, `'MultiLineString'`, `'MultiPolygon'`,
   * `'GeometryCollection'`, `'Circle'`.
   * @enum {string}
   */
  var GeometryType = {
    POINT: 'Point',
    LINE_STRING: 'LineString',
    LINEAR_RING: 'LinearRing',
    POLYGON: 'Polygon',
    MULTI_POINT: 'MultiPoint',
    MULTI_LINE_STRING: 'MultiLineString',
    MULTI_POLYGON: 'MultiPolygon',
    GEOMETRY_COLLECTION: 'GeometryCollection',
    CIRCLE: 'Circle'
  };

  /**
   * @module ol/geom/GeometryLayout
   */

  /**
   * The coordinate layout for geometries, indicating whether a 3rd or 4th z ('Z')
   * or measure ('M') coordinate is available. Supported values are `'XY'`,
   * `'XYZ'`, `'XYM'`, `'XYZM'`.
   * @enum {string}
   */
  var GeometryLayout = {
    XY: 'XY',
    XYZ: 'XYZ',
    XYM: 'XYM',
    XYZM: 'XYZM'
  };

  /**
   * @module ol/geom/flat/transform
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {import("../../transform.js").Transform} transform Transform.
   * @param {Array<number>=} opt_dest Destination.
   * @return {Array<number>} Transformed coordinates.
   */
  function transform2D(flatCoordinates, offset, end, stride, transform, opt_dest) {
    var dest = opt_dest ? opt_dest : [];
    var i = 0;
    for (var j = offset; j < end; j += stride) {
      var x = flatCoordinates[j];
      var y = flatCoordinates[j + 1];
      dest[i++] = transform[0] * x + transform[2] * y + transform[4];
      dest[i++] = transform[1] * x + transform[3] * y + transform[5];
    }
    if (opt_dest && dest.length != i) {
      dest.length = i;
    }
    return dest;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} angle Angle.
   * @param {Array<number>} anchor Rotation anchor point.
   * @param {Array<number>=} opt_dest Destination.
   * @return {Array<number>} Transformed coordinates.
   */
  function rotate$1(flatCoordinates, offset, end, stride, angle, anchor, opt_dest) {
    var dest = opt_dest ? opt_dest : [];
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var anchorX = anchor[0];
    var anchorY = anchor[1];
    var i = 0;
    for (var j = offset; j < end; j += stride) {
      var deltaX = flatCoordinates[j] - anchorX;
      var deltaY = flatCoordinates[j + 1] - anchorY;
      dest[i++] = anchorX + deltaX * cos - deltaY * sin;
      dest[i++] = anchorY + deltaX * sin + deltaY * cos;
      for (var k = j + 2; k < j + stride; ++k) {
        dest[i++] = flatCoordinates[k];
      }
    }
    if (opt_dest && dest.length != i) {
      dest.length = i;
    }
    return dest;
  }


  /**
   * Scale the coordinates.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} sx Scale factor in the x-direction.
   * @param {number} sy Scale factor in the y-direction.
   * @param {Array<number>} anchor Scale anchor point.
   * @param {Array<number>=} opt_dest Destination.
   * @return {Array<number>} Transformed coordinates.
   */
  function scale$1(flatCoordinates, offset, end, stride, sx, sy, anchor, opt_dest) {
    var dest = opt_dest ? opt_dest : [];
    var anchorX = anchor[0];
    var anchorY = anchor[1];
    var i = 0;
    for (var j = offset; j < end; j += stride) {
      var deltaX = flatCoordinates[j] - anchorX;
      var deltaY = flatCoordinates[j + 1] - anchorY;
      dest[i++] = anchorX + sx * deltaX;
      dest[i++] = anchorY + sy * deltaY;
      for (var k = j + 2; k < j + stride; ++k) {
        dest[i++] = flatCoordinates[k];
      }
    }
    if (opt_dest && dest.length != i) {
      dest.length = i;
    }
    return dest;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} deltaX Delta X.
   * @param {number} deltaY Delta Y.
   * @param {Array<number>=} opt_dest Destination.
   * @return {Array<number>} Transformed coordinates.
   */
  function translate(flatCoordinates, offset, end, stride, deltaX, deltaY, opt_dest) {
    var dest = opt_dest ? opt_dest : [];
    var i = 0;
    for (var j = offset; j < end; j += stride) {
      dest[i++] = flatCoordinates[j] + deltaX;
      dest[i++] = flatCoordinates[j + 1] + deltaY;
      for (var k = j + 2; k < j + stride; ++k) {
        dest[i++] = flatCoordinates[k];
      }
    }
    if (opt_dest && dest.length != i) {
      dest.length = i;
    }
    return dest;
  }

  /**
   * @license
   * Latitude/longitude spherical geodesy formulae taken from
   * http://www.movable-type.co.uk/scripts/latlong.html
   * Licensed under CC-BY-3.0.
   */


  /**
   * Object literal with options for the {@link getLength} or {@link getArea}
   * functions.
   * @typedef {Object} SphereMetricOptions
   * @property {import("./proj.js").ProjectionLike} [projection='EPSG:3857']
   * Projection of the  geometry.  By default, the geometry is assumed to be in
   * Web Mercator.
   * @property {number} [radius=6371008.8] Sphere radius.  By default, the radius of the
   * earth is used (Clarke 1866 Authalic Sphere).
   */


  /**
   * The mean Earth radius (1/3 * (2a + b)) for the WGS84 ellipsoid.
   * https://en.wikipedia.org/wiki/Earth_radius#Mean_radius
   * @type {number}
   */
  var DEFAULT_RADIUS = 6371008.8;


  /**
   * Get the great circle distance (in meters) between two geographic coordinates.
   * @param {Array} c1 Starting coordinate.
   * @param {Array} c2 Ending coordinate.
   * @param {number=} opt_radius The sphere radius to use.  Defaults to the Earth's
   *     mean radius using the WGS84 ellipsoid.
   * @return {number} The great circle distance between the points (in meters).
   * @api
   */
  function getDistance(c1, c2, opt_radius) {
    var radius = opt_radius || DEFAULT_RADIUS;
    var lat1 = toRadians(c1[1]);
    var lat2 = toRadians(c2[1]);
    var deltaLatBy2 = (lat2 - lat1) / 2;
    var deltaLonBy2 = toRadians(c2[0] - c1[0]) / 2;
    var a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
        Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
        Math.cos(lat1) * Math.cos(lat2);
    return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * @module ol/proj/Units
   */

  /**
   * Projection units: `'degrees'`, `'ft'`, `'m'`, `'pixels'`, `'tile-pixels'` or
   * `'us-ft'`.
   * @enum {string}
   */
  var Units = {
    DEGREES: 'degrees',
    FEET: 'ft',
    METERS: 'm',
    PIXELS: 'pixels',
    TILE_PIXELS: 'tile-pixels',
    USFEET: 'us-ft'
  };


  /**
   * Meters per unit lookup table.
   * @const
   * @type {Object<Units, number>}
   * @api
   */
  var METERS_PER_UNIT = {};
  // use the radius of the Normal sphere
  METERS_PER_UNIT[Units.DEGREES] = 2 * Math.PI * 6370997 / 360;
  METERS_PER_UNIT[Units.FEET] = 0.3048;
  METERS_PER_UNIT[Units.METERS] = 1;
  METERS_PER_UNIT[Units.USFEET] = 1200 / 3937;

  /**
   * @module ol/proj/Projection
   */


  /**
   * @typedef {Object} Options
   * @property {string} code The SRS identifier code, e.g. `EPSG:4326`.
   * @property {import("./Units.js").default|string} [units] Units. Required unless a
   * proj4 projection is defined for `code`.
   * @property {import("../extent.js").Extent} [extent] The validity extent for the SRS.
   * @property {string} [axisOrientation='enu'] The axis orientation as specified in Proj4.
   * @property {boolean} [global=false] Whether the projection is valid for the whole globe.
   * @property {number} [metersPerUnit] The meters per unit for the SRS.
   * If not provided, the `units` are used to get the meters per unit from the {@link module:ol/proj/Units~METERS_PER_UNIT}
   * lookup table.
   * @property {import("../extent.js").Extent} [worldExtent] The world extent for the SRS.
   * @property {function(number, import("../coordinate.js").Coordinate):number} [getPointResolution]
   * Function to determine resolution at a point. The function is called with a
   * `{number}` view resolution and an `{import("../coordinate.js").Coordinate}` as arguments, and returns
   * the `{number}` resolution at the passed coordinate. If this is `undefined`,
   * the default {@link module:ol/proj#getPointResolution} function will be used.
   */


  /**
   * @classdesc
   * Projection definition class. One of these is created for each projection
   * supported in the application and stored in the {@link module:ol/proj} namespace.
   * You can use these in applications, but this is not required, as API params
   * and options use {@link module:ol/proj~ProjectionLike} which means the simple string
   * code will suffice.
   *
   * You can use {@link module:ol/proj~get} to retrieve the object for a particular
   * projection.
   *
   * The library includes definitions for `EPSG:4326` and `EPSG:3857`, together
   * with the following aliases:
   * * `EPSG:4326`: CRS:84, urn:ogc:def:crs:EPSG:6.6:4326,
   *     urn:ogc:def:crs:OGC:1.3:CRS84, urn:ogc:def:crs:OGC:2:84,
   *     http://www.opengis.net/gml/srs/epsg.xml#4326,
   *     urn:x-ogc:def:crs:EPSG:4326
   * * `EPSG:3857`: EPSG:102100, EPSG:102113, EPSG:900913,
   *     urn:ogc:def:crs:EPSG:6.18:3:3857,
   *     http://www.opengis.net/gml/srs/epsg.xml#3857
   *
   * If you use [proj4js](https://github.com/proj4js/proj4js), aliases can
   * be added using `proj4.defs()`. After all required projection definitions are
   * added, call the {@link module:ol/proj/proj4~register} function.
   *
   * @api
   */
  var Projection = function Projection(options) {
    /**
     * @private
     * @type {string}
     */
    this.code_ = options.code;

    /**
     * Units of projected coordinates. When set to `TILE_PIXELS`, a
     * `this.extent_` and `this.worldExtent_` must be configured properly for each
     * tile.
     * @private
     * @type {import("./Units.js").default}
     */
    this.units_ = /** @type {import("./Units.js").default} */ (options.units);

    /**
     * Validity extent of the projection in projected coordinates. For projections
     * with `TILE_PIXELS` units, this is the extent of the tile in
     * tile pixel space.
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.extent_ = options.extent !== undefined ? options.extent : null;

    /**
     * Extent of the world in EPSG:4326. For projections with
     * `TILE_PIXELS` units, this is the extent of the tile in
     * projected coordinate space.
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.worldExtent_ = options.worldExtent !== undefined ?
      options.worldExtent : null;

    /**
     * @private
     * @type {string}
     */
    this.axisOrientation_ = options.axisOrientation !== undefined ?
      options.axisOrientation : 'enu';

    /**
     * @private
     * @type {boolean}
     */
    this.global_ = options.global !== undefined ? options.global : false;

    /**
     * @private
     * @type {boolean}
     */
    this.canWrapX_ = !!(this.global_ && this.extent_);

    /**
     * @private
     * @type {function(number, import("../coordinate.js").Coordinate):number|undefined}
     */
    this.getPointResolutionFunc_ = options.getPointResolution;

    /**
     * @private
     * @type {import("../tilegrid/TileGrid.js").default}
     */
    this.defaultTileGrid_ = null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.metersPerUnit_ = options.metersPerUnit;
  };

  /**
   * @return {boolean} The projection is suitable for wrapping the x-axis
   */
  Projection.prototype.canWrapX = function canWrapX () {
    return this.canWrapX_;
  };

  /**
   * Get the code for this projection, e.g. 'EPSG:4326'.
   * @return {string} Code.
   * @api
   */
  Projection.prototype.getCode = function getCode () {
    return this.code_;
  };

  /**
   * Get the validity extent for this projection.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  Projection.prototype.getExtent = function getExtent () {
    return this.extent_;
  };

  /**
   * Get the units of this projection.
   * @return {import("./Units.js").default} Units.
   * @api
   */
  Projection.prototype.getUnits = function getUnits () {
    return this.units_;
  };

  /**
   * Get the amount of meters per unit of this projection.If the projection is
   * not configured with `metersPerUnit` or a units identifier, the return is
   * `undefined`.
   * @return {number|undefined} Meters.
   * @api
   */
  Projection.prototype.getMetersPerUnit = function getMetersPerUnit () {
    return this.metersPerUnit_ || METERS_PER_UNIT[this.units_];
  };

  /**
   * Get the world extent for this projection.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  Projection.prototype.getWorldExtent = function getWorldExtent () {
    return this.worldExtent_;
  };

  /**
   * Get the axis orientation of this projection.
   * Example values are:
   * enu - the default easting, northing, elevation.
   * neu - northing, easting, up - useful for "lat/long" geographic coordinates,
   *   or south orientated transverse mercator.
   * wnu - westing, northing, up - some planetary coordinate systems have
   *   "west positive" coordinate systems
   * @return {string} Axis orientation.
   * @api
   */
  Projection.prototype.getAxisOrientation = function getAxisOrientation () {
    return this.axisOrientation_;
  };

  /**
   * Is this projection a global projection which spans the whole world?
   * @return {boolean} Whether the projection is global.
   * @api
   */
  Projection.prototype.isGlobal = function isGlobal () {
    return this.global_;
  };

  /**
   * Set if the projection is a global projection which spans the whole world
   * @param {boolean} global Whether the projection is global.
   * @api
   */
  Projection.prototype.setGlobal = function setGlobal (global) {
    this.global_ = global;
    this.canWrapX_ = !!(global && this.extent_);
  };

  /**
   * @return {import("../tilegrid/TileGrid.js").default} The default tile grid.
   */
  Projection.prototype.getDefaultTileGrid = function getDefaultTileGrid () {
    return this.defaultTileGrid_;
  };

  /**
   * @param {import("../tilegrid/TileGrid.js").default} tileGrid The default tile grid.
   */
  Projection.prototype.setDefaultTileGrid = function setDefaultTileGrid (tileGrid) {
    this.defaultTileGrid_ = tileGrid;
  };

  /**
   * Set the validity extent for this projection.
   * @param {import("../extent.js").Extent} extent Extent.
   * @api
   */
  Projection.prototype.setExtent = function setExtent (extent) {
    this.extent_ = extent;
    this.canWrapX_ = !!(this.global_ && extent);
  };

  /**
   * Set the world extent for this projection.
   * @param {import("../extent.js").Extent} worldExtent World extent
   *   [minlon, minlat, maxlon, maxlat].
   * @api
   */
  Projection.prototype.setWorldExtent = function setWorldExtent (worldExtent) {
    this.worldExtent_ = worldExtent;
  };

  /**
   * Set the getPointResolution function (see {@link module:ol/proj~getPointResolution}
   * for this projection.
   * @param {function(number, import("../coordinate.js").Coordinate):number} func Function
   * @api
   */
  Projection.prototype.setGetPointResolution = function setGetPointResolution (func) {
    this.getPointResolutionFunc_ = func;
  };

  /**
   * Get the custom point resolution function for this projection (if set).
   * @return {function(number, import("../coordinate.js").Coordinate):number|undefined} The custom point
   * resolution function (if set).
   */
  Projection.prototype.getPointResolutionFunc = function getPointResolutionFunc () {
    return this.getPointResolutionFunc_;
  };

  /**
   * @module ol/proj/epsg3857
   */


  /**
   * Radius of WGS84 sphere
   *
   * @const
   * @type {number}
   */
  var RADIUS = 6378137;


  /**
   * @const
   * @type {number}
   */
  var HALF_SIZE = Math.PI * RADIUS;


  /**
   * @const
   * @type {import("../extent.js").Extent}
   */
  var EXTENT = [
    -HALF_SIZE, -HALF_SIZE,
    HALF_SIZE, HALF_SIZE
  ];


  /**
   * @const
   * @type {import("../extent.js").Extent}
   */
  var WORLD_EXTENT = [-180, -85, 180, 85];


  /**
   * @classdesc
   * Projection object for web/spherical Mercator (EPSG:3857).
   */
  var EPSG3857Projection = /*@__PURE__*/(function (Projection) {
    function EPSG3857Projection(code) {
      Projection.call(this, {
        code: code,
        units: Units.METERS,
        extent: EXTENT,
        global: true,
        worldExtent: WORLD_EXTENT,
        getPointResolution: function(resolution, point) {
          return resolution / cosh(point[1] / RADIUS);
        }
      });

    }

    if ( Projection ) EPSG3857Projection.__proto__ = Projection;
    EPSG3857Projection.prototype = Object.create( Projection && Projection.prototype );
    EPSG3857Projection.prototype.constructor = EPSG3857Projection;

    return EPSG3857Projection;
  }(Projection));


  /**
   * Projections equal to EPSG:3857.
   *
   * @const
   * @type {Array<import("./Projection.js").default>}
   */
  var PROJECTIONS = [
    new EPSG3857Projection('EPSG:3857'),
    new EPSG3857Projection('EPSG:102100'),
    new EPSG3857Projection('EPSG:102113'),
    new EPSG3857Projection('EPSG:900913'),
    new EPSG3857Projection('urn:ogc:def:crs:EPSG:6.18:3:3857'),
    new EPSG3857Projection('urn:ogc:def:crs:EPSG::3857'),
    new EPSG3857Projection('http://www.opengis.net/gml/srs/epsg.xml#3857')
  ];


  /**
   * Transformation from EPSG:4326 to EPSG:3857.
   *
   * @param {Array<number>} input Input array of coordinate values.
   * @param {Array<number>=} opt_output Output array of coordinate values.
   * @param {number=} opt_dimension Dimension (default is `2`).
   * @return {Array<number>} Output array of coordinate values.
   */
  function fromEPSG4326(input, opt_output, opt_dimension) {
    var length = input.length;
    var dimension = opt_dimension > 1 ? opt_dimension : 2;
    var output = opt_output;
    if (output === undefined) {
      if (dimension > 2) {
        // preserve values beyond second dimension
        output = input.slice();
      } else {
        output = new Array(length);
      }
    }
    var halfSize = HALF_SIZE;
    for (var i = 0; i < length; i += dimension) {
      output[i] = halfSize * input[i] / 180;
      var y = RADIUS *
          Math.log(Math.tan(Math.PI * (input[i + 1] + 90) / 360));
      if (y > halfSize) {
        y = halfSize;
      } else if (y < -halfSize) {
        y = -halfSize;
      }
      output[i + 1] = y;
    }
    return output;
  }


  /**
   * Transformation from EPSG:3857 to EPSG:4326.
   *
   * @param {Array<number>} input Input array of coordinate values.
   * @param {Array<number>=} opt_output Output array of coordinate values.
   * @param {number=} opt_dimension Dimension (default is `2`).
   * @return {Array<number>} Output array of coordinate values.
   */
  function toEPSG4326(input, opt_output, opt_dimension) {
    var length = input.length;
    var dimension = opt_dimension > 1 ? opt_dimension : 2;
    var output = opt_output;
    if (output === undefined) {
      if (dimension > 2) {
        // preserve values beyond second dimension
        output = input.slice();
      } else {
        output = new Array(length);
      }
    }
    for (var i = 0; i < length; i += dimension) {
      output[i] = 180 * input[i] / HALF_SIZE;
      output[i + 1] = 360 * Math.atan(
        Math.exp(input[i + 1] / RADIUS)) / Math.PI - 90;
    }
    return output;
  }

  /**
   * @module ol/proj/epsg4326
   */


  /**
   * Semi-major radius of the WGS84 ellipsoid.
   *
   * @const
   * @type {number}
   */
  var RADIUS$1 = 6378137;


  /**
   * Extent of the EPSG:4326 projection which is the whole world.
   *
   * @const
   * @type {import("../extent.js").Extent}
   */
  var EXTENT$1 = [-180, -90, 180, 90];


  /**
   * @const
   * @type {number}
   */
  var METERS_PER_UNIT$1 = Math.PI * RADIUS$1 / 180;


  /**
   * @classdesc
   * Projection object for WGS84 geographic coordinates (EPSG:4326).
   *
   * Note that OpenLayers does not strictly comply with the EPSG definition.
   * The EPSG registry defines 4326 as a CRS for Latitude,Longitude (y,x).
   * OpenLayers treats EPSG:4326 as a pseudo-projection, with x,y coordinates.
   */
  var EPSG4326Projection = /*@__PURE__*/(function (Projection) {
    function EPSG4326Projection(code, opt_axisOrientation) {
      Projection.call(this, {
        code: code,
        units: Units.DEGREES,
        extent: EXTENT$1,
        axisOrientation: opt_axisOrientation,
        global: true,
        metersPerUnit: METERS_PER_UNIT$1,
        worldExtent: EXTENT$1
      });

    }

    if ( Projection ) EPSG4326Projection.__proto__ = Projection;
    EPSG4326Projection.prototype = Object.create( Projection && Projection.prototype );
    EPSG4326Projection.prototype.constructor = EPSG4326Projection;

    return EPSG4326Projection;
  }(Projection));


  /**
   * Projections equal to EPSG:4326.
   *
   * @const
   * @type {Array<import("./Projection.js").default>}
   */
  var PROJECTIONS$1 = [
    new EPSG4326Projection('CRS:84'),
    new EPSG4326Projection('EPSG:4326', 'neu'),
    new EPSG4326Projection('urn:ogc:def:crs:EPSG::4326', 'neu'),
    new EPSG4326Projection('urn:ogc:def:crs:EPSG:6.6:4326', 'neu'),
    new EPSG4326Projection('urn:ogc:def:crs:OGC:1.3:CRS84'),
    new EPSG4326Projection('urn:ogc:def:crs:OGC:2:84'),
    new EPSG4326Projection('http://www.opengis.net/gml/srs/epsg.xml#4326', 'neu'),
    new EPSG4326Projection('urn:x-ogc:def:crs:EPSG:4326', 'neu')
  ];

  /**
   * @module ol/proj/projections
   */


  /**
   * @type {Object<string, import("./Projection.js").default>}
   */
  var cache = {};


  /**
   * Get a cached projection by code.
   * @param {string} code The code for the projection.
   * @return {import("./Projection.js").default} The projection (if cached).
   */
  function get(code) {
    return cache[code] || null;
  }


  /**
   * Add a projection to the cache.
   * @param {string} code The projection code.
   * @param {import("./Projection.js").default} projection The projection to cache.
   */
  function add$1(code, projection) {
    cache[code] = projection;
  }

  /**
   * @module ol/proj/transforms
   */


  /**
   * @private
   * @type {!Object<string, Object<string, import("../proj.js").TransformFunction>>}
   */
  var transforms = {};


  /**
   * Registers a conversion function to convert coordinates from the source
   * projection to the destination projection.
   *
   * @param {import("./Projection.js").default} source Source.
   * @param {import("./Projection.js").default} destination Destination.
   * @param {import("../proj.js").TransformFunction} transformFn Transform.
   */
  function add$2(source, destination, transformFn) {
    var sourceCode = source.getCode();
    var destinationCode = destination.getCode();
    if (!(sourceCode in transforms)) {
      transforms[sourceCode] = {};
    }
    transforms[sourceCode][destinationCode] = transformFn;
  }


  /**
   * Get a transform given a source code and a destination code.
   * @param {string} sourceCode The code for the source projection.
   * @param {string} destinationCode The code for the destination projection.
   * @return {import("../proj.js").TransformFunction|undefined} The transform function (if found).
   */
  function get$1(sourceCode, destinationCode) {
    var transform;
    if (sourceCode in transforms && destinationCode in transforms[sourceCode]) {
      transform = transforms[sourceCode][destinationCode];
    }
    return transform;
  }

  /**
   * @module ol/proj
   */

  /**
   * @param {Array<number>} input Input coordinate array.
   * @param {Array<number>=} opt_output Output array of coordinate values.
   * @param {number=} opt_dimension Dimension.
   * @return {Array<number>} Output coordinate array (new array, same coordinate
   *     values).
   */
  function cloneTransform(input, opt_output, opt_dimension) {
    var output;
    if (opt_output !== undefined) {
      for (var i = 0, ii = input.length; i < ii; ++i) {
        opt_output[i] = input[i];
      }
      output = opt_output;
    } else {
      output = input.slice();
    }
    return output;
  }


  /**
   * @param {Array<number>} input Input coordinate array.
   * @param {Array<number>=} opt_output Output array of coordinate values.
   * @param {number=} opt_dimension Dimension.
   * @return {Array<number>} Input coordinate array (same array as input).
   */
  function identityTransform(input, opt_output, opt_dimension) {
    if (opt_output !== undefined && input !== opt_output) {
      for (var i = 0, ii = input.length; i < ii; ++i) {
        opt_output[i] = input[i];
      }
      input = opt_output;
    }
    return input;
  }


  /**
   * Add a Projection object to the list of supported projections that can be
   * looked up by their code.
   *
   * @param {Projection} projection Projection instance.
   * @api
   */
  function addProjection(projection) {
    add$1(projection.getCode(), projection);
    add$2(projection, projection, cloneTransform);
  }


  /**
   * @param {Array<Projection>} projections Projections.
   */
  function addProjections(projections) {
    projections.forEach(addProjection);
  }


  /**
   * Fetches a Projection object for the code specified.
   *
   * @param {ProjectionLike} projectionLike Either a code string which is
   *     a combination of authority and identifier such as "EPSG:4326", or an
   *     existing projection object, or undefined.
   * @return {Projection} Projection object, or null if not in list.
   * @api
   */
  function get$2(projectionLike) {
    return typeof projectionLike === 'string' ?
      get(/** @type {string} */ (projectionLike)) :
      (/** @type {Projection} */ (projectionLike) || null);
  }


  /**
   * Get the resolution of the point in degrees or distance units.
   * For projections with degrees as the unit this will simply return the
   * provided resolution. For other projections the point resolution is
   * by default estimated by transforming the 'point' pixel to EPSG:4326,
   * measuring its width and height on the normal sphere,
   * and taking the average of the width and height.
   * A custom function can be provided for a specific projection, either
   * by setting the `getPointResolution` option in the
   * {@link module:ol/proj/Projection~Projection} constructor or by using
   * {@link module:ol/proj/Projection~Projection#setGetPointResolution} to change an existing
   * projection object.
   * @param {ProjectionLike} projection The projection.
   * @param {number} resolution Nominal resolution in projection units.
   * @param {import("./coordinate.js").Coordinate} point Point to find adjusted resolution at.
   * @param {Units=} opt_units Units to get the point resolution in.
   * Default is the projection's units.
   * @return {number} Point resolution.
   * @api
   */
  function getPointResolution(projection, resolution, point, opt_units) {
    projection = get$2(projection);
    var pointResolution;
    var getter = projection.getPointResolutionFunc();
    if (getter) {
      pointResolution = getter(resolution, point);
    } else {
      var units = projection.getUnits();
      if (units == Units.DEGREES && !opt_units || opt_units == Units.DEGREES) {
        pointResolution = resolution;
      } else {
        // Estimate point resolution by transforming the center pixel to EPSG:4326,
        // measuring its width and height on the normal sphere, and taking the
        // average of the width and height.
        var toEPSG4326 = getTransformFromProjections(projection, get$2('EPSG:4326'));
        var vertices = [
          point[0] - resolution / 2, point[1],
          point[0] + resolution / 2, point[1],
          point[0], point[1] - resolution / 2,
          point[0], point[1] + resolution / 2
        ];
        vertices = toEPSG4326(vertices, vertices, 2);
        var width = getDistance(vertices.slice(0, 2), vertices.slice(2, 4));
        var height = getDistance(vertices.slice(4, 6), vertices.slice(6, 8));
        pointResolution = (width + height) / 2;
        var metersPerUnit = opt_units ?
          METERS_PER_UNIT[opt_units] :
          projection.getMetersPerUnit();
        if (metersPerUnit !== undefined) {
          pointResolution /= metersPerUnit;
        }
      }
    }
    return pointResolution;
  }


  /**
   * Registers transformation functions that don't alter coordinates. Those allow
   * to transform between projections with equal meaning.
   *
   * @param {Array<Projection>} projections Projections.
   * @api
   */
  function addEquivalentProjections(projections) {
    addProjections(projections);
    projections.forEach(function(source) {
      projections.forEach(function(destination) {
        if (source !== destination) {
          add$2(source, destination, cloneTransform);
        }
      });
    });
  }


  /**
   * Registers transformation functions to convert coordinates in any projection
   * in projection1 to any projection in projection2.
   *
   * @param {Array<Projection>} projections1 Projections with equal
   *     meaning.
   * @param {Array<Projection>} projections2 Projections with equal
   *     meaning.
   * @param {TransformFunction} forwardTransform Transformation from any
   *   projection in projection1 to any projection in projection2.
   * @param {TransformFunction} inverseTransform Transform from any projection
   *   in projection2 to any projection in projection1..
   */
  function addEquivalentTransforms(projections1, projections2, forwardTransform, inverseTransform) {
    projections1.forEach(function(projection1) {
      projections2.forEach(function(projection2) {
        add$2(projection1, projection2, forwardTransform);
        add$2(projection2, projection1, inverseTransform);
      });
    });
  }


  /**
   * @param {Projection|string|undefined} projection Projection.
   * @param {string} defaultCode Default code.
   * @return {Projection} Projection.
   */
  function createProjection(projection, defaultCode) {
    if (!projection) {
      return get$2(defaultCode);
    } else if (typeof projection === 'string') {
      return get$2(projection);
    } else {
      return (
        /** @type {Projection} */ (projection)
      );
    }
  }


  /**
   * Transforms a coordinate from longitude/latitude to a different projection.
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate as longitude and latitude, i.e.
   *     an array with longitude as 1st and latitude as 2nd element.
   * @param {ProjectionLike=} opt_projection Target projection. The
   *     default is Web Mercator, i.e. 'EPSG:3857'.
   * @return {import("./coordinate.js").Coordinate} Coordinate projected to the target projection.
   * @api
   */
  function fromLonLat(coordinate, opt_projection) {
    return transform(coordinate, 'EPSG:4326',
      opt_projection !== undefined ? opt_projection : 'EPSG:3857');
  }


  /**
   * Checks if two projections are the same, that is every coordinate in one
   * projection does represent the same geographic point as the same coordinate in
   * the other projection.
   *
   * @param {Projection} projection1 Projection 1.
   * @param {Projection} projection2 Projection 2.
   * @return {boolean} Equivalent.
   * @api
   */
  function equivalent(projection1, projection2) {
    if (projection1 === projection2) {
      return true;
    }
    var equalUnits = projection1.getUnits() === projection2.getUnits();
    if (projection1.getCode() === projection2.getCode()) {
      return equalUnits;
    } else {
      var transformFunc = getTransformFromProjections(projection1, projection2);
      return transformFunc === cloneTransform && equalUnits;
    }
  }


  /**
   * Searches in the list of transform functions for the function for converting
   * coordinates from the source projection to the destination projection.
   *
   * @param {Projection} sourceProjection Source Projection object.
   * @param {Projection} destinationProjection Destination Projection
   *     object.
   * @return {TransformFunction} Transform function.
   */
  function getTransformFromProjections(sourceProjection, destinationProjection) {
    var sourceCode = sourceProjection.getCode();
    var destinationCode = destinationProjection.getCode();
    var transformFunc = get$1(sourceCode, destinationCode);
    if (!transformFunc) {
      transformFunc = identityTransform;
    }
    return transformFunc;
  }


  /**
   * Given the projection-like objects, searches for a transformation
   * function to convert a coordinates array from the source projection to the
   * destination projection.
   *
   * @param {ProjectionLike} source Source.
   * @param {ProjectionLike} destination Destination.
   * @return {TransformFunction} Transform function.
   * @api
   */
  function getTransform(source, destination) {
    var sourceProjection = get$2(source);
    var destinationProjection = get$2(destination);
    return getTransformFromProjections(sourceProjection, destinationProjection);
  }


  /**
   * Transforms a coordinate from source projection to destination projection.
   * This returns a new coordinate (and does not modify the original).
   *
   * See {@link module:ol/proj~transformExtent} for extent transformation.
   * See the transform method of {@link module:ol/geom/Geometry~Geometry} and its
   * subclasses for geometry transforms.
   *
   * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
   * @param {ProjectionLike} source Source projection-like.
   * @param {ProjectionLike} destination Destination projection-like.
   * @return {import("./coordinate.js").Coordinate} Coordinate.
   * @api
   */
  function transform(coordinate, source, destination) {
    var transformFunc = getTransform(source, destination);
    return transformFunc(coordinate, undefined, coordinate.length);
  }

  /**
   * Add transforms to and from EPSG:4326 and EPSG:3857.  This function is called
   * by when this module is executed and should only need to be called again after
   * `clearAllProjections()` is called (e.g. in tests).
   */
  function addCommon() {
    // Add transformations that don't alter coordinates to convert within set of
    // projections with equal meaning.
    addEquivalentProjections(PROJECTIONS);
    addEquivalentProjections(PROJECTIONS$1);
    // Add transformations to convert EPSG:4326 like coordinates to EPSG:3857 like
    // coordinates and back.
    addEquivalentTransforms(PROJECTIONS$1, PROJECTIONS, fromEPSG4326, toEPSG4326);
  }

  addCommon();

  /**
   * @module ol/transform
   */


  /**
   * An array representing an affine 2d transformation for use with
   * {@link module:ol/transform} functions. The array has 6 elements.
   * @typedef {!Array<number>} Transform
   */


  /**
   * Collection of affine 2d transformation functions. The functions work on an
   * array of 6 elements. The element order is compatible with the [SVGMatrix
   * interface](https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix) and is
   * a subset (elements a to f) of a 3×3 matrix:
   * ```
   * [ a c e ]
   * [ b d f ]
   * [ 0 0 1 ]
   * ```
   */


  /**
   * @private
   * @type {Transform}
   */
  var tmp_ = new Array(6);


  /**
   * Create an identity transform.
   * @return {!Transform} Identity transform.
   */
  function create() {
    return [1, 0, 0, 1, 0, 0];
  }


  /**
   * Resets the given transform to an identity transform.
   * @param {!Transform} transform Transform.
   * @return {!Transform} Transform.
   */
  function reset(transform) {
    return set(transform, 1, 0, 0, 1, 0, 0);
  }


  /**
   * Multiply the underlying matrices of two transforms and return the result in
   * the first transform.
   * @param {!Transform} transform1 Transform parameters of matrix 1.
   * @param {!Transform} transform2 Transform parameters of matrix 2.
   * @return {!Transform} transform1 multiplied with transform2.
   */
  function multiply(transform1, transform2) {
    var a1 = transform1[0];
    var b1 = transform1[1];
    var c1 = transform1[2];
    var d1 = transform1[3];
    var e1 = transform1[4];
    var f1 = transform1[5];
    var a2 = transform2[0];
    var b2 = transform2[1];
    var c2 = transform2[2];
    var d2 = transform2[3];
    var e2 = transform2[4];
    var f2 = transform2[5];

    transform1[0] = a1 * a2 + c1 * b2;
    transform1[1] = b1 * a2 + d1 * b2;
    transform1[2] = a1 * c2 + c1 * d2;
    transform1[3] = b1 * c2 + d1 * d2;
    transform1[4] = a1 * e2 + c1 * f2 + e1;
    transform1[5] = b1 * e2 + d1 * f2 + f1;

    return transform1;
  }

  /**
   * Set the transform components a-f on a given transform.
   * @param {!Transform} transform Transform.
   * @param {number} a The a component of the transform.
   * @param {number} b The b component of the transform.
   * @param {number} c The c component of the transform.
   * @param {number} d The d component of the transform.
   * @param {number} e The e component of the transform.
   * @param {number} f The f component of the transform.
   * @return {!Transform} Matrix with transform applied.
   */
  function set(transform, a, b, c, d, e, f) {
    transform[0] = a;
    transform[1] = b;
    transform[2] = c;
    transform[3] = d;
    transform[4] = e;
    transform[5] = f;
    return transform;
  }


  /**
   * Set transform on one matrix from another matrix.
   * @param {!Transform} transform1 Matrix to set transform to.
   * @param {!Transform} transform2 Matrix to set transform from.
   * @return {!Transform} transform1 with transform from transform2 applied.
   */
  function setFromArray(transform1, transform2) {
    transform1[0] = transform2[0];
    transform1[1] = transform2[1];
    transform1[2] = transform2[2];
    transform1[3] = transform2[3];
    transform1[4] = transform2[4];
    transform1[5] = transform2[5];
    return transform1;
  }


  /**
   * Transforms the given coordinate with the given transform returning the
   * resulting, transformed coordinate. The coordinate will be modified in-place.
   *
   * @param {Transform} transform The transformation.
   * @param {import("./coordinate.js").Coordinate|import("./pixel.js").Pixel} coordinate The coordinate to transform.
   * @return {import("./coordinate.js").Coordinate|import("./pixel.js").Pixel} return coordinate so that operations can be
   *     chained together.
   */
  function apply(transform, coordinate) {
    var x = coordinate[0];
    var y = coordinate[1];
    coordinate[0] = transform[0] * x + transform[2] * y + transform[4];
    coordinate[1] = transform[1] * x + transform[3] * y + transform[5];
    return coordinate;
  }


  /**
   * Applies scale to a given transform.
   * @param {!Transform} transform Transform.
   * @param {number} x Scale factor x.
   * @param {number} y Scale factor y.
   * @return {!Transform} The scaled transform.
   */
  function scale$2(transform, x, y) {
    return multiply(transform, set(tmp_, x, 0, 0, y, 0, 0));
  }


  /**
   * Applies translation to the given transform.
   * @param {!Transform} transform Transform.
   * @param {number} dx Translation x.
   * @param {number} dy Translation y.
   * @return {!Transform} The translated transform.
   */
  function translate$1(transform, dx, dy) {
    return multiply(transform, set(tmp_, 1, 0, 0, 1, dx, dy));
  }


  /**
   * Creates a composite transform given an initial translation, scale, rotation, and
   * final translation (in that order only, not commutative).
   * @param {!Transform} transform The transform (will be modified in place).
   * @param {number} dx1 Initial translation x.
   * @param {number} dy1 Initial translation y.
   * @param {number} sx Scale factor x.
   * @param {number} sy Scale factor y.
   * @param {number} angle Rotation (in counter-clockwise radians).
   * @param {number} dx2 Final translation x.
   * @param {number} dy2 Final translation y.
   * @return {!Transform} The composite transform.
   */
  function compose(transform, dx1, dy1, sx, sy, angle, dx2, dy2) {
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    transform[0] = sx * cos;
    transform[1] = sy * sin;
    transform[2] = -sx * sin;
    transform[3] = sy * cos;
    transform[4] = dx2 * sx * cos - dy2 * sx * sin + dx1;
    transform[5] = dx2 * sy * sin + dy2 * sy * cos + dy1;
    return transform;
  }


  /**
   * Invert the given transform.
   * @param {!Transform} transform Transform.
   * @return {!Transform} Inverse of the transform.
   */
  function invert(transform) {
    var det = determinant(transform);
    assert(det !== 0, 32); // Transformation matrix cannot be inverted

    var a = transform[0];
    var b = transform[1];
    var c = transform[2];
    var d = transform[3];
    var e = transform[4];
    var f = transform[5];

    transform[0] = d / det;
    transform[1] = -b / det;
    transform[2] = -c / det;
    transform[3] = a / det;
    transform[4] = (c * f - d * e) / det;
    transform[5] = -(a * f - b * e) / det;

    return transform;
  }


  /**
   * Returns the determinant of the given matrix.
   * @param {!Transform} mat Matrix.
   * @return {number} Determinant.
   */
  function determinant(mat) {
    return mat[0] * mat[3] - mat[1] * mat[2];
  }

  /**
   * @module ol/geom/Geometry
   */


  /**
   * @type {import("../transform.js").Transform}
   */
  var tmpTransform = create();


  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * Base class for vector geometries.
   *
   * To get notified of changes to the geometry, register a listener for the
   * generic `change` event on your geometry instance.
   *
   * @abstract
   * @api
   */
  var Geometry = /*@__PURE__*/(function (BaseObject) {
    function Geometry() {

      BaseObject.call(this);

      /**
       * @private
       * @type {import("../extent.js").Extent}
       */
      this.extent_ = createEmpty();

      /**
       * @private
       * @type {number}
       */
      this.extentRevision_ = -1;

      /**
       * @protected
       * @type {Object<string, Geometry>}
       */
      this.simplifiedGeometryCache = {};

      /**
       * @protected
       * @type {number}
       */
      this.simplifiedGeometryMaxMinSquaredTolerance = 0;

      /**
       * @protected
       * @type {number}
       */
      this.simplifiedGeometryRevision = 0;

    }

    if ( BaseObject ) Geometry.__proto__ = BaseObject;
    Geometry.prototype = Object.create( BaseObject && BaseObject.prototype );
    Geometry.prototype.constructor = Geometry;

    /**
     * Make a complete copy of the geometry.
     * @abstract
     * @return {!Geometry} Clone.
     */
    Geometry.prototype.clone = function clone () {
      return abstract();
    };

    /**
     * @abstract
     * @param {number} x X.
     * @param {number} y Y.
     * @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
     * @param {number} minSquaredDistance Minimum squared distance.
     * @return {number} Minimum squared distance.
     */
    Geometry.prototype.closestPointXY = function closestPointXY (x, y, closestPoint, minSquaredDistance) {
      return abstract();
    };

    /**
     * @param {number} x X.
     * @param {number} y Y.
     * @return {boolean} Contains (x, y).
     */
    Geometry.prototype.containsXY = function containsXY (x, y) {
      return false;
    };

    /**
     * Return the closest point of the geometry to the passed point as
     * {@link module:ol/coordinate~Coordinate coordinate}.
     * @param {import("../coordinate.js").Coordinate} point Point.
     * @param {import("../coordinate.js").Coordinate=} opt_closestPoint Closest point.
     * @return {import("../coordinate.js").Coordinate} Closest point.
     * @api
     */
    Geometry.prototype.getClosestPoint = function getClosestPoint (point, opt_closestPoint) {
      var closestPoint = opt_closestPoint ? opt_closestPoint : [NaN, NaN];
      this.closestPointXY(point[0], point[1], closestPoint, Infinity);
      return closestPoint;
    };

    /**
     * Returns true if this geometry includes the specified coordinate. If the
     * coordinate is on the boundary of the geometry, returns false.
     * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
     * @return {boolean} Contains coordinate.
     * @api
     */
    Geometry.prototype.intersectsCoordinate = function intersectsCoordinate (coordinate) {
      return this.containsXY(coordinate[0], coordinate[1]);
    };

    /**
     * @abstract
     * @param {import("../extent.js").Extent} extent Extent.
     * @protected
     * @return {import("../extent.js").Extent} extent Extent.
     */
    Geometry.prototype.computeExtent = function computeExtent (extent) {
      return abstract();
    };

    /**
     * Get the extent of the geometry.
     * @param {import("../extent.js").Extent=} opt_extent Extent.
     * @return {import("../extent.js").Extent} extent Extent.
     * @api
     */
    Geometry.prototype.getExtent = function getExtent (opt_extent) {
      if (this.extentRevision_ != this.getRevision()) {
        this.extent_ = this.computeExtent(this.extent_);
        this.extentRevision_ = this.getRevision();
      }
      return returnOrUpdate(this.extent_, opt_extent);
    };

    /**
     * Rotate the geometry around a given coordinate. This modifies the geometry
     * coordinates in place.
     * @abstract
     * @param {number} angle Rotation angle in radians.
     * @param {import("../coordinate.js").Coordinate} anchor The rotation center.
     * @api
     */
    Geometry.prototype.rotate = function rotate (angle, anchor) {
      abstract();
    };

    /**
     * Scale the geometry (with an optional origin).  This modifies the geometry
     * coordinates in place.
     * @abstract
     * @param {number} sx The scaling factor in the x-direction.
     * @param {number=} opt_sy The scaling factor in the y-direction (defaults to
     *     sx).
     * @param {import("../coordinate.js").Coordinate=} opt_anchor The scale origin (defaults to the center
     *     of the geometry extent).
     * @api
     */
    Geometry.prototype.scale = function scale (sx, opt_sy, opt_anchor) {
      abstract();
    };

    /**
     * Create a simplified version of this geometry.  For linestrings, this uses
     * the the {@link
     * https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm
     * Douglas Peucker} algorithm.  For polygons, a quantization-based
     * simplification is used to preserve topology.
     * @param {number} tolerance The tolerance distance for simplification.
     * @return {Geometry} A new, simplified version of the original geometry.
     * @api
     */
    Geometry.prototype.simplify = function simplify (tolerance) {
      return this.getSimplifiedGeometry(tolerance * tolerance);
    };

    /**
     * Create a simplified version of this geometry using the Douglas Peucker
     * algorithm.
     * See https://en.wikipedia.org/wiki/Ramer-Douglas-Peucker_algorithm.
     * @abstract
     * @param {number} squaredTolerance Squared tolerance.
     * @return {Geometry} Simplified geometry.
     */
    Geometry.prototype.getSimplifiedGeometry = function getSimplifiedGeometry (squaredTolerance) {
      return abstract();
    };

    /**
     * Get the type of this geometry.
     * @abstract
     * @return {import("./GeometryType.js").default} Geometry type.
     */
    Geometry.prototype.getType = function getType () {
      return abstract();
    };

    /**
     * Apply a transform function to each coordinate of the geometry.
     * The geometry is modified in place.
     * If you do not want the geometry modified in place, first `clone()` it and
     * then use this function on the clone.
     * @abstract
     * @param {import("../proj.js").TransformFunction} transformFn Transform.
     */
    Geometry.prototype.applyTransform = function applyTransform (transformFn) {
      abstract();
    };

    /**
     * Test if the geometry and the passed extent intersect.
     * @abstract
     * @param {import("../extent.js").Extent} extent Extent.
     * @return {boolean} `true` if the geometry and the extent intersect.
     */
    Geometry.prototype.intersectsExtent = function intersectsExtent (extent) {
      return abstract();
    };

    /**
     * Translate the geometry.  This modifies the geometry coordinates in place.  If
     * instead you want a new geometry, first `clone()` this geometry.
     * @abstract
     * @param {number} deltaX Delta X.
     * @param {number} deltaY Delta Y.
     * @api
     */
    Geometry.prototype.translate = function translate (deltaX, deltaY) {
      abstract();
    };

    /**
     * Transform each coordinate of the geometry from one coordinate reference
     * system to another. The geometry is modified in place.
     * For example, a line will be transformed to a line and a circle to a circle.
     * If you do not want the geometry modified in place, first `clone()` it and
     * then use this function on the clone.
     *
     * @param {import("../proj.js").ProjectionLike} source The current projection.  Can be a
     *     string identifier or a {@link module:ol/proj/Projection~Projection} object.
     * @param {import("../proj.js").ProjectionLike} destination The desired projection.  Can be a
     *     string identifier or a {@link module:ol/proj/Projection~Projection} object.
     * @return {Geometry} This geometry.  Note that original geometry is
     *     modified in place.
     * @api
     */
    Geometry.prototype.transform = function transform (source, destination) {
      /** @type {import("../proj/Projection.js").default} */
      var sourceProj = get$2(source);
      var transformFn = sourceProj.getUnits() == Units.TILE_PIXELS ?
        function(inCoordinates, outCoordinates, stride) {
          var pixelExtent = sourceProj.getExtent();
          var projectedExtent = sourceProj.getWorldExtent();
          var scale = getHeight(projectedExtent) / getHeight(pixelExtent);
          compose(tmpTransform,
            projectedExtent[0], projectedExtent[3],
            scale, -scale, 0,
            0, 0);
          transform2D(inCoordinates, 0, inCoordinates.length, stride,
            tmpTransform, outCoordinates);
          return getTransform(sourceProj, destination)(inCoordinates, outCoordinates, stride);
        } :
        getTransform(sourceProj, destination);
      this.applyTransform(transformFn);
      return this;
    };

    return Geometry;
  }(BaseObject));

  /**
   * @module ol/geom/SimpleGeometry
   */

  /**
   * @classdesc
   * Abstract base class; only used for creating subclasses; do not instantiate
   * in apps, as cannot be rendered.
   *
   * @abstract
   * @api
   */
  var SimpleGeometry = /*@__PURE__*/(function (Geometry) {
    function SimpleGeometry() {

      Geometry.call(this);

      /**
       * @protected
       * @type {GeometryLayout}
       */
      this.layout = GeometryLayout.XY;

      /**
       * @protected
       * @type {number}
       */
      this.stride = 2;

      /**
       * @protected
       * @type {Array<number>}
       */
      this.flatCoordinates = null;

    }

    if ( Geometry ) SimpleGeometry.__proto__ = Geometry;
    SimpleGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    SimpleGeometry.prototype.constructor = SimpleGeometry;

    /**
     * @inheritDoc
     */
    SimpleGeometry.prototype.computeExtent = function computeExtent (extent) {
      return createOrUpdateFromFlatCoordinates(this.flatCoordinates,
        0, this.flatCoordinates.length, this.stride, extent);
    };

    /**
     * @abstract
     * @return {Array} Coordinates.
     */
    SimpleGeometry.prototype.getCoordinates = function getCoordinates () {
      return abstract();
    };

    /**
     * Return the first coordinate of the geometry.
     * @return {import("../coordinate.js").Coordinate} First coordinate.
     * @api
     */
    SimpleGeometry.prototype.getFirstCoordinate = function getFirstCoordinate () {
      return this.flatCoordinates.slice(0, this.stride);
    };

    /**
     * @return {Array<number>} Flat coordinates.
     */
    SimpleGeometry.prototype.getFlatCoordinates = function getFlatCoordinates () {
      return this.flatCoordinates;
    };

    /**
     * Return the last coordinate of the geometry.
     * @return {import("../coordinate.js").Coordinate} Last point.
     * @api
     */
    SimpleGeometry.prototype.getLastCoordinate = function getLastCoordinate () {
      return this.flatCoordinates.slice(this.flatCoordinates.length - this.stride);
    };

    /**
     * Return the {@link module:ol/geom/GeometryLayout layout} of the geometry.
     * @return {GeometryLayout} Layout.
     * @api
     */
    SimpleGeometry.prototype.getLayout = function getLayout () {
      return this.layout;
    };

    /**
     * @inheritDoc
     */
    SimpleGeometry.prototype.getSimplifiedGeometry = function getSimplifiedGeometry (squaredTolerance) {
      if (this.simplifiedGeometryRevision != this.getRevision()) {
        clear(this.simplifiedGeometryCache);
        this.simplifiedGeometryMaxMinSquaredTolerance = 0;
        this.simplifiedGeometryRevision = this.getRevision();
      }
      // If squaredTolerance is negative or if we know that simplification will not
      // have any effect then just return this.
      if (squaredTolerance < 0 ||
          (this.simplifiedGeometryMaxMinSquaredTolerance !== 0 &&
           squaredTolerance <= this.simplifiedGeometryMaxMinSquaredTolerance)) {
        return this;
      }
      var key = squaredTolerance.toString();
      if (this.simplifiedGeometryCache.hasOwnProperty(key)) {
        return this.simplifiedGeometryCache[key];
      } else {
        var simplifiedGeometry =
            this.getSimplifiedGeometryInternal(squaredTolerance);
        var simplifiedFlatCoordinates = simplifiedGeometry.getFlatCoordinates();
        if (simplifiedFlatCoordinates.length < this.flatCoordinates.length) {
          this.simplifiedGeometryCache[key] = simplifiedGeometry;
          return simplifiedGeometry;
        } else {
          // Simplification did not actually remove any coordinates.  We now know
          // that any calls to getSimplifiedGeometry with a squaredTolerance less
          // than or equal to the current squaredTolerance will also not have any
          // effect.  This allows us to short circuit simplification (saving CPU
          // cycles) and prevents the cache of simplified geometries from filling
          // up with useless identical copies of this geometry (saving memory).
          this.simplifiedGeometryMaxMinSquaredTolerance = squaredTolerance;
          return this;
        }
      }
    };

    /**
     * @param {number} squaredTolerance Squared tolerance.
     * @return {SimpleGeometry} Simplified geometry.
     * @protected
     */
    SimpleGeometry.prototype.getSimplifiedGeometryInternal = function getSimplifiedGeometryInternal (squaredTolerance) {
      return this;
    };

    /**
     * @return {number} Stride.
     */
    SimpleGeometry.prototype.getStride = function getStride () {
      return this.stride;
    };

    /**
     * @param {GeometryLayout} layout Layout.
     * @param {Array<number>} flatCoordinates Flat coordinates.
     */
    SimpleGeometry.prototype.setFlatCoordinates = function setFlatCoordinates (layout, flatCoordinates) {
      this.stride = getStrideForLayout(layout);
      this.layout = layout;
      this.flatCoordinates = flatCoordinates;
    };

    /**
     * @abstract
     * @param {!Array} coordinates Coordinates.
     * @param {GeometryLayout=} opt_layout Layout.
     */
    SimpleGeometry.prototype.setCoordinates = function setCoordinates (coordinates, opt_layout) {
      abstract();
    };

    /**
     * @param {GeometryLayout|undefined} layout Layout.
     * @param {Array} coordinates Coordinates.
     * @param {number} nesting Nesting.
     * @protected
     */
    SimpleGeometry.prototype.setLayout = function setLayout (layout, coordinates, nesting) {
      /** @type {number} */
      var stride;
      if (layout) {
        stride = getStrideForLayout(layout);
      } else {
        for (var i = 0; i < nesting; ++i) {
          if (coordinates.length === 0) {
            this.layout = GeometryLayout.XY;
            this.stride = 2;
            return;
          } else {
            coordinates = /** @type {Array} */ (coordinates[0]);
          }
        }
        stride = coordinates.length;
        layout = getLayoutForStride(stride);
      }
      this.layout = layout;
      this.stride = stride;
    };

    /**
     * @inheritDoc
     * @api
     */
    SimpleGeometry.prototype.applyTransform = function applyTransform (transformFn) {
      if (this.flatCoordinates) {
        transformFn(this.flatCoordinates, this.flatCoordinates, this.stride);
        this.changed();
      }
    };

    /**
     * @inheritDoc
     * @api
     */
    SimpleGeometry.prototype.rotate = function rotate$1$1 (angle, anchor) {
      var flatCoordinates = this.getFlatCoordinates();
      if (flatCoordinates) {
        var stride = this.getStride();
        rotate$1(
          flatCoordinates, 0, flatCoordinates.length,
          stride, angle, anchor, flatCoordinates);
        this.changed();
      }
    };

    /**
     * @inheritDoc
     * @api
     */
    SimpleGeometry.prototype.scale = function scale$1$1 (sx, opt_sy, opt_anchor) {
      var sy = opt_sy;
      if (sy === undefined) {
        sy = sx;
      }
      var anchor = opt_anchor;
      if (!anchor) {
        anchor = getCenter(this.getExtent());
      }
      var flatCoordinates = this.getFlatCoordinates();
      if (flatCoordinates) {
        var stride = this.getStride();
        scale$1(
          flatCoordinates, 0, flatCoordinates.length,
          stride, sx, sy, anchor, flatCoordinates);
        this.changed();
      }
    };

    /**
     * @inheritDoc
     * @api
     */
    SimpleGeometry.prototype.translate = function translate$1 (deltaX, deltaY) {
      var flatCoordinates = this.getFlatCoordinates();
      if (flatCoordinates) {
        var stride = this.getStride();
        translate(
          flatCoordinates, 0, flatCoordinates.length, stride,
          deltaX, deltaY, flatCoordinates);
        this.changed();
      }
    };

    return SimpleGeometry;
  }(Geometry));


  /**
   * @param {number} stride Stride.
   * @return {GeometryLayout} layout Layout.
   */
  function getLayoutForStride(stride) {
    var layout;
    if (stride == 2) {
      layout = GeometryLayout.XY;
    } else if (stride == 3) {
      layout = GeometryLayout.XYZ;
    } else if (stride == 4) {
      layout = GeometryLayout.XYZM;
    }
    return (
      /** @type {GeometryLayout} */ (layout)
    );
  }


  /**
   * @param {GeometryLayout} layout Layout.
   * @return {number} Stride.
   */
  function getStrideForLayout(layout) {
    var stride;
    if (layout == GeometryLayout.XY) {
      stride = 2;
    } else if (layout == GeometryLayout.XYZ || layout == GeometryLayout.XYM) {
      stride = 3;
    } else if (layout == GeometryLayout.XYZM) {
      stride = 4;
    }
    return /** @type {number} */ (stride);
  }


  /**
   * @param {SimpleGeometry} simpleGeometry Simple geometry.
   * @param {import("../transform.js").Transform} transform Transform.
   * @param {Array<number>=} opt_dest Destination.
   * @return {Array<number>} Transformed flat coordinates.
   */
  function transformGeom2D(simpleGeometry, transform, opt_dest) {
    var flatCoordinates = simpleGeometry.getFlatCoordinates();
    if (!flatCoordinates) {
      return null;
    } else {
      var stride = simpleGeometry.getStride();
      return transform2D(
        flatCoordinates, 0, flatCoordinates.length, stride,
        transform, opt_dest);
    }
  }

  /**
   * @module ol/geom/flat/area
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @return {number} Area.
   */
  function linearRing(flatCoordinates, offset, end, stride) {
    var twiceArea = 0;
    var x1 = flatCoordinates[end - stride];
    var y1 = flatCoordinates[end - stride + 1];
    for (; offset < end; offset += stride) {
      var x2 = flatCoordinates[offset];
      var y2 = flatCoordinates[offset + 1];
      twiceArea += y1 * x2 - x1 * y2;
      x1 = x2;
      y1 = y2;
    }
    return twiceArea / 2;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @return {number} Area.
   */
  function linearRings(flatCoordinates, offset, ends, stride) {
    var area = 0;
    for (var i = 0, ii = ends.length; i < ii; ++i) {
      var end = ends[i];
      area += linearRing(flatCoordinates, offset, end, stride);
      offset = end;
    }
    return area;
  }

  /**
   * @module ol/geom/flat/closest
   */


  /**
   * Returns the point on the 2D line segment flatCoordinates[offset1] to
   * flatCoordinates[offset2] that is closest to the point (x, y).  Extra
   * dimensions are linearly interpolated.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset1 Offset 1.
   * @param {number} offset2 Offset 2.
   * @param {number} stride Stride.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {Array<number>} closestPoint Closest point.
   */
  function assignClosest(flatCoordinates, offset1, offset2, stride, x, y, closestPoint) {
    var x1 = flatCoordinates[offset1];
    var y1 = flatCoordinates[offset1 + 1];
    var dx = flatCoordinates[offset2] - x1;
    var dy = flatCoordinates[offset2 + 1] - y1;
    var offset;
    if (dx === 0 && dy === 0) {
      offset = offset1;
    } else {
      var t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        offset = offset2;
      } else if (t > 0) {
        for (var i = 0; i < stride; ++i) {
          closestPoint[i] = lerp(flatCoordinates[offset1 + i],
            flatCoordinates[offset2 + i], t);
        }
        closestPoint.length = stride;
        return;
      } else {
        offset = offset1;
      }
    }
    for (var i$1 = 0; i$1 < stride; ++i$1) {
      closestPoint[i$1] = flatCoordinates[offset + i$1];
    }
    closestPoint.length = stride;
  }


  /**
   * Return the squared of the largest distance between any pair of consecutive
   * coordinates.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} max Max squared delta.
   * @return {number} Max squared delta.
   */
  function maxSquaredDelta(flatCoordinates, offset, end, stride, max) {
    var x1 = flatCoordinates[offset];
    var y1 = flatCoordinates[offset + 1];
    for (offset += stride; offset < end; offset += stride) {
      var x2 = flatCoordinates[offset];
      var y2 = flatCoordinates[offset + 1];
      var squaredDelta = squaredDistance(x1, y1, x2, y2);
      if (squaredDelta > max) {
        max = squaredDelta;
      }
      x1 = x2;
      y1 = y2;
    }
    return max;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {number} max Max squared delta.
   * @return {number} Max squared delta.
   */
  function arrayMaxSquaredDelta(flatCoordinates, offset, ends, stride, max) {
    for (var i = 0, ii = ends.length; i < ii; ++i) {
      var end = ends[i];
      max = maxSquaredDelta(
        flatCoordinates, offset, end, stride, max);
      offset = end;
    }
    return max;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} maxDelta Max delta.
   * @param {boolean} isRing Is ring.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {Array<number>} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @param {Array<number>=} opt_tmpPoint Temporary point object.
   * @return {number} Minimum squared distance.
   */
  function assignClosestPoint(flatCoordinates, offset, end,
    stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance,
    opt_tmpPoint) {
    if (offset == end) {
      return minSquaredDistance;
    }
    var i, squaredDistance$1;
    if (maxDelta === 0) {
      // All points are identical, so just test the first point.
      squaredDistance$1 = squaredDistance(
        x, y, flatCoordinates[offset], flatCoordinates[offset + 1]);
      if (squaredDistance$1 < minSquaredDistance) {
        for (i = 0; i < stride; ++i) {
          closestPoint[i] = flatCoordinates[offset + i];
        }
        closestPoint.length = stride;
        return squaredDistance$1;
      } else {
        return minSquaredDistance;
      }
    }
    var tmpPoint = opt_tmpPoint ? opt_tmpPoint : [NaN, NaN];
    var index = offset + stride;
    while (index < end) {
      assignClosest(
        flatCoordinates, index - stride, index, stride, x, y, tmpPoint);
      squaredDistance$1 = squaredDistance(x, y, tmpPoint[0], tmpPoint[1]);
      if (squaredDistance$1 < minSquaredDistance) {
        minSquaredDistance = squaredDistance$1;
        for (i = 0; i < stride; ++i) {
          closestPoint[i] = tmpPoint[i];
        }
        closestPoint.length = stride;
        index += stride;
      } else {
        // Skip ahead multiple points, because we know that all the skipped
        // points cannot be any closer than the closest point we have found so
        // far.  We know this because we know how close the current point is, how
        // close the closest point we have found so far is, and the maximum
        // distance between consecutive points.  For example, if we're currently
        // at distance 10, the best we've found so far is 3, and that the maximum
        // distance between consecutive points is 2, then we'll need to skip at
        // least (10 - 3) / 2 == 3 (rounded down) points to have any chance of
        // finding a closer point.  We use Math.max(..., 1) to ensure that we
        // always advance at least one point, to avoid an infinite loop.
        index += stride * Math.max(
          ((Math.sqrt(squaredDistance$1) -
              Math.sqrt(minSquaredDistance)) / maxDelta) | 0, 1);
      }
    }
    if (isRing) {
      // Check the closing segment.
      assignClosest(
        flatCoordinates, end - stride, offset, stride, x, y, tmpPoint);
      squaredDistance$1 = squaredDistance(x, y, tmpPoint[0], tmpPoint[1]);
      if (squaredDistance$1 < minSquaredDistance) {
        minSquaredDistance = squaredDistance$1;
        for (i = 0; i < stride; ++i) {
          closestPoint[i] = tmpPoint[i];
        }
        closestPoint.length = stride;
      }
    }
    return minSquaredDistance;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {number} maxDelta Max delta.
   * @param {boolean} isRing Is ring.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {Array<number>} closestPoint Closest point.
   * @param {number} minSquaredDistance Minimum squared distance.
   * @param {Array<number>=} opt_tmpPoint Temporary point object.
   * @return {number} Minimum squared distance.
   */
  function assignClosestArrayPoint(flatCoordinates, offset, ends,
    stride, maxDelta, isRing, x, y, closestPoint, minSquaredDistance,
    opt_tmpPoint) {
    var tmpPoint = opt_tmpPoint ? opt_tmpPoint : [NaN, NaN];
    for (var i = 0, ii = ends.length; i < ii; ++i) {
      var end = ends[i];
      minSquaredDistance = assignClosestPoint(
        flatCoordinates, offset, end, stride,
        maxDelta, isRing, x, y, closestPoint, minSquaredDistance, tmpPoint);
      offset = end;
    }
    return minSquaredDistance;
  }

  /**
   * @module ol/geom/flat/deflate
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} stride Stride.
   * @return {number} offset Offset.
   */
  function deflateCoordinate(flatCoordinates, offset, coordinate, stride) {
    for (var i = 0, ii = coordinate.length; i < ii; ++i) {
      flatCoordinates[offset++] = coordinate[i];
    }
    return offset;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<import("../../coordinate.js").Coordinate>} coordinates Coordinates.
   * @param {number} stride Stride.
   * @return {number} offset Offset.
   */
  function deflateCoordinates(flatCoordinates, offset, coordinates, stride) {
    for (var i = 0, ii = coordinates.length; i < ii; ++i) {
      var coordinate = coordinates[i];
      for (var j = 0; j < stride; ++j) {
        flatCoordinates[offset++] = coordinate[j];
      }
    }
    return offset;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<Array<import("../../coordinate.js").Coordinate>>} coordinatess Coordinatess.
   * @param {number} stride Stride.
   * @param {Array<number>=} opt_ends Ends.
   * @return {Array<number>} Ends.
   */
  function deflateCoordinatesArray(flatCoordinates, offset, coordinatess, stride, opt_ends) {
    var ends = opt_ends ? opt_ends : [];
    var i = 0;
    for (var j = 0, jj = coordinatess.length; j < jj; ++j) {
      var end = deflateCoordinates(
        flatCoordinates, offset, coordinatess[j], stride);
      ends[i++] = end;
      offset = end;
    }
    ends.length = i;
    return ends;
  }

  /**
   * @module ol/geom/flat/inflate
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {Array<import("../../coordinate.js").Coordinate>=} opt_coordinates Coordinates.
   * @return {Array<import("../../coordinate.js").Coordinate>} Coordinates.
   */
  function inflateCoordinates(flatCoordinates, offset, end, stride, opt_coordinates) {
    var coordinates = opt_coordinates !== undefined ? opt_coordinates : [];
    var i = 0;
    for (var j = offset; j < end; j += stride) {
      coordinates[i++] = flatCoordinates.slice(j, j + stride);
    }
    coordinates.length = i;
    return coordinates;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {Array<Array<import("../../coordinate.js").Coordinate>>=} opt_coordinatess Coordinatess.
   * @return {Array<Array<import("../../coordinate.js").Coordinate>>} Coordinatess.
   */
  function inflateCoordinatesArray(flatCoordinates, offset, ends, stride, opt_coordinatess) {
    var coordinatess = opt_coordinatess !== undefined ? opt_coordinatess : [];
    var i = 0;
    for (var j = 0, jj = ends.length; j < jj; ++j) {
      var end = ends[j];
      coordinatess[i++] = inflateCoordinates(
        flatCoordinates, offset, end, stride, coordinatess[i]);
      offset = end;
    }
    coordinatess.length = i;
    return coordinatess;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<Array<number>>} endss Endss.
   * @param {number} stride Stride.
   * @param {Array<Array<Array<import("../../coordinate.js").Coordinate>>>=} opt_coordinatesss
   *     Coordinatesss.
   * @return {Array<Array<Array<import("../../coordinate.js").Coordinate>>>} Coordinatesss.
   */
  function inflateMultiCoordinatesArray(flatCoordinates, offset, endss, stride, opt_coordinatesss) {
    var coordinatesss = opt_coordinatesss !== undefined ? opt_coordinatesss : [];
    var i = 0;
    for (var j = 0, jj = endss.length; j < jj; ++j) {
      var ends = endss[j];
      coordinatesss[i++] = inflateCoordinatesArray(
        flatCoordinates, offset, ends, stride, coordinatesss[i]);
      offset = ends[ends.length - 1];
    }
    coordinatesss.length = i;
    return coordinatesss;
  }

  /**
   * @module ol/geom/flat/simplify
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} squaredTolerance Squared tolerance.
   * @param {Array<number>} simplifiedFlatCoordinates Simplified flat
   *     coordinates.
   * @param {number} simplifiedOffset Simplified offset.
   * @return {number} Simplified offset.
   */
  function douglasPeucker(flatCoordinates, offset, end,
    stride, squaredTolerance, simplifiedFlatCoordinates, simplifiedOffset) {
    var n = (end - offset) / stride;
    if (n < 3) {
      for (; offset < end; offset += stride) {
        simplifiedFlatCoordinates[simplifiedOffset++] =
            flatCoordinates[offset];
        simplifiedFlatCoordinates[simplifiedOffset++] =
            flatCoordinates[offset + 1];
      }
      return simplifiedOffset;
    }
    /** @type {Array<number>} */
    var markers = new Array(n);
    markers[0] = 1;
    markers[n - 1] = 1;
    /** @type {Array<number>} */
    var stack = [offset, end - stride];
    var index = 0;
    while (stack.length > 0) {
      var last = stack.pop();
      var first = stack.pop();
      var maxSquaredDistance = 0;
      var x1 = flatCoordinates[first];
      var y1 = flatCoordinates[first + 1];
      var x2 = flatCoordinates[last];
      var y2 = flatCoordinates[last + 1];
      for (var i = first + stride; i < last; i += stride) {
        var x = flatCoordinates[i];
        var y = flatCoordinates[i + 1];
        var squaredDistance = squaredSegmentDistance(
          x, y, x1, y1, x2, y2);
        if (squaredDistance > maxSquaredDistance) {
          index = i;
          maxSquaredDistance = squaredDistance;
        }
      }
      if (maxSquaredDistance > squaredTolerance) {
        markers[(index - offset) / stride] = 1;
        if (first + stride < index) {
          stack.push(first, index);
        }
        if (index + stride < last) {
          stack.push(index, last);
        }
      }
    }
    for (var i$1 = 0; i$1 < n; ++i$1) {
      if (markers[i$1]) {
        simplifiedFlatCoordinates[simplifiedOffset++] =
            flatCoordinates[offset + i$1 * stride];
        simplifiedFlatCoordinates[simplifiedOffset++] =
            flatCoordinates[offset + i$1 * stride + 1];
      }
    }
    return simplifiedOffset;
  }


  /**
   * @param {number} value Value.
   * @param {number} tolerance Tolerance.
   * @return {number} Rounded value.
   */
  function snap(value, tolerance) {
    return tolerance * Math.round(value / tolerance);
  }


  /**
   * Simplifies a line string using an algorithm designed by Tim Schaub.
   * Coordinates are snapped to the nearest value in a virtual grid and
   * consecutive duplicate coordinates are discarded.  This effectively preserves
   * topology as the simplification of any subsection of a line string is
   * independent of the rest of the line string.  This means that, for examples,
   * the common edge between two polygons will be simplified to the same line
   * string independently in both polygons.  This implementation uses a single
   * pass over the coordinates and eliminates intermediate collinear points.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} tolerance Tolerance.
   * @param {Array<number>} simplifiedFlatCoordinates Simplified flat
   *     coordinates.
   * @param {number} simplifiedOffset Simplified offset.
   * @return {number} Simplified offset.
   */
  function quantize(flatCoordinates, offset, end, stride,
    tolerance, simplifiedFlatCoordinates, simplifiedOffset) {
    // do nothing if the line is empty
    if (offset == end) {
      return simplifiedOffset;
    }
    // snap the first coordinate (P1)
    var x1 = snap(flatCoordinates[offset], tolerance);
    var y1 = snap(flatCoordinates[offset + 1], tolerance);
    offset += stride;
    // add the first coordinate to the output
    simplifiedFlatCoordinates[simplifiedOffset++] = x1;
    simplifiedFlatCoordinates[simplifiedOffset++] = y1;
    // find the next coordinate that does not snap to the same value as the first
    // coordinate (P2)
    var x2, y2;
    do {
      x2 = snap(flatCoordinates[offset], tolerance);
      y2 = snap(flatCoordinates[offset + 1], tolerance);
      offset += stride;
      if (offset == end) {
        // all coordinates snap to the same value, the line collapses to a point
        // push the last snapped value anyway to ensure that the output contains
        // at least two points
        // FIXME should we really return at least two points anyway?
        simplifiedFlatCoordinates[simplifiedOffset++] = x2;
        simplifiedFlatCoordinates[simplifiedOffset++] = y2;
        return simplifiedOffset;
      }
    } while (x2 == x1 && y2 == y1);
    while (offset < end) {
      // snap the next coordinate (P3)
      var x3 = snap(flatCoordinates[offset], tolerance);
      var y3 = snap(flatCoordinates[offset + 1], tolerance);
      offset += stride;
      // skip P3 if it is equal to P2
      if (x3 == x2 && y3 == y2) {
        continue;
      }
      // calculate the delta between P1 and P2
      var dx1 = x2 - x1;
      var dy1 = y2 - y1;
      // calculate the delta between P3 and P1
      var dx2 = x3 - x1;
      var dy2 = y3 - y1;
      // if P1, P2, and P3 are colinear and P3 is further from P1 than P2 is from
      // P1 in the same direction then P2 is on the straight line between P1 and
      // P3
      if ((dx1 * dy2 == dy1 * dx2) &&
          ((dx1 < 0 && dx2 < dx1) || dx1 == dx2 || (dx1 > 0 && dx2 > dx1)) &&
          ((dy1 < 0 && dy2 < dy1) || dy1 == dy2 || (dy1 > 0 && dy2 > dy1))) {
        // discard P2 and set P2 = P3
        x2 = x3;
        y2 = y3;
        continue;
      }
      // either P1, P2, and P3 are not colinear, or they are colinear but P3 is
      // between P3 and P1 or on the opposite half of the line to P2.  add P2,
      // and continue with P1 = P2 and P2 = P3
      simplifiedFlatCoordinates[simplifiedOffset++] = x2;
      simplifiedFlatCoordinates[simplifiedOffset++] = y2;
      x1 = x2;
      y1 = y2;
      x2 = x3;
      y2 = y3;
    }
    // add the last point (P2)
    simplifiedFlatCoordinates[simplifiedOffset++] = x2;
    simplifiedFlatCoordinates[simplifiedOffset++] = y2;
    return simplifiedOffset;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {number} tolerance Tolerance.
   * @param {Array<number>} simplifiedFlatCoordinates Simplified flat
   *     coordinates.
   * @param {number} simplifiedOffset Simplified offset.
   * @param {Array<number>} simplifiedEnds Simplified ends.
   * @return {number} Simplified offset.
   */
  function quantizeArray(
    flatCoordinates, offset, ends, stride,
    tolerance,
    simplifiedFlatCoordinates, simplifiedOffset, simplifiedEnds) {
    for (var i = 0, ii = ends.length; i < ii; ++i) {
      var end = ends[i];
      simplifiedOffset = quantize(
        flatCoordinates, offset, end, stride,
        tolerance,
        simplifiedFlatCoordinates, simplifiedOffset);
      simplifiedEnds.push(simplifiedOffset);
      offset = end;
    }
    return simplifiedOffset;
  }

  /**
   * @module ol/geom/LinearRing
   */

  /**
   * @classdesc
   * Linear ring geometry. Only used as part of polygon; cannot be rendered
   * on its own.
   *
   * @api
   */
  var LinearRing = /*@__PURE__*/(function (SimpleGeometry) {
    function LinearRing(coordinates, opt_layout) {

      SimpleGeometry.call(this);

      /**
       * @private
       * @type {number}
       */
      this.maxDelta_ = -1;

      /**
       * @private
       * @type {number}
       */
      this.maxDeltaRevision_ = -1;

      if (opt_layout !== undefined && !Array.isArray(coordinates[0])) {
        this.setFlatCoordinates(opt_layout, /** @type {Array<number>} */ (coordinates));
      } else {
        this.setCoordinates(/** @type {Array<import("../coordinate.js").Coordinate>} */ (coordinates), opt_layout);
      }

    }

    if ( SimpleGeometry ) LinearRing.__proto__ = SimpleGeometry;
    LinearRing.prototype = Object.create( SimpleGeometry && SimpleGeometry.prototype );
    LinearRing.prototype.constructor = LinearRing;

    /**
     * Make a complete copy of the geometry.
     * @return {!LinearRing} Clone.
     * @override
     * @api
     */
    LinearRing.prototype.clone = function clone () {
      return new LinearRing(this.flatCoordinates.slice(), this.layout);
    };

    /**
     * @inheritDoc
     */
    LinearRing.prototype.closestPointXY = function closestPointXY (x, y, closestPoint, minSquaredDistance) {
      if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
        return minSquaredDistance;
      }
      if (this.maxDeltaRevision_ != this.getRevision()) {
        this.maxDelta_ = Math.sqrt(maxSquaredDelta(
          this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, 0));
        this.maxDeltaRevision_ = this.getRevision();
      }
      return assignClosestPoint(
        this.flatCoordinates, 0, this.flatCoordinates.length, this.stride,
        this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
    };

    /**
     * Return the area of the linear ring on projected plane.
     * @return {number} Area (on projected plane).
     * @api
     */
    LinearRing.prototype.getArea = function getArea () {
      return linearRing(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
    };

    /**
     * Return the coordinates of the linear ring.
     * @return {Array<import("../coordinate.js").Coordinate>} Coordinates.
     * @override
     * @api
     */
    LinearRing.prototype.getCoordinates = function getCoordinates () {
      return inflateCoordinates(
        this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
    };

    /**
     * @inheritDoc
     */
    LinearRing.prototype.getSimplifiedGeometryInternal = function getSimplifiedGeometryInternal (squaredTolerance) {
      var simplifiedFlatCoordinates = [];
      simplifiedFlatCoordinates.length = douglasPeucker(
        this.flatCoordinates, 0, this.flatCoordinates.length, this.stride,
        squaredTolerance, simplifiedFlatCoordinates, 0);
      return new LinearRing(simplifiedFlatCoordinates, GeometryLayout.XY);
    };

    /**
     * @inheritDoc
     * @api
     */
    LinearRing.prototype.getType = function getType () {
      return GeometryType.LINEAR_RING;
    };

    /**
     * @inheritDoc
     */
    LinearRing.prototype.intersectsExtent = function intersectsExtent (extent) {
      return false;
    };

    /**
     * Set the coordinates of the linear ring.
     * @param {!Array<import("../coordinate.js").Coordinate>} coordinates Coordinates.
     * @param {GeometryLayout=} opt_layout Layout.
     * @override
     * @api
     */
    LinearRing.prototype.setCoordinates = function setCoordinates (coordinates, opt_layout) {
      this.setLayout(opt_layout, coordinates, 1);
      if (!this.flatCoordinates) {
        this.flatCoordinates = [];
      }
      this.flatCoordinates.length = deflateCoordinates(
        this.flatCoordinates, 0, coordinates, this.stride);
      this.changed();
    };

    return LinearRing;
  }(SimpleGeometry));

  /**
   * @module ol/geom/Point
   */

  /**
   * @classdesc
   * Point geometry.
   *
   * @api
   */
  var Point = /*@__PURE__*/(function (SimpleGeometry) {
    function Point(coordinates, opt_layout) {
      SimpleGeometry.call(this);
      this.setCoordinates(coordinates, opt_layout);
    }

    if ( SimpleGeometry ) Point.__proto__ = SimpleGeometry;
    Point.prototype = Object.create( SimpleGeometry && SimpleGeometry.prototype );
    Point.prototype.constructor = Point;

    /**
     * Make a complete copy of the geometry.
     * @return {!Point} Clone.
     * @override
     * @api
     */
    Point.prototype.clone = function clone () {
      var point = new Point(this.flatCoordinates.slice(), this.layout);
      return point;
    };

    /**
     * @inheritDoc
     */
    Point.prototype.closestPointXY = function closestPointXY (x, y, closestPoint, minSquaredDistance) {
      var flatCoordinates = this.flatCoordinates;
      var squaredDistance$1 = squaredDistance(x, y, flatCoordinates[0], flatCoordinates[1]);
      if (squaredDistance$1 < minSquaredDistance) {
        var stride = this.stride;
        for (var i = 0; i < stride; ++i) {
          closestPoint[i] = flatCoordinates[i];
        }
        closestPoint.length = stride;
        return squaredDistance$1;
      } else {
        return minSquaredDistance;
      }
    };

    /**
     * Return the coordinate of the point.
     * @return {import("../coordinate.js").Coordinate} Coordinates.
     * @override
     * @api
     */
    Point.prototype.getCoordinates = function getCoordinates () {
      return !this.flatCoordinates ? [] : this.flatCoordinates.slice();
    };

    /**
     * @inheritDoc
     */
    Point.prototype.computeExtent = function computeExtent (extent) {
      return createOrUpdateFromCoordinate(this.flatCoordinates, extent);
    };

    /**
     * @inheritDoc
     * @api
     */
    Point.prototype.getType = function getType () {
      return GeometryType.POINT;
    };

    /**
     * @inheritDoc
     * @api
     */
    Point.prototype.intersectsExtent = function intersectsExtent (extent) {
      return containsXY(extent, this.flatCoordinates[0], this.flatCoordinates[1]);
    };

    /**
     * @inheritDoc
     * @api
     */
    Point.prototype.setCoordinates = function setCoordinates (coordinates, opt_layout) {
      this.setLayout(opt_layout, coordinates, 0);
      if (!this.flatCoordinates) {
        this.flatCoordinates = [];
      }
      this.flatCoordinates.length = deflateCoordinate(
        this.flatCoordinates, 0, coordinates, this.stride);
      this.changed();
    };

    return Point;
  }(SimpleGeometry));

  /**
   * @module ol/geom/flat/contains
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {import("../../extent.js").Extent} extent Extent.
   * @return {boolean} Contains extent.
   */
  function linearRingContainsExtent(flatCoordinates, offset, end, stride, extent) {
    var outside = forEachCorner(extent,
      /**
       * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
       * @return {boolean} Contains (x, y).
       */
      function(coordinate) {
        return !linearRingContainsXY(flatCoordinates, offset, end, stride, coordinate[0], coordinate[1]);
      });
    return !outside;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {number} x X.
   * @param {number} y Y.
   * @return {boolean} Contains (x, y).
   */
  function linearRingContainsXY(flatCoordinates, offset, end, stride, x, y) {
    // http://geomalgorithms.com/a03-_inclusion.html
    // Copyright 2000 softSurfer, 2012 Dan Sunday
    // This code may be freely used and modified for any purpose
    // providing that this copyright notice is included with it.
    // SoftSurfer makes no warranty for this code, and cannot be held
    // liable for any real or imagined damage resulting from its use.
    // Users of this code must verify correctness for their application.
    var wn = 0;
    var x1 = flatCoordinates[end - stride];
    var y1 = flatCoordinates[end - stride + 1];
    for (; offset < end; offset += stride) {
      var x2 = flatCoordinates[offset];
      var y2 = flatCoordinates[offset + 1];
      if (y1 <= y) {
        if (y2 > y && ((x2 - x1) * (y - y1)) - ((x - x1) * (y2 - y1)) > 0) {
          wn++;
        }
      } else if (y2 <= y && ((x2 - x1) * (y - y1)) - ((x - x1) * (y2 - y1)) < 0) {
        wn--;
      }
      x1 = x2;
      y1 = y2;
    }
    return wn !== 0;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {number} x X.
   * @param {number} y Y.
   * @return {boolean} Contains (x, y).
   */
  function linearRingsContainsXY(flatCoordinates, offset, ends, stride, x, y) {
    if (ends.length === 0) {
      return false;
    }
    if (!linearRingContainsXY(flatCoordinates, offset, ends[0], stride, x, y)) {
      return false;
    }
    for (var i = 1, ii = ends.length; i < ii; ++i) {
      if (linearRingContainsXY(flatCoordinates, ends[i - 1], ends[i], stride, x, y)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @module ol/geom/flat/interiorpoint
   */


  /**
   * Calculates a point that is likely to lie in the interior of the linear rings.
   * Inspired by JTS's com.vividsolutions.jts.geom.Geometry#getInteriorPoint.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {Array<number>} flatCenters Flat centers.
   * @param {number} flatCentersOffset Flat center offset.
   * @param {Array<number>=} opt_dest Destination.
   * @return {Array<number>} Destination point as XYM coordinate, where M is the
   * length of the horizontal intersection that the point belongs to.
   */
  function getInteriorPointOfArray(flatCoordinates, offset,
    ends, stride, flatCenters, flatCentersOffset, opt_dest) {
    var i, ii, x, x1, x2, y1, y2;
    var y = flatCenters[flatCentersOffset + 1];
    /** @type {Array<number>} */
    var intersections = [];
    // Calculate intersections with the horizontal line
    for (var r = 0, rr = ends.length; r < rr; ++r) {
      var end = ends[r];
      x1 = flatCoordinates[end - stride];
      y1 = flatCoordinates[end - stride + 1];
      for (i = offset; i < end; i += stride) {
        x2 = flatCoordinates[i];
        y2 = flatCoordinates[i + 1];
        if ((y <= y1 && y2 <= y) || (y1 <= y && y <= y2)) {
          x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
          intersections.push(x);
        }
        x1 = x2;
        y1 = y2;
      }
    }
    // Find the longest segment of the horizontal line that has its center point
    // inside the linear ring.
    var pointX = NaN;
    var maxSegmentLength = -Infinity;
    intersections.sort(numberSafeCompareFunction);
    x1 = intersections[0];
    for (i = 1, ii = intersections.length; i < ii; ++i) {
      x2 = intersections[i];
      var segmentLength = Math.abs(x2 - x1);
      if (segmentLength > maxSegmentLength) {
        x = (x1 + x2) / 2;
        if (linearRingsContainsXY(flatCoordinates, offset, ends, stride, x, y)) {
          pointX = x;
          maxSegmentLength = segmentLength;
        }
      }
      x1 = x2;
    }
    if (isNaN(pointX)) {
      // There is no horizontal line that has its center point inside the linear
      // ring.  Use the center of the the linear ring's extent.
      pointX = flatCenters[flatCentersOffset];
    }
    if (opt_dest) {
      opt_dest.push(pointX, y, maxSegmentLength);
      return opt_dest;
    } else {
      return [pointX, y, maxSegmentLength];
    }
  }

  /**
   * @module ol/geom/flat/segments
   */


  /**
   * This function calls `callback` for each segment of the flat coordinates
   * array. If the callback returns a truthy value the function returns that
   * value immediately. Otherwise the function returns `false`.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {function(this: S, import("../../coordinate.js").Coordinate, import("../../coordinate.js").Coordinate): T} callback Function
   *     called for each segment.
   * @param {S=} opt_this The object to be used as the value of 'this'
   *     within callback.
   * @return {T|boolean} Value.
   * @template T,S
   */
  function forEach(flatCoordinates, offset, end, stride, callback, opt_this) {
    var point1 = [flatCoordinates[offset], flatCoordinates[offset + 1]];
    var point2 = [];
    var ret;
    for (; (offset + stride) < end; offset += stride) {
      point2[0] = flatCoordinates[offset + stride];
      point2[1] = flatCoordinates[offset + stride + 1];
      ret = callback.call(opt_this, point1, point2);
      if (ret) {
        return ret;
      }
      point1[0] = point2[0];
      point1[1] = point2[1];
    }
    return false;
  }

  /**
   * @module ol/geom/flat/intersectsextent
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {import("../../extent.js").Extent} extent Extent.
   * @return {boolean} True if the geometry and the extent intersect.
   */
  function intersectsLineString(flatCoordinates, offset, end, stride, extent) {
    var coordinatesExtent = extendFlatCoordinates(
      createEmpty(), flatCoordinates, offset, end, stride);
    if (!intersects(extent, coordinatesExtent)) {
      return false;
    }
    if (containsExtent(extent, coordinatesExtent)) {
      return true;
    }
    if (coordinatesExtent[0] >= extent[0] &&
        coordinatesExtent[2] <= extent[2]) {
      return true;
    }
    if (coordinatesExtent[1] >= extent[1] &&
        coordinatesExtent[3] <= extent[3]) {
      return true;
    }
    return forEach(flatCoordinates, offset, end, stride,
      /**
       * @param {import("../../coordinate.js").Coordinate} point1 Start point.
       * @param {import("../../coordinate.js").Coordinate} point2 End point.
       * @return {boolean} `true` if the segment and the extent intersect,
       *     `false` otherwise.
       */
      function(point1, point2) {
        return intersectsSegment(extent, point1, point2);
      });
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @param {import("../../extent.js").Extent} extent Extent.
   * @return {boolean} True if the geometry and the extent intersect.
   */
  function intersectsLinearRing(flatCoordinates, offset, end, stride, extent) {
    if (intersectsLineString(
      flatCoordinates, offset, end, stride, extent)) {
      return true;
    }
    if (linearRingContainsXY(flatCoordinates, offset, end, stride, extent[0], extent[1])) {
      return true;
    }
    if (linearRingContainsXY(flatCoordinates, offset, end, stride, extent[0], extent[3])) {
      return true;
    }
    if (linearRingContainsXY(flatCoordinates, offset, end, stride, extent[2], extent[1])) {
      return true;
    }
    if (linearRingContainsXY(flatCoordinates, offset, end, stride, extent[2], extent[3])) {
      return true;
    }
    return false;
  }


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {import("../../extent.js").Extent} extent Extent.
   * @return {boolean} True if the geometry and the extent intersect.
   */
  function intersectsLinearRingArray(flatCoordinates, offset, ends, stride, extent) {
    if (!intersectsLinearRing(
      flatCoordinates, offset, ends[0], stride, extent)) {
      return false;
    }
    if (ends.length === 1) {
      return true;
    }
    for (var i = 1, ii = ends.length; i < ii; ++i) {
      if (linearRingContainsExtent(flatCoordinates, ends[i - 1], ends[i], stride, extent)) {
        if (!intersectsLineString(flatCoordinates, ends[i - 1], ends[i], stride, extent)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * @module ol/geom/flat/reverse
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   */
  function coordinates(flatCoordinates, offset, end, stride) {
    while (offset < end - stride) {
      for (var i = 0; i < stride; ++i) {
        var tmp = flatCoordinates[offset + i];
        flatCoordinates[offset + i] = flatCoordinates[end - stride + i];
        flatCoordinates[end - stride + i] = tmp;
      }
      offset += stride;
      end -= stride;
    }
  }

  /**
   * @module ol/geom/flat/orient
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @return {boolean} Is clockwise.
   */
  function linearRingIsClockwise(flatCoordinates, offset, end, stride) {
    // http://tinyurl.com/clockwise-method
    // https://github.com/OSGeo/gdal/blob/trunk/gdal/ogr/ogrlinearring.cpp
    var edge = 0;
    var x1 = flatCoordinates[end - stride];
    var y1 = flatCoordinates[end - stride + 1];
    for (; offset < end; offset += stride) {
      var x2 = flatCoordinates[offset];
      var y2 = flatCoordinates[offset + 1];
      edge += (x2 - x1) * (y2 + y1);
      x1 = x2;
      y1 = y2;
    }
    return edge > 0;
  }


  /**
   * Determines if linear rings are oriented.  By default, left-hand orientation
   * is tested (first ring must be clockwise, remaining rings counter-clockwise).
   * To test for right-hand orientation, use the `opt_right` argument.
   *
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Array of end indexes.
   * @param {number} stride Stride.
   * @param {boolean=} opt_right Test for right-hand orientation
   *     (counter-clockwise exterior ring and clockwise interior rings).
   * @return {boolean} Rings are correctly oriented.
   */
  function linearRingIsOriented(flatCoordinates, offset, ends, stride, opt_right) {
    var right = opt_right !== undefined ? opt_right : false;
    for (var i = 0, ii = ends.length; i < ii; ++i) {
      var end = ends[i];
      var isClockwise = linearRingIsClockwise(
        flatCoordinates, offset, end, stride);
      if (i === 0) {
        if ((right && isClockwise) || (!right && !isClockwise)) {
          return false;
        }
      } else {
        if ((right && !isClockwise) || (!right && isClockwise)) {
          return false;
        }
      }
      offset = end;
    }
    return true;
  }


  /**
   * Orient coordinates in a flat array of linear rings.  By default, rings
   * are oriented following the left-hand rule (clockwise for exterior and
   * counter-clockwise for interior rings).  To orient according to the
   * right-hand rule, use the `opt_right` argument.
   *
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {Array<number>} ends Ends.
   * @param {number} stride Stride.
   * @param {boolean=} opt_right Follow the right-hand rule for orientation.
   * @return {number} End.
   */
  function orientLinearRings(flatCoordinates, offset, ends, stride, opt_right) {
    var right = opt_right !== undefined ? opt_right : false;
    for (var i = 0, ii = ends.length; i < ii; ++i) {
      var end = ends[i];
      var isClockwise = linearRingIsClockwise(
        flatCoordinates, offset, end, stride);
      var reverse = i === 0 ?
        (right && isClockwise) || (!right && !isClockwise) :
        (right && !isClockwise) || (!right && isClockwise);
      if (reverse) {
        coordinates(flatCoordinates, offset, end, stride);
      }
      offset = end;
    }
    return offset;
  }

  /**
   * @module ol/geom/Polygon
   */

  /**
   * @classdesc
   * Polygon geometry.
   *
   * @api
   */
  var Polygon = /*@__PURE__*/(function (SimpleGeometry) {
    function Polygon(coordinates, opt_layout, opt_ends) {

      SimpleGeometry.call(this);

      /**
       * @type {Array<number>}
       * @private
       */
      this.ends_ = [];

      /**
       * @private
       * @type {number}
       */
      this.flatInteriorPointRevision_ = -1;

      /**
       * @private
       * @type {import("../coordinate.js").Coordinate}
       */
      this.flatInteriorPoint_ = null;

      /**
       * @private
       * @type {number}
       */
      this.maxDelta_ = -1;

      /**
       * @private
       * @type {number}
       */
      this.maxDeltaRevision_ = -1;

      /**
       * @private
       * @type {number}
       */
      this.orientedRevision_ = -1;

      /**
       * @private
       * @type {Array<number>}
       */
      this.orientedFlatCoordinates_ = null;

      if (opt_layout !== undefined && opt_ends) {
        this.setFlatCoordinates(opt_layout, /** @type {Array<number>} */ (coordinates));
        this.ends_ = opt_ends;
      } else {
        this.setCoordinates(/** @type {Array<Array<import("../coordinate.js").Coordinate>>} */ (coordinates), opt_layout);
      }

    }

    if ( SimpleGeometry ) Polygon.__proto__ = SimpleGeometry;
    Polygon.prototype = Object.create( SimpleGeometry && SimpleGeometry.prototype );
    Polygon.prototype.constructor = Polygon;

    /**
     * Append the passed linear ring to this polygon.
     * @param {LinearRing} linearRing Linear ring.
     * @api
     */
    Polygon.prototype.appendLinearRing = function appendLinearRing (linearRing) {
      if (!this.flatCoordinates) {
        this.flatCoordinates = linearRing.getFlatCoordinates().slice();
      } else {
        extend(this.flatCoordinates, linearRing.getFlatCoordinates());
      }
      this.ends_.push(this.flatCoordinates.length);
      this.changed();
    };

    /**
     * Make a complete copy of the geometry.
     * @return {!Polygon} Clone.
     * @override
     * @api
     */
    Polygon.prototype.clone = function clone () {
      return new Polygon(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
    };

    /**
     * @inheritDoc
     */
    Polygon.prototype.closestPointXY = function closestPointXY (x, y, closestPoint, minSquaredDistance) {
      if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
        return minSquaredDistance;
      }
      if (this.maxDeltaRevision_ != this.getRevision()) {
        this.maxDelta_ = Math.sqrt(arrayMaxSquaredDelta(
          this.flatCoordinates, 0, this.ends_, this.stride, 0));
        this.maxDeltaRevision_ = this.getRevision();
      }
      return assignClosestArrayPoint(
        this.flatCoordinates, 0, this.ends_, this.stride,
        this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
    };

    /**
     * @inheritDoc
     */
    Polygon.prototype.containsXY = function containsXY (x, y) {
      return linearRingsContainsXY(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, x, y);
    };

    /**
     * Return the area of the polygon on projected plane.
     * @return {number} Area (on projected plane).
     * @api
     */
    Polygon.prototype.getArea = function getArea () {
      return linearRings(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride);
    };

    /**
     * Get the coordinate array for this geometry.  This array has the structure
     * of a GeoJSON coordinate array for polygons.
     *
     * @param {boolean=} opt_right Orient coordinates according to the right-hand
     *     rule (counter-clockwise for exterior and clockwise for interior rings).
     *     If `false`, coordinates will be oriented according to the left-hand rule
     *     (clockwise for exterior and counter-clockwise for interior rings).
     *     By default, coordinate orientation will depend on how the geometry was
     *     constructed.
     * @return {Array<Array<import("../coordinate.js").Coordinate>>} Coordinates.
     * @override
     * @api
     */
    Polygon.prototype.getCoordinates = function getCoordinates (opt_right) {
      var flatCoordinates;
      if (opt_right !== undefined) {
        flatCoordinates = this.getOrientedFlatCoordinates().slice();
        orientLinearRings(
          flatCoordinates, 0, this.ends_, this.stride, opt_right);
      } else {
        flatCoordinates = this.flatCoordinates;
      }

      return inflateCoordinatesArray(
        flatCoordinates, 0, this.ends_, this.stride);
    };

    /**
     * @return {Array<number>} Ends.
     */
    Polygon.prototype.getEnds = function getEnds () {
      return this.ends_;
    };

    /**
     * @return {Array<number>} Interior point.
     */
    Polygon.prototype.getFlatInteriorPoint = function getFlatInteriorPoint () {
      if (this.flatInteriorPointRevision_ != this.getRevision()) {
        var flatCenter = getCenter(this.getExtent());
        this.flatInteriorPoint_ = getInteriorPointOfArray(
          this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride,
          flatCenter, 0);
        this.flatInteriorPointRevision_ = this.getRevision();
      }
      return this.flatInteriorPoint_;
    };

    /**
     * Return an interior point of the polygon.
     * @return {Point} Interior point as XYM coordinate, where M is the
     * length of the horizontal intersection that the point belongs to.
     * @api
     */
    Polygon.prototype.getInteriorPoint = function getInteriorPoint () {
      return new Point(this.getFlatInteriorPoint(), GeometryLayout.XYM);
    };

    /**
     * Return the number of rings of the polygon,  this includes the exterior
     * ring and any interior rings.
     *
     * @return {number} Number of rings.
     * @api
     */
    Polygon.prototype.getLinearRingCount = function getLinearRingCount () {
      return this.ends_.length;
    };

    /**
     * Return the Nth linear ring of the polygon geometry. Return `null` if the
     * given index is out of range.
     * The exterior linear ring is available at index `0` and the interior rings
     * at index `1` and beyond.
     *
     * @param {number} index Index.
     * @return {LinearRing} Linear ring.
     * @api
     */
    Polygon.prototype.getLinearRing = function getLinearRing (index) {
      if (index < 0 || this.ends_.length <= index) {
        return null;
      }
      return new LinearRing(this.flatCoordinates.slice(
        index === 0 ? 0 : this.ends_[index - 1], this.ends_[index]), this.layout);
    };

    /**
     * Return the linear rings of the polygon.
     * @return {Array<LinearRing>} Linear rings.
     * @api
     */
    Polygon.prototype.getLinearRings = function getLinearRings () {
      var layout = this.layout;
      var flatCoordinates = this.flatCoordinates;
      var ends = this.ends_;
      var linearRings = [];
      var offset = 0;
      for (var i = 0, ii = ends.length; i < ii; ++i) {
        var end = ends[i];
        var linearRing = new LinearRing(flatCoordinates.slice(offset, end), layout);
        linearRings.push(linearRing);
        offset = end;
      }
      return linearRings;
    };

    /**
     * @return {Array<number>} Oriented flat coordinates.
     */
    Polygon.prototype.getOrientedFlatCoordinates = function getOrientedFlatCoordinates () {
      if (this.orientedRevision_ != this.getRevision()) {
        var flatCoordinates = this.flatCoordinates;
        if (linearRingIsOriented(
          flatCoordinates, 0, this.ends_, this.stride)) {
          this.orientedFlatCoordinates_ = flatCoordinates;
        } else {
          this.orientedFlatCoordinates_ = flatCoordinates.slice();
          this.orientedFlatCoordinates_.length =
              orientLinearRings(
                this.orientedFlatCoordinates_, 0, this.ends_, this.stride);
        }
        this.orientedRevision_ = this.getRevision();
      }
      return this.orientedFlatCoordinates_;
    };

    /**
     * @inheritDoc
     */
    Polygon.prototype.getSimplifiedGeometryInternal = function getSimplifiedGeometryInternal (squaredTolerance) {
      var simplifiedFlatCoordinates = [];
      var simplifiedEnds = [];
      simplifiedFlatCoordinates.length = quantizeArray(
        this.flatCoordinates, 0, this.ends_, this.stride,
        Math.sqrt(squaredTolerance),
        simplifiedFlatCoordinates, 0, simplifiedEnds);
      return new Polygon(simplifiedFlatCoordinates, GeometryLayout.XY, simplifiedEnds);
    };

    /**
     * @inheritDoc
     * @api
     */
    Polygon.prototype.getType = function getType () {
      return GeometryType.POLYGON;
    };

    /**
     * @inheritDoc
     * @api
     */
    Polygon.prototype.intersectsExtent = function intersectsExtent (extent) {
      return intersectsLinearRingArray(
        this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, extent);
    };

    /**
     * Set the coordinates of the polygon.
     * @param {!Array<Array<import("../coordinate.js").Coordinate>>} coordinates Coordinates.
     * @param {GeometryLayout=} opt_layout Layout.
     * @override
     * @api
     */
    Polygon.prototype.setCoordinates = function setCoordinates (coordinates, opt_layout) {
      this.setLayout(opt_layout, coordinates, 2);
      if (!this.flatCoordinates) {
        this.flatCoordinates = [];
      }
      var ends = deflateCoordinatesArray(
        this.flatCoordinates, 0, coordinates, this.stride, this.ends_);
      this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
      this.changed();
    };

    return Polygon;
  }(SimpleGeometry));


  /**
   * Create a polygon from an extent. The layout used is `XY`.
   * @param {import("../extent.js").Extent} extent The extent.
   * @return {Polygon} The polygon.
   * @api
   */
  function fromExtent(extent) {
    var minX = extent[0];
    var minY = extent[1];
    var maxX = extent[2];
    var maxY = extent[3];
    var flatCoordinates =
        [minX, minY, minX, maxY, maxX, maxY, maxX, minY, minX, minY];
    return new Polygon(flatCoordinates, GeometryLayout.XY, [flatCoordinates.length]);
  }

  /**
   * @module ol/View
   */


  /**
   * An animation configuration
   *
   * @typedef {Object} Animation
   * @property {import("./coordinate.js").Coordinate} [sourceCenter]
   * @property {import("./coordinate.js").Coordinate} [targetCenter]
   * @property {number} [sourceResolution]
   * @property {number} [targetResolution]
   * @property {number} [sourceRotation]
   * @property {number} [targetRotation]
   * @property {import("./coordinate.js").Coordinate} [anchor]
   * @property {number} start
   * @property {number} duration
   * @property {boolean} complete
   * @property {function(number):number} easing
   * @property {function(boolean)} callback
   */


  /**
   * @typedef {Object} Constraints
   * @property {import("./centerconstraint.js").Type} center
   * @property {import("./resolutionconstraint.js").Type} resolution
   * @property {import("./rotationconstraint.js").Type} rotation
   */


  /**
   * @typedef {Object} FitOptions
   * @property {import("./size.js").Size} [size] The size in pixels of the box to fit
   * the extent into. Default is the current size of the first map in the DOM that
   * uses this view, or `[100, 100]` if no such map is found.
   * @property {!Array<number>} [padding=[0, 0, 0, 0]] Padding (in pixels) to be
   * cleared inside the view. Values in the array are top, right, bottom and left
   * padding.
   * @property {boolean} [constrainResolution=true] Constrain the resolution.
   * @property {boolean} [nearest=false] If `constrainResolution` is `true`, get
   * the nearest extent instead of the closest that actually fits the view.
   * @property {number} [minResolution=0] Minimum resolution that we zoom to.
   * @property {number} [maxZoom] Maximum zoom level that we zoom to. If
   * `minResolution` is given, this property is ignored.
   * @property {number} [duration] The duration of the animation in milliseconds.
   * By default, there is no animation to the target extent.
   * @property {function(number):number} [easing] The easing function used during
   * the animation (defaults to {@link module:ol/easing~inAndOut}).
   * The function will be called for each frame with a number representing a
   * fraction of the animation's duration.  The function should return a number
   * between 0 and 1 representing the progress toward the destination state.
   * @property {function(boolean)} [callback] Function called when the view is in
   * its final position. The callback will be called with `true` if the animation
   * series completed on its own or `false` if it was cancelled.
   */


  /**
   * @typedef {Object} ViewOptions
   * @property {import("./coordinate.js").Coordinate} [center] The initial center for
   * the view. The coordinate system for the center is specified with the
   * `projection` option. Layer sources will not be fetched if this is not set,
   * but the center can be set later with {@link #setCenter}.
   * @property {boolean|number} [constrainRotation=true] Rotation constraint.
   * `false` means no constraint. `true` means no constraint, but snap to zero
   * near zero. A number constrains the rotation to that number of values. For
   * example, `4` will constrain the rotation to 0, 90, 180, and 270 degrees.
   * @property {boolean} [enableRotation=true] Enable rotation.
   * If `false`, a rotation constraint that always sets the rotation to zero is
   * used. The `constrainRotation` option has no effect if `enableRotation` is
   * `false`.
   * @property {import("./extent.js").Extent} [extent] The extent that constrains the
   * center, in other words, center cannot be set outside this extent.
   * @property {number} [maxResolution] The maximum resolution used to determine
   * the resolution constraint. It is used together with `minResolution` (or
   * `maxZoom`) and `zoomFactor`. If unspecified it is calculated in such a way
   * that the projection's validity extent fits in a 256x256 px tile. If the
   * projection is Spherical Mercator (the default) then `maxResolution` defaults
   * to `40075016.68557849 / 256 = 156543.03392804097`.
   * @property {number} [minResolution] The minimum resolution used to determine
   * the resolution constraint.  It is used together with `maxResolution` (or
   * `minZoom`) and `zoomFactor`.  If unspecified it is calculated assuming 29
   * zoom levels (with a factor of 2). If the projection is Spherical Mercator
   * (the default) then `minResolution` defaults to
   * `40075016.68557849 / 256 / Math.pow(2, 28) = 0.0005831682455839253`.
   * @property {number} [maxZoom=28] The maximum zoom level used to determine the
   * resolution constraint. It is used together with `minZoom` (or
   * `maxResolution`) and `zoomFactor`.  Note that if `minResolution` is also
   * provided, it is given precedence over `maxZoom`.
   * @property {number} [minZoom=0] The minimum zoom level used to determine the
   * resolution constraint. It is used together with `maxZoom` (or
   * `minResolution`) and `zoomFactor`.  Note that if `maxResolution` is also
   * provided, it is given precedence over `minZoom`.
   * @property {import("./proj.js").ProjectionLike} [projection='EPSG:3857'] The
   * projection. The default is Spherical Mercator.
   * @property {number} [resolution] The initial resolution for the view. The
   * units are `projection` units per pixel (e.g. meters per pixel). An
   * alternative to setting this is to set `zoom`. Layer sources will not be
   * fetched if neither this nor `zoom` are defined, but they can be set later
   * with {@link #setZoom} or {@link #setResolution}.
   * @property {Array<number>} [resolutions] Resolutions to determine the
   * resolution constraint. If set the `maxResolution`, `minResolution`,
   * `minZoom`, `maxZoom`, and `zoomFactor` options are ignored.
   * @property {number} [rotation=0] The initial rotation for the view in radians
   * (positive rotation clockwise, 0 means North).
   * @property {number} [zoom] Only used if `resolution` is not defined. Zoom
   * level used to calculate the initial resolution for the view. The initial
   * resolution is determined using the {@link #constrainResolution} method.
   * @property {number} [zoomFactor=2] The zoom factor used to determine the
   * resolution constraint.
   */


  /**
   * @typedef {Object} AnimationOptions
   * @property {import("./coordinate.js").Coordinate} [center] The center of the view at the end of
   * the animation.
   * @property {number} [zoom] The zoom level of the view at the end of the
   * animation. This takes precedence over `resolution`.
   * @property {number} [resolution] The resolution of the view at the end
   * of the animation.  If `zoom` is also provided, this option will be ignored.
   * @property {number} [rotation] The rotation of the view at the end of
   * the animation.
   * @property {import("./coordinate.js").Coordinate} [anchor] Optional anchor to remained fixed
   * during a rotation or resolution animation.
   * @property {number} [duration=1000] The duration of the animation in milliseconds.
   * @property {function(number):number} [easing] The easing function used
   * during the animation (defaults to {@link module:ol/easing~inAndOut}).
   * The function will be called for each frame with a number representing a
   * fraction of the animation's duration.  The function should return a number
   * between 0 and 1 representing the progress toward the destination state.
   */


  /**
   * @typedef {Object} State
   * @property {import("./coordinate.js").Coordinate} center
   * @property {import("./proj/Projection.js").default} projection
   * @property {number} resolution
   * @property {number} rotation
   * @property {number} zoom
   */


  /**
   * Default min zoom level for the map view.
   * @type {number}
   */
  var DEFAULT_MIN_ZOOM = 0;


  /**
   * @classdesc
   * A View object represents a simple 2D view of the map.
   *
   * This is the object to act upon to change the center, resolution,
   * and rotation of the map.
   *
   * ### The view states
   *
   * An View is determined by three states: `center`, `resolution`,
   * and `rotation`. Each state has a corresponding getter and setter, e.g.
   * `getCenter` and `setCenter` for the `center` state.
   *
   * An View has a `projection`. The projection determines the
   * coordinate system of the center, and its units determine the units of the
   * resolution (projection units per pixel). The default projection is
   * Spherical Mercator (EPSG:3857).
   *
   * ### The constraints
   *
   * `setCenter`, `setResolution` and `setRotation` can be used to change the
   * states of the view. Any value can be passed to the setters. And the value
   * that is passed to a setter will effectively be the value set in the view,
   * and returned by the corresponding getter.
   *
   * But a View object also has a *resolution constraint*, a
   * *rotation constraint* and a *center constraint*.
   *
   * As said above, no constraints are applied when the setters are used to set
   * new states for the view. Applying constraints is done explicitly through
   * the use of the `constrain*` functions (`constrainResolution` and
   * `constrainRotation` and `constrainCenter`).
   *
   * The main users of the constraints are the interactions and the
   * controls. For example, double-clicking on the map changes the view to
   * the "next" resolution. And releasing the fingers after pinch-zooming
   * snaps to the closest resolution (with an animation).
   *
   * The *resolution constraint* snaps to specific resolutions. It is
   * determined by the following options: `resolutions`, `maxResolution`,
   * `maxZoom`, and `zoomFactor`. If `resolutions` is set, the other three
   * options are ignored. See documentation for each option for more
   * information.
   *
   * The *rotation constraint* snaps to specific angles. It is determined
   * by the following options: `enableRotation` and `constrainRotation`.
   * By default the rotation value is snapped to zero when approaching the
   * horizontal.
   *
   * The *center constraint* is determined by the `extent` option. By
   * default the center is not constrained at all.
   *
    * @api
   */
  var View = /*@__PURE__*/(function (BaseObject) {
    function View(opt_options) {
      BaseObject.call(this);

      var options = assign({}, opt_options);

      /**
       * @private
       * @type {Array<number>}
       */
      this.hints_ = [0, 0];

      /**
       * @private
       * @type {Array<Array<Animation>>}
       */
      this.animations_ = [];

      /**
       * @private
       * @type {number|undefined}
       */
      this.updateAnimationKey_;

      this.updateAnimations_ = this.updateAnimations_.bind(this);

      /**
       * @private
       * @const
       * @type {import("./proj/Projection.js").default}
       */
      this.projection_ = createProjection(options.projection, 'EPSG:3857');

      this.applyOptions_(options);
    }

    if ( BaseObject ) View.__proto__ = BaseObject;
    View.prototype = Object.create( BaseObject && BaseObject.prototype );
    View.prototype.constructor = View;

    /**
     * Set up the view with the given options.
     * @param {ViewOptions} options View options.
     */
    View.prototype.applyOptions_ = function applyOptions_ (options) {

      /**
       * @type {Object<string, *>}
       */
      var properties = {};
      properties[ViewProperty.CENTER] = options.center !== undefined ?
        options.center : null;

      var resolutionConstraintInfo = createResolutionConstraint(options);

      /**
       * @private
       * @type {number}
       */
      this.maxResolution_ = resolutionConstraintInfo.maxResolution;

      /**
       * @private
       * @type {number}
       */
      this.minResolution_ = resolutionConstraintInfo.minResolution;

      /**
       * @private
       * @type {number}
       */
      this.zoomFactor_ = resolutionConstraintInfo.zoomFactor;

      /**
       * @private
       * @type {Array<number>|undefined}
       */
      this.resolutions_ = options.resolutions;

      /**
       * @private
       * @type {number}
       */
      this.minZoom_ = resolutionConstraintInfo.minZoom;

      var centerConstraint = createCenterConstraint(options);
      var resolutionConstraint = resolutionConstraintInfo.constraint;
      var rotationConstraint = createRotationConstraint(options);

      /**
       * @private
       * @type {Constraints}
       */
      this.constraints_ = {
        center: centerConstraint,
        resolution: resolutionConstraint,
        rotation: rotationConstraint
      };

      if (options.resolution !== undefined) {
        properties[ViewProperty.RESOLUTION] = options.resolution;
      } else if (options.zoom !== undefined) {
        properties[ViewProperty.RESOLUTION] = this.constrainResolution(
          this.maxResolution_, options.zoom - this.minZoom_);

        if (this.resolutions_) { // in case map zoom is out of min/max zoom range
          properties[ViewProperty.RESOLUTION] = clamp(
            Number(this.getResolution() || properties[ViewProperty.RESOLUTION]),
            this.minResolution_, this.maxResolution_);
        }
      }
      properties[ViewProperty.ROTATION] = options.rotation !== undefined ? options.rotation : 0;
      this.setProperties(properties);

      /**
       * @private
       * @type {ViewOptions}
       */
      this.options_ = options;

    };

    /**
     * Get an updated version of the view options used to construct the view.  The
     * current resolution (or zoom), center, and rotation are applied to any stored
     * options.  The provided options can be used to apply new min/max zoom or
     * resolution limits.
     * @param {ViewOptions} newOptions New options to be applied.
     * @return {ViewOptions} New options updated with the current view state.
     */
    View.prototype.getUpdatedOptions_ = function getUpdatedOptions_ (newOptions) {
      var options = assign({}, this.options_);

      // preserve resolution (or zoom)
      if (options.resolution !== undefined) {
        options.resolution = this.getResolution();
      } else {
        options.zoom = this.getZoom();
      }

      // preserve center
      options.center = this.getCenter();

      // preserve rotation
      options.rotation = this.getRotation();

      return assign({}, options, newOptions);
    };

    /**
     * Animate the view.  The view's center, zoom (or resolution), and rotation
     * can be animated for smooth transitions between view states.  For example,
     * to animate the view to a new zoom level:
     *
     *     view.animate({zoom: view.getZoom() + 1});
     *
     * By default, the animation lasts one second and uses in-and-out easing.  You
     * can customize this behavior by including `duration` (in milliseconds) and
     * `easing` options (see {@link module:ol/easing}).
     *
     * To chain together multiple animations, call the method with multiple
     * animation objects.  For example, to first zoom and then pan:
     *
     *     view.animate({zoom: 10}, {center: [0, 0]});
     *
     * If you provide a function as the last argument to the animate method, it
     * will get called at the end of an animation series.  The callback will be
     * called with `true` if the animation series completed on its own or `false`
     * if it was cancelled.
     *
     * Animations are cancelled by user interactions (e.g. dragging the map) or by
     * calling `view.setCenter()`, `view.setResolution()`, or `view.setRotation()`
     * (or another method that calls one of these).
     *
     * @param {...(AnimationOptions|function(boolean))} var_args Animation
     *     options.  Multiple animations can be run in series by passing multiple
     *     options objects.  To run multiple animations in parallel, call the method
     *     multiple times.  An optional callback can be provided as a final
     *     argument.  The callback will be called with a boolean indicating whether
     *     the animation completed without being cancelled.
     * @api
     */
    View.prototype.animate = function animate (var_args) {
      var arguments$1 = arguments;

      var animationCount = arguments.length;
      var callback;
      if (animationCount > 1 && typeof arguments[animationCount - 1] === 'function') {
        callback = arguments[animationCount - 1];
        --animationCount;
      }
      if (!this.isDef()) {
        // if view properties are not yet set, shortcut to the final state
        var state = arguments[animationCount - 1];
        if (state.center) {
          this.setCenter(state.center);
        }
        if (state.zoom !== undefined) {
          this.setZoom(state.zoom);
        }
        if (state.rotation !== undefined) {
          this.setRotation(state.rotation);
        }
        if (callback) {
          animationCallback(callback, true);
        }
        return;
      }
      var start = Date.now();
      var center = this.getCenter().slice();
      var resolution = this.getResolution();
      var rotation = this.getRotation();
      var series = [];
      for (var i = 0; i < animationCount; ++i) {
        var options = /** @type {AnimationOptions} */ (arguments$1[i]);

        var animation = /** @type {Animation} */ ({
          start: start,
          complete: false,
          anchor: options.anchor,
          duration: options.duration !== undefined ? options.duration : 1000,
          easing: options.easing || inAndOut
        });

        if (options.center) {
          animation.sourceCenter = center;
          animation.targetCenter = options.center;
          center = animation.targetCenter;
        }

        if (options.zoom !== undefined) {
          animation.sourceResolution = resolution;
          animation.targetResolution = this.constrainResolution(
            this.maxResolution_, options.zoom - this.minZoom_, 0);
          resolution = animation.targetResolution;
        } else if (options.resolution) {
          animation.sourceResolution = resolution;
          animation.targetResolution = options.resolution;
          resolution = animation.targetResolution;
        }

        if (options.rotation !== undefined) {
          animation.sourceRotation = rotation;
          var delta = modulo(options.rotation - rotation + Math.PI, 2 * Math.PI) - Math.PI;
          animation.targetRotation = rotation + delta;
          rotation = animation.targetRotation;
        }

        animation.callback = callback;

        // check if animation is a no-op
        if (isNoopAnimation(animation)) {
          animation.complete = true;
          // we still push it onto the series for callback handling
        } else {
          start += animation.duration;
        }
        series.push(animation);
      }
      this.animations_.push(series);
      this.setHint(ViewHint.ANIMATING, 1);
      this.updateAnimations_();
    };

    /**
     * Determine if the view is being animated.
     * @return {boolean} The view is being animated.
     * @api
     */
    View.prototype.getAnimating = function getAnimating () {
      return this.hints_[ViewHint.ANIMATING] > 0;
    };

    /**
     * Determine if the user is interacting with the view, such as panning or zooming.
     * @return {boolean} The view is being interacted with.
     * @api
     */
    View.prototype.getInteracting = function getInteracting () {
      return this.hints_[ViewHint.INTERACTING] > 0;
    };

    /**
     * Cancel any ongoing animations.
     * @api
     */
    View.prototype.cancelAnimations = function cancelAnimations () {
      this.setHint(ViewHint.ANIMATING, -this.hints_[ViewHint.ANIMATING]);
      for (var i = 0, ii = this.animations_.length; i < ii; ++i) {
        var series = this.animations_[i];
        if (series[0].callback) {
          animationCallback(series[0].callback, false);
        }
      }
      this.animations_.length = 0;
    };

    /**
     * Update all animations.
     */
    View.prototype.updateAnimations_ = function updateAnimations_ () {
      if (this.updateAnimationKey_ !== undefined) {
        cancelAnimationFrame(this.updateAnimationKey_);
        this.updateAnimationKey_ = undefined;
      }
      if (!this.getAnimating()) {
        return;
      }
      var now = Date.now();
      var more = false;
      for (var i = this.animations_.length - 1; i >= 0; --i) {
        var series = this.animations_[i];
        var seriesComplete = true;
        for (var j = 0, jj = series.length; j < jj; ++j) {
          var animation = series[j];
          if (animation.complete) {
            continue;
          }
          var elapsed = now - animation.start;
          var fraction = animation.duration > 0 ? elapsed / animation.duration : 1;
          if (fraction >= 1) {
            animation.complete = true;
            fraction = 1;
          } else {
            seriesComplete = false;
          }
          var progress = animation.easing(fraction);
          if (animation.sourceCenter) {
            var x0 = animation.sourceCenter[0];
            var y0 = animation.sourceCenter[1];
            var x1 = animation.targetCenter[0];
            var y1 = animation.targetCenter[1];
            var x = x0 + progress * (x1 - x0);
            var y = y0 + progress * (y1 - y0);
            this.set(ViewProperty.CENTER, [x, y]);
          }
          if (animation.sourceResolution && animation.targetResolution) {
            var resolution = progress === 1 ?
              animation.targetResolution :
              animation.sourceResolution + progress * (animation.targetResolution - animation.sourceResolution);
            if (animation.anchor) {
              this.set(ViewProperty.CENTER,
                this.calculateCenterZoom(resolution, animation.anchor));
            }
            this.set(ViewProperty.RESOLUTION, resolution);
          }
          if (animation.sourceRotation !== undefined && animation.targetRotation !== undefined) {
            var rotation = progress === 1 ?
              modulo(animation.targetRotation + Math.PI, 2 * Math.PI) - Math.PI :
              animation.sourceRotation + progress * (animation.targetRotation - animation.sourceRotation);
            if (animation.anchor) {
              this.set(ViewProperty.CENTER,
                this.calculateCenterRotate(rotation, animation.anchor));
            }
            this.set(ViewProperty.ROTATION, rotation);
          }
          more = true;
          if (!animation.complete) {
            break;
          }
        }
        if (seriesComplete) {
          this.animations_[i] = null;
          this.setHint(ViewHint.ANIMATING, -1);
          var callback = series[0].callback;
          if (callback) {
            animationCallback(callback, true);
          }
        }
      }
      // prune completed series
      this.animations_ = this.animations_.filter(Boolean);
      if (more && this.updateAnimationKey_ === undefined) {
        this.updateAnimationKey_ = requestAnimationFrame(this.updateAnimations_);
      }
    };

    /**
     * @param {number} rotation Target rotation.
     * @param {import("./coordinate.js").Coordinate} anchor Rotation anchor.
     * @return {import("./coordinate.js").Coordinate|undefined} Center for rotation and anchor.
     */
    View.prototype.calculateCenterRotate = function calculateCenterRotate (rotation, anchor) {
      var center;
      var currentCenter = this.getCenter();
      if (currentCenter !== undefined) {
        center = [currentCenter[0] - anchor[0], currentCenter[1] - anchor[1]];
        rotate(center, rotation - this.getRotation());
        add(center, anchor);
      }
      return center;
    };

    /**
     * @param {number} resolution Target resolution.
     * @param {import("./coordinate.js").Coordinate} anchor Zoom anchor.
     * @return {import("./coordinate.js").Coordinate|undefined} Center for resolution and anchor.
     */
    View.prototype.calculateCenterZoom = function calculateCenterZoom (resolution, anchor) {
      var center;
      var currentCenter = this.getCenter();
      var currentResolution = this.getResolution();
      if (currentCenter !== undefined && currentResolution !== undefined) {
        var x = anchor[0] - resolution * (anchor[0] - currentCenter[0]) / currentResolution;
        var y = anchor[1] - resolution * (anchor[1] - currentCenter[1]) / currentResolution;
        center = [x, y];
      }
      return center;
    };

    /**
     * @private
     * @return {import("./size.js").Size} Viewport size or `[100, 100]` when no viewport is found.
     */
    View.prototype.getSizeFromViewport_ = function getSizeFromViewport_ () {
      var size = [100, 100];
      var selector = '.ol-viewport[data-view="' + getUid(this) + '"]';
      var element = document.querySelector(selector);
      if (element) {
        var metrics = getComputedStyle(element);
        size[0] = parseInt(metrics.width, 10);
        size[1] = parseInt(metrics.height, 10);
      }
      return size;
    };

    /**
     * Get the constrained center of this view.
     * @param {import("./coordinate.js").Coordinate|undefined} center Center.
     * @return {import("./coordinate.js").Coordinate|undefined} Constrained center.
     * @api
     */
    View.prototype.constrainCenter = function constrainCenter (center) {
      return this.constraints_.center(center);
    };

    /**
     * Get the constrained resolution of this view.
     * @param {number|undefined} resolution Resolution.
     * @param {number=} opt_delta Delta. Default is `0`.
     * @param {number=} opt_direction Direction. Default is `0`.
     * @return {number|undefined} Constrained resolution.
     * @api
     */
    View.prototype.constrainResolution = function constrainResolution (resolution, opt_delta, opt_direction) {
      var delta = opt_delta || 0;
      var direction = opt_direction || 0;
      return this.constraints_.resolution(resolution, delta, direction);
    };

    /**
     * Get the constrained rotation of this view.
     * @param {number|undefined} rotation Rotation.
     * @param {number=} opt_delta Delta. Default is `0`.
     * @return {number|undefined} Constrained rotation.
     * @api
     */
    View.prototype.constrainRotation = function constrainRotation (rotation, opt_delta) {
      var delta = opt_delta || 0;
      return this.constraints_.rotation(rotation, delta);
    };

    /**
     * Get the view center.
     * @return {import("./coordinate.js").Coordinate|undefined} The center of the view.
     * @observable
     * @api
     */
    View.prototype.getCenter = function getCenter () {
      return (
        /** @type {import("./coordinate.js").Coordinate|undefined} */ (this.get(ViewProperty.CENTER))
      );
    };

    /**
     * @return {Constraints} Constraints.
     */
    View.prototype.getConstraints = function getConstraints () {
      return this.constraints_;
    };

    /**
     * @param {Array<number>=} opt_hints Destination array.
     * @return {Array<number>} Hint.
     */
    View.prototype.getHints = function getHints (opt_hints) {
      if (opt_hints !== undefined) {
        opt_hints[0] = this.hints_[0];
        opt_hints[1] = this.hints_[1];
        return opt_hints;
      } else {
        return this.hints_.slice();
      }
    };

    /**
     * Calculate the extent for the current view state and the passed size.
     * The size is the pixel dimensions of the box into which the calculated extent
     * should fit. In most cases you want to get the extent of the entire map,
     * that is `map.getSize()`.
     * @param {import("./size.js").Size=} opt_size Box pixel size. If not provided, the size of the
     * first map that uses this view will be used.
     * @return {import("./extent.js").Extent} Extent.
     * @api
     */
    View.prototype.calculateExtent = function calculateExtent (opt_size) {
      var size = opt_size || this.getSizeFromViewport_();
      var center = /** @type {!import("./coordinate.js").Coordinate} */ (this.getCenter());
      assert(center, 1); // The view center is not defined
      var resolution = /** @type {!number} */ (this.getResolution());
      assert(resolution !== undefined, 2); // The view resolution is not defined
      var rotation = /** @type {!number} */ (this.getRotation());
      assert(rotation !== undefined, 3); // The view rotation is not defined

      return getForViewAndSize(center, resolution, rotation, size);
    };

    /**
     * Get the maximum resolution of the view.
     * @return {number} The maximum resolution of the view.
     * @api
     */
    View.prototype.getMaxResolution = function getMaxResolution () {
      return this.maxResolution_;
    };

    /**
     * Get the minimum resolution of the view.
     * @return {number} The minimum resolution of the view.
     * @api
     */
    View.prototype.getMinResolution = function getMinResolution () {
      return this.minResolution_;
    };

    /**
     * Get the maximum zoom level for the view.
     * @return {number} The maximum zoom level.
     * @api
     */
    View.prototype.getMaxZoom = function getMaxZoom () {
      return /** @type {number} */ (this.getZoomForResolution(this.minResolution_));
    };

    /**
     * Set a new maximum zoom level for the view.
     * @param {number} zoom The maximum zoom level.
     * @api
     */
    View.prototype.setMaxZoom = function setMaxZoom (zoom) {
      this.applyOptions_(this.getUpdatedOptions_({maxZoom: zoom}));
    };

    /**
     * Get the minimum zoom level for the view.
     * @return {number} The minimum zoom level.
     * @api
     */
    View.prototype.getMinZoom = function getMinZoom () {
      return /** @type {number} */ (this.getZoomForResolution(this.maxResolution_));
    };

    /**
     * Set a new minimum zoom level for the view.
     * @param {number} zoom The minimum zoom level.
     * @api
     */
    View.prototype.setMinZoom = function setMinZoom (zoom) {
      this.applyOptions_(this.getUpdatedOptions_({minZoom: zoom}));
    };

    /**
     * Get the view projection.
     * @return {import("./proj/Projection.js").default} The projection of the view.
     * @api
     */
    View.prototype.getProjection = function getProjection () {
      return this.projection_;
    };

    /**
     * Get the view resolution.
     * @return {number|undefined} The resolution of the view.
     * @observable
     * @api
     */
    View.prototype.getResolution = function getResolution () {
      return /** @type {number|undefined} */ (this.get(ViewProperty.RESOLUTION));
    };

    /**
     * Get the resolutions for the view. This returns the array of resolutions
     * passed to the constructor of the View, or undefined if none were given.
     * @return {Array<number>|undefined} The resolutions of the view.
     * @api
     */
    View.prototype.getResolutions = function getResolutions () {
      return this.resolutions_;
    };

    /**
     * Get the resolution for a provided extent (in map units) and size (in pixels).
     * @param {import("./extent.js").Extent} extent Extent.
     * @param {import("./size.js").Size=} opt_size Box pixel size.
     * @return {number} The resolution at which the provided extent will render at
     *     the given size.
     * @api
     */
    View.prototype.getResolutionForExtent = function getResolutionForExtent (extent, opt_size) {
      var size = opt_size || this.getSizeFromViewport_();
      var xResolution = getWidth(extent) / size[0];
      var yResolution = getHeight(extent) / size[1];
      return Math.max(xResolution, yResolution);
    };

    /**
     * Return a function that returns a value between 0 and 1 for a
     * resolution. Exponential scaling is assumed.
     * @param {number=} opt_power Power.
     * @return {function(number): number} Resolution for value function.
     */
    View.prototype.getResolutionForValueFunction = function getResolutionForValueFunction (opt_power) {
      var power = opt_power || 2;
      var maxResolution = this.maxResolution_;
      var minResolution = this.minResolution_;
      var max = Math.log(maxResolution / minResolution) / Math.log(power);
      return (
        /**
         * @param {number} value Value.
         * @return {number} Resolution.
         */
        function(value) {
          var resolution = maxResolution / Math.pow(power, value * max);
          return resolution;
        });
    };

    /**
     * Get the view rotation.
     * @return {number} The rotation of the view in radians.
     * @observable
     * @api
     */
    View.prototype.getRotation = function getRotation () {
      return /** @type {number} */ (this.get(ViewProperty.ROTATION));
    };

    /**
     * Return a function that returns a resolution for a value between
     * 0 and 1. Exponential scaling is assumed.
     * @param {number=} opt_power Power.
     * @return {function(number): number} Value for resolution function.
     */
    View.prototype.getValueForResolutionFunction = function getValueForResolutionFunction (opt_power) {
      var power = opt_power || 2;
      var maxResolution = this.maxResolution_;
      var minResolution = this.minResolution_;
      var max = Math.log(maxResolution / minResolution) / Math.log(power);
      return (
        /**
         * @param {number} resolution Resolution.
         * @return {number} Value.
         */
        function(resolution) {
          var value = (Math.log(maxResolution / resolution) / Math.log(power)) / max;
          return value;
        });
    };

    /**
     * @param {number} pixelRatio Pixel ratio for center rounding.
     * @return {State} View state.
     */
    View.prototype.getState = function getState (pixelRatio) {
      var center = /** @type {import("./coordinate.js").Coordinate} */ (this.getCenter());
      var projection = this.getProjection();
      var resolution = /** @type {number} */ (this.getResolution());
      var pixelResolution = resolution / pixelRatio;
      var rotation = this.getRotation();
      return (
        /** @type {State} */ ({
          center: [
            Math.round(center[0] / pixelResolution) * pixelResolution,
            Math.round(center[1] / pixelResolution) * pixelResolution
          ],
          projection: projection !== undefined ? projection : null,
          resolution: resolution,
          rotation: rotation,
          zoom: this.getZoom()
        })
      );
    };

    /**
     * Get the current zoom level.  If you configured your view with a resolutions
     * array (this is rare), this method may return non-integer zoom levels (so
     * the zoom level is not safe to use as an index into a resolutions array).
     * @return {number|undefined} Zoom.
     * @api
     */
    View.prototype.getZoom = function getZoom () {
      var zoom;
      var resolution = this.getResolution();
      if (resolution !== undefined) {
        zoom = this.getZoomForResolution(resolution);
      }
      return zoom;
    };

    /**
     * Get the zoom level for a resolution.
     * @param {number} resolution The resolution.
     * @return {number|undefined} The zoom level for the provided resolution.
     * @api
     */
    View.prototype.getZoomForResolution = function getZoomForResolution (resolution) {
      var offset = this.minZoom_ || 0;
      var max, zoomFactor;
      if (this.resolutions_) {
        var nearest = linearFindNearest(this.resolutions_, resolution, 1);
        offset = nearest;
        max = this.resolutions_[nearest];
        if (nearest == this.resolutions_.length - 1) {
          zoomFactor = 2;
        } else {
          zoomFactor = max / this.resolutions_[nearest + 1];
        }
      } else {
        max = this.maxResolution_;
        zoomFactor = this.zoomFactor_;
      }
      return offset + Math.log(max / resolution) / Math.log(zoomFactor);
    };

    /**
     * Get the resolution for a zoom level.
     * @param {number} zoom Zoom level.
     * @return {number} The view resolution for the provided zoom level.
     * @api
     */
    View.prototype.getResolutionForZoom = function getResolutionForZoom (zoom) {
      return /** @type {number} */ (this.constrainResolution(
        this.maxResolution_, zoom - this.minZoom_, 0));
    };

    /**
     * Fit the given geometry or extent based on the given map size and border.
     * The size is pixel dimensions of the box to fit the extent into.
     * In most cases you will want to use the map size, that is `map.getSize()`.
     * Takes care of the map angle.
     * @param {import("./geom/SimpleGeometry.js").default|import("./extent.js").Extent} geometryOrExtent The geometry or
     *     extent to fit the view to.
     * @param {FitOptions=} opt_options Options.
     * @api
     */
    View.prototype.fit = function fit (geometryOrExtent, opt_options) {
      var options = opt_options || {};
      var size = options.size;
      if (!size) {
        size = this.getSizeFromViewport_();
      }
      /** @type {import("./geom/SimpleGeometry.js").default} */
      var geometry;
      assert(Array.isArray(geometryOrExtent) || typeof /** @type {?} */ (geometryOrExtent).getSimplifiedGeometry === 'function',
        24); // Invalid extent or geometry provided as `geometry`
      if (Array.isArray(geometryOrExtent)) {
        assert(!isEmpty$1(geometryOrExtent),
          25); // Cannot fit empty extent provided as `geometry`
        geometry = fromExtent(geometryOrExtent);
      } else if (geometryOrExtent.getType() === GeometryType.CIRCLE) {
        geometryOrExtent = geometryOrExtent.getExtent();
        geometry = fromExtent(geometryOrExtent);
        geometry.rotate(this.getRotation(), getCenter(geometryOrExtent));
      } else {
        geometry = geometryOrExtent;
      }

      var padding = options.padding !== undefined ? options.padding : [0, 0, 0, 0];
      var constrainResolution = options.constrainResolution !== undefined ?
        options.constrainResolution : true;
      var nearest = options.nearest !== undefined ? options.nearest : false;
      var minResolution;
      if (options.minResolution !== undefined) {
        minResolution = options.minResolution;
      } else if (options.maxZoom !== undefined) {
        minResolution = this.constrainResolution(
          this.maxResolution_, options.maxZoom - this.minZoom_, 0);
      } else {
        minResolution = 0;
      }
      var coords = geometry.getFlatCoordinates();

      // calculate rotated extent
      var rotation = this.getRotation();
      var cosAngle = Math.cos(-rotation);
      var sinAngle = Math.sin(-rotation);
      var minRotX = +Infinity;
      var minRotY = +Infinity;
      var maxRotX = -Infinity;
      var maxRotY = -Infinity;
      var stride = geometry.getStride();
      for (var i = 0, ii = coords.length; i < ii; i += stride) {
        var rotX = coords[i] * cosAngle - coords[i + 1] * sinAngle;
        var rotY = coords[i] * sinAngle + coords[i + 1] * cosAngle;
        minRotX = Math.min(minRotX, rotX);
        minRotY = Math.min(minRotY, rotY);
        maxRotX = Math.max(maxRotX, rotX);
        maxRotY = Math.max(maxRotY, rotY);
      }

      // calculate resolution
      var resolution = this.getResolutionForExtent(
        [minRotX, minRotY, maxRotX, maxRotY],
        [size[0] - padding[1] - padding[3], size[1] - padding[0] - padding[2]]);
      resolution = isNaN(resolution) ? minResolution :
        Math.max(resolution, minResolution);
      if (constrainResolution) {
        var constrainedResolution = this.constrainResolution(resolution, 0, 0);
        if (!nearest && constrainedResolution < resolution) {
          constrainedResolution = this.constrainResolution(
            constrainedResolution, -1, 0);
        }
        resolution = constrainedResolution;
      }

      // calculate center
      sinAngle = -sinAngle; // go back to original rotation
      var centerRotX = (minRotX + maxRotX) / 2;
      var centerRotY = (minRotY + maxRotY) / 2;
      centerRotX += (padding[1] - padding[3]) / 2 * resolution;
      centerRotY += (padding[0] - padding[2]) / 2 * resolution;
      var centerX = centerRotX * cosAngle - centerRotY * sinAngle;
      var centerY = centerRotY * cosAngle + centerRotX * sinAngle;
      var center = [centerX, centerY];
      var callback = options.callback ? options.callback : VOID;

      if (options.duration !== undefined) {
        this.animate({
          resolution: resolution,
          center: center,
          duration: options.duration,
          easing: options.easing
        }, callback);
      } else {
        this.setResolution(resolution);
        this.setCenter(center);
        animationCallback(callback, true);
      }
    };

    /**
     * Center on coordinate and view position.
     * @param {import("./coordinate.js").Coordinate} coordinate Coordinate.
     * @param {import("./size.js").Size} size Box pixel size.
     * @param {import("./pixel.js").Pixel} position Position on the view to center on.
     * @api
     */
    View.prototype.centerOn = function centerOn (coordinate, size, position) {
      // calculate rotated position
      var rotation = this.getRotation();
      var cosAngle = Math.cos(-rotation);
      var sinAngle = Math.sin(-rotation);
      var rotX = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
      var rotY = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
      var resolution = this.getResolution();
      rotX += (size[0] / 2 - position[0]) * resolution;
      rotY += (position[1] - size[1] / 2) * resolution;

      // go back to original angle
      sinAngle = -sinAngle; // go back to original rotation
      var centerX = rotX * cosAngle - rotY * sinAngle;
      var centerY = rotY * cosAngle + rotX * sinAngle;

      this.setCenter([centerX, centerY]);
    };

    /**
     * @return {boolean} Is defined.
     */
    View.prototype.isDef = function isDef () {
      return !!this.getCenter() && this.getResolution() !== undefined;
    };

    /**
     * Rotate the view around a given coordinate.
     * @param {number} rotation New rotation value for the view.
     * @param {import("./coordinate.js").Coordinate=} opt_anchor The rotation center.
     * @api
     */
    View.prototype.rotate = function rotate (rotation, opt_anchor) {
      if (opt_anchor !== undefined) {
        var center = this.calculateCenterRotate(rotation, opt_anchor);
        this.setCenter(center);
      }
      this.setRotation(rotation);
    };

    /**
     * Set the center of the current view.
     * @param {import("./coordinate.js").Coordinate|undefined} center The center of the view.
     * @observable
     * @api
     */
    View.prototype.setCenter = function setCenter (center) {
      this.set(ViewProperty.CENTER, center);
      if (this.getAnimating()) {
        this.cancelAnimations();
      }
    };

    /**
     * @param {ViewHint} hint Hint.
     * @param {number} delta Delta.
     * @return {number} New value.
     */
    View.prototype.setHint = function setHint (hint, delta) {
      this.hints_[hint] += delta;
      this.changed();
      return this.hints_[hint];
    };

    /**
     * Set the resolution for this view.
     * @param {number|undefined} resolution The resolution of the view.
     * @observable
     * @api
     */
    View.prototype.setResolution = function setResolution (resolution) {
      this.set(ViewProperty.RESOLUTION, resolution);
      if (this.getAnimating()) {
        this.cancelAnimations();
      }
    };

    /**
     * Set the rotation for this view.
     * @param {number} rotation The rotation of the view in radians.
     * @observable
     * @api
     */
    View.prototype.setRotation = function setRotation (rotation) {
      this.set(ViewProperty.ROTATION, rotation);
      if (this.getAnimating()) {
        this.cancelAnimations();
      }
    };

    /**
     * Zoom to a specific zoom level.
     * @param {number} zoom Zoom level.
     * @api
     */
    View.prototype.setZoom = function setZoom (zoom) {
      this.setResolution(this.getResolutionForZoom(zoom));
    };

    return View;
  }(BaseObject));


  /**
   * @param {Function} callback Callback.
   * @param {*} returnValue Return value.
   */
  function animationCallback(callback, returnValue) {
    setTimeout(function() {
      callback(returnValue);
    }, 0);
  }


  /**
   * @param {ViewOptions} options View options.
   * @return {import("./centerconstraint.js").Type} The constraint.
   */
  function createCenterConstraint(options) {
    if (options.extent !== undefined) {
      return createExtent(options.extent);
    } else {
      return none;
    }
  }


  /**
   * @param {ViewOptions} options View options.
   * @return {{constraint: import("./resolutionconstraint.js").Type, maxResolution: number,
   *     minResolution: number, minZoom: number, zoomFactor: number}} The constraint.
   */
  function createResolutionConstraint(options) {
    var resolutionConstraint;
    var maxResolution;
    var minResolution;

    // TODO: move these to be ol constants
    // see https://github.com/openlayers/openlayers/issues/2076
    var defaultMaxZoom = 28;
    var defaultZoomFactor = 2;

    var minZoom = options.minZoom !== undefined ?
      options.minZoom : DEFAULT_MIN_ZOOM;

    var maxZoom = options.maxZoom !== undefined ?
      options.maxZoom : defaultMaxZoom;

    var zoomFactor = options.zoomFactor !== undefined ?
      options.zoomFactor : defaultZoomFactor;

    if (options.resolutions !== undefined) {
      var resolutions = options.resolutions;
      maxResolution = resolutions[minZoom];
      minResolution = resolutions[maxZoom] !== undefined ?
        resolutions[maxZoom] : resolutions[resolutions.length - 1];
      resolutionConstraint = createSnapToResolutions(
        resolutions);
    } else {
      // calculate the default min and max resolution
      var projection = createProjection(options.projection, 'EPSG:3857');
      var extent = projection.getExtent();
      var size = !extent ?
        // use an extent that can fit the whole world if need be
        360 * METERS_PER_UNIT[Units.DEGREES] /
              projection.getMetersPerUnit() :
        Math.max(getWidth(extent), getHeight(extent));

      var defaultMaxResolution = size / DEFAULT_TILE_SIZE / Math.pow(
        defaultZoomFactor, DEFAULT_MIN_ZOOM);

      var defaultMinResolution = defaultMaxResolution / Math.pow(
        defaultZoomFactor, defaultMaxZoom - DEFAULT_MIN_ZOOM);

      // user provided maxResolution takes precedence
      maxResolution = options.maxResolution;
      if (maxResolution !== undefined) {
        minZoom = 0;
      } else {
        maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom);
      }

      // user provided minResolution takes precedence
      minResolution = options.minResolution;
      if (minResolution === undefined) {
        if (options.maxZoom !== undefined) {
          if (options.maxResolution !== undefined) {
            minResolution = maxResolution / Math.pow(zoomFactor, maxZoom);
          } else {
            minResolution = defaultMaxResolution / Math.pow(zoomFactor, maxZoom);
          }
        } else {
          minResolution = defaultMinResolution;
        }
      }

      // given discrete zoom levels, minResolution may be different than provided
      maxZoom = minZoom + Math.floor(
        Math.log(maxResolution / minResolution) / Math.log(zoomFactor));
      minResolution = maxResolution / Math.pow(zoomFactor, maxZoom - minZoom);

      resolutionConstraint = createSnapToPower(
        zoomFactor, maxResolution, maxZoom - minZoom);
    }
    return {constraint: resolutionConstraint, maxResolution: maxResolution,
      minResolution: minResolution, minZoom: minZoom, zoomFactor: zoomFactor};
  }


  /**
   * @param {ViewOptions} options View options.
   * @return {import("./rotationconstraint.js").Type} Rotation constraint.
   */
  function createRotationConstraint(options) {
    var enableRotation = options.enableRotation !== undefined ?
      options.enableRotation : true;
    if (enableRotation) {
      var constrainRotation = options.constrainRotation;
      if (constrainRotation === undefined || constrainRotation === true) {
        return createSnapToZero();
      } else if (constrainRotation === false) {
        return none$1;
      } else if (typeof constrainRotation === 'number') {
        return createSnapToN(constrainRotation);
      } else {
        return none$1;
      }
    } else {
      return disable;
    }
  }


  /**
   * Determine if an animation involves no view change.
   * @param {Animation} animation The animation.
   * @return {boolean} The animation involves no view change.
   */
  function isNoopAnimation(animation) {
    if (animation.sourceCenter && animation.targetCenter) {
      if (!equals$1(animation.sourceCenter, animation.targetCenter)) {
        return false;
      }
    }
    if (animation.sourceResolution !== animation.targetResolution) {
      return false;
    }
    if (animation.sourceRotation !== animation.targetRotation) {
      return false;
    }
    return true;
  }

  /**
   * @module ol/dom
   */


  /**
   * Create an html canvas element and returns its 2d context.
   * @param {number=} opt_width Canvas width.
   * @param {number=} opt_height Canvas height.
   * @return {CanvasRenderingContext2D} The context.
   */
  function createCanvasContext2D(opt_width, opt_height) {
    var canvas = /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
    if (opt_width) {
      canvas.width = opt_width;
    }
    if (opt_height) {
      canvas.height = opt_height;
    }
    return /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  }

  /**
   * @param {Node} newNode Node to replace old node
   * @param {Node} oldNode The node to be replaced
   */
  function replaceNode(newNode, oldNode) {
    var parent = oldNode.parentNode;
    if (parent) {
      parent.replaceChild(newNode, oldNode);
    }
  }

  /**
   * @param {Node} node The node to remove.
   * @returns {Node} The node that was removed or null.
   */
  function removeNode(node) {
    return node && node.parentNode ? node.parentNode.removeChild(node) : null;
  }

  /**
   * @param {Node} node The node to remove the children from.
   */
  function removeChildren(node) {
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  }

  /**
   * @module ol/layer/Property
   */

  /**
   * @enum {string}
   */
  var LayerProperty = {
    OPACITY: 'opacity',
    VISIBLE: 'visible',
    EXTENT: 'extent',
    Z_INDEX: 'zIndex',
    MAX_RESOLUTION: 'maxResolution',
    MIN_RESOLUTION: 'minResolution',
    SOURCE: 'source'
  };

  /**
   * @module ol/layer/Base
   */


  /**
   * @typedef {Object} Options
   * @property {number} [opacity=1] Opacity (0, 1).
   * @property {boolean} [visible=true] Visibility.
   * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
   * rendered outside of this extent.
   * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
   * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
   * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
   * method was used.
   * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
   * visible.
   * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
   * be visible.
   */


  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * Note that with {@link module:ol/layer/Base} and all its subclasses, any property set in
   * the options is set as a {@link module:ol/Object} property on the layer object, so
   * is observable, and has get/set accessors.
   *
   * @api
   */
  var BaseLayer = /*@__PURE__*/(function (BaseObject) {
    function BaseLayer(options) {

      BaseObject.call(this);

      /**
       * @type {Object<string, *>}
       */
      var properties = assign({}, options);
      properties[LayerProperty.OPACITY] =
         options.opacity !== undefined ? options.opacity : 1;
      properties[LayerProperty.VISIBLE] =
         options.visible !== undefined ? options.visible : true;
      properties[LayerProperty.Z_INDEX] = options.zIndex;
      properties[LayerProperty.MAX_RESOLUTION] =
         options.maxResolution !== undefined ? options.maxResolution : Infinity;
      properties[LayerProperty.MIN_RESOLUTION] =
         options.minResolution !== undefined ? options.minResolution : 0;

      this.setProperties(properties);

      /**
       * @type {import("./Layer.js").State}
       * @private
       */
      this.state_ = null;

      /**
       * The layer type.
       * @type {import("../LayerType.js").default}
       * @protected;
       */
      this.type;

    }

    if ( BaseObject ) BaseLayer.__proto__ = BaseObject;
    BaseLayer.prototype = Object.create( BaseObject && BaseObject.prototype );
    BaseLayer.prototype.constructor = BaseLayer;

    /**
     * Get the layer type (used when creating a layer renderer).
     * @return {import("../LayerType.js").default} The layer type.
     */
    BaseLayer.prototype.getType = function getType () {
      return this.type;
    };

    /**
     * @return {import("./Layer.js").State} Layer state.
     */
    BaseLayer.prototype.getLayerState = function getLayerState () {
      /** @type {import("./Layer.js").State} */
      var state = this.state_ || /** @type {?} */ ({
        layer: this,
        managed: true
      });
      state.opacity = clamp(this.getOpacity(), 0, 1);
      state.sourceState = this.getSourceState();
      state.visible = this.getVisible();
      state.extent = this.getExtent();
      state.zIndex = this.getZIndex() || 0;
      state.maxResolution = this.getMaxResolution();
      state.minResolution = Math.max(this.getMinResolution(), 0);
      this.state_ = state;

      return state;
    };

    /**
     * @abstract
     * @param {Array<import("./Layer.js").default>=} opt_array Array of layers (to be
     *     modified in place).
     * @return {Array<import("./Layer.js").default>} Array of layers.
     */
    BaseLayer.prototype.getLayersArray = function getLayersArray (opt_array) {
      return abstract();
    };

    /**
     * @abstract
     * @param {Array<import("./Layer.js").State>=} opt_states Optional list of layer
     *     states (to be modified in place).
     * @return {Array<import("./Layer.js").State>} List of layer states.
     */
    BaseLayer.prototype.getLayerStatesArray = function getLayerStatesArray (opt_states) {
      return abstract();
    };

    /**
     * Return the {@link module:ol/extent~Extent extent} of the layer or `undefined` if it
     * will be visible regardless of extent.
     * @return {import("../extent.js").Extent|undefined} The layer extent.
     * @observable
     * @api
     */
    BaseLayer.prototype.getExtent = function getExtent () {
      return (
        /** @type {import("../extent.js").Extent|undefined} */ (this.get(LayerProperty.EXTENT))
      );
    };

    /**
     * Return the maximum resolution of the layer.
     * @return {number} The maximum resolution of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.getMaxResolution = function getMaxResolution () {
      return /** @type {number} */ (this.get(LayerProperty.MAX_RESOLUTION));
    };

    /**
     * Return the minimum resolution of the layer.
     * @return {number} The minimum resolution of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.getMinResolution = function getMinResolution () {
      return /** @type {number} */ (this.get(LayerProperty.MIN_RESOLUTION));
    };

    /**
     * Return the opacity of the layer (between 0 and 1).
     * @return {number} The opacity of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.getOpacity = function getOpacity () {
      return /** @type {number} */ (this.get(LayerProperty.OPACITY));
    };

    /**
     * @abstract
     * @return {import("../source/State.js").default} Source state.
     */
    BaseLayer.prototype.getSourceState = function getSourceState () {
      return abstract();
    };

    /**
     * Return the visibility of the layer (`true` or `false`).
     * @return {boolean} The visibility of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.getVisible = function getVisible () {
      return /** @type {boolean} */ (this.get(LayerProperty.VISIBLE));
    };

    /**
     * Return the Z-index of the layer, which is used to order layers before
     * rendering. The default Z-index is 0.
     * @return {number} The Z-index of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.getZIndex = function getZIndex () {
      return /** @type {number} */ (this.get(LayerProperty.Z_INDEX));
    };

    /**
     * Set the extent at which the layer is visible.  If `undefined`, the layer
     * will be visible at all extents.
     * @param {import("../extent.js").Extent|undefined} extent The extent of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.setExtent = function setExtent (extent) {
      this.set(LayerProperty.EXTENT, extent);
    };

    /**
     * Set the maximum resolution at which the layer is visible.
     * @param {number} maxResolution The maximum resolution of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.setMaxResolution = function setMaxResolution (maxResolution) {
      this.set(LayerProperty.MAX_RESOLUTION, maxResolution);
    };

    /**
     * Set the minimum resolution at which the layer is visible.
     * @param {number} minResolution The minimum resolution of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.setMinResolution = function setMinResolution (minResolution) {
      this.set(LayerProperty.MIN_RESOLUTION, minResolution);
    };

    /**
     * Set the opacity of the layer, allowed values range from 0 to 1.
     * @param {number} opacity The opacity of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.setOpacity = function setOpacity (opacity) {
      this.set(LayerProperty.OPACITY, opacity);
    };

    /**
     * Set the visibility of the layer (`true` or `false`).
     * @param {boolean} visible The visibility of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.setVisible = function setVisible (visible) {
      this.set(LayerProperty.VISIBLE, visible);
    };

    /**
     * Set Z-index of the layer, which is used to order layers before rendering.
     * The default Z-index is 0.
     * @param {number} zindex The z-index of the layer.
     * @observable
     * @api
     */
    BaseLayer.prototype.setZIndex = function setZIndex (zindex) {
      this.set(LayerProperty.Z_INDEX, zindex);
    };

    return BaseLayer;
  }(BaseObject));

  /**
   * @module ol/source/State
   */

  /**
   * @enum {string}
   * State of the source, one of 'undefined', 'loading', 'ready' or 'error'.
   */
  var SourceState = {
    UNDEFINED: 'undefined',
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error'
  };

  /**
   * @module ol/layer/Group
   */


  /**
   * @typedef {Object} Options
   * @property {number} [opacity=1] Opacity (0, 1).
   * @property {boolean} [visible=true] Visibility.
   * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
   * rendered outside of this extent.
   * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
   * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
   * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
   * method was used.
   * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
   * visible.
   * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
   * be visible.
   * @property {Array<import("./Base.js").default>|import("../Collection.js").default<import("./Base.js").default>} [layers] Child layers.
   */


  /**
   * @enum {string}
   * @private
   */
  var Property$1 = {
    LAYERS: 'layers'
  };


  /**
   * @classdesc
   * A {@link module:ol/Collection~Collection} of layers that are handled together.
   *
   * A generic `change` event is triggered when the group/Collection changes.
   *
   * @api
   */
  var LayerGroup = /*@__PURE__*/(function (BaseLayer) {
    function LayerGroup(opt_options) {

      var options = opt_options || {};
      var baseOptions = /** @type {Options} */ (assign({}, options));
      delete baseOptions.layers;

      var layers = options.layers;

      BaseLayer.call(this, baseOptions);

      /**
       * @private
       * @type {Array<import("../events.js").EventsKey>}
       */
      this.layersListenerKeys_ = [];

      /**
       * @private
       * @type {Object<string, Array<import("../events.js").EventsKey>>}
       */
      this.listenerKeys_ = {};

      listen(this,
        getChangeEventType(Property$1.LAYERS),
        this.handleLayersChanged_, this);

      if (layers) {
        if (Array.isArray(layers)) {
          layers = new Collection(layers.slice(), {unique: true});
        } else {
          assert(typeof /** @type {?} */ (layers).getArray === 'function',
            43); // Expected `layers` to be an array or a `Collection`
        }
      } else {
        layers = new Collection(undefined, {unique: true});
      }

      this.setLayers(layers);

    }

    if ( BaseLayer ) LayerGroup.__proto__ = BaseLayer;
    LayerGroup.prototype = Object.create( BaseLayer && BaseLayer.prototype );
    LayerGroup.prototype.constructor = LayerGroup;

    /**
     * @private
     */
    LayerGroup.prototype.handleLayerChange_ = function handleLayerChange_ () {
      this.changed();
    };

    /**
     * @private
     */
    LayerGroup.prototype.handleLayersChanged_ = function handleLayersChanged_ () {
      this.layersListenerKeys_.forEach(unlistenByKey);
      this.layersListenerKeys_.length = 0;

      var layers = this.getLayers();
      this.layersListenerKeys_.push(
        listen(layers, CollectionEventType.ADD, this.handleLayersAdd_, this),
        listen(layers, CollectionEventType.REMOVE, this.handleLayersRemove_, this)
      );

      for (var id in this.listenerKeys_) {
        this.listenerKeys_[id].forEach(unlistenByKey);
      }
      clear(this.listenerKeys_);

      var layersArray = layers.getArray();
      for (var i = 0, ii = layersArray.length; i < ii; i++) {
        var layer = layersArray[i];
        this.listenerKeys_[getUid(layer)] = [
          listen(layer, ObjectEventType.PROPERTYCHANGE, this.handleLayerChange_, this),
          listen(layer, EventType.CHANGE, this.handleLayerChange_, this)
        ];
      }

      this.changed();
    };

    /**
     * @param {import("../Collection.js").CollectionEvent} collectionEvent CollectionEvent.
     * @private
     */
    LayerGroup.prototype.handleLayersAdd_ = function handleLayersAdd_ (collectionEvent) {
      var layer = /** @type {import("./Base.js").default} */ (collectionEvent.element);
      this.listenerKeys_[getUid(layer)] = [
        listen(layer, ObjectEventType.PROPERTYCHANGE, this.handleLayerChange_, this),
        listen(layer, EventType.CHANGE, this.handleLayerChange_, this)
      ];
      this.changed();
    };

    /**
     * @param {import("../Collection.js").CollectionEvent} collectionEvent CollectionEvent.
     * @private
     */
    LayerGroup.prototype.handleLayersRemove_ = function handleLayersRemove_ (collectionEvent) {
      var layer = /** @type {import("./Base.js").default} */ (collectionEvent.element);
      var key = getUid(layer);
      this.listenerKeys_[key].forEach(unlistenByKey);
      delete this.listenerKeys_[key];
      this.changed();
    };

    /**
     * Returns the {@link module:ol/Collection collection} of {@link module:ol/layer/Layer~Layer layers}
     * in this group.
     * @return {!import("../Collection.js").default<import("./Base.js").default>} Collection of
     *   {@link module:ol/layer/Base layers} that are part of this group.
     * @observable
     * @api
     */
    LayerGroup.prototype.getLayers = function getLayers () {
      return (
        /** @type {!import("../Collection.js").default<import("./Base.js").default>} */ (this.get(Property$1.LAYERS))
      );
    };

    /**
     * Set the {@link module:ol/Collection collection} of {@link module:ol/layer/Layer~Layer layers}
     * in this group.
     * @param {!import("../Collection.js").default<import("./Base.js").default>} layers Collection of
     *   {@link module:ol/layer/Base layers} that are part of this group.
     * @observable
     * @api
     */
    LayerGroup.prototype.setLayers = function setLayers (layers) {
      this.set(Property$1.LAYERS, layers);
    };

    /**
     * @inheritDoc
     */
    LayerGroup.prototype.getLayersArray = function getLayersArray (opt_array) {
      var array = opt_array !== undefined ? opt_array : [];
      this.getLayers().forEach(function(layer) {
        layer.getLayersArray(array);
      });
      return array;
    };

    /**
     * @inheritDoc
     */
    LayerGroup.prototype.getLayerStatesArray = function getLayerStatesArray (opt_states) {
      var states = opt_states !== undefined ? opt_states : [];

      var pos = states.length;

      this.getLayers().forEach(function(layer) {
        layer.getLayerStatesArray(states);
      });

      var ownLayerState = this.getLayerState();
      for (var i = pos, ii = states.length; i < ii; i++) {
        var layerState = states[i];
        layerState.opacity *= ownLayerState.opacity;
        layerState.visible = layerState.visible && ownLayerState.visible;
        layerState.maxResolution = Math.min(
          layerState.maxResolution, ownLayerState.maxResolution);
        layerState.minResolution = Math.max(
          layerState.minResolution, ownLayerState.minResolution);
        if (ownLayerState.extent !== undefined) {
          if (layerState.extent !== undefined) {
            layerState.extent = getIntersection(layerState.extent, ownLayerState.extent);
          } else {
            layerState.extent = ownLayerState.extent;
          }
        }
      }

      return states;
    };

    /**
     * @inheritDoc
     */
    LayerGroup.prototype.getSourceState = function getSourceState () {
      return SourceState.READY;
    };

    return LayerGroup;
  }(BaseLayer));

  /**
   * @module ol/size
   */


  /**
   * Determines if a size has a positive area.
   * @param {Size} size The size to test.
   * @return {boolean} The size has a positive area.
   */
  function hasArea(size) {
    return size[0] > 0 && size[1] > 0;
  }


  /**
   * Returns a size scaled by a ratio. The result will be an array of integers.
   * @param {Size} size Size.
   * @param {number} ratio Ratio.
   * @param {Size=} opt_size Optional reusable size array.
   * @return {Size} The scaled size.
   */
  function scale$3(size, ratio, opt_size) {
    if (opt_size === undefined) {
      opt_size = [0, 0];
    }
    opt_size[0] = (size[0] * ratio + 0.5) | 0;
    opt_size[1] = (size[1] * ratio + 0.5) | 0;
    return opt_size;
  }


  /**
   * Returns an `Size` array for the passed in number (meaning: square) or
   * `Size` array.
   * (meaning: non-square),
   * @param {number|Size} size Width and height.
   * @param {Size=} opt_size Optional reusable size array.
   * @return {Size} Size.
   * @api
   */
  function toSize(size, opt_size) {
    if (Array.isArray(size)) {
      return size;
    } else {
      if (opt_size === undefined) {
        opt_size = [size, size];
      } else {
        opt_size[0] = opt_size[1] = /** @type {number} */ (size);
      }
      return opt_size;
    }
  }

  /**
   * @module ol/PluggableMap
   */


  /**
   * State of the current frame. Only `pixelRatio`, `time` and `viewState` should
   * be used in applications.
   * @typedef {Object} FrameState
   * @property {number} pixelRatio The pixel ratio of the frame.
   * @property {number} time The time when rendering of the frame was requested.
   * @property {import("./View.js").State} viewState The state of the current view.
   * @property {boolean} animate
   * @property {import("./transform.js").Transform} coordinateToPixelTransform
   * @property {null|import("./extent.js").Extent} extent
   * @property {import("./coordinate.js").Coordinate} focus
   * @property {number} index
   * @property {Object<string, import("./layer/Layer.js").State>} layerStates
   * @property {Array<import("./layer/Layer.js").State>} layerStatesArray
   * @property {import("./transform.js").Transform} pixelToCoordinateTransform
   * @property {Array<PostRenderFunction>} postRenderFunctions
   * @property {import("./size.js").Size} size
   * @property {!Object<string, boolean>} skippedFeatureUids
   * @property {TileQueue} tileQueue
   * @property {Object<string, Object<string, import("./TileRange.js").default>>} usedTiles
   * @property {Array<number>} viewHints
   * @property {!Object<string, Object<string, boolean>>} wantedTiles
   */


  /**
   * @typedef {function(PluggableMap, ?FrameState): boolean} PostRenderFunction
   */


  /**
   * @typedef {Object} AtPixelOptions
   * @property {undefined|function(import("./layer/Layer.js").default): boolean} layerFilter Layer filter
   * function. The filter function will receive one argument, the
   * {@link module:ol/layer/Layer layer-candidate} and it should return a boolean value.
   * Only layers which are visible and for which this function returns `true`
   * will be tested for features. By default, all visible layers will be tested.
   * @property {number} [hitTolerance=0] Hit-detection tolerance in pixels. Pixels
   * inside the radius around the given position will be checked for features. This only
   * works for the canvas renderer and not for WebGL.
   */


  /**
   * @typedef {Object} MapOptionsInternal
   * @property {Collection<import("./control/Control.js").default>} [controls]
   * @property {Collection<import("./interaction/Interaction.js").default>} [interactions]
   * @property {HTMLElement|Document} keyboardEventTarget
   * @property {Collection<import("./Overlay.js").default>} overlays
   * @property {Object<string, *>} values
   */


  /**
   * Object literal with config options for the map.
   * @typedef {Object} MapOptions
   * @property {Collection<import("./control/Control.js").default>|Array<import("./control/Control.js").default>} [controls]
   * Controls initially added to the map. If not specified,
   * {@link module:ol/control~defaults} is used.
   * @property {number} [pixelRatio=window.devicePixelRatio] The ratio between
   * physical pixels and device-independent pixels (dips) on the device.
   * @property {Collection<import("./interaction/Interaction.js").default>|Array<import("./interaction/Interaction.js").default>} [interactions]
   * Interactions that are initially added to the map. If not specified,
   * {@link module:ol/interaction~defaults} is used.
   * @property {HTMLElement|Document|string} [keyboardEventTarget] The element to
   * listen to keyboard events on. This determines when the `KeyboardPan` and
   * `KeyboardZoom` interactions trigger. For example, if this option is set to
   * `document` the keyboard interactions will always trigger. If this option is
   * not specified, the element the library listens to keyboard events on is the
   * map target (i.e. the user-provided div for the map). If this is not
   * `document`, the target element needs to be focused for key events to be
   * emitted, requiring that the target element has a `tabindex` attribute.
   * @property {Array<import("./layer/Base.js").default>|Collection<import("./layer/Base.js").default>|LayerGroup} [layers]
   * Layers. If this is not defined, a map with no layers will be rendered. Note
   * that layers are rendered in the order supplied, so if you want, for example,
   * a vector layer to appear on top of a tile layer, it must come after the tile
   * layer.
   * @property {number} [maxTilesLoading=16] Maximum number tiles to load
   * simultaneously.
   * @property {boolean} [loadTilesWhileAnimating=false] When set to `true`, tiles
   * will be loaded during animations. This may improve the user experience, but
   * can also make animations stutter on devices with slow memory.
   * @property {boolean} [loadTilesWhileInteracting=false] When set to `true`,
   * tiles will be loaded while interacting with the map. This may improve the
   * user experience, but can also make map panning and zooming choppy on devices
   * with slow memory.
   * @property {number} [moveTolerance=1] The minimum distance in pixels the
   * cursor must move to be detected as a map move event instead of a click.
   * Increasing this value can make it easier to click on the map.
   * @property {Collection<import("./Overlay.js").default>|Array<import("./Overlay.js").default>} [overlays]
   * Overlays initially added to the map. By default, no overlays are added.
   * @property {HTMLElement|string} [target] The container for the map, either the
   * element itself or the `id` of the element. If not specified at construction
   * time, {@link module:ol/Map~Map#setTarget} must be called for the map to be
   * rendered.
   * @property {View} [view] The map's view.  No layer sources will be
   * fetched unless this is specified at construction time or through
   * {@link module:ol/Map~Map#setView}.
   */


  /**
   * @fires import("./MapBrowserEvent.js").MapBrowserEvent
   * @fires import("./MapEvent.js").MapEvent
   * @fires module:ol/render/Event~RenderEvent#postcompose
   * @fires module:ol/render/Event~RenderEvent#precompose
   * @fires module:ol/render/Event~RenderEvent#rendercomplete
   * @api
   */
  var PluggableMap = /*@__PURE__*/(function (BaseObject) {
    function PluggableMap(options) {

      BaseObject.call(this);

      var optionsInternal = createOptionsInternal(options);

      /**
       * @type {number}
       * @private
       */
      this.maxTilesLoading_ = options.maxTilesLoading !== undefined ? options.maxTilesLoading : 16;

      /**
       * @type {boolean}
       * @private
       */
      this.loadTilesWhileAnimating_ =
          options.loadTilesWhileAnimating !== undefined ?
            options.loadTilesWhileAnimating : false;

      /**
       * @type {boolean}
       * @private
       */
      this.loadTilesWhileInteracting_ =
          options.loadTilesWhileInteracting !== undefined ?
            options.loadTilesWhileInteracting : false;

      /**
       * @private
       * @type {number}
       */
      this.pixelRatio_ = options.pixelRatio !== undefined ?
        options.pixelRatio : DEVICE_PIXEL_RATIO;

      /**
       * @private
       * @type {number|undefined}
       */
      this.animationDelayKey_;

      /**
       * @private
       */
      this.animationDelay_ = function() {
        this.animationDelayKey_ = undefined;
        this.renderFrame_.call(this, Date.now());
      }.bind(this);

      /**
       * @private
       * @type {import("./transform.js").Transform}
       */
      this.coordinateToPixelTransform_ = create();

      /**
       * @private
       * @type {import("./transform.js").Transform}
       */
      this.pixelToCoordinateTransform_ = create();

      /**
       * @private
       * @type {number}
       */
      this.frameIndex_ = 0;

      /**
       * @private
       * @type {?FrameState}
       */
      this.frameState_ = null;

      /**
       * The extent at the previous 'moveend' event.
       * @private
       * @type {import("./extent.js").Extent}
       */
      this.previousExtent_ = null;

      /**
       * @private
       * @type {?import("./events.js").EventsKey}
       */
      this.viewPropertyListenerKey_ = null;

      /**
       * @private
       * @type {?import("./events.js").EventsKey}
       */
      this.viewChangeListenerKey_ = null;

      /**
       * @private
       * @type {Array<import("./events.js").EventsKey>}
       */
      this.layerGroupPropertyListenerKeys_ = null;

      /**
       * @private
       * @type {!HTMLElement}
       */
      this.viewport_ = document.createElement('div');
      this.viewport_.className = 'ol-viewport' + (TOUCH ? ' ol-touch' : '');
      this.viewport_.style.position = 'relative';
      this.viewport_.style.overflow = 'hidden';
      this.viewport_.style.width = '100%';
      this.viewport_.style.height = '100%';
      // prevent page zoom on IE >= 10 browsers
      this.viewport_.style.msTouchAction = 'none';
      this.viewport_.style.touchAction = 'none';

      /**
       * @private
       * @type {!HTMLElement}
       */
      this.overlayContainer_ = document.createElement('div');
      this.overlayContainer_.className = 'ol-overlaycontainer';
      this.viewport_.appendChild(this.overlayContainer_);

      /**
       * @private
       * @type {!HTMLElement}
       */
      this.overlayContainerStopEvent_ = document.createElement('div');
      this.overlayContainerStopEvent_.className = 'ol-overlaycontainer-stopevent';
      var overlayEvents = [
        EventType.CLICK,
        EventType.DBLCLICK,
        EventType.MOUSEDOWN,
        EventType.TOUCHSTART,
        EventType.MSPOINTERDOWN,
        MapBrowserEventType.POINTERDOWN,
        EventType.MOUSEWHEEL,
        EventType.WHEEL
      ];
      for (var i = 0, ii = overlayEvents.length; i < ii; ++i) {
        listen(this.overlayContainerStopEvent_, overlayEvents[i], stopPropagation);
      }
      this.viewport_.appendChild(this.overlayContainerStopEvent_);

      /**
       * @private
       * @type {MapBrowserEventHandler}
       */
      this.mapBrowserEventHandler_ = new MapBrowserEventHandler(this, options.moveTolerance);
      for (var key in MapBrowserEventType) {
        listen(this.mapBrowserEventHandler_, MapBrowserEventType[key],
          this.handleMapBrowserEvent, this);
      }

      /**
       * @private
       * @type {HTMLElement|Document}
       */
      this.keyboardEventTarget_ = optionsInternal.keyboardEventTarget;

      /**
       * @private
       * @type {Array<import("./events.js").EventsKey>}
       */
      this.keyHandlerKeys_ = null;

      listen(this.viewport_, EventType.CONTEXTMENU, this.handleBrowserEvent, this);
      listen(this.viewport_, EventType.WHEEL, this.handleBrowserEvent, this);
      listen(this.viewport_, EventType.MOUSEWHEEL, this.handleBrowserEvent, this);

      /**
       * @type {Collection<import("./control/Control.js").default>}
       * @protected
       */
      this.controls = optionsInternal.controls || new Collection();

      /**
       * @type {Collection<import("./interaction/Interaction.js").default>}
       * @protected
       */
      this.interactions = optionsInternal.interactions || new Collection();

      /**
       * @type {Collection<import("./Overlay.js").default>}
       * @private
       */
      this.overlays_ = optionsInternal.overlays;

      /**
       * A lookup of overlays by id.
       * @private
       * @type {Object<string, import("./Overlay.js").default>}
       */
      this.overlayIdIndex_ = {};

      /**
       * @type {import("./renderer/Map.js").default}
       * @private
       */
      this.renderer_ = this.createRenderer();

      /**
       * @type {function(Event)|undefined}
       * @private
       */
      this.handleResize_;

      /**
       * @private
       * @type {import("./coordinate.js").Coordinate}
       */
      this.focus_ = null;

      /**
       * @private
       * @type {!Array<PostRenderFunction>}
       */
      this.postRenderFunctions_ = [];

      /**
       * @private
       * @type {TileQueue}
       */
      this.tileQueue_ = new TileQueue(
        this.getTilePriority.bind(this),
        this.handleTileChange_.bind(this));

      /**
       * Uids of features to skip at rendering time.
       * @type {Object<string, boolean>}
       * @private
       */
      this.skippedFeatureUids_ = {};

      listen(
        this, getChangeEventType(MapProperty.LAYERGROUP),
        this.handleLayerGroupChanged_, this);
      listen(this, getChangeEventType(MapProperty.VIEW),
        this.handleViewChanged_, this);
      listen(this, getChangeEventType(MapProperty.SIZE),
        this.handleSizeChanged_, this);
      listen(this, getChangeEventType(MapProperty.TARGET),
        this.handleTargetChanged_, this);

      // setProperties will trigger the rendering of the map if the map
      // is "defined" already.
      this.setProperties(optionsInternal.values);

      this.controls.forEach(
        /**
         * @param {import("./control/Control.js").default} control Control.
         * @this {PluggableMap}
         */
        (function(control) {
          control.setMap(this);
        }).bind(this));

      listen(this.controls, CollectionEventType.ADD,
        /**
         * @param {import("./Collection.js").CollectionEvent} event CollectionEvent.
         */
        function(event) {
          event.element.setMap(this);
        }, this);

      listen(this.controls, CollectionEventType.REMOVE,
        /**
         * @param {import("./Collection.js").CollectionEvent} event CollectionEvent.
         */
        function(event) {
          event.element.setMap(null);
        }, this);

      this.interactions.forEach(
        /**
         * @param {import("./interaction/Interaction.js").default} interaction Interaction.
         * @this {PluggableMap}
         */
        (function(interaction) {
          interaction.setMap(this);
        }).bind(this));

      listen(this.interactions, CollectionEventType.ADD,
        /**
         * @param {import("./Collection.js").CollectionEvent} event CollectionEvent.
         */
        function(event) {
          event.element.setMap(this);
        }, this);

      listen(this.interactions, CollectionEventType.REMOVE,
        /**
         * @param {import("./Collection.js").CollectionEvent} event CollectionEvent.
         */
        function(event) {
          event.element.setMap(null);
        }, this);

      this.overlays_.forEach(this.addOverlayInternal_.bind(this));

      listen(this.overlays_, CollectionEventType.ADD,
        /**
         * @param {import("./Collection.js").CollectionEvent} event CollectionEvent.
         */
        function(event) {
          this.addOverlayInternal_(/** @type {import("./Overlay.js").default} */ (event.element));
        }, this);

      listen(this.overlays_, CollectionEventType.REMOVE,
        /**
         * @param {import("./Collection.js").CollectionEvent} event CollectionEvent.
         */
        function(event) {
          var overlay = /** @type {import("./Overlay.js").default} */ (event.element);
          var id = overlay.getId();
          if (id !== undefined) {
            delete this.overlayIdIndex_[id.toString()];
          }
          event.element.setMap(null);
        }, this);

    }

    if ( BaseObject ) PluggableMap.__proto__ = BaseObject;
    PluggableMap.prototype = Object.create( BaseObject && BaseObject.prototype );
    PluggableMap.prototype.constructor = PluggableMap;

    /**
     * @abstract
     * @return {import("./renderer/Map.js").default} The map renderer
     */
    PluggableMap.prototype.createRenderer = function createRenderer () {
      throw new Error('Use a map type that has a createRenderer method');
    };

    /**
     * Add the given control to the map.
     * @param {import("./control/Control.js").default} control Control.
     * @api
     */
    PluggableMap.prototype.addControl = function addControl (control) {
      this.getControls().push(control);
    };

    /**
     * Add the given interaction to the map.
     * @param {import("./interaction/Interaction.js").default} interaction Interaction to add.
     * @api
     */
    PluggableMap.prototype.addInteraction = function addInteraction (interaction) {
      this.getInteractions().push(interaction);
    };

    /**
     * Adds the given layer to the top of this map. If you want to add a layer
     * elsewhere in the stack, use `getLayers()` and the methods available on
     * {@link module:ol/Collection~Collection}.
     * @param {import("./layer/Base.js").default} layer Layer.
     * @api
     */
    PluggableMap.prototype.addLayer = function addLayer (layer) {
      var layers = this.getLayerGroup().getLayers();
      layers.push(layer);
    };

    /**
     * Add the given overlay to the map.
     * @param {import("./Overlay.js").default} overlay Overlay.
     * @api
     */
    PluggableMap.prototype.addOverlay = function addOverlay (overlay) {
      this.getOverlays().push(overlay);
    };

    /**
     * This deals with map's overlay collection changes.
     * @param {import("./Overlay.js").default} overlay Overlay.
     * @private
     */
    PluggableMap.prototype.addOverlayInternal_ = function addOverlayInternal_ (overlay) {
      var id = overlay.getId();
      if (id !== undefined) {
        this.overlayIdIndex_[id.toString()] = overlay;
      }
      overlay.setMap(this);
    };

    /**
     *
     * @inheritDoc
     */
    PluggableMap.prototype.disposeInternal = function disposeInternal () {
      this.mapBrowserEventHandler_.dispose();
      unlisten(this.viewport_, EventType.CONTEXTMENU, this.handleBrowserEvent, this);
      unlisten(this.viewport_, EventType.WHEEL, this.handleBrowserEvent, this);
      unlisten(this.viewport_, EventType.MOUSEWHEEL, this.handleBrowserEvent, this);
      if (this.handleResize_ !== undefined) {
        removeEventListener(EventType.RESIZE, this.handleResize_, false);
        this.handleResize_ = undefined;
      }
      if (this.animationDelayKey_) {
        cancelAnimationFrame(this.animationDelayKey_);
        this.animationDelayKey_ = undefined;
      }
      this.setTarget(null);
      BaseObject.prototype.disposeInternal.call(this);
    };

    /**
     * Detect features that intersect a pixel on the viewport, and execute a
     * callback with each intersecting feature. Layers included in the detection can
     * be configured through the `layerFilter` option in `opt_options`.
     * @param {import("./pixel.js").Pixel} pixel Pixel.
     * @param {function(this: S, import("./Feature.js").FeatureLike,
     *     import("./layer/Layer.js").default): T} callback Feature callback. The callback will be
     *     called with two arguments. The first argument is one
     *     {@link module:ol/Feature feature} or
     *     {@link module:ol/render/Feature render feature} at the pixel, the second is
     *     the {@link module:ol/layer/Layer layer} of the feature and will be null for
     *     unmanaged layers. To stop detection, callback functions can return a
     *     truthy value.
     * @param {AtPixelOptions=} opt_options Optional options.
     * @return {T|undefined} Callback result, i.e. the return value of last
     * callback execution, or the first truthy callback return value.
     * @template S,T
     * @api
     */
    PluggableMap.prototype.forEachFeatureAtPixel = function forEachFeatureAtPixel (pixel, callback, opt_options) {
      if (!this.frameState_) {
        return;
      }
      var coordinate = this.getCoordinateFromPixel(pixel);
      opt_options = opt_options !== undefined ? opt_options :
        /** @type {AtPixelOptions} */ ({});
      var hitTolerance = opt_options.hitTolerance !== undefined ?
        opt_options.hitTolerance * this.frameState_.pixelRatio : 0;
      var layerFilter = opt_options.layerFilter !== undefined ?
        opt_options.layerFilter : TRUE;
      return this.renderer_.forEachFeatureAtCoordinate(
        coordinate, this.frameState_, hitTolerance, callback, null,
        layerFilter, null);
    };

    /**
     * Get all features that intersect a pixel on the viewport.
     * @param {import("./pixel.js").Pixel} pixel Pixel.
     * @param {AtPixelOptions=} opt_options Optional options.
     * @return {Array<import("./Feature.js").FeatureLike>} The detected features or
     * `null` if none were found.
     * @api
     */
    PluggableMap.prototype.getFeaturesAtPixel = function getFeaturesAtPixel (pixel, opt_options) {
      var features = null;
      this.forEachFeatureAtPixel(pixel, function(feature) {
        if (!features) {
          features = [];
        }
        features.push(feature);
      }, opt_options);
      return features;
    };

    /**
     * Detect layers that have a color value at a pixel on the viewport, and
     * execute a callback with each matching layer. Layers included in the
     * detection can be configured through `opt_layerFilter`.
     * @param {import("./pixel.js").Pixel} pixel Pixel.
     * @param {function(this: S, import("./layer/Layer.js").default, (Uint8ClampedArray|Uint8Array)): T} callback
     *     Layer callback. This callback will receive two arguments: first is the
     *     {@link module:ol/layer/Layer layer}, second argument is an array representing
     *     [R, G, B, A] pixel values (0 - 255) and will be `null` for layer types
     *     that do not currently support this argument. To stop detection, callback
     *     functions can return a truthy value.
     * @param {AtPixelOptions=} opt_options Configuration options.
     * @return {T|undefined} Callback result, i.e. the return value of last
     * callback execution, or the first truthy callback return value.
     * @template S,T
     * @api
     */
    PluggableMap.prototype.forEachLayerAtPixel = function forEachLayerAtPixel (pixel, callback, opt_options) {
      if (!this.frameState_) {
        return;
      }
      var options = opt_options || /** @type {AtPixelOptions} */ ({});
      var hitTolerance = options.hitTolerance !== undefined ?
        opt_options.hitTolerance * this.frameState_.pixelRatio : 0;
      var layerFilter = options.layerFilter || TRUE;
      return this.renderer_.forEachLayerAtPixel(
        pixel, this.frameState_, hitTolerance, callback, null, layerFilter, null);
    };

    /**
     * Detect if features intersect a pixel on the viewport. Layers included in the
     * detection can be configured through `opt_layerFilter`.
     * @param {import("./pixel.js").Pixel} pixel Pixel.
     * @param {AtPixelOptions=} opt_options Optional options.
     * @return {boolean} Is there a feature at the given pixel?
     * @template U
     * @api
     */
    PluggableMap.prototype.hasFeatureAtPixel = function hasFeatureAtPixel (pixel, opt_options) {
      if (!this.frameState_) {
        return false;
      }
      var coordinate = this.getCoordinateFromPixel(pixel);
      opt_options = opt_options !== undefined ? opt_options :
        /** @type {AtPixelOptions} */ ({});
      var layerFilter = opt_options.layerFilter !== undefined ? opt_options.layerFilter : TRUE;
      var hitTolerance = opt_options.hitTolerance !== undefined ?
        opt_options.hitTolerance * this.frameState_.pixelRatio : 0;
      return this.renderer_.hasFeatureAtCoordinate(
        coordinate, this.frameState_, hitTolerance, layerFilter, null);
    };

    /**
     * Returns the coordinate in view projection for a browser event.
     * @param {Event} event Event.
     * @return {import("./coordinate.js").Coordinate} Coordinate.
     * @api
     */
    PluggableMap.prototype.getEventCoordinate = function getEventCoordinate (event) {
      return this.getCoordinateFromPixel(this.getEventPixel(event));
    };

    /**
     * Returns the map pixel position for a browser event relative to the viewport.
     * @param {Event|TouchEvent} event Event.
     * @return {import("./pixel.js").Pixel} Pixel.
     * @api
     */
    PluggableMap.prototype.getEventPixel = function getEventPixel (event) {
      var viewportPosition = this.viewport_.getBoundingClientRect();
      var eventPosition = 'changedTouches' in event ?
        /** @type {TouchEvent} */ (event).changedTouches[0] :
        /** @type {MouseEvent} */ (event);

      return [
        eventPosition.clientX - viewportPosition.left,
        eventPosition.clientY - viewportPosition.top
      ];
    };

    /**
     * Get the target in which this map is rendered.
     * Note that this returns what is entered as an option or in setTarget:
     * if that was an element, it returns an element; if a string, it returns that.
     * @return {HTMLElement|string|undefined} The Element or id of the Element that the
     *     map is rendered in.
     * @observable
     * @api
     */
    PluggableMap.prototype.getTarget = function getTarget () {
      return /** @type {HTMLElement|string|undefined} */ (this.get(MapProperty.TARGET));
    };

    /**
     * Get the DOM element into which this map is rendered. In contrast to
     * `getTarget` this method always return an `Element`, or `null` if the
     * map has no target.
     * @return {HTMLElement} The element that the map is rendered in.
     * @api
     */
    PluggableMap.prototype.getTargetElement = function getTargetElement () {
      var target = this.getTarget();
      if (target !== undefined) {
        return typeof target === 'string' ? document.getElementById(target) : target;
      } else {
        return null;
      }
    };

    /**
     * Get the coordinate for a given pixel.  This returns a coordinate in the
     * map view projection.
     * @param {import("./pixel.js").Pixel} pixel Pixel position in the map viewport.
     * @return {import("./coordinate.js").Coordinate} The coordinate for the pixel position.
     * @api
     */
    PluggableMap.prototype.getCoordinateFromPixel = function getCoordinateFromPixel (pixel) {
      var frameState = this.frameState_;
      if (!frameState) {
        return null;
      } else {
        return apply(frameState.pixelToCoordinateTransform, pixel.slice());
      }
    };

    /**
     * Get the map controls. Modifying this collection changes the controls
     * associated with the map.
     * @return {Collection<import("./control/Control.js").default>} Controls.
     * @api
     */
    PluggableMap.prototype.getControls = function getControls () {
      return this.controls;
    };

    /**
     * Get the map overlays. Modifying this collection changes the overlays
     * associated with the map.
     * @return {Collection<import("./Overlay.js").default>} Overlays.
     * @api
     */
    PluggableMap.prototype.getOverlays = function getOverlays () {
      return this.overlays_;
    };

    /**
     * Get an overlay by its identifier (the value returned by overlay.getId()).
     * Note that the index treats string and numeric identifiers as the same. So
     * `map.getOverlayById(2)` will return an overlay with id `'2'` or `2`.
     * @param {string|number} id Overlay identifier.
     * @return {import("./Overlay.js").default} Overlay.
     * @api
     */
    PluggableMap.prototype.getOverlayById = function getOverlayById (id) {
      var overlay = this.overlayIdIndex_[id.toString()];
      return overlay !== undefined ? overlay : null;
    };

    /**
     * Get the map interactions. Modifying this collection changes the interactions
     * associated with the map.
     *
     * Interactions are used for e.g. pan, zoom and rotate.
     * @return {Collection<import("./interaction/Interaction.js").default>} Interactions.
     * @api
     */
    PluggableMap.prototype.getInteractions = function getInteractions () {
      return this.interactions;
    };

    /**
     * Get the layergroup associated with this map.
     * @return {LayerGroup} A layer group containing the layers in this map.
     * @observable
     * @api
     */
    PluggableMap.prototype.getLayerGroup = function getLayerGroup () {
      return (
        /** @type {LayerGroup} */ (this.get(MapProperty.LAYERGROUP))
      );
    };

    /**
     * Get the collection of layers associated with this map.
     * @return {!Collection<import("./layer/Base.js").default>} Layers.
     * @api
     */
    PluggableMap.prototype.getLayers = function getLayers () {
      var layers = this.getLayerGroup().getLayers();
      return layers;
    };

    /**
     * Get the pixel for a coordinate.  This takes a coordinate in the map view
     * projection and returns the corresponding pixel.
     * @param {import("./coordinate.js").Coordinate} coordinate A map coordinate.
     * @return {import("./pixel.js").Pixel} A pixel position in the map viewport.
     * @api
     */
    PluggableMap.prototype.getPixelFromCoordinate = function getPixelFromCoordinate (coordinate) {
      var frameState = this.frameState_;
      if (!frameState) {
        return null;
      } else {
        return apply(frameState.coordinateToPixelTransform, coordinate.slice(0, 2));
      }
    };

    /**
     * Get the map renderer.
     * @return {import("./renderer/Map.js").default} Renderer
     */
    PluggableMap.prototype.getRenderer = function getRenderer () {
      return this.renderer_;
    };

    /**
     * Get the size of this map.
     * @return {import("./size.js").Size|undefined} The size in pixels of the map in the DOM.
     * @observable
     * @api
     */
    PluggableMap.prototype.getSize = function getSize () {
      return (
        /** @type {import("./size.js").Size|undefined} */ (this.get(MapProperty.SIZE))
      );
    };

    /**
     * Get the view associated with this map. A view manages properties such as
     * center and resolution.
     * @return {View} The view that controls this map.
     * @observable
     * @api
     */
    PluggableMap.prototype.getView = function getView () {
      return (
        /** @type {View} */ (this.get(MapProperty.VIEW))
      );
    };

    /**
     * Get the element that serves as the map viewport.
     * @return {HTMLElement} Viewport.
     * @api
     */
    PluggableMap.prototype.getViewport = function getViewport () {
      return this.viewport_;
    };

    /**
     * Get the element that serves as the container for overlays.  Elements added to
     * this container will let mousedown and touchstart events through to the map,
     * so clicks and gestures on an overlay will trigger {@link module:ol/MapBrowserEvent~MapBrowserEvent}
     * events.
     * @return {!HTMLElement} The map's overlay container.
     */
    PluggableMap.prototype.getOverlayContainer = function getOverlayContainer () {
      return this.overlayContainer_;
    };

    /**
     * Get the element that serves as a container for overlays that don't allow
     * event propagation. Elements added to this container won't let mousedown and
     * touchstart events through to the map, so clicks and gestures on an overlay
     * don't trigger any {@link module:ol/MapBrowserEvent~MapBrowserEvent}.
     * @return {!HTMLElement} The map's overlay container that stops events.
     */
    PluggableMap.prototype.getOverlayContainerStopEvent = function getOverlayContainerStopEvent () {
      return this.overlayContainerStopEvent_;
    };

    /**
     * @param {import("./Tile.js").default} tile Tile.
     * @param {string} tileSourceKey Tile source key.
     * @param {import("./coordinate.js").Coordinate} tileCenter Tile center.
     * @param {number} tileResolution Tile resolution.
     * @return {number} Tile priority.
     */
    PluggableMap.prototype.getTilePriority = function getTilePriority (tile, tileSourceKey, tileCenter, tileResolution) {
      // Filter out tiles at higher zoom levels than the current zoom level, or that
      // are outside the visible extent.
      var frameState = this.frameState_;
      if (!frameState || !(tileSourceKey in frameState.wantedTiles)) {
        return DROP;
      }
      if (!frameState.wantedTiles[tileSourceKey][tile.getKey()]) {
        return DROP;
      }
      // Prioritize the highest zoom level tiles closest to the focus.
      // Tiles at higher zoom levels are prioritized using Math.log(tileResolution).
      // Within a zoom level, tiles are prioritized by the distance in pixels
      // between the center of the tile and the focus.  The factor of 65536 means
      // that the prioritization should behave as desired for tiles up to
      // 65536 * Math.log(2) = 45426 pixels from the focus.
      var deltaX = tileCenter[0] - frameState.focus[0];
      var deltaY = tileCenter[1] - frameState.focus[1];
      return 65536 * Math.log(tileResolution) +
          Math.sqrt(deltaX * deltaX + deltaY * deltaY) / tileResolution;
    };

    /**
     * @param {Event} browserEvent Browser event.
     * @param {string=} opt_type Type.
     */
    PluggableMap.prototype.handleBrowserEvent = function handleBrowserEvent (browserEvent, opt_type) {
      var type = opt_type || browserEvent.type;
      var mapBrowserEvent = new MapBrowserEvent(type, this, browserEvent);
      this.handleMapBrowserEvent(mapBrowserEvent);
    };

    /**
     * @param {MapBrowserEvent} mapBrowserEvent The event to handle.
     */
    PluggableMap.prototype.handleMapBrowserEvent = function handleMapBrowserEvent (mapBrowserEvent) {
      if (!this.frameState_) {
        // With no view defined, we cannot translate pixels into geographical
        // coordinates so interactions cannot be used.
        return;
      }
      this.focus_ = mapBrowserEvent.coordinate;
      mapBrowserEvent.frameState = this.frameState_;
      var interactionsArray = this.getInteractions().getArray();
      if (this.dispatchEvent(mapBrowserEvent) !== false) {
        for (var i = interactionsArray.length - 1; i >= 0; i--) {
          var interaction = interactionsArray[i];
          if (!interaction.getActive()) {
            continue;
          }
          var cont = interaction.handleEvent(mapBrowserEvent);
          if (!cont) {
            break;
          }
        }
      }
    };

    /**
     * @protected
     */
    PluggableMap.prototype.handlePostRender = function handlePostRender () {

      var frameState = this.frameState_;

      // Manage the tile queue
      // Image loads are expensive and a limited resource, so try to use them
      // efficiently:
      // * When the view is static we allow a large number of parallel tile loads
      //   to complete the frame as quickly as possible.
      // * When animating or interacting, image loads can cause janks, so we reduce
      //   the maximum number of loads per frame and limit the number of parallel
      //   tile loads to remain reactive to view changes and to reduce the chance of
      //   loading tiles that will quickly disappear from view.
      var tileQueue = this.tileQueue_;
      if (!tileQueue.isEmpty()) {
        var maxTotalLoading = this.maxTilesLoading_;
        var maxNewLoads = maxTotalLoading;
        if (frameState) {
          var hints = frameState.viewHints;
          if (hints[ViewHint.ANIMATING]) {
            maxTotalLoading = this.loadTilesWhileAnimating_ ? 8 : 0;
            maxNewLoads = 2;
          }
          if (hints[ViewHint.INTERACTING]) {
            maxTotalLoading = this.loadTilesWhileInteracting_ ? 8 : 0;
            maxNewLoads = 2;
          }
        }
        if (tileQueue.getTilesLoading() < maxTotalLoading) {
          tileQueue.reprioritize(); // FIXME only call if view has changed
          tileQueue.loadMoreTiles(maxTotalLoading, maxNewLoads);
        }
      }
      if (frameState && this.hasListener(RenderEventType.RENDERCOMPLETE) && !frameState.animate &&
          !this.tileQueue_.getTilesLoading() && !getLoading(this.getLayers().getArray())) {
        this.renderer_.dispatchRenderEvent(RenderEventType.RENDERCOMPLETE, frameState);
      }

      var postRenderFunctions = this.postRenderFunctions_;
      for (var i = 0, ii = postRenderFunctions.length; i < ii; ++i) {
        postRenderFunctions[i](this, frameState);
      }
      postRenderFunctions.length = 0;
    };

    /**
     * @private
     */
    PluggableMap.prototype.handleSizeChanged_ = function handleSizeChanged_ () {
      this.render();
    };

    /**
     * @private
     */
    PluggableMap.prototype.handleTargetChanged_ = function handleTargetChanged_ () {
      // target may be undefined, null, a string or an Element.
      // If it's a string we convert it to an Element before proceeding.
      // If it's not now an Element we remove the viewport from the DOM.
      // If it's an Element we append the viewport element to it.

      var targetElement;
      if (this.getTarget()) {
        targetElement = this.getTargetElement();
      }

      if (this.keyHandlerKeys_) {
        for (var i = 0, ii = this.keyHandlerKeys_.length; i < ii; ++i) {
          unlistenByKey(this.keyHandlerKeys_[i]);
        }
        this.keyHandlerKeys_ = null;
      }

      if (!targetElement) {
        this.renderer_.removeLayerRenderers();
        removeNode(this.viewport_);
        if (this.handleResize_ !== undefined) {
          removeEventListener(EventType.RESIZE, this.handleResize_, false);
          this.handleResize_ = undefined;
        }
      } else {
        targetElement.appendChild(this.viewport_);

        var keyboardEventTarget = !this.keyboardEventTarget_ ?
          targetElement : this.keyboardEventTarget_;
        this.keyHandlerKeys_ = [
          listen(keyboardEventTarget, EventType.KEYDOWN, this.handleBrowserEvent, this),
          listen(keyboardEventTarget, EventType.KEYPRESS, this.handleBrowserEvent, this)
        ];

        if (!this.handleResize_) {
          this.handleResize_ = this.updateSize.bind(this);
          addEventListener(EventType.RESIZE, this.handleResize_, false);
        }
      }

      this.updateSize();
      // updateSize calls setSize, so no need to call this.render
      // ourselves here.
    };

    /**
     * @private
     */
    PluggableMap.prototype.handleTileChange_ = function handleTileChange_ () {
      this.render();
    };

    /**
     * @private
     */
    PluggableMap.prototype.handleViewPropertyChanged_ = function handleViewPropertyChanged_ () {
      this.render();
    };

    /**
     * @private
     */
    PluggableMap.prototype.handleViewChanged_ = function handleViewChanged_ () {
      if (this.viewPropertyListenerKey_) {
        unlistenByKey(this.viewPropertyListenerKey_);
        this.viewPropertyListenerKey_ = null;
      }
      if (this.viewChangeListenerKey_) {
        unlistenByKey(this.viewChangeListenerKey_);
        this.viewChangeListenerKey_ = null;
      }
      var view = this.getView();
      if (view) {
        this.viewport_.setAttribute('data-view', getUid(view));
        this.viewPropertyListenerKey_ = listen(
          view, ObjectEventType.PROPERTYCHANGE,
          this.handleViewPropertyChanged_, this);
        this.viewChangeListenerKey_ = listen(
          view, EventType.CHANGE,
          this.handleViewPropertyChanged_, this);
      }
      this.render();
    };

    /**
     * @private
     */
    PluggableMap.prototype.handleLayerGroupChanged_ = function handleLayerGroupChanged_ () {
      if (this.layerGroupPropertyListenerKeys_) {
        this.layerGroupPropertyListenerKeys_.forEach(unlistenByKey);
        this.layerGroupPropertyListenerKeys_ = null;
      }
      var layerGroup = this.getLayerGroup();
      if (layerGroup) {
        this.layerGroupPropertyListenerKeys_ = [
          listen(
            layerGroup, ObjectEventType.PROPERTYCHANGE,
            this.render, this),
          listen(
            layerGroup, EventType.CHANGE,
            this.render, this)
        ];
      }
      this.render();
    };

    /**
     * @return {boolean} Is rendered.
     */
    PluggableMap.prototype.isRendered = function isRendered () {
      return !!this.frameState_;
    };

    /**
     * Requests an immediate render in a synchronous manner.
     * @api
     */
    PluggableMap.prototype.renderSync = function renderSync () {
      if (this.animationDelayKey_) {
        cancelAnimationFrame(this.animationDelayKey_);
      }
      this.animationDelay_();
    };

    /**
     * Request a map rendering (at the next animation frame).
     * @api
     */
    PluggableMap.prototype.render = function render () {
      if (this.animationDelayKey_ === undefined) {
        this.animationDelayKey_ = requestAnimationFrame(this.animationDelay_);
      }
    };

    /**
     * Remove the given control from the map.
     * @param {import("./control/Control.js").default} control Control.
     * @return {import("./control/Control.js").default|undefined} The removed control (or undefined
     *     if the control was not found).
     * @api
     */
    PluggableMap.prototype.removeControl = function removeControl (control) {
      return this.getControls().remove(control);
    };

    /**
     * Remove the given interaction from the map.
     * @param {import("./interaction/Interaction.js").default} interaction Interaction to remove.
     * @return {import("./interaction/Interaction.js").default|undefined} The removed interaction (or
     *     undefined if the interaction was not found).
     * @api
     */
    PluggableMap.prototype.removeInteraction = function removeInteraction (interaction) {
      return this.getInteractions().remove(interaction);
    };

    /**
     * Removes the given layer from the map.
     * @param {import("./layer/Base.js").default} layer Layer.
     * @return {import("./layer/Base.js").default|undefined} The removed layer (or undefined if the
     *     layer was not found).
     * @api
     */
    PluggableMap.prototype.removeLayer = function removeLayer (layer) {
      var layers = this.getLayerGroup().getLayers();
      return layers.remove(layer);
    };

    /**
     * Remove the given overlay from the map.
     * @param {import("./Overlay.js").default} overlay Overlay.
     * @return {import("./Overlay.js").default|undefined} The removed overlay (or undefined
     *     if the overlay was not found).
     * @api
     */
    PluggableMap.prototype.removeOverlay = function removeOverlay (overlay) {
      return this.getOverlays().remove(overlay);
    };

    /**
     * @param {number} time Time.
     * @private
     */
    PluggableMap.prototype.renderFrame_ = function renderFrame_ (time) {
      var viewState;

      var size = this.getSize();
      var view = this.getView();
      var extent = createEmpty();
      var previousFrameState = this.frameState_;
      /** @type {?FrameState} */
      var frameState = null;
      if (size !== undefined && hasArea(size) && view && view.isDef()) {
        var viewHints = view.getHints(this.frameState_ ? this.frameState_.viewHints : undefined);
        var layerStatesArray = this.getLayerGroup().getLayerStatesArray();
        var layerStates = {};
        for (var i = 0, ii = layerStatesArray.length; i < ii; ++i) {
          layerStates[getUid(layerStatesArray[i].layer)] = layerStatesArray[i];
        }
        viewState = view.getState(this.pixelRatio_);
        frameState = /** @type {FrameState} */ ({
          animate: false,
          coordinateToPixelTransform: this.coordinateToPixelTransform_,
          extent: extent,
          focus: this.focus_ ? this.focus_ : viewState.center,
          index: this.frameIndex_++,
          layerStates: layerStates,
          layerStatesArray: layerStatesArray,
          pixelRatio: this.pixelRatio_,
          pixelToCoordinateTransform: this.pixelToCoordinateTransform_,
          postRenderFunctions: [],
          size: size,
          skippedFeatureUids: this.skippedFeatureUids_,
          tileQueue: this.tileQueue_,
          time: time,
          usedTiles: {},
          viewState: viewState,
          viewHints: viewHints,
          wantedTiles: {}
        });
      }

      if (frameState) {
        frameState.extent = getForViewAndSize(viewState.center,
          viewState.resolution, viewState.rotation, frameState.size, extent);
      }

      this.frameState_ = frameState;
      this.renderer_.renderFrame(frameState);

      if (frameState) {
        if (frameState.animate) {
          this.render();
        }
        Array.prototype.push.apply(this.postRenderFunctions_, frameState.postRenderFunctions);

        if (previousFrameState) {
          var moveStart = !this.previousExtent_ ||
                      (!isEmpty$1(this.previousExtent_) &&
                      !equals$2(frameState.extent, this.previousExtent_));
          if (moveStart) {
            this.dispatchEvent(
              new MapEvent(MapEventType.MOVESTART, this, previousFrameState));
            this.previousExtent_ = createOrUpdateEmpty(this.previousExtent_);
          }
        }

        var idle = this.previousExtent_ &&
            !frameState.viewHints[ViewHint.ANIMATING] &&
            !frameState.viewHints[ViewHint.INTERACTING] &&
            !equals$2(frameState.extent, this.previousExtent_);

        if (idle) {
          this.dispatchEvent(new MapEvent(MapEventType.MOVEEND, this, frameState));
          clone(frameState.extent, this.previousExtent_);
        }
      }

      this.dispatchEvent(new MapEvent(MapEventType.POSTRENDER, this, frameState));

      setTimeout(this.handlePostRender.bind(this), 0);

    };

    /**
     * Sets the layergroup of this map.
     * @param {LayerGroup} layerGroup A layer group containing the layers in this map.
     * @observable
     * @api
     */
    PluggableMap.prototype.setLayerGroup = function setLayerGroup (layerGroup) {
      this.set(MapProperty.LAYERGROUP, layerGroup);
    };

    /**
     * Set the size of this map.
     * @param {import("./size.js").Size|undefined} size The size in pixels of the map in the DOM.
     * @observable
     * @api
     */
    PluggableMap.prototype.setSize = function setSize (size) {
      this.set(MapProperty.SIZE, size);
    };

    /**
     * Set the target element to render this map into.
     * @param {HTMLElement|string|undefined} target The Element or id of the Element
     *     that the map is rendered in.
     * @observable
     * @api
     */
    PluggableMap.prototype.setTarget = function setTarget (target) {
      this.set(MapProperty.TARGET, target);
    };

    /**
     * Set the view for this map.
     * @param {View} view The view that controls this map.
     * @observable
     * @api
     */
    PluggableMap.prototype.setView = function setView (view) {
      this.set(MapProperty.VIEW, view);
    };

    /**
     * @param {import("./Feature.js").default} feature Feature.
     */
    PluggableMap.prototype.skipFeature = function skipFeature (feature) {
      this.skippedFeatureUids_[getUid(feature)] = true;
      this.render();
    };

    /**
     * Force a recalculation of the map viewport size.  This should be called when
     * third-party code changes the size of the map viewport.
     * @api
     */
    PluggableMap.prototype.updateSize = function updateSize () {
      var targetElement = this.getTargetElement();

      if (!targetElement) {
        this.setSize(undefined);
      } else {
        var computedStyle = getComputedStyle(targetElement);
        this.setSize([
          targetElement.offsetWidth -
              parseFloat(computedStyle['borderLeftWidth']) -
              parseFloat(computedStyle['paddingLeft']) -
              parseFloat(computedStyle['paddingRight']) -
              parseFloat(computedStyle['borderRightWidth']),
          targetElement.offsetHeight -
              parseFloat(computedStyle['borderTopWidth']) -
              parseFloat(computedStyle['paddingTop']) -
              parseFloat(computedStyle['paddingBottom']) -
              parseFloat(computedStyle['borderBottomWidth'])
        ]);
      }
    };

    /**
     * @param {import("./Feature.js").default} feature Feature.
     */
    PluggableMap.prototype.unskipFeature = function unskipFeature (feature) {
      delete this.skippedFeatureUids_[getUid(feature)];
      this.render();
    };

    return PluggableMap;
  }(BaseObject));


  /**
   * @param {MapOptions} options Map options.
   * @return {MapOptionsInternal} Internal map options.
   */
  function createOptionsInternal(options) {

    /**
     * @type {HTMLElement|Document}
     */
    var keyboardEventTarget = null;
    if (options.keyboardEventTarget !== undefined) {
      keyboardEventTarget = typeof options.keyboardEventTarget === 'string' ?
        document.getElementById(options.keyboardEventTarget) :
        options.keyboardEventTarget;
    }

    /**
     * @type {Object<string, *>}
     */
    var values = {};

    var layerGroup = options.layers && typeof /** @type {?} */ (options.layers).getLayers === 'function' ?
      /** @type {LayerGroup} */ (options.layers) : new LayerGroup({layers: /** @type {Collection} */ (options.layers)});
    values[MapProperty.LAYERGROUP] = layerGroup;

    values[MapProperty.TARGET] = options.target;

    values[MapProperty.VIEW] = options.view !== undefined ?
      options.view : new View();

    var controls;
    if (options.controls !== undefined) {
      if (Array.isArray(options.controls)) {
        controls = new Collection(options.controls.slice());
      } else {
        assert(typeof /** @type {?} */ (options.controls).getArray === 'function',
          47); // Expected `controls` to be an array or an `import("./Collection.js").Collection`
        controls = /** @type {Collection} */ (options.controls);
      }
    }

    var interactions;
    if (options.interactions !== undefined) {
      if (Array.isArray(options.interactions)) {
        interactions = new Collection(options.interactions.slice());
      } else {
        assert(typeof /** @type {?} */ (options.interactions).getArray === 'function',
          48); // Expected `interactions` to be an array or an `import("./Collection.js").Collection`
        interactions = /** @type {Collection} */ (options.interactions);
      }
    }

    var overlays;
    if (options.overlays !== undefined) {
      if (Array.isArray(options.overlays)) {
        overlays = new Collection(options.overlays.slice());
      } else {
        assert(typeof /** @type {?} */ (options.overlays).getArray === 'function',
          49); // Expected `overlays` to be an array or an `import("./Collection.js").Collection`
        overlays = options.overlays;
      }
    } else {
      overlays = new Collection();
    }

    return {
      controls: controls,
      interactions: interactions,
      keyboardEventTarget: keyboardEventTarget,
      overlays: overlays,
      values: values
    };

  }

  /**
   * @param  {Array<import("./layer/Base.js").default>} layers Layers.
   * @return {boolean} Layers have sources that are still loading.
   */
  function getLoading(layers) {
    for (var i = 0, ii = layers.length; i < ii; ++i) {
      var layer = layers[i];
      if (typeof /** @type {?} */ (layer).getLayers === 'function') {
        return getLoading(/** @type {LayerGroup} */ (layer).getLayers().getArray());
      } else {
        var source = /** @type {import("./layer/Layer.js").default} */ (
          layer).getSource();
        if (source && source.loading) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * @module ol/control/Control
   */


  /**
   * @typedef {Object} Options
   * @property {HTMLElement} [element] The element is the control's
   * container element. This only needs to be specified if you're developing
   * a custom control.
   * @property {function(import("../MapEvent.js").default)} [render] Function called when
   * the control should be re-rendered. This is called in a `requestAnimationFrame`
   * callback.
   * @property {HTMLElement|string} [target] Specify a target if you want
   * the control to be rendered outside of the map's viewport.
   */


  /**
   * @classdesc
   * A control is a visible widget with a DOM element in a fixed position on the
   * screen. They can involve user input (buttons), or be informational only;
   * the position is determined using CSS. By default these are placed in the
   * container with CSS class name `ol-overlaycontainer-stopevent`, but can use
   * any outside DOM element.
   *
   * This is the base class for controls. You can use it for simple custom
   * controls by creating the element with listeners, creating an instance:
   * ```js
   * var myControl = new Control({element: myElement});
   * ```
   * and then adding this to the map.
   *
   * The main advantage of having this as a control rather than a simple separate
   * DOM element is that preventing propagation is handled for you. Controls
   * will also be objects in a {@link module:ol/Collection~Collection}, so you can use their methods.
   *
   * You can also extend this base for your own control class. See
   * examples/custom-controls for an example of how to do this.
   *
   * @api
   */
  var Control = /*@__PURE__*/(function (BaseObject) {
    function Control(options) {

      BaseObject.call(this);

      /**
       * @protected
       * @type {HTMLElement}
       */
      this.element = options.element ? options.element : null;

      /**
       * @private
       * @type {HTMLElement}
       */
      this.target_ = null;

      /**
       * @private
       * @type {import("../PluggableMap.js").default}
       */
      this.map_ = null;

      /**
       * @protected
       * @type {!Array<import("../events.js").EventsKey>}
       */
      this.listenerKeys = [];

      /**
       * @type {function(import("../MapEvent.js").default)}
       */
      this.render = options.render ? options.render : VOID;

      if (options.target) {
        this.setTarget(options.target);
      }

    }

    if ( BaseObject ) Control.__proto__ = BaseObject;
    Control.prototype = Object.create( BaseObject && BaseObject.prototype );
    Control.prototype.constructor = Control;

    /**
     * @inheritDoc
     */
    Control.prototype.disposeInternal = function disposeInternal () {
      removeNode(this.element);
      BaseObject.prototype.disposeInternal.call(this);
    };

    /**
     * Get the map associated with this control.
     * @return {import("../PluggableMap.js").default} Map.
     * @api
     */
    Control.prototype.getMap = function getMap () {
      return this.map_;
    };

    /**
     * Remove the control from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {import("../PluggableMap.js").default} map Map.
     * @api
     */
    Control.prototype.setMap = function setMap (map) {
      if (this.map_) {
        removeNode(this.element);
      }
      for (var i = 0, ii = this.listenerKeys.length; i < ii; ++i) {
        unlistenByKey(this.listenerKeys[i]);
      }
      this.listenerKeys.length = 0;
      this.map_ = map;
      if (this.map_) {
        var target = this.target_ ?
          this.target_ : map.getOverlayContainerStopEvent();
        target.appendChild(this.element);
        if (this.render !== VOID) {
          this.listenerKeys.push(listen(map,
            MapEventType.POSTRENDER, this.render, this));
        }
        map.render();
      }
    };

    /**
     * This function is used to set a target element for the control. It has no
     * effect if it is called after the control has been added to the map (i.e.
     * after `setMap` is called on the control). If no `target` is set in the
     * options passed to the control constructor and if `setTarget` is not called
     * then the control is added to the map's overlay container.
     * @param {HTMLElement|string} target Target.
     * @api
     */
    Control.prototype.setTarget = function setTarget (target) {
      this.target_ = typeof target === 'string' ?
        document.getElementById(target) :
        target;
    };

    return Control;
  }(BaseObject));

  /**
   * @module ol/css
   */


  /**
   * The CSS class for hidden feature.
   *
   * @const
   * @type {string}
   */
  var CLASS_HIDDEN = 'ol-hidden';


  /**
   * The CSS class that we'll give the DOM elements to have them unselectable.
   *
   * @const
   * @type {string}
   */
  var CLASS_UNSELECTABLE = 'ol-unselectable';


  /**
   * The CSS class for controls.
   *
   * @const
   * @type {string}
   */
  var CLASS_CONTROL = 'ol-control';


  /**
   * The CSS class that we'll give the DOM elements that are collapsed, i.e.
   * to those elements which usually can be expanded.
   *
   * @const
   * @type {string}
   */
  var CLASS_COLLAPSED = 'ol-collapsed';


  /**
   * Get the list of font families from a font spec.  Note that this doesn't work
   * for font families that have commas in them.
   * @param {string} The CSS font property.
   * @return {Object<string>} The font families (or null if the input spec is invalid).
   */
  var getFontFamilies = (function() {
    var style;
    var cache = {};
    return function(font) {
      if (!style) {
        style = document.createElement('div').style;
      }
      if (!(font in cache)) {
        style.font = font;
        var family = style.fontFamily;
        style.font = '';
        if (!family) {
          return null;
        }
        cache[font] = family.split(/,\s?/);
      }
      return cache[font];
    };
  })();

  /**
   * @module ol/layer/Layer
   */


  /**
   * @typedef {Object} Options
   * @property {number} [opacity=1] Opacity (0, 1).
   * @property {boolean} [visible=true] Visibility.
   * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
   * rendered outside of this extent.
   * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
   * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
   * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
   * method was used.
   * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
   * visible.
   * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
   * be visible.
   * @property {import("../source/Source.js").default} [source] Source for this layer.  If not provided to the constructor,
   * the source can be set by calling {@link module:ol/layer/Layer#setSource layer.setSource(source)} after
   * construction.
   * @property {import("../PluggableMap.js").default} [map] Map.
   */


  /**
   * @typedef {Object} State
   * @property {import("./Base.js").default} layer
   * @property {number} opacity
   * @property {SourceState} sourceState
   * @property {boolean} visible
   * @property {boolean} managed
   * @property {import("../extent.js").Extent} [extent]
   * @property {number} zIndex
   * @property {number} maxResolution
   * @property {number} minResolution
   */

  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * A visual representation of raster or vector map data.
   * Layers group together those properties that pertain to how the data is to be
   * displayed, irrespective of the source of that data.
   *
   * Layers are usually added to a map with {@link module:ol/Map#addLayer}. Components
   * like {@link module:ol/interaction/Select~Select} use unmanaged layers
   * internally. These unmanaged layers are associated with the map using
   * {@link module:ol/layer/Layer~Layer#setMap} instead.
   *
   * A generic `change` event is fired when the state of the source changes.
   *
   * @fires import("../render/Event.js").RenderEvent
   */
  var Layer = /*@__PURE__*/(function (BaseLayer) {
    function Layer(options) {

      var baseOptions = assign({}, options);
      delete baseOptions.source;

      BaseLayer.call(this, baseOptions);

      /**
       * @private
       * @type {?import("../events.js").EventsKey}
       */
      this.mapPrecomposeKey_ = null;

      /**
       * @private
       * @type {?import("../events.js").EventsKey}
       */
      this.mapRenderKey_ = null;

      /**
       * @private
       * @type {?import("../events.js").EventsKey}
       */
      this.sourceChangeKey_ = null;

      if (options.map) {
        this.setMap(options.map);
      }

      listen(this,
        getChangeEventType(LayerProperty.SOURCE),
        this.handleSourcePropertyChange_, this);

      var source = options.source ? options.source : null;
      this.setSource(source);
    }

    if ( BaseLayer ) Layer.__proto__ = BaseLayer;
    Layer.prototype = Object.create( BaseLayer && BaseLayer.prototype );
    Layer.prototype.constructor = Layer;

    /**
     * @inheritDoc
     */
    Layer.prototype.getLayersArray = function getLayersArray (opt_array) {
      var array = opt_array ? opt_array : [];
      array.push(this);
      return array;
    };

    /**
     * @inheritDoc
     */
    Layer.prototype.getLayerStatesArray = function getLayerStatesArray (opt_states) {
      var states = opt_states ? opt_states : [];
      states.push(this.getLayerState());
      return states;
    };

    /**
     * Get the layer source.
     * @return {import("../source/Source.js").default} The layer source (or `null` if not yet set).
     * @observable
     * @api
     */
    Layer.prototype.getSource = function getSource () {
      var source = this.get(LayerProperty.SOURCE);
      return (
        /** @type {import("../source/Source.js").default} */ (source) || null
      );
    };

    /**
      * @inheritDoc
      */
    Layer.prototype.getSourceState = function getSourceState () {
      var source = this.getSource();
      return !source ? SourceState.UNDEFINED : source.getState();
    };

    /**
     * @private
     */
    Layer.prototype.handleSourceChange_ = function handleSourceChange_ () {
      this.changed();
    };

    /**
     * @private
     */
    Layer.prototype.handleSourcePropertyChange_ = function handleSourcePropertyChange_ () {
      if (this.sourceChangeKey_) {
        unlistenByKey(this.sourceChangeKey_);
        this.sourceChangeKey_ = null;
      }
      var source = this.getSource();
      if (source) {
        this.sourceChangeKey_ = listen(source,
          EventType.CHANGE, this.handleSourceChange_, this);
      }
      this.changed();
    };

    /**
     * Sets the layer to be rendered on top of other layers on a map. The map will
     * not manage this layer in its layers collection, and the callback in
     * {@link module:ol/Map#forEachLayerAtPixel} will receive `null` as layer. This
     * is useful for temporary layers. To remove an unmanaged layer from the map,
     * use `#setMap(null)`.
     *
     * To add the layer to a map and have it managed by the map, use
     * {@link module:ol/Map#addLayer} instead.
     * @param {import("../PluggableMap.js").default} map Map.
     * @api
     */
    Layer.prototype.setMap = function setMap (map) {
      if (this.mapPrecomposeKey_) {
        unlistenByKey(this.mapPrecomposeKey_);
        this.mapPrecomposeKey_ = null;
      }
      if (!map) {
        this.changed();
      }
      if (this.mapRenderKey_) {
        unlistenByKey(this.mapRenderKey_);
        this.mapRenderKey_ = null;
      }
      if (map) {
        this.mapPrecomposeKey_ = listen(map, RenderEventType.PRECOMPOSE, function(evt) {
          var renderEvent = /** @type {import("../render/Event.js").default} */ (evt);
          var layerState = this.getLayerState();
          layerState.managed = false;
          if (this.getZIndex() === undefined) {
            layerState.zIndex = Infinity;
          }
          renderEvent.frameState.layerStatesArray.push(layerState);
          renderEvent.frameState.layerStates[getUid(this)] = layerState;
        }, this);
        this.mapRenderKey_ = listen(this, EventType.CHANGE, map.render, map);
        this.changed();
      }
    };

    /**
     * Set the layer source.
     * @param {import("../source/Source.js").default} source The layer source.
     * @observable
     * @api
     */
    Layer.prototype.setSource = function setSource (source) {
      this.set(LayerProperty.SOURCE, source);
    };

    return Layer;
  }(BaseLayer));


  /**
   * Return `true` if the layer is visible, and if the passed resolution is
   * between the layer's minResolution and maxResolution. The comparison is
   * inclusive for `minResolution` and exclusive for `maxResolution`.
   * @param {State} layerState Layer state.
   * @param {number} resolution Resolution.
   * @return {boolean} The layer is visible at the given resolution.
   */
  function visibleAtResolution(layerState, resolution) {
    return layerState.visible && resolution >= layerState.minResolution &&
        resolution < layerState.maxResolution;
  }

  /**
   * @module ol/control/Attribution
   */


  /**
   * @typedef {Object} Options
   * @property {string} [className='ol-attribution'] CSS class name.
   * @property {HTMLElement|string} [target] Specify a target if you
   * want the control to be rendered outside of the map's
   * viewport.
   * @property {boolean} [collapsible] Specify if attributions can
   * be collapsed. If not specified, sources control this behavior with their
   * `attributionsCollapsible` setting.
   * @property {boolean} [collapsed=true] Specify if attributions should
   * be collapsed at startup.
   * @property {string} [tipLabel='Attributions'] Text label to use for the button tip.
   * @property {string} [label='i'] Text label to use for the
   * collapsed attributions button.
   * Instead of text, also an element (e.g. a `span` element) can be used.
   * @property {string|HTMLElement} [collapseLabel='»'] Text label to use
   * for the expanded attributions button.
   * Instead of text, also an element (e.g. a `span` element) can be used.
   * @property {function(import("../MapEvent.js").default)} [render] Function called when
   * the control should be re-rendered. This is called in a `requestAnimationFrame`
   * callback.
   */


  /**
   * @classdesc
   * Control to show all the attributions associated with the layer sources
   * in the map. This control is one of the default controls included in maps.
   * By default it will show in the bottom right portion of the map, but this can
   * be changed by using a css selector for `.ol-attribution`.
   *
   * @api
   */
  var Attribution = /*@__PURE__*/(function (Control) {
    function Attribution(opt_options) {

      var options = opt_options ? opt_options : {};

      Control.call(this, {
        element: document.createElement('div'),
        render: options.render || render,
        target: options.target
      });

      /**
       * @private
       * @type {HTMLElement}
       */
      this.ulElement_ = document.createElement('ul');

      /**
       * @private
       * @type {boolean}
       */
      this.collapsed_ = options.collapsed !== undefined ? options.collapsed : true;

      /**
       * @private
       * @type {boolean}
       */
      this.overrideCollapsible_ = options.collapsible !== undefined;

      /**
       * @private
       * @type {boolean}
       */
      this.collapsible_ = options.collapsible !== undefined ?
        options.collapsible : true;

      if (!this.collapsible_) {
        this.collapsed_ = false;
      }

      var className = options.className !== undefined ? options.className : 'ol-attribution';

      var tipLabel = options.tipLabel !== undefined ? options.tipLabel : 'Attributions';

      var collapseLabel = options.collapseLabel !== undefined ? options.collapseLabel : '\u00BB';

      if (typeof collapseLabel === 'string') {
        /**
         * @private
         * @type {HTMLElement}
         */
        this.collapseLabel_ = document.createElement('span');
        this.collapseLabel_.textContent = collapseLabel;
      } else {
        this.collapseLabel_ = collapseLabel;
      }

      var label = options.label !== undefined ? options.label : 'i';

      if (typeof label === 'string') {
        /**
         * @private
         * @type {HTMLElement}
         */
        this.label_ = document.createElement('span');
        this.label_.textContent = label;
      } else {
        this.label_ = label;
      }


      var activeLabel = (this.collapsible_ && !this.collapsed_) ?
        this.collapseLabel_ : this.label_;
      var button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.title = tipLabel;
      button.appendChild(activeLabel);

      listen(button, EventType.CLICK, this.handleClick_, this);

      var cssClasses = className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL +
          (this.collapsed_ && this.collapsible_ ? ' ' + CLASS_COLLAPSED : '') +
          (this.collapsible_ ? '' : ' ol-uncollapsible');
      var element = this.element;
      element.className = cssClasses;
      element.appendChild(this.ulElement_);
      element.appendChild(button);

      /**
       * A list of currently rendered resolutions.
       * @type {Array<string>}
       * @private
       */
      this.renderedAttributions_ = [];

      /**
       * @private
       * @type {boolean}
       */
      this.renderedVisible_ = true;

    }

    if ( Control ) Attribution.__proto__ = Control;
    Attribution.prototype = Object.create( Control && Control.prototype );
    Attribution.prototype.constructor = Attribution;

    /**
     * Collect a list of visible attributions and set the collapsible state.
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @return {Array<string>} Attributions.
     * @private
     */
    Attribution.prototype.collectSourceAttributions_ = function collectSourceAttributions_ (frameState) {
      /**
       * Used to determine if an attribution already exists.
       * @type {!Object<string, boolean>}
       */
      var lookup = {};

      /**
       * A list of visible attributions.
       * @type {Array<string>}
       */
      var visibleAttributions = [];

      var layerStatesArray = frameState.layerStatesArray;
      var resolution = frameState.viewState.resolution;
      for (var i = 0, ii = layerStatesArray.length; i < ii; ++i) {
        var layerState = layerStatesArray[i];
        if (!visibleAtResolution(layerState, resolution)) {
          continue;
        }

        var source = /** @type {import("../layer/Layer.js").default} */ (layerState.layer).getSource();
        if (!source) {
          continue;
        }

        var attributionGetter = source.getAttributions();
        if (!attributionGetter) {
          continue;
        }

        var attributions = attributionGetter(frameState);
        if (!attributions) {
          continue;
        }

        if (!this.overrideCollapsible_ && source.getAttributionsCollapsible() === false) {
          this.setCollapsible(false);
        }

        if (Array.isArray(attributions)) {
          for (var j = 0, jj = attributions.length; j < jj; ++j) {
            if (!(attributions[j] in lookup)) {
              visibleAttributions.push(attributions[j]);
              lookup[attributions[j]] = true;
            }
          }
        } else {
          if (!(attributions in lookup)) {
            visibleAttributions.push(attributions);
            lookup[attributions] = true;
          }
        }
      }
      return visibleAttributions;
    };

    /**
     * @private
     * @param {?import("../PluggableMap.js").FrameState} frameState Frame state.
     */
    Attribution.prototype.updateElement_ = function updateElement_ (frameState) {
      if (!frameState) {
        if (this.renderedVisible_) {
          this.element.style.display = 'none';
          this.renderedVisible_ = false;
        }
        return;
      }

      var attributions = this.collectSourceAttributions_(frameState);

      var visible = attributions.length > 0;
      if (this.renderedVisible_ != visible) {
        this.element.style.display = visible ? '' : 'none';
        this.renderedVisible_ = visible;
      }

      if (equals(attributions, this.renderedAttributions_)) {
        return;
      }

      removeChildren(this.ulElement_);

      // append the attributions
      for (var i = 0, ii = attributions.length; i < ii; ++i) {
        var element = document.createElement('li');
        element.innerHTML = attributions[i];
        this.ulElement_.appendChild(element);
      }

      this.renderedAttributions_ = attributions;
    };

    /**
     * @param {MouseEvent} event The event to handle
     * @private
     */
    Attribution.prototype.handleClick_ = function handleClick_ (event) {
      event.preventDefault();
      this.handleToggle_();
    };

    /**
     * @private
     */
    Attribution.prototype.handleToggle_ = function handleToggle_ () {
      this.element.classList.toggle(CLASS_COLLAPSED);
      if (this.collapsed_) {
        replaceNode(this.collapseLabel_, this.label_);
      } else {
        replaceNode(this.label_, this.collapseLabel_);
      }
      this.collapsed_ = !this.collapsed_;
    };

    /**
     * Return `true` if the attribution is collapsible, `false` otherwise.
     * @return {boolean} True if the widget is collapsible.
     * @api
     */
    Attribution.prototype.getCollapsible = function getCollapsible () {
      return this.collapsible_;
    };

    /**
     * Set whether the attribution should be collapsible.
     * @param {boolean} collapsible True if the widget is collapsible.
     * @api
     */
    Attribution.prototype.setCollapsible = function setCollapsible (collapsible) {
      if (this.collapsible_ === collapsible) {
        return;
      }
      this.collapsible_ = collapsible;
      this.element.classList.toggle('ol-uncollapsible');
      if (!collapsible && this.collapsed_) {
        this.handleToggle_();
      }
    };

    /**
     * Collapse or expand the attribution according to the passed parameter. Will
     * not do anything if the attribution isn't collapsible or if the current
     * collapsed state is already the one requested.
     * @param {boolean} collapsed True if the widget is collapsed.
     * @api
     */
    Attribution.prototype.setCollapsed = function setCollapsed (collapsed) {
      if (!this.collapsible_ || this.collapsed_ === collapsed) {
        return;
      }
      this.handleToggle_();
    };

    /**
     * Return `true` when the attribution is currently collapsed or `false`
     * otherwise.
     * @return {boolean} True if the widget is collapsed.
     * @api
     */
    Attribution.prototype.getCollapsed = function getCollapsed () {
      return this.collapsed_;
    };

    return Attribution;
  }(Control));


  /**
   * Update the attribution element.
   * @param {import("../MapEvent.js").default} mapEvent Map event.
   * @this {Attribution}
   * @api
   */
  function render(mapEvent) {
    this.updateElement_(mapEvent.frameState);
  }

  /**
   * @module ol/control/Rotate
   */


  /**
   * @typedef {Object} Options
   * @property {string} [className='ol-rotate'] CSS class name.
   * @property {string|HTMLElement} [label='⇧'] Text label to use for the rotate button.
   * Instead of text, also an element (e.g. a `span` element) can be used.
   * @property {string} [tipLabel='Reset rotation'] Text label to use for the rotate tip.
   * @property {number} [duration=250] Animation duration in milliseconds.
   * @property {boolean} [autoHide=true] Hide the control when rotation is 0.
   * @property {function(import("../MapEvent.js").default)} [render] Function called when the control should
   * be re-rendered. This is called in a `requestAnimationFrame` callback.
   * @property {function()} [resetNorth] Function called when the control is clicked.
   * This will override the default `resetNorth`.
   * @property {HTMLElement|string} [target] Specify a target if you want the control to be
   * rendered outside of the map's viewport.
   */


  /**
   * @classdesc
   * A button control to reset rotation to 0.
   * To style this control use css selector `.ol-rotate`. A `.ol-hidden` css
   * selector is added to the button when the rotation is 0.
   *
   * @api
   */
  var Rotate = /*@__PURE__*/(function (Control) {
    function Rotate(opt_options) {

      var options = opt_options ? opt_options : {};

      Control.call(this, {
        element: document.createElement('div'),
        render: options.render || render$1,
        target: options.target
      });

      var className = options.className !== undefined ? options.className : 'ol-rotate';

      var label = options.label !== undefined ? options.label : '\u21E7';

      /**
       * @type {HTMLElement}
       * @private
       */
      this.label_ = null;

      if (typeof label === 'string') {
        this.label_ = document.createElement('span');
        this.label_.className = 'ol-compass';
        this.label_.textContent = label;
      } else {
        this.label_ = label;
        this.label_.classList.add('ol-compass');
      }

      var tipLabel = options.tipLabel ? options.tipLabel : 'Reset rotation';

      var button = document.createElement('button');
      button.className = className + '-reset';
      button.setAttribute('type', 'button');
      button.title = tipLabel;
      button.appendChild(this.label_);

      listen(button, EventType.CLICK, this.handleClick_, this);

      var cssClasses = className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
      var element = this.element;
      element.className = cssClasses;
      element.appendChild(button);

      this.callResetNorth_ = options.resetNorth ? options.resetNorth : undefined;

      /**
       * @type {number}
       * @private
       */
      this.duration_ = options.duration !== undefined ? options.duration : 250;

      /**
       * @type {boolean}
       * @private
       */
      this.autoHide_ = options.autoHide !== undefined ? options.autoHide : true;

      /**
       * @private
       * @type {number|undefined}
       */
      this.rotation_ = undefined;

      if (this.autoHide_) {
        this.element.classList.add(CLASS_HIDDEN);
      }

    }

    if ( Control ) Rotate.__proto__ = Control;
    Rotate.prototype = Object.create( Control && Control.prototype );
    Rotate.prototype.constructor = Rotate;

    /**
     * @param {MouseEvent} event The event to handle
     * @private
     */
    Rotate.prototype.handleClick_ = function handleClick_ (event) {
      event.preventDefault();
      if (this.callResetNorth_ !== undefined) {
        this.callResetNorth_();
      } else {
        this.resetNorth_();
      }
    };

    /**
     * @private
     */
    Rotate.prototype.resetNorth_ = function resetNorth_ () {
      var map = this.getMap();
      var view = map.getView();
      if (!view) {
        // the map does not have a view, so we can't act
        // upon it
        return;
      }
      if (view.getRotation() !== undefined) {
        if (this.duration_ > 0) {
          view.animate({
            rotation: 0,
            duration: this.duration_,
            easing: easeOut
          });
        } else {
          view.setRotation(0);
        }
      }
    };

    return Rotate;
  }(Control));


  /**
   * Update the rotate control element.
   * @param {import("../MapEvent.js").default} mapEvent Map event.
   * @this {Rotate}
   * @api
   */
  function render$1(mapEvent) {
    var frameState = mapEvent.frameState;
    if (!frameState) {
      return;
    }
    var rotation = frameState.viewState.rotation;
    if (rotation != this.rotation_) {
      var transform = 'rotate(' + rotation + 'rad)';
      if (this.autoHide_) {
        var contains = this.element.classList.contains(CLASS_HIDDEN);
        if (!contains && rotation === 0) {
          this.element.classList.add(CLASS_HIDDEN);
        } else if (contains && rotation !== 0) {
          this.element.classList.remove(CLASS_HIDDEN);
        }
      }
      this.label_.style.msTransform = transform;
      this.label_.style.webkitTransform = transform;
      this.label_.style.transform = transform;
    }
    this.rotation_ = rotation;
  }

  /**
   * @module ol/control/Zoom
   */


  /**
   * @typedef {Object} Options
   * @property {number} [duration=250] Animation duration in milliseconds.
   * @property {string} [className='ol-zoom'] CSS class name.
   * @property {string|HTMLElement} [zoomInLabel='+'] Text label to use for the zoom-in
   * button. Instead of text, also an element (e.g. a `span` element) can be used.
   * @property {string|HTMLElement} [zoomOutLabel='-'] Text label to use for the zoom-out button.
   * Instead of text, also an element (e.g. a `span` element) can be used.
   * @property {string} [zoomInTipLabel='Zoom in'] Text label to use for the button tip.
   * @property {string} [zoomOutTipLabel='Zoom out'] Text label to use for the button tip.
   * @property {number} [delta=1] The zoom delta applied on each click.
   * @property {HTMLElement|string} [target] Specify a target if you want the control to be
   * rendered outside of the map's viewport.
   */


  /**
   * @classdesc
   * A control with 2 buttons, one for zoom in and one for zoom out.
   * This control is one of the default controls of a map. To style this control
   * use css selectors `.ol-zoom-in` and `.ol-zoom-out`.
   *
   * @api
   */
  var Zoom = /*@__PURE__*/(function (Control) {
    function Zoom(opt_options) {

      var options = opt_options ? opt_options : {};

      Control.call(this, {
        element: document.createElement('div'),
        target: options.target
      });

      var className = options.className !== undefined ? options.className : 'ol-zoom';

      var delta = options.delta !== undefined ? options.delta : 1;

      var zoomInLabel = options.zoomInLabel !== undefined ? options.zoomInLabel : '+';
      var zoomOutLabel = options.zoomOutLabel !== undefined ? options.zoomOutLabel : '\u2212';

      var zoomInTipLabel = options.zoomInTipLabel !== undefined ?
        options.zoomInTipLabel : 'Zoom in';
      var zoomOutTipLabel = options.zoomOutTipLabel !== undefined ?
        options.zoomOutTipLabel : 'Zoom out';

      var inElement = document.createElement('button');
      inElement.className = className + '-in';
      inElement.setAttribute('type', 'button');
      inElement.title = zoomInTipLabel;
      inElement.appendChild(
        typeof zoomInLabel === 'string' ? document.createTextNode(zoomInLabel) : zoomInLabel
      );

      listen(inElement, EventType.CLICK, this.handleClick_.bind(this, delta));

      var outElement = document.createElement('button');
      outElement.className = className + '-out';
      outElement.setAttribute('type', 'button');
      outElement.title = zoomOutTipLabel;
      outElement.appendChild(
        typeof zoomOutLabel === 'string' ? document.createTextNode(zoomOutLabel) : zoomOutLabel
      );

      listen(outElement, EventType.CLICK, this.handleClick_.bind(this, -delta));

      var cssClasses = className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
      var element = this.element;
      element.className = cssClasses;
      element.appendChild(inElement);
      element.appendChild(outElement);

      /**
       * @type {number}
       * @private
       */
      this.duration_ = options.duration !== undefined ? options.duration : 250;

    }

    if ( Control ) Zoom.__proto__ = Control;
    Zoom.prototype = Object.create( Control && Control.prototype );
    Zoom.prototype.constructor = Zoom;

    /**
     * @param {number} delta Zoom delta.
     * @param {MouseEvent} event The event to handle
     * @private
     */
    Zoom.prototype.handleClick_ = function handleClick_ (delta, event) {
      event.preventDefault();
      this.zoomByDelta_(delta);
    };

    /**
     * @param {number} delta Zoom delta.
     * @private
     */
    Zoom.prototype.zoomByDelta_ = function zoomByDelta_ (delta) {
      var map = this.getMap();
      var view = map.getView();
      if (!view) {
        // the map does not have a view, so we can't act
        // upon it
        return;
      }
      var currentResolution = view.getResolution();
      if (currentResolution) {
        var newResolution = view.constrainResolution(currentResolution, delta);
        if (this.duration_ > 0) {
          if (view.getAnimating()) {
            view.cancelAnimations();
          }
          view.animate({
            resolution: newResolution,
            duration: this.duration_,
            easing: easeOut
          });
        } else {
          view.setResolution(newResolution);
        }
      }
    };

    return Zoom;
  }(Control));

  /**
   * @module ol/control/util
   */


  /**
   * @typedef {Object} DefaultsOptions
   * @property {boolean} [attribution=true] Include
   * {@link module:ol/control/Attribution~Attribution}.
   * @property {import("./Attribution.js").Options} [attributionOptions]
   * Options for {@link module:ol/control/Attribution~Attribution}.
   * @property {boolean} [rotate=true] Include
   * {@link module:ol/control/Rotate~Rotate}.
   * @property {import("./Rotate.js").Options} [rotateOptions] Options
   * for {@link module:ol/control/Rotate~Rotate}.
   * @property {boolean} [zoom] Include {@link module:ol/control/Zoom~Zoom}.
   * @property {import("./Zoom.js").Options} [zoomOptions] Options for
   * {@link module:ol/control/Zoom~Zoom}.
   * @api
   */


  /**
   * Set of controls included in maps by default. Unless configured otherwise,
   * this returns a collection containing an instance of each of the following
   * controls:
   * * {@link module:ol/control/Zoom~Zoom}
   * * {@link module:ol/control/Rotate~Rotate}
   * * {@link module:ol/control/Attribution~Attribution}
   *
   * @param {DefaultsOptions=} opt_options
   * Defaults options.
   * @return {Collection<import("./Control.js").default>}
   * Controls.
   * @function module:ol/control.defaults
   * @api
   */
  function defaults(opt_options) {

    var options = opt_options ? opt_options : {};

    var controls = new Collection();

    var zoomControl = options.zoom !== undefined ? options.zoom : true;
    if (zoomControl) {
      controls.push(new Zoom(options.zoomOptions));
    }

    var rotateControl = options.rotate !== undefined ? options.rotate : true;
    if (rotateControl) {
      controls.push(new Rotate(options.rotateOptions));
    }

    var attributionControl = options.attribution !== undefined ?
      options.attribution : true;
    if (attributionControl) {
      controls.push(new Attribution(options.attributionOptions));
    }

    return controls;
  }

  /**
   * @module ol/Kinetic
   */

  /**
   * @classdesc
   * Implementation of inertial deceleration for map movement.
   *
   * @api
   */
  var Kinetic = function Kinetic(decay, minVelocity, delay) {

    /**
     * @private
     * @type {number}
     */
    this.decay_ = decay;

    /**
     * @private
     * @type {number}
     */
    this.minVelocity_ = minVelocity;

    /**
     * @private
     * @type {number}
     */
    this.delay_ = delay;

    /**
     * @private
     * @type {Array<number>}
     */
    this.points_ = [];

    /**
     * @private
     * @type {number}
     */
    this.angle_ = 0;

    /**
     * @private
     * @type {number}
     */
    this.initialVelocity_ = 0;
  };

  /**
   * FIXME empty description for jsdoc
   */
  Kinetic.prototype.begin = function begin () {
    this.points_.length = 0;
    this.angle_ = 0;
    this.initialVelocity_ = 0;
  };

  /**
   * @param {number} x X.
   * @param {number} y Y.
   */
  Kinetic.prototype.update = function update (x, y) {
    this.points_.push(x, y, Date.now());
  };

  /**
   * @return {boolean} Whether we should do kinetic animation.
   */
  Kinetic.prototype.end = function end () {
    if (this.points_.length < 6) {
      // at least 2 points are required (i.e. there must be at least 6 elements
      // in the array)
      return false;
    }
    var delay = Date.now() - this.delay_;
    var lastIndex = this.points_.length - 3;
    if (this.points_[lastIndex + 2] < delay) {
      // the last tracked point is too old, which means that the user stopped
      // panning before releasing the map
      return false;
    }

    // get the first point which still falls into the delay time
    var firstIndex = lastIndex - 3;
    while (firstIndex > 0 && this.points_[firstIndex + 2] > delay) {
      firstIndex -= 3;
    }

    var duration = this.points_[lastIndex + 2] - this.points_[firstIndex + 2];
    // we don't want a duration of 0 (divide by zero)
    // we also make sure the user panned for a duration of at least one frame
    // (1/60s) to compute sane displacement values
    if (duration < 1000 / 60) {
      return false;
    }

    var dx = this.points_[lastIndex] - this.points_[firstIndex];
    var dy = this.points_[lastIndex + 1] - this.points_[firstIndex + 1];
    this.angle_ = Math.atan2(dy, dx);
    this.initialVelocity_ = Math.sqrt(dx * dx + dy * dy) / duration;
    return this.initialVelocity_ > this.minVelocity_;
  };

  /**
   * @return {number} Total distance travelled (pixels).
   */
  Kinetic.prototype.getDistance = function getDistance () {
    return (this.minVelocity_ - this.initialVelocity_) / this.decay_;
  };

  /**
   * @return {number} Angle of the kinetic panning animation (radians).
   */
  Kinetic.prototype.getAngle = function getAngle () {
    return this.angle_;
  };

  /**
   * @module ol/interaction/Property
   */

  /**
   * @enum {string}
   */
  var InteractionProperty = {
    ACTIVE: 'active'
  };

  /**
   * @module ol/interaction/Interaction
   */


  /**
   * Object literal with config options for interactions.
   * @typedef {Object} InteractionOptions
   * @property {function(import("../MapBrowserEvent.js").default):boolean} handleEvent
   * Method called by the map to notify the interaction that a browser event was
   * dispatched to the map. If the function returns a falsy value, propagation of
   * the event to other interactions in the map's interactions chain will be
   * prevented (this includes functions with no explicit return).
   */


  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * User actions that change the state of the map. Some are similar to controls,
   * but are not associated with a DOM element.
   * For example, {@link module:ol/interaction/KeyboardZoom~KeyboardZoom} is
   * functionally the same as {@link module:ol/control/Zoom~Zoom}, but triggered
   * by a keyboard event not a button element event.
   * Although interactions do not have a DOM element, some of them do render
   * vectors and so are visible on the screen.
   * @api
   */
  var Interaction = /*@__PURE__*/(function (BaseObject) {
    function Interaction(options) {
      BaseObject.call(this);

      if (options.handleEvent) {
        this.handleEvent = options.handleEvent;
      }

      /**
       * @private
       * @type {import("../PluggableMap.js").default}
       */
      this.map_ = null;

      this.setActive(true);
    }

    if ( BaseObject ) Interaction.__proto__ = BaseObject;
    Interaction.prototype = Object.create( BaseObject && BaseObject.prototype );
    Interaction.prototype.constructor = Interaction;

    /**
     * Return whether the interaction is currently active.
     * @return {boolean} `true` if the interaction is active, `false` otherwise.
     * @observable
     * @api
     */
    Interaction.prototype.getActive = function getActive () {
      return /** @type {boolean} */ (this.get(InteractionProperty.ACTIVE));
    };

    /**
     * Get the map associated with this interaction.
     * @return {import("../PluggableMap.js").default} Map.
     * @api
     */
    Interaction.prototype.getMap = function getMap () {
      return this.map_;
    };

    /**
     * Handles the {@link module:ol/MapBrowserEvent map browser event}.
     * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
     * @return {boolean} `false` to stop event propagation.
     * @api
     */
    Interaction.prototype.handleEvent = function handleEvent (mapBrowserEvent) {
      return true;
    };

    /**
     * Activate or deactivate the interaction.
     * @param {boolean} active Active.
     * @observable
     * @api
     */
    Interaction.prototype.setActive = function setActive (active) {
      this.set(InteractionProperty.ACTIVE, active);
    };

    /**
     * Remove the interaction from its current map and attach it to the new map.
     * Subclasses may set up event handlers to get notified about changes to
     * the map here.
     * @param {import("../PluggableMap.js").default} map Map.
     */
    Interaction.prototype.setMap = function setMap (map) {
      this.map_ = map;
    };

    return Interaction;
  }(BaseObject));


  /**
   * @param {import("../View.js").default} view View.
   * @param {import("../coordinate.js").Coordinate} delta Delta.
   * @param {number=} opt_duration Duration.
   */
  function pan(view, delta, opt_duration) {
    var currentCenter = view.getCenter();
    if (currentCenter) {
      var center = view.constrainCenter(
        [currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
      if (opt_duration) {
        view.animate({
          duration: opt_duration,
          easing: linear,
          center: center
        });
      } else {
        view.setCenter(center);
      }
    }
  }


  /**
   * @param {import("../View.js").default} view View.
   * @param {number|undefined} rotation Rotation.
   * @param {import("../coordinate.js").Coordinate=} opt_anchor Anchor coordinate.
   * @param {number=} opt_duration Duration.
   */
  function rotate$2(view, rotation, opt_anchor, opt_duration) {
    rotation = view.constrainRotation(rotation, 0);
    rotateWithoutConstraints(view, rotation, opt_anchor, opt_duration);
  }


  /**
   * @param {import("../View.js").default} view View.
   * @param {number|undefined} rotation Rotation.
   * @param {import("../coordinate.js").Coordinate=} opt_anchor Anchor coordinate.
   * @param {number=} opt_duration Duration.
   */
  function rotateWithoutConstraints(view, rotation, opt_anchor, opt_duration) {
    if (rotation !== undefined) {
      var currentRotation = view.getRotation();
      var currentCenter = view.getCenter();
      if (currentRotation !== undefined && currentCenter && opt_duration > 0) {
        view.animate({
          rotation: rotation,
          anchor: opt_anchor,
          duration: opt_duration,
          easing: easeOut
        });
      } else {
        view.rotate(rotation, opt_anchor);
      }
    }
  }


  /**
   * @param {import("../View.js").default} view View.
   * @param {number|undefined} resolution Resolution to go to.
   * @param {import("../coordinate.js").Coordinate=} opt_anchor Anchor coordinate.
   * @param {number=} opt_duration Duration.
   * @param {number=} opt_direction Zooming direction; > 0 indicates
   *     zooming out, in which case the constraints system will select
   *     the largest nearest resolution; < 0 indicates zooming in, in
   *     which case the constraints system will select the smallest
   *     nearest resolution; == 0 indicates that the zooming direction
   *     is unknown/not relevant, in which case the constraints system
   *     will select the nearest resolution. If not defined 0 is
   *     assumed.
   */
  function zoom(view, resolution, opt_anchor, opt_duration, opt_direction) {
    resolution = view.constrainResolution(resolution, 0, opt_direction);
    zoomWithoutConstraints(view, resolution, opt_anchor, opt_duration);
  }


  /**
   * @param {import("../View.js").default} view View.
   * @param {number} delta Delta from previous zoom level.
   * @param {import("../coordinate.js").Coordinate=} opt_anchor Anchor coordinate.
   * @param {number=} opt_duration Duration.
   */
  function zoomByDelta(view, delta, opt_anchor, opt_duration) {
    var currentResolution = view.getResolution();
    var resolution = view.constrainResolution(currentResolution, delta, 0);

    if (resolution !== undefined) {
      var resolutions = view.getResolutions();
      resolution = clamp(
        resolution,
        view.getMinResolution() || resolutions[resolutions.length - 1],
        view.getMaxResolution() || resolutions[0]);
    }

    // If we have a constraint on center, we need to change the anchor so that the
    // new center is within the extent. We first calculate the new center, apply
    // the constraint to it, and then calculate back the anchor
    if (opt_anchor && resolution !== undefined && resolution !== currentResolution) {
      var currentCenter = view.getCenter();
      var center = view.calculateCenterZoom(resolution, opt_anchor);
      center = view.constrainCenter(center);

      opt_anchor = [
        (resolution * currentCenter[0] - currentResolution * center[0]) /
            (resolution - currentResolution),
        (resolution * currentCenter[1] - currentResolution * center[1]) /
            (resolution - currentResolution)
      ];
    }

    zoomWithoutConstraints(view, resolution, opt_anchor, opt_duration);
  }


  /**
   * @param {import("../View.js").default} view View.
   * @param {number|undefined} resolution Resolution to go to.
   * @param {import("../coordinate.js").Coordinate=} opt_anchor Anchor coordinate.
   * @param {number=} opt_duration Duration.
   */
  function zoomWithoutConstraints(view, resolution, opt_anchor, opt_duration) {
    if (resolution) {
      var currentResolution = view.getResolution();
      var currentCenter = view.getCenter();
      if (currentResolution !== undefined && currentCenter &&
          resolution !== currentResolution && opt_duration) {
        view.animate({
          resolution: resolution,
          anchor: opt_anchor,
          duration: opt_duration,
          easing: easeOut
        });
      } else {
        if (opt_anchor) {
          var center = view.calculateCenterZoom(resolution, opt_anchor);
          view.setCenter(center);
        }
        view.setResolution(resolution);
      }
    }
  }

  /**
   * @module ol/interaction/DoubleClickZoom
   */


  /**
   * @typedef {Object} Options
   * @property {number} [duration=250] Animation duration in milliseconds.
   * @property {number} [delta=1] The zoom delta applied on each double click.
   */


  /**
   * @classdesc
   * Allows the user to zoom by double-clicking on the map.
   * @api
   */
  var DoubleClickZoom = /*@__PURE__*/(function (Interaction) {
    function DoubleClickZoom(opt_options) {
      Interaction.call(this, {
        handleEvent: handleEvent
      });

      var options = opt_options ? opt_options : {};

      /**
       * @private
       * @type {number}
       */
      this.delta_ = options.delta ? options.delta : 1;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 250;

    }

    if ( Interaction ) DoubleClickZoom.__proto__ = Interaction;
    DoubleClickZoom.prototype = Object.create( Interaction && Interaction.prototype );
    DoubleClickZoom.prototype.constructor = DoubleClickZoom;

    return DoubleClickZoom;
  }(Interaction));


  /**
   * Handles the {@link module:ol/MapBrowserEvent map browser event} (if it was a
   * doubleclick) and eventually zooms the map.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @this {DoubleClickZoom}
   */
  function handleEvent(mapBrowserEvent) {
    var stopEvent = false;
    if (mapBrowserEvent.type == MapBrowserEventType.DBLCLICK) {
      var browserEvent = /** @type {MouseEvent} */ (mapBrowserEvent.originalEvent);
      var map = mapBrowserEvent.map;
      var anchor = mapBrowserEvent.coordinate;
      var delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
      var view = map.getView();
      zoomByDelta(view, delta, anchor, this.duration_);
      mapBrowserEvent.preventDefault();
      stopEvent = true;
    }
    return !stopEvent;
  }

  /**
   * @module ol/events/condition
   */


  /**
   * Return `true` if only the alt-key and shift-key is pressed, `false` otherwise
   * (e.g. when additionally the platform-modifier-key is pressed).
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} True if only the alt and shift keys are pressed.
   * @api
   */
  var altShiftKeysOnly = function(mapBrowserEvent) {
    var originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (mapBrowserEvent.originalEvent);
    return (
      originalEvent.altKey &&
        !(originalEvent.metaKey || originalEvent.ctrlKey) &&
        originalEvent.shiftKey);
  };


  /**
   * Return `true` if the map has the focus. This condition requires a map target
   * element with a `tabindex` attribute, e.g. `<div id="map" tabindex="1">`.
   *
   * @param {import("../MapBrowserEvent.js").default} event Map browser event.
   * @return {boolean} The map has the focus.
   * @api
   */
  var focus = function(event) {
    return event.target.getTargetElement() === document.activeElement;
  };


  /**
   * Return always true.
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} True.
   * @api
   */
  var always = TRUE;


  /**
   * Return `true` if the event has an "action"-producing mouse button.
   *
   * By definition, this includes left-click on windows/linux, and left-click
   * without the ctrl key on Macs.
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} The result.
   */
  var mouseActionButton = function(mapBrowserEvent) {
    var originalEvent = /** @type {MouseEvent} */ (mapBrowserEvent.originalEvent);
    return originalEvent.button == 0 &&
        !(WEBKIT && MAC && originalEvent.ctrlKey);
  };


  /**
   * Return `true` if no modifier key (alt-, shift- or platform-modifier-key) is
   * pressed.
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} True only if there no modifier keys are pressed.
   * @api
   */
  var noModifierKeys = function(mapBrowserEvent) {
    var originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (mapBrowserEvent.originalEvent);
    return (
      !originalEvent.altKey &&
        !(originalEvent.metaKey || originalEvent.ctrlKey) &&
        !originalEvent.shiftKey);
  };


  /**
   * Return `true` if only the shift-key is pressed, `false` otherwise (e.g. when
   * additionally the alt-key is pressed).
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} True if only the shift key is pressed.
   * @api
   */
  var shiftKeyOnly = function(mapBrowserEvent) {
    var originalEvent = /** @type {KeyboardEvent|MouseEvent|TouchEvent} */ (mapBrowserEvent.originalEvent);
    return (
      !originalEvent.altKey &&
        !(originalEvent.metaKey || originalEvent.ctrlKey) &&
        originalEvent.shiftKey);
  };


  /**
   * Return `true` if the target element is not editable, i.e. not a `<input>`-,
   * `<select>`- or `<textarea>`-element, `false` otherwise.
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} True only if the target element is not editable.
   * @api
   */
  var targetNotEditable = function(mapBrowserEvent) {
    var target = mapBrowserEvent.originalEvent.target;
    var tagName = /** @type {Element} */ (target).tagName;
    return (
      tagName !== 'INPUT' &&
        tagName !== 'SELECT' &&
        tagName !== 'TEXTAREA');
  };


  /**
   * Return `true` if the event originates from a mouse device.
   *
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} True if the event originates from a mouse device.
   * @api
   */
  var mouseOnly = function(mapBrowserEvent) {
    var pointerEvent = /** @type {import("../MapBrowserPointerEvent").default} */ (mapBrowserEvent).pointerEvent;
    assert(pointerEvent !== undefined, 56); // mapBrowserEvent must originate from a pointer event
    // see http://www.w3.org/TR/pointerevents/#widl-PointerEvent-pointerType
    return pointerEvent.pointerType == 'mouse';
  };

  /**
   * @module ol/interaction/Pointer
   */


  /**
   * @typedef {Object} Options
   * @property {function(import("../MapBrowserPointerEvent.js").default):boolean} [handleDownEvent]
   * Function handling "down" events. If the function returns `true` then a drag
   * sequence is started.
   * @property {function(import("../MapBrowserPointerEvent.js").default)} [handleDragEvent]
   * Function handling "drag" events. This function is called on "move" events
   * during a drag sequence.
   * @property {function(import("../MapBrowserEvent.js").default):boolean} [handleEvent]
   * Method called by the map to notify the interaction that a browser event was
   * dispatched to the map. The function may return `false` to prevent the
   * propagation of the event to other interactions in the map's interactions
   * chain.
   * @property {function(import("../MapBrowserPointerEvent.js").default)} [handleMoveEvent]
   * Function handling "move" events. This function is called on "move" events,
   * also during a drag sequence (so during a drag sequence both the
   * `handleDragEvent` function and this function are called).
   * @property {function(import("../MapBrowserPointerEvent.js").default):boolean} [handleUpEvent]
   *  Function handling "up" events. If the function returns `false` then the
   * current drag sequence is stopped.
   * @property {function(boolean):boolean} [stopDown]
   * Should the down event be propagated to other interactions, or should be
   * stopped?
   */


  /**
   * @classdesc
   * Base class that calls user-defined functions on `down`, `move` and `up`
   * events. This class also manages "drag sequences".
   *
   * When the `handleDownEvent` user function returns `true` a drag sequence is
   * started. During a drag sequence the `handleDragEvent` user function is
   * called on `move` events. The drag sequence ends when the `handleUpEvent`
   * user function is called and returns `false`.
   * @api
   */
  var PointerInteraction = /*@__PURE__*/(function (Interaction) {
    function PointerInteraction(opt_options) {

      var options = opt_options ? opt_options : {};

      Interaction.call(/** @type {import("./Interaction.js").InteractionOptions} */ this, (options));

      if (options.handleDownEvent) {
        this.handleDownEvent = options.handleDownEvent;
      }

      if (options.handleDragEvent) {
        this.handleDragEvent = options.handleDragEvent;
      }

      if (options.handleMoveEvent) {
        this.handleMoveEvent = options.handleMoveEvent;
      }

      if (options.handleUpEvent) {
        this.handleUpEvent = options.handleUpEvent;
      }

      if (options.stopDown) {
        this.stopDown = options.stopDown;
      }

      /**
       * @type {boolean}
       * @protected
       */
      this.handlingDownUpSequence = false;

      /**
       * @type {!Object<string, import("../pointer/PointerEvent.js").default>}
       * @private
       */
      this.trackedPointers_ = {};

      /**
       * @type {Array<import("../pointer/PointerEvent.js").default>}
       * @protected
       */
      this.targetPointers = [];

    }

    if ( Interaction ) PointerInteraction.__proto__ = Interaction;
    PointerInteraction.prototype = Object.create( Interaction && Interaction.prototype );
    PointerInteraction.prototype.constructor = PointerInteraction;

    /**
     * Handle pointer down events.
     * @param {import("../MapBrowserPointerEvent.js").default} mapBrowserEvent Event.
     * @return {boolean} If the event was consumed.
     * @protected
     */
    PointerInteraction.prototype.handleDownEvent = function handleDownEvent (mapBrowserEvent) {
      return false;
    };

    /**
     * Handle pointer drag events.
     * @param {import("../MapBrowserPointerEvent.js").default} mapBrowserEvent Event.
     * @protected
     */
    PointerInteraction.prototype.handleDragEvent = function handleDragEvent (mapBrowserEvent) {};

    /**
     * Handles the {@link module:ol/MapBrowserEvent map browser event} and may call into
     * other functions, if event sequences like e.g. 'drag' or 'down-up' etc. are
     * detected.
     * @override
     * @api
     */
    PointerInteraction.prototype.handleEvent = function handleEvent (mapBrowserEvent) {
      if (!(/** @type {import("../MapBrowserPointerEvent.js").default} */ (mapBrowserEvent).pointerEvent)) {
        return true;
      }

      var stopEvent = false;
      this.updateTrackedPointers_(mapBrowserEvent);
      if (this.handlingDownUpSequence) {
        if (mapBrowserEvent.type == MapBrowserEventType.POINTERDRAG) {
          this.handleDragEvent(mapBrowserEvent);
        } else if (mapBrowserEvent.type == MapBrowserEventType.POINTERUP) {
          var handledUp = this.handleUpEvent(mapBrowserEvent);
          this.handlingDownUpSequence = handledUp && this.targetPointers.length > 0;
        }
      } else {
        if (mapBrowserEvent.type == MapBrowserEventType.POINTERDOWN) {
          var handled = this.handleDownEvent(mapBrowserEvent);
          if (handled) {
            mapBrowserEvent.preventDefault();
          }
          this.handlingDownUpSequence = handled;
          stopEvent = this.stopDown(handled);
        } else if (mapBrowserEvent.type == MapBrowserEventType.POINTERMOVE) {
          this.handleMoveEvent(mapBrowserEvent);
        }
      }
      return !stopEvent;
    };

    /**
     * Handle pointer move events.
     * @param {import("../MapBrowserPointerEvent.js").default} mapBrowserEvent Event.
     * @protected
     */
    PointerInteraction.prototype.handleMoveEvent = function handleMoveEvent (mapBrowserEvent) {};

    /**
     * Handle pointer up events.
     * @param {import("../MapBrowserPointerEvent.js").default} mapBrowserEvent Event.
     * @return {boolean} If the event was consumed.
     * @protected
     */
    PointerInteraction.prototype.handleUpEvent = function handleUpEvent (mapBrowserEvent) {
      return false;
    };

    /**
     * This function is used to determine if "down" events should be propagated
     * to other interactions or should be stopped.
     * @param {boolean} handled Was the event handled by the interaction?
     * @return {boolean} Should the `down` event be stopped?
     */
    PointerInteraction.prototype.stopDown = function stopDown (handled) {
      return handled;
    };

    /**
     * @param {import("../MapBrowserPointerEvent.js").default} mapBrowserEvent Event.
     * @private
     */
    PointerInteraction.prototype.updateTrackedPointers_ = function updateTrackedPointers_ (mapBrowserEvent) {
      if (isPointerDraggingEvent(mapBrowserEvent)) {
        var event = mapBrowserEvent.pointerEvent;

        var id = event.pointerId.toString();
        if (mapBrowserEvent.type == MapBrowserEventType.POINTERUP) {
          delete this.trackedPointers_[id];
        } else if (mapBrowserEvent.type ==
            MapBrowserEventType.POINTERDOWN) {
          this.trackedPointers_[id] = event;
        } else if (id in this.trackedPointers_) {
          // update only when there was a pointerdown event for this pointer
          this.trackedPointers_[id] = event;
        }
        this.targetPointers = getValues(this.trackedPointers_);
      }
    };

    return PointerInteraction;
  }(Interaction));


  /**
   * @param {Array<import("../pointer/PointerEvent.js").default>} pointerEvents List of events.
   * @return {import("../pixel.js").Pixel} Centroid pixel.
   */
  function centroid(pointerEvents) {
    var length = pointerEvents.length;
    var clientX = 0;
    var clientY = 0;
    for (var i = 0; i < length; i++) {
      clientX += pointerEvents[i].clientX;
      clientY += pointerEvents[i].clientY;
    }
    return [clientX / length, clientY / length];
  }


  /**
   * @param {import("../MapBrowserPointerEvent.js").default} mapBrowserEvent Event.
   * @return {boolean} Whether the event is a pointerdown, pointerdrag
   *     or pointerup event.
   */
  function isPointerDraggingEvent(mapBrowserEvent) {
    var type = mapBrowserEvent.type;
    return type === MapBrowserEventType.POINTERDOWN ||
      type === MapBrowserEventType.POINTERDRAG ||
      type === MapBrowserEventType.POINTERUP;
  }

  /**
   * @module ol/interaction/DragPan
   */


  /**
   * @typedef {Object} Options
   * @property {import("../events/condition.js").Condition} [condition] A function that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
   * to indicate whether that event should be handled.
   * Default is {@link module:ol/events/condition~noModifierKeys}.
   * @property {import("../Kinetic.js").default} [kinetic] Kinetic inertia to apply to the pan.
   */


  /**
   * @classdesc
   * Allows the user to pan the map by dragging the map.
   * @api
   */
  var DragPan = /*@__PURE__*/(function (PointerInteraction) {
    function DragPan(opt_options) {

      PointerInteraction.call(this, {
        stopDown: FALSE
      });

      var options = opt_options ? opt_options : {};

      /**
       * @private
       * @type {import("../Kinetic.js").default|undefined}
       */
      this.kinetic_ = options.kinetic;

      /**
       * @type {import("../pixel.js").Pixel}
       */
      this.lastCentroid = null;

      /**
       * @type {number}
       */
      this.lastPointersCount_;

      /**
       * @type {boolean}
       */
      this.panning_ = false;

      /**
       * @private
       * @type {import("../events/condition.js").Condition}
       */
      this.condition_ = options.condition ? options.condition : noModifierKeys;

      /**
       * @private
       * @type {boolean}
       */
      this.noKinetic_ = false;

    }

    if ( PointerInteraction ) DragPan.__proto__ = PointerInteraction;
    DragPan.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
    DragPan.prototype.constructor = DragPan;

    /**
     * @inheritDoc
     */
    DragPan.prototype.handleDragEvent = function handleDragEvent (mapBrowserEvent) {
      if (!this.panning_) {
        this.panning_ = true;
        this.getMap().getView().setHint(ViewHint.INTERACTING, 1);
      }
      var targetPointers = this.targetPointers;
      var centroid$1 = centroid(targetPointers);
      if (targetPointers.length == this.lastPointersCount_) {
        if (this.kinetic_) {
          this.kinetic_.update(centroid$1[0], centroid$1[1]);
        }
        if (this.lastCentroid) {
          var deltaX = this.lastCentroid[0] - centroid$1[0];
          var deltaY = centroid$1[1] - this.lastCentroid[1];
          var map = mapBrowserEvent.map;
          var view = map.getView();
          var center = [deltaX, deltaY];
          scale(center, view.getResolution());
          rotate(center, view.getRotation());
          add(center, view.getCenter());
          center = view.constrainCenter(center);
          view.setCenter(center);
        }
      } else if (this.kinetic_) {
        // reset so we don't overestimate the kinetic energy after
        // after one finger down, tiny drag, second finger down
        this.kinetic_.begin();
      }
      this.lastCentroid = centroid$1;
      this.lastPointersCount_ = targetPointers.length;
    };

    /**
     * @inheritDoc
     */
    DragPan.prototype.handleUpEvent = function handleUpEvent (mapBrowserEvent) {
      var map = mapBrowserEvent.map;
      var view = map.getView();
      if (this.targetPointers.length === 0) {
        if (!this.noKinetic_ && this.kinetic_ && this.kinetic_.end()) {
          var distance = this.kinetic_.getDistance();
          var angle = this.kinetic_.getAngle();
          var center = /** @type {!import("../coordinate.js").Coordinate} */ (view.getCenter());
          var centerpx = map.getPixelFromCoordinate(center);
          var dest = map.getCoordinateFromPixel([
            centerpx[0] - distance * Math.cos(angle),
            centerpx[1] - distance * Math.sin(angle)
          ]);
          view.animate({
            center: view.constrainCenter(dest),
            duration: 500,
            easing: easeOut
          });
        }
        if (this.panning_) {
          this.panning_ = false;
          view.setHint(ViewHint.INTERACTING, -1);
        }
        return false;
      } else {
        if (this.kinetic_) {
          // reset so we don't overestimate the kinetic energy after
          // after one finger up, tiny drag, second finger up
          this.kinetic_.begin();
        }
        this.lastCentroid = null;
        return true;
      }
    };

    /**
     * @inheritDoc
     */
    DragPan.prototype.handleDownEvent = function handleDownEvent (mapBrowserEvent) {
      if (this.targetPointers.length > 0 && this.condition_(mapBrowserEvent)) {
        var map = mapBrowserEvent.map;
        var view = map.getView();
        this.lastCentroid = null;
        // stop any current animation
        if (view.getAnimating()) {
          view.setCenter(mapBrowserEvent.frameState.viewState.center);
        }
        if (this.kinetic_) {
          this.kinetic_.begin();
        }
        // No kinetic as soon as more than one pointer on the screen is
        // detected. This is to prevent nasty pans after pinch.
        this.noKinetic_ = this.targetPointers.length > 1;
        return true;
      } else {
        return false;
      }
    };

    return DragPan;
  }(PointerInteraction));

  /**
   * @module ol/interaction/DragRotate
   */


  /**
   * @typedef {Object} Options
   * @property {import("../events/condition.js").Condition} [condition] A function that takes an
   * {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
   * to indicate whether that event should be handled.
   * Default is {@link module:ol/events/condition~altShiftKeysOnly}.
   * @property {number} [duration=250] Animation duration in milliseconds.
   */


  /**
   * @classdesc
   * Allows the user to rotate the map by clicking and dragging on the map,
   * normally combined with an {@link module:ol/events/condition} that limits
   * it to when the alt and shift keys are held down.
   *
   * This interaction is only supported for mouse devices.
   * @api
   */
  var DragRotate = /*@__PURE__*/(function (PointerInteraction) {
    function DragRotate(opt_options) {

      var options = opt_options ? opt_options : {};

      PointerInteraction.call(this, {
        stopDown: FALSE
      });

      /**
       * @private
       * @type {import("../events/condition.js").Condition}
       */
      this.condition_ = options.condition ? options.condition : altShiftKeysOnly;

      /**
       * @private
       * @type {number|undefined}
       */
      this.lastAngle_ = undefined;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 250;

    }

    if ( PointerInteraction ) DragRotate.__proto__ = PointerInteraction;
    DragRotate.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
    DragRotate.prototype.constructor = DragRotate;

    /**
     * @inheritDoc
     */
    DragRotate.prototype.handleDragEvent = function handleDragEvent (mapBrowserEvent) {
      if (!mouseOnly(mapBrowserEvent)) {
        return;
      }

      var map = mapBrowserEvent.map;
      var view = map.getView();
      if (view.getConstraints().rotation === disable) {
        return;
      }
      var size = map.getSize();
      var offset = mapBrowserEvent.pixel;
      var theta =
          Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2);
      if (this.lastAngle_ !== undefined) {
        var delta = theta - this.lastAngle_;
        var rotation = view.getRotation();
        rotateWithoutConstraints(view, rotation - delta);
      }
      this.lastAngle_ = theta;
    };


    /**
     * @inheritDoc
     */
    DragRotate.prototype.handleUpEvent = function handleUpEvent (mapBrowserEvent) {
      if (!mouseOnly(mapBrowserEvent)) {
        return true;
      }

      var map = mapBrowserEvent.map;
      var view = map.getView();
      view.setHint(ViewHint.INTERACTING, -1);
      var rotation = view.getRotation();
      rotate$2(view, rotation, undefined, this.duration_);
      return false;
    };


    /**
     * @inheritDoc
     */
    DragRotate.prototype.handleDownEvent = function handleDownEvent (mapBrowserEvent) {
      if (!mouseOnly(mapBrowserEvent)) {
        return false;
      }

      if (mouseActionButton(mapBrowserEvent) && this.condition_(mapBrowserEvent)) {
        var map = mapBrowserEvent.map;
        map.getView().setHint(ViewHint.INTERACTING, 1);
        this.lastAngle_ = undefined;
        return true;
      } else {
        return false;
      }
    };

    return DragRotate;
  }(PointerInteraction));

  /**
   * @module ol/render/Box
   */

  var RenderBox = /*@__PURE__*/(function (Disposable) {
    function RenderBox(className) {
      Disposable.call(this);

      /**
       * @type {import("../geom/Polygon.js").default}
       * @private
       */
      this.geometry_ = null;

      /**
       * @type {HTMLDivElement}
       * @private
       */
      this.element_ = /** @type {HTMLDivElement} */ (document.createElement('div'));
      this.element_.style.position = 'absolute';
      this.element_.className = 'ol-box ' + className;

      /**
       * @private
       * @type {import("../PluggableMap.js").default}
       */
      this.map_ = null;

      /**
       * @private
       * @type {import("../pixel.js").Pixel}
       */
      this.startPixel_ = null;

      /**
       * @private
       * @type {import("../pixel.js").Pixel}
       */
      this.endPixel_ = null;

    }

    if ( Disposable ) RenderBox.__proto__ = Disposable;
    RenderBox.prototype = Object.create( Disposable && Disposable.prototype );
    RenderBox.prototype.constructor = RenderBox;

    /**
     * @inheritDoc
     */
    RenderBox.prototype.disposeInternal = function disposeInternal () {
      this.setMap(null);
    };

    /**
     * @private
     */
    RenderBox.prototype.render_ = function render_ () {
      var startPixel = this.startPixel_;
      var endPixel = this.endPixel_;
      var px = 'px';
      var style = this.element_.style;
      style.left = Math.min(startPixel[0], endPixel[0]) + px;
      style.top = Math.min(startPixel[1], endPixel[1]) + px;
      style.width = Math.abs(endPixel[0] - startPixel[0]) + px;
      style.height = Math.abs(endPixel[1] - startPixel[1]) + px;
    };

    /**
     * @param {import("../PluggableMap.js").default} map Map.
     */
    RenderBox.prototype.setMap = function setMap (map) {
      if (this.map_) {
        this.map_.getOverlayContainer().removeChild(this.element_);
        var style = this.element_.style;
        style.left = style.top = style.width = style.height = 'inherit';
      }
      this.map_ = map;
      if (this.map_) {
        this.map_.getOverlayContainer().appendChild(this.element_);
      }
    };

    /**
     * @param {import("../pixel.js").Pixel} startPixel Start pixel.
     * @param {import("../pixel.js").Pixel} endPixel End pixel.
     */
    RenderBox.prototype.setPixels = function setPixels (startPixel, endPixel) {
      this.startPixel_ = startPixel;
      this.endPixel_ = endPixel;
      this.createOrUpdateGeometry();
      this.render_();
    };

    /**
     * Creates or updates the cached geometry.
     */
    RenderBox.prototype.createOrUpdateGeometry = function createOrUpdateGeometry () {
      var startPixel = this.startPixel_;
      var endPixel = this.endPixel_;
      var pixels = [
        startPixel,
        [startPixel[0], endPixel[1]],
        endPixel,
        [endPixel[0], startPixel[1]]
      ];
      var coordinates = pixels.map(this.map_.getCoordinateFromPixel, this.map_);
      // close the polygon
      coordinates[4] = coordinates[0].slice();
      if (!this.geometry_) {
        this.geometry_ = new Polygon([coordinates]);
      } else {
        this.geometry_.setCoordinates([coordinates]);
      }
    };

    /**
     * @return {import("../geom/Polygon.js").default} Geometry.
     */
    RenderBox.prototype.getGeometry = function getGeometry () {
      return this.geometry_;
    };

    return RenderBox;
  }(Disposable));

  /**
   * @module ol/interaction/DragBox
   */


  /**
   * A function that takes a {@link module:ol/MapBrowserEvent} and two
   * {@link module:ol/pixel~Pixel}s and returns a `{boolean}`. If the condition is met,
   * true should be returned.
   * @typedef {function(this: ?, import("../MapBrowserEvent.js").default, import("../pixel.js").Pixel, import("../pixel.js").Pixel):boolean} EndCondition
   */


  /**
   * @typedef {Object} Options
   * @property {string} [className='ol-dragbox'] CSS class name for styling the box.
   * @property {import("../events/condition.js").Condition} [condition] A function that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a boolean
   * to indicate whether that event should be handled.
   * Default is {@link ol/events/condition~always}.
   * @property {number} [minArea=64] The minimum area of the box in pixel, this value is used by the default
   * `boxEndCondition` function.
   * @property {EndCondition} [boxEndCondition] A function that takes a {@link module:ol/MapBrowserEvent~MapBrowserEvent} and two
   * {@link module:ol/pixel~Pixel}s to indicate whether a `boxend` event should be fired.
   * Default is `true` if the area of the box is bigger than the `minArea` option.
   * @property {function(this:DragBox, import("../MapBrowserEvent.js").default)} onBoxEnd Code to execute just
   * before `boxend` is fired.
   */


  /**
   * @enum {string}
   */
  var DragBoxEventType = {
    /**
     * Triggered upon drag box start.
     * @event DragBoxEvent#boxstart
     * @api
     */
    BOXSTART: 'boxstart',

    /**
     * Triggered on drag when box is active.
     * @event DragBoxEvent#boxdrag
     * @api
     */
    BOXDRAG: 'boxdrag',

    /**
     * Triggered upon drag box end.
     * @event DragBoxEvent#boxend
     * @api
     */
    BOXEND: 'boxend'
  };


  /**
   * @classdesc
   * Events emitted by {@link module:ol/interaction/DragBox~DragBox} instances are instances of
   * this type.
   */
  var DragBoxEvent = /*@__PURE__*/(function (Event) {
    function DragBoxEvent(type, coordinate, mapBrowserEvent) {
      Event.call(this, type);

      /**
       * The coordinate of the drag event.
       * @const
       * @type {import("../coordinate.js").Coordinate}
       * @api
       */
      this.coordinate = coordinate;

      /**
       * @const
       * @type {import("../MapBrowserEvent.js").default}
       * @api
       */
      this.mapBrowserEvent = mapBrowserEvent;

    }

    if ( Event ) DragBoxEvent.__proto__ = Event;
    DragBoxEvent.prototype = Object.create( Event && Event.prototype );
    DragBoxEvent.prototype.constructor = DragBoxEvent;

    return DragBoxEvent;
  }(Event));


  /**
   * @classdesc
   * Allows the user to draw a vector box by clicking and dragging on the map,
   * normally combined with an {@link module:ol/events/condition} that limits
   * it to when the shift or other key is held down. This is used, for example,
   * for zooming to a specific area of the map
   * (see {@link module:ol/interaction/DragZoom~DragZoom} and
   * {@link module:ol/interaction/DragRotateAndZoom}).
   *
   * This interaction is only supported for mouse devices.
   *
   * @fires DragBoxEvent
   * @api
   */
  var DragBox = /*@__PURE__*/(function (PointerInteraction) {
    function DragBox(opt_options) {

      PointerInteraction.call(this);

      var options = opt_options ? opt_options : {};

      /**
      * @type {import("../render/Box.js").default}
      * @private
      */
      this.box_ = new RenderBox(options.className || 'ol-dragbox');

      /**
      * @type {number}
      * @private
      */
      this.minArea_ = options.minArea !== undefined ? options.minArea : 64;

      /**
       * Function to execute just before `onboxend` is fired
       * @type {function(this:DragBox, import("../MapBrowserEvent.js").default)}
       * @private
       */
      this.onBoxEnd_ = options.onBoxEnd ? options.onBoxEnd : VOID;

      /**
      * @type {import("../pixel.js").Pixel}
      * @private
      */
      this.startPixel_ = null;

      /**
      * @private
      * @type {import("../events/condition.js").Condition}
      */
      this.condition_ = options.condition ? options.condition : always;

      /**
      * @private
      * @type {EndCondition}
      */
      this.boxEndCondition_ = options.boxEndCondition ?
        options.boxEndCondition : this.defaultBoxEndCondition;
    }

    if ( PointerInteraction ) DragBox.__proto__ = PointerInteraction;
    DragBox.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
    DragBox.prototype.constructor = DragBox;

    /**
     * The default condition for determining whether the boxend event
     * should fire.
     * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent The originating MapBrowserEvent
     *     leading to the box end.
     * @param {import("../pixel.js").Pixel} startPixel The starting pixel of the box.
     * @param {import("../pixel.js").Pixel} endPixel The end pixel of the box.
     * @return {boolean} Whether or not the boxend condition should be fired.
     */
    DragBox.prototype.defaultBoxEndCondition = function defaultBoxEndCondition (mapBrowserEvent, startPixel, endPixel) {
      var width = endPixel[0] - startPixel[0];
      var height = endPixel[1] - startPixel[1];
      return width * width + height * height >= this.minArea_;
    };

    /**
    * Returns geometry of last drawn box.
    * @return {import("../geom/Polygon.js").default} Geometry.
    * @api
    */
    DragBox.prototype.getGeometry = function getGeometry () {
      return this.box_.getGeometry();
    };

    /**
     * @inheritDoc
     */
    DragBox.prototype.handleDragEvent = function handleDragEvent (mapBrowserEvent) {
      if (!mouseOnly(mapBrowserEvent)) {
        return;
      }

      this.box_.setPixels(this.startPixel_, mapBrowserEvent.pixel);

      this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXDRAG,
        mapBrowserEvent.coordinate, mapBrowserEvent));
    };

    /**
     * @inheritDoc
     */
    DragBox.prototype.handleUpEvent = function handleUpEvent (mapBrowserEvent) {
      if (!mouseOnly(mapBrowserEvent)) {
        return true;
      }

      this.box_.setMap(null);

      if (this.boxEndCondition_(mapBrowserEvent, this.startPixel_, mapBrowserEvent.pixel)) {
        this.onBoxEnd_(mapBrowserEvent);
        this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXEND,
          mapBrowserEvent.coordinate, mapBrowserEvent));
      }
      return false;
    };

    /**
     * @inheritDoc
     */
    DragBox.prototype.handleDownEvent = function handleDownEvent (mapBrowserEvent) {
      if (!mouseOnly(mapBrowserEvent)) {
        return false;
      }

      if (mouseActionButton(mapBrowserEvent) &&
          this.condition_(mapBrowserEvent)) {
        this.startPixel_ = mapBrowserEvent.pixel;
        this.box_.setMap(mapBrowserEvent.map);
        this.box_.setPixels(this.startPixel_, this.startPixel_);
        this.dispatchEvent(new DragBoxEvent(DragBoxEventType.BOXSTART,
          mapBrowserEvent.coordinate, mapBrowserEvent));
        return true;
      } else {
        return false;
      }
    };

    return DragBox;
  }(PointerInteraction));

  /**
   * @module ol/interaction/DragZoom
   */


  /**
   * @typedef {Object} Options
   * @property {string} [className='ol-dragzoom'] CSS class name for styling the
   * box.
   * @property {import("../events/condition.js").Condition} [condition] A function that
   * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
   * boolean to indicate whether that event should be handled.
   * Default is {@link module:ol/events/condition~shiftKeyOnly}.
   * @property {number} [duration=200] Animation duration in milliseconds.
   * @property {boolean} [out=false] Use interaction for zooming out.
   */


  /**
   * @classdesc
   * Allows the user to zoom the map by clicking and dragging on the map,
   * normally combined with an {@link module:ol/events/condition} that limits
   * it to when a key, shift by default, is held down.
   *
   * To change the style of the box, use CSS and the `.ol-dragzoom` selector, or
   * your custom one configured with `className`.
   * @api
   */
  var DragZoom = /*@__PURE__*/(function (DragBox) {
    function DragZoom(opt_options) {
      var options = opt_options ? opt_options : {};

      var condition = options.condition ? options.condition : shiftKeyOnly;

      DragBox.call(this, {
        condition: condition,
        className: options.className || 'ol-dragzoom',
        onBoxEnd: onBoxEnd
      });

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 200;

      /**
       * @private
       * @type {boolean}
       */
      this.out_ = options.out !== undefined ? options.out : false;
    }

    if ( DragBox ) DragZoom.__proto__ = DragBox;
    DragZoom.prototype = Object.create( DragBox && DragBox.prototype );
    DragZoom.prototype.constructor = DragZoom;

    return DragZoom;
  }(DragBox));


  /**
   * @this {DragZoom}
   */
  function onBoxEnd() {
    var map = this.getMap();
    var view = /** @type {!import("../View.js").default} */ (map.getView());
    var size = /** @type {!import("../size.js").Size} */ (map.getSize());
    var extent = this.getGeometry().getExtent();

    if (this.out_) {
      var mapExtent = view.calculateExtent(size);
      var boxPixelExtent = createOrUpdateFromCoordinates([
        map.getPixelFromCoordinate(getBottomLeft(extent)),
        map.getPixelFromCoordinate(getTopRight(extent))]);
      var factor = view.getResolutionForExtent(boxPixelExtent, size);

      scaleFromCenter(mapExtent, 1 / factor);
      extent = mapExtent;
    }

    var resolution = view.constrainResolution(
      view.getResolutionForExtent(extent, size));

    var center = getCenter(extent);
    center = view.constrainCenter(center);

    view.animate({
      resolution: resolution,
      center: center,
      duration: this.duration_,
      easing: easeOut
    });
  }

  /**
   * @module ol/events/KeyCode
   */

  /**
   * @enum {number}
   * @const
   */
  var KeyCode = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };

  /**
   * @module ol/interaction/KeyboardPan
   */


  /**
   * @typedef {Object} Options
   * @property {import("../events/condition.js").Condition} [condition] A function that
   * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
   * boolean to indicate whether that event should be handled. Default is
   * {@link module:ol/events/condition~noModifierKeys} and
   * {@link module:ol/events/condition~targetNotEditable}.
   * @property {number} [duration=100] Animation duration in milliseconds.
   * @property {number} [pixelDelta=128] The amount of pixels to pan on each key
   * press.
   */


  /**
   * @classdesc
   * Allows the user to pan the map using keyboard arrows.
   * Note that, although this interaction is by default included in maps,
   * the keys can only be used when browser focus is on the element to which
   * the keyboard events are attached. By default, this is the map div,
   * though you can change this with the `keyboardEventTarget` in
   * {@link module:ol/Map~Map}. `document` never loses focus but, for any other
   * element, focus will have to be on, and returned to, this element if the keys
   * are to function.
   * See also {@link module:ol/interaction/KeyboardZoom~KeyboardZoom}.
   * @api
   */
  var KeyboardPan = /*@__PURE__*/(function (Interaction) {
    function KeyboardPan(opt_options) {

      Interaction.call(this, {
        handleEvent: handleEvent$1
      });

      var options = opt_options || {};

      /**
       * @private
       * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Browser event.
       * @return {boolean} Combined condition result.
       */
      this.defaultCondition_ = function(mapBrowserEvent) {
        return noModifierKeys(mapBrowserEvent) &&
          targetNotEditable(mapBrowserEvent);
      };

      /**
       * @private
       * @type {import("../events/condition.js").Condition}
       */
      this.condition_ = options.condition !== undefined ?
        options.condition : this.defaultCondition_;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 100;

      /**
       * @private
       * @type {number}
       */
      this.pixelDelta_ = options.pixelDelta !== undefined ?
        options.pixelDelta : 128;

    }

    if ( Interaction ) KeyboardPan.__proto__ = Interaction;
    KeyboardPan.prototype = Object.create( Interaction && Interaction.prototype );
    KeyboardPan.prototype.constructor = KeyboardPan;

    return KeyboardPan;
  }(Interaction));


  /**
   * Handles the {@link module:ol/MapBrowserEvent map browser event} if it was a
   * `KeyEvent`, and decides the direction to pan to (if an arrow key was
   * pressed).
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @this {KeyboardPan}
   */
  function handleEvent$1(mapBrowserEvent) {
    var stopEvent = false;
    if (mapBrowserEvent.type == EventType.KEYDOWN) {
      var keyEvent = /** @type {KeyboardEvent} */ (mapBrowserEvent.originalEvent);
      var keyCode = keyEvent.keyCode;
      if (this.condition_(mapBrowserEvent) &&
          (keyCode == KeyCode.DOWN ||
          keyCode == KeyCode.LEFT ||
          keyCode == KeyCode.RIGHT ||
          keyCode == KeyCode.UP)) {
        var map = mapBrowserEvent.map;
        var view = map.getView();
        var mapUnitsDelta = view.getResolution() * this.pixelDelta_;
        var deltaX = 0, deltaY = 0;
        if (keyCode == KeyCode.DOWN) {
          deltaY = -mapUnitsDelta;
        } else if (keyCode == KeyCode.LEFT) {
          deltaX = -mapUnitsDelta;
        } else if (keyCode == KeyCode.RIGHT) {
          deltaX = mapUnitsDelta;
        } else {
          deltaY = mapUnitsDelta;
        }
        var delta = [deltaX, deltaY];
        rotate(delta, view.getRotation());
        pan(view, delta, this.duration_);
        mapBrowserEvent.preventDefault();
        stopEvent = true;
      }
    }
    return !stopEvent;
  }

  /**
   * @module ol/interaction/KeyboardZoom
   */


  /**
   * @typedef {Object} Options
   * @property {number} [duration=100] Animation duration in milliseconds.
   * @property {import("../events/condition.js").Condition} [condition] A function that
   * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
   * boolean to indicate whether that event should be handled. Default is
   * {@link module:ol/events/condition~targetNotEditable}.
   * @property {number} [delta=1] The zoom level delta on each key press.
   */


  /**
   * @classdesc
   * Allows the user to zoom the map using keyboard + and -.
   * Note that, although this interaction is by default included in maps,
   * the keys can only be used when browser focus is on the element to which
   * the keyboard events are attached. By default, this is the map div,
   * though you can change this with the `keyboardEventTarget` in
   * {@link module:ol/Map~Map}. `document` never loses focus but, for any other
   * element, focus will have to be on, and returned to, this element if the keys
   * are to function.
   * See also {@link module:ol/interaction/KeyboardPan~KeyboardPan}.
   * @api
   */
  var KeyboardZoom = /*@__PURE__*/(function (Interaction) {
    function KeyboardZoom(opt_options) {

      Interaction.call(this, {
        handleEvent: handleEvent$2
      });

      var options = opt_options ? opt_options : {};

      /**
       * @private
       * @type {import("../events/condition.js").Condition}
       */
      this.condition_ = options.condition ? options.condition : targetNotEditable;

      /**
       * @private
       * @type {number}
       */
      this.delta_ = options.delta ? options.delta : 1;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 100;

    }

    if ( Interaction ) KeyboardZoom.__proto__ = Interaction;
    KeyboardZoom.prototype = Object.create( Interaction && Interaction.prototype );
    KeyboardZoom.prototype.constructor = KeyboardZoom;

    return KeyboardZoom;
  }(Interaction));


  /**
   * Handles the {@link module:ol/MapBrowserEvent map browser event} if it was a
   * `KeyEvent`, and decides whether to zoom in or out (depending on whether the
   * key pressed was '+' or '-').
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @this {KeyboardZoom}
   */
  function handleEvent$2(mapBrowserEvent) {
    var stopEvent = false;
    if (mapBrowserEvent.type == EventType.KEYDOWN ||
        mapBrowserEvent.type == EventType.KEYPRESS) {
      var keyEvent = /** @type {KeyboardEvent} */ (mapBrowserEvent.originalEvent);
      var charCode = keyEvent.charCode;
      if (this.condition_(mapBrowserEvent) &&
          (charCode == '+'.charCodeAt(0) || charCode == '-'.charCodeAt(0))) {
        var map = mapBrowserEvent.map;
        var delta = (charCode == '+'.charCodeAt(0)) ? this.delta_ : -this.delta_;
        var view = map.getView();
        zoomByDelta(view, delta, undefined, this.duration_);
        mapBrowserEvent.preventDefault();
        stopEvent = true;
      }
    }
    return !stopEvent;
  }

  /**
   * @module ol/interaction/MouseWheelZoom
   */


  /**
   * Maximum mouse wheel delta.
   * @type {number}
   */
  var MAX_DELTA = 1;


  /**
   * @enum {string}
   */
  var Mode = {
    TRACKPAD: 'trackpad',
    WHEEL: 'wheel'
  };


  /**
   * @typedef {Object} Options
   * @property {import("../events/condition.js").Condition} [condition] A function that
   * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
   * boolean to indicate whether that event should be handled. Default is
   * {@link module:ol/events/condition~always}.
   * @property {number} [duration=250] Animation duration in milliseconds.
   * @property {number} [timeout=80] Mouse wheel timeout duration in milliseconds.
   * @property {boolean} [constrainResolution=false] When using a trackpad or
   * magic mouse, zoom to the closest integer zoom level after the scroll gesture
   * ends.
   * @property {boolean} [useAnchor=true] Enable zooming using the mouse's
   * location as the anchor. When set to `false`, zooming in and out will zoom to
   * the center of the screen instead of zooming on the mouse's location.
   */


  /**
   * @classdesc
   * Allows the user to zoom the map by scrolling the mouse wheel.
   * @api
   */
  var MouseWheelZoom = /*@__PURE__*/(function (Interaction) {
    function MouseWheelZoom(opt_options) {

      var options = opt_options ? opt_options : {};

      Interaction.call(/** @type {import("./Interaction.js").InteractionOptions} */ this, (options));

      /**
       * @private
       * @type {number}
       */
      this.delta_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 250;

      /**
       * @private
       * @type {number}
       */
      this.timeout_ = options.timeout !== undefined ? options.timeout : 80;

      /**
       * @private
       * @type {boolean}
       */
      this.useAnchor_ = options.useAnchor !== undefined ? options.useAnchor : true;

      /**
       * @private
       * @type {boolean}
       */
      this.constrainResolution_ = options.constrainResolution || false;

      /**
       * @private
       * @type {import("../events/condition.js").Condition}
       */
      this.condition_ = options.condition ? options.condition : always;

      /**
       * @private
       * @type {?import("../coordinate.js").Coordinate}
       */
      this.lastAnchor_ = null;

      /**
       * @private
       * @type {number|undefined}
       */
      this.startTime_ = undefined;

      /**
       * @private
       * @type {?}
       */
      this.timeoutId_;

      /**
       * @private
       * @type {Mode|undefined}
       */
      this.mode_ = undefined;

      /**
       * Trackpad events separated by this delay will be considered separate
       * interactions.
       * @type {number}
       */
      this.trackpadEventGap_ = 400;

      /**
       * @type {?}
       */
      this.trackpadTimeoutId_;

      /**
       * The number of delta values per zoom level
       * @private
       * @type {number}
       */
      this.trackpadDeltaPerZoom_ = 300;

      /**
       * The zoom factor by which scroll zooming is allowed to exceed the limits.
       * @private
       * @type {number}
       */
      this.trackpadZoomBuffer_ = 1.5;

    }

    if ( Interaction ) MouseWheelZoom.__proto__ = Interaction;
    MouseWheelZoom.prototype = Object.create( Interaction && Interaction.prototype );
    MouseWheelZoom.prototype.constructor = MouseWheelZoom;

    /**
     * @private
     */
    MouseWheelZoom.prototype.decrementInteractingHint_ = function decrementInteractingHint_ () {
      this.trackpadTimeoutId_ = undefined;
      var view = this.getMap().getView();
      view.setHint(ViewHint.INTERACTING, -1);
    };

    /**
     * Handles the {@link module:ol/MapBrowserEvent map browser event} (if it was a mousewheel-event) and eventually
     * zooms the map.
     * @override
     */
    MouseWheelZoom.prototype.handleEvent = function handleEvent (mapBrowserEvent) {
      if (!this.condition_(mapBrowserEvent)) {
        return true;
      }
      var type = mapBrowserEvent.type;
      if (type !== EventType.WHEEL && type !== EventType.MOUSEWHEEL) {
        return true;
      }

      mapBrowserEvent.preventDefault();

      var map = mapBrowserEvent.map;
      var wheelEvent = /** @type {WheelEvent} */ (mapBrowserEvent.originalEvent);

      if (this.useAnchor_) {
        this.lastAnchor_ = mapBrowserEvent.coordinate;
      }

      // Delta normalisation inspired by
      // https://github.com/mapbox/mapbox-gl-js/blob/001c7b9/js/ui/handler/scroll_zoom.js
      var delta;
      if (mapBrowserEvent.type == EventType.WHEEL) {
        delta = wheelEvent.deltaY;
        if (FIREFOX &&
            wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
          delta /= DEVICE_PIXEL_RATIO;
        }
        if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) {
          delta *= 40;
        }
      } else if (mapBrowserEvent.type == EventType.MOUSEWHEEL) {
        delta = -wheelEvent.wheelDeltaY;
        if (SAFARI) {
          delta /= 3;
        }
      }

      if (delta === 0) {
        return false;
      }

      var now = Date.now();

      if (this.startTime_ === undefined) {
        this.startTime_ = now;
      }

      if (!this.mode_ || now - this.startTime_ > this.trackpadEventGap_) {
        this.mode_ = Math.abs(delta) < 4 ?
          Mode.TRACKPAD :
          Mode.WHEEL;
      }

      if (this.mode_ === Mode.TRACKPAD) {
        var view = map.getView();
        if (this.trackpadTimeoutId_) {
          clearTimeout(this.trackpadTimeoutId_);
        } else {
          view.setHint(ViewHint.INTERACTING, 1);
        }
        this.trackpadTimeoutId_ = setTimeout(this.decrementInteractingHint_.bind(this), this.trackpadEventGap_);
        var resolution = view.getResolution() * Math.pow(2, delta / this.trackpadDeltaPerZoom_);
        var minResolution = view.getMinResolution();
        var maxResolution = view.getMaxResolution();
        var rebound = 0;
        if (resolution < minResolution) {
          resolution = Math.max(resolution, minResolution / this.trackpadZoomBuffer_);
          rebound = 1;
        } else if (resolution > maxResolution) {
          resolution = Math.min(resolution, maxResolution * this.trackpadZoomBuffer_);
          rebound = -1;
        }
        if (this.lastAnchor_) {
          var center = view.calculateCenterZoom(resolution, this.lastAnchor_);
          view.setCenter(view.constrainCenter(center));
        }
        view.setResolution(resolution);

        if (rebound === 0 && this.constrainResolution_) {
          view.animate({
            resolution: view.constrainResolution(resolution, delta > 0 ? -1 : 1),
            easing: easeOut,
            anchor: this.lastAnchor_,
            duration: this.duration_
          });
        }

        if (rebound > 0) {
          view.animate({
            resolution: minResolution,
            easing: easeOut,
            anchor: this.lastAnchor_,
            duration: 500
          });
        } else if (rebound < 0) {
          view.animate({
            resolution: maxResolution,
            easing: easeOut,
            anchor: this.lastAnchor_,
            duration: 500
          });
        }
        this.startTime_ = now;
        return false;
      }

      this.delta_ += delta;

      var timeLeft = Math.max(this.timeout_ - (now - this.startTime_), 0);

      clearTimeout(this.timeoutId_);
      this.timeoutId_ = setTimeout(this.handleWheelZoom_.bind(this, map), timeLeft);

      return false;
    };

    /**
     * @private
     * @param {import("../PluggableMap.js").default} map Map.
     */
    MouseWheelZoom.prototype.handleWheelZoom_ = function handleWheelZoom_ (map) {
      var view = map.getView();
      if (view.getAnimating()) {
        view.cancelAnimations();
      }
      var maxDelta = MAX_DELTA;
      var delta = clamp(this.delta_, -maxDelta, maxDelta);
      zoomByDelta(view, -delta, this.lastAnchor_, this.duration_);
      this.mode_ = undefined;
      this.delta_ = 0;
      this.lastAnchor_ = null;
      this.startTime_ = undefined;
      this.timeoutId_ = undefined;
    };

    /**
     * Enable or disable using the mouse's location as an anchor when zooming
     * @param {boolean} useAnchor true to zoom to the mouse's location, false
     * to zoom to the center of the map
     * @api
     */
    MouseWheelZoom.prototype.setMouseAnchor = function setMouseAnchor (useAnchor) {
      this.useAnchor_ = useAnchor;
      if (!useAnchor) {
        this.lastAnchor_ = null;
      }
    };

    return MouseWheelZoom;
  }(Interaction));

  /**
   * @module ol/interaction/PinchRotate
   */


  /**
   * @typedef {Object} Options
   * @property {number} [duration=250] The duration of the animation in
   * milliseconds.
   * @property {number} [threshold=0.3] Minimal angle in radians to start a rotation.
   */


  /**
   * @classdesc
   * Allows the user to rotate the map by twisting with two fingers
   * on a touch screen.
   * @api
   */
  var PinchRotate = /*@__PURE__*/(function (PointerInteraction) {
    function PinchRotate(opt_options) {

      var options = opt_options ? opt_options : {};

      var pointerOptions = /** @type {import("./Pointer.js").Options} */ (options);

      if (!pointerOptions.stopDown) {
        pointerOptions.stopDown = FALSE;
      }

      PointerInteraction.call(this, pointerOptions);

      /**
       * @private
       * @type {import("../coordinate.js").Coordinate}
       */
      this.anchor_ = null;

      /**
       * @private
       * @type {number|undefined}
       */
      this.lastAngle_ = undefined;

      /**
       * @private
       * @type {boolean}
       */
      this.rotating_ = false;

      /**
       * @private
       * @type {number}
       */
      this.rotationDelta_ = 0.0;

      /**
       * @private
       * @type {number}
       */
      this.threshold_ = options.threshold !== undefined ? options.threshold : 0.3;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 250;

    }

    if ( PointerInteraction ) PinchRotate.__proto__ = PointerInteraction;
    PinchRotate.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
    PinchRotate.prototype.constructor = PinchRotate;

    /**
     * @inheritDoc
     */
    PinchRotate.prototype.handleDragEvent = function handleDragEvent (mapBrowserEvent) {
      var rotationDelta = 0.0;

      var touch0 = this.targetPointers[0];
      var touch1 = this.targetPointers[1];

      // angle between touches
      var angle = Math.atan2(
        touch1.clientY - touch0.clientY,
        touch1.clientX - touch0.clientX);

      if (this.lastAngle_ !== undefined) {
        var delta = angle - this.lastAngle_;
        this.rotationDelta_ += delta;
        if (!this.rotating_ &&
            Math.abs(this.rotationDelta_) > this.threshold_) {
          this.rotating_ = true;
        }
        rotationDelta = delta;
      }
      this.lastAngle_ = angle;

      var map = mapBrowserEvent.map;
      var view = map.getView();
      if (view.getConstraints().rotation === disable) {
        return;
      }

      // rotate anchor point.
      // FIXME: should be the intersection point between the lines:
      //     touch0,touch1 and previousTouch0,previousTouch1
      var viewportPosition = map.getViewport().getBoundingClientRect();
      var centroid$1 = centroid(this.targetPointers);
      centroid$1[0] -= viewportPosition.left;
      centroid$1[1] -= viewportPosition.top;
      this.anchor_ = map.getCoordinateFromPixel(centroid$1);

      // rotate
      if (this.rotating_) {
        var rotation = view.getRotation();
        map.render();
        rotateWithoutConstraints(view, rotation + rotationDelta, this.anchor_);
      }
    };

    /**
     * @inheritDoc
     */
    PinchRotate.prototype.handleUpEvent = function handleUpEvent (mapBrowserEvent) {
      if (this.targetPointers.length < 2) {
        var map = mapBrowserEvent.map;
        var view = map.getView();
        view.setHint(ViewHint.INTERACTING, -1);
        if (this.rotating_) {
          var rotation = view.getRotation();
          rotate$2(view, rotation, this.anchor_, this.duration_);
        }
        return false;
      } else {
        return true;
      }
    };

    /**
     * @inheritDoc
     */
    PinchRotate.prototype.handleDownEvent = function handleDownEvent (mapBrowserEvent) {
      if (this.targetPointers.length >= 2) {
        var map = mapBrowserEvent.map;
        this.anchor_ = null;
        this.lastAngle_ = undefined;
        this.rotating_ = false;
        this.rotationDelta_ = 0.0;
        if (!this.handlingDownUpSequence) {
          map.getView().setHint(ViewHint.INTERACTING, 1);
        }
        return true;
      } else {
        return false;
      }
    };

    return PinchRotate;
  }(PointerInteraction));

  /**
   * @module ol/interaction/PinchZoom
   */


  /**
   * @typedef {Object} Options
   * @property {number} [duration=400] Animation duration in milliseconds.
   * @property {boolean} [constrainResolution=false] Zoom to the closest integer
   * zoom level after the pinch gesture ends.
   */


  /**
   * @classdesc
   * Allows the user to zoom the map by pinching with two fingers
   * on a touch screen.
   * @api
   */
  var PinchZoom = /*@__PURE__*/(function (PointerInteraction) {
    function PinchZoom(opt_options) {

      var options = opt_options ? opt_options : {};

      var pointerOptions = /** @type {import("./Pointer.js").Options} */ (options);

      if (!pointerOptions.stopDown) {
        pointerOptions.stopDown = FALSE;
      }

      PointerInteraction.call(this, pointerOptions);

      /**
       * @private
       * @type {boolean}
       */
      this.constrainResolution_ = options.constrainResolution || false;

      /**
       * @private
       * @type {import("../coordinate.js").Coordinate}
       */
      this.anchor_ = null;

      /**
       * @private
       * @type {number}
       */
      this.duration_ = options.duration !== undefined ? options.duration : 400;

      /**
       * @private
       * @type {number|undefined}
       */
      this.lastDistance_ = undefined;

      /**
       * @private
       * @type {number}
       */
      this.lastScaleDelta_ = 1;

    }

    if ( PointerInteraction ) PinchZoom.__proto__ = PointerInteraction;
    PinchZoom.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
    PinchZoom.prototype.constructor = PinchZoom;

    /**
     * @inheritDoc
     */
    PinchZoom.prototype.handleDragEvent = function handleDragEvent (mapBrowserEvent) {
      var scaleDelta = 1.0;

      var touch0 = this.targetPointers[0];
      var touch1 = this.targetPointers[1];
      var dx = touch0.clientX - touch1.clientX;
      var dy = touch0.clientY - touch1.clientY;

      // distance between touches
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (this.lastDistance_ !== undefined) {
        scaleDelta = this.lastDistance_ / distance;
      }
      this.lastDistance_ = distance;


      var map = mapBrowserEvent.map;
      var view = map.getView();
      var resolution = view.getResolution();
      var maxResolution = view.getMaxResolution();
      var minResolution = view.getMinResolution();
      var newResolution = resolution * scaleDelta;
      if (newResolution > maxResolution) {
        scaleDelta = maxResolution / resolution;
        newResolution = maxResolution;
      } else if (newResolution < minResolution) {
        scaleDelta = minResolution / resolution;
        newResolution = minResolution;
      }

      if (scaleDelta != 1.0) {
        this.lastScaleDelta_ = scaleDelta;
      }

      // scale anchor point.
      var viewportPosition = map.getViewport().getBoundingClientRect();
      var centroid$1 = centroid(this.targetPointers);
      centroid$1[0] -= viewportPosition.left;
      centroid$1[1] -= viewportPosition.top;
      this.anchor_ = map.getCoordinateFromPixel(centroid$1);

      // scale, bypass the resolution constraint
      map.render();
      zoomWithoutConstraints(view, newResolution, this.anchor_);
    };

    /**
     * @inheritDoc
     */
    PinchZoom.prototype.handleUpEvent = function handleUpEvent (mapBrowserEvent) {
      if (this.targetPointers.length < 2) {
        var map = mapBrowserEvent.map;
        var view = map.getView();
        view.setHint(ViewHint.INTERACTING, -1);
        var resolution = view.getResolution();
        if (this.constrainResolution_ ||
            resolution < view.getMinResolution() ||
            resolution > view.getMaxResolution()) {
          // Zoom to final resolution, with an animation, and provide a
          // direction not to zoom out/in if user was pinching in/out.
          // Direction is > 0 if pinching out, and < 0 if pinching in.
          var direction = this.lastScaleDelta_ - 1;
          zoom(view, resolution, this.anchor_, this.duration_, direction);
        }
        return false;
      } else {
        return true;
      }
    };

    /**
     * @inheritDoc
     */
    PinchZoom.prototype.handleDownEvent = function handleDownEvent (mapBrowserEvent) {
      if (this.targetPointers.length >= 2) {
        var map = mapBrowserEvent.map;
        this.anchor_ = null;
        this.lastDistance_ = undefined;
        this.lastScaleDelta_ = 1;
        if (!this.handlingDownUpSequence) {
          map.getView().setHint(ViewHint.INTERACTING, 1);
        }
        return true;
      } else {
        return false;
      }
    };

    return PinchZoom;
  }(PointerInteraction));

  /**
   * @module ol/interaction/DragAndDrop
   */

  /**
   * @module ol/interaction/DragRotateAndZoom
   */

  /**
   * @module ol/Feature
   */

  /**
   * @module ol/geom/Circle
   */

  /**
   * @classdesc
   * Circle geometry.
   *
   * @api
   */
  var Circle = /*@__PURE__*/(function (SimpleGeometry) {
    function Circle(center, opt_radius, opt_layout) {
      SimpleGeometry.call(this);
      if (opt_layout !== undefined && opt_radius === undefined) {
        this.setFlatCoordinates(opt_layout, center);
      } else {
        var radius = opt_radius ? opt_radius : 0;
        this.setCenterAndRadius(center, radius, opt_layout);
      }
    }

    if ( SimpleGeometry ) Circle.__proto__ = SimpleGeometry;
    Circle.prototype = Object.create( SimpleGeometry && SimpleGeometry.prototype );
    Circle.prototype.constructor = Circle;

    /**
     * Make a complete copy of the geometry.
     * @return {!Circle} Clone.
     * @override
     * @api
     */
    Circle.prototype.clone = function clone () {
      return new Circle(this.flatCoordinates.slice(), undefined, this.layout);
    };

    /**
     * @inheritDoc
     */
    Circle.prototype.closestPointXY = function closestPointXY (x, y, closestPoint, minSquaredDistance) {
      var flatCoordinates = this.flatCoordinates;
      var dx = x - flatCoordinates[0];
      var dy = y - flatCoordinates[1];
      var squaredDistance = dx * dx + dy * dy;
      if (squaredDistance < minSquaredDistance) {
        if (squaredDistance === 0) {
          for (var i = 0; i < this.stride; ++i) {
            closestPoint[i] = flatCoordinates[i];
          }
        } else {
          var delta = this.getRadius() / Math.sqrt(squaredDistance);
          closestPoint[0] = flatCoordinates[0] + delta * dx;
          closestPoint[1] = flatCoordinates[1] + delta * dy;
          for (var i$1 = 2; i$1 < this.stride; ++i$1) {
            closestPoint[i$1] = flatCoordinates[i$1];
          }
        }
        closestPoint.length = this.stride;
        return squaredDistance;
      } else {
        return minSquaredDistance;
      }
    };

    /**
     * @inheritDoc
     */
    Circle.prototype.containsXY = function containsXY (x, y) {
      var flatCoordinates = this.flatCoordinates;
      var dx = x - flatCoordinates[0];
      var dy = y - flatCoordinates[1];
      return dx * dx + dy * dy <= this.getRadiusSquared_();
    };

    /**
     * Return the center of the circle as {@link module:ol/coordinate~Coordinate coordinate}.
     * @return {import("../coordinate.js").Coordinate} Center.
     * @api
     */
    Circle.prototype.getCenter = function getCenter () {
      return this.flatCoordinates.slice(0, this.stride);
    };

    /**
     * @inheritDoc
     */
    Circle.prototype.computeExtent = function computeExtent (extent) {
      var flatCoordinates = this.flatCoordinates;
      var radius = flatCoordinates[this.stride] - flatCoordinates[0];
      return createOrUpdate(
        flatCoordinates[0] - radius, flatCoordinates[1] - radius,
        flatCoordinates[0] + radius, flatCoordinates[1] + radius,
        extent);
    };

    /**
     * Return the radius of the circle.
     * @return {number} Radius.
     * @api
     */
    Circle.prototype.getRadius = function getRadius () {
      return Math.sqrt(this.getRadiusSquared_());
    };

    /**
     * @private
     * @return {number} Radius squared.
     */
    Circle.prototype.getRadiusSquared_ = function getRadiusSquared_ () {
      var dx = this.flatCoordinates[this.stride] - this.flatCoordinates[0];
      var dy = this.flatCoordinates[this.stride + 1] - this.flatCoordinates[1];
      return dx * dx + dy * dy;
    };

    /**
     * @inheritDoc
     * @api
     */
    Circle.prototype.getType = function getType () {
      return GeometryType.CIRCLE;
    };

    /**
     * @inheritDoc
     * @api
     */
    Circle.prototype.intersectsExtent = function intersectsExtent (extent) {
      var circleExtent = this.getExtent();
      if (intersects(extent, circleExtent)) {
        var center = this.getCenter();

        if (extent[0] <= center[0] && extent[2] >= center[0]) {
          return true;
        }
        if (extent[1] <= center[1] && extent[3] >= center[1]) {
          return true;
        }

        return forEachCorner(extent, this.intersectsCoordinate, this);
      }
      return false;

    };

    /**
     * Set the center of the circle as {@link module:ol/coordinate~Coordinate coordinate}.
     * @param {import("../coordinate.js").Coordinate} center Center.
     * @api
     */
    Circle.prototype.setCenter = function setCenter (center) {
      var stride = this.stride;
      var radius = this.flatCoordinates[stride] - this.flatCoordinates[0];
      var flatCoordinates = center.slice();
      flatCoordinates[stride] = flatCoordinates[0] + radius;
      for (var i = 1; i < stride; ++i) {
        flatCoordinates[stride + i] = center[i];
      }
      this.setFlatCoordinates(this.layout, flatCoordinates);
      this.changed();
    };

    /**
     * Set the center (as {@link module:ol/coordinate~Coordinate coordinate}) and the radius (as
     * number) of the circle.
     * @param {!import("../coordinate.js").Coordinate} center Center.
     * @param {number} radius Radius.
     * @param {import("./GeometryLayout.js").default=} opt_layout Layout.
     * @api
     */
    Circle.prototype.setCenterAndRadius = function setCenterAndRadius (center, radius, opt_layout) {
      this.setLayout(opt_layout, center, 0);
      if (!this.flatCoordinates) {
        this.flatCoordinates = [];
      }
      /** @type {Array<number>} */
      var flatCoordinates = this.flatCoordinates;
      var offset = deflateCoordinate(
        flatCoordinates, 0, center, this.stride);
      flatCoordinates[offset++] = flatCoordinates[0] + radius;
      for (var i = 1, ii = this.stride; i < ii; ++i) {
        flatCoordinates[offset++] = flatCoordinates[i];
      }
      flatCoordinates.length = offset;
      this.changed();
    };

    /**
     * @inheritDoc
     */
    Circle.prototype.getCoordinates = function getCoordinates () {
      return null;
    };

    /**
     * @inheritDoc
     */
    Circle.prototype.setCoordinates = function setCoordinates (coordinates, opt_layout) {};

    /**
     * Set the radius of the circle. The radius is in the units of the projection.
     * @param {number} radius Radius.
     * @api
     */
    Circle.prototype.setRadius = function setRadius (radius) {
      this.flatCoordinates[this.stride] = this.flatCoordinates[0] + radius;
      this.changed();
    };

    return Circle;
  }(SimpleGeometry));


  /**
   * Transform each coordinate of the circle from one coordinate reference system
   * to another. The geometry is modified in place.
   * If you do not want the geometry modified in place, first clone() it and
   * then use this function on the clone.
   *
   * Internally a circle is currently represented by two points: the center of
   * the circle `[cx, cy]`, and the point to the right of the circle
   * `[cx + r, cy]`. This `transform` function just transforms these two points.
   * So the resulting geometry is also a circle, and that circle does not
   * correspond to the shape that would be obtained by transforming every point
   * of the original circle.
   *
   * @param {import("../proj.js").ProjectionLike} source The current projection.  Can be a
   *     string identifier or a {@link module:ol/proj/Projection~Projection} object.
   * @param {import("../proj.js").ProjectionLike} destination The desired projection.  Can be a
   *     string identifier or a {@link module:ol/proj/Projection~Projection} object.
   * @return {Circle} This geometry.  Note that original geometry is
   *     modified in place.
   * @function
   * @api
   */
  Circle.prototype.transform;

  /**
   * @module ol/geom/flat/interpolate
   */

  /**
   * @module ol/geom/flat/length
   */


  /**
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @return {number} Length.
   */
  function lineStringLength(flatCoordinates, offset, end, stride) {
    var x1 = flatCoordinates[offset];
    var y1 = flatCoordinates[offset + 1];
    var length = 0;
    for (var i = offset + stride; i < end; i += stride) {
      var x2 = flatCoordinates[i];
      var y2 = flatCoordinates[i + 1];
      length += Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      x1 = x2;
      y1 = y2;
    }
    return length;
  }

  /**
   * @module ol/geom/LineString
   */

  /**
   * @module ol/geom/MultiLineString
   */

  /**
   * @module ol/geom/MultiPoint
   */

  /**
   * @module ol/geom/flat/center
   */

  /**
   * @module ol/geom/MultiPolygon
   */

  /**
   * @module ol/LayerType
   */

  /**
   * A layer type used when creating layer renderers.
   * @enum {string}
   */
  var LayerType = {
    IMAGE: 'IMAGE',
    TILE: 'TILE',
    VECTOR_TILE: 'VECTOR_TILE',
    VECTOR: 'VECTOR'
  };

  /**
   * @module ol/layer/VectorRenderType
   */

  /**
   * @enum {string}
   * Render mode for vector layers:
   *  * `'image'`: Vector layers are rendered as images. Great performance, but
   *    point symbols and texts are always rotated with the view and pixels are
   *    scaled during zoom animations.
   *  * `'vector'`: Vector layers are rendered as vectors. Most accurate rendering
   *    even during animations, but slower performance.
   * @api
   */
  var VectorRenderType = {
    IMAGE: 'image',
    VECTOR: 'vector'
  };

  /**
   * @module ol/color
   */


  /**
   * Return the color as an rgba string.
   * @param {Color|string} color Color.
   * @return {string} Rgba string.
   * @api
   */
  function asString(color) {
    if (typeof color === 'string') {
      return color;
    } else {
      return toString(color);
    }
  }


  /**
   * @param {Color} color Color.
   * @return {string} String.
   */
  function toString(color) {
    var r = color[0];
    if (r != (r | 0)) {
      r = (r + 0.5) | 0;
    }
    var g = color[1];
    if (g != (g | 0)) {
      g = (g + 0.5) | 0;
    }
    var b = color[2];
    if (b != (b | 0)) {
      b = (b + 0.5) | 0;
    }
    var a = color[3] === undefined ? 1 : color[3];
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  /**
   * @module ol/colorlike
   */


  /**
   * A type accepted by CanvasRenderingContext2D.fillStyle
   * or CanvasRenderingContext2D.strokeStyle.
   * Represents a color, pattern, or gradient. The origin for patterns and
   * gradients as fill style is an increment of 512 css pixels from map coordinate
   * `[0, 0]`. For seamless repeat patterns, width and height of the pattern image
   * must be a factor of two (2, 4, 8, ..., 512).
   *
   * @typedef {string|CanvasPattern|CanvasGradient} ColorLike
   * @api
   */


  /**
   * @param {import("./color.js").Color|ColorLike} color Color.
   * @return {ColorLike} The color as an {@link ol/colorlike~ColorLike}.
   * @api
   */
  function asColorLike(color) {
    if (Array.isArray(color)) {
      return toString(color);
    } else {
      return color;
    }
  }

  /**
   * @module ol/ImageState
   */

  /**
   * @enum {number}
   */
  var ImageState = {
    IDLE: 0,
    LOADING: 1,
    LOADED: 2,
    ERROR: 3
  };

  /**
   * @module ol/structs/LRUCache
   */


  /**
   * @typedef {Object} Entry
   * @property {string} key_
   * @property {Object} newer
   * @property {Object} older
   * @property {*} value_
   */


  /**
   * @classdesc
   * Implements a Least-Recently-Used cache where the keys do not conflict with
   * Object's properties (e.g. 'hasOwnProperty' is not allowed as a key). Expiring
   * items from the cache is the responsibility of the user.
   *
   * @fires import("../events/Event.js").Event
   * @template T
   */
  var LRUCache = /*@__PURE__*/(function (EventTarget) {
    function LRUCache(opt_highWaterMark) {

      EventTarget.call(this);

      /**
       * @type {number}
       */
      this.highWaterMark = opt_highWaterMark !== undefined ? opt_highWaterMark : 2048;

      /**
       * @private
       * @type {number}
       */
      this.count_ = 0;

      /**
       * @private
       * @type {!Object<string, Entry>}
       */
      this.entries_ = {};

      /**
       * @private
       * @type {?Entry}
       */
      this.oldest_ = null;

      /**
       * @private
       * @type {?Entry}
       */
      this.newest_ = null;

    }

    if ( EventTarget ) LRUCache.__proto__ = EventTarget;
    LRUCache.prototype = Object.create( EventTarget && EventTarget.prototype );
    LRUCache.prototype.constructor = LRUCache;


    /**
     * @return {boolean} Can expire cache.
     */
    LRUCache.prototype.canExpireCache = function canExpireCache () {
      return this.getCount() > this.highWaterMark;
    };


    /**
     * FIXME empty description for jsdoc
     */
    LRUCache.prototype.clear = function clear () {
      this.count_ = 0;
      this.entries_ = {};
      this.oldest_ = null;
      this.newest_ = null;
      this.dispatchEvent(EventType.CLEAR);
    };


    /**
     * @param {string} key Key.
     * @return {boolean} Contains key.
     */
    LRUCache.prototype.containsKey = function containsKey (key) {
      return this.entries_.hasOwnProperty(key);
    };


    /**
     * @param {function(this: S, T, string, LRUCache): ?} f The function
     *     to call for every entry from the oldest to the newer. This function takes
     *     3 arguments (the entry value, the entry key and the LRUCache object).
     *     The return value is ignored.
     * @param {S=} opt_this The object to use as `this` in `f`.
     * @template S
     */
    LRUCache.prototype.forEach = function forEach (f, opt_this) {
      var entry = this.oldest_;
      while (entry) {
        f.call(opt_this, entry.value_, entry.key_, this);
        entry = entry.newer;
      }
    };


    /**
     * @param {string} key Key.
     * @return {T} Value.
     */
    LRUCache.prototype.get = function get (key) {
      var entry = this.entries_[key];
      assert(entry !== undefined,
        15); // Tried to get a value for a key that does not exist in the cache
      if (entry === this.newest_) {
        return entry.value_;
      } else if (entry === this.oldest_) {
        this.oldest_ = /** @type {Entry} */ (this.oldest_.newer);
        this.oldest_.older = null;
      } else {
        entry.newer.older = entry.older;
        entry.older.newer = entry.newer;
      }
      entry.newer = null;
      entry.older = this.newest_;
      this.newest_.newer = entry;
      this.newest_ = entry;
      return entry.value_;
    };


    /**
     * Remove an entry from the cache.
     * @param {string} key The entry key.
     * @return {T} The removed entry.
     */
    LRUCache.prototype.remove = function remove (key) {
      var entry = this.entries_[key];
      assert(entry !== undefined, 15); // Tried to get a value for a key that does not exist in the cache
      if (entry === this.newest_) {
        this.newest_ = /** @type {Entry} */ (entry.older);
        if (this.newest_) {
          this.newest_.newer = null;
        }
      } else if (entry === this.oldest_) {
        this.oldest_ = /** @type {Entry} */ (entry.newer);
        if (this.oldest_) {
          this.oldest_.older = null;
        }
      } else {
        entry.newer.older = entry.older;
        entry.older.newer = entry.newer;
      }
      delete this.entries_[key];
      --this.count_;
      return entry.value_;
    };


    /**
     * @return {number} Count.
     */
    LRUCache.prototype.getCount = function getCount () {
      return this.count_;
    };


    /**
     * @return {Array<string>} Keys.
     */
    LRUCache.prototype.getKeys = function getKeys () {
      var keys = new Array(this.count_);
      var i = 0;
      var entry;
      for (entry = this.newest_; entry; entry = entry.older) {
        keys[i++] = entry.key_;
      }
      return keys;
    };


    /**
     * @return {Array<T>} Values.
     */
    LRUCache.prototype.getValues = function getValues () {
      var values = new Array(this.count_);
      var i = 0;
      var entry;
      for (entry = this.newest_; entry; entry = entry.older) {
        values[i++] = entry.value_;
      }
      return values;
    };


    /**
     * @return {T} Last value.
     */
    LRUCache.prototype.peekLast = function peekLast () {
      return this.oldest_.value_;
    };


    /**
     * @return {string} Last key.
     */
    LRUCache.prototype.peekLastKey = function peekLastKey () {
      return this.oldest_.key_;
    };


    /**
     * Get the key of the newest item in the cache.  Throws if the cache is empty.
     * @return {string} The newest key.
     */
    LRUCache.prototype.peekFirstKey = function peekFirstKey () {
      return this.newest_.key_;
    };


    /**
     * @return {T} value Value.
     */
    LRUCache.prototype.pop = function pop () {
      var entry = this.oldest_;
      delete this.entries_[entry.key_];
      if (entry.newer) {
        entry.newer.older = null;
      }
      this.oldest_ = /** @type {Entry} */ (entry.newer);
      if (!this.oldest_) {
        this.newest_ = null;
      }
      --this.count_;
      return entry.value_;
    };


    /**
     * @param {string} key Key.
     * @param {T} value Value.
     */
    LRUCache.prototype.replace = function replace (key, value) {
      this.get(key); // update `newest_`
      this.entries_[key].value_ = value;
    };


    /**
     * @param {string} key Key.
     * @param {T} value Value.
     */
    LRUCache.prototype.set = function set (key, value) {
      assert(!(key in this.entries_),
        16); // Tried to set a value for a key that is used already
      var entry = /** @type {Entry} */ ({
        key_: key,
        newer: null,
        older: this.newest_,
        value_: value
      });
      if (!this.newest_) {
        this.oldest_ = entry;
      } else {
        this.newest_.newer = entry;
      }
      this.newest_ = entry;
      this.entries_[key] = entry;
      ++this.count_;
    };


    /**
     * Set a maximum number of entries for the cache.
     * @param {number} size Cache size.
     * @api
     */
    LRUCache.prototype.setSize = function setSize (size) {
      this.highWaterMark = size;
    };


    /**
     * Prune the cache.
     */
    LRUCache.prototype.prune = function prune () {
      while (this.canExpireCache()) {
        this.pop();
      }
    };

    return LRUCache;
  }(Target));

  /**
   * @module ol/render/canvas
   */


  /**
   * @typedef {Object} FillState
   * @property {import("../colorlike.js").ColorLike} fillStyle
   */


  /**
   * @typedef {Object} FillStrokeState
   * @property {import("../colorlike.js").ColorLike} [currentFillStyle]
   * @property {import("../colorlike.js").ColorLike} [currentStrokeStyle]
   * @property {string} [currentLineCap]
   * @property {Array<number>} currentLineDash
   * @property {number} [currentLineDashOffset]
   * @property {string} [currentLineJoin]
   * @property {number} [currentLineWidth]
   * @property {number} [currentMiterLimit]
   * @property {number} [lastStroke]
   * @property {import("../colorlike.js").ColorLike} [fillStyle]
   * @property {import("../colorlike.js").ColorLike} [strokeStyle]
   * @property {string} [lineCap]
   * @property {Array<number>} lineDash
   * @property {number} [lineDashOffset]
   * @property {string} [lineJoin]
   * @property {number} [lineWidth]
   * @property {number} [miterLimit]
   */


  /**
   * @typedef {Object} StrokeState
   * @property {string} lineCap
   * @property {Array<number>} lineDash
   * @property {number} lineDashOffset
   * @property {string} lineJoin
   * @property {number} lineWidth
   * @property {number} miterLimit
   * @property {import("../colorlike.js").ColorLike} strokeStyle
   */


  /**
   * @typedef {Object} TextState
   * @property {string} font
   * @property {string} [textAlign]
   * @property {string} textBaseline
   * @property {string} [placement]
   * @property {number} [maxAngle]
   * @property {boolean} [overflow]
   * @property {import("../style/Fill.js").default} [backgroundFill]
   * @property {import("../style/Stroke.js").default} [backgroundStroke]
   * @property {number} [scale]
   * @property {Array<number>} [padding]
   */


  /**
   * Container for decluttered replay instructions that need to be rendered or
   * omitted together, i.e. when styles render both an image and text, or for the
   * characters that form text along lines. The basic elements of this array are
   * `[minX, minY, maxX, maxY, count]`, where the first four entries are the
   * rendered extent of the group in pixel space. `count` is the number of styles
   * in the group, i.e. 2 when an image and a text are grouped, or 1 otherwise.
   * In addition to these four elements, declutter instruction arrays (i.e. the
   * arguments to {@link module:ol/render/canvas~drawImage} are appended to the array.
   * @typedef {Array<*>} DeclutterGroup
   */


  /**
   * @const
   * @type {string}
   */
  var defaultFont = '10px sans-serif';


  /**
   * @const
   * @type {import("../color.js").Color}
   */
  var defaultFillStyle = [0, 0, 0, 1];


  /**
   * @const
   * @type {string}
   */
  var defaultLineCap = 'round';


  /**
   * @const
   * @type {Array<number>}
   */
  var defaultLineDash = [];


  /**
   * @const
   * @type {number}
   */
  var defaultLineDashOffset = 0;


  /**
   * @const
   * @type {string}
   */
  var defaultLineJoin = 'round';


  /**
   * @const
   * @type {number}
   */
  var defaultMiterLimit = 10;


  /**
   * @const
   * @type {import("../color.js").Color}
   */
  var defaultStrokeStyle = [0, 0, 0, 1];


  /**
   * @const
   * @type {string}
   */
  var defaultTextAlign = 'center';


  /**
   * @const
   * @type {string}
   */
  var defaultTextBaseline = 'middle';


  /**
   * @const
   * @type {Array<number>}
   */
  var defaultPadding = [0, 0, 0, 0];


  /**
   * @const
   * @type {number}
   */
  var defaultLineWidth = 1;


  /**
   * The label cache for text rendering. To change the default cache size of 2048
   * entries, use {@link module:ol/structs/LRUCache#setSize}.
   * @type {LRUCache<HTMLCanvasElement>}
   * @api
   */
  var labelCache = new LRUCache();


  /**
   * @type {!Object<string, number>}
   */
  var checkedFonts = {};


  /**
   * @type {CanvasRenderingContext2D}
   */
  var measureContext = null;


  /**
   * @type {!Object<string, number>}
   */
  var textHeights = {};


  /**
   * Clears the label cache when a font becomes available.
   * @param {string} fontSpec CSS font spec.
   */
  var checkFont = (function() {
    var retries = 60;
    var checked = checkedFonts;
    var size = '32px ';
    var referenceFonts = ['monospace', 'serif'];
    var len = referenceFonts.length;
    var text = 'wmytzilWMYTZIL@#/&?$%10\uF013';
    var interval, referenceWidth;

    function isAvailable(font) {
      var context = getMeasureContext();
      // Check weight ranges according to
      // https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#Fallback_weights
      for (var weight = 100; weight <= 700; weight += 300) {
        var fontWeight = weight + ' ';
        var available = true;
        for (var i = 0; i < len; ++i) {
          var referenceFont = referenceFonts[i];
          context.font = fontWeight + size + referenceFont;
          referenceWidth = context.measureText(text).width;
          if (font != referenceFont) {
            context.font = fontWeight + size + font + ',' + referenceFont;
            var width = context.measureText(text).width;
            // If width and referenceWidth are the same, then the fallback was used
            // instead of the font we wanted, so the font is not available.
            available = available && width != referenceWidth;
          }
        }
        if (available) {
          // Consider font available when it is available in one weight range.
          //FIXME With this we miss rare corner cases, so we should consider
          //FIXME checking availability for each requested weight range.
          return true;
        }
      }
      return false;
    }

    function check() {
      var done = true;
      for (var font in checked) {
        if (checked[font] < retries) {
          if (isAvailable(font)) {
            checked[font] = retries;
            clear(textHeights);
            // Make sure that loaded fonts are picked up by Safari
            measureContext = null;
            labelCache.clear();
          } else {
            ++checked[font];
            done = false;
          }
        }
      }
      if (done) {
        clearInterval(interval);
        interval = undefined;
      }
    }

    return function(fontSpec) {
      var fontFamilies = getFontFamilies(fontSpec);
      if (!fontFamilies) {
        return;
      }
      for (var i = 0, ii = fontFamilies.length; i < ii; ++i) {
        var fontFamily = fontFamilies[i];
        if (!(fontFamily in checked)) {
          checked[fontFamily] = retries;
          if (!isAvailable(fontFamily)) {
            checked[fontFamily] = 0;
            if (interval === undefined) {
              interval = setInterval(check, 32);
            }
          }
        }
      }
    };
  })();


  /**
   * @return {CanvasRenderingContext2D} Measure context.
   */
  function getMeasureContext() {
    if (!measureContext) {
      measureContext = createCanvasContext2D(1, 1);
    }
    return measureContext;
  }


  /**
   * @param {string} font Font to use for measuring.
   * @return {import("../size.js").Size} Measurement.
   */
  var measureTextHeight = (function() {
    var span;
    var heights = textHeights;
    return function(font) {
      var height = heights[font];
      if (height == undefined) {
        if (!span) {
          span = document.createElement('span');
          span.textContent = 'M';
          span.style.margin = span.style.padding = '0 !important';
          span.style.position = 'absolute !important';
          span.style.left = '-99999px !important';
        }
        span.style.font = font;
        document.body.appendChild(span);
        height = heights[font] = span.offsetHeight;
        document.body.removeChild(span);
      }
      return height;
    };
  })();


  /**
   * @param {string} font Font.
   * @param {string} text Text.
   * @return {number} Width.
   */
  function measureTextWidth(font, text) {
    var measureContext = getMeasureContext();
    if (font != measureContext.font) {
      measureContext.font = font;
    }
    return measureContext.measureText(text).width;
  }


  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {number} rotation Rotation.
   * @param {number} offsetX X offset.
   * @param {number} offsetY Y offset.
   */
  function rotateAtOffset(context, rotation, offsetX, offsetY) {
    if (rotation !== 0) {
      context.translate(offsetX, offsetY);
      context.rotate(rotation);
      context.translate(-offsetX, -offsetY);
    }
  }


  var resetTransform = create();


  /**
   * @param {CanvasRenderingContext2D} context Context.
   * @param {import("../transform.js").Transform|null} transform Transform.
   * @param {number} opacity Opacity.
   * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image Image.
   * @param {number} originX Origin X.
   * @param {number} originY Origin Y.
   * @param {number} w Width.
   * @param {number} h Height.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {number} scale Scale.
   */
  function drawImage(context,
    transform, opacity, image, originX, originY, w, h, x, y, scale) {
    var alpha;
    if (opacity != 1) {
      alpha = context.globalAlpha;
      context.globalAlpha = alpha * opacity;
    }
    if (transform) {
      context.setTransform.apply(context, transform);
    }

    context.drawImage(image, originX, originY, w, h, x, y, w * scale, h * scale);

    if (alpha) {
      context.globalAlpha = alpha;
    }
    if (transform) {
      context.setTransform.apply(context, resetTransform);
    }
  }

  /**
   * @module ol/style/Image
   */


  /**
   * @typedef {Object} Options
   * @property {number} opacity
   * @property {boolean} rotateWithView
   * @property {number} rotation
   * @property {number} scale
   */


  /**
   * @classdesc
   * A base class used for creating subclasses and not instantiated in
   * apps. Base class for {@link module:ol/style/Icon~Icon}, {@link module:ol/style/Circle~CircleStyle} and
   * {@link module:ol/style/RegularShape~RegularShape}.
   * @abstract
   * @api
   */
  var ImageStyle = function ImageStyle(options) {

    /**
     * @private
     * @type {number}
     */
    this.opacity_ = options.opacity;

    /**
     * @private
     * @type {boolean}
     */
    this.rotateWithView_ = options.rotateWithView;

    /**
     * @private
     * @type {number}
     */
    this.rotation_ = options.rotation;

    /**
     * @private
     * @type {number}
     */
    this.scale_ = options.scale;

  };

  /**
   * Clones the style.
   * @return {ImageStyle} The cloned style.
   * @api
   */
  ImageStyle.prototype.clone = function clone () {
    return new ImageStyle({
      opacity: this.getOpacity(),
      scale: this.getScale(),
      rotation: this.getRotation(),
      rotateWithView: this.getRotateWithView()
    });
  };

  /**
   * Get the symbolizer opacity.
   * @return {number} Opacity.
   * @api
   */
  ImageStyle.prototype.getOpacity = function getOpacity () {
    return this.opacity_;
  };

  /**
   * Determine whether the symbolizer rotates with the map.
   * @return {boolean} Rotate with map.
   * @api
   */
  ImageStyle.prototype.getRotateWithView = function getRotateWithView () {
    return this.rotateWithView_;
  };

  /**
   * Get the symoblizer rotation.
   * @return {number} Rotation.
   * @api
   */
  ImageStyle.prototype.getRotation = function getRotation () {
    return this.rotation_;
  };

  /**
   * Get the symbolizer scale.
   * @return {number} Scale.
   * @api
   */
  ImageStyle.prototype.getScale = function getScale () {
    return this.scale_;
  };

  /**
   * This method is deprecated and always returns false.
   * @return {boolean} false.
   * @deprecated
   * @api
   */
  ImageStyle.prototype.getSnapToPixel = function getSnapToPixel () {
    return false;
  };

  /**
   * Get the anchor point in pixels. The anchor determines the center point for the
   * symbolizer.
   * @abstract
   * @return {Array<number>} Anchor.
   */
  ImageStyle.prototype.getAnchor = function getAnchor () {
    return abstract();
  };

  /**
   * Get the image element for the symbolizer.
   * @abstract
   * @param {number} pixelRatio Pixel ratio.
   * @return {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} Image element.
   */
  ImageStyle.prototype.getImage = function getImage (pixelRatio) {
    return abstract();
  };

  /**
   * @abstract
   * @param {number} pixelRatio Pixel ratio.
   * @return {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} Image element.
   */
  ImageStyle.prototype.getHitDetectionImage = function getHitDetectionImage (pixelRatio) {
    return abstract();
  };

  /**
   * @abstract
   * @return {import("../ImageState.js").default} Image state.
   */
  ImageStyle.prototype.getImageState = function getImageState () {
    return abstract();
  };

  /**
   * @abstract
   * @return {import("../size.js").Size} Image size.
   */
  ImageStyle.prototype.getImageSize = function getImageSize () {
    return abstract();
  };

  /**
   * @abstract
   * @return {import("../size.js").Size} Size of the hit-detection image.
   */
  ImageStyle.prototype.getHitDetectionImageSize = function getHitDetectionImageSize () {
    return abstract();
  };

  /**
   * Get the origin of the symbolizer.
   * @abstract
   * @return {Array<number>} Origin.
   */
  ImageStyle.prototype.getOrigin = function getOrigin () {
    return abstract();
  };

  /**
   * Get the size of the symbolizer (in pixels).
   * @abstract
   * @return {import("../size.js").Size} Size.
   */
  ImageStyle.prototype.getSize = function getSize () {
    return abstract();
  };

  /**
   * Set the opacity.
   *
   * @param {number} opacity Opacity.
   * @api
   */
  ImageStyle.prototype.setOpacity = function setOpacity (opacity) {
    this.opacity_ = opacity;
  };

  /**
   * Set whether to rotate the style with the view.
   *
   * @param {boolean} rotateWithView Rotate with map.
   * @api
   */
  ImageStyle.prototype.setRotateWithView = function setRotateWithView (rotateWithView) {
    this.rotateWithView_ = rotateWithView;
  };

  /**
   * Set the rotation.
   *
   * @param {number} rotation Rotation.
   * @api
   */
  ImageStyle.prototype.setRotation = function setRotation (rotation) {
    this.rotation_ = rotation;
  };
  /**
   * Set the scale.
   *
   * @param {number} scale Scale.
   * @api
   */
  ImageStyle.prototype.setScale = function setScale (scale) {
    this.scale_ = scale;
  };

  /**
   * This method is deprecated and does nothing.
   * @param {boolean} snapToPixel Snap to pixel?
   * @deprecated
   * @api
   */
  ImageStyle.prototype.setSnapToPixel = function setSnapToPixel (snapToPixel) {};

  /**
   * @abstract
   * @param {function(this: T, import("../events/Event.js").default)} listener Listener function.
   * @param {T} thisArg Value to use as `this` when executing `listener`.
   * @return {import("../events.js").EventsKey|undefined} Listener key.
   * @template T
   */
  ImageStyle.prototype.listenImageChange = function listenImageChange (listener, thisArg) {
    return abstract();
  };

  /**
   * Load not yet loaded URI.
   * @abstract
   */
  ImageStyle.prototype.load = function load () {
    abstract();
  };

  /**
   * @abstract
   * @param {function(this: T, import("../events/Event.js").default)} listener Listener function.
   * @param {T} thisArg Value to use as `this` when executing `listener`.
   * @template T
   */
  ImageStyle.prototype.unlistenImageChange = function unlistenImageChange (listener, thisArg) {
    abstract();
  };

  /**
   * @module ol/style/RegularShape
   */


  /**
   * Specify radius for regular polygons, or radius1 and radius2 for stars.
   * @typedef {Object} Options
   * @property {import("./Fill.js").default} [fill] Fill style.
   * @property {number} points Number of points for stars and regular polygons. In case of a polygon, the number of points
   * is the number of sides.
   * @property {number} [radius] Radius of a regular polygon.
   * @property {number} [radius1] Outer radius of a star.
   * @property {number} [radius2] Inner radius of a star.
   * @property {number} [angle=0] Shape's angle in radians. A value of 0 will have one of the shape's point facing up.
   * @property {import("./Stroke.js").default} [stroke] Stroke style.
   * @property {number} [rotation=0] Rotation in radians (positive rotation clockwise).
   * @property {boolean} [rotateWithView=false] Whether to rotate the shape with the view.
   * @property {import("./AtlasManager.js").default} [atlasManager] The atlas manager to use for this symbol. When
   * using WebGL it is recommended to use an atlas manager to avoid texture switching. If an atlas manager is given, the
   * symbol is added to an atlas. By default no atlas manager is used.
   */


  /**
   * @typedef {Object} RenderOptions
   * @property {import("../colorlike.js").ColorLike} [strokeStyle]
   * @property {number} strokeWidth
   * @property {number} size
   * @property {string} lineCap
   * @property {Array<number>} lineDash
   * @property {number} lineDashOffset
   * @property {string} lineJoin
   * @property {number} miterLimit
   */


  /**
   * @classdesc
   * Set regular shape style for vector features. The resulting shape will be
   * a regular polygon when `radius` is provided, or a star when `radius1` and
   * `radius2` are provided.
   * @api
   */
  var RegularShape = /*@__PURE__*/(function (ImageStyle) {
    function RegularShape(options) {
      /**
       * @type {boolean}
       */
      var rotateWithView = options.rotateWithView !== undefined ?
        options.rotateWithView : false;

      ImageStyle.call(this, {
        opacity: 1,
        rotateWithView: rotateWithView,
        rotation: options.rotation !== undefined ? options.rotation : 0,
        scale: 1
      });

      /**
       * @private
       * @type {Array<string|number>}
       */
      this.checksums_ = null;

      /**
       * @private
       * @type {HTMLCanvasElement}
       */
      this.canvas_ = null;

      /**
       * @private
       * @type {HTMLCanvasElement}
       */
      this.hitDetectionCanvas_ = null;

      /**
       * @private
       * @type {import("./Fill.js").default}
       */
      this.fill_ = options.fill !== undefined ? options.fill : null;

      /**
       * @private
       * @type {Array<number>}
       */
      this.origin_ = [0, 0];

      /**
       * @private
       * @type {number}
       */
      this.points_ = options.points;

      /**
       * @protected
       * @type {number}
       */
      this.radius_ = /** @type {number} */ (options.radius !== undefined ?
        options.radius : options.radius1);

      /**
       * @private
       * @type {number|undefined}
       */
      this.radius2_ = options.radius2;

      /**
       * @private
       * @type {number}
       */
      this.angle_ = options.angle !== undefined ? options.angle : 0;

      /**
       * @private
       * @type {import("./Stroke.js").default}
       */
      this.stroke_ = options.stroke !== undefined ? options.stroke : null;

      /**
       * @private
       * @type {Array<number>}
       */
      this.anchor_ = null;

      /**
       * @private
       * @type {import("../size.js").Size}
       */
      this.size_ = null;

      /**
       * @private
       * @type {import("../size.js").Size}
       */
      this.imageSize_ = null;

      /**
       * @private
       * @type {import("../size.js").Size}
       */
      this.hitDetectionImageSize_ = null;

      /**
       * @protected
       * @type {import("./AtlasManager.js").default|undefined}
       */
      this.atlasManager_ = options.atlasManager;

      this.render_(this.atlasManager_);

    }

    if ( ImageStyle ) RegularShape.__proto__ = ImageStyle;
    RegularShape.prototype = Object.create( ImageStyle && ImageStyle.prototype );
    RegularShape.prototype.constructor = RegularShape;

    /**
     * Clones the style. If an atlasmanager was provided to the original style it will be used in the cloned style, too.
     * @return {RegularShape} The cloned style.
     * @api
     */
    RegularShape.prototype.clone = function clone () {
      var style = new RegularShape({
        fill: this.getFill() ? this.getFill().clone() : undefined,
        points: this.getPoints(),
        radius: this.getRadius(),
        radius2: this.getRadius2(),
        angle: this.getAngle(),
        stroke: this.getStroke() ? this.getStroke().clone() : undefined,
        rotation: this.getRotation(),
        rotateWithView: this.getRotateWithView(),
        atlasManager: this.atlasManager_
      });
      style.setOpacity(this.getOpacity());
      style.setScale(this.getScale());
      return style;
    };

    /**
     * @inheritDoc
     * @api
     */
    RegularShape.prototype.getAnchor = function getAnchor () {
      return this.anchor_;
    };

    /**
     * Get the angle used in generating the shape.
     * @return {number} Shape's rotation in radians.
     * @api
     */
    RegularShape.prototype.getAngle = function getAngle () {
      return this.angle_;
    };

    /**
     * Get the fill style for the shape.
     * @return {import("./Fill.js").default} Fill style.
     * @api
     */
    RegularShape.prototype.getFill = function getFill () {
      return this.fill_;
    };

    /**
     * @inheritDoc
     */
    RegularShape.prototype.getHitDetectionImage = function getHitDetectionImage (pixelRatio) {
      return this.hitDetectionCanvas_;
    };

    /**
     * @inheritDoc
     * @api
     */
    RegularShape.prototype.getImage = function getImage (pixelRatio) {
      return this.canvas_;
    };

    /**
     * @inheritDoc
     */
    RegularShape.prototype.getImageSize = function getImageSize () {
      return this.imageSize_;
    };

    /**
     * @inheritDoc
     */
    RegularShape.prototype.getHitDetectionImageSize = function getHitDetectionImageSize () {
      return this.hitDetectionImageSize_;
    };

    /**
     * @inheritDoc
     */
    RegularShape.prototype.getImageState = function getImageState () {
      return ImageState.LOADED;
    };

    /**
     * @inheritDoc
     * @api
     */
    RegularShape.prototype.getOrigin = function getOrigin () {
      return this.origin_;
    };

    /**
     * Get the number of points for generating the shape.
     * @return {number} Number of points for stars and regular polygons.
     * @api
     */
    RegularShape.prototype.getPoints = function getPoints () {
      return this.points_;
    };

    /**
     * Get the (primary) radius for the shape.
     * @return {number} Radius.
     * @api
     */
    RegularShape.prototype.getRadius = function getRadius () {
      return this.radius_;
    };

    /**
     * Get the secondary radius for the shape.
     * @return {number|undefined} Radius2.
     * @api
     */
    RegularShape.prototype.getRadius2 = function getRadius2 () {
      return this.radius2_;
    };

    /**
     * @inheritDoc
     * @api
     */
    RegularShape.prototype.getSize = function getSize () {
      return this.size_;
    };

    /**
     * Get the stroke style for the shape.
     * @return {import("./Stroke.js").default} Stroke style.
     * @api
     */
    RegularShape.prototype.getStroke = function getStroke () {
      return this.stroke_;
    };

    /**
     * @inheritDoc
     */
    RegularShape.prototype.listenImageChange = function listenImageChange (listener, thisArg) {
      return undefined;
    };

    /**
     * @inheritDoc
     */
    RegularShape.prototype.load = function load () {};

    /**
     * @inheritDoc
     */
    RegularShape.prototype.unlistenImageChange = function unlistenImageChange (listener, thisArg) {};

    /**
     * @protected
     * @param {import("./AtlasManager.js").default|undefined} atlasManager An atlas manager.
     */
    RegularShape.prototype.render_ = function render_ (atlasManager) {
      var imageSize;
      var lineCap = '';
      var lineJoin = '';
      var miterLimit = 0;
      var lineDash = null;
      var lineDashOffset = 0;
      var strokeStyle;
      var strokeWidth = 0;

      if (this.stroke_) {
        strokeStyle = this.stroke_.getColor();
        if (strokeStyle === null) {
          strokeStyle = defaultStrokeStyle;
        }
        strokeStyle = asColorLike(strokeStyle);
        strokeWidth = this.stroke_.getWidth();
        if (strokeWidth === undefined) {
          strokeWidth = defaultLineWidth;
        }
        lineDash = this.stroke_.getLineDash();
        lineDashOffset = this.stroke_.getLineDashOffset();
        if (!CANVAS_LINE_DASH) {
          lineDash = null;
          lineDashOffset = 0;
        }
        lineJoin = this.stroke_.getLineJoin();
        if (lineJoin === undefined) {
          lineJoin = defaultLineJoin;
        }
        lineCap = this.stroke_.getLineCap();
        if (lineCap === undefined) {
          lineCap = defaultLineCap;
        }
        miterLimit = this.stroke_.getMiterLimit();
        if (miterLimit === undefined) {
          miterLimit = defaultMiterLimit;
        }
      }

      var size = 2 * (this.radius_ + strokeWidth) + 1;

      /** @type {RenderOptions} */
      var renderOptions = {
        strokeStyle: strokeStyle,
        strokeWidth: strokeWidth,
        size: size,
        lineCap: lineCap,
        lineDash: lineDash,
        lineDashOffset: lineDashOffset,
        lineJoin: lineJoin,
        miterLimit: miterLimit
      };

      if (atlasManager === undefined) {
        // no atlas manager is used, create a new canvas
        var context = createCanvasContext2D(size, size);
        this.canvas_ = context.canvas;

        // canvas.width and height are rounded to the closest integer
        size = this.canvas_.width;
        imageSize = size;

        this.draw_(renderOptions, context, 0, 0);

        this.createHitDetectionCanvas_(renderOptions);
      } else {
        // an atlas manager is used, add the symbol to an atlas
        size = Math.round(size);

        var hasCustomHitDetectionImage = !this.fill_;
        var renderHitDetectionCallback;
        if (hasCustomHitDetectionImage) {
          // render the hit-detection image into a separate atlas image
          renderHitDetectionCallback =
              this.drawHitDetectionCanvas_.bind(this, renderOptions);
        }

        var id = this.getChecksum();
        var info = atlasManager.add(
          id, size, size, this.draw_.bind(this, renderOptions),
          renderHitDetectionCallback);

        this.canvas_ = info.image;
        this.origin_ = [info.offsetX, info.offsetY];
        imageSize = info.image.width;

        if (hasCustomHitDetectionImage) {
          this.hitDetectionCanvas_ = info.hitImage;
          this.hitDetectionImageSize_ =
              [info.hitImage.width, info.hitImage.height];
        } else {
          this.hitDetectionCanvas_ = this.canvas_;
          this.hitDetectionImageSize_ = [imageSize, imageSize];
        }
      }

      this.anchor_ = [size / 2, size / 2];
      this.size_ = [size, size];
      this.imageSize_ = [imageSize, imageSize];
    };

    /**
     * @private
     * @param {RenderOptions} renderOptions Render options.
     * @param {CanvasRenderingContext2D} context The rendering context.
     * @param {number} x The origin for the symbol (x).
     * @param {number} y The origin for the symbol (y).
     */
    RegularShape.prototype.draw_ = function draw_ (renderOptions, context, x, y) {
      var i, angle0, radiusC;
      // reset transform
      context.setTransform(1, 0, 0, 1, 0, 0);

      // then move to (x, y)
      context.translate(x, y);

      context.beginPath();

      var points = this.points_;
      if (points === Infinity) {
        context.arc(
          renderOptions.size / 2, renderOptions.size / 2,
          this.radius_, 0, 2 * Math.PI, true);
      } else {
        var radius2 = (this.radius2_ !== undefined) ? this.radius2_
          : this.radius_;
        if (radius2 !== this.radius_) {
          points = 2 * points;
        }
        for (i = 0; i <= points; i++) {
          angle0 = i * 2 * Math.PI / points - Math.PI / 2 + this.angle_;
          radiusC = i % 2 === 0 ? this.radius_ : radius2;
          context.lineTo(renderOptions.size / 2 + radiusC * Math.cos(angle0),
            renderOptions.size / 2 + radiusC * Math.sin(angle0));
        }
      }


      if (this.fill_) {
        var color = this.fill_.getColor();
        if (color === null) {
          color = defaultFillStyle;
        }
        context.fillStyle = asColorLike(color);
        context.fill();
      }
      if (this.stroke_) {
        context.strokeStyle = renderOptions.strokeStyle;
        context.lineWidth = renderOptions.strokeWidth;
        if (renderOptions.lineDash) {
          context.setLineDash(renderOptions.lineDash);
          context.lineDashOffset = renderOptions.lineDashOffset;
        }
        context.lineCap = /** @type {CanvasLineCap} */ (renderOptions.lineCap);
        context.lineJoin = /** @type {CanvasLineJoin} */ (renderOptions.lineJoin);
        context.miterLimit = renderOptions.miterLimit;
        context.stroke();
      }
      context.closePath();
    };

    /**
     * @private
     * @param {RenderOptions} renderOptions Render options.
     */
    RegularShape.prototype.createHitDetectionCanvas_ = function createHitDetectionCanvas_ (renderOptions) {
      this.hitDetectionImageSize_ = [renderOptions.size, renderOptions.size];
      if (this.fill_) {
        this.hitDetectionCanvas_ = this.canvas_;
        return;
      }

      // if no fill style is set, create an extra hit-detection image with a
      // default fill style
      var context = createCanvasContext2D(renderOptions.size, renderOptions.size);
      this.hitDetectionCanvas_ = context.canvas;

      this.drawHitDetectionCanvas_(renderOptions, context, 0, 0);
    };

    /**
     * @private
     * @param {RenderOptions} renderOptions Render options.
     * @param {CanvasRenderingContext2D} context The context.
     * @param {number} x The origin for the symbol (x).
     * @param {number} y The origin for the symbol (y).
     */
    RegularShape.prototype.drawHitDetectionCanvas_ = function drawHitDetectionCanvas_ (renderOptions, context, x, y) {
      // reset transform
      context.setTransform(1, 0, 0, 1, 0, 0);

      // then move to (x, y)
      context.translate(x, y);

      context.beginPath();

      var points = this.points_;
      if (points === Infinity) {
        context.arc(
          renderOptions.size / 2, renderOptions.size / 2,
          this.radius_, 0, 2 * Math.PI, true);
      } else {
        var radius2 = (this.radius2_ !== undefined) ? this.radius2_
          : this.radius_;
        if (radius2 !== this.radius_) {
          points = 2 * points;
        }
        var i, radiusC, angle0;
        for (i = 0; i <= points; i++) {
          angle0 = i * 2 * Math.PI / points - Math.PI / 2 + this.angle_;
          radiusC = i % 2 === 0 ? this.radius_ : radius2;
          context.lineTo(renderOptions.size / 2 + radiusC * Math.cos(angle0),
            renderOptions.size / 2 + radiusC * Math.sin(angle0));
        }
      }

      context.fillStyle = asString(defaultFillStyle);
      context.fill();
      if (this.stroke_) {
        context.strokeStyle = renderOptions.strokeStyle;
        context.lineWidth = renderOptions.strokeWidth;
        if (renderOptions.lineDash) {
          context.setLineDash(renderOptions.lineDash);
          context.lineDashOffset = renderOptions.lineDashOffset;
        }
        context.stroke();
      }
      context.closePath();
    };

    /**
     * @return {string} The checksum.
     */
    RegularShape.prototype.getChecksum = function getChecksum () {
      var strokeChecksum = this.stroke_ ?
        this.stroke_.getChecksum() : '-';
      var fillChecksum = this.fill_ ?
        this.fill_.getChecksum() : '-';

      var recalculate = !this.checksums_ ||
          (strokeChecksum != this.checksums_[1] ||
          fillChecksum != this.checksums_[2] ||
          this.radius_ != this.checksums_[3] ||
          this.radius2_ != this.checksums_[4] ||
          this.angle_ != this.checksums_[5] ||
          this.points_ != this.checksums_[6]);

      if (recalculate) {
        var checksum = 'r' + strokeChecksum + fillChecksum +
            (this.radius_ !== undefined ? this.radius_.toString() : '-') +
            (this.radius2_ !== undefined ? this.radius2_.toString() : '-') +
            (this.angle_ !== undefined ? this.angle_.toString() : '-') +
            (this.points_ !== undefined ? this.points_.toString() : '-');
        this.checksums_ = [checksum, strokeChecksum, fillChecksum,
          this.radius_, this.radius2_, this.angle_, this.points_];
      }

      return /** @type {string} */ (this.checksums_[0]);
    };

    return RegularShape;
  }(ImageStyle));

  /**
   * @module ol/style/Circle
   */


  /**
   * @typedef {Object} Options
   * @property {import("./Fill.js").default} [fill] Fill style.
   * @property {number} radius Circle radius.
   * @property {import("./Stroke.js").default} [stroke] Stroke style.
   * @property {import("./AtlasManager.js").default} [atlasManager] The atlas manager to use for this circle.
   * When using WebGL it is recommended to use an atlas manager to avoid texture switching. If an atlas manager is given,
   * the circle is added to an atlas. By default no atlas manager is used.
   */


  /**
   * @classdesc
   * Set circle style for vector features.
   * @api
   */
  var CircleStyle = /*@__PURE__*/(function (RegularShape) {
    function CircleStyle(opt_options) {

      var options = opt_options || /** @type {Options} */ ({});

      RegularShape.call(this, {
        points: Infinity,
        fill: options.fill,
        radius: options.radius,
        stroke: options.stroke,
        atlasManager: options.atlasManager
      });

    }

    if ( RegularShape ) CircleStyle.__proto__ = RegularShape;
    CircleStyle.prototype = Object.create( RegularShape && RegularShape.prototype );
    CircleStyle.prototype.constructor = CircleStyle;

    /**
    * Clones the style.  If an atlasmanager was provided to the original style it will be used in the cloned style, too.
    * @return {CircleStyle} The cloned style.
    * @override
    * @api
    */
    CircleStyle.prototype.clone = function clone () {
      var style = new CircleStyle({
        fill: this.getFill() ? this.getFill().clone() : undefined,
        stroke: this.getStroke() ? this.getStroke().clone() : undefined,
        radius: this.getRadius(),
        atlasManager: this.atlasManager_
      });
      style.setOpacity(this.getOpacity());
      style.setScale(this.getScale());
      return style;
    };

    /**
    * Set the circle radius.
    *
    * @param {number} radius Circle radius.
    * @api
    */
    CircleStyle.prototype.setRadius = function setRadius (radius) {
      this.radius_ = radius;
      this.render_(this.atlasManager_);
    };

    return CircleStyle;
  }(RegularShape));

  /**
   * @module ol/style/Fill
   */


  /**
   * @typedef {Object} Options
   * @property {import("../color.js").Color|import("../colorlike.js").ColorLike} [color] A color, gradient or pattern.
   * See {@link module:ol/color~Color} and {@link module:ol/colorlike~ColorLike} for possible formats.
   * Default null; if null, the Canvas/renderer default black will be used.
   */


  /**
   * @classdesc
   * Set fill style for vector features.
   * @api
   */
  var Fill = function Fill(opt_options) {

    var options = opt_options || {};

    /**
     * @private
     * @type {import("../color.js").Color|import("../colorlike.js").ColorLike}
     */
    this.color_ = options.color !== undefined ? options.color : null;

    /**
     * @private
     * @type {string|undefined}
     */
    this.checksum_ = undefined;
  };

  /**
   * Clones the style. The color is not cloned if it is an {@link module:ol/colorlike~ColorLike}.
   * @return {Fill} The cloned style.
   * @api
   */
  Fill.prototype.clone = function clone () {
    var color = this.getColor();
    return new Fill({
      color: Array.isArray(color) ? color.slice() : color || undefined
    });
  };

  /**
   * Get the fill color.
   * @return {import("../color.js").Color|import("../colorlike.js").ColorLike} Color.
   * @api
   */
  Fill.prototype.getColor = function getColor () {
    return this.color_;
  };

  /**
   * Set the color.
   *
   * @param {import("../color.js").Color|import("../colorlike.js").ColorLike} color Color.
   * @api
   */
  Fill.prototype.setColor = function setColor (color) {
    this.color_ = color;
    this.checksum_ = undefined;
  };

  /**
   * @return {string} The checksum.
   */
  Fill.prototype.getChecksum = function getChecksum () {
    if (this.checksum_ === undefined) {
      var color = this.color_;
      if (color) {
        if (Array.isArray(color) || typeof color == 'string') {
          this.checksum_ = 'f' + asString(/** @type {import("../color.js").Color|string} */ (color));
        } else {
          this.checksum_ = getUid(this.color_);
        }
      } else {
        this.checksum_ = 'f-';
      }
    }

    return this.checksum_;
  };

  /**
   * @module ol/style/Stroke
   */


  /**
   * @typedef {Object} Options
   * @property {import("../color.js").Color|import("../colorlike.js").ColorLike} [color] A color, gradient or pattern.
   * See {@link module:ol/color~Color} and {@link module:ol/colorlike~ColorLike} for possible formats.
   * Default null; if null, the Canvas/renderer default black will be used.
   * @property {string} [lineCap='round'] Line cap style: `butt`, `round`, or `square`.
   * @property {string} [lineJoin='round'] Line join style: `bevel`, `round`, or `miter`.
   * @property {Array<number>} [lineDash] Line dash pattern. Default is `undefined` (no dash).
   * Please note that Internet Explorer 10 and lower do not support the `setLineDash` method on
   * the `CanvasRenderingContext2D` and therefore this option will have no visual effect in these browsers.
   * @property {number} [lineDashOffset=0] Line dash offset.
   * @property {number} [miterLimit=10] Miter limit.
   * @property {number} [width] Width.
   */


  /**
   * @classdesc
   * Set stroke style for vector features.
   * Note that the defaults given are the Canvas defaults, which will be used if
   * option is not defined. The `get` functions return whatever was entered in
   * the options; they will not return the default.
   * @api
   */
  var Stroke = function Stroke(opt_options) {

    var options = opt_options || {};

    /**
     * @private
     * @type {import("../color.js").Color|import("../colorlike.js").ColorLike}
     */
    this.color_ = options.color !== undefined ? options.color : null;

    /**
     * @private
     * @type {string|undefined}
     */
    this.lineCap_ = options.lineCap;

    /**
     * @private
     * @type {Array<number>}
     */
    this.lineDash_ = options.lineDash !== undefined ? options.lineDash : null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.lineDashOffset_ = options.lineDashOffset;

    /**
     * @private
     * @type {string|undefined}
     */
    this.lineJoin_ = options.lineJoin;

    /**
     * @private
     * @type {number|undefined}
     */
    this.miterLimit_ = options.miterLimit;

    /**
     * @private
     * @type {number|undefined}
     */
    this.width_ = options.width;

    /**
     * @private
     * @type {string|undefined}
     */
    this.checksum_ = undefined;
  };

  /**
   * Clones the style.
   * @return {Stroke} The cloned style.
   * @api
   */
  Stroke.prototype.clone = function clone () {
    var color = this.getColor();
    return new Stroke({
      color: Array.isArray(color) ? color.slice() : color || undefined,
      lineCap: this.getLineCap(),
      lineDash: this.getLineDash() ? this.getLineDash().slice() : undefined,
      lineDashOffset: this.getLineDashOffset(),
      lineJoin: this.getLineJoin(),
      miterLimit: this.getMiterLimit(),
      width: this.getWidth()
    });
  };

  /**
   * Get the stroke color.
   * @return {import("../color.js").Color|import("../colorlike.js").ColorLike} Color.
   * @api
   */
  Stroke.prototype.getColor = function getColor () {
    return this.color_;
  };

  /**
   * Get the line cap type for the stroke.
   * @return {string|undefined} Line cap.
   * @api
   */
  Stroke.prototype.getLineCap = function getLineCap () {
    return this.lineCap_;
  };

  /**
   * Get the line dash style for the stroke.
   * @return {Array<number>} Line dash.
   * @api
   */
  Stroke.prototype.getLineDash = function getLineDash () {
    return this.lineDash_;
  };

  /**
   * Get the line dash offset for the stroke.
   * @return {number|undefined} Line dash offset.
   * @api
   */
  Stroke.prototype.getLineDashOffset = function getLineDashOffset () {
    return this.lineDashOffset_;
  };

  /**
   * Get the line join type for the stroke.
   * @return {string|undefined} Line join.
   * @api
   */
  Stroke.prototype.getLineJoin = function getLineJoin () {
    return this.lineJoin_;
  };

  /**
   * Get the miter limit for the stroke.
   * @return {number|undefined} Miter limit.
   * @api
   */
  Stroke.prototype.getMiterLimit = function getMiterLimit () {
    return this.miterLimit_;
  };

  /**
   * Get the stroke width.
   * @return {number|undefined} Width.
   * @api
   */
  Stroke.prototype.getWidth = function getWidth () {
    return this.width_;
  };

  /**
   * Set the color.
   *
   * @param {import("../color.js").Color|import("../colorlike.js").ColorLike} color Color.
   * @api
   */
  Stroke.prototype.setColor = function setColor (color) {
    this.color_ = color;
    this.checksum_ = undefined;
  };

  /**
   * Set the line cap.
   *
   * @param {string|undefined} lineCap Line cap.
   * @api
   */
  Stroke.prototype.setLineCap = function setLineCap (lineCap) {
    this.lineCap_ = lineCap;
    this.checksum_ = undefined;
  };

  /**
   * Set the line dash.
   *
   * Please note that Internet Explorer 10 and lower [do not support][mdn] the
   * `setLineDash` method on the `CanvasRenderingContext2D` and therefore this
   * property will have no visual effect in these browsers.
   *
   * [mdn]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility
   *
   * @param {Array<number>} lineDash Line dash.
   * @api
   */
  Stroke.prototype.setLineDash = function setLineDash (lineDash) {
    this.lineDash_ = lineDash;
    this.checksum_ = undefined;
  };

  /**
   * Set the line dash offset.
   *
   * @param {number|undefined} lineDashOffset Line dash offset.
   * @api
   */
  Stroke.prototype.setLineDashOffset = function setLineDashOffset (lineDashOffset) {
    this.lineDashOffset_ = lineDashOffset;
    this.checksum_ = undefined;
  };

  /**
   * Set the line join.
   *
   * @param {string|undefined} lineJoin Line join.
   * @api
   */
  Stroke.prototype.setLineJoin = function setLineJoin (lineJoin) {
    this.lineJoin_ = lineJoin;
    this.checksum_ = undefined;
  };

  /**
   * Set the miter limit.
   *
   * @param {number|undefined} miterLimit Miter limit.
   * @api
   */
  Stroke.prototype.setMiterLimit = function setMiterLimit (miterLimit) {
    this.miterLimit_ = miterLimit;
    this.checksum_ = undefined;
  };

  /**
   * Set the width.
   *
   * @param {number|undefined} width Width.
   * @api
   */
  Stroke.prototype.setWidth = function setWidth (width) {
    this.width_ = width;
    this.checksum_ = undefined;
  };

  /**
   * @return {string} The checksum.
   */
  Stroke.prototype.getChecksum = function getChecksum () {
    if (this.checksum_ === undefined) {
      this.checksum_ = 's';
      if (this.color_) {
        if (typeof this.color_ === 'string') {
          this.checksum_ += this.color_;
        } else {
          this.checksum_ += getUid(this.color_);
        }
      } else {
        this.checksum_ += '-';
      }
      this.checksum_ += ',' +
          (this.lineCap_ !== undefined ?
            this.lineCap_.toString() : '-') + ',' +
          (this.lineDash_ ?
            this.lineDash_.toString() : '-') + ',' +
          (this.lineDashOffset_ !== undefined ?
            this.lineDashOffset_ : '-') + ',' +
          (this.lineJoin_ !== undefined ?
            this.lineJoin_ : '-') + ',' +
          (this.miterLimit_ !== undefined ?
            this.miterLimit_.toString() : '-') + ',' +
          (this.width_ !== undefined ?
            this.width_.toString() : '-');
    }

    return this.checksum_;
  };

  /**
   * @module ol/style/Style
   */


  /**
   * A function that takes an {@link module:ol/Feature} and a `{number}`
   * representing the view's resolution. The function should return a
   * {@link module:ol/style/Style} or an array of them. This way e.g. a
   * vector layer can be styled.
   *
   * @typedef {function(import("../Feature.js").FeatureLike, number):(Style|Array<Style>)} StyleFunction
   */

  /**
   * A {@link Style}, an array of {@link Style}, or a {@link StyleFunction}.
   * @typedef {Style|Array<Style>|StyleFunction} StyleLike
   */

  /**
   * A function that takes an {@link module:ol/Feature} as argument and returns an
   * {@link module:ol/geom/Geometry} that will be rendered and styled for the feature.
   *
   * @typedef {function(import("../Feature.js").FeatureLike):
   *     (import("../geom/Geometry.js").default|import("../render/Feature.js").default|undefined)} GeometryFunction
   */


  /**
   * Custom renderer function. Takes two arguments:
   *
   * 1. The pixel coordinates of the geometry in GeoJSON notation.
   * 2. The {@link module:ol/render~State} of the layer renderer.
   *
   * @typedef {function((import("../coordinate.js").Coordinate|Array<import("../coordinate.js").Coordinate>|Array<Array<import("../coordinate.js").Coordinate>>),import("../render.js").State)}
   * RenderFunction
   */


  /**
   * @typedef {Object} Options
   * @property {string|import("../geom/Geometry.js").default|GeometryFunction} [geometry] Feature property or geometry
   * or function returning a geometry to render for this style.
   * @property {import("./Fill.js").default} [fill] Fill style.
   * @property {import("./Image.js").default} [image] Image style.
   * @property {RenderFunction} [renderer] Custom renderer. When configured, `fill`, `stroke` and `image` will be
   * ignored, and the provided function will be called with each render frame for each geometry.
   * @property {import("./Stroke.js").default} [stroke] Stroke style.
   * @property {import("./Text.js").default} [text] Text style.
   * @property {number} [zIndex] Z index.
   */

  /**
   * @classdesc
   * Container for vector feature rendering styles. Any changes made to the style
   * or its children through `set*()` methods will not take effect until the
   * feature or layer that uses the style is re-rendered.
   * @api
   */
  var Style = function Style(opt_options) {

    var options = opt_options || {};

    /**
     * @private
     * @type {string|import("../geom/Geometry.js").default|GeometryFunction}
     */
    this.geometry_ = null;

    /**
     * @private
     * @type {!GeometryFunction}
     */
    this.geometryFunction_ = defaultGeometryFunction;

    if (options.geometry !== undefined) {
      this.setGeometry(options.geometry);
    }

    /**
     * @private
     * @type {import("./Fill.js").default}
     */
    this.fill_ = options.fill !== undefined ? options.fill : null;

    /**
       * @private
       * @type {import("./Image.js").default}
       */
    this.image_ = options.image !== undefined ? options.image : null;

    /**
     * @private
     * @type {RenderFunction|null}
     */
    this.renderer_ = options.renderer !== undefined ? options.renderer : null;

    /**
     * @private
     * @type {import("./Stroke.js").default}
     */
    this.stroke_ = options.stroke !== undefined ? options.stroke : null;

    /**
     * @private
     * @type {import("./Text.js").default}
     */
    this.text_ = options.text !== undefined ? options.text : null;

    /**
     * @private
     * @type {number|undefined}
     */
    this.zIndex_ = options.zIndex;

  };

  /**
   * Clones the style.
   * @return {Style} The cloned style.
   * @api
   */
  Style.prototype.clone = function clone () {
    var geometry = this.getGeometry();
    if (geometry && typeof geometry === 'object') {
      geometry = /** @type {import("../geom/Geometry.js").default} */ (geometry).clone();
    }
    return new Style({
      geometry: geometry,
      fill: this.getFill() ? this.getFill().clone() : undefined,
      image: this.getImage() ? this.getImage().clone() : undefined,
      stroke: this.getStroke() ? this.getStroke().clone() : undefined,
      text: this.getText() ? this.getText().clone() : undefined,
      zIndex: this.getZIndex()
    });
  };

  /**
   * Get the custom renderer function that was configured with
   * {@link #setRenderer} or the `renderer` constructor option.
   * @return {RenderFunction|null} Custom renderer function.
   * @api
   */
  Style.prototype.getRenderer = function getRenderer () {
    return this.renderer_;
  };

  /**
   * Sets a custom renderer function for this style. When set, `fill`, `stroke`
   * and `image` options of the style will be ignored.
   * @param {RenderFunction|null} renderer Custom renderer function.
   * @api
   */
  Style.prototype.setRenderer = function setRenderer (renderer) {
    this.renderer_ = renderer;
  };

  /**
   * Get the geometry to be rendered.
   * @return {string|import("../geom/Geometry.js").default|GeometryFunction}
   * Feature property or geometry or function that returns the geometry that will
   * be rendered with this style.
   * @api
   */
  Style.prototype.getGeometry = function getGeometry () {
    return this.geometry_;
  };

  /**
   * Get the function used to generate a geometry for rendering.
   * @return {!GeometryFunction} Function that is called with a feature
   * and returns the geometry to render instead of the feature's geometry.
   * @api
   */
  Style.prototype.getGeometryFunction = function getGeometryFunction () {
    return this.geometryFunction_;
  };

  /**
   * Get the fill style.
   * @return {import("./Fill.js").default} Fill style.
   * @api
   */
  Style.prototype.getFill = function getFill () {
    return this.fill_;
  };

  /**
   * Set the fill style.
   * @param {import("./Fill.js").default} fill Fill style.
   * @api
   */
  Style.prototype.setFill = function setFill (fill) {
    this.fill_ = fill;
  };

  /**
   * Get the image style.
   * @return {import("./Image.js").default} Image style.
   * @api
   */
  Style.prototype.getImage = function getImage () {
    return this.image_;
  };

  /**
   * Set the image style.
   * @param {import("./Image.js").default} image Image style.
   * @api
   */
  Style.prototype.setImage = function setImage (image) {
    this.image_ = image;
  };

  /**
   * Get the stroke style.
   * @return {import("./Stroke.js").default} Stroke style.
   * @api
   */
  Style.prototype.getStroke = function getStroke () {
    return this.stroke_;
  };

  /**
   * Set the stroke style.
   * @param {import("./Stroke.js").default} stroke Stroke style.
   * @api
   */
  Style.prototype.setStroke = function setStroke (stroke) {
    this.stroke_ = stroke;
  };

  /**
   * Get the text style.
   * @return {import("./Text.js").default} Text style.
   * @api
   */
  Style.prototype.getText = function getText () {
    return this.text_;
  };

  /**
   * Set the text style.
   * @param {import("./Text.js").default} text Text style.
   * @api
   */
  Style.prototype.setText = function setText (text) {
    this.text_ = text;
  };

  /**
   * Get the z-index for the style.
   * @return {number|undefined} ZIndex.
   * @api
   */
  Style.prototype.getZIndex = function getZIndex () {
    return this.zIndex_;
  };

  /**
   * Set a geometry that is rendered instead of the feature's geometry.
   *
   * @param {string|import("../geom/Geometry.js").default|GeometryFunction} geometry
   *   Feature property or geometry or function returning a geometry to render
   *   for this style.
   * @api
   */
  Style.prototype.setGeometry = function setGeometry (geometry) {
    if (typeof geometry === 'function') {
      this.geometryFunction_ = geometry;
    } else if (typeof geometry === 'string') {
      this.geometryFunction_ = function(feature) {
        return (
          /** @type {import("../geom/Geometry.js").default} */ (feature.get(geometry))
        );
      };
    } else if (!geometry) {
      this.geometryFunction_ = defaultGeometryFunction;
    } else if (geometry !== undefined) {
      this.geometryFunction_ = function() {
        return (
          /** @type {import("../geom/Geometry.js").default} */ (geometry)
        );
      };
    }
    this.geometry_ = geometry;
  };

  /**
   * Set the z-index.
   *
   * @param {number|undefined} zIndex ZIndex.
   * @api
   */
  Style.prototype.setZIndex = function setZIndex (zIndex) {
    this.zIndex_ = zIndex;
  };


  /**
   * Convert the provided object into a style function.  Functions passed through
   * unchanged.  Arrays of Style or single style objects wrapped in a
   * new style function.
   * @param {StyleFunction|Array<Style>|Style} obj
   *     A style function, a single style, or an array of styles.
   * @return {StyleFunction} A style function.
   */
  function toFunction(obj) {
    var styleFunction;

    if (typeof obj === 'function') {
      styleFunction = obj;
    } else {
      /**
       * @type {Array<Style>}
       */
      var styles;
      if (Array.isArray(obj)) {
        styles = obj;
      } else {
        assert(typeof /** @type {?} */ (obj).getZIndex === 'function',
          41); // Expected an `Style` or an array of `Style`
        var style = /** @type {Style} */ (obj);
        styles = [style];
      }
      styleFunction = function() {
        return styles;
      };
    }
    return styleFunction;
  }


  /**
   * @type {Array<Style>}
   */
  var defaultStyles = null;


  /**
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   * @param {number} resolution Resolution.
   * @return {Array<Style>} Style.
   */
  function createDefaultStyle(feature, resolution) {
    // We don't use an immediately-invoked function
    // and a closure so we don't get an error at script evaluation time in
    // browsers that do not support Canvas. (import("./Circle.js").CircleStyle does
    // canvas.getContext('2d') at construction time, which will cause an.error
    // in such browsers.)
    if (!defaultStyles) {
      var fill = new Fill({
        color: 'rgba(255,255,255,0.4)'
      });
      var stroke = new Stroke({
        color: '#3399CC',
        width: 1.25
      });
      defaultStyles = [
        new Style({
          image: new CircleStyle({
            fill: fill,
            stroke: stroke,
            radius: 5
          }),
          fill: fill,
          stroke: stroke
        })
      ];
    }
    return defaultStyles;
  }


  /**
   * Function that is called with a feature and returns its default geometry.
   * @param {import("../Feature.js").FeatureLike} feature Feature to get the geometry for.
   * @return {import("../geom/Geometry.js").default|import("../render/Feature.js").default|undefined} Geometry to render.
   */
  function defaultGeometryFunction(feature) {
    return feature.getGeometry();
  }

  /**
   * @module ol/layer/Vector
   */


  /**
   * @typedef {Object} Options
   * @property {number} [opacity=1] Opacity (0, 1).
   * @property {boolean} [visible=true] Visibility.
   * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
   * rendered outside of this extent.
   * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
   * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
   * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
   * method was used.
   * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
   * visible.
   * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
   * be visible.
   * @property {import("../render.js").OrderFunction} [renderOrder] Render order. Function to be used when sorting
   * features before rendering. By default features are drawn in the order that they are created. Use
   * `null` to avoid the sort, but get an undefined draw order.
   * @property {number} [renderBuffer=100] The buffer in pixels around the viewport extent used by the
   * renderer when getting features from the vector source for the rendering or hit-detection.
   * Recommended value: the size of the largest symbol, line width or label.
   * @property {import("./VectorRenderType.js").default|string} [renderMode='vector'] Render mode for vector layers:
   *  * `'image'`: Vector layers are rendered as images. Great performance, but point symbols and
   *    texts are always rotated with the view and pixels are scaled during zoom animations.
   *  * `'vector'`: Vector layers are rendered as vectors. Most accurate rendering even during
   *    animations, but slower performance.
   * @property {import("../source/Vector.js").default} [source] Source.
   * @property {import("../PluggableMap.js").default} [map] Sets the layer as overlay on a map. The map will not manage
   * this layer in its layers collection, and the layer will be rendered on top. This is useful for
   * temporary layers. The standard way to add a layer to a map and have it managed by the map is to
   * use {@link module:ol/Map#addLayer}.
   * @property {boolean} [declutter=false] Declutter images and text. Decluttering is applied to all
   * image and text styles, and the priority is defined by the z-index of the style. Lower z-index
   * means higher priority.
   * @property {import("../style/Style.js").StyleLike} [style] Layer style. See
   * {@link module:ol/style} for default style which will be used if this is not defined.
   * @property {boolean} [updateWhileAnimating=false] When set to `true` and `renderMode`
   * is `vector`, feature batches will be recreated during animations. This means that no
   * vectors will be shown clipped, but the setting will have a performance impact for large
   * amounts of vector data. When set to `false`, batches will be recreated when no animation
   * is active.
   * @property {boolean} [updateWhileInteracting=false] When set to `true` and `renderMode`
   * is `vector`, feature batches will be recreated during interactions. See also
   * `updateWhileAnimating`.
   */


  /**
   * @enum {string}
   * @private
   */
  var Property$2 = {
    RENDER_ORDER: 'renderOrder'
  };


  /**
   * @classdesc
   * Vector data that is rendered client-side.
   * Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
   * property on the layer object; for example, setting `title: 'My Title'` in the
   * options means that `title` is observable, and has get/set accessors.
   *
   * @api
   */
  var VectorLayer = /*@__PURE__*/(function (Layer) {
    function VectorLayer(opt_options) {
      var options = opt_options ?
        opt_options : /** @type {Options} */ ({});

      var baseOptions = assign({}, options);

      delete baseOptions.style;
      delete baseOptions.renderBuffer;
      delete baseOptions.updateWhileAnimating;
      delete baseOptions.updateWhileInteracting;
      Layer.call(this, baseOptions);

      /**
      * @private
      * @type {boolean}
      */
      this.declutter_ = options.declutter !== undefined ? options.declutter : false;

      /**
      * @type {number}
      * @private
      */
      this.renderBuffer_ = options.renderBuffer !== undefined ?
        options.renderBuffer : 100;

      /**
      * User provided style.
      * @type {import("../style/Style.js").StyleLike}
      * @private
      */
      this.style_ = null;

      /**
      * Style function for use within the library.
      * @type {import("../style/Style.js").StyleFunction|undefined}
      * @private
      */
      this.styleFunction_ = undefined;

      this.setStyle(options.style);

      /**
      * @type {boolean}
      * @private
      */
      this.updateWhileAnimating_ = options.updateWhileAnimating !== undefined ?
        options.updateWhileAnimating : false;

      /**
      * @type {boolean}
      * @private
      */
      this.updateWhileInteracting_ = options.updateWhileInteracting !== undefined ?
        options.updateWhileInteracting : false;

      /**
      * @private
      * @type {import("./VectorTileRenderType.js").default|string}
      */
      this.renderMode_ = options.renderMode || VectorRenderType.VECTOR;

      /**
      * The layer type.
      * @protected
      * @type {import("../LayerType.js").default}
      */
      this.type = LayerType.VECTOR;

    }

    if ( Layer ) VectorLayer.__proto__ = Layer;
    VectorLayer.prototype = Object.create( Layer && Layer.prototype );
    VectorLayer.prototype.constructor = VectorLayer;

    /**
    * @return {boolean} Declutter.
    */
    VectorLayer.prototype.getDeclutter = function getDeclutter () {
      return this.declutter_;
    };

    /**
    * @param {boolean} declutter Declutter.
    */
    VectorLayer.prototype.setDeclutter = function setDeclutter (declutter) {
      this.declutter_ = declutter;
    };

    /**
    * @return {number|undefined} Render buffer.
    */
    VectorLayer.prototype.getRenderBuffer = function getRenderBuffer () {
      return this.renderBuffer_;
    };

    /**
    * @return {function(import("../Feature.js").default, import("../Feature.js").default): number|null|undefined} Render
    *     order.
    */
    VectorLayer.prototype.getRenderOrder = function getRenderOrder () {
      return (
      /** @type {import("../render.js").OrderFunction|null|undefined} */ (this.get(Property$2.RENDER_ORDER))
      );
    };

    /**
    * Get the style for features.  This returns whatever was passed to the `style`
    * option at construction or to the `setStyle` method.
    * @return {import("../style/Style.js").StyleLike}
    *     Layer style.
    * @api
    */
    VectorLayer.prototype.getStyle = function getStyle () {
      return this.style_;
    };

    /**
    * Get the style function.
    * @return {import("../style/Style.js").StyleFunction|undefined} Layer style function.
    * @api
    */
    VectorLayer.prototype.getStyleFunction = function getStyleFunction () {
      return this.styleFunction_;
    };

    /**
    * @return {boolean} Whether the rendered layer should be updated while
    *     animating.
    */
    VectorLayer.prototype.getUpdateWhileAnimating = function getUpdateWhileAnimating () {
      return this.updateWhileAnimating_;
    };

    /**
    * @return {boolean} Whether the rendered layer should be updated while
    *     interacting.
    */
    VectorLayer.prototype.getUpdateWhileInteracting = function getUpdateWhileInteracting () {
      return this.updateWhileInteracting_;
    };

    /**
    * @param {import("../render.js").OrderFunction|null|undefined} renderOrder
    *     Render order.
    */
    VectorLayer.prototype.setRenderOrder = function setRenderOrder (renderOrder) {
      this.set(Property$2.RENDER_ORDER, renderOrder);
    };

    /**
    * Set the style for features.  This can be a single style object, an array
    * of styles, or a function that takes a feature and resolution and returns
    * an array of styles. If it is `undefined` the default style is used. If
    * it is `null` the layer has no style (a `null` style), so only features
    * that have their own styles will be rendered in the layer. See
    * {@link module:ol/style} for information on the default style.
    * @param {import("../style/Style.js").default|Array<import("../style/Style.js").default>|import("../style/Style.js").StyleFunction|null|undefined} style Layer style.
    * @api
    */
    VectorLayer.prototype.setStyle = function setStyle (style) {
      this.style_ = style !== undefined ? style : createDefaultStyle;
      this.styleFunction_ = style === null ?
        undefined : toFunction(this.style_);
      this.changed();
    };

    /**
    * @return {import("./VectorRenderType.js").default|string} The render mode.
    */
    VectorLayer.prototype.getRenderMode = function getRenderMode () {
      return this.renderMode_;
    };

    return VectorLayer;
  }(Layer));


  /**
   * Return the associated {@link module:ol/source/Vector vectorsource} of the layer.
   * @function
   * @return {import("../source/Vector.js").default} Source.
   * @api
   */
  VectorLayer.prototype.getSource;

  /**
   * @module ol/format/FormatType
   */

  /**
   * @module ol/featureloader
   */

  /**
   * @module ol/loadingstrategy
   */

  /**
   * @module ol/source/Source
   */


  /**
   * A function that returns a string or an array of strings representing source
   * attributions.
   *
   * @typedef {function(import("../PluggableMap.js").FrameState): (string|Array<string>)} Attribution
   */


  /**
   * A type that can be used to provide attribution information for data sources.
   *
   * It represents either
   * * a simple string (e.g. `'© Acme Inc.'`)
   * * an array of simple strings (e.g. `['© Acme Inc.', '© Bacme Inc.']`)
   * * a function that returns a string or array of strings (`{@link module:ol/source/Source~Attribution}`)
   *
   * @typedef {string|Array<string>|Attribution} AttributionLike
   */


  /**
   * @typedef {Object} Options
   * @property {AttributionLike} [attributions]
   * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
   * @property {import("../proj.js").ProjectionLike} projection
   * @property {SourceState} [state='ready']
   * @property {boolean} [wrapX=false]
   */


  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * Base class for {@link module:ol/layer/Layer~Layer} sources.
   *
   * A generic `change` event is triggered when the state of the source changes.
   * @abstract
   * @api
   */
  var Source = /*@__PURE__*/(function (BaseObject) {
    function Source(options) {

      BaseObject.call(this);

      /**
       * @private
       * @type {import("../proj/Projection.js").default}
       */
      this.projection_ = get$2(options.projection);

      /**
       * @private
       * @type {?Attribution}
       */
      this.attributions_ = adaptAttributions(options.attributions);

      /**
       * @private
       * @type {boolean}
       */
      this.attributionsCollapsible_ = options.attributionsCollapsible !== undefined ?
        options.attributionsCollapsible : true;

      /**
       * This source is currently loading data. Sources that defer loading to the
       * map's tile queue never set this to `true`.
       * @type {boolean}
       */
      this.loading = false;

      /**
       * @private
       * @type {SourceState}
       */
      this.state_ = options.state !== undefined ?
        options.state : SourceState.READY;

      /**
       * @private
       * @type {boolean}
       */
      this.wrapX_ = options.wrapX !== undefined ? options.wrapX : false;

    }

    if ( BaseObject ) Source.__proto__ = BaseObject;
    Source.prototype = Object.create( BaseObject && BaseObject.prototype );
    Source.prototype.constructor = Source;

    /**
     * Get the attribution function for the source.
     * @return {?Attribution} Attribution function.
     */
    Source.prototype.getAttributions = function getAttributions () {
      return this.attributions_;
    };

    /**
     * @return {boolean} Aattributions are collapsible.
     */
    Source.prototype.getAttributionsCollapsible = function getAttributionsCollapsible () {
      return this.attributionsCollapsible_;
    };

    /**
     * Get the projection of the source.
     * @return {import("../proj/Projection.js").default} Projection.
     * @api
     */
    Source.prototype.getProjection = function getProjection () {
      return this.projection_;
    };

    /**
     * @abstract
     * @return {Array<number>|undefined} Resolutions.
     */
    Source.prototype.getResolutions = function getResolutions () {
      return abstract();
    };

    /**
     * Get the state of the source, see {@link module:ol/source/State~State} for possible states.
     * @return {SourceState} State.
     * @api
     */
    Source.prototype.getState = function getState () {
      return this.state_;
    };

    /**
     * @return {boolean|undefined} Wrap X.
     */
    Source.prototype.getWrapX = function getWrapX () {
      return this.wrapX_;
    };

    /**
     * Refreshes the source and finally dispatches a 'change' event.
     * @api
     */
    Source.prototype.refresh = function refresh () {
      this.changed();
    };

    /**
     * Set the attributions of the source.
     * @param {AttributionLike|undefined} attributions Attributions.
     *     Can be passed as `string`, `Array<string>`, `{@link module:ol/source/Source~Attribution}`,
     *     or `undefined`.
     * @api
     */
    Source.prototype.setAttributions = function setAttributions (attributions) {
      this.attributions_ = adaptAttributions(attributions);
      this.changed();
    };

    /**
     * Set the state of the source.
     * @param {SourceState} state State.
     * @protected
     */
    Source.prototype.setState = function setState (state) {
      this.state_ = state;
      this.changed();
    };

    return Source;
  }(BaseObject));


  /**
   * Turns the attributions option into an attributions function.
   * @param {AttributionLike|undefined} attributionLike The attribution option.
   * @return {?Attribution} An attribution function (or null).
   */
  function adaptAttributions(attributionLike) {
    if (!attributionLike) {
      return null;
    }
    if (Array.isArray(attributionLike)) {
      return function(frameState) {
        return attributionLike;
      };
    }

    if (typeof attributionLike === 'function') {
      return attributionLike;
    }

    return function(frameState) {
      return [attributionLike];
    };
  }

  /**
   * @module ol/source/VectorEventType
   */

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var quickselect = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
  	module.exports = factory();
  }(commonjsGlobal, (function () {
  function quickselect(arr, k, left, right, compare) {
      quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
  }

  function quickselectStep(arr, k, left, right, compare) {

      while (right > left) {
          if (right - left > 600) {
              var n = right - left + 1;
              var m = k - left + 1;
              var z = Math.log(n);
              var s = 0.5 * Math.exp(2 * z / 3);
              var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
              var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
              var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
              quickselectStep(arr, k, newLeft, newRight, compare);
          }

          var t = arr[k];
          var i = left;
          var j = right;

          swap(arr, left, k);
          if (compare(arr[right], t) > 0) swap(arr, left, right);

          while (i < j) {
              swap(arr, i, j);
              i++;
              j--;
              while (compare(arr[i], t) < 0) i++;
              while (compare(arr[j], t) > 0) j--;
          }

          if (compare(arr[left], t) === 0) swap(arr, left, j);
          else {
              j++;
              swap(arr, j, right);
          }

          if (j <= k) left = j + 1;
          if (k <= j) right = j - 1;
      }
  }

  function swap(arr, i, j) {
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
  }

  function defaultCompare(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
  }

  return quickselect;

  })));
  });

  var rbush_1 = rbush;
  var default_1 = rbush;



  function rbush(maxEntries, format) {
      if (!(this instanceof rbush)) return new rbush(maxEntries, format);

      // max entries in a node is 9 by default; min node fill is 40% for best performance
      this._maxEntries = Math.max(4, maxEntries || 9);
      this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));

      if (format) {
          this._initFormat(format);
      }

      this.clear();
  }

  rbush.prototype = {

      all: function () {
          return this._all(this.data, []);
      },

      search: function (bbox) {

          var node = this.data,
              result = [],
              toBBox = this.toBBox;

          if (!intersects$1(bbox, node)) return result;

          var nodesToSearch = [],
              i, len, child, childBBox;

          while (node) {
              for (i = 0, len = node.children.length; i < len; i++) {

                  child = node.children[i];
                  childBBox = node.leaf ? toBBox(child) : child;

                  if (intersects$1(bbox, childBBox)) {
                      if (node.leaf) result.push(child);
                      else if (contains(bbox, childBBox)) this._all(child, result);
                      else nodesToSearch.push(child);
                  }
              }
              node = nodesToSearch.pop();
          }

          return result;
      },

      collides: function (bbox) {

          var node = this.data,
              toBBox = this.toBBox;

          if (!intersects$1(bbox, node)) return false;

          var nodesToSearch = [],
              i, len, child, childBBox;

          while (node) {
              for (i = 0, len = node.children.length; i < len; i++) {

                  child = node.children[i];
                  childBBox = node.leaf ? toBBox(child) : child;

                  if (intersects$1(bbox, childBBox)) {
                      if (node.leaf || contains(bbox, childBBox)) return true;
                      nodesToSearch.push(child);
                  }
              }
              node = nodesToSearch.pop();
          }

          return false;
      },

      load: function (data) {
          if (!(data && data.length)) return this;

          if (data.length < this._minEntries) {
              for (var i = 0, len = data.length; i < len; i++) {
                  this.insert(data[i]);
              }
              return this;
          }

          // recursively build the tree with the given data from scratch using OMT algorithm
          var node = this._build(data.slice(), 0, data.length - 1, 0);

          if (!this.data.children.length) {
              // save as is if tree is empty
              this.data = node;

          } else if (this.data.height === node.height) {
              // split root if trees have the same height
              this._splitRoot(this.data, node);

          } else {
              if (this.data.height < node.height) {
                  // swap trees if inserted one is bigger
                  var tmpNode = this.data;
                  this.data = node;
                  node = tmpNode;
              }

              // insert the small tree into the large tree at appropriate level
              this._insert(node, this.data.height - node.height - 1, true);
          }

          return this;
      },

      insert: function (item) {
          if (item) this._insert(item, this.data.height - 1);
          return this;
      },

      clear: function () {
          this.data = createNode([]);
          return this;
      },

      remove: function (item, equalsFn) {
          if (!item) return this;

          var node = this.data,
              bbox = this.toBBox(item),
              path = [],
              indexes = [],
              i, parent, index, goingUp;

          // depth-first iterative tree traversal
          while (node || path.length) {

              if (!node) { // go up
                  node = path.pop();
                  parent = path[path.length - 1];
                  i = indexes.pop();
                  goingUp = true;
              }

              if (node.leaf) { // check current node
                  index = findItem(item, node.children, equalsFn);

                  if (index !== -1) {
                      // item found, remove the item and condense tree upwards
                      node.children.splice(index, 1);
                      path.push(node);
                      this._condense(path);
                      return this;
                  }
              }

              if (!goingUp && !node.leaf && contains(node, bbox)) { // go down
                  path.push(node);
                  indexes.push(i);
                  i = 0;
                  parent = node;
                  node = node.children[0];

              } else if (parent) { // go right
                  i++;
                  node = parent.children[i];
                  goingUp = false;

              } else node = null; // nothing found
          }

          return this;
      },

      toBBox: function (item) { return item; },

      compareMinX: compareNodeMinX,
      compareMinY: compareNodeMinY,

      toJSON: function () { return this.data; },

      fromJSON: function (data) {
          this.data = data;
          return this;
      },

      _all: function (node, result) {
          var nodesToSearch = [];
          while (node) {
              if (node.leaf) result.push.apply(result, node.children);
              else nodesToSearch.push.apply(nodesToSearch, node.children);

              node = nodesToSearch.pop();
          }
          return result;
      },

      _build: function (items, left, right, height) {

          var N = right - left + 1,
              M = this._maxEntries,
              node;

          if (N <= M) {
              // reached leaf level; return leaf
              node = createNode(items.slice(left, right + 1));
              calcBBox(node, this.toBBox);
              return node;
          }

          if (!height) {
              // target height of the bulk-loaded tree
              height = Math.ceil(Math.log(N) / Math.log(M));

              // target number of root entries to maximize storage utilization
              M = Math.ceil(N / Math.pow(M, height - 1));
          }

          node = createNode([]);
          node.leaf = false;
          node.height = height;

          // split the items into M mostly square tiles

          var N2 = Math.ceil(N / M),
              N1 = N2 * Math.ceil(Math.sqrt(M)),
              i, j, right2, right3;

          multiSelect(items, left, right, N1, this.compareMinX);

          for (i = left; i <= right; i += N1) {

              right2 = Math.min(i + N1 - 1, right);

              multiSelect(items, i, right2, N2, this.compareMinY);

              for (j = i; j <= right2; j += N2) {

                  right3 = Math.min(j + N2 - 1, right2);

                  // pack each entry recursively
                  node.children.push(this._build(items, j, right3, height - 1));
              }
          }

          calcBBox(node, this.toBBox);

          return node;
      },

      _chooseSubtree: function (bbox, node, level, path) {

          var i, len, child, targetNode, area, enlargement, minArea, minEnlargement;

          while (true) {
              path.push(node);

              if (node.leaf || path.length - 1 === level) break;

              minArea = minEnlargement = Infinity;

              for (i = 0, len = node.children.length; i < len; i++) {
                  child = node.children[i];
                  area = bboxArea(child);
                  enlargement = enlargedArea(bbox, child) - area;

                  // choose entry with the least area enlargement
                  if (enlargement < minEnlargement) {
                      minEnlargement = enlargement;
                      minArea = area < minArea ? area : minArea;
                      targetNode = child;

                  } else if (enlargement === minEnlargement) {
                      // otherwise choose one with the smallest area
                      if (area < minArea) {
                          minArea = area;
                          targetNode = child;
                      }
                  }
              }

              node = targetNode || node.children[0];
          }

          return node;
      },

      _insert: function (item, level, isNode) {

          var toBBox = this.toBBox,
              bbox = isNode ? item : toBBox(item),
              insertPath = [];

          // find the best node for accommodating the item, saving all nodes along the path too
          var node = this._chooseSubtree(bbox, this.data, level, insertPath);

          // put the item into the node
          node.children.push(item);
          extend$2(node, bbox);

          // split on node overflow; propagate upwards if necessary
          while (level >= 0) {
              if (insertPath[level].children.length > this._maxEntries) {
                  this._split(insertPath, level);
                  level--;
              } else break;
          }

          // adjust bboxes along the insertion path
          this._adjustParentBBoxes(bbox, insertPath, level);
      },

      // split overflowed node into two
      _split: function (insertPath, level) {

          var node = insertPath[level],
              M = node.children.length,
              m = this._minEntries;

          this._chooseSplitAxis(node, m, M);

          var splitIndex = this._chooseSplitIndex(node, m, M);

          var newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
          newNode.height = node.height;
          newNode.leaf = node.leaf;

          calcBBox(node, this.toBBox);
          calcBBox(newNode, this.toBBox);

          if (level) insertPath[level - 1].children.push(newNode);
          else this._splitRoot(node, newNode);
      },

      _splitRoot: function (node, newNode) {
          // split root node
          this.data = createNode([node, newNode]);
          this.data.height = node.height + 1;
          this.data.leaf = false;
          calcBBox(this.data, this.toBBox);
      },

      _chooseSplitIndex: function (node, m, M) {

          var i, bbox1, bbox2, overlap, area, minOverlap, minArea, index;

          minOverlap = minArea = Infinity;

          for (i = m; i <= M - m; i++) {
              bbox1 = distBBox(node, 0, i, this.toBBox);
              bbox2 = distBBox(node, i, M, this.toBBox);

              overlap = intersectionArea(bbox1, bbox2);
              area = bboxArea(bbox1) + bboxArea(bbox2);

              // choose distribution with minimum overlap
              if (overlap < minOverlap) {
                  minOverlap = overlap;
                  index = i;

                  minArea = area < minArea ? area : minArea;

              } else if (overlap === minOverlap) {
                  // otherwise choose distribution with minimum area
                  if (area < minArea) {
                      minArea = area;
                      index = i;
                  }
              }
          }

          return index;
      },

      // sorts node children by the best axis for split
      _chooseSplitAxis: function (node, m, M) {

          var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX,
              compareMinY = node.leaf ? this.compareMinY : compareNodeMinY,
              xMargin = this._allDistMargin(node, m, M, compareMinX),
              yMargin = this._allDistMargin(node, m, M, compareMinY);

          // if total distributions margin value is minimal for x, sort by minX,
          // otherwise it's already sorted by minY
          if (xMargin < yMargin) node.children.sort(compareMinX);
      },

      // total margin of all possible split distributions where each node is at least m full
      _allDistMargin: function (node, m, M, compare) {

          node.children.sort(compare);

          var toBBox = this.toBBox,
              leftBBox = distBBox(node, 0, m, toBBox),
              rightBBox = distBBox(node, M - m, M, toBBox),
              margin = bboxMargin(leftBBox) + bboxMargin(rightBBox),
              i, child;

          for (i = m; i < M - m; i++) {
              child = node.children[i];
              extend$2(leftBBox, node.leaf ? toBBox(child) : child);
              margin += bboxMargin(leftBBox);
          }

          for (i = M - m - 1; i >= m; i--) {
              child = node.children[i];
              extend$2(rightBBox, node.leaf ? toBBox(child) : child);
              margin += bboxMargin(rightBBox);
          }

          return margin;
      },

      _adjustParentBBoxes: function (bbox, path, level) {
          // adjust bboxes along the given tree path
          for (var i = level; i >= 0; i--) {
              extend$2(path[i], bbox);
          }
      },

      _condense: function (path) {
          // go through the path, removing empty nodes and updating bboxes
          for (var i = path.length - 1, siblings; i >= 0; i--) {
              if (path[i].children.length === 0) {
                  if (i > 0) {
                      siblings = path[i - 1].children;
                      siblings.splice(siblings.indexOf(path[i]), 1);

                  } else this.clear();

              } else calcBBox(path[i], this.toBBox);
          }
      },

      _initFormat: function (format) {
          // data format (minX, minY, maxX, maxY accessors)

          // uses eval-type function compilation instead of just accepting a toBBox function
          // because the algorithms are very sensitive to sorting functions performance,
          // so they should be dead simple and without inner calls

          var compareArr = ['return a', ' - b', ';'];

          this.compareMinX = new Function('a', 'b', compareArr.join(format[0]));
          this.compareMinY = new Function('a', 'b', compareArr.join(format[1]));

          this.toBBox = new Function('a',
              'return {minX: a' + format[0] +
              ', minY: a' + format[1] +
              ', maxX: a' + format[2] +
              ', maxY: a' + format[3] + '};');
      }
  };

  function findItem(item, items, equalsFn) {
      if (!equalsFn) return items.indexOf(item);

      for (var i = 0; i < items.length; i++) {
          if (equalsFn(item, items[i])) return i;
      }
      return -1;
  }

  // calculate node's bbox from bboxes of its children
  function calcBBox(node, toBBox) {
      distBBox(node, 0, node.children.length, toBBox, node);
  }

  // min bounding rectangle of node children from k to p-1
  function distBBox(node, k, p, toBBox, destNode) {
      if (!destNode) destNode = createNode(null);
      destNode.minX = Infinity;
      destNode.minY = Infinity;
      destNode.maxX = -Infinity;
      destNode.maxY = -Infinity;

      for (var i = k, child; i < p; i++) {
          child = node.children[i];
          extend$2(destNode, node.leaf ? toBBox(child) : child);
      }

      return destNode;
  }

  function extend$2(a, b) {
      a.minX = Math.min(a.minX, b.minX);
      a.minY = Math.min(a.minY, b.minY);
      a.maxX = Math.max(a.maxX, b.maxX);
      a.maxY = Math.max(a.maxY, b.maxY);
      return a;
  }

  function compareNodeMinX(a, b) { return a.minX - b.minX; }
  function compareNodeMinY(a, b) { return a.minY - b.minY; }

  function bboxArea(a)   { return (a.maxX - a.minX) * (a.maxY - a.minY); }
  function bboxMargin(a) { return (a.maxX - a.minX) + (a.maxY - a.minY); }

  function enlargedArea(a, b) {
      return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
             (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
  }

  function intersectionArea(a, b) {
      var minX = Math.max(a.minX, b.minX),
          minY = Math.max(a.minY, b.minY),
          maxX = Math.min(a.maxX, b.maxX),
          maxY = Math.min(a.maxY, b.maxY);

      return Math.max(0, maxX - minX) *
             Math.max(0, maxY - minY);
  }

  function contains(a, b) {
      return a.minX <= b.minX &&
             a.minY <= b.minY &&
             b.maxX <= a.maxX &&
             b.maxY <= a.maxY;
  }

  function intersects$1(a, b) {
      return b.minX <= a.maxX &&
             b.minY <= a.maxY &&
             b.maxX >= a.minX &&
             b.maxY >= a.minY;
  }

  function createNode(children) {
      return {
          children: children,
          height: 1,
          leaf: true,
          minX: Infinity,
          minY: Infinity,
          maxX: -Infinity,
          maxY: -Infinity
      };
  }

  // sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
  // combines selection algorithm with binary divide & conquer approach

  function multiSelect(arr, left, right, n, compare) {
      var stack = [left, right],
          mid;

      while (stack.length) {
          right = stack.pop();
          left = stack.pop();

          if (right - left <= n) continue;

          mid = left + Math.ceil((right - left) / n / 2) * n;
          quickselect(arr, mid, left, right, compare);

          stack.push(left, mid, mid, right);
      }
  }
  rbush_1.default = default_1;

  /**
   * @module ol/structs/RBush
   */

  /**
   * @module ol/source/Vector
   */

  /**
   * @module ol/interaction/Draw
   */

  /**
   * @module ol/interaction/Extent
   */

  /**
   * @module ol/interaction/Modify
   */

  /**
   * @module ol/interaction/Select
   */

  /**
   * @module ol/interaction/Snap
   */

  /**
   * @module ol/interaction/Translate
   */

  /**
   * @module ol/interaction
   */


  /**
   * @typedef {Object} DefaultsOptions
   * @property {boolean} [altShiftDragRotate=true] Whether Alt-Shift-drag rotate is
   * desired.
   * @property {boolean} [onFocusOnly=false] Interact only when the map has the
   * focus. This affects the `MouseWheelZoom` and `DragPan` interactions and is
   * useful when page scroll is desired for maps that do not have the browser's
   * focus.
   * @property {boolean} [constrainResolution=false] Zoom to the closest integer
   * zoom level after the wheel/trackpad or pinch gesture ends.
   * @property {boolean} [doubleClickZoom=true] Whether double click zoom is
   * desired.
   * @property {boolean} [keyboard=true] Whether keyboard interaction is desired.
   * @property {boolean} [mouseWheelZoom=true] Whether mousewheel zoom is desired.
   * @property {boolean} [shiftDragZoom=true] Whether Shift-drag zoom is desired.
   * @property {boolean} [dragPan=true] Whether drag pan is desired.
   * @property {boolean} [pinchRotate=true] Whether pinch rotate is desired.
   * @property {boolean} [pinchZoom=true] Whether pinch zoom is desired.
   * @property {number} [zoomDelta] Zoom level delta when using keyboard or
   * mousewheel zoom.
   * @property {number} [zoomDuration] Duration of the zoom animation in
   * milliseconds.
   */


  /**
   * Set of interactions included in maps by default. Specific interactions can be
   * excluded by setting the appropriate option to false in the constructor
   * options, but the order of the interactions is fixed.  If you want to specify
   * a different order for interactions, you will need to create your own
   * {@link module:ol/interaction/Interaction} instances and insert
   * them into a {@link module:ol/Collection} in the order you want
   * before creating your {@link module:ol/Map~Map} instance. The default set of
   * interactions, in sequence, is:
   * * {@link module:ol/interaction/DragRotate~DragRotate}
   * * {@link module:ol/interaction/DoubleClickZoom~DoubleClickZoom}
   * * {@link module:ol/interaction/DragPan~DragPan}
   * * {@link module:ol/interaction/PinchRotate~PinchRotate}
   * * {@link module:ol/interaction/PinchZoom~PinchZoom}
   * * {@link module:ol/interaction/KeyboardPan~KeyboardPan}
   * * {@link module:ol/interaction/KeyboardZoom~KeyboardZoom}
   * * {@link module:ol/interaction/MouseWheelZoom~MouseWheelZoom}
   * * {@link module:ol/interaction/DragZoom~DragZoom}
   *
   * @param {DefaultsOptions=} opt_options Defaults options.
   * @return {import("./Collection.js").default<import("./interaction/Interaction.js").default>}
   * A collection of interactions to be used with the {@link module:ol/Map~Map}
   * constructor's `interactions` option.
   * @api
   */
  function defaults$1(opt_options) {

    var options = opt_options ? opt_options : {};

    var interactions = new Collection();

    var kinetic = new Kinetic(-0.005, 0.05, 100);

    var altShiftDragRotate = options.altShiftDragRotate !== undefined ?
      options.altShiftDragRotate : true;
    if (altShiftDragRotate) {
      interactions.push(new DragRotate());
    }

    var doubleClickZoom = options.doubleClickZoom !== undefined ?
      options.doubleClickZoom : true;
    if (doubleClickZoom) {
      interactions.push(new DoubleClickZoom({
        delta: options.zoomDelta,
        duration: options.zoomDuration
      }));
    }

    var dragPan = options.dragPan !== undefined ? options.dragPan : true;
    if (dragPan) {
      interactions.push(new DragPan({
        condition: options.onFocusOnly ? focus : undefined,
        kinetic: kinetic
      }));
    }

    var pinchRotate = options.pinchRotate !== undefined ? options.pinchRotate :
      true;
    if (pinchRotate) {
      interactions.push(new PinchRotate());
    }

    var pinchZoom = options.pinchZoom !== undefined ? options.pinchZoom : true;
    if (pinchZoom) {
      interactions.push(new PinchZoom({
        constrainResolution: options.constrainResolution,
        duration: options.zoomDuration
      }));
    }

    var keyboard = options.keyboard !== undefined ? options.keyboard : true;
    if (keyboard) {
      interactions.push(new KeyboardPan());
      interactions.push(new KeyboardZoom({
        delta: options.zoomDelta,
        duration: options.zoomDuration
      }));
    }

    var mouseWheelZoom = options.mouseWheelZoom !== undefined ?
      options.mouseWheelZoom : true;
    if (mouseWheelZoom) {
      interactions.push(new MouseWheelZoom({
        condition: options.onFocusOnly ? focus : undefined,
        constrainResolution: options.constrainResolution,
        duration: options.zoomDuration
      }));
    }

    var shiftDragZoom = options.shiftDragZoom !== undefined ?
      options.shiftDragZoom : true;
    if (shiftDragZoom) {
      interactions.push(new DragZoom({
        duration: options.zoomDuration
      }));
    }

    return interactions;

  }

  /**
   * @module ol/reproj/common
   */

  /**
   * Default maximum allowed threshold  (in pixels) for reprojection
   * triangulation.
   * @type {number}
   */
  var ERROR_THRESHOLD = 0.5;

  /**
   * @module ol/ImageBase
   */

  /**
   * @abstract
   */
  var ImageBase = /*@__PURE__*/(function (EventTarget) {
    function ImageBase(extent, resolution, pixelRatio, state) {

      EventTarget.call(this);

      /**
       * @protected
       * @type {import("./extent.js").Extent}
       */
      this.extent = extent;

      /**
       * @private
       * @type {number}
       */
      this.pixelRatio_ = pixelRatio;

      /**
       * @protected
       * @type {number|undefined}
       */
      this.resolution = resolution;

      /**
       * @protected
       * @type {import("./ImageState.js").default}
       */
      this.state = state;

    }

    if ( EventTarget ) ImageBase.__proto__ = EventTarget;
    ImageBase.prototype = Object.create( EventTarget && EventTarget.prototype );
    ImageBase.prototype.constructor = ImageBase;

    /**
     * @protected
     */
    ImageBase.prototype.changed = function changed () {
      this.dispatchEvent(EventType.CHANGE);
    };

    /**
     * @return {import("./extent.js").Extent} Extent.
     */
    ImageBase.prototype.getExtent = function getExtent () {
      return this.extent;
    };

    /**
     * @abstract
     * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
     */
    ImageBase.prototype.getImage = function getImage () {
      return abstract();
    };

    /**
     * @return {number} PixelRatio.
     */
    ImageBase.prototype.getPixelRatio = function getPixelRatio () {
      return this.pixelRatio_;
    };

    /**
     * @return {number} Resolution.
     */
    ImageBase.prototype.getResolution = function getResolution () {
      return /** @type {number} */ (this.resolution);
    };

    /**
     * @return {import("./ImageState.js").default} State.
     */
    ImageBase.prototype.getState = function getState () {
      return this.state;
    };

    /**
     * Load not yet loaded URI.
     * @abstract
     */
    ImageBase.prototype.load = function load () {
      abstract();
    };

    return ImageBase;
  }(Target));

  /**
   * @module ol/ImageCanvas
   */


  /**
   * A function that is called to trigger asynchronous canvas drawing.  It is
   * called with a "done" callback that should be called when drawing is done.
   * If any error occurs during drawing, the "done" callback should be called with
   * that error.
   *
   * @typedef {function(function(Error=))} Loader
   */


  var ImageCanvas = /*@__PURE__*/(function (ImageBase) {
    function ImageCanvas(extent, resolution, pixelRatio, canvas, opt_loader) {

      var state = opt_loader !== undefined ? ImageState.IDLE : ImageState.LOADED;

      ImageBase.call(this, extent, resolution, pixelRatio, state);

      /**
       * Optional canvas loader function.
       * @type {?Loader}
       * @private
       */
      this.loader_ = opt_loader !== undefined ? opt_loader : null;

      /**
       * @private
       * @type {HTMLCanvasElement}
       */
      this.canvas_ = canvas;

      /**
       * @private
       * @type {Error}
       */
      this.error_ = null;

    }

    if ( ImageBase ) ImageCanvas.__proto__ = ImageBase;
    ImageCanvas.prototype = Object.create( ImageBase && ImageBase.prototype );
    ImageCanvas.prototype.constructor = ImageCanvas;

    /**
     * Get any error associated with asynchronous rendering.
     * @return {Error} Any error that occurred during rendering.
     */
    ImageCanvas.prototype.getError = function getError () {
      return this.error_;
    };

    /**
     * Handle async drawing complete.
     * @param {Error=} err Any error during drawing.
     * @private
     */
    ImageCanvas.prototype.handleLoad_ = function handleLoad_ (err) {
      if (err) {
        this.error_ = err;
        this.state = ImageState.ERROR;
      } else {
        this.state = ImageState.LOADED;
      }
      this.changed();
    };

    /**
     * @inheritDoc
     */
    ImageCanvas.prototype.load = function load () {
      if (this.state == ImageState.IDLE) {
        this.state = ImageState.LOADING;
        this.changed();
        this.loader_(this.handleLoad_.bind(this));
      }
    };

    /**
     * @return {HTMLCanvasElement} Canvas element.
     */
    ImageCanvas.prototype.getImage = function getImage () {
      return this.canvas_;
    };

    return ImageCanvas;
  }(ImageBase));

  /**
   * @module ol/render/Event
   */

  var RenderEvent = /*@__PURE__*/(function (Event) {
    function RenderEvent(type, opt_vectorContext, opt_frameState, opt_context, opt_glContext) {

      Event.call(this, type);

      /**
       * For canvas, this is an instance of {@link module:ol/render/canvas/Immediate}.
       * @type {import("./VectorContext.js").default|undefined}
       * @api
       */
      this.vectorContext = opt_vectorContext;

      /**
       * An object representing the current render frame state.
       * @type {import("../PluggableMap.js").FrameState|undefined}
       * @api
       */
      this.frameState = opt_frameState;

      /**
       * Canvas context. Only available when a Canvas renderer is used, null
       * otherwise.
       * @type {CanvasRenderingContext2D|null|undefined}
       * @api
       */
      this.context = opt_context;

      /**
       * WebGL context. Only available when a WebGL renderer is used, null
       * otherwise.
       * @type {import("../webgl/Context.js").default|null|undefined}
       * @api
       */
      this.glContext = opt_glContext;

    }

    if ( Event ) RenderEvent.__proto__ = Event;
    RenderEvent.prototype = Object.create( Event && Event.prototype );
    RenderEvent.prototype.constructor = RenderEvent;

    return RenderEvent;
  }(Event));

  /**
   * @module ol/render/VectorContext
   */

  /**
   * @classdesc
   * Context for drawing geometries.  A vector context is available on render
   * events and does not need to be constructed directly.
   * @api
   */
  var VectorContext = function VectorContext () {};

  VectorContext.prototype.drawCustom = function drawCustom (geometry, feature, renderer) {};

  /**
   * Render a geometry.
   *
   * @param {import("../geom/Geometry.js").default} geometry The geometry to render.
   */
  VectorContext.prototype.drawGeometry = function drawGeometry (geometry) {};

  /**
   * Set the rendering style.
   *
   * @param {import("../style/Style.js").default} style The rendering style.
   */
  VectorContext.prototype.setStyle = function setStyle (style) {};

  /**
   * @param {import("../geom/Circle.js").default} circleGeometry Circle geometry.
   * @param {import("../Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawCircle = function drawCircle (circleGeometry, feature) {};

  /**
   * @param {import("../Feature.js").default} feature Feature.
   * @param {import("../style/Style.js").default} style Style.
   */
  VectorContext.prototype.drawFeature = function drawFeature (feature, style) {};

  /**
   * @param {import("../geom/GeometryCollection.js").default} geometryCollectionGeometry Geometry collection.
   * @param {import("../Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawGeometryCollection = function drawGeometryCollection (geometryCollectionGeometry, feature) {};

  /**
   * @param {import("../geom/LineString.js").default|import("./Feature.js").default} lineStringGeometry Line string geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawLineString = function drawLineString (lineStringGeometry, feature) {};

  /**
   * @param {import("../geom/MultiLineString.js").default|import("./Feature.js").default} multiLineStringGeometry MultiLineString geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawMultiLineString = function drawMultiLineString (multiLineStringGeometry, feature) {};

  /**
   * @param {import("../geom/MultiPoint.js").default|import("./Feature.js").default} multiPointGeometry MultiPoint geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawMultiPoint = function drawMultiPoint (multiPointGeometry, feature) {};

  /**
   * @param {import("../geom/MultiPolygon.js").default} multiPolygonGeometry MultiPolygon geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawMultiPolygon = function drawMultiPolygon (multiPolygonGeometry, feature) {};

  /**
   * @param {import("../geom/Point.js").default|import("./Feature.js").default} pointGeometry Point geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawPoint = function drawPoint (pointGeometry, feature) {};

  /**
   * @param {import("../geom/Polygon.js").default|import("./Feature.js").default} polygonGeometry Polygon geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawPolygon = function drawPolygon (polygonGeometry, feature) {};

  /**
   * @param {import("../geom/Geometry.js").default|import("./Feature.js").default} geometry Geometry.
   * @param {import("../Feature.js").default|import("./Feature.js").default} feature Feature.
   */
  VectorContext.prototype.drawText = function drawText (geometry, feature) {};

  /**
   * @param {import("../style/Fill.js").default} fillStyle Fill style.
   * @param {import("../style/Stroke.js").default} strokeStyle Stroke style.
   */
  VectorContext.prototype.setFillStrokeStyle = function setFillStrokeStyle (fillStyle, strokeStyle) {};

  /**
   * @param {import("../style/Image.js").default} imageStyle Image style.
   * @param {import("./canvas.js").DeclutterGroup=} opt_declutterGroup Declutter.
   */
  VectorContext.prototype.setImageStyle = function setImageStyle (imageStyle, opt_declutterGroup) {};

  /**
   * @param {import("../style/Text.js").default} textStyle Text style.
   * @param {import("./canvas.js").DeclutterGroup=} opt_declutterGroup Declutter.
   */
  VectorContext.prototype.setTextStyle = function setTextStyle (textStyle, opt_declutterGroup) {};

  /**
   * @module ol/render/canvas/Immediate
   */

  /**
   * @classdesc
   * A concrete subclass of {@link module:ol/render/VectorContext} that implements
   * direct rendering of features and geometries to an HTML5 Canvas context.
   * Instances of this class are created internally by the library and
   * provided to application code as vectorContext member of the
   * {@link module:ol/render/Event~RenderEvent} object associated with postcompose, precompose and
   * render events emitted by layers and maps.
   */
  var CanvasImmediateRenderer = /*@__PURE__*/(function (VectorContext) {
    function CanvasImmediateRenderer(context, pixelRatio, extent, transform, viewRotation) {
      VectorContext.call(this);

      /**
       * @private
       * @type {CanvasRenderingContext2D}
       */
      this.context_ = context;

      /**
       * @private
       * @type {number}
       */
      this.pixelRatio_ = pixelRatio;

      /**
       * @private
       * @type {import("../../extent.js").Extent}
       */
      this.extent_ = extent;

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.transform_ = transform;

      /**
       * @private
       * @type {number}
       */
      this.viewRotation_ = viewRotation;

      /**
       * @private
       * @type {?import("../canvas.js").FillState}
       */
      this.contextFillState_ = null;

      /**
       * @private
       * @type {?import("../canvas.js").StrokeState}
       */
      this.contextStrokeState_ = null;

      /**
       * @private
       * @type {?import("../canvas.js").TextState}
       */
      this.contextTextState_ = null;

      /**
       * @private
       * @type {?import("../canvas.js").FillState}
       */
      this.fillState_ = null;

      /**
       * @private
       * @type {?import("../canvas.js").StrokeState}
       */
      this.strokeState_ = null;

      /**
       * @private
       * @type {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement}
       */
      this.image_ = null;

      /**
       * @private
       * @type {number}
       */
      this.imageAnchorX_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageAnchorY_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageHeight_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageOpacity_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageOriginX_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageOriginY_ = 0;

      /**
       * @private
       * @type {boolean}
       */
      this.imageRotateWithView_ = false;

      /**
       * @private
       * @type {number}
       */
      this.imageRotation_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageScale_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.imageWidth_ = 0;

      /**
       * @private
       * @type {string}
       */
      this.text_ = '';

      /**
       * @private
       * @type {number}
       */
      this.textOffsetX_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.textOffsetY_ = 0;

      /**
       * @private
       * @type {boolean}
       */
      this.textRotateWithView_ = false;

      /**
       * @private
       * @type {number}
       */
      this.textRotation_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.textScale_ = 0;

      /**
       * @private
       * @type {?import("../canvas.js").FillState}
       */
      this.textFillState_ = null;

      /**
       * @private
       * @type {?import("../canvas.js").StrokeState}
       */
      this.textStrokeState_ = null;

      /**
       * @private
       * @type {?import("../canvas.js").TextState}
       */
      this.textState_ = null;

      /**
       * @private
       * @type {Array<number>}
       */
      this.pixelCoordinates_ = [];

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.tmpLocalTransform_ = create();

    }

    if ( VectorContext ) CanvasImmediateRenderer.__proto__ = VectorContext;
    CanvasImmediateRenderer.prototype = Object.create( VectorContext && VectorContext.prototype );
    CanvasImmediateRenderer.prototype.constructor = CanvasImmediateRenderer;

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {number} end End.
     * @param {number} stride Stride.
     * @private
     */
    CanvasImmediateRenderer.prototype.drawImages_ = function drawImages_ (flatCoordinates, offset, end, stride) {
      if (!this.image_) {
        return;
      }
      var pixelCoordinates = transform2D(
        flatCoordinates, offset, end, 2, this.transform_,
        this.pixelCoordinates_);
      var context = this.context_;
      var localTransform = this.tmpLocalTransform_;
      var alpha = context.globalAlpha;
      if (this.imageOpacity_ != 1) {
        context.globalAlpha = alpha * this.imageOpacity_;
      }
      var rotation = this.imageRotation_;
      if (this.imageRotateWithView_) {
        rotation += this.viewRotation_;
      }
      for (var i = 0, ii = pixelCoordinates.length; i < ii; i += 2) {
        var x = pixelCoordinates[i] - this.imageAnchorX_;
        var y = pixelCoordinates[i + 1] - this.imageAnchorY_;
        if (rotation !== 0 || this.imageScale_ != 1) {
          var centerX = x + this.imageAnchorX_;
          var centerY = y + this.imageAnchorY_;
          compose(localTransform,
            centerX, centerY,
            this.imageScale_, this.imageScale_,
            rotation,
            -centerX, -centerY);
          context.setTransform.apply(context, localTransform);
        }
        context.drawImage(this.image_, this.imageOriginX_, this.imageOriginY_,
          this.imageWidth_, this.imageHeight_, x, y,
          this.imageWidth_, this.imageHeight_);
      }
      if (rotation !== 0 || this.imageScale_ != 1) {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      if (this.imageOpacity_ != 1) {
        context.globalAlpha = alpha;
      }
    };

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {number} end End.
     * @param {number} stride Stride.
     * @private
     */
    CanvasImmediateRenderer.prototype.drawText_ = function drawText_ (flatCoordinates, offset, end, stride) {
      if (!this.textState_ || this.text_ === '') {
        return;
      }
      if (this.textFillState_) {
        this.setContextFillState_(this.textFillState_);
      }
      if (this.textStrokeState_) {
        this.setContextStrokeState_(this.textStrokeState_);
      }
      this.setContextTextState_(this.textState_);
      var pixelCoordinates = transform2D(
        flatCoordinates, offset, end, stride, this.transform_,
        this.pixelCoordinates_);
      var context = this.context_;
      var rotation = this.textRotation_;
      if (this.textRotateWithView_) {
        rotation += this.viewRotation_;
      }
      for (; offset < end; offset += stride) {
        var x = pixelCoordinates[offset] + this.textOffsetX_;
        var y = pixelCoordinates[offset + 1] + this.textOffsetY_;
        if (rotation !== 0 || this.textScale_ != 1) {
          var localTransform = compose(this.tmpLocalTransform_,
            x, y,
            this.textScale_, this.textScale_,
            rotation,
            -x, -y);
          context.setTransform.apply(context, localTransform);
        }
        if (this.textStrokeState_) {
          context.strokeText(this.text_, x, y);
        }
        if (this.textFillState_) {
          context.fillText(this.text_, x, y);
        }
      }
      if (rotation !== 0 || this.textScale_ != 1) {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
    };

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {number} end End.
     * @param {number} stride Stride.
     * @param {boolean} close Close.
     * @private
     * @return {number} end End.
     */
    CanvasImmediateRenderer.prototype.moveToLineTo_ = function moveToLineTo_ (flatCoordinates, offset, end, stride, close) {
      var context = this.context_;
      var pixelCoordinates = transform2D(
        flatCoordinates, offset, end, stride, this.transform_,
        this.pixelCoordinates_);
      context.moveTo(pixelCoordinates[0], pixelCoordinates[1]);
      var length = pixelCoordinates.length;
      if (close) {
        length -= 2;
      }
      for (var i = 2; i < length; i += 2) {
        context.lineTo(pixelCoordinates[i], pixelCoordinates[i + 1]);
      }
      if (close) {
        context.closePath();
      }
      return end;
    };

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {Array<number>} ends Ends.
     * @param {number} stride Stride.
     * @private
     * @return {number} End.
     */
    CanvasImmediateRenderer.prototype.drawRings_ = function drawRings_ (flatCoordinates, offset, ends, stride) {
      for (var i = 0, ii = ends.length; i < ii; ++i) {
        offset = this.moveToLineTo_(flatCoordinates, offset, ends[i], stride, true);
      }
      return offset;
    };

    /**
     * Render a circle geometry into the canvas.  Rendering is immediate and uses
     * the current fill and stroke styles.
     *
     * @param {import("../../geom/Circle.js").default} geometry Circle geometry.
     * @override
     * @api
     */
    CanvasImmediateRenderer.prototype.drawCircle = function drawCircle (geometry) {
      if (!intersects(this.extent_, geometry.getExtent())) {
        return;
      }
      if (this.fillState_ || this.strokeState_) {
        if (this.fillState_) {
          this.setContextFillState_(this.fillState_);
        }
        if (this.strokeState_) {
          this.setContextStrokeState_(this.strokeState_);
        }
        var pixelCoordinates = transformGeom2D(
          geometry, this.transform_, this.pixelCoordinates_);
        var dx = pixelCoordinates[2] - pixelCoordinates[0];
        var dy = pixelCoordinates[3] - pixelCoordinates[1];
        var radius = Math.sqrt(dx * dx + dy * dy);
        var context = this.context_;
        context.beginPath();
        context.arc(
          pixelCoordinates[0], pixelCoordinates[1], radius, 0, 2 * Math.PI);
        if (this.fillState_) {
          context.fill();
        }
        if (this.strokeState_) {
          context.stroke();
        }
      }
      if (this.text_ !== '') {
        this.drawText_(geometry.getCenter(), 0, 2, 2);
      }
    };

    /**
     * Set the rendering style.  Note that since this is an immediate rendering API,
     * any `zIndex` on the provided style will be ignored.
     *
     * @param {import("../../style/Style.js").default} style The rendering style.
     * @override
     * @api
     */
    CanvasImmediateRenderer.prototype.setStyle = function setStyle (style) {
      this.setFillStrokeStyle(style.getFill(), style.getStroke());
      this.setImageStyle(style.getImage());
      this.setTextStyle(style.getText());
    };

    /**
     * Render a geometry into the canvas.  Call
     * {@link module:ol/render/canvas/Immediate#setStyle} first to set the rendering style.
     *
     * @param {import("../../geom/Geometry.js").default|import("../Feature.js").default} geometry The geometry to render.
     * @override
     * @api
     */
    CanvasImmediateRenderer.prototype.drawGeometry = function drawGeometry (geometry) {
      var type = geometry.getType();
      switch (type) {
        case GeometryType.POINT:
          this.drawPoint(/** @type {import("../../geom/Point.js").default} */ (geometry));
          break;
        case GeometryType.LINE_STRING:
          this.drawLineString(/** @type {import("../../geom/LineString.js").default} */ (geometry));
          break;
        case GeometryType.POLYGON:
          this.drawPolygon(/** @type {import("../../geom/Polygon.js").default} */ (geometry));
          break;
        case GeometryType.MULTI_POINT:
          this.drawMultiPoint(/** @type {import("../../geom/MultiPoint.js").default} */ (geometry));
          break;
        case GeometryType.MULTI_LINE_STRING:
          this.drawMultiLineString(/** @type {import("../../geom/MultiLineString.js").default} */ (geometry));
          break;
        case GeometryType.MULTI_POLYGON:
          this.drawMultiPolygon(/** @type {import("../../geom/MultiPolygon.js").default} */ (geometry));
          break;
        case GeometryType.GEOMETRY_COLLECTION:
          this.drawGeometryCollection(/** @type {import("../../geom/GeometryCollection.js").default} */ (geometry));
          break;
        case GeometryType.CIRCLE:
          this.drawCircle(/** @type {import("../../geom/Circle.js").default} */ (geometry));
          break;
        default:
      }
    };

    /**
     * Render a feature into the canvas.  Note that any `zIndex` on the provided
     * style will be ignored - features are rendered immediately in the order that
     * this method is called.  If you need `zIndex` support, you should be using an
     * {@link module:ol/layer/Vector~VectorLayer} instead.
     *
     * @param {import("../../Feature.js").default} feature Feature.
     * @param {import("../../style/Style.js").default} style Style.
     * @override
     * @api
     */
    CanvasImmediateRenderer.prototype.drawFeature = function drawFeature (feature, style) {
      var geometry = style.getGeometryFunction()(feature);
      if (!geometry || !intersects(this.extent_, geometry.getExtent())) {
        return;
      }
      this.setStyle(style);
      this.drawGeometry(geometry);
    };

    /**
     * Render a GeometryCollection to the canvas.  Rendering is immediate and
     * uses the current styles appropriate for each geometry in the collection.
     *
     * @param {import("../../geom/GeometryCollection.js").default} geometry Geometry collection.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawGeometryCollection = function drawGeometryCollection (geometry) {
      var geometries = geometry.getGeometriesArray();
      for (var i = 0, ii = geometries.length; i < ii; ++i) {
        this.drawGeometry(geometries[i]);
      }
    };

    /**
     * Render a Point geometry into the canvas.  Rendering is immediate and uses
     * the current style.
     *
     * @param {import("../../geom/Point.js").default|import("../Feature.js").default} geometry Point geometry.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawPoint = function drawPoint (geometry) {
      var flatCoordinates = geometry.getFlatCoordinates();
      var stride = geometry.getStride();
      if (this.image_) {
        this.drawImages_(flatCoordinates, 0, flatCoordinates.length, stride);
      }
      if (this.text_ !== '') {
        this.drawText_(flatCoordinates, 0, flatCoordinates.length, stride);
      }
    };

    /**
     * Render a MultiPoint geometry  into the canvas.  Rendering is immediate and
     * uses the current style.
     *
     * @param {import("../../geom/MultiPoint.js").default|import("../Feature.js").default} geometry MultiPoint geometry.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawMultiPoint = function drawMultiPoint (geometry) {
      var flatCoordinates = geometry.getFlatCoordinates();
      var stride = geometry.getStride();
      if (this.image_) {
        this.drawImages_(flatCoordinates, 0, flatCoordinates.length, stride);
      }
      if (this.text_ !== '') {
        this.drawText_(flatCoordinates, 0, flatCoordinates.length, stride);
      }
    };

    /**
     * Render a LineString into the canvas.  Rendering is immediate and uses
     * the current style.
     *
     * @param {import("../../geom/LineString.js").default|import("../Feature.js").default} geometry LineString geometry.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawLineString = function drawLineString (geometry) {
      if (!intersects(this.extent_, geometry.getExtent())) {
        return;
      }
      if (this.strokeState_) {
        this.setContextStrokeState_(this.strokeState_);
        var context = this.context_;
        var flatCoordinates = geometry.getFlatCoordinates();
        context.beginPath();
        this.moveToLineTo_(flatCoordinates, 0, flatCoordinates.length,
          geometry.getStride(), false);
        context.stroke();
      }
      if (this.text_ !== '') {
        var flatMidpoint = geometry.getFlatMidpoint();
        this.drawText_(flatMidpoint, 0, 2, 2);
      }
    };

    /**
     * Render a MultiLineString geometry into the canvas.  Rendering is immediate
     * and uses the current style.
     *
     * @param {import("../../geom/MultiLineString.js").default|import("../Feature.js").default} geometry MultiLineString geometry.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawMultiLineString = function drawMultiLineString (geometry) {
      var geometryExtent = geometry.getExtent();
      if (!intersects(this.extent_, geometryExtent)) {
        return;
      }
      if (this.strokeState_) {
        this.setContextStrokeState_(this.strokeState_);
        var context = this.context_;
        var flatCoordinates = geometry.getFlatCoordinates();
        var offset = 0;
        var ends = /** @type {Array<number>} */ (geometry.getEnds());
        var stride = geometry.getStride();
        context.beginPath();
        for (var i = 0, ii = ends.length; i < ii; ++i) {
          offset = this.moveToLineTo_(flatCoordinates, offset, ends[i], stride, false);
        }
        context.stroke();
      }
      if (this.text_ !== '') {
        var flatMidpoints = geometry.getFlatMidpoints();
        this.drawText_(flatMidpoints, 0, flatMidpoints.length, 2);
      }
    };

    /**
     * Render a Polygon geometry into the canvas.  Rendering is immediate and uses
     * the current style.
     *
     * @param {import("../../geom/Polygon.js").default|import("../Feature.js").default} geometry Polygon geometry.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawPolygon = function drawPolygon (geometry) {
      if (!intersects(this.extent_, geometry.getExtent())) {
        return;
      }
      if (this.strokeState_ || this.fillState_) {
        if (this.fillState_) {
          this.setContextFillState_(this.fillState_);
        }
        if (this.strokeState_) {
          this.setContextStrokeState_(this.strokeState_);
        }
        var context = this.context_;
        context.beginPath();
        this.drawRings_(geometry.getOrientedFlatCoordinates(),
          0, /** @type {Array<number>} */ (geometry.getEnds()), geometry.getStride());
        if (this.fillState_) {
          context.fill();
        }
        if (this.strokeState_) {
          context.stroke();
        }
      }
      if (this.text_ !== '') {
        var flatInteriorPoint = geometry.getFlatInteriorPoint();
        this.drawText_(flatInteriorPoint, 0, 2, 2);
      }
    };

    /**
     * Render MultiPolygon geometry into the canvas.  Rendering is immediate and
     * uses the current style.
     * @param {import("../../geom/MultiPolygon.js").default} geometry MultiPolygon geometry.
     * @override
     */
    CanvasImmediateRenderer.prototype.drawMultiPolygon = function drawMultiPolygon (geometry) {
      if (!intersects(this.extent_, geometry.getExtent())) {
        return;
      }
      if (this.strokeState_ || this.fillState_) {
        if (this.fillState_) {
          this.setContextFillState_(this.fillState_);
        }
        if (this.strokeState_) {
          this.setContextStrokeState_(this.strokeState_);
        }
        var context = this.context_;
        var flatCoordinates = geometry.getOrientedFlatCoordinates();
        var offset = 0;
        var endss = geometry.getEndss();
        var stride = geometry.getStride();
        context.beginPath();
        for (var i = 0, ii = endss.length; i < ii; ++i) {
          var ends = endss[i];
          offset = this.drawRings_(flatCoordinates, offset, ends, stride);
        }
        if (this.fillState_) {
          context.fill();
        }
        if (this.strokeState_) {
          context.stroke();
        }
      }
      if (this.text_ !== '') {
        var flatInteriorPoints = geometry.getFlatInteriorPoints();
        this.drawText_(flatInteriorPoints, 0, flatInteriorPoints.length, 2);
      }
    };

    /**
     * @param {import("../canvas.js").FillState} fillState Fill state.
     * @private
     */
    CanvasImmediateRenderer.prototype.setContextFillState_ = function setContextFillState_ (fillState) {
      var context = this.context_;
      var contextFillState = this.contextFillState_;
      if (!contextFillState) {
        context.fillStyle = fillState.fillStyle;
        this.contextFillState_ = {
          fillStyle: fillState.fillStyle
        };
      } else {
        if (contextFillState.fillStyle != fillState.fillStyle) {
          contextFillState.fillStyle = context.fillStyle = fillState.fillStyle;
        }
      }
    };

    /**
     * @param {import("../canvas.js").StrokeState} strokeState Stroke state.
     * @private
     */
    CanvasImmediateRenderer.prototype.setContextStrokeState_ = function setContextStrokeState_ (strokeState) {
      var context = this.context_;
      var contextStrokeState = this.contextStrokeState_;
      if (!contextStrokeState) {
        context.lineCap = /** @type {CanvasLineCap} */ (strokeState.lineCap);
        if (CANVAS_LINE_DASH) {
          context.setLineDash(strokeState.lineDash);
          context.lineDashOffset = strokeState.lineDashOffset;
        }
        context.lineJoin = /** @type {CanvasLineJoin} */ (strokeState.lineJoin);
        context.lineWidth = strokeState.lineWidth;
        context.miterLimit = strokeState.miterLimit;
        context.strokeStyle = strokeState.strokeStyle;
        this.contextStrokeState_ = {
          lineCap: strokeState.lineCap,
          lineDash: strokeState.lineDash,
          lineDashOffset: strokeState.lineDashOffset,
          lineJoin: strokeState.lineJoin,
          lineWidth: strokeState.lineWidth,
          miterLimit: strokeState.miterLimit,
          strokeStyle: strokeState.strokeStyle
        };
      } else {
        if (contextStrokeState.lineCap != strokeState.lineCap) {
          contextStrokeState.lineCap = context.lineCap = /** @type {CanvasLineCap} */ (strokeState.lineCap);
        }
        if (CANVAS_LINE_DASH) {
          if (!equals(contextStrokeState.lineDash, strokeState.lineDash)) {
            context.setLineDash(contextStrokeState.lineDash = strokeState.lineDash);
          }
          if (contextStrokeState.lineDashOffset != strokeState.lineDashOffset) {
            contextStrokeState.lineDashOffset = context.lineDashOffset =
                strokeState.lineDashOffset;
          }
        }
        if (contextStrokeState.lineJoin != strokeState.lineJoin) {
          contextStrokeState.lineJoin = context.lineJoin = /** @type {CanvasLineJoin} */ (strokeState.lineJoin);
        }
        if (contextStrokeState.lineWidth != strokeState.lineWidth) {
          contextStrokeState.lineWidth = context.lineWidth = strokeState.lineWidth;
        }
        if (contextStrokeState.miterLimit != strokeState.miterLimit) {
          contextStrokeState.miterLimit = context.miterLimit =
              strokeState.miterLimit;
        }
        if (contextStrokeState.strokeStyle != strokeState.strokeStyle) {
          contextStrokeState.strokeStyle = context.strokeStyle =
              strokeState.strokeStyle;
        }
      }
    };

    /**
     * @param {import("../canvas.js").TextState} textState Text state.
     * @private
     */
    CanvasImmediateRenderer.prototype.setContextTextState_ = function setContextTextState_ (textState) {
      var context = this.context_;
      var contextTextState = this.contextTextState_;
      var textAlign = textState.textAlign ?
        textState.textAlign : defaultTextAlign;
      if (!contextTextState) {
        context.font = textState.font;
        context.textAlign = /** @type {CanvasTextAlign} */ (textAlign);
        context.textBaseline = /** @type {CanvasTextBaseline} */ (textState.textBaseline);
        this.contextTextState_ = {
          font: textState.font,
          textAlign: textAlign,
          textBaseline: textState.textBaseline
        };
      } else {
        if (contextTextState.font != textState.font) {
          contextTextState.font = context.font = textState.font;
        }
        if (contextTextState.textAlign != textAlign) {
          contextTextState.textAlign = context.textAlign = /** @type {CanvasTextAlign} */ (textAlign);
        }
        if (contextTextState.textBaseline != textState.textBaseline) {
          contextTextState.textBaseline = context.textBaseline =
            /** @type {CanvasTextBaseline} */ (textState.textBaseline);
        }
      }
    };

    /**
     * Set the fill and stroke style for subsequent draw operations.  To clear
     * either fill or stroke styles, pass null for the appropriate parameter.
     *
     * @param {import("../../style/Fill.js").default} fillStyle Fill style.
     * @param {import("../../style/Stroke.js").default} strokeStyle Stroke style.
     * @override
     */
    CanvasImmediateRenderer.prototype.setFillStrokeStyle = function setFillStrokeStyle (fillStyle, strokeStyle) {
      if (!fillStyle) {
        this.fillState_ = null;
      } else {
        var fillStyleColor = fillStyle.getColor();
        this.fillState_ = {
          fillStyle: asColorLike(fillStyleColor ?
            fillStyleColor : defaultFillStyle)
        };
      }
      if (!strokeStyle) {
        this.strokeState_ = null;
      } else {
        var strokeStyleColor = strokeStyle.getColor();
        var strokeStyleLineCap = strokeStyle.getLineCap();
        var strokeStyleLineDash = strokeStyle.getLineDash();
        var strokeStyleLineDashOffset = strokeStyle.getLineDashOffset();
        var strokeStyleLineJoin = strokeStyle.getLineJoin();
        var strokeStyleWidth = strokeStyle.getWidth();
        var strokeStyleMiterLimit = strokeStyle.getMiterLimit();
        this.strokeState_ = {
          lineCap: strokeStyleLineCap !== undefined ?
            strokeStyleLineCap : defaultLineCap,
          lineDash: strokeStyleLineDash ?
            strokeStyleLineDash : defaultLineDash,
          lineDashOffset: strokeStyleLineDashOffset ?
            strokeStyleLineDashOffset : defaultLineDashOffset,
          lineJoin: strokeStyleLineJoin !== undefined ?
            strokeStyleLineJoin : defaultLineJoin,
          lineWidth: this.pixelRatio_ * (strokeStyleWidth !== undefined ?
            strokeStyleWidth : defaultLineWidth),
          miterLimit: strokeStyleMiterLimit !== undefined ?
            strokeStyleMiterLimit : defaultMiterLimit,
          strokeStyle: asColorLike(strokeStyleColor ?
            strokeStyleColor : defaultStrokeStyle)
        };
      }
    };

    /**
     * Set the image style for subsequent draw operations.  Pass null to remove
     * the image style.
     *
     * @param {import("../../style/Image.js").default} imageStyle Image style.
     * @override
     */
    CanvasImmediateRenderer.prototype.setImageStyle = function setImageStyle (imageStyle) {
      if (!imageStyle) {
        this.image_ = null;
      } else {
        var imageAnchor = imageStyle.getAnchor();
        // FIXME pixel ratio
        var imageImage = imageStyle.getImage(1);
        var imageOrigin = imageStyle.getOrigin();
        var imageSize = imageStyle.getSize();
        this.imageAnchorX_ = imageAnchor[0];
        this.imageAnchorY_ = imageAnchor[1];
        this.imageHeight_ = imageSize[1];
        this.image_ = imageImage;
        this.imageOpacity_ = imageStyle.getOpacity();
        this.imageOriginX_ = imageOrigin[0];
        this.imageOriginY_ = imageOrigin[1];
        this.imageRotateWithView_ = imageStyle.getRotateWithView();
        this.imageRotation_ = imageStyle.getRotation();
        this.imageScale_ = imageStyle.getScale() * this.pixelRatio_;
        this.imageWidth_ = imageSize[0];
      }
    };

    /**
     * Set the text style for subsequent draw operations.  Pass null to
     * remove the text style.
     *
     * @param {import("../../style/Text.js").default} textStyle Text style.
     * @override
     */
    CanvasImmediateRenderer.prototype.setTextStyle = function setTextStyle (textStyle) {
      if (!textStyle) {
        this.text_ = '';
      } else {
        var textFillStyle = textStyle.getFill();
        if (!textFillStyle) {
          this.textFillState_ = null;
        } else {
          var textFillStyleColor = textFillStyle.getColor();
          this.textFillState_ = {
            fillStyle: asColorLike(textFillStyleColor ?
              textFillStyleColor : defaultFillStyle)
          };
        }
        var textStrokeStyle = textStyle.getStroke();
        if (!textStrokeStyle) {
          this.textStrokeState_ = null;
        } else {
          var textStrokeStyleColor = textStrokeStyle.getColor();
          var textStrokeStyleLineCap = textStrokeStyle.getLineCap();
          var textStrokeStyleLineDash = textStrokeStyle.getLineDash();
          var textStrokeStyleLineDashOffset = textStrokeStyle.getLineDashOffset();
          var textStrokeStyleLineJoin = textStrokeStyle.getLineJoin();
          var textStrokeStyleWidth = textStrokeStyle.getWidth();
          var textStrokeStyleMiterLimit = textStrokeStyle.getMiterLimit();
          this.textStrokeState_ = {
            lineCap: textStrokeStyleLineCap !== undefined ?
              textStrokeStyleLineCap : defaultLineCap,
            lineDash: textStrokeStyleLineDash ?
              textStrokeStyleLineDash : defaultLineDash,
            lineDashOffset: textStrokeStyleLineDashOffset ?
              textStrokeStyleLineDashOffset : defaultLineDashOffset,
            lineJoin: textStrokeStyleLineJoin !== undefined ?
              textStrokeStyleLineJoin : defaultLineJoin,
            lineWidth: textStrokeStyleWidth !== undefined ?
              textStrokeStyleWidth : defaultLineWidth,
            miterLimit: textStrokeStyleMiterLimit !== undefined ?
              textStrokeStyleMiterLimit : defaultMiterLimit,
            strokeStyle: asColorLike(textStrokeStyleColor ?
              textStrokeStyleColor : defaultStrokeStyle)
          };
        }
        var textFont = textStyle.getFont();
        var textOffsetX = textStyle.getOffsetX();
        var textOffsetY = textStyle.getOffsetY();
        var textRotateWithView = textStyle.getRotateWithView();
        var textRotation = textStyle.getRotation();
        var textScale = textStyle.getScale();
        var textText = textStyle.getText();
        var textTextAlign = textStyle.getTextAlign();
        var textTextBaseline = textStyle.getTextBaseline();
        this.textState_ = {
          font: textFont !== undefined ?
            textFont : defaultFont,
          textAlign: textTextAlign !== undefined ?
            textTextAlign : defaultTextAlign,
          textBaseline: textTextBaseline !== undefined ?
            textTextBaseline : defaultTextBaseline
        };
        this.text_ = textText !== undefined ? textText : '';
        this.textOffsetX_ =
            textOffsetX !== undefined ? (this.pixelRatio_ * textOffsetX) : 0;
        this.textOffsetY_ =
            textOffsetY !== undefined ? (this.pixelRatio_ * textOffsetY) : 0;
        this.textRotateWithView_ = textRotateWithView !== undefined ? textRotateWithView : false;
        this.textRotation_ = textRotation !== undefined ? textRotation : 0;
        this.textScale_ = this.pixelRatio_ * (textScale !== undefined ?
          textScale : 1);
      }
    };

    return CanvasImmediateRenderer;
  }(VectorContext));

  /**
   * @module ol/style/IconImageCache
   */

  /**
   * @classdesc
   * Singleton class. Available through {@link module:ol/style/IconImageCache~shared}.
   */
  var IconImageCache = function IconImageCache() {

    /**
    * @type {!Object<string, import("./IconImage.js").default>}
    * @private
    */
    this.cache_ = {};

    /**
    * @type {number}
    * @private
    */
    this.cacheSize_ = 0;

    /**
    * @type {number}
    * @private
    */
    this.maxCacheSize_ = 32;
  };

  /**
  * FIXME empty description for jsdoc
  */
  IconImageCache.prototype.clear = function clear () {
    this.cache_ = {};
    this.cacheSize_ = 0;
  };

  /**
  * FIXME empty description for jsdoc
  */
  IconImageCache.prototype.expire = function expire () {
    if (this.cacheSize_ > this.maxCacheSize_) {
      var i = 0;
      for (var key in this.cache_) {
        var iconImage = this.cache_[key];
        if ((i++ & 3) === 0 && !iconImage.hasListener()) {
          delete this.cache_[key];
          --this.cacheSize_;
        }
      }
    }
  };

  /**
  * @param {string} src Src.
  * @param {?string} crossOrigin Cross origin.
  * @param {import("../color.js").Color} color Color.
  * @return {import("./IconImage.js").default} Icon image.
  */
  IconImageCache.prototype.get = function get (src, crossOrigin, color) {
    var key = getKey(src, crossOrigin, color);
    return key in this.cache_ ? this.cache_[key] : null;
  };

  /**
  * @param {string} src Src.
  * @param {?string} crossOrigin Cross origin.
  * @param {import("../color.js").Color} color Color.
  * @param {import("./IconImage.js").default} iconImage Icon image.
  */
  IconImageCache.prototype.set = function set (src, crossOrigin, color, iconImage) {
    var key = getKey(src, crossOrigin, color);
    this.cache_[key] = iconImage;
    ++this.cacheSize_;
  };

  /**
  * Set the cache size of the icon cache. Default is `32`. Change this value when
  * your map uses more than 32 different icon images and you are not caching icon
  * styles on the application level.
  * @param {number} maxCacheSize Cache max size.
  * @api
  */
  IconImageCache.prototype.setSize = function setSize (maxCacheSize) {
    this.maxCacheSize_ = maxCacheSize;
    this.expire();
  };


  /**
   * @param {string} src Src.
   * @param {?string} crossOrigin Cross origin.
   * @param {import("../color.js").Color} color Color.
   * @return {string} Cache key.
   */
  function getKey(src, crossOrigin, color) {
    var colorString = color ? asString(color) : 'null';
    return crossOrigin + ':' + src + ':' + colorString;
  }


  /**
   * The {@link module:ol/style/IconImageCache~IconImageCache} for
   * {@link module:ol/style/Icon~Icon} images.
   * @api
   */
  var shared = new IconImageCache();

  /**
   * @module ol/renderer/Map
   */

  /**
   * @abstract
   */
  var MapRenderer = /*@__PURE__*/(function (Disposable) {
    function MapRenderer(map) {
      Disposable.call(this);

      /**
       * @private
       * @type {import("../PluggableMap.js").default}
       */
      this.map_ = map;

      /**
       * @private
       * @type {!Object<string, import("./Layer.js").default>}
       */
      this.layerRenderers_ = {};

      /**
       * @private
       * @type {Object<string, import("../events.js").EventsKey>}
       */
      this.layerRendererListeners_ = {};

      /**
       * @private
       * @type {Array<typeof import("./Layer.js").default>}
       */
      this.layerRendererConstructors_ = [];

    }

    if ( Disposable ) MapRenderer.__proto__ = Disposable;
    MapRenderer.prototype = Object.create( Disposable && Disposable.prototype );
    MapRenderer.prototype.constructor = MapRenderer;

    /**
     * @abstract
     * @param {import("../render/EventType.js").default} type Event type.
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     */
    MapRenderer.prototype.dispatchRenderEvent = function dispatchRenderEvent (type, frameState) {
      abstract();
    };

    /**
     * Register layer renderer constructors.
     * @param {Array<typeof import("./Layer.js").default>} constructors Layer renderers.
     */
    MapRenderer.prototype.registerLayerRenderers = function registerLayerRenderers (constructors) {
      this.layerRendererConstructors_.push.apply(this.layerRendererConstructors_, constructors);
    };

    /**
     * @param {import("../PluggableMap.js").FrameState} frameState FrameState.
     * @protected
     */
    MapRenderer.prototype.calculateMatrices2D = function calculateMatrices2D (frameState) {
      var viewState = frameState.viewState;
      var coordinateToPixelTransform = frameState.coordinateToPixelTransform;
      var pixelToCoordinateTransform = frameState.pixelToCoordinateTransform;

      compose(coordinateToPixelTransform,
        frameState.size[0] / 2, frameState.size[1] / 2,
        1 / viewState.resolution, -1 / viewState.resolution,
        -viewState.rotation,
        -viewState.center[0], -viewState.center[1]);

      invert(
        setFromArray(pixelToCoordinateTransform, coordinateToPixelTransform));
    };

    /**
     * Removes all layer renderers.
     */
    MapRenderer.prototype.removeLayerRenderers = function removeLayerRenderers () {
      for (var key in this.layerRenderers_) {
        this.removeLayerRendererByKey_(key).dispose();
      }
    };

    /**
     * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
     * @param {import("../PluggableMap.js").FrameState} frameState FrameState.
     * @param {number} hitTolerance Hit tolerance in pixels.
     * @param {function(this: S, import("../Feature.js").FeatureLike,
     *     import("../layer/Layer.js").default): T} callback Feature callback.
     * @param {S} thisArg Value to use as `this` when executing `callback`.
     * @param {function(this: U, import("../layer/Layer.js").default): boolean} layerFilter Layer filter
     *     function, only layers which are visible and for which this function
     *     returns `true` will be tested for features.  By default, all visible
     *     layers will be tested.
     * @param {U} thisArg2 Value to use as `this` when executing `layerFilter`.
     * @return {T|undefined} Callback result.
     * @template S,T,U
     */
    MapRenderer.prototype.forEachFeatureAtCoordinate = function forEachFeatureAtCoordinate (
      coordinate,
      frameState,
      hitTolerance,
      callback,
      thisArg,
      layerFilter,
      thisArg2
    ) {
      var result;
      var viewState = frameState.viewState;
      var viewResolution = viewState.resolution;

      /**
       * @param {import("../Feature.js").FeatureLike} feature Feature.
       * @param {import("../layer/Layer.js").default} layer Layer.
       * @return {?} Callback result.
       */
      function forEachFeatureAtCoordinate(feature, layer) {
        var managed = frameState.layerStates[getUid(layer)].managed;
        if (!(getUid(feature) in frameState.skippedFeatureUids && !managed)) {
          return callback.call(thisArg, feature, managed ? layer : null);
        }
      }

      var projection = viewState.projection;

      var translatedCoordinate = coordinate;
      if (projection.canWrapX()) {
        var projectionExtent = projection.getExtent();
        var worldWidth = getWidth(projectionExtent);
        var x = coordinate[0];
        if (x < projectionExtent[0] || x > projectionExtent[2]) {
          var worldsAway = Math.ceil((projectionExtent[0] - x) / worldWidth);
          translatedCoordinate = [x + worldWidth * worldsAway, coordinate[1]];
        }
      }

      var layerStates = frameState.layerStatesArray;
      var numLayers = layerStates.length;
      var i;
      for (i = numLayers - 1; i >= 0; --i) {
        var layerState = layerStates[i];
        var layer = layerState.layer;
        if (visibleAtResolution(layerState, viewResolution) && layerFilter.call(thisArg2, layer)) {
          var layerRenderer = this.getLayerRenderer(layer);
          var source = /** @type {import("../layer/Layer.js").default} */ (layer).getSource();
          if (source) {
            result = layerRenderer.forEachFeatureAtCoordinate(
              source.getWrapX() ? translatedCoordinate : coordinate,
              frameState, hitTolerance, forEachFeatureAtCoordinate);
          }
          if (result) {
            return result;
          }
        }
      }
      return undefined;
    };

    /**
     * @abstract
     * @param {import("../pixel.js").Pixel} pixel Pixel.
     * @param {import("../PluggableMap.js").FrameState} frameState FrameState.
     * @param {number} hitTolerance Hit tolerance in pixels.
     * @param {function(this: S, import("../layer/Layer.js").default, (Uint8ClampedArray|Uint8Array)): T} callback Layer
     *     callback.
     * @param {S} thisArg Value to use as `this` when executing `callback`.
     * @param {function(this: U, import("../layer/Layer.js").default): boolean} layerFilter Layer filter
     *     function, only layers which are visible and for which this function
     *     returns `true` will be tested for features.  By default, all visible
     *     layers will be tested.
     * @param {U} thisArg2 Value to use as `this` when executing `layerFilter`.
     * @return {T|undefined} Callback result.
     * @template S,T,U
     */
    MapRenderer.prototype.forEachLayerAtPixel = function forEachLayerAtPixel (pixel, frameState, hitTolerance, callback, thisArg, layerFilter, thisArg2) {
      return abstract();
    };

    /**
     * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
     * @param {import("../PluggableMap.js").FrameState} frameState FrameState.
     * @param {number} hitTolerance Hit tolerance in pixels.
     * @param {function(this: U, import("../layer/Layer.js").default): boolean} layerFilter Layer filter
     *     function, only layers which are visible and for which this function
     *     returns `true` will be tested for features.  By default, all visible
     *     layers will be tested.
     * @param {U} thisArg Value to use as `this` when executing `layerFilter`.
     * @return {boolean} Is there a feature at the given coordinate?
     * @template U
     */
    MapRenderer.prototype.hasFeatureAtCoordinate = function hasFeatureAtCoordinate (coordinate, frameState, hitTolerance, layerFilter, thisArg) {
      var hasFeature = this.forEachFeatureAtCoordinate(
        coordinate, frameState, hitTolerance, TRUE, this, layerFilter, thisArg);

      return hasFeature !== undefined;
    };

    /**
     * @param {import("../layer/Base.js").default} layer Layer.
     * @protected
     * @return {import("./Layer.js").default} Layer renderer.
     */
    MapRenderer.prototype.getLayerRenderer = function getLayerRenderer (layer) {
      var layerKey = getUid(layer);
      if (layerKey in this.layerRenderers_) {
        return this.layerRenderers_[layerKey];
      } else {
        var renderer;
        for (var i = 0, ii = this.layerRendererConstructors_.length; i < ii; ++i) {
          var candidate = this.layerRendererConstructors_[i];
          if (candidate['handles'](layer)) {
            renderer = candidate['create'](this, layer);
            break;
          }
        }
        if (renderer) {
          this.layerRenderers_[layerKey] = renderer;
          this.layerRendererListeners_[layerKey] = listen(renderer,
            EventType.CHANGE, this.handleLayerRendererChange_, this);
        } else {
          throw new Error('Unable to create renderer for layer: ' + layer.getType());
        }
        return renderer;
      }
    };

    /**
     * @param {string} layerKey Layer key.
     * @protected
     * @return {import("./Layer.js").default} Layer renderer.
     */
    MapRenderer.prototype.getLayerRendererByKey = function getLayerRendererByKey (layerKey) {
      return this.layerRenderers_[layerKey];
    };

    /**
     * @protected
     * @return {Object<string, import("./Layer.js").default>} Layer renderers.
     */
    MapRenderer.prototype.getLayerRenderers = function getLayerRenderers () {
      return this.layerRenderers_;
    };

    /**
     * @return {import("../PluggableMap.js").default} Map.
     */
    MapRenderer.prototype.getMap = function getMap () {
      return this.map_;
    };

    /**
     * Handle changes in a layer renderer.
     * @private
     */
    MapRenderer.prototype.handleLayerRendererChange_ = function handleLayerRendererChange_ () {
      this.map_.render();
    };

    /**
     * @param {string} layerKey Layer key.
     * @return {import("./Layer.js").default} Layer renderer.
     * @private
     */
    MapRenderer.prototype.removeLayerRendererByKey_ = function removeLayerRendererByKey_ (layerKey) {
      var layerRenderer = this.layerRenderers_[layerKey];
      delete this.layerRenderers_[layerKey];

      unlistenByKey(this.layerRendererListeners_[layerKey]);
      delete this.layerRendererListeners_[layerKey];

      return layerRenderer;
    };

    /**
     * @param {import("../PluggableMap.js").default} map Map.
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @private
     */
    MapRenderer.prototype.removeUnusedLayerRenderers_ = function removeUnusedLayerRenderers_ (map, frameState) {
      for (var layerKey in this.layerRenderers_) {
        if (!frameState || !(layerKey in frameState.layerStates)) {
          this.removeLayerRendererByKey_(layerKey).dispose();
        }
      }
    };

    /**
     * Render.
     * @abstract
     * @param {?import("../PluggableMap.js").FrameState} frameState Frame state.
     */
    MapRenderer.prototype.renderFrame = function renderFrame (frameState) {
      abstract();
    };

    /**
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @protected
     */
    MapRenderer.prototype.scheduleExpireIconCache = function scheduleExpireIconCache (frameState) {
      frameState.postRenderFunctions.push(/** @type {import("../PluggableMap.js").PostRenderFunction} */ (expireIconCache));
    };

    /**
     * @param {!import("../PluggableMap.js").FrameState} frameState Frame state.
     * @protected
     */
    MapRenderer.prototype.scheduleRemoveUnusedLayerRenderers = function scheduleRemoveUnusedLayerRenderers (frameState) {
      for (var layerKey in this.layerRenderers_) {
        if (!(layerKey in frameState.layerStates)) {
          frameState.postRenderFunctions.push(
            /** @type {import("../PluggableMap.js").PostRenderFunction} */ (this.removeUnusedLayerRenderers_.bind(this))
          );
          return;
        }
      }
    };

    return MapRenderer;
  }(Disposable));


  /**
   * @param {import("../PluggableMap.js").default} map Map.
   * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
   */
  function expireIconCache(map, frameState) {
    shared.expire();
  }


  /**
   * @param {import("../layer/Layer.js").State} state1 First layer state.
   * @param {import("../layer/Layer.js").State} state2 Second layer state.
   * @return {number} The zIndex difference.
   */
  function sortByZIndex(state1, state2) {
    return state1.zIndex - state2.zIndex;
  }

  /**
   * @module ol/renderer/canvas/Map
   */


  /**
   * @type {Array<typeof import("../Layer.js").default>}
   */
  var layerRendererConstructors = [];

  /**
   * @classdesc
   * Canvas map renderer.
   * @api
   */
  var CanvasMapRenderer = /*@__PURE__*/(function (MapRenderer) {
    function CanvasMapRenderer(map) {
      MapRenderer.call(this, map);

      var container = map.getViewport();

      /**
       * @private
       * @type {CanvasRenderingContext2D}
       */
      this.context_ = createCanvasContext2D();

      /**
       * @private
       * @type {HTMLCanvasElement}
       */
      this.canvas_ = this.context_.canvas;

      this.canvas_.style.width = '100%';
      this.canvas_.style.height = '100%';
      this.canvas_.style.display = 'block';
      this.canvas_.className = CLASS_UNSELECTABLE;
      container.insertBefore(this.canvas_, container.childNodes[0] || null);

      /**
       * @private
       * @type {boolean}
       */
      this.renderedVisible_ = true;

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.transform_ = create();

    }

    if ( MapRenderer ) CanvasMapRenderer.__proto__ = MapRenderer;
    CanvasMapRenderer.prototype = Object.create( MapRenderer && MapRenderer.prototype );
    CanvasMapRenderer.prototype.constructor = CanvasMapRenderer;

    /**
     * @param {import("../../render/EventType.js").default} type Event type.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     */
    CanvasMapRenderer.prototype.dispatchRenderEvent = function dispatchRenderEvent (type, frameState) {
      var map = this.getMap();
      var context = this.context_;
      if (map.hasListener(type)) {
        var extent = frameState.extent;
        var pixelRatio = frameState.pixelRatio;
        var viewState = frameState.viewState;
        var rotation = viewState.rotation;

        var transform = this.getTransform(frameState);

        var vectorContext = new CanvasImmediateRenderer(context, pixelRatio,
          extent, transform, rotation);
        var composeEvent = new RenderEvent(type, vectorContext,
          frameState, context, null);
        map.dispatchEvent(composeEvent);
      }
    };

    /**
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @protected
     * @return {!import("../../transform.js").Transform} Transform.
     */
    CanvasMapRenderer.prototype.getTransform = function getTransform (frameState) {
      var viewState = frameState.viewState;
      var dx1 = this.canvas_.width / 2;
      var dy1 = this.canvas_.height / 2;
      var sx = frameState.pixelRatio / viewState.resolution;
      var sy = -sx;
      var angle = -viewState.rotation;
      var dx2 = -viewState.center[0];
      var dy2 = -viewState.center[1];
      return compose(this.transform_, dx1, dy1, sx, sy, angle, dx2, dy2);
    };

    /**
     * @inheritDoc
     */
    CanvasMapRenderer.prototype.renderFrame = function renderFrame (frameState) {

      if (!frameState) {
        if (this.renderedVisible_) {
          this.canvas_.style.display = 'none';
          this.renderedVisible_ = false;
        }
        return;
      }

      var context = this.context_;
      var pixelRatio = frameState.pixelRatio;
      var width = Math.round(frameState.size[0] * pixelRatio);
      var height = Math.round(frameState.size[1] * pixelRatio);
      if (this.canvas_.width != width || this.canvas_.height != height) {
        this.canvas_.width = width;
        this.canvas_.height = height;
      } else {
        context.clearRect(0, 0, width, height);
      }

      var rotation = frameState.viewState.rotation;

      this.calculateMatrices2D(frameState);

      this.dispatchRenderEvent(RenderEventType.PRECOMPOSE, frameState);

      var layerStatesArray = frameState.layerStatesArray;
      stableSort(layerStatesArray, sortByZIndex);

      if (rotation) {
        context.save();
        rotateAtOffset(context, rotation, width / 2, height / 2);
      }

      var viewResolution = frameState.viewState.resolution;
      var i, ii;
      for (i = 0, ii = layerStatesArray.length; i < ii; ++i) {
        var layerState = layerStatesArray[i];
        var layer = layerState.layer;
        var layerRenderer = /** @type {import("./Layer.js").default} */ (this.getLayerRenderer(layer));
        if (!visibleAtResolution(layerState, viewResolution) ||
            layerState.sourceState != SourceState.READY) {
          continue;
        }
        if (layerRenderer.prepareFrame(frameState, layerState)) {
          layerRenderer.composeFrame(frameState, layerState, context);
        }
      }

      if (rotation) {
        context.restore();
      }

      this.dispatchRenderEvent(RenderEventType.POSTCOMPOSE, frameState);

      if (!this.renderedVisible_) {
        this.canvas_.style.display = '';
        this.renderedVisible_ = true;
      }

      this.scheduleRemoveUnusedLayerRenderers(frameState);
      this.scheduleExpireIconCache(frameState);
    };

    /**
     * @inheritDoc
     */
    CanvasMapRenderer.prototype.forEachLayerAtPixel = function forEachLayerAtPixel (pixel, frameState, hitTolerance, callback, thisArg, layerFilter, thisArg2) {
      var result;
      var viewState = frameState.viewState;
      var viewResolution = viewState.resolution;

      var layerStates = frameState.layerStatesArray;
      var numLayers = layerStates.length;

      var coordinate = apply(
        frameState.pixelToCoordinateTransform, pixel.slice());

      var i;
      for (i = numLayers - 1; i >= 0; --i) {
        var layerState = layerStates[i];
        var layer = layerState.layer;
        if (visibleAtResolution(layerState, viewResolution) && layerFilter.call(thisArg2, layer)) {
          var layerRenderer = /** @type {import("./Layer.js").default} */ (this.getLayerRenderer(layer));
          result = layerRenderer.forEachLayerAtCoordinate(
            coordinate, frameState, hitTolerance, callback, thisArg);
          if (result) {
            return result;
          }
        }
      }
      return undefined;
    };

    /**
     * @inheritDoc
     */
    CanvasMapRenderer.prototype.registerLayerRenderers = function registerLayerRenderers (constructors) {
      MapRenderer.prototype.registerLayerRenderers.call(this, constructors);
      for (var i = 0, ii = constructors.length; i < ii; ++i) {
        var ctor = constructors[i];
        if (!includes(layerRendererConstructors, ctor)) {
          layerRendererConstructors.push(ctor);
        }
      }
    };

    return CanvasMapRenderer;
  }(MapRenderer));

  /**
   * @module ol/renderer/Layer
   */

  var LayerRenderer = /*@__PURE__*/(function (Observable) {
    function LayerRenderer(layer) {

      Observable.call(this);

      /**
       * @private
       * @type {import("../layer/Layer.js").default}
       */
      this.layer_ = layer;

    }

    if ( Observable ) LayerRenderer.__proto__ = Observable;
    LayerRenderer.prototype = Object.create( Observable && Observable.prototype );
    LayerRenderer.prototype.constructor = LayerRenderer;

    /**
     * Create a function that adds loaded tiles to the tile lookup.
     * @param {import("../source/Tile.js").default} source Tile source.
     * @param {import("../proj/Projection.js").default} projection Projection of the tiles.
     * @param {Object<number, Object<string, import("../Tile.js").default>>} tiles Lookup of loaded tiles by zoom level.
     * @return {function(number, import("../TileRange.js").default):boolean} A function that can be
     *     called with a zoom level and a tile range to add loaded tiles to the lookup.
     * @protected
     */
    LayerRenderer.prototype.createLoadedTileFinder = function createLoadedTileFinder (source, projection, tiles) {
      return (
        /**
         * @param {number} zoom Zoom level.
         * @param {import("../TileRange.js").default} tileRange Tile range.
         * @return {boolean} The tile range is fully loaded.
         */
        function(zoom, tileRange) {
          /**
           * @param {import("../Tile.js").default} tile Tile.
           */
          function callback(tile) {
            if (!tiles[zoom]) {
              tiles[zoom] = {};
            }
            tiles[zoom][tile.tileCoord.toString()] = tile;
          }
          return source.forEachLoadedTile(projection, zoom, tileRange, callback);
        }
      );
    };

    /**
     * @abstract
     * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @param {number} hitTolerance Hit tolerance in pixels.
     * @param {function(import("../Feature.js").FeatureLike, import("../layer/Layer.js").default): T} callback Feature callback.
     * @return {T|void} Callback result.
     * @template T
     */
    LayerRenderer.prototype.forEachFeatureAtCoordinate = function forEachFeatureAtCoordinate (coordinate, frameState, hitTolerance, callback) {};

    /**
     * @return {import("../layer/Layer.js").default} Layer.
     */
    LayerRenderer.prototype.getLayer = function getLayer () {
      return this.layer_;
    };

    /**
     * Handle changes in image state.
     * @param {import("../events/Event.js").default} event Image change event.
     * @private
     */
    LayerRenderer.prototype.handleImageChange_ = function handleImageChange_ (event) {
      var image = /** @type {import("../Image.js").default} */ (event.target);
      if (image.getState() === ImageState.LOADED) {
        this.renderIfReadyAndVisible();
      }
    };

    /**
     * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @return {boolean} Is there a feature at the given coordinate?
     */
    LayerRenderer.prototype.hasFeatureAtCoordinate = function hasFeatureAtCoordinate (coordinate, frameState) {
      return false;
    };

    /**
     * Load the image if not already loaded, and register the image change
     * listener if needed.
     * @param {import("../ImageBase.js").default} image Image.
     * @return {boolean} `true` if the image is already loaded, `false` otherwise.
     * @protected
     */
    LayerRenderer.prototype.loadImage = function loadImage (image) {
      var imageState = image.getState();
      if (imageState != ImageState.LOADED && imageState != ImageState.ERROR) {
        listen(image, EventType.CHANGE, this.handleImageChange_, this);
      }
      if (imageState == ImageState.IDLE) {
        image.load();
        imageState = image.getState();
      }
      return imageState == ImageState.LOADED;
    };

    /**
     * @protected
     */
    LayerRenderer.prototype.renderIfReadyAndVisible = function renderIfReadyAndVisible () {
      var layer = this.getLayer();
      if (layer.getVisible() && layer.getSourceState() == SourceState.READY) {
        this.changed();
      }
    };

    /**
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../source/Tile.js").default} tileSource Tile source.
     * @protected
     */
    LayerRenderer.prototype.scheduleExpireCache = function scheduleExpireCache (frameState, tileSource) {
      if (tileSource.canExpireCache()) {
        /**
         * @param {import("../source/Tile.js").default} tileSource Tile source.
         * @param {import("../PluggableMap.js").default} map Map.
         * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
         */
        var postRenderFunction = function(tileSource, map, frameState) {
          var tileSourceKey = getUid(tileSource);
          if (tileSourceKey in frameState.usedTiles) {
            tileSource.expireCache(frameState.viewState.projection,
              frameState.usedTiles[tileSourceKey]);
          }
        }.bind(null, tileSource);

        frameState.postRenderFunctions.push(
          /** @type {import("../PluggableMap.js").PostRenderFunction} */ (postRenderFunction)
        );
      }
    };

    /**
     * @param {!Object<string, !Object<string, import("../TileRange.js").default>>} usedTiles Used tiles.
     * @param {import("../source/Tile.js").default} tileSource Tile source.
     * @param {number} z Z.
     * @param {import("../TileRange.js").default} tileRange Tile range.
     * @protected
     */
    LayerRenderer.prototype.updateUsedTiles = function updateUsedTiles (usedTiles, tileSource, z, tileRange) {
      // FIXME should we use tilesToDrawByZ instead?
      var tileSourceKey = getUid(tileSource);
      var zKey = z.toString();
      if (tileSourceKey in usedTiles) {
        if (zKey in usedTiles[tileSourceKey]) {
          usedTiles[tileSourceKey][zKey].extend(tileRange);
        } else {
          usedTiles[tileSourceKey][zKey] = tileRange;
        }
      } else {
        usedTiles[tileSourceKey] = {};
        usedTiles[tileSourceKey][zKey] = tileRange;
      }
    };

    /**
     * Manage tile pyramid.
     * This function performs a number of functions related to the tiles at the
     * current zoom and lower zoom levels:
     * - registers idle tiles in frameState.wantedTiles so that they are not
     *   discarded by the tile queue
     * - enqueues missing tiles
     * @param {import("../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../source/Tile.js").default} tileSource Tile source.
     * @param {import("../tilegrid/TileGrid.js").default} tileGrid Tile grid.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @param {import("../extent.js").Extent} extent Extent.
     * @param {number} currentZ Current Z.
     * @param {number} preload Load low resolution tiles up to 'preload' levels.
     * @param {function(this: T, import("../Tile.js").default)=} opt_tileCallback Tile callback.
     * @param {T=} opt_this Object to use as `this` in `opt_tileCallback`.
     * @protected
     * @template T
     */
    LayerRenderer.prototype.manageTilePyramid = function manageTilePyramid (
      frameState,
      tileSource,
      tileGrid,
      pixelRatio,
      projection,
      extent,
      currentZ,
      preload,
      opt_tileCallback,
      opt_this
    ) {
      var tileSourceKey = getUid(tileSource);
      if (!(tileSourceKey in frameState.wantedTiles)) {
        frameState.wantedTiles[tileSourceKey] = {};
      }
      var wantedTiles = frameState.wantedTiles[tileSourceKey];
      var tileQueue = frameState.tileQueue;
      var minZoom = tileGrid.getMinZoom();
      var tile, tileRange, tileResolution, x, y, z;
      for (z = minZoom; z <= currentZ; ++z) {
        tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z, tileRange);
        tileResolution = tileGrid.getResolution(z);
        for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
          for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
            if (currentZ - z <= preload) {
              tile = tileSource.getTile(z, x, y, pixelRatio, projection);
              if (tile.getState() == TileState.IDLE) {
                wantedTiles[tile.getKey()] = true;
                if (!tileQueue.isKeyQueued(tile.getKey())) {
                  tileQueue.enqueue([tile, tileSourceKey,
                    tileGrid.getTileCoordCenter(tile.tileCoord), tileResolution]);
                }
              }
              if (opt_tileCallback !== undefined) {
                opt_tileCallback.call(opt_this, tile);
              }
            } else {
              tileSource.useTile(z, x, y, projection);
            }
          }
        }
      }
    };

    return LayerRenderer;
  }(Observable));

  /**
   * @module ol/renderer/canvas/Layer
   */

  /**
   * @abstract
   */
  var CanvasLayerRenderer = /*@__PURE__*/(function (LayerRenderer) {
    function CanvasLayerRenderer(layer) {

      LayerRenderer.call(this, layer);

      /**
       * @protected
       * @type {number}
       */
      this.renderedResolution;

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.transform_ = create();

    }

    if ( LayerRenderer ) CanvasLayerRenderer.__proto__ = LayerRenderer;
    CanvasLayerRenderer.prototype = Object.create( LayerRenderer && LayerRenderer.prototype );
    CanvasLayerRenderer.prototype.constructor = CanvasLayerRenderer;

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../extent.js").Extent} extent Clip extent.
     * @protected
     */
    CanvasLayerRenderer.prototype.clip = function clip (context, frameState, extent) {
      var pixelRatio = frameState.pixelRatio;
      var width = frameState.size[0] * pixelRatio;
      var height = frameState.size[1] * pixelRatio;
      var rotation = frameState.viewState.rotation;
      var topLeft = getTopLeft(extent);
      var topRight = getTopRight(extent);
      var bottomRight = getBottomRight(extent);
      var bottomLeft = getBottomLeft(extent);

      apply(frameState.coordinateToPixelTransform, topLeft);
      apply(frameState.coordinateToPixelTransform, topRight);
      apply(frameState.coordinateToPixelTransform, bottomRight);
      apply(frameState.coordinateToPixelTransform, bottomLeft);

      context.save();
      rotateAtOffset(context, -rotation, width / 2, height / 2);
      context.beginPath();
      context.moveTo(topLeft[0] * pixelRatio, topLeft[1] * pixelRatio);
      context.lineTo(topRight[0] * pixelRatio, topRight[1] * pixelRatio);
      context.lineTo(bottomRight[0] * pixelRatio, bottomRight[1] * pixelRatio);
      context.lineTo(bottomLeft[0] * pixelRatio, bottomLeft[1] * pixelRatio);
      context.clip();
      rotateAtOffset(context, rotation, width / 2, height / 2);
    };

    /**
     * @param {import("../../render/EventType.js").default} type Event type.
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../transform.js").Transform=} opt_transform Transform.
     * @private
     */
    CanvasLayerRenderer.prototype.dispatchComposeEvent_ = function dispatchComposeEvent_ (type, context, frameState, opt_transform) {
      var layer = this.getLayer();
      if (layer.hasListener(type)) {
        var width = frameState.size[0] * frameState.pixelRatio;
        var height = frameState.size[1] * frameState.pixelRatio;
        var rotation = frameState.viewState.rotation;
        rotateAtOffset(context, -rotation, width / 2, height / 2);
        var transform = opt_transform !== undefined ?
          opt_transform : this.getTransform(frameState, 0);
        var render = new CanvasImmediateRenderer(
          context, frameState.pixelRatio, frameState.extent, transform,
          frameState.viewState.rotation);
        var composeEvent = new RenderEvent(type, render, frameState,
          context, null);
        layer.dispatchEvent(composeEvent);
        rotateAtOffset(context, rotation, width / 2, height / 2);
      }
    };

    /**
     * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
     * @param {import("../../PluggableMap.js").FrameState} frameState FrameState.
     * @param {number} hitTolerance Hit tolerance in pixels.
     * @param {function(this: S, import("../../layer/Layer.js").default, (Uint8ClampedArray|Uint8Array)): T} callback Layer
     *     callback.
     * @param {S} thisArg Value to use as `this` when executing `callback`.
     * @return {T|undefined} Callback result.
     * @template S,T,U
     */
    CanvasLayerRenderer.prototype.forEachLayerAtCoordinate = function forEachLayerAtCoordinate (coordinate, frameState, hitTolerance, callback, thisArg) {
      var hasFeature = this.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, TRUE);

      if (hasFeature) {
        return callback.call(thisArg, this.getLayer(), null);
      } else {
        return undefined;
      }
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../layer/Layer.js").State} layerState Layer state.
     * @param {import("../../transform.js").Transform=} opt_transform Transform.
     * @protected
     */
    CanvasLayerRenderer.prototype.postCompose = function postCompose (context, frameState, layerState, opt_transform) {
      this.dispatchComposeEvent_(RenderEventType.POSTCOMPOSE, context, frameState, opt_transform);
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../transform.js").Transform=} opt_transform Transform.
     * @protected
     */
    CanvasLayerRenderer.prototype.preCompose = function preCompose (context, frameState, opt_transform) {
      this.dispatchComposeEvent_(RenderEventType.PRECOMPOSE, context, frameState, opt_transform);
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../transform.js").Transform=} opt_transform Transform.
     * @protected
     */
    CanvasLayerRenderer.prototype.dispatchRenderEvent = function dispatchRenderEvent (context, frameState, opt_transform) {
      this.dispatchComposeEvent_(RenderEventType.RENDER, context, frameState, opt_transform);
    };

    /**
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {number} offsetX Offset on the x-axis in view coordinates.
     * @protected
     * @return {!import("../../transform.js").Transform} Transform.
     */
    CanvasLayerRenderer.prototype.getTransform = function getTransform (frameState, offsetX) {
      var viewState = frameState.viewState;
      var pixelRatio = frameState.pixelRatio;
      var dx1 = pixelRatio * frameState.size[0] / 2;
      var dy1 = pixelRatio * frameState.size[1] / 2;
      var sx = pixelRatio / viewState.resolution;
      var sy = -sx;
      var angle = -viewState.rotation;
      var dx2 = -viewState.center[0] + offsetX;
      var dy2 = -viewState.center[1];
      return compose(this.transform_, dx1, dy1, sx, sy, angle, dx2, dy2);
    };

    /**
     * @abstract
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../layer/Layer.js").State} layerState Layer state.
     * @param {CanvasRenderingContext2D} context Context.
     */
    CanvasLayerRenderer.prototype.composeFrame = function composeFrame (frameState, layerState, context) {
      abstract();
    };

    /**
     * @abstract
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../layer/Layer.js").State} layerState Layer state.
     * @return {boolean} whether composeFrame should be called.
     */
    CanvasLayerRenderer.prototype.prepareFrame = function prepareFrame (frameState, layerState) {
      return abstract();
    };

    return CanvasLayerRenderer;
  }(LayerRenderer));

  /**
   * @module ol/renderer/canvas/IntermediateCanvas
   */

  /**
   * @abstract
   */
  var IntermediateCanvasRenderer = /*@__PURE__*/(function (CanvasLayerRenderer) {
    function IntermediateCanvasRenderer(layer) {

      CanvasLayerRenderer.call(this, layer);

      /**
       * @protected
       * @type {import("../../transform.js").Transform}
       */
      this.coordinateToCanvasPixelTransform = create();

      /**
       * @private
       * @type {CanvasRenderingContext2D}
       */
      this.hitCanvasContext_ = null;

    }

    if ( CanvasLayerRenderer ) IntermediateCanvasRenderer.__proto__ = CanvasLayerRenderer;
    IntermediateCanvasRenderer.prototype = Object.create( CanvasLayerRenderer && CanvasLayerRenderer.prototype );
    IntermediateCanvasRenderer.prototype.constructor = IntermediateCanvasRenderer;

    /**
     * @inheritDoc
     */
    IntermediateCanvasRenderer.prototype.composeFrame = function composeFrame (frameState, layerState, context) {

      this.preCompose(context, frameState);

      var image = this.getImage();
      if (image) {

        // clipped rendering if layer extent is set
        var extent = layerState.extent;
        var clipped = extent !== undefined &&
            !containsExtent(extent, frameState.extent) &&
            intersects(extent, frameState.extent);
        if (clipped) {
          this.clip(context, frameState, /** @type {import("../../extent.js").Extent} */ (extent));
        }

        var imageTransform = this.getImageTransform();
        // for performance reasons, context.save / context.restore is not used
        // to save and restore the transformation matrix and the opacity.
        // see http://jsperf.com/context-save-restore-versus-variable
        var alpha = context.globalAlpha;
        context.globalAlpha = layerState.opacity;

        // for performance reasons, context.setTransform is only used
        // when the view is rotated. see http://jsperf.com/canvas-transform
        var dx = imageTransform[4];
        var dy = imageTransform[5];
        var dw = image.width * imageTransform[0];
        var dh = image.height * imageTransform[3];
        if (dw >= 0.5 && dh >= 0.5) {
          context.drawImage(image, 0, 0, +image.width, +image.height,
            Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
        }
        context.globalAlpha = alpha;

        if (clipped) {
          context.restore();
        }
      }

      this.postCompose(context, frameState, layerState);
    };

    /**
     * @abstract
     * @return {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} Canvas.
     */
    IntermediateCanvasRenderer.prototype.getImage = function getImage () {
      return abstract();
    };

    /**
     * @abstract
     * @return {!import("../../transform.js").Transform} Image transform.
     */
    IntermediateCanvasRenderer.prototype.getImageTransform = function getImageTransform () {
      return abstract();
    };

    /**
     * @inheritDoc
     */
    IntermediateCanvasRenderer.prototype.forEachLayerAtCoordinate = function forEachLayerAtCoordinate (coordinate, frameState, hitTolerance, callback, thisArg) {
      if (!this.getImage()) {
        return undefined;
      }

      var pixel = apply(this.coordinateToCanvasPixelTransform, coordinate.slice());
      scale(pixel, frameState.viewState.resolution / this.renderedResolution);

      if (!this.hitCanvasContext_) {
        this.hitCanvasContext_ = createCanvasContext2D(1, 1);
      }

      this.hitCanvasContext_.clearRect(0, 0, 1, 1);
      this.hitCanvasContext_.drawImage(this.getImage(), pixel[0], pixel[1], 1, 1, 0, 0, 1, 1);

      var imageData = this.hitCanvasContext_.getImageData(0, 0, 1, 1).data;
      if (imageData[3] > 0) {
        return callback.call(thisArg, this.getLayer(), imageData);
      } else {
        return undefined;
      }
    };

    return IntermediateCanvasRenderer;
  }(CanvasLayerRenderer));

  /**
   * @module ol/renderer/canvas/ImageLayer
   */

  /**
   * @classdesc
   * Canvas renderer for image layers.
   * @api
   */
  var CanvasImageLayerRenderer = /*@__PURE__*/(function (IntermediateCanvasRenderer) {
    function CanvasImageLayerRenderer(imageLayer) {

      IntermediateCanvasRenderer.call(this, imageLayer);

      /**
       * @private
       * @type {?import("../../ImageBase.js").default}
       */
      this.image_ = null;

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.imageTransform_ = create();

      /**
       * @type {!Array<string>}
       */
      this.skippedFeatures_ = [];

      /**
       * @private
       * @type {import("./VectorLayer.js").default}
       */
      this.vectorRenderer_ = null;

      if (imageLayer.getType() === LayerType.VECTOR) {
        for (var i = 0, ii = layerRendererConstructors.length; i < ii; ++i) {
          var ctor = layerRendererConstructors[i];
          if (ctor !== CanvasImageLayerRenderer && ctor['handles'](imageLayer)) {
            this.vectorRenderer_ = /** @type {import("./VectorLayer.js").default} */ (new ctor(imageLayer));
            break;
          }
        }
      }

    }

    if ( IntermediateCanvasRenderer ) CanvasImageLayerRenderer.__proto__ = IntermediateCanvasRenderer;
    CanvasImageLayerRenderer.prototype = Object.create( IntermediateCanvasRenderer && IntermediateCanvasRenderer.prototype );
    CanvasImageLayerRenderer.prototype.constructor = CanvasImageLayerRenderer;

    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.disposeInternal = function disposeInternal () {
      if (this.vectorRenderer_) {
        this.vectorRenderer_.dispose();
      }
      IntermediateCanvasRenderer.prototype.disposeInternal.call(this);
    };

    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.getImage = function getImage () {
      return !this.image_ ? null : this.image_.getImage();
    };

    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.getImageTransform = function getImageTransform () {
      return this.imageTransform_;
    };

    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.prepareFrame = function prepareFrame (frameState, layerState) {

      var pixelRatio = frameState.pixelRatio;
      var size = frameState.size;
      var viewState = frameState.viewState;
      var viewCenter = viewState.center;
      var viewResolution = viewState.resolution;

      var image;
      var imageLayer = /** @type {import("../../layer/Image.js").default} */ (this.getLayer());
      var imageSource = /** @type {import("../../source/Image.js").default} */ (imageLayer.getSource());

      var hints = frameState.viewHints;

      var vectorRenderer = this.vectorRenderer_;
      var renderedExtent = frameState.extent;
      if (!vectorRenderer && layerState.extent !== undefined) {
        renderedExtent = getIntersection(renderedExtent, layerState.extent);
      }

      if (!hints[ViewHint.ANIMATING] && !hints[ViewHint.INTERACTING] &&
          !isEmpty$1(renderedExtent)) {
        var projection = viewState.projection;
        var skippedFeatures = this.skippedFeatures_;
        if (vectorRenderer) {
          var context = vectorRenderer.context;
          var imageFrameState = /** @type {import("../../PluggableMap.js").FrameState} */ (assign({}, frameState, {
            size: [
              getWidth(renderedExtent) / viewResolution,
              getHeight(renderedExtent) / viewResolution
            ],
            viewState: /** @type {import("../../View.js").State} */ (assign({}, frameState.viewState, {
              rotation: 0
            }))
          }));
          var newSkippedFeatures = Object.keys(imageFrameState.skippedFeatureUids).sort();
          image = new ImageCanvas(renderedExtent, viewResolution, pixelRatio, context.canvas, function(callback) {
            if (vectorRenderer.prepareFrame(imageFrameState, layerState) &&
                (vectorRenderer.replayGroupChanged ||
                !equals(skippedFeatures, newSkippedFeatures))) {
              context.canvas.width = imageFrameState.size[0] * pixelRatio;
              context.canvas.height = imageFrameState.size[1] * pixelRatio;
              vectorRenderer.compose(context, imageFrameState, layerState);
              skippedFeatures = newSkippedFeatures;
              callback();
            }
          });
        } else {
          image = imageSource.getImage(
            renderedExtent, viewResolution, pixelRatio, projection);
        }
        if (image && this.loadImage(image)) {
          this.image_ = image;
          this.skippedFeatures_ = skippedFeatures;
        }
      }

      if (this.image_) {
        image = this.image_;
        var imageExtent = image.getExtent();
        var imageResolution = image.getResolution();
        var imagePixelRatio = image.getPixelRatio();
        var scale = pixelRatio * imageResolution /
            (viewResolution * imagePixelRatio);
        var transform = compose(this.imageTransform_,
          pixelRatio * size[0] / 2, pixelRatio * size[1] / 2,
          scale, scale,
          0,
          imagePixelRatio * (imageExtent[0] - viewCenter[0]) / imageResolution,
          imagePixelRatio * (viewCenter[1] - imageExtent[3]) / imageResolution);
        compose(this.coordinateToCanvasPixelTransform,
          pixelRatio * size[0] / 2 - transform[4], pixelRatio * size[1] / 2 - transform[5],
          pixelRatio / viewResolution, -pixelRatio / viewResolution,
          0,
          -viewCenter[0], -viewCenter[1]);

        this.renderedResolution = imageResolution * pixelRatio / imagePixelRatio;
      }

      return !!this.image_;
    };

    /**
     * @inheritDoc
     */
    CanvasImageLayerRenderer.prototype.forEachFeatureAtCoordinate = function forEachFeatureAtCoordinate (coordinate, frameState, hitTolerance, callback) {
      if (this.vectorRenderer_) {
        return this.vectorRenderer_.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback);
      } else {
        return IntermediateCanvasRenderer.prototype.forEachFeatureAtCoordinate.call(this, coordinate, frameState, hitTolerance, callback);
      }
    };

    return CanvasImageLayerRenderer;
  }(IntermediateCanvasRenderer));


  /**
   * Determine if this renderer handles the provided layer.
   * @param {import("../../layer/Layer.js").default} layer The candidate layer.
   * @return {boolean} The renderer can render the layer.
   */
  CanvasImageLayerRenderer['handles'] = function(layer) {
    return layer.getType() === LayerType.IMAGE ||
      layer.getType() === LayerType.VECTOR &&
      /** @type {import("../../layer/Vector.js").default} */ (layer).getRenderMode() === VectorRenderType.IMAGE;
  };


  /**
   * Create a layer renderer.
   * @param {import("../Map.js").default} mapRenderer The map renderer.
   * @param {import("../../layer/Layer.js").default} layer The layer to be rendererd.
   * @return {CanvasImageLayerRenderer} The layer renderer.
   */
  CanvasImageLayerRenderer['create'] = function(mapRenderer, layer) {
    return new CanvasImageLayerRenderer(/** @type {import("../../layer/Image.js").default} */ (layer));
  };

  /**
   * @module ol/TileRange
   */

  /**
   * A representation of a contiguous block of tiles.  A tile range is specified
   * by its min/max tile coordinates and is inclusive of coordinates.
   */
  var TileRange = function TileRange(minX, maxX, minY, maxY) {

    /**
     * @type {number}
     */
    this.minX = minX;

    /**
     * @type {number}
     */
    this.maxX = maxX;

    /**
     * @type {number}
     */
    this.minY = minY;

    /**
     * @type {number}
     */
    this.maxY = maxY;

  };

  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {boolean} Contains tile coordinate.
   */
  TileRange.prototype.contains = function contains (tileCoord) {
    return this.containsXY(tileCoord[1], tileCoord[2]);
  };

  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Contains.
   */
  TileRange.prototype.containsTileRange = function containsTileRange (tileRange) {
    return this.minX <= tileRange.minX && tileRange.maxX <= this.maxX &&
       this.minY <= tileRange.minY && tileRange.maxY <= this.maxY;
  };

  /**
   * @param {number} x Tile coordinate x.
   * @param {number} y Tile coordinate y.
   * @return {boolean} Contains coordinate.
   */
  TileRange.prototype.containsXY = function containsXY (x, y) {
    return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
  };

  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Equals.
   */
  TileRange.prototype.equals = function equals (tileRange) {
    return this.minX == tileRange.minX && this.minY == tileRange.minY &&
       this.maxX == tileRange.maxX && this.maxY == tileRange.maxY;
  };

  /**
   * @param {TileRange} tileRange Tile range.
   */
  TileRange.prototype.extend = function extend (tileRange) {
    if (tileRange.minX < this.minX) {
      this.minX = tileRange.minX;
    }
    if (tileRange.maxX > this.maxX) {
      this.maxX = tileRange.maxX;
    }
    if (tileRange.minY < this.minY) {
      this.minY = tileRange.minY;
    }
    if (tileRange.maxY > this.maxY) {
      this.maxY = tileRange.maxY;
    }
  };

  /**
   * @return {number} Height.
   */
  TileRange.prototype.getHeight = function getHeight () {
    return this.maxY - this.minY + 1;
  };

  /**
   * @return {import("./size.js").Size} Size.
   */
  TileRange.prototype.getSize = function getSize () {
    return [this.getWidth(), this.getHeight()];
  };

  /**
   * @return {number} Width.
   */
  TileRange.prototype.getWidth = function getWidth () {
    return this.maxX - this.minX + 1;
  };

  /**
   * @param {TileRange} tileRange Tile range.
   * @return {boolean} Intersects.
   */
  TileRange.prototype.intersects = function intersects (tileRange) {
    return this.minX <= tileRange.maxX &&
       this.maxX >= tileRange.minX &&
       this.minY <= tileRange.maxY &&
       this.maxY >= tileRange.minY;
  };


  /**
   * @param {number} minX Minimum X.
   * @param {number} maxX Maximum X.
   * @param {number} minY Minimum Y.
   * @param {number} maxY Maximum Y.
   * @param {TileRange=} tileRange TileRange.
   * @return {TileRange} Tile range.
   */
  function createOrUpdate$1(minX, maxX, minY, maxY, tileRange) {
    if (tileRange !== undefined) {
      tileRange.minX = minX;
      tileRange.maxX = maxX;
      tileRange.minY = minY;
      tileRange.maxY = maxY;
      return tileRange;
    } else {
      return new TileRange(minX, maxX, minY, maxY);
    }
  }

  /**
   * @module ol/renderer/canvas/TileLayer
   */

  /**
   * @classdesc
   * Canvas renderer for tile layers.
   * @api
   */
  var CanvasTileLayerRenderer = /*@__PURE__*/(function (IntermediateCanvasRenderer) {
    function CanvasTileLayerRenderer(tileLayer, opt_noContext) {

      IntermediateCanvasRenderer.call(this, tileLayer);

      /**
       * @protected
       * @type {CanvasRenderingContext2D}
       */
      this.context = opt_noContext ? null : createCanvasContext2D();

      /**
       * @private
       * @type {number}
       */
      this.oversampling_;

      /**
       * @private
       * @type {import("../../extent.js").Extent}
       */
      this.renderedExtent_ = null;

      /**
       * @protected
       * @type {number}
       */
      this.renderedRevision;

      /**
       * @protected
       * @type {!Array<import("../../Tile.js").default>}
       */
      this.renderedTiles = [];

      /**
       * @private
       * @type {boolean}
       */
      this.newTiles_ = false;

      /**
       * @protected
       * @type {import("../../extent.js").Extent}
       */
      this.tmpExtent = createEmpty();

      /**
       * @private
       * @type {import("../../TileRange.js").default}
       */
      this.tmpTileRange_ = new TileRange(0, 0, 0, 0);

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.imageTransform_ = create();

      /**
       * @protected
       * @type {number}
       */
      this.zDirection = 0;

    }

    if ( IntermediateCanvasRenderer ) CanvasTileLayerRenderer.__proto__ = IntermediateCanvasRenderer;
    CanvasTileLayerRenderer.prototype = Object.create( IntermediateCanvasRenderer && IntermediateCanvasRenderer.prototype );
    CanvasTileLayerRenderer.prototype.constructor = CanvasTileLayerRenderer;

    /**
     * @private
     * @param {import("../../Tile.js").default} tile Tile.
     * @return {boolean} Tile is drawable.
     */
    CanvasTileLayerRenderer.prototype.isDrawableTile_ = function isDrawableTile_ (tile) {
      var tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
      var tileState = tile.getState();
      var useInterimTilesOnError = tileLayer.getUseInterimTilesOnError();
      return tileState == TileState.LOADED ||
          tileState == TileState.EMPTY ||
          tileState == TileState.ERROR && !useInterimTilesOnError;
    };

    /**
     * @param {number} z Tile coordinate z.
     * @param {number} x Tile coordinate x.
     * @param {number} y Tile coordinate y.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../../proj/Projection.js").default} projection Projection.
     * @return {!import("../../Tile.js").default} Tile.
     */
    CanvasTileLayerRenderer.prototype.getTile = function getTile (z, x, y, pixelRatio, projection) {
      var tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
      var tileSource = /** @type {import("../../source/Tile.js").default} */ (tileLayer.getSource());
      var tile = tileSource.getTile(z, x, y, pixelRatio, projection);
      if (tile.getState() == TileState.ERROR) {
        if (!tileLayer.getUseInterimTilesOnError()) {
          // When useInterimTilesOnError is false, we consider the error tile as loaded.
          tile.setState(TileState.LOADED);
        } else if (tileLayer.getPreload() > 0) {
          // Preloaded tiles for lower resolutions might have finished loading.
          this.newTiles_ = true;
        }
      }
      if (!this.isDrawableTile_(tile)) {
        tile = tile.getInterimTile();
      }
      return tile;
    };

    /**
     * @inheritDoc
     */
    CanvasTileLayerRenderer.prototype.prepareFrame = function prepareFrame (frameState, layerState) {

      var pixelRatio = frameState.pixelRatio;
      var size = frameState.size;
      var viewState = frameState.viewState;
      var projection = viewState.projection;
      var viewResolution = viewState.resolution;
      var viewCenter = viewState.center;

      var tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
      var tileSource = /** @type {import("../../source/Tile.js").default} */ (tileLayer.getSource());
      var sourceRevision = tileSource.getRevision();
      var tileGrid = tileSource.getTileGridForProjection(projection);
      var z = tileGrid.getZForResolution(viewResolution, this.zDirection);
      var tileResolution = tileGrid.getResolution(z);
      var oversampling = Math.round(viewResolution / tileResolution) || 1;
      var extent = frameState.extent;

      if (layerState.extent !== undefined) {
        extent = getIntersection(extent, layerState.extent);
      }
      if (isEmpty$1(extent)) {
        // Return false to prevent the rendering of the layer.
        return false;
      }

      var tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
      var imageExtent = tileGrid.getTileRangeExtent(z, tileRange);

      var tilePixelRatio = tileSource.getTilePixelRatio(pixelRatio);

      /**
       * @type {Object<number, Object<string, import("../../Tile.js").default>>}
       */
      var tilesToDrawByZ = {};
      tilesToDrawByZ[z] = {};

      var findLoadedTiles = this.createLoadedTileFinder(
        tileSource, projection, tilesToDrawByZ);

      var hints = frameState.viewHints;
      var animatingOrInteracting = hints[ViewHint.ANIMATING] || hints[ViewHint.INTERACTING];

      var tmpExtent = this.tmpExtent;
      var tmpTileRange = this.tmpTileRange_;
      this.newTiles_ = false;
      var tile, x, y;
      for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
        for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
          if (Date.now() - frameState.time > 16 && animatingOrInteracting) {
            continue;
          }
          tile = this.getTile(z, x, y, pixelRatio, projection);
          if (this.isDrawableTile_(tile)) {
            var uid = getUid(this);
            if (tile.getState() == TileState.LOADED) {
              tilesToDrawByZ[z][tile.tileCoord.toString()] = tile;
              var inTransition = tile.inTransition(uid);
              if (!this.newTiles_ && (inTransition || this.renderedTiles.indexOf(tile) === -1)) {
                this.newTiles_ = true;
              }
            }
            if (tile.getAlpha(uid, frameState.time) === 1) {
              // don't look for alt tiles if alpha is 1
              continue;
            }
          }

          var childTileRange = tileGrid.getTileCoordChildTileRange(
            tile.tileCoord, tmpTileRange, tmpExtent);
          var covered = false;
          if (childTileRange) {
            covered = findLoadedTiles(z + 1, childTileRange);
          }
          if (!covered) {
            tileGrid.forEachTileCoordParentTileRange(
              tile.tileCoord, findLoadedTiles, null, tmpTileRange, tmpExtent);
          }

        }
      }

      var renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
      if (!(this.renderedResolution && Date.now() - frameState.time > 16 && animatingOrInteracting) && (
        this.newTiles_ ||
            !(this.renderedExtent_ && containsExtent(this.renderedExtent_, extent)) ||
            this.renderedRevision != sourceRevision ||
            oversampling != this.oversampling_ ||
            !animatingOrInteracting && renderedResolution != this.renderedResolution
      )) {

        var context = this.context;
        if (context) {
          var tilePixelSize = tileSource.getTilePixelSize(z, pixelRatio, projection);
          var width = Math.round(tileRange.getWidth() * tilePixelSize[0] / oversampling);
          var height = Math.round(tileRange.getHeight() * tilePixelSize[1] / oversampling);
          var canvas = context.canvas;
          if (canvas.width != width || canvas.height != height) {
            this.oversampling_ = oversampling;
            canvas.width = width;
            canvas.height = height;
          } else {
            if (this.renderedExtent_ && !equals$2(imageExtent, this.renderedExtent_)) {
              context.clearRect(0, 0, width, height);
            }
            oversampling = this.oversampling_;
          }
        }

        this.renderedTiles.length = 0;
        /** @type {Array<number>} */
        var zs = Object.keys(tilesToDrawByZ).map(Number);
        zs.sort(function(a, b) {
          if (a === z) {
            return 1;
          } else if (b === z) {
            return -1;
          } else {
            return a > b ? 1 : a < b ? -1 : 0;
          }
        });
        var currentResolution, currentScale, currentTilePixelSize, currentZ, i, ii;
        var tileExtent, tileGutter, tilesToDraw, w, h;
        for (i = 0, ii = zs.length; i < ii; ++i) {
          currentZ = zs[i];
          currentTilePixelSize = tileSource.getTilePixelSize(currentZ, pixelRatio, projection);
          currentResolution = tileGrid.getResolution(currentZ);
          currentScale = currentResolution / tileResolution;
          tileGutter = tilePixelRatio * tileSource.getGutterForProjection(projection);
          tilesToDraw = tilesToDrawByZ[currentZ];
          for (var tileCoordKey in tilesToDraw) {
            tile = tilesToDraw[tileCoordKey];
            tileExtent = tileGrid.getTileCoordExtent(tile.getTileCoord(), tmpExtent);
            x = (tileExtent[0] - imageExtent[0]) / tileResolution * tilePixelRatio / oversampling;
            y = (imageExtent[3] - tileExtent[3]) / tileResolution * tilePixelRatio / oversampling;
            w = currentTilePixelSize[0] * currentScale / oversampling;
            h = currentTilePixelSize[1] * currentScale / oversampling;
            this.drawTileImage(tile, frameState, layerState, x, y, w, h, tileGutter, z === currentZ);
            this.renderedTiles.push(tile);
          }
        }

        this.renderedRevision = sourceRevision;
        this.renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
        this.renderedExtent_ = imageExtent;
      }

      var scale = this.renderedResolution / viewResolution;
      var transform = compose(this.imageTransform_,
        pixelRatio * size[0] / 2, pixelRatio * size[1] / 2,
        scale, scale,
        0,
        (this.renderedExtent_[0] - viewCenter[0]) / this.renderedResolution * pixelRatio,
        (viewCenter[1] - this.renderedExtent_[3]) / this.renderedResolution * pixelRatio);
      compose(this.coordinateToCanvasPixelTransform,
        pixelRatio * size[0] / 2 - transform[4], pixelRatio * size[1] / 2 - transform[5],
        pixelRatio / viewResolution, -pixelRatio / viewResolution,
        0,
        -viewCenter[0], -viewCenter[1]);


      this.updateUsedTiles(frameState.usedTiles, tileSource, z, tileRange);
      this.manageTilePyramid(frameState, tileSource, tileGrid, pixelRatio,
        projection, extent, z, tileLayer.getPreload());
      this.scheduleExpireCache(frameState, tileSource);

      return this.renderedTiles.length > 0;
    };

    /**
     * @param {import("../../Tile.js").default} tile Tile.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../layer/Layer.js").State} layerState Layer state.
     * @param {number} x Left of the tile.
     * @param {number} y Top of the tile.
     * @param {number} w Width of the tile.
     * @param {number} h Height of the tile.
     * @param {number} gutter Tile gutter.
     * @param {boolean} transition Apply an alpha transition.
     */
    CanvasTileLayerRenderer.prototype.drawTileImage = function drawTileImage (tile, frameState, layerState, x, y, w, h, gutter, transition) {
      var image = this.getTileImage(tile);
      if (!image) {
        return;
      }
      var uid = getUid(this);
      var alpha = transition ? tile.getAlpha(uid, frameState.time) : 1;
      var tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
      var tileSource = /** @type {import("../../source/Tile.js").default} */ (tileLayer.getSource());
      if (alpha === 1 && !tileSource.getOpaque(frameState.viewState.projection)) {
        this.context.clearRect(x, y, w, h);
      }
      var alphaChanged = alpha !== this.context.globalAlpha;
      if (alphaChanged) {
        this.context.save();
        this.context.globalAlpha = alpha;
      }
      this.context.drawImage(image, gutter, gutter,
        image.width - 2 * gutter, image.height - 2 * gutter, x, y, w, h);

      if (alphaChanged) {
        this.context.restore();
      }
      if (alpha !== 1) {
        frameState.animate = true;
      } else if (transition) {
        tile.endTransition(uid);
      }
    };

    /**
     * @inheritDoc
     */
    CanvasTileLayerRenderer.prototype.getImage = function getImage () {
      var context = this.context;
      return context ? context.canvas : null;
    };

    /**
     * @inheritDoc
     */
    CanvasTileLayerRenderer.prototype.getImageTransform = function getImageTransform () {
      return this.imageTransform_;
    };

    /**
     * Get the image from a tile.
     * @param {import("../../Tile.js").default} tile Tile.
     * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
     * @protected
     */
    CanvasTileLayerRenderer.prototype.getTileImage = function getTileImage (tile) {
      return /** @type {import("../../ImageTile.js").default} */ (tile).getImage();
    };

    return CanvasTileLayerRenderer;
  }(IntermediateCanvasRenderer));


  /**
   * Determine if this renderer handles the provided layer.
   * @param {import("../../layer/Layer.js").default} layer The candidate layer.
   * @return {boolean} The renderer can render the layer.
   */
  CanvasTileLayerRenderer['handles'] = function(layer) {
    return layer.getType() === LayerType.TILE;
  };


  /**
   * Create a layer renderer.
   * @param {import("../Map.js").default} mapRenderer The map renderer.
   * @param {import("../../layer/Layer.js").default} layer The layer to be rendererd.
   * @return {CanvasTileLayerRenderer} The layer renderer.
   */
  CanvasTileLayerRenderer['create'] = function(mapRenderer, layer) {
    return new CanvasTileLayerRenderer(/** @type {import("../../layer/Tile.js").default} */ (layer));
  };


  /**
   * @function
   * @return {import("../../layer/Tile.js").default|import("../../layer/VectorTile.js").default}
   */
  CanvasTileLayerRenderer.prototype.getLayer;

  /**
   * @module ol/render/ReplayGroup
   */

  /**
   * Base class for replay groups.
   */
  var ReplayGroup = function ReplayGroup () {};

  ReplayGroup.prototype.getReplay = function getReplay (zIndex, replayType) {
    return abstract();
  };

  /**
   * @abstract
   * @return {boolean} Is empty.
   */
  ReplayGroup.prototype.isEmpty = function isEmpty () {
    return abstract();
  };

  /**
   * @abstract
   * @param {boolean} group Group with previous replay
   * @return {Array<*>} The resulting instruction group
   */
  ReplayGroup.prototype.addDeclutter = function addDeclutter (group) {
    return abstract();
  };

  /**
   * @module ol/render/ReplayType
   */

  /**
   * @enum {string}
   */
  var ReplayType = {
    CIRCLE: 'Circle',
    DEFAULT: 'Default',
    IMAGE: 'Image',
    LINE_STRING: 'LineString',
    POLYGON: 'Polygon',
    TEXT: 'Text'
  };

  /**
   * @module ol/geom/flat/textpath
   */


  /**
   * @param {Array<number>} flatCoordinates Path to put text on.
   * @param {number} offset Start offset of the `flatCoordinates`.
   * @param {number} end End offset of the `flatCoordinates`.
   * @param {number} stride Stride.
   * @param {string} text Text to place on the path.
   * @param {function(string):number} measure Measure function returning the
   * width of the character passed as 1st argument.
   * @param {number} startM m along the path where the text starts.
   * @param {number} maxAngle Max angle between adjacent chars in radians.
   * @return {Array<Array<*>>} The result array of null if `maxAngle` was
   * exceeded. Entries of the array are x, y, anchorX, angle, chunk.
   */
  function drawTextOnPath(
    flatCoordinates, offset, end, stride, text, measure, startM, maxAngle) {
    var result = [];

    // Keep text upright
    var reverse = flatCoordinates[offset] > flatCoordinates[end - stride];

    var numChars = text.length;

    var x1 = flatCoordinates[offset];
    var y1 = flatCoordinates[offset + 1];
    offset += stride;
    var x2 = flatCoordinates[offset];
    var y2 = flatCoordinates[offset + 1];
    var segmentM = 0;
    var segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    var chunk = '';
    var chunkLength = 0;
    var data, index, previousAngle;
    for (var i = 0; i < numChars; ++i) {
      index = reverse ? numChars - i - 1 : i;
      var char = text.charAt(index);
      chunk = reverse ? char + chunk : chunk + char;
      var charLength = measure(chunk) - chunkLength;
      chunkLength += charLength;
      var charM = startM + charLength / 2;
      while (offset < end - stride && segmentM + segmentLength < charM) {
        x1 = x2;
        y1 = y2;
        offset += stride;
        x2 = flatCoordinates[offset];
        y2 = flatCoordinates[offset + 1];
        segmentM += segmentLength;
        segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      }
      var segmentPos = charM - segmentM;
      var angle = Math.atan2(y2 - y1, x2 - x1);
      if (reverse) {
        angle += angle > 0 ? -Math.PI : Math.PI;
      }
      if (previousAngle !== undefined) {
        var delta = angle - previousAngle;
        delta += (delta > Math.PI) ? -2 * Math.PI : (delta < -Math.PI) ? 2 * Math.PI : 0;
        if (Math.abs(delta) > maxAngle) {
          return null;
        }
      }
      var interpolate = segmentPos / segmentLength;
      var x = lerp(x1, x2, interpolate);
      var y = lerp(y1, y2, interpolate);
      if (previousAngle == angle) {
        if (reverse) {
          data[0] = x;
          data[1] = y;
          data[2] = charLength / 2;
        }
        data[4] = chunk;
      } else {
        chunk = char;
        chunkLength = charLength;
        data = [x, y, charLength / 2, angle, chunk];
        if (reverse) {
          result.unshift(data);
        } else {
          result.push(data);
        }
        previousAngle = angle;
      }
      startM += charLength;
    }
    return result;
  }

  /**
   * @module ol/render/canvas/Instruction
   */

  /**
   * @enum {number}
   */
  var Instruction = {
    BEGIN_GEOMETRY: 0,
    BEGIN_PATH: 1,
    CIRCLE: 2,
    CLOSE_PATH: 3,
    CUSTOM: 4,
    DRAW_CHARS: 5,
    DRAW_IMAGE: 6,
    END_GEOMETRY: 7,
    FILL: 8,
    MOVE_TO_LINE_TO: 9,
    SET_FILL_STYLE: 10,
    SET_STROKE_STYLE: 11,
    STROKE: 12
  };


  /**
   * @type {Array<Instruction>}
   */
  var fillInstruction = [Instruction.FILL];


  /**
   * @type {Array<Instruction>}
   */
  var strokeInstruction = [Instruction.STROKE];


  /**
   * @type {Array<Instruction>}
   */
  var beginPathInstruction = [Instruction.BEGIN_PATH];


  /**
   * @type {Array<Instruction>}
   */
  var closePathInstruction = [Instruction.CLOSE_PATH];

  /**
   * @module ol/render/replay
   */


  /**
   * @const
   * @type {Array<ReplayType>}
   */
  var ORDER = [
    ReplayType.POLYGON,
    ReplayType.CIRCLE,
    ReplayType.LINE_STRING,
    ReplayType.IMAGE,
    ReplayType.TEXT,
    ReplayType.DEFAULT
  ];

  /**
   * @const
   * @enum {number}
   */
  var TEXT_ALIGN = {};
  TEXT_ALIGN['left'] = 0;
  TEXT_ALIGN['end'] = 0;
  TEXT_ALIGN['center'] = 0.5;
  TEXT_ALIGN['right'] = 1;
  TEXT_ALIGN['start'] = 1;
  TEXT_ALIGN['top'] = 0;
  TEXT_ALIGN['middle'] = 0.5;
  TEXT_ALIGN['hanging'] = 0.2;
  TEXT_ALIGN['alphabetic'] = 0.8;
  TEXT_ALIGN['ideographic'] = 0.8;
  TEXT_ALIGN['bottom'] = 1;

  /**
   * @module ol/render/canvas/Replay
   */


  /**
   * @type {import("../../extent.js").Extent}
   */
  var tmpExtent = createEmpty();


  /**
   * @type {!import("../../transform.js").Transform}
   */
  var tmpTransform$1 = create();


  var CanvasReplay = /*@__PURE__*/(function (VectorContext) {
    function CanvasReplay(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
      VectorContext.call(this);

      /**
       * @type {?}
       */
      this.declutterTree = declutterTree;

      /**
       * @protected
       * @type {number}
       */
      this.tolerance = tolerance;

      /**
       * @protected
       * @const
       * @type {import("../../extent.js").Extent}
       */
      this.maxExtent = maxExtent;

      /**
       * @protected
       * @type {boolean}
       */
      this.overlaps = overlaps;

      /**
       * @protected
       * @type {number}
       */
      this.pixelRatio = pixelRatio;

      /**
       * @protected
       * @type {number}
       */
      this.maxLineWidth = 0;

      /**
       * @protected
       * @const
       * @type {number}
       */
      this.resolution = resolution;

      /**
       * @private
       * @type {boolean}
       */
      this.alignFill_;

      /**
       * @private
       * @type {Array<*>}
       */
      this.beginGeometryInstruction1_ = null;

      /**
       * @private
       * @type {Array<*>}
       */
      this.beginGeometryInstruction2_ = null;

      /**
       * @private
       * @type {import("../../extent.js").Extent}
       */
      this.bufferedMaxExtent_ = null;

      /**
       * @protected
       * @type {Array<*>}
       */
      this.instructions = [];

      /**
       * @protected
       * @type {Array<number>}
       */
      this.coordinates = [];

      /**
       * @private
       * @type {!Object<number,import("../../coordinate.js").Coordinate|Array<import("../../coordinate.js").Coordinate>|Array<Array<import("../../coordinate.js").Coordinate>>>}
       */
      this.coordinateCache_ = {};

      /**
       * @private
       * @type {!import("../../transform.js").Transform}
       */
      this.renderedTransform_ = create();

      /**
       * @protected
       * @type {Array<*>}
       */
      this.hitDetectionInstructions = [];

      /**
       * @private
       * @type {Array<number>}
       */
      this.pixelCoordinates_ = null;

      /**
       * @protected
       * @type {import("../canvas.js").FillStrokeState}
       */
      this.state = /** @type {import("../canvas.js").FillStrokeState} */ ({});

      /**
       * @private
       * @type {number}
       */
      this.viewRotation_ = 0;

    }

    if ( VectorContext ) CanvasReplay.__proto__ = VectorContext;
    CanvasReplay.prototype = Object.create( VectorContext && VectorContext.prototype );
    CanvasReplay.prototype.constructor = CanvasReplay;

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../coordinate.js").Coordinate} p1 1st point of the background box.
     * @param {import("../../coordinate.js").Coordinate} p2 2nd point of the background box.
     * @param {import("../../coordinate.js").Coordinate} p3 3rd point of the background box.
     * @param {import("../../coordinate.js").Coordinate} p4 4th point of the background box.
     * @param {Array<*>} fillInstruction Fill instruction.
     * @param {Array<*>} strokeInstruction Stroke instruction.
     */
    CanvasReplay.prototype.replayTextBackground_ = function replayTextBackground_ (context, p1, p2, p3, p4, fillInstruction, strokeInstruction) {
      context.beginPath();
      context.moveTo.apply(context, p1);
      context.lineTo.apply(context, p2);
      context.lineTo.apply(context, p3);
      context.lineTo.apply(context, p4);
      context.lineTo.apply(context, p1);
      if (fillInstruction) {
        this.alignFill_ = /** @type {boolean} */ (fillInstruction[2]);
        this.fill_(context);
      }
      if (strokeInstruction) {
        this.setStrokeStyle_(context, /** @type {Array<*>} */ (strokeInstruction));
        context.stroke();
      }
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {number} x X.
     * @param {number} y Y.
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} image Image.
     * @param {number} anchorX Anchor X.
     * @param {number} anchorY Anchor Y.
     * @param {import("../canvas.js").DeclutterGroup} declutterGroup Declutter group.
     * @param {number} height Height.
     * @param {number} opacity Opacity.
     * @param {number} originX Origin X.
     * @param {number} originY Origin Y.
     * @param {number} rotation Rotation.
     * @param {number} scale Scale.
     * @param {boolean} snapToPixel Snap to pixel.
     * @param {number} width Width.
     * @param {Array<number>} padding Padding.
     * @param {Array<*>} fillInstruction Fill instruction.
     * @param {Array<*>} strokeInstruction Stroke instruction.
     */
    CanvasReplay.prototype.replayImage_ = function replayImage_ (
      context,
      x,
      y,
      image,
      anchorX,
      anchorY,
      declutterGroup,
      height,
      opacity,
      originX,
      originY,
      rotation,
      scale,
      snapToPixel,
      width,
      padding,
      fillInstruction,
      strokeInstruction
    ) {
      var fillStroke = fillInstruction || strokeInstruction;
      anchorX *= scale;
      anchorY *= scale;
      x -= anchorX;
      y -= anchorY;

      var w = (width + originX > image.width) ? image.width - originX : width;
      var h = (height + originY > image.height) ? image.height - originY : height;
      var boxW = padding[3] + w * scale + padding[1];
      var boxH = padding[0] + h * scale + padding[2];
      var boxX = x - padding[3];
      var boxY = y - padding[0];

      /** @type {import("../../coordinate.js").Coordinate} */
      var p1;
      /** @type {import("../../coordinate.js").Coordinate} */
      var p2;
      /** @type {import("../../coordinate.js").Coordinate} */
      var p3;
      /** @type {import("../../coordinate.js").Coordinate} */
      var p4;
      if (fillStroke || rotation !== 0) {
        p1 = [boxX, boxY];
        p2 = [boxX + boxW, boxY];
        p3 = [boxX + boxW, boxY + boxH];
        p4 = [boxX, boxY + boxH];
      }

      var transform = null;
      if (rotation !== 0) {
        var centerX = x + anchorX;
        var centerY = y + anchorY;
        transform = compose(tmpTransform$1, centerX, centerY, 1, 1, rotation, -centerX, -centerY);

        createOrUpdateEmpty(tmpExtent);
        extendCoordinate(tmpExtent, apply(tmpTransform$1, p1));
        extendCoordinate(tmpExtent, apply(tmpTransform$1, p2));
        extendCoordinate(tmpExtent, apply(tmpTransform$1, p3));
        extendCoordinate(tmpExtent, apply(tmpTransform$1, p4));
      } else {
        createOrUpdate(boxX, boxY, boxX + boxW, boxY + boxH, tmpExtent);
      }
      var canvas = context.canvas;
      var strokePadding = strokeInstruction ? (strokeInstruction[2] * scale / 2) : 0;
      var intersects =
          tmpExtent[0] - strokePadding <= canvas.width && tmpExtent[2] + strokePadding >= 0 &&
          tmpExtent[1] - strokePadding <= canvas.height && tmpExtent[3] + strokePadding >= 0;

      if (snapToPixel) {
        x = Math.round(x);
        y = Math.round(y);
      }

      if (declutterGroup) {
        if (!intersects && declutterGroup[4] == 1) {
          return;
        }
        extend$1(declutterGroup, tmpExtent);
        var declutterArgs = intersects ?
          [context, transform ? transform.slice(0) : null, opacity, image, originX, originY, w, h, x, y, scale] :
          null;
        if (declutterArgs && fillStroke) {
          declutterArgs.push(fillInstruction, strokeInstruction, p1, p2, p3, p4);
        }
        declutterGroup.push(declutterArgs);
      } else if (intersects) {
        if (fillStroke) {
          this.replayTextBackground_(context, p1, p2, p3, p4,
            /** @type {Array<*>} */ (fillInstruction),
            /** @type {Array<*>} */ (strokeInstruction));
        }
        drawImage(context, transform, opacity, image, originX, originY, w, h, x, y, scale);
      }
    };

    /**
     * @protected
     * @param {Array<number>} dashArray Dash array.
     * @return {Array<number>} Dash array with pixel ratio applied
     */
    CanvasReplay.prototype.applyPixelRatio = function applyPixelRatio (dashArray) {
      var pixelRatio = this.pixelRatio;
      return pixelRatio == 1 ? dashArray : dashArray.map(function(dash) {
        return dash * pixelRatio;
      });
    };

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {number} end End.
     * @param {number} stride Stride.
     * @param {boolean} closed Last input coordinate equals first.
     * @param {boolean} skipFirst Skip first coordinate.
     * @protected
     * @return {number} My end.
     */
    CanvasReplay.prototype.appendFlatCoordinates = function appendFlatCoordinates (flatCoordinates, offset, end, stride, closed, skipFirst) {

      var myEnd = this.coordinates.length;
      var extent = this.getBufferedMaxExtent();
      if (skipFirst) {
        offset += stride;
      }
      var lastCoord = [flatCoordinates[offset], flatCoordinates[offset + 1]];
      var nextCoord = [NaN, NaN];
      var skipped = true;

      var i, lastRel, nextRel;
      for (i = offset + stride; i < end; i += stride) {
        nextCoord[0] = flatCoordinates[i];
        nextCoord[1] = flatCoordinates[i + 1];
        nextRel = coordinateRelationship(extent, nextCoord);
        if (nextRel !== lastRel) {
          if (skipped) {
            this.coordinates[myEnd++] = lastCoord[0];
            this.coordinates[myEnd++] = lastCoord[1];
          }
          this.coordinates[myEnd++] = nextCoord[0];
          this.coordinates[myEnd++] = nextCoord[1];
          skipped = false;
        } else if (nextRel === Relationship.INTERSECTING) {
          this.coordinates[myEnd++] = nextCoord[0];
          this.coordinates[myEnd++] = nextCoord[1];
          skipped = false;
        } else {
          skipped = true;
        }
        lastCoord[0] = nextCoord[0];
        lastCoord[1] = nextCoord[1];
        lastRel = nextRel;
      }

      // Last coordinate equals first or only one point to append:
      if ((closed && skipped) || i === offset + stride) {
        this.coordinates[myEnd++] = lastCoord[0];
        this.coordinates[myEnd++] = lastCoord[1];
      }
      return myEnd;
    };

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {Array<number>} ends Ends.
     * @param {number} stride Stride.
     * @param {Array<number>} replayEnds Replay ends.
     * @return {number} Offset.
     */
    CanvasReplay.prototype.drawCustomCoordinates_ = function drawCustomCoordinates_ (flatCoordinates, offset, ends, stride, replayEnds) {
      for (var i = 0, ii = ends.length; i < ii; ++i) {
        var end = ends[i];
        var replayEnd = this.appendFlatCoordinates(flatCoordinates, offset, end, stride, false, false);
        replayEnds.push(replayEnd);
        offset = end;
      }
      return offset;
    };

    /**
     * @inheritDoc.
     */
    CanvasReplay.prototype.drawCustom = function drawCustom (geometry, feature, renderer) {
      this.beginGeometry(geometry, feature);
      var type = geometry.getType();
      var stride = geometry.getStride();
      var replayBegin = this.coordinates.length;
      var flatCoordinates, replayEnd, replayEnds, replayEndss;
      var offset;
      if (type == GeometryType.MULTI_POLYGON) {
        geometry = /** @type {import("../../geom/MultiPolygon.js").default} */ (geometry);
        flatCoordinates = geometry.getOrientedFlatCoordinates();
        replayEndss = [];
        var endss = geometry.getEndss();
        offset = 0;
        for (var i = 0, ii = endss.length; i < ii; ++i) {
          var myEnds = [];
          offset = this.drawCustomCoordinates_(flatCoordinates, offset, endss[i], stride, myEnds);
          replayEndss.push(myEnds);
        }
        this.instructions.push([Instruction.CUSTOM,
          replayBegin, replayEndss, geometry, renderer, inflateMultiCoordinatesArray]);
      } else if (type == GeometryType.POLYGON || type == GeometryType.MULTI_LINE_STRING) {
        replayEnds = [];
        flatCoordinates = (type == GeometryType.POLYGON) ?
          /** @type {import("../../geom/Polygon.js").default} */ (geometry).getOrientedFlatCoordinates() :
          geometry.getFlatCoordinates();
        offset = this.drawCustomCoordinates_(flatCoordinates, 0,
          /** @type {import("../../geom/Polygon.js").default|import("../../geom/MultiLineString.js").default} */ (geometry).getEnds(),
          stride, replayEnds);
        this.instructions.push([Instruction.CUSTOM,
          replayBegin, replayEnds, geometry, renderer, inflateCoordinatesArray]);
      } else if (type == GeometryType.LINE_STRING || type == GeometryType.MULTI_POINT) {
        flatCoordinates = geometry.getFlatCoordinates();
        replayEnd = this.appendFlatCoordinates(
          flatCoordinates, 0, flatCoordinates.length, stride, false, false);
        this.instructions.push([Instruction.CUSTOM,
          replayBegin, replayEnd, geometry, renderer, inflateCoordinates]);
      } else if (type == GeometryType.POINT) {
        flatCoordinates = geometry.getFlatCoordinates();
        this.coordinates.push(flatCoordinates[0], flatCoordinates[1]);
        replayEnd = this.coordinates.length;
        this.instructions.push([Instruction.CUSTOM,
          replayBegin, replayEnd, geometry, renderer]);
      }
      this.endGeometry(geometry, feature);
    };

    /**
     * @protected
     * @param {import("../../geom/Geometry.js").default|import("../Feature.js").default} geometry Geometry.
     * @param {import("../../Feature.js").default|import("../Feature.js").default} feature Feature.
     */
    CanvasReplay.prototype.beginGeometry = function beginGeometry (geometry, feature) {
      this.beginGeometryInstruction1_ = [Instruction.BEGIN_GEOMETRY, feature, 0];
      this.instructions.push(this.beginGeometryInstruction1_);
      this.beginGeometryInstruction2_ = [Instruction.BEGIN_GEOMETRY, feature, 0];
      this.hitDetectionInstructions.push(this.beginGeometryInstruction2_);
    };

    /**
     * FIXME empty description for jsdoc
     */
    CanvasReplay.prototype.finish = function finish () {};

    /**
     * @private
     * @param {CanvasRenderingContext2D} context Context.
     */
    CanvasReplay.prototype.fill_ = function fill_ (context) {
      if (this.alignFill_) {
        var origin = apply(this.renderedTransform_, [0, 0]);
        var repeatSize = 512 * this.pixelRatio;
        context.translate(origin[0] % repeatSize, origin[1] % repeatSize);
        context.rotate(this.viewRotation_);
      }
      context.fill();
      if (this.alignFill_) {
        context.setTransform.apply(context, resetTransform);
      }
    };

    /**
     * @private
     * @param {CanvasRenderingContext2D} context Context.
     * @param {Array<*>} instruction Instruction.
     */
    CanvasReplay.prototype.setStrokeStyle_ = function setStrokeStyle_ (context, instruction) {
      context.strokeStyle = /** @type {import("../../colorlike.js").ColorLike} */ (instruction[1]);
      context.lineWidth = /** @type {number} */ (instruction[2]);
      context.lineCap = /** @type {CanvasLineCap} */ (instruction[3]);
      context.lineJoin = /** @type {CanvasLineJoin} */ (instruction[4]);
      context.miterLimit = /** @type {number} */ (instruction[5]);
      if (CANVAS_LINE_DASH) {
        context.lineDashOffset = /** @type {number} */ (instruction[7]);
        context.setLineDash(/** @type {Array<number>} */ (instruction[6]));
      }
    };

    /**
     * @param {import("../canvas.js").DeclutterGroup} declutterGroup Declutter group.
     * @param {import("../../Feature.js").default|import("../Feature.js").default} feature Feature.
     */
    CanvasReplay.prototype.renderDeclutter_ = function renderDeclutter_ (declutterGroup, feature) {
      if (declutterGroup && declutterGroup.length > 5) {
        var groupCount = declutterGroup[4];
        if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
          /** @type {import("../../structs/RBush.js").Entry} */
          var box = {
            minX: /** @type {number} */ (declutterGroup[0]),
            minY: /** @type {number} */ (declutterGroup[1]),
            maxX: /** @type {number} */ (declutterGroup[2]),
            maxY: /** @type {number} */ (declutterGroup[3]),
            value: feature
          };
          if (!this.declutterTree.collides(box)) {
            this.declutterTree.insert(box);
            for (var j = 5, jj = declutterGroup.length; j < jj; ++j) {
              var declutterData = /** @type {Array} */ (declutterGroup[j]);
              if (declutterData) {
                if (declutterData.length > 11) {
                  this.replayTextBackground_(declutterData[0],
                    declutterData[13], declutterData[14], declutterData[15], declutterData[16],
                    declutterData[11], declutterData[12]);
                }
                drawImage.apply(undefined, declutterData);
              }
            }
          }
          declutterGroup.length = 5;
          createOrUpdateEmpty(declutterGroup);
        }
      }
    };

    /**
     * @private
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../transform.js").Transform} transform Transform.
     * @param {Object<string, boolean>} skippedFeaturesHash Ids of features
     *     to skip.
     * @param {Array<*>} instructions Instructions array.
     * @param {boolean} snapToPixel Snap point symbols and text to integer pixels.
     * @param {function((import("../../Feature.js").default|import("../Feature.js").default)): T|undefined} featureCallback Feature callback.
     * @param {import("../../extent.js").Extent=} opt_hitExtent Only check features that intersect this
     *     extent.
     * @return {T|undefined} Callback result.
     * @template T
     */
    CanvasReplay.prototype.replay_ = function replay_ (
      context,
      transform,
      skippedFeaturesHash,
      instructions,
      snapToPixel,
      featureCallback,
      opt_hitExtent
    ) {
      /** @type {Array<number>} */
      var pixelCoordinates;
      if (this.pixelCoordinates_ && equals(transform, this.renderedTransform_)) {
        pixelCoordinates = this.pixelCoordinates_;
      } else {
        if (!this.pixelCoordinates_) {
          this.pixelCoordinates_ = [];
        }
        pixelCoordinates = transform2D(
          this.coordinates, 0, this.coordinates.length, 2,
          transform, this.pixelCoordinates_);
        setFromArray(this.renderedTransform_, transform);
      }
      var skipFeatures = !isEmpty(skippedFeaturesHash);
      var i = 0; // instruction index
      var ii = instructions.length; // end of instructions
      var d = 0; // data index
      var dd; // end of per-instruction data
      var anchorX, anchorY, prevX, prevY, roundX, roundY, declutterGroup, image;
      var pendingFill = 0;
      var pendingStroke = 0;
      var lastFillInstruction = null;
      var lastStrokeInstruction = null;
      var coordinateCache = this.coordinateCache_;
      var viewRotation = this.viewRotation_;

      var state = /** @type {import("../../render.js").State} */ ({
        context: context,
        pixelRatio: this.pixelRatio,
        resolution: this.resolution,
        rotation: viewRotation
      });

      // When the batch size gets too big, performance decreases. 200 is a good
      // balance between batch size and number of fill/stroke instructions.
      var batchSize = this.instructions != instructions || this.overlaps ? 0 : 200;
      var /** @type {import("../../Feature.js").default|import("../Feature.js").default} */ feature;
      var x, y;
      while (i < ii) {
        var instruction = instructions[i];
        var type = /** @type {CanvasInstruction} */ (instruction[0]);
        switch (type) {
          case Instruction.BEGIN_GEOMETRY:
            feature = /** @type {import("../../Feature.js").default|import("../Feature.js").default} */ (instruction[1]);
            if ((skipFeatures && skippedFeaturesHash[getUid(feature)]) || !feature.getGeometry()) {
              i = /** @type {number} */ (instruction[2]);
            } else if (opt_hitExtent !== undefined && !intersects(
              opt_hitExtent, feature.getGeometry().getExtent())) {
              i = /** @type {number} */ (instruction[2]) + 1;
            } else {
              ++i;
            }
            break;
          case Instruction.BEGIN_PATH:
            if (pendingFill > batchSize) {
              this.fill_(context);
              pendingFill = 0;
            }
            if (pendingStroke > batchSize) {
              context.stroke();
              pendingStroke = 0;
            }
            if (!pendingFill && !pendingStroke) {
              context.beginPath();
              prevX = prevY = NaN;
            }
            ++i;
            break;
          case Instruction.CIRCLE:
            d = /** @type {number} */ (instruction[1]);
            var x1 = pixelCoordinates[d];
            var y1 = pixelCoordinates[d + 1];
            var x2 = pixelCoordinates[d + 2];
            var y2 = pixelCoordinates[d + 3];
            var dx = x2 - x1;
            var dy = y2 - y1;
            var r = Math.sqrt(dx * dx + dy * dy);
            context.moveTo(x1 + r, y1);
            context.arc(x1, y1, r, 0, 2 * Math.PI, true);
            ++i;
            break;
          case Instruction.CLOSE_PATH:
            context.closePath();
            ++i;
            break;
          case Instruction.CUSTOM:
            d = /** @type {number} */ (instruction[1]);
            dd = instruction[2];
            var geometry = /** @type {import("../../geom/SimpleGeometry.js").default} */ (instruction[3]);
            var renderer = instruction[4];
            var fn = instruction.length == 6 ? instruction[5] : undefined;
            state.geometry = geometry;
            state.feature = feature;
            if (!(i in coordinateCache)) {
              coordinateCache[i] = [];
            }
            var coords = coordinateCache[i];
            if (fn) {
              fn(pixelCoordinates, d, dd, 2, coords);
            } else {
              coords[0] = pixelCoordinates[d];
              coords[1] = pixelCoordinates[d + 1];
              coords.length = 2;
            }
            renderer(coords, state);
            ++i;
            break;
          case Instruction.DRAW_IMAGE:
            d = /** @type {number} */ (instruction[1]);
            dd = /** @type {number} */ (instruction[2]);
            image = /** @type {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} */
                (instruction[3]);
            // Remaining arguments in DRAW_IMAGE are in alphabetical order
            anchorX = /** @type {number} */ (instruction[4]);
            anchorY = /** @type {number} */ (instruction[5]);
            declutterGroup = featureCallback ? null : /** @type {import("../canvas.js").DeclutterGroup} */ (instruction[6]);
            var height = /** @type {number} */ (instruction[7]);
            var opacity = /** @type {number} */ (instruction[8]);
            var originX = /** @type {number} */ (instruction[9]);
            var originY = /** @type {number} */ (instruction[10]);
            var rotateWithView = /** @type {boolean} */ (instruction[11]);
            var rotation = /** @type {number} */ (instruction[12]);
            var scale = /** @type {number} */ (instruction[13]);
            var width = /** @type {number} */ (instruction[14]);

            var padding = (void 0), backgroundFill = (void 0), backgroundStroke = (void 0);
            if (instruction.length > 16) {
              padding = /** @type {Array<number>} */ (instruction[15]);
              backgroundFill = /** @type {boolean} */ (instruction[16]);
              backgroundStroke = /** @type {boolean} */ (instruction[17]);
            } else {
              padding = defaultPadding;
              backgroundFill = backgroundStroke = false;
            }

            if (rotateWithView) {
              rotation += viewRotation;
            }
            for (; d < dd; d += 2) {
              this.replayImage_(context,
                pixelCoordinates[d], pixelCoordinates[d + 1], image, anchorX, anchorY,
                declutterGroup, height, opacity, originX, originY, rotation, scale,
                snapToPixel, width, padding,
                backgroundFill ? /** @type {Array<*>} */ (lastFillInstruction) : null,
                backgroundStroke ? /** @type {Array<*>} */ (lastStrokeInstruction) : null);
            }
            this.renderDeclutter_(declutterGroup, feature);
            ++i;
            break;
          case Instruction.DRAW_CHARS:
            var begin = /** @type {number} */ (instruction[1]);
            var end = /** @type {number} */ (instruction[2]);
            var baseline = /** @type {number} */ (instruction[3]);
            declutterGroup = featureCallback ? null : /** @type {import("../canvas.js").DeclutterGroup} */ (instruction[4]);
            var overflow = /** @type {number} */ (instruction[5]);
            var fillKey = /** @type {string} */ (instruction[6]);
            var maxAngle = /** @type {number} */ (instruction[7]);
            var measure = /** @type {function(string):number} */ (instruction[8]);
            var offsetY = /** @type {number} */ (instruction[9]);
            var strokeKey = /** @type {string} */ (instruction[10]);
            var strokeWidth = /** @type {number} */ (instruction[11]);
            var text = /** @type {string} */ (instruction[12]);
            var textKey = /** @type {string} */ (instruction[13]);
            var textScale = /** @type {number} */ (instruction[14]);

            var pathLength = lineStringLength(pixelCoordinates, begin, end, 2);
            var textLength = measure(text);
            if (overflow || textLength <= pathLength) {
              /** @type {import("./TextReplay.js").default} */
              var textReplay = /** @type {?} */ (this);
              var textAlign = textReplay.textStates[textKey].textAlign;
              var startM = (pathLength - textLength) * TEXT_ALIGN[textAlign];
              var parts = drawTextOnPath(
                pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
              if (parts) {
                var c = (void 0), cc = (void 0), chars = (void 0), label = (void 0), part = (void 0);
                if (strokeKey) {
                  for (c = 0, cc = parts.length; c < cc; ++c) {
                    part = parts[c]; // x, y, anchorX, rotation, chunk
                    chars = /** @type {string} */ (part[4]);
                    label = textReplay.getImage(chars, textKey, '', strokeKey);
                    anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                    anchorY = baseline * label.height + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                    this.replayImage_(context,
                      /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), label,
                      anchorX, anchorY, declutterGroup, label.height, 1, 0, 0,
                      /** @type {number} */ (part[3]), textScale, false, label.width,
                      defaultPadding, null, null);
                  }
                }
                if (fillKey) {
                  for (c = 0, cc = parts.length; c < cc; ++c) {
                    part = parts[c]; // x, y, anchorX, rotation, chunk
                    chars = /** @type {string} */ (part[4]);
                    label = textReplay.getImage(chars, textKey, fillKey, '');
                    anchorX = /** @type {number} */ (part[2]);
                    anchorY = baseline * label.height - offsetY;
                    this.replayImage_(context,
                      /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), label,
                      anchorX, anchorY, declutterGroup, label.height, 1, 0, 0,
                      /** @type {number} */ (part[3]), textScale, false, label.width,
                      defaultPadding, null, null);
                  }
                }
              }
            }
            this.renderDeclutter_(declutterGroup, feature);
            ++i;
            break;
          case Instruction.END_GEOMETRY:
            if (featureCallback !== undefined) {
              feature = /** @type {import("../../Feature.js").default|import("../Feature.js").default} */ (instruction[1]);
              var result = featureCallback(feature);
              if (result) {
                return result;
              }
            }
            ++i;
            break;
          case Instruction.FILL:
            if (batchSize) {
              pendingFill++;
            } else {
              this.fill_(context);
            }
            ++i;
            break;
          case Instruction.MOVE_TO_LINE_TO:
            d = /** @type {number} */ (instruction[1]);
            dd = /** @type {number} */ (instruction[2]);
            x = pixelCoordinates[d];
            y = pixelCoordinates[d + 1];
            roundX = (x + 0.5) | 0;
            roundY = (y + 0.5) | 0;
            if (roundX !== prevX || roundY !== prevY) {
              context.moveTo(x, y);
              prevX = roundX;
              prevY = roundY;
            }
            for (d += 2; d < dd; d += 2) {
              x = pixelCoordinates[d];
              y = pixelCoordinates[d + 1];
              roundX = (x + 0.5) | 0;
              roundY = (y + 0.5) | 0;
              if (d == dd - 2 || roundX !== prevX || roundY !== prevY) {
                context.lineTo(x, y);
                prevX = roundX;
                prevY = roundY;
              }
            }
            ++i;
            break;
          case Instruction.SET_FILL_STYLE:
            lastFillInstruction = instruction;
            this.alignFill_ = instruction[2];

            if (pendingFill) {
              this.fill_(context);
              pendingFill = 0;
              if (pendingStroke) {
                context.stroke();
                pendingStroke = 0;
              }
            }

            context.fillStyle = /** @type {import("../../colorlike.js").ColorLike} */ (instruction[1]);
            ++i;
            break;
          case Instruction.SET_STROKE_STYLE:
            lastStrokeInstruction = instruction;
            if (pendingStroke) {
              context.stroke();
              pendingStroke = 0;
            }
            this.setStrokeStyle_(context, /** @type {Array<*>} */ (instruction));
            ++i;
            break;
          case Instruction.STROKE:
            if (batchSize) {
              pendingStroke++;
            } else {
              context.stroke();
            }
            ++i;
            break;
          default:
            ++i; // consume the instruction anyway, to avoid an infinite loop
            break;
        }
      }
      if (pendingFill) {
        this.fill_(context);
      }
      if (pendingStroke) {
        context.stroke();
      }
      return undefined;
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../transform.js").Transform} transform Transform.
     * @param {number} viewRotation View rotation.
     * @param {Object<string, boolean>} skippedFeaturesHash Ids of features
     *     to skip.
     * @param {boolean} snapToPixel Snap point symbols and text to integer pixels.
     */
    CanvasReplay.prototype.replay = function replay (context, transform, viewRotation, skippedFeaturesHash, snapToPixel) {
      this.viewRotation_ = viewRotation;
      this.replay_(context, transform,
        skippedFeaturesHash, this.instructions, snapToPixel, undefined, undefined);
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../transform.js").Transform} transform Transform.
     * @param {number} viewRotation View rotation.
     * @param {Object<string, boolean>} skippedFeaturesHash Ids of features
     *     to skip.
     * @param {function((import("../../Feature.js").default|import("../Feature.js").default)): T=} opt_featureCallback
     *     Feature callback.
     * @param {import("../../extent.js").Extent=} opt_hitExtent Only check features that intersect this
     *     extent.
     * @return {T|undefined} Callback result.
     * @template T
     */
    CanvasReplay.prototype.replayHitDetection = function replayHitDetection (
      context,
      transform,
      viewRotation,
      skippedFeaturesHash,
      opt_featureCallback,
      opt_hitExtent
    ) {
      this.viewRotation_ = viewRotation;
      return this.replay_(context, transform, skippedFeaturesHash,
        this.hitDetectionInstructions, true, opt_featureCallback, opt_hitExtent);
    };

    /**
     * Reverse the hit detection instructions.
     */
    CanvasReplay.prototype.reverseHitDetectionInstructions = function reverseHitDetectionInstructions () {
      var hitDetectionInstructions = this.hitDetectionInstructions;
      // step 1 - reverse array
      hitDetectionInstructions.reverse();
      // step 2 - reverse instructions within geometry blocks
      var i;
      var n = hitDetectionInstructions.length;
      var instruction;
      var type;
      var begin = -1;
      for (i = 0; i < n; ++i) {
        instruction = hitDetectionInstructions[i];
        type = /** @type {CanvasInstruction} */ (instruction[0]);
        if (type == Instruction.END_GEOMETRY) {
          begin = i;
        } else if (type == Instruction.BEGIN_GEOMETRY) {
          instruction[2] = i;
          reverseSubArray(this.hitDetectionInstructions, begin, i);
          begin = -1;
        }
      }
    };

    /**
     * @inheritDoc
     */
    CanvasReplay.prototype.setFillStrokeStyle = function setFillStrokeStyle (fillStyle, strokeStyle) {
      var state = this.state;
      if (fillStyle) {
        var fillStyleColor = fillStyle.getColor();
        state.fillStyle = asColorLike(fillStyleColor ?
          fillStyleColor : defaultFillStyle);
      } else {
        state.fillStyle = undefined;
      }
      if (strokeStyle) {
        var strokeStyleColor = strokeStyle.getColor();
        state.strokeStyle = asColorLike(strokeStyleColor ?
          strokeStyleColor : defaultStrokeStyle);
        var strokeStyleLineCap = strokeStyle.getLineCap();
        state.lineCap = strokeStyleLineCap !== undefined ?
          strokeStyleLineCap : defaultLineCap;
        var strokeStyleLineDash = strokeStyle.getLineDash();
        state.lineDash = strokeStyleLineDash ?
          strokeStyleLineDash.slice() : defaultLineDash;
        var strokeStyleLineDashOffset = strokeStyle.getLineDashOffset();
        state.lineDashOffset = strokeStyleLineDashOffset ?
          strokeStyleLineDashOffset : defaultLineDashOffset;
        var strokeStyleLineJoin = strokeStyle.getLineJoin();
        state.lineJoin = strokeStyleLineJoin !== undefined ?
          strokeStyleLineJoin : defaultLineJoin;
        var strokeStyleWidth = strokeStyle.getWidth();
        state.lineWidth = strokeStyleWidth !== undefined ?
          strokeStyleWidth : defaultLineWidth;
        var strokeStyleMiterLimit = strokeStyle.getMiterLimit();
        state.miterLimit = strokeStyleMiterLimit !== undefined ?
          strokeStyleMiterLimit : defaultMiterLimit;

        if (state.lineWidth > this.maxLineWidth) {
          this.maxLineWidth = state.lineWidth;
          // invalidate the buffered max extent cache
          this.bufferedMaxExtent_ = null;
        }
      } else {
        state.strokeStyle = undefined;
        state.lineCap = undefined;
        state.lineDash = null;
        state.lineDashOffset = undefined;
        state.lineJoin = undefined;
        state.lineWidth = undefined;
        state.miterLimit = undefined;
      }
    };

    /**
     * @param {import("../canvas.js").FillStrokeState} state State.
     * @param {import("../../geom/Geometry.js").default|import("../Feature.js").default} geometry Geometry.
     * @return {Array<*>} Fill instruction.
     */
    CanvasReplay.prototype.createFill = function createFill (state, geometry) {
      var fillStyle = state.fillStyle;
      /** @type {Array<*>} */
      var fillInstruction = [Instruction.SET_FILL_STYLE, fillStyle];
      if (typeof fillStyle !== 'string') {
        // Fill is a pattern or gradient - align it!
        fillInstruction.push(true);
      }
      return fillInstruction;
    };

    /**
     * @param {import("../canvas.js").FillStrokeState} state State.
     */
    CanvasReplay.prototype.applyStroke = function applyStroke (state) {
      this.instructions.push(this.createStroke(state));
    };

    /**
     * @param {import("../canvas.js").FillStrokeState} state State.
     * @return {Array<*>} Stroke instruction.
     */
    CanvasReplay.prototype.createStroke = function createStroke (state) {
      return [
        Instruction.SET_STROKE_STYLE,
        state.strokeStyle, state.lineWidth * this.pixelRatio, state.lineCap,
        state.lineJoin, state.miterLimit,
        this.applyPixelRatio(state.lineDash), state.lineDashOffset * this.pixelRatio
      ];
    };

    /**
     * @param {import("../canvas.js").FillStrokeState} state State.
     * @param {function(this:CanvasReplay, import("../canvas.js").FillStrokeState, (import("../../geom/Geometry.js").default|import("../Feature.js").default)):Array<*>} createFill Create fill.
     * @param {import("../../geom/Geometry.js").default|import("../Feature.js").default} geometry Geometry.
     */
    CanvasReplay.prototype.updateFillStyle = function updateFillStyle (state, createFill, geometry) {
      var fillStyle = state.fillStyle;
      if (typeof fillStyle !== 'string' || state.currentFillStyle != fillStyle) {
        if (fillStyle !== undefined) {
          this.instructions.push(createFill.call(this, state, geometry));
        }
        state.currentFillStyle = fillStyle;
      }
    };

    /**
     * @param {import("../canvas.js").FillStrokeState} state State.
     * @param {function(this:CanvasReplay, import("../canvas.js").FillStrokeState)} applyStroke Apply stroke.
     */
    CanvasReplay.prototype.updateStrokeStyle = function updateStrokeStyle (state, applyStroke) {
      var strokeStyle = state.strokeStyle;
      var lineCap = state.lineCap;
      var lineDash = state.lineDash;
      var lineDashOffset = state.lineDashOffset;
      var lineJoin = state.lineJoin;
      var lineWidth = state.lineWidth;
      var miterLimit = state.miterLimit;
      if (state.currentStrokeStyle != strokeStyle ||
          state.currentLineCap != lineCap ||
          (lineDash != state.currentLineDash && !equals(state.currentLineDash, lineDash)) ||
          state.currentLineDashOffset != lineDashOffset ||
          state.currentLineJoin != lineJoin ||
          state.currentLineWidth != lineWidth ||
          state.currentMiterLimit != miterLimit) {
        if (strokeStyle !== undefined) {
          applyStroke.call(this, state);
        }
        state.currentStrokeStyle = strokeStyle;
        state.currentLineCap = lineCap;
        state.currentLineDash = lineDash;
        state.currentLineDashOffset = lineDashOffset;
        state.currentLineJoin = lineJoin;
        state.currentLineWidth = lineWidth;
        state.currentMiterLimit = miterLimit;
      }
    };

    /**
     * @param {import("../../geom/Geometry.js").default|import("../Feature.js").default} geometry Geometry.
     * @param {import("../../Feature.js").default|import("../Feature.js").default} feature Feature.
     */
    CanvasReplay.prototype.endGeometry = function endGeometry (geometry, feature) {
      this.beginGeometryInstruction1_[2] = this.instructions.length;
      this.beginGeometryInstruction1_ = null;
      this.beginGeometryInstruction2_[2] = this.hitDetectionInstructions.length;
      this.beginGeometryInstruction2_ = null;
      var endGeometryInstruction = [Instruction.END_GEOMETRY, feature];
      this.instructions.push(endGeometryInstruction);
      this.hitDetectionInstructions.push(endGeometryInstruction);
    };

    /**
     * Get the buffered rendering extent.  Rendering will be clipped to the extent
     * provided to the constructor.  To account for symbolizers that may intersect
     * this extent, we calculate a buffered extent (e.g. based on stroke width).
     * @return {import("../../extent.js").Extent} The buffered rendering extent.
     * @protected
     */
    CanvasReplay.prototype.getBufferedMaxExtent = function getBufferedMaxExtent () {
      if (!this.bufferedMaxExtent_) {
        this.bufferedMaxExtent_ = clone(this.maxExtent);
        if (this.maxLineWidth > 0) {
          var width = this.resolution * (this.maxLineWidth + 1) / 2;
          buffer(this.bufferedMaxExtent_, width, this.bufferedMaxExtent_);
        }
      }
      return this.bufferedMaxExtent_;
    };

    return CanvasReplay;
  }(VectorContext));

  /**
   * @module ol/render/canvas/ImageReplay
   */

  var CanvasImageReplay = /*@__PURE__*/(function (CanvasReplay) {
    function CanvasImageReplay(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
      CanvasReplay.call(this, tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree);

      /**
       * @private
       * @type {import("../canvas.js").DeclutterGroup}
       */
      this.declutterGroup_ = null;

      /**
       * @private
       * @type {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement}
       */
      this.hitDetectionImage_ = null;

      /**
       * @private
       * @type {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement}
       */
      this.image_ = null;

      /**
       * @private
       * @type {number|undefined}
       */
      this.anchorX_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.anchorY_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.height_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.opacity_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.originX_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.originY_ = undefined;

      /**
       * @private
       * @type {boolean|undefined}
       */
      this.rotateWithView_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.rotation_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.scale_ = undefined;

      /**
       * @private
       * @type {number|undefined}
       */
      this.width_ = undefined;

    }

    if ( CanvasReplay ) CanvasImageReplay.__proto__ = CanvasReplay;
    CanvasImageReplay.prototype = Object.create( CanvasReplay && CanvasReplay.prototype );
    CanvasImageReplay.prototype.constructor = CanvasImageReplay;

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {number} end End.
     * @param {number} stride Stride.
     * @private
     * @return {number} My end.
     */
    CanvasImageReplay.prototype.drawCoordinates_ = function drawCoordinates_ (flatCoordinates, offset, end, stride) {
      return this.appendFlatCoordinates(flatCoordinates, offset, end, stride, false, false);
    };

    /**
     * @inheritDoc
     */
    CanvasImageReplay.prototype.drawPoint = function drawPoint (pointGeometry, feature) {
      if (!this.image_) {
        return;
      }
      this.beginGeometry(pointGeometry, feature);
      var flatCoordinates = pointGeometry.getFlatCoordinates();
      var stride = pointGeometry.getStride();
      var myBegin = this.coordinates.length;
      var myEnd = this.drawCoordinates_(flatCoordinates, 0, flatCoordinates.length, stride);
      this.instructions.push([
        Instruction.DRAW_IMAGE, myBegin, myEnd, this.image_,
        // Remaining arguments to DRAW_IMAGE are in alphabetical order
        this.anchorX_, this.anchorY_, this.declutterGroup_, this.height_, this.opacity_,
        this.originX_, this.originY_, this.rotateWithView_, this.rotation_,
        this.scale_ * this.pixelRatio, this.width_
      ]);
      this.hitDetectionInstructions.push([
        Instruction.DRAW_IMAGE, myBegin, myEnd, this.hitDetectionImage_,
        // Remaining arguments to DRAW_IMAGE are in alphabetical order
        this.anchorX_, this.anchorY_, this.declutterGroup_, this.height_, this.opacity_,
        this.originX_, this.originY_, this.rotateWithView_, this.rotation_,
        this.scale_, this.width_
      ]);
      this.endGeometry(pointGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasImageReplay.prototype.drawMultiPoint = function drawMultiPoint (multiPointGeometry, feature) {
      if (!this.image_) {
        return;
      }
      this.beginGeometry(multiPointGeometry, feature);
      var flatCoordinates = multiPointGeometry.getFlatCoordinates();
      var stride = multiPointGeometry.getStride();
      var myBegin = this.coordinates.length;
      var myEnd = this.drawCoordinates_(
        flatCoordinates, 0, flatCoordinates.length, stride);
      this.instructions.push([
        Instruction.DRAW_IMAGE, myBegin, myEnd, this.image_,
        // Remaining arguments to DRAW_IMAGE are in alphabetical order
        this.anchorX_, this.anchorY_, this.declutterGroup_, this.height_, this.opacity_,
        this.originX_, this.originY_, this.rotateWithView_, this.rotation_,
        this.scale_ * this.pixelRatio, this.width_
      ]);
      this.hitDetectionInstructions.push([
        Instruction.DRAW_IMAGE, myBegin, myEnd, this.hitDetectionImage_,
        // Remaining arguments to DRAW_IMAGE are in alphabetical order
        this.anchorX_, this.anchorY_, this.declutterGroup_, this.height_, this.opacity_,
        this.originX_, this.originY_, this.rotateWithView_, this.rotation_,
        this.scale_, this.width_
      ]);
      this.endGeometry(multiPointGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasImageReplay.prototype.finish = function finish () {
      this.reverseHitDetectionInstructions();
      // FIXME this doesn't really protect us against further calls to draw*Geometry
      this.anchorX_ = undefined;
      this.anchorY_ = undefined;
      this.hitDetectionImage_ = null;
      this.image_ = null;
      this.height_ = undefined;
      this.scale_ = undefined;
      this.opacity_ = undefined;
      this.originX_ = undefined;
      this.originY_ = undefined;
      this.rotateWithView_ = undefined;
      this.rotation_ = undefined;
      this.width_ = undefined;
    };

    /**
     * @inheritDoc
     */
    CanvasImageReplay.prototype.setImageStyle = function setImageStyle (imageStyle, declutterGroup) {
      var anchor = imageStyle.getAnchor();
      var size = imageStyle.getSize();
      var hitDetectionImage = imageStyle.getHitDetectionImage(1);
      var image = imageStyle.getImage(1);
      var origin = imageStyle.getOrigin();
      this.anchorX_ = anchor[0];
      this.anchorY_ = anchor[1];
      this.declutterGroup_ = /** @type {import("../canvas.js").DeclutterGroup} */ (declutterGroup);
      this.hitDetectionImage_ = hitDetectionImage;
      this.image_ = image;
      this.height_ = size[1];
      this.opacity_ = imageStyle.getOpacity();
      this.originX_ = origin[0];
      this.originY_ = origin[1];
      this.rotateWithView_ = imageStyle.getRotateWithView();
      this.rotation_ = imageStyle.getRotation();
      this.scale_ = imageStyle.getScale();
      this.width_ = size[0];
    };

    return CanvasImageReplay;
  }(CanvasReplay));

  /**
   * @module ol/render/canvas/LineStringReplay
   */

  var CanvasLineStringReplay = /*@__PURE__*/(function (CanvasReplay) {
    function CanvasLineStringReplay(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
      CanvasReplay.call(this, tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree);
    }

    if ( CanvasReplay ) CanvasLineStringReplay.__proto__ = CanvasReplay;
    CanvasLineStringReplay.prototype = Object.create( CanvasReplay && CanvasReplay.prototype );
    CanvasLineStringReplay.prototype.constructor = CanvasLineStringReplay;

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {number} end End.
     * @param {number} stride Stride.
     * @private
     * @return {number} end.
     */
    CanvasLineStringReplay.prototype.drawFlatCoordinates_ = function drawFlatCoordinates_ (flatCoordinates, offset, end, stride) {
      var myBegin = this.coordinates.length;
      var myEnd = this.appendFlatCoordinates(
        flatCoordinates, offset, end, stride, false, false);
      var moveToLineToInstruction = [Instruction.MOVE_TO_LINE_TO, myBegin, myEnd];
      this.instructions.push(moveToLineToInstruction);
      this.hitDetectionInstructions.push(moveToLineToInstruction);
      return end;
    };

    /**
     * @inheritDoc
     */
    CanvasLineStringReplay.prototype.drawLineString = function drawLineString (lineStringGeometry, feature) {
      var state = this.state;
      var strokeStyle = state.strokeStyle;
      var lineWidth = state.lineWidth;
      if (strokeStyle === undefined || lineWidth === undefined) {
        return;
      }
      this.updateStrokeStyle(state, this.applyStroke);
      this.beginGeometry(lineStringGeometry, feature);
      this.hitDetectionInstructions.push([
        Instruction.SET_STROKE_STYLE,
        state.strokeStyle, state.lineWidth, state.lineCap, state.lineJoin,
        state.miterLimit, state.lineDash, state.lineDashOffset
      ], beginPathInstruction);
      var flatCoordinates = lineStringGeometry.getFlatCoordinates();
      var stride = lineStringGeometry.getStride();
      this.drawFlatCoordinates_(flatCoordinates, 0, flatCoordinates.length, stride);
      this.hitDetectionInstructions.push(strokeInstruction);
      this.endGeometry(lineStringGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasLineStringReplay.prototype.drawMultiLineString = function drawMultiLineString (multiLineStringGeometry, feature) {
      var state = this.state;
      var strokeStyle = state.strokeStyle;
      var lineWidth = state.lineWidth;
      if (strokeStyle === undefined || lineWidth === undefined) {
        return;
      }
      this.updateStrokeStyle(state, this.applyStroke);
      this.beginGeometry(multiLineStringGeometry, feature);
      this.hitDetectionInstructions.push([
        Instruction.SET_STROKE_STYLE,
        state.strokeStyle, state.lineWidth, state.lineCap, state.lineJoin,
        state.miterLimit, state.lineDash, state.lineDashOffset
      ], beginPathInstruction);
      var ends = multiLineStringGeometry.getEnds();
      var flatCoordinates = multiLineStringGeometry.getFlatCoordinates();
      var stride = multiLineStringGeometry.getStride();
      var offset = 0;
      for (var i = 0, ii = ends.length; i < ii; ++i) {
        offset = this.drawFlatCoordinates_(flatCoordinates, offset, ends[i], stride);
      }
      this.hitDetectionInstructions.push(strokeInstruction);
      this.endGeometry(multiLineStringGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasLineStringReplay.prototype.finish = function finish () {
      var state = this.state;
      if (state.lastStroke != undefined && state.lastStroke != this.coordinates.length) {
        this.instructions.push(strokeInstruction);
      }
      this.reverseHitDetectionInstructions();
      this.state = null;
    };

    /**
     * @inheritDoc.
     */
    CanvasLineStringReplay.prototype.applyStroke = function applyStroke (state) {
      if (state.lastStroke != undefined && state.lastStroke != this.coordinates.length) {
        this.instructions.push(strokeInstruction);
        state.lastStroke = this.coordinates.length;
      }
      state.lastStroke = 0;
      CanvasReplay.prototype.applyStroke.call(this, state);
      this.instructions.push(beginPathInstruction);
    };

    return CanvasLineStringReplay;
  }(CanvasReplay));

  /**
   * @module ol/render/canvas/PolygonReplay
   */


  var CanvasPolygonReplay = /*@__PURE__*/(function (CanvasReplay) {
    function CanvasPolygonReplay(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
      CanvasReplay.call(this, tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree);
    }

    if ( CanvasReplay ) CanvasPolygonReplay.__proto__ = CanvasReplay;
    CanvasPolygonReplay.prototype = Object.create( CanvasReplay && CanvasReplay.prototype );
    CanvasPolygonReplay.prototype.constructor = CanvasPolygonReplay;

    /**
     * @param {Array<number>} flatCoordinates Flat coordinates.
     * @param {number} offset Offset.
     * @param {Array<number>} ends Ends.
     * @param {number} stride Stride.
     * @private
     * @return {number} End.
     */
    CanvasPolygonReplay.prototype.drawFlatCoordinatess_ = function drawFlatCoordinatess_ (flatCoordinates, offset, ends, stride) {
      var state = this.state;
      var fill = state.fillStyle !== undefined;
      var stroke = state.strokeStyle != undefined;
      var numEnds = ends.length;
      this.instructions.push(beginPathInstruction);
      this.hitDetectionInstructions.push(beginPathInstruction);
      for (var i = 0; i < numEnds; ++i) {
        var end = ends[i];
        var myBegin = this.coordinates.length;
        var myEnd = this.appendFlatCoordinates(flatCoordinates, offset, end, stride, true, !stroke);
        var moveToLineToInstruction = [Instruction.MOVE_TO_LINE_TO, myBegin, myEnd];
        this.instructions.push(moveToLineToInstruction);
        this.hitDetectionInstructions.push(moveToLineToInstruction);
        if (stroke) {
          // Performance optimization: only call closePath() when we have a stroke.
          // Otherwise the ring is closed already (see appendFlatCoordinates above).
          this.instructions.push(closePathInstruction);
          this.hitDetectionInstructions.push(closePathInstruction);
        }
        offset = end;
      }
      if (fill) {
        this.instructions.push(fillInstruction);
        this.hitDetectionInstructions.push(fillInstruction);
      }
      if (stroke) {
        this.instructions.push(strokeInstruction);
        this.hitDetectionInstructions.push(strokeInstruction);
      }
      return offset;
    };

    /**
     * @inheritDoc
     */
    CanvasPolygonReplay.prototype.drawCircle = function drawCircle (circleGeometry, feature) {
      var state = this.state;
      var fillStyle = state.fillStyle;
      var strokeStyle = state.strokeStyle;
      if (fillStyle === undefined && strokeStyle === undefined) {
        return;
      }
      this.setFillStrokeStyles_(circleGeometry);
      this.beginGeometry(circleGeometry, feature);
      if (state.fillStyle !== undefined) {
        this.hitDetectionInstructions.push([
          Instruction.SET_FILL_STYLE,
          asString(defaultFillStyle)
        ]);
      }
      if (state.strokeStyle !== undefined) {
        this.hitDetectionInstructions.push([
          Instruction.SET_STROKE_STYLE,
          state.strokeStyle, state.lineWidth, state.lineCap, state.lineJoin,
          state.miterLimit, state.lineDash, state.lineDashOffset
        ]);
      }
      var flatCoordinates = circleGeometry.getFlatCoordinates();
      var stride = circleGeometry.getStride();
      var myBegin = this.coordinates.length;
      this.appendFlatCoordinates(
        flatCoordinates, 0, flatCoordinates.length, stride, false, false);
      var circleInstruction = [Instruction.CIRCLE, myBegin];
      this.instructions.push(beginPathInstruction, circleInstruction);
      this.hitDetectionInstructions.push(beginPathInstruction, circleInstruction);
      this.hitDetectionInstructions.push(fillInstruction);
      if (state.fillStyle !== undefined) {
        this.instructions.push(fillInstruction);
      }
      if (state.strokeStyle !== undefined) {
        this.instructions.push(strokeInstruction);
        this.hitDetectionInstructions.push(strokeInstruction);
      }
      this.endGeometry(circleGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasPolygonReplay.prototype.drawPolygon = function drawPolygon (polygonGeometry, feature) {
      var state = this.state;
      var fillStyle = state.fillStyle;
      var strokeStyle = state.strokeStyle;
      if (fillStyle === undefined && strokeStyle === undefined) {
        return;
      }
      this.setFillStrokeStyles_(polygonGeometry);
      this.beginGeometry(polygonGeometry, feature);
      if (state.fillStyle !== undefined) {
        this.hitDetectionInstructions.push([
          Instruction.SET_FILL_STYLE,
          asString(defaultFillStyle)
        ]);
      }
      if (state.strokeStyle !== undefined) {
        this.hitDetectionInstructions.push([
          Instruction.SET_STROKE_STYLE,
          state.strokeStyle, state.lineWidth, state.lineCap, state.lineJoin,
          state.miterLimit, state.lineDash, state.lineDashOffset
        ]);
      }
      var ends = polygonGeometry.getEnds();
      var flatCoordinates = polygonGeometry.getOrientedFlatCoordinates();
      var stride = polygonGeometry.getStride();
      this.drawFlatCoordinatess_(flatCoordinates, 0, ends, stride);
      this.endGeometry(polygonGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasPolygonReplay.prototype.drawMultiPolygon = function drawMultiPolygon (multiPolygonGeometry, feature) {
      var state = this.state;
      var fillStyle = state.fillStyle;
      var strokeStyle = state.strokeStyle;
      if (fillStyle === undefined && strokeStyle === undefined) {
        return;
      }
      this.setFillStrokeStyles_(multiPolygonGeometry);
      this.beginGeometry(multiPolygonGeometry, feature);
      if (state.fillStyle !== undefined) {
        this.hitDetectionInstructions.push([
          Instruction.SET_FILL_STYLE,
          asString(defaultFillStyle)
        ]);
      }
      if (state.strokeStyle !== undefined) {
        this.hitDetectionInstructions.push([
          Instruction.SET_STROKE_STYLE,
          state.strokeStyle, state.lineWidth, state.lineCap, state.lineJoin,
          state.miterLimit, state.lineDash, state.lineDashOffset
        ]);
      }
      var endss = multiPolygonGeometry.getEndss();
      var flatCoordinates = multiPolygonGeometry.getOrientedFlatCoordinates();
      var stride = multiPolygonGeometry.getStride();
      var offset = 0;
      for (var i = 0, ii = endss.length; i < ii; ++i) {
        offset = this.drawFlatCoordinatess_(flatCoordinates, offset, endss[i], stride);
      }
      this.endGeometry(multiPolygonGeometry, feature);
    };

    /**
     * @inheritDoc
     */
    CanvasPolygonReplay.prototype.finish = function finish () {
      this.reverseHitDetectionInstructions();
      this.state = null;
      // We want to preserve topology when drawing polygons.  Polygons are
      // simplified using quantization and point elimination. However, we might
      // have received a mix of quantized and non-quantized geometries, so ensure
      // that all are quantized by quantizing all coordinates in the batch.
      var tolerance = this.tolerance;
      if (tolerance !== 0) {
        var coordinates = this.coordinates;
        for (var i = 0, ii = coordinates.length; i < ii; ++i) {
          coordinates[i] = snap(coordinates[i], tolerance);
        }
      }
    };

    /**
     * @private
     * @param {import("../../geom/Geometry.js").default|import("../Feature.js").default} geometry Geometry.
     */
    CanvasPolygonReplay.prototype.setFillStrokeStyles_ = function setFillStrokeStyles_ (geometry) {
      var state = this.state;
      var fillStyle = state.fillStyle;
      if (fillStyle !== undefined) {
        this.updateFillStyle(state, this.createFill, geometry);
      }
      if (state.strokeStyle !== undefined) {
        this.updateStrokeStyle(state, this.applyStroke);
      }
    };

    return CanvasPolygonReplay;
  }(CanvasReplay));

  /**
   * @module ol/geom/flat/straightchunk
   */


  /**
   * @param {number} maxAngle Maximum acceptable angle delta between segments.
   * @param {Array<number>} flatCoordinates Flat coordinates.
   * @param {number} offset Offset.
   * @param {number} end End.
   * @param {number} stride Stride.
   * @return {Array<number>} Start and end of the first suitable chunk of the
   * given `flatCoordinates`.
   */
  function matchingChunk(maxAngle, flatCoordinates, offset, end, stride) {
    var chunkStart = offset;
    var chunkEnd = offset;
    var chunkM = 0;
    var m = 0;
    var start = offset;
    var acos, i, m12, m23, x1, y1, x12, y12, x23, y23;
    for (i = offset; i < end; i += stride) {
      var x2 = flatCoordinates[i];
      var y2 = flatCoordinates[i + 1];
      if (x1 !== undefined) {
        x23 = x2 - x1;
        y23 = y2 - y1;
        m23 = Math.sqrt(x23 * x23 + y23 * y23);
        if (x12 !== undefined) {
          m += m12;
          acos = Math.acos((x12 * x23 + y12 * y23) / (m12 * m23));
          if (acos > maxAngle) {
            if (m > chunkM) {
              chunkM = m;
              chunkStart = start;
              chunkEnd = i;
            }
            m = 0;
            start = i - stride;
          }
        }
        m12 = m23;
        x12 = x23;
        y12 = y23;
      }
      x1 = x2;
      y1 = y2;
    }
    m += m23;
    return m > chunkM ? [start, i] : [chunkStart, chunkEnd];
  }

  /**
   * @module ol/style/TextPlacement
   */

  /**
   * Text placement. One of `'point'`, `'line'`. Default is `'point'`. Note that
   * `'line'` requires the underlying geometry to be a {@link module:ol/geom/LineString~LineString},
   * {@link module:ol/geom/Polygon~Polygon}, {@link module:ol/geom/MultiLineString~MultiLineString} or
   * {@link module:ol/geom/MultiPolygon~MultiPolygon}.
   * @enum {string}
   */
  var TextPlacement = {
    POINT: 'point',
    LINE: 'line'
  };

  /**
   * @module ol/render/canvas/TextReplay
   */

  var CanvasTextReplay = /*@__PURE__*/(function (CanvasReplay) {
    function CanvasTextReplay(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
      CanvasReplay.call(this, tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree);

      /**
       * @private
       * @type {import("../canvas.js").DeclutterGroup}
       */
      this.declutterGroup_;

      /**
       * @private
       * @type {Array<HTMLCanvasElement>}
       */
      this.labels_ = null;

      /**
       * @private
       * @type {string}
       */
      this.text_ = '';

      /**
       * @private
       * @type {number}
       */
      this.textOffsetX_ = 0;

      /**
       * @private
       * @type {number}
       */
      this.textOffsetY_ = 0;

      /**
       * @private
       * @type {boolean|undefined}
       */
      this.textRotateWithView_ = undefined;

      /**
       * @private
       * @type {number}
       */
      this.textRotation_ = 0;

      /**
       * @private
       * @type {?import("../canvas.js").FillState}
       */
      this.textFillState_ = null;

      /**
       * @type {!Object<string, import("../canvas.js").FillState>}
       */
      this.fillStates = {};

      /**
       * @private
       * @type {?import("../canvas.js").StrokeState}
       */
      this.textStrokeState_ = null;

      /**
       * @type {!Object<string, import("../canvas.js").StrokeState>}
       */
      this.strokeStates = {};

      /**
       * @private
       * @type {import("../canvas.js").TextState}
       */
      this.textState_ = /** @type {import("../canvas.js").TextState} */ ({});

      /**
       * @type {!Object<string, import("../canvas.js").TextState>}
       */
      this.textStates = {};

      /**
       * @private
       * @type {string}
       */
      this.textKey_ = '';

      /**
       * @private
       * @type {string}
       */
      this.fillKey_ = '';

      /**
       * @private
       * @type {string}
       */
      this.strokeKey_ = '';

      /**
       * @private
       * @type {Object<string, Object<string, number>>}
       */
      this.widths_ = {};

      labelCache.prune();

    }

    if ( CanvasReplay ) CanvasTextReplay.__proto__ = CanvasReplay;
    CanvasTextReplay.prototype = Object.create( CanvasReplay && CanvasReplay.prototype );
    CanvasTextReplay.prototype.constructor = CanvasTextReplay;

    /**
     * @inheritDoc
     */
    CanvasTextReplay.prototype.drawText = function drawText (geometry, feature) {
      var fillState = this.textFillState_;
      var strokeState = this.textStrokeState_;
      var textState = this.textState_;
      if (this.text_ === '' || !textState || (!fillState && !strokeState)) {
        return;
      }

      var begin = this.coordinates.length;

      var geometryType = geometry.getType();
      var flatCoordinates = null;
      var end = 2;
      var stride = 2;
      var i, ii;

      if (textState.placement === TextPlacement.LINE) {
        if (!intersects(this.getBufferedMaxExtent(), geometry.getExtent())) {
          return;
        }
        var ends;
        flatCoordinates = geometry.getFlatCoordinates();
        stride = geometry.getStride();
        if (geometryType == GeometryType.LINE_STRING) {
          ends = [flatCoordinates.length];
        } else if (geometryType == GeometryType.MULTI_LINE_STRING) {
          ends = geometry.getEnds();
        } else if (geometryType == GeometryType.POLYGON) {
          ends = geometry.getEnds().slice(0, 1);
        } else if (geometryType == GeometryType.MULTI_POLYGON) {
          var endss = geometry.getEndss();
          ends = [];
          for (i = 0, ii = endss.length; i < ii; ++i) {
            ends.push(endss[i][0]);
          }
        }
        this.beginGeometry(geometry, feature);
        var textAlign = textState.textAlign;
        var flatOffset = 0;
        var flatEnd;
        for (var o = 0, oo = ends.length; o < oo; ++o) {
          if (textAlign == undefined) {
            var range = matchingChunk(textState.maxAngle, flatCoordinates, flatOffset, ends[o], stride);
            flatOffset = range[0];
            flatEnd = range[1];
          } else {
            flatEnd = ends[o];
          }
          for (i = flatOffset; i < flatEnd; i += stride) {
            this.coordinates.push(flatCoordinates[i], flatCoordinates[i + 1]);
          }
          end = this.coordinates.length;
          flatOffset = ends[o];
          this.drawChars_(begin, end, this.declutterGroup_);
          begin = end;
        }
        this.endGeometry(geometry, feature);

      } else {
        var label = this.getImage(this.text_, this.textKey_, this.fillKey_, this.strokeKey_);
        var width = label.width / this.pixelRatio;
        switch (geometryType) {
          case GeometryType.POINT:
          case GeometryType.MULTI_POINT:
            flatCoordinates = geometry.getFlatCoordinates();
            end = flatCoordinates.length;
            break;
          case GeometryType.LINE_STRING:
            flatCoordinates = /** @type {import("../../geom/LineString.js").default} */ (geometry).getFlatMidpoint();
            break;
          case GeometryType.CIRCLE:
            flatCoordinates = /** @type {import("../../geom/Circle.js").default} */ (geometry).getCenter();
            break;
          case GeometryType.MULTI_LINE_STRING:
            flatCoordinates = /** @type {import("../../geom/MultiLineString.js").default} */ (geometry).getFlatMidpoints();
            end = flatCoordinates.length;
            break;
          case GeometryType.POLYGON:
            flatCoordinates = /** @type {import("../../geom/Polygon.js").default} */ (geometry).getFlatInteriorPoint();
            if (!textState.overflow && flatCoordinates[2] / this.resolution < width) {
              return;
            }
            stride = 3;
            break;
          case GeometryType.MULTI_POLYGON:
            var interiorPoints = /** @type {import("../../geom/MultiPolygon.js").default} */ (geometry).getFlatInteriorPoints();
            flatCoordinates = [];
            for (i = 0, ii = interiorPoints.length; i < ii; i += 3) {
              if (textState.overflow || interiorPoints[i + 2] / this.resolution >= width) {
                flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
              }
            }
            end = flatCoordinates.length;
            if (end == 0) {
              return;
            }
            break;
          default:
        }
        end = this.appendFlatCoordinates(flatCoordinates, 0, end, stride, false, false);
        if (textState.backgroundFill || textState.backgroundStroke) {
          this.setFillStrokeStyle(textState.backgroundFill, textState.backgroundStroke);
          if (textState.backgroundFill) {
            this.updateFillStyle(this.state, this.createFill, geometry);
            this.hitDetectionInstructions.push(this.createFill(this.state, geometry));
          }
          if (textState.backgroundStroke) {
            this.updateStrokeStyle(this.state, this.applyStroke);
            this.hitDetectionInstructions.push(this.createStroke(this.state));
          }
        }
        this.beginGeometry(geometry, feature);
        this.drawTextImage_(label, begin, end);
        this.endGeometry(geometry, feature);
      }
    };

    /**
     * @param {string} text Text.
     * @param {string} textKey Text style key.
     * @param {string} fillKey Fill style key.
     * @param {string} strokeKey Stroke style key.
     * @return {HTMLCanvasElement} Image.
     */
    CanvasTextReplay.prototype.getImage = function getImage (text, textKey, fillKey, strokeKey) {
      var label;
      var key = strokeKey + textKey + text + fillKey + this.pixelRatio;

      if (!labelCache.containsKey(key)) {
        var strokeState = strokeKey ? this.strokeStates[strokeKey] || this.textStrokeState_ : null;
        var fillState = fillKey ? this.fillStates[fillKey] || this.textFillState_ : null;
        var textState = this.textStates[textKey] || this.textState_;
        var pixelRatio = this.pixelRatio;
        var scale = textState.scale * pixelRatio;
        var align = TEXT_ALIGN[textState.textAlign || defaultTextAlign];
        var strokeWidth = strokeKey && strokeState.lineWidth ? strokeState.lineWidth : 0;

        var lines = text.split('\n');
        var numLines = lines.length;
        var widths = [];
        var width = measureTextWidths(textState.font, lines, widths);
        var lineHeight = measureTextHeight(textState.font);
        var height = lineHeight * numLines;
        var renderWidth = (width + strokeWidth);
        var context = createCanvasContext2D(
          Math.ceil(renderWidth * scale),
          Math.ceil((height + strokeWidth) * scale));
        label = context.canvas;
        labelCache.set(key, label);
        if (scale != 1) {
          context.scale(scale, scale);
        }
        context.font = textState.font;
        if (strokeKey) {
          context.strokeStyle = strokeState.strokeStyle;
          context.lineWidth = strokeWidth;
          context.lineCap = /** @type {CanvasLineCap} */ (strokeState.lineCap);
          context.lineJoin = /** @type {CanvasLineJoin} */ (strokeState.lineJoin);
          context.miterLimit = strokeState.miterLimit;
          if (CANVAS_LINE_DASH && strokeState.lineDash.length) {
            context.setLineDash(strokeState.lineDash);
            context.lineDashOffset = strokeState.lineDashOffset;
          }
        }
        if (fillKey) {
          context.fillStyle = fillState.fillStyle;
        }
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        var leftRight = (0.5 - align);
        var x = align * label.width / scale + leftRight * strokeWidth;
        var i;
        if (strokeKey) {
          for (i = 0; i < numLines; ++i) {
            context.strokeText(lines[i], x + leftRight * widths[i], 0.5 * (strokeWidth + lineHeight) + i * lineHeight);
          }
        }
        if (fillKey) {
          for (i = 0; i < numLines; ++i) {
            context.fillText(lines[i], x + leftRight * widths[i], 0.5 * (strokeWidth + lineHeight) + i * lineHeight);
          }
        }
      }
      return labelCache.get(key);
    };

    /**
     * @private
     * @param {HTMLCanvasElement} label Label.
     * @param {number} begin Begin.
     * @param {number} end End.
     */
    CanvasTextReplay.prototype.drawTextImage_ = function drawTextImage_ (label, begin, end) {
      var textState = this.textState_;
      var strokeState = this.textStrokeState_;
      var pixelRatio = this.pixelRatio;
      var align = TEXT_ALIGN[textState.textAlign || defaultTextAlign];
      var baseline = TEXT_ALIGN[textState.textBaseline];
      var strokeWidth = strokeState && strokeState.lineWidth ? strokeState.lineWidth : 0;

      var anchorX = align * label.width / pixelRatio + 2 * (0.5 - align) * strokeWidth;
      var anchorY = baseline * label.height / pixelRatio + 2 * (0.5 - baseline) * strokeWidth;
      this.instructions.push([Instruction.DRAW_IMAGE, begin, end,
        label, (anchorX - this.textOffsetX_) * pixelRatio, (anchorY - this.textOffsetY_) * pixelRatio,
        this.declutterGroup_, label.height, 1, 0, 0, this.textRotateWithView_, this.textRotation_,
        1, label.width,
        textState.padding == defaultPadding ?
          defaultPadding : textState.padding.map(function(p) {
            return p * pixelRatio;
          }),
        !!textState.backgroundFill, !!textState.backgroundStroke
      ]);
      this.hitDetectionInstructions.push([Instruction.DRAW_IMAGE, begin, end,
        label, (anchorX - this.textOffsetX_) * pixelRatio, (anchorY - this.textOffsetY_) * pixelRatio,
        this.declutterGroup_, label.height, 1, 0, 0, this.textRotateWithView_, this.textRotation_,
        1 / pixelRatio, label.width, textState.padding,
        !!textState.backgroundFill, !!textState.backgroundStroke
      ]);
    };

    /**
     * @private
     * @param {number} begin Begin.
     * @param {number} end End.
     * @param {import("../canvas.js").DeclutterGroup} declutterGroup Declutter group.
     */
    CanvasTextReplay.prototype.drawChars_ = function drawChars_ (begin, end, declutterGroup) {
      var strokeState = this.textStrokeState_;
      var textState = this.textState_;
      var fillState = this.textFillState_;

      var strokeKey = this.strokeKey_;
      if (strokeState) {
        if (!(strokeKey in this.strokeStates)) {
          this.strokeStates[strokeKey] = /** @type {import("../canvas.js").StrokeState} */ ({
            strokeStyle: strokeState.strokeStyle,
            lineCap: strokeState.lineCap,
            lineDashOffset: strokeState.lineDashOffset,
            lineWidth: strokeState.lineWidth,
            lineJoin: strokeState.lineJoin,
            miterLimit: strokeState.miterLimit,
            lineDash: strokeState.lineDash
          });
        }
      }
      var textKey = this.textKey_;
      if (!(this.textKey_ in this.textStates)) {
        this.textStates[this.textKey_] = /** @type {import("../canvas.js").TextState} */ ({
          font: textState.font,
          textAlign: textState.textAlign || defaultTextAlign,
          scale: textState.scale
        });
      }
      var fillKey = this.fillKey_;
      if (fillState) {
        if (!(fillKey in this.fillStates)) {
          this.fillStates[fillKey] = /** @type {import("../canvas.js").FillState} */ ({
            fillStyle: fillState.fillStyle
          });
        }
      }

      var pixelRatio = this.pixelRatio;
      var baseline = TEXT_ALIGN[textState.textBaseline];

      var offsetY = this.textOffsetY_ * pixelRatio;
      var text = this.text_;
      var font = textState.font;
      var textScale = textState.scale;
      var strokeWidth = strokeState ? strokeState.lineWidth * textScale / 2 : 0;
      var widths = this.widths_[font];
      if (!widths) {
        this.widths_[font] = widths = {};
      }
      this.instructions.push([Instruction.DRAW_CHARS,
        begin, end, baseline, declutterGroup,
        textState.overflow, fillKey, textState.maxAngle,
        function(text) {
          var width = widths[text];
          if (!width) {
            width = widths[text] = measureTextWidth(font, text);
          }
          return width * textScale * pixelRatio;
        },
        offsetY, strokeKey, strokeWidth * pixelRatio, text, textKey, 1
      ]);
      this.hitDetectionInstructions.push([Instruction.DRAW_CHARS,
        begin, end, baseline, declutterGroup,
        textState.overflow, fillKey, textState.maxAngle,
        function(text) {
          var width = widths[text];
          if (!width) {
            width = widths[text] = measureTextWidth(font, text);
          }
          return width * textScale;
        },
        offsetY, strokeKey, strokeWidth, text, textKey, 1 / pixelRatio
      ]);
    };

    /**
     * @inheritDoc
     */
    CanvasTextReplay.prototype.setTextStyle = function setTextStyle (textStyle, declutterGroup) {
      var textState, fillState, strokeState;
      if (!textStyle) {
        this.text_ = '';
      } else {
        this.declutterGroup_ = /** @type {import("../canvas.js").DeclutterGroup} */ (declutterGroup);

        var textFillStyle = textStyle.getFill();
        if (!textFillStyle) {
          fillState = this.textFillState_ = null;
        } else {
          fillState = this.textFillState_;
          if (!fillState) {
            fillState = this.textFillState_ = /** @type {import("../canvas.js").FillState} */ ({});
          }
          fillState.fillStyle = asColorLike(
            textFillStyle.getColor() || defaultFillStyle);
        }

        var textStrokeStyle = textStyle.getStroke();
        if (!textStrokeStyle) {
          strokeState = this.textStrokeState_ = null;
        } else {
          strokeState = this.textStrokeState_;
          if (!strokeState) {
            strokeState = this.textStrokeState_ = /** @type {import("../canvas.js").StrokeState} */ ({});
          }
          var lineDash = textStrokeStyle.getLineDash();
          var lineDashOffset = textStrokeStyle.getLineDashOffset();
          var lineWidth = textStrokeStyle.getWidth();
          var miterLimit = textStrokeStyle.getMiterLimit();
          strokeState.lineCap = textStrokeStyle.getLineCap() || defaultLineCap;
          strokeState.lineDash = lineDash ? lineDash.slice() : defaultLineDash;
          strokeState.lineDashOffset =
              lineDashOffset === undefined ? defaultLineDashOffset : lineDashOffset;
          strokeState.lineJoin = textStrokeStyle.getLineJoin() || defaultLineJoin;
          strokeState.lineWidth =
              lineWidth === undefined ? defaultLineWidth : lineWidth;
          strokeState.miterLimit =
              miterLimit === undefined ? defaultMiterLimit : miterLimit;
          strokeState.strokeStyle = asColorLike(
            textStrokeStyle.getColor() || defaultStrokeStyle);
        }

        textState = this.textState_;
        var font = textStyle.getFont() || defaultFont;
        checkFont(font);
        var textScale = textStyle.getScale();
        textState.overflow = textStyle.getOverflow();
        textState.font = font;
        textState.maxAngle = textStyle.getMaxAngle();
        textState.placement = textStyle.getPlacement();
        textState.textAlign = textStyle.getTextAlign();
        textState.textBaseline = textStyle.getTextBaseline() || defaultTextBaseline;
        textState.backgroundFill = textStyle.getBackgroundFill();
        textState.backgroundStroke = textStyle.getBackgroundStroke();
        textState.padding = textStyle.getPadding() || defaultPadding;
        textState.scale = textScale === undefined ? 1 : textScale;

        var textOffsetX = textStyle.getOffsetX();
        var textOffsetY = textStyle.getOffsetY();
        var textRotateWithView = textStyle.getRotateWithView();
        var textRotation = textStyle.getRotation();
        this.text_ = textStyle.getText() || '';
        this.textOffsetX_ = textOffsetX === undefined ? 0 : textOffsetX;
        this.textOffsetY_ = textOffsetY === undefined ? 0 : textOffsetY;
        this.textRotateWithView_ = textRotateWithView === undefined ? false : textRotateWithView;
        this.textRotation_ = textRotation === undefined ? 0 : textRotation;

        this.strokeKey_ = strokeState ?
          (typeof strokeState.strokeStyle == 'string' ? strokeState.strokeStyle : getUid(strokeState.strokeStyle)) +
          strokeState.lineCap + strokeState.lineDashOffset + '|' + strokeState.lineWidth +
          strokeState.lineJoin + strokeState.miterLimit + '[' + strokeState.lineDash.join() + ']' :
          '';
        this.textKey_ = textState.font + textState.scale + (textState.textAlign || '?');
        this.fillKey_ = fillState ?
          (typeof fillState.fillStyle == 'string' ? fillState.fillStyle : ('|' + getUid(fillState.fillStyle))) :
          '';
      }
    };

    return CanvasTextReplay;
  }(CanvasReplay));


  /**
   * @param {string} font Font to use for measuring.
   * @param {Array<string>} lines Lines to measure.
   * @param {Array<number>} widths Array will be populated with the widths of
   * each line.
   * @return {number} Width of the whole text.
   */
  function measureTextWidths(font, lines, widths) {
    var numLines = lines.length;
    var width = 0;
    for (var i = 0; i < numLines; ++i) {
      var currentWidth = measureTextWidth(font, lines[i]);
      width = Math.max(width, currentWidth);
      widths.push(currentWidth);
    }
    return width;
  }

  /**
   * @module ol/render/canvas/ReplayGroup
   */


  /**
   * @type {Object<ReplayType, typeof CanvasReplay>}
   */
  var BATCH_CONSTRUCTORS = {
    'Circle': CanvasPolygonReplay,
    'Default': CanvasReplay,
    'Image': CanvasImageReplay,
    'LineString': CanvasLineStringReplay,
    'Polygon': CanvasPolygonReplay,
    'Text': CanvasTextReplay
  };


  var CanvasReplayGroup = /*@__PURE__*/(function (ReplayGroup) {
    function CanvasReplayGroup(
      tolerance,
      maxExtent,
      resolution,
      pixelRatio,
      overlaps,
      declutterTree,
      opt_renderBuffer
    ) {
      ReplayGroup.call(this);

      /**
       * Declutter tree.
       * @private
       */
      this.declutterTree_ = declutterTree;

      /**
       * @type {import("../canvas.js").DeclutterGroup}
       * @private
       */
      this.declutterGroup_ = null;

      /**
       * @private
       * @type {number}
       */
      this.tolerance_ = tolerance;

      /**
       * @private
       * @type {import("../../extent.js").Extent}
       */
      this.maxExtent_ = maxExtent;

      /**
       * @private
       * @type {boolean}
       */
      this.overlaps_ = overlaps;

      /**
       * @private
       * @type {number}
       */
      this.pixelRatio_ = pixelRatio;

      /**
       * @private
       * @type {number}
       */
      this.resolution_ = resolution;

      /**
       * @private
       * @type {number|undefined}
       */
      this.renderBuffer_ = opt_renderBuffer;

      /**
       * @private
       * @type {!Object<string, !Object<ReplayType, CanvasReplay>>}
       */
      this.replaysByZIndex_ = {};

      /**
       * @private
       * @type {CanvasRenderingContext2D}
       */
      this.hitDetectionContext_ = createCanvasContext2D(1, 1);

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.hitDetectionTransform_ = create();
    }

    if ( ReplayGroup ) CanvasReplayGroup.__proto__ = ReplayGroup;
    CanvasReplayGroup.prototype = Object.create( ReplayGroup && ReplayGroup.prototype );
    CanvasReplayGroup.prototype.constructor = CanvasReplayGroup;

    /**
     * @inheritDoc
     */
    CanvasReplayGroup.prototype.addDeclutter = function addDeclutter (group) {
      var declutter = null;
      if (this.declutterTree_) {
        if (group) {
          declutter = this.declutterGroup_;
          /** @type {number} */ (declutter[4])++;
        } else {
          declutter = this.declutterGroup_ = createEmpty();
          declutter.push(1);
        }
      }
      return declutter;
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../transform.js").Transform} transform Transform.
     */
    CanvasReplayGroup.prototype.clip = function clip (context, transform) {
      var flatClipCoords = this.getClipCoords(transform);
      context.beginPath();
      context.moveTo(flatClipCoords[0], flatClipCoords[1]);
      context.lineTo(flatClipCoords[2], flatClipCoords[3]);
      context.lineTo(flatClipCoords[4], flatClipCoords[5]);
      context.lineTo(flatClipCoords[6], flatClipCoords[7]);
      context.clip();
    };

    /**
     * @param {Array<ReplayType>} replays Replays.
     * @return {boolean} Has replays of the provided types.
     */
    CanvasReplayGroup.prototype.hasReplays = function hasReplays (replays) {
      for (var zIndex in this.replaysByZIndex_) {
        var candidates = this.replaysByZIndex_[zIndex];
        for (var i = 0, ii = replays.length; i < ii; ++i) {
          if (replays[i] in candidates) {
            return true;
          }
        }
      }
      return false;
    };

    /**
     * FIXME empty description for jsdoc
     */
    CanvasReplayGroup.prototype.finish = function finish () {
      for (var zKey in this.replaysByZIndex_) {
        var replays = this.replaysByZIndex_[zKey];
        for (var replayKey in replays) {
          replays[replayKey].finish();
        }
      }
    };

    /**
     * @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
     * @param {number} resolution Resolution.
     * @param {number} rotation Rotation.
     * @param {number} hitTolerance Hit tolerance in pixels.
     * @param {Object<string, boolean>} skippedFeaturesHash Ids of features to skip.
     * @param {function((import("../../Feature.js").default|import("../Feature.js").default)): T} callback Feature callback.
     * @param {Object<string, import("../canvas.js").DeclutterGroup>} declutterReplays Declutter replays.
     * @return {T|undefined} Callback result.
     * @template T
     */
    CanvasReplayGroup.prototype.forEachFeatureAtCoordinate = function forEachFeatureAtCoordinate (
      coordinate,
      resolution,
      rotation,
      hitTolerance,
      skippedFeaturesHash,
      callback,
      declutterReplays
    ) {

      hitTolerance = Math.round(hitTolerance);
      var contextSize = hitTolerance * 2 + 1;
      var transform = compose(this.hitDetectionTransform_,
        hitTolerance + 0.5, hitTolerance + 0.5,
        1 / resolution, -1 / resolution,
        -rotation,
        -coordinate[0], -coordinate[1]);
      var context = this.hitDetectionContext_;

      if (context.canvas.width !== contextSize || context.canvas.height !== contextSize) {
        context.canvas.width = contextSize;
        context.canvas.height = contextSize;
      } else {
        context.clearRect(0, 0, contextSize, contextSize);
      }

      /**
       * @type {import("../../extent.js").Extent}
       */
      var hitExtent;
      if (this.renderBuffer_ !== undefined) {
        hitExtent = createEmpty();
        extendCoordinate(hitExtent, coordinate);
        buffer(hitExtent, resolution * (this.renderBuffer_ + hitTolerance), hitExtent);
      }

      var mask = getCircleArray(hitTolerance);
      var declutteredFeatures;
      if (this.declutterTree_) {
        declutteredFeatures = this.declutterTree_.all().map(function(entry) {
          return entry.value;
        });
      }

      var replayType;

      /**
       * @param {import("../../Feature.js").default|import("../Feature.js").default} feature Feature.
       * @return {?} Callback result.
       */
      function featureCallback(feature) {
        var imageData = context.getImageData(0, 0, contextSize, contextSize).data;
        for (var i = 0; i < contextSize; i++) {
          for (var j = 0; j < contextSize; j++) {
            if (mask[i][j]) {
              if (imageData[(j * contextSize + i) * 4 + 3] > 0) {
                var result = (void 0);
                if (!(declutteredFeatures && (replayType == ReplayType.IMAGE || replayType == ReplayType.TEXT)) ||
                    declutteredFeatures.indexOf(feature) !== -1) {
                  result = callback(feature);
                }
                if (result) {
                  return result;
                } else {
                  context.clearRect(0, 0, contextSize, contextSize);
                  return undefined;
                }
              }
            }
          }
        }
      }

      /** @type {Array<number>} */
      var zs = Object.keys(this.replaysByZIndex_).map(Number);
      zs.sort(numberSafeCompareFunction);

      var i, j, replays, replay, result;
      for (i = zs.length - 1; i >= 0; --i) {
        var zIndexKey = zs[i].toString();
        replays = this.replaysByZIndex_[zIndexKey];
        for (j = ORDER.length - 1; j >= 0; --j) {
          replayType = ORDER[j];
          replay = replays[replayType];
          if (replay !== undefined) {
            if (declutterReplays &&
                (replayType == ReplayType.IMAGE || replayType == ReplayType.TEXT)) {
              var declutter = declutterReplays[zIndexKey];
              if (!declutter) {
                declutterReplays[zIndexKey] = [replay, transform.slice(0)];
              } else {
                declutter.push(replay, transform.slice(0));
              }
            } else {
              result = replay.replayHitDetection(context, transform, rotation,
                skippedFeaturesHash, featureCallback, hitExtent);
              if (result) {
                return result;
              }
            }
          }
        }
      }
      return undefined;
    };

    /**
     * @param {import("../../transform.js").Transform} transform Transform.
     * @return {Array<number>} Clip coordinates.
     */
    CanvasReplayGroup.prototype.getClipCoords = function getClipCoords (transform) {
      var maxExtent = this.maxExtent_;
      var minX = maxExtent[0];
      var minY = maxExtent[1];
      var maxX = maxExtent[2];
      var maxY = maxExtent[3];
      var flatClipCoords = [minX, minY, minX, maxY, maxX, maxY, maxX, minY];
      transform2D(
        flatClipCoords, 0, 8, 2, transform, flatClipCoords);
      return flatClipCoords;
    };

    /**
     * @inheritDoc
     */
    CanvasReplayGroup.prototype.getReplay = function getReplay (zIndex, replayType) {
      var zIndexKey = zIndex !== undefined ? zIndex.toString() : '0';
      var replays = this.replaysByZIndex_[zIndexKey];
      if (replays === undefined) {
        replays = {};
        this.replaysByZIndex_[zIndexKey] = replays;
      }
      var replay = replays[replayType];
      if (replay === undefined) {
        var Constructor = BATCH_CONSTRUCTORS[replayType];
        replay = new Constructor(this.tolerance_, this.maxExtent_,
          this.resolution_, this.pixelRatio_, this.overlaps_, this.declutterTree_);
        replays[replayType] = replay;
      }
      return replay;
    };

    /**
     * @return {Object<string, Object<ReplayType, CanvasReplay>>} Replays.
     */
    CanvasReplayGroup.prototype.getReplays = function getReplays () {
      return this.replaysByZIndex_;
    };

    /**
     * @inheritDoc
     */
    CanvasReplayGroup.prototype.isEmpty = function isEmpty$1 () {
      return isEmpty(this.replaysByZIndex_);
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../transform.js").Transform} transform Transform.
     * @param {number} viewRotation View rotation.
     * @param {Object<string, boolean>} skippedFeaturesHash Ids of features to skip.
     * @param {boolean} snapToPixel Snap point symbols and test to integer pixel.
     * @param {Array<ReplayType>=} opt_replayTypes Ordered replay types to replay.
     *     Default is {@link module:ol/render/replay~ORDER}
     * @param {Object<string, import("../canvas.js").DeclutterGroup>=} opt_declutterReplays Declutter replays.
     */
    CanvasReplayGroup.prototype.replay = function replay (
      context,
      transform,
      viewRotation,
      skippedFeaturesHash,
      snapToPixel,
      opt_replayTypes,
      opt_declutterReplays
    ) {

      /** @type {Array<number>} */
      var zs = Object.keys(this.replaysByZIndex_).map(Number);
      zs.sort(numberSafeCompareFunction);

      // setup clipping so that the parts of over-simplified geometries are not
      // visible outside the current extent when panning
      context.save();
      this.clip(context, transform);

      var replayTypes = opt_replayTypes ? opt_replayTypes : ORDER;
      var i, ii, j, jj, replays, replay;
      for (i = 0, ii = zs.length; i < ii; ++i) {
        var zIndexKey = zs[i].toString();
        replays = this.replaysByZIndex_[zIndexKey];
        for (j = 0, jj = replayTypes.length; j < jj; ++j) {
          var replayType = replayTypes[j];
          replay = replays[replayType];
          if (replay !== undefined) {
            if (opt_declutterReplays &&
                (replayType == ReplayType.IMAGE || replayType == ReplayType.TEXT)) {
              var declutter = opt_declutterReplays[zIndexKey];
              if (!declutter) {
                opt_declutterReplays[zIndexKey] = [replay, transform.slice(0)];
              } else {
                declutter.push(replay, transform.slice(0));
              }
            } else {
              replay.replay(context, transform, viewRotation, skippedFeaturesHash, snapToPixel);
            }
          }
        }
      }

      context.restore();
    };

    return CanvasReplayGroup;
  }(ReplayGroup));


  /**
   * This cache is used for storing calculated pixel circles for increasing performance.
   * It is a static property to allow each Replaygroup to access it.
   * @type {Object<number, Array<Array<(boolean|undefined)>>>}
   */
  var circleArrayCache = {
    0: [[true]]
  };


  /**
   * This method fills a row in the array from the given coordinate to the
   * middle with `true`.
   * @param {Array<Array<(boolean|undefined)>>} array The array that will be altered.
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   */
  function fillCircleArrayRowToMiddle(array, x, y) {
    var i;
    var radius = Math.floor(array.length / 2);
    if (x >= radius) {
      for (i = radius; i < x; i++) {
        array[i][y] = true;
      }
    } else if (x < radius) {
      for (i = x + 1; i < radius; i++) {
        array[i][y] = true;
      }
    }
  }


  /**
   * This methods creates a circle inside a fitting array. Points inside the
   * circle are marked by true, points on the outside are undefined.
   * It uses the midpoint circle algorithm.
   * A cache is used to increase performance.
   * @param {number} radius Radius.
   * @returns {Array<Array<(boolean|undefined)>>} An array with marked circle points.
   */
  function getCircleArray(radius) {
    if (circleArrayCache[radius] !== undefined) {
      return circleArrayCache[radius];
    }

    var arraySize = radius * 2 + 1;
    var arr = new Array(arraySize);
    for (var i = 0; i < arraySize; i++) {
      arr[i] = new Array(arraySize);
    }

    var x = radius;
    var y = 0;
    var error = 0;

    while (x >= y) {
      fillCircleArrayRowToMiddle(arr, radius + x, radius + y);
      fillCircleArrayRowToMiddle(arr, radius + y, radius + x);
      fillCircleArrayRowToMiddle(arr, radius - y, radius + x);
      fillCircleArrayRowToMiddle(arr, radius - x, radius + y);
      fillCircleArrayRowToMiddle(arr, radius - x, radius - y);
      fillCircleArrayRowToMiddle(arr, radius - y, radius - x);
      fillCircleArrayRowToMiddle(arr, radius + y, radius - x);
      fillCircleArrayRowToMiddle(arr, radius + x, radius - y);

      y++;
      error += 1 + 2 * y;
      if (2 * (error - x) + 1 > 0) {
        x -= 1;
        error += 1 - 2 * x;
      }
    }

    circleArrayCache[radius] = arr;
    return arr;
  }


  /**
   * @param {!Object<string, Array<*>>} declutterReplays Declutter replays.
   * @param {CanvasRenderingContext2D} context Context.
   * @param {number} rotation Rotation.
   * @param {boolean} snapToPixel Snap point symbols and text to integer pixels.
   */
  function replayDeclutter(declutterReplays, context, rotation, snapToPixel) {
    var zs = Object.keys(declutterReplays).map(Number).sort(numberSafeCompareFunction);
    var skippedFeatureUids = {};
    for (var z = 0, zz = zs.length; z < zz; ++z) {
      var replayData = declutterReplays[zs[z].toString()];
      for (var i = 0, ii = replayData.length; i < ii;) {
        var replay = replayData[i++];
        var transform = replayData[i++];
        replay.replay(context, transform, rotation, skippedFeatureUids, snapToPixel);
      }
    }
  }

  /**
   * @module ol/renderer/vector
   */


  /**
   * Tolerance for geometry simplification in device pixels.
   * @type {number}
   */
  var SIMPLIFY_TOLERANCE = 0.5;


  /**
   * @const
   * @type {Object<import("../geom/GeometryType.js").default,
   *                function(import("../render/ReplayGroup.js").default, import("../geom/Geometry.js").default,
   *                         import("../style/Style.js").default, Object)>}
   */
  var GEOMETRY_RENDERERS = {
    'Point': renderPointGeometry,
    'LineString': renderLineStringGeometry,
    'Polygon': renderPolygonGeometry,
    'MultiPoint': renderMultiPointGeometry,
    'MultiLineString': renderMultiLineStringGeometry,
    'MultiPolygon': renderMultiPolygonGeometry,
    'GeometryCollection': renderGeometryCollectionGeometry,
    'Circle': renderCircleGeometry
  };


  /**
   * @param {import("../Feature.js").FeatureLike} feature1 Feature 1.
   * @param {import("../Feature.js").FeatureLike} feature2 Feature 2.
   * @return {number} Order.
   */
  function defaultOrder(feature1, feature2) {
    return parseInt(getUid(feature1), 10) - parseInt(getUid(feature2), 10);
  }


  /**
   * @param {number} resolution Resolution.
   * @param {number} pixelRatio Pixel ratio.
   * @return {number} Squared pixel tolerance.
   */
  function getSquaredTolerance(resolution, pixelRatio) {
    var tolerance = getTolerance(resolution, pixelRatio);
    return tolerance * tolerance;
  }


  /**
   * @param {number} resolution Resolution.
   * @param {number} pixelRatio Pixel ratio.
   * @return {number} Pixel tolerance.
   */
  function getTolerance(resolution, pixelRatio) {
    return SIMPLIFY_TOLERANCE * resolution / pixelRatio;
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/Circle.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").default} feature Feature.
   */
  function renderCircleGeometry(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
    if (fillStyle || strokeStyle) {
      var circleReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.CIRCLE);
      circleReplay.setFillStrokeStyle(fillStyle, strokeStyle);
      circleReplay.drawCircle(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(false));
      textReplay.drawText(geometry, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   * @param {import("../style/Style.js").default} style Style.
   * @param {number} squaredTolerance Squared tolerance.
   * @param {function(this: T, import("../events/Event.js").default)} listener Listener function.
   * @param {T} thisArg Value to use as `this` when executing `listener`.
   * @return {boolean} `true` if style is loading.
   * @template T
   */
  function renderFeature(replayGroup, feature, style, squaredTolerance, listener, thisArg) {
    var loading = false;
    var imageStyle = style.getImage();
    if (imageStyle) {
      var imageState = imageStyle.getImageState();
      if (imageState == ImageState.LOADED || imageState == ImageState.ERROR) {
        imageStyle.unlistenImageChange(listener, thisArg);
      } else {
        if (imageState == ImageState.IDLE) {
          imageStyle.load();
        }
        imageState = imageStyle.getImageState();
        imageStyle.listenImageChange(listener, thisArg);
        loading = true;
      }
    }
    renderFeatureInternal(replayGroup, feature, style, squaredTolerance);

    return loading;
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   * @param {import("../style/Style.js").default} style Style.
   * @param {number} squaredTolerance Squared tolerance.
   */
  function renderFeatureInternal(replayGroup, feature, style, squaredTolerance) {
    var geometry = style.getGeometryFunction()(feature);
    if (!geometry) {
      return;
    }
    var simplifiedGeometry = geometry.getSimplifiedGeometry(squaredTolerance);
    var renderer = style.getRenderer();
    if (renderer) {
      renderGeometry(replayGroup, simplifiedGeometry, style, feature);
    } else {
      var geometryRenderer = GEOMETRY_RENDERERS[simplifiedGeometry.getType()];
      geometryRenderer(replayGroup, simplifiedGeometry, style, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/Geometry.js").default|import("../render/Feature.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   */
  function renderGeometry(replayGroup, geometry, style, feature) {
    if (geometry.getType() == GeometryType.GEOMETRY_COLLECTION) {
      var geometries = /** @type {import("../geom/GeometryCollection.js").default} */ (geometry).getGeometries();
      for (var i = 0, ii = geometries.length; i < ii; ++i) {
        renderGeometry(replayGroup, geometries[i], style, feature);
      }
      return;
    }
    var replay = replayGroup.getReplay(style.getZIndex(), ReplayType.DEFAULT);
    replay.drawCustom(/** @type {import("../geom/SimpleGeometry.js").default} */ (geometry), feature, style.getRenderer());
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/GeometryCollection.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").default} feature Feature.
   */
  function renderGeometryCollectionGeometry(replayGroup, geometry, style, feature) {
    var geometries = geometry.getGeometriesArray();
    var i, ii;
    for (i = 0, ii = geometries.length; i < ii; ++i) {
      var geometryRenderer =
          GEOMETRY_RENDERERS[geometries[i].getType()];
      geometryRenderer(replayGroup, geometries[i], style, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/LineString.js").default|import("../render/Feature.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   */
  function renderLineStringGeometry(replayGroup, geometry, style, feature) {
    var strokeStyle = style.getStroke();
    if (strokeStyle) {
      var lineStringReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.LINE_STRING);
      lineStringReplay.setFillStrokeStyle(null, strokeStyle);
      lineStringReplay.drawLineString(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(false));
      textReplay.drawText(geometry, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/MultiLineString.js").default|import("../render/Feature.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   */
  function renderMultiLineStringGeometry(replayGroup, geometry, style, feature) {
    var strokeStyle = style.getStroke();
    if (strokeStyle) {
      var lineStringReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.LINE_STRING);
      lineStringReplay.setFillStrokeStyle(null, strokeStyle);
      lineStringReplay.drawMultiLineString(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(false));
      textReplay.drawText(geometry, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/MultiPolygon.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").default} feature Feature.
   */
  function renderMultiPolygonGeometry(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
    if (strokeStyle || fillStyle) {
      var polygonReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.POLYGON);
      polygonReplay.setFillStrokeStyle(fillStyle, strokeStyle);
      polygonReplay.drawMultiPolygon(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(false));
      textReplay.drawText(geometry, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/Point.js").default|import("../render/Feature.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   */
  function renderPointGeometry(replayGroup, geometry, style, feature) {
    var imageStyle = style.getImage();
    if (imageStyle) {
      if (imageStyle.getImageState() != ImageState.LOADED) {
        return;
      }
      var imageReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.IMAGE);
      imageReplay.setImageStyle(imageStyle, replayGroup.addDeclutter(false));
      imageReplay.drawPoint(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(!!imageStyle));
      textReplay.drawText(geometry, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/MultiPoint.js").default|import("../render/Feature.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   */
  function renderMultiPointGeometry(replayGroup, geometry, style, feature) {
    var imageStyle = style.getImage();
    if (imageStyle) {
      if (imageStyle.getImageState() != ImageState.LOADED) {
        return;
      }
      var imageReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.IMAGE);
      imageReplay.setImageStyle(imageStyle, replayGroup.addDeclutter(false));
      imageReplay.drawMultiPoint(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(!!imageStyle));
      textReplay.drawText(geometry, feature);
    }
  }


  /**
   * @param {import("../render/ReplayGroup.js").default} replayGroup Replay group.
   * @param {import("../geom/Polygon.js").default|import("../render/Feature.js").default} geometry Geometry.
   * @param {import("../style/Style.js").default} style Style.
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   */
  function renderPolygonGeometry(replayGroup, geometry, style, feature) {
    var fillStyle = style.getFill();
    var strokeStyle = style.getStroke();
    if (fillStyle || strokeStyle) {
      var polygonReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.POLYGON);
      polygonReplay.setFillStrokeStyle(fillStyle, strokeStyle);
      polygonReplay.drawPolygon(geometry, feature);
    }
    var textStyle = style.getText();
    if (textStyle) {
      var textReplay = replayGroup.getReplay(style.getZIndex(), ReplayType.TEXT);
      textReplay.setTextStyle(textStyle, replayGroup.addDeclutter(false));
      textReplay.drawText(geometry, feature);
    }
  }

  /**
   * @module ol/renderer/canvas/VectorLayer
   */

  /**
   * @classdesc
   * Canvas renderer for vector layers.
   * @api
   */
  var CanvasVectorLayerRenderer = /*@__PURE__*/(function (CanvasLayerRenderer) {
    function CanvasVectorLayerRenderer(vectorLayer) {

      CanvasLayerRenderer.call(this, vectorLayer);

      /**
       * Declutter tree.
       * @private
       */
      this.declutterTree_ = vectorLayer.getDeclutter() ? rbush_1(9, undefined) : null;

      /**
       * @private
       * @type {boolean}
       */
      this.dirty_ = false;

      /**
       * @private
       * @type {number}
       */
      this.renderedRevision_ = -1;

      /**
       * @private
       * @type {number}
       */
      this.renderedResolution_ = NaN;

      /**
       * @private
       * @type {import("../../extent.js").Extent}
       */
      this.renderedExtent_ = createEmpty();

      /**
       * @private
       * @type {function(import("../../Feature.js").default, import("../../Feature.js").default): number|null}
       */
      this.renderedRenderOrder_ = null;

      /**
       * @private
       * @type {import("../../render/canvas/ReplayGroup.js").default}
       */
      this.replayGroup_ = null;

      /**
       * A new replay group had to be created by `prepareFrame()`
       * @type {boolean}
       */
      this.replayGroupChanged = true;

      /**
       * @type {CanvasRenderingContext2D}
       */
      this.context = createCanvasContext2D();

      listen(labelCache, EventType.CLEAR, this.handleFontsChanged_, this);

    }

    if ( CanvasLayerRenderer ) CanvasVectorLayerRenderer.__proto__ = CanvasLayerRenderer;
    CanvasVectorLayerRenderer.prototype = Object.create( CanvasLayerRenderer && CanvasLayerRenderer.prototype );
    CanvasVectorLayerRenderer.prototype.constructor = CanvasVectorLayerRenderer;

    /**
     * @inheritDoc
     */
    CanvasVectorLayerRenderer.prototype.disposeInternal = function disposeInternal () {
      unlisten(labelCache, EventType.CLEAR, this.handleFontsChanged_, this);
      CanvasLayerRenderer.prototype.disposeInternal.call(this);
    };

    /**
     * @param {CanvasRenderingContext2D} context Context.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @param {import("../../layer/Layer.js").State} layerState Layer state.
     */
    CanvasVectorLayerRenderer.prototype.compose = function compose (context, frameState, layerState) {
      var extent = frameState.extent;
      var pixelRatio = frameState.pixelRatio;
      var skippedFeatureUids = layerState.managed ?
        frameState.skippedFeatureUids : {};
      var viewState = frameState.viewState;
      var projection = viewState.projection;
      var rotation = viewState.rotation;
      var projectionExtent = projection.getExtent();
      var vectorSource = /** @type {import("../../source/Vector.js").default} */ (this.getLayer().getSource());

      var transform = this.getTransform(frameState, 0);

      // clipped rendering if layer extent is set
      var clipExtent = layerState.extent;
      var clipped = clipExtent !== undefined;
      if (clipped) {
        this.clip(context, frameState, /** @type {import("../../extent.js").Extent} */ (clipExtent));
      }
      var replayGroup = this.replayGroup_;
      if (replayGroup && !replayGroup.isEmpty()) {
        if (this.declutterTree_) {
          this.declutterTree_.clear();
        }
        var layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        var drawOffsetX = 0;
        var drawOffsetY = 0;
        var replayContext;
        var transparentLayer = layerState.opacity !== 1;
        var hasRenderListeners = layer.hasListener(RenderEventType.RENDER);
        if (transparentLayer || hasRenderListeners) {
          var drawWidth = context.canvas.width;
          var drawHeight = context.canvas.height;
          if (rotation) {
            var drawSize = Math.round(Math.sqrt(drawWidth * drawWidth + drawHeight * drawHeight));
            drawOffsetX = (drawSize - drawWidth) / 2;
            drawOffsetY = (drawSize - drawHeight) / 2;
            drawWidth = drawHeight = drawSize;
          }
          // resize and clear
          this.context.canvas.width = drawWidth;
          this.context.canvas.height = drawHeight;
          replayContext = this.context;
        } else {
          replayContext = context;
        }

        var alpha = replayContext.globalAlpha;
        if (!transparentLayer) {
          // for performance reasons, context.save / context.restore is not used
          // to save and restore the transformation matrix and the opacity.
          // see http://jsperf.com/context-save-restore-versus-variable
          replayContext.globalAlpha = layerState.opacity;
        }

        if (replayContext != context) {
          replayContext.translate(drawOffsetX, drawOffsetY);
        }

        var viewHints = frameState.viewHints;
        var snapToPixel = !(viewHints[ViewHint.ANIMATING] || viewHints[ViewHint.INTERACTING]);
        var width = frameState.size[0] * pixelRatio;
        var height = frameState.size[1] * pixelRatio;
        rotateAtOffset(replayContext, -rotation,
          width / 2, height / 2);
        replayGroup.replay(replayContext, transform, rotation, skippedFeatureUids, snapToPixel);
        if (vectorSource.getWrapX() && projection.canWrapX() &&
            !containsExtent(projectionExtent, extent)) {
          var startX = extent[0];
          var worldWidth = getWidth(projectionExtent);
          var world = 0;
          var offsetX;
          while (startX < projectionExtent[0]) {
            --world;
            offsetX = worldWidth * world;
            transform = this.getTransform(frameState, offsetX);
            replayGroup.replay(replayContext, transform, rotation, skippedFeatureUids, snapToPixel);
            startX += worldWidth;
          }
          world = 0;
          startX = extent[2];
          while (startX > projectionExtent[2]) {
            ++world;
            offsetX = worldWidth * world;
            transform = this.getTransform(frameState, offsetX);
            replayGroup.replay(replayContext, transform, rotation, skippedFeatureUids, snapToPixel);
            startX -= worldWidth;
          }
        }
        rotateAtOffset(replayContext, rotation,
          width / 2, height / 2);

        if (hasRenderListeners) {
          this.dispatchRenderEvent(replayContext, frameState, transform);
        }
        if (replayContext != context) {
          if (transparentLayer) {
            var mainContextAlpha = context.globalAlpha;
            context.globalAlpha = layerState.opacity;
            context.drawImage(replayContext.canvas, -drawOffsetX, -drawOffsetY);
            context.globalAlpha = mainContextAlpha;
          } else {
            context.drawImage(replayContext.canvas, -drawOffsetX, -drawOffsetY);
          }
          replayContext.translate(-drawOffsetX, -drawOffsetY);
        }

        if (!transparentLayer) {
          replayContext.globalAlpha = alpha;
        }
      }

      if (clipped) {
        context.restore();
      }
    };

    /**
     * @inheritDoc
     */
    CanvasVectorLayerRenderer.prototype.composeFrame = function composeFrame (frameState, layerState, context) {
      var transform = this.getTransform(frameState, 0);
      this.preCompose(context, frameState, transform);
      this.compose(context, frameState, layerState);
      this.postCompose(context, frameState, layerState, transform);
    };

    /**
     * @inheritDoc
     */
    CanvasVectorLayerRenderer.prototype.forEachFeatureAtCoordinate = function forEachFeatureAtCoordinate (coordinate, frameState, hitTolerance, callback, thisArg) {
      if (!this.replayGroup_) {
        return undefined;
      } else {
        var resolution = frameState.viewState.resolution;
        var rotation = frameState.viewState.rotation;
        var layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
        /** @type {!Object<string, boolean>} */
        var features = {};
        var result = this.replayGroup_.forEachFeatureAtCoordinate(coordinate, resolution, rotation, hitTolerance, {},
          /**
           * @param {import("../../Feature.js").FeatureLike} feature Feature.
           * @return {?} Callback result.
           */
          function(feature) {
            var key = getUid(feature);
            if (!(key in features)) {
              features[key] = true;
              return callback.call(thisArg, feature, layer);
            }
          }, null);
        return result;
      }
    };

    /**
     * @param {import("../../events/Event.js").default} event Event.
     */
    CanvasVectorLayerRenderer.prototype.handleFontsChanged_ = function handleFontsChanged_ (event) {
      var layer = this.getLayer();
      if (layer.getVisible() && this.replayGroup_) {
        layer.changed();
      }
    };

    /**
     * Handle changes in image style state.
     * @param {import("../../events/Event.js").default} event Image style change event.
     * @private
     */
    CanvasVectorLayerRenderer.prototype.handleStyleImageChange_ = function handleStyleImageChange_ (event) {
      this.renderIfReadyAndVisible();
    };

    /**
     * @inheritDoc
     */
    CanvasVectorLayerRenderer.prototype.prepareFrame = function prepareFrame (frameState, layerState) {
      var vectorLayer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
      var vectorSource = /** @type {import("../../source/Vector.js").default} */ (vectorLayer.getSource());

      var animating = frameState.viewHints[ViewHint.ANIMATING];
      var interacting = frameState.viewHints[ViewHint.INTERACTING];
      var updateWhileAnimating = vectorLayer.getUpdateWhileAnimating();
      var updateWhileInteracting = vectorLayer.getUpdateWhileInteracting();

      if (!this.dirty_ && (!updateWhileAnimating && animating) ||
          (!updateWhileInteracting && interacting)) {
        return true;
      }

      var frameStateExtent = frameState.extent;
      var viewState = frameState.viewState;
      var projection = viewState.projection;
      var resolution = viewState.resolution;
      var pixelRatio = frameState.pixelRatio;
      var vectorLayerRevision = vectorLayer.getRevision();
      var vectorLayerRenderBuffer = vectorLayer.getRenderBuffer();
      var vectorLayerRenderOrder = vectorLayer.getRenderOrder();

      if (vectorLayerRenderOrder === undefined) {
        vectorLayerRenderOrder = defaultOrder;
      }

      var extent = buffer(frameStateExtent,
        vectorLayerRenderBuffer * resolution);
      var projectionExtent = viewState.projection.getExtent();

      if (vectorSource.getWrapX() && viewState.projection.canWrapX() &&
          !containsExtent(projectionExtent, frameState.extent)) {
        // For the replay group, we need an extent that intersects the real world
        // (-180° to +180°). To support geometries in a coordinate range from -540°
        // to +540°, we add at least 1 world width on each side of the projection
        // extent. If the viewport is wider than the world, we need to add half of
        // the viewport width to make sure we cover the whole viewport.
        var worldWidth = getWidth(projectionExtent);
        var gutter = Math.max(getWidth(extent) / 2, worldWidth);
        extent[0] = projectionExtent[0] - gutter;
        extent[2] = projectionExtent[2] + gutter;
      }

      if (!this.dirty_ &&
          this.renderedResolution_ == resolution &&
          this.renderedRevision_ == vectorLayerRevision &&
          this.renderedRenderOrder_ == vectorLayerRenderOrder &&
          containsExtent(this.renderedExtent_, extent)) {
        this.replayGroupChanged = false;
        return true;
      }

      this.replayGroup_ = null;

      this.dirty_ = false;

      var replayGroup = new CanvasReplayGroup(
        getTolerance(resolution, pixelRatio), extent, resolution,
        pixelRatio, vectorSource.getOverlaps(), this.declutterTree_, vectorLayer.getRenderBuffer());
      vectorSource.loadFeatures(extent, resolution, projection);
      /**
       * @param {import("../../Feature.js").default} feature Feature.
       * @this {CanvasVectorLayerRenderer}
       */
      var render = function(feature) {
        var styles;
        var styleFunction = feature.getStyleFunction() || vectorLayer.getStyleFunction();
        if (styleFunction) {
          styles = styleFunction(feature, resolution);
        }
        if (styles) {
          var dirty = this.renderFeature(
            feature, resolution, pixelRatio, styles, replayGroup);
          this.dirty_ = this.dirty_ || dirty;
        }
      }.bind(this);
      if (vectorLayerRenderOrder) {
        /** @type {Array<import("../../Feature.js").default>} */
        var features = [];
        vectorSource.forEachFeatureInExtent(extent,
          /**
           * @param {import("../../Feature.js").default} feature Feature.
           */
          function(feature) {
            features.push(feature);
          });
        features.sort(vectorLayerRenderOrder);
        for (var i = 0, ii = features.length; i < ii; ++i) {
          render(features[i]);
        }
      } else {
        vectorSource.forEachFeatureInExtent(extent, render);
      }
      replayGroup.finish();

      this.renderedResolution_ = resolution;
      this.renderedRevision_ = vectorLayerRevision;
      this.renderedRenderOrder_ = vectorLayerRenderOrder;
      this.renderedExtent_ = extent;
      this.replayGroup_ = replayGroup;

      this.replayGroupChanged = true;
      return true;
    };

    /**
     * @param {import("../../Feature.js").default} feature Feature.
     * @param {number} resolution Resolution.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../../style/Style.js").default|Array<import("../../style/Style.js").default>} styles The style or array of styles.
     * @param {import("../../render/canvas/ReplayGroup.js").default} replayGroup Replay group.
     * @return {boolean} `true` if an image is loading.
     */
    CanvasVectorLayerRenderer.prototype.renderFeature = function renderFeature$1 (feature, resolution, pixelRatio, styles, replayGroup) {
      if (!styles) {
        return false;
      }
      var loading = false;
      if (Array.isArray(styles)) {
        for (var i = 0, ii = styles.length; i < ii; ++i) {
          loading = renderFeature(
            replayGroup, feature, styles[i],
            getSquaredTolerance(resolution, pixelRatio),
            this.handleStyleImageChange_, this) || loading;
        }
      } else {
        loading = renderFeature(
          replayGroup, feature, styles,
          getSquaredTolerance(resolution, pixelRatio),
          this.handleStyleImageChange_, this);
      }
      return loading;
    };

    return CanvasVectorLayerRenderer;
  }(CanvasLayerRenderer));


  /**
   * Determine if this renderer handles the provided layer.
   * @param {import("../../layer/Layer.js").default} layer The candidate layer.
   * @return {boolean} The renderer can render the layer.
   */
  CanvasVectorLayerRenderer['handles'] = function(layer) {
    return layer.getType() === LayerType.VECTOR;
  };


  /**
   * Create a layer renderer.
   * @param {import("../Map.js").default} mapRenderer The map renderer.
   * @param {import("../../layer/Layer.js").default} layer The layer to be rendererd.
   * @return {CanvasVectorLayerRenderer} The layer renderer.
   */
  CanvasVectorLayerRenderer['create'] = function(mapRenderer, layer) {
    return new CanvasVectorLayerRenderer(/** @type {import("../../layer/Vector.js").default} */ (layer));
  };

  /**
   * @module ol/layer/VectorTileRenderType
   */

  /**
   * @enum {string}
   * Render mode for vector tiles:
   *  * `'image'`: Vector tiles are rendered as images. Great performance, but
   *    point symbols and texts are always rotated with the view and pixels are
   *    scaled during zoom animations.
   *  * `'hybrid'`: Polygon and line elements are rendered as images, so pixels
   *    are scaled during zoom animations. Point symbols and texts are accurately
   *    rendered as vectors and can stay upright on rotated views.
   *  * `'vector'`: Vector tiles are rendered as vectors. Most accurate rendering
   *    even during animations, but slower performance than the other options.
   * @api
   */
  var VectorTileRenderType = {
    IMAGE: 'image',
    HYBRID: 'hybrid',
    VECTOR: 'vector'
  };

  /**
   * @module ol/renderer/canvas/VectorTileLayer
   */


  /**
   * @type {!Object<string, Array<import("../../render/ReplayType.js").default>>}
   */
  var IMAGE_REPLAYS = {
    'image': [ReplayType.POLYGON, ReplayType.CIRCLE,
      ReplayType.LINE_STRING, ReplayType.IMAGE, ReplayType.TEXT],
    'hybrid': [ReplayType.POLYGON, ReplayType.LINE_STRING]
  };


  /**
   * @type {!Object<string, Array<import("../../render/ReplayType.js").default>>}
   */
  var VECTOR_REPLAYS = {
    'image': [ReplayType.DEFAULT],
    'hybrid': [ReplayType.IMAGE, ReplayType.TEXT, ReplayType.DEFAULT],
    'vector': ORDER
  };


  /**
   * @classdesc
   * Canvas renderer for vector tile layers.
   * @api
   */
  var CanvasVectorTileLayerRenderer = /*@__PURE__*/(function (CanvasTileLayerRenderer) {
    function CanvasVectorTileLayerRenderer(layer) {

      CanvasTileLayerRenderer.call(this, layer, true);

      /**
       * Declutter tree.
       * @private
       */
      this.declutterTree_ = layer.getDeclutter() ? rbush_1(9, undefined) : null;

      /**
       * @private
       * @type {boolean}
       */
      this.dirty_ = false;

      /**
       * @private
       * @type {number}
       */
      this.renderedLayerRevision_;

      /**
       * @private
       * @type {import("../../transform.js").Transform}
       */
      this.tmpTransform_ = create();

      var renderMode = layer.getRenderMode();

      // Use lower resolution for pure vector rendering. Closest resolution otherwise.
      this.zDirection = renderMode === VectorTileRenderType.VECTOR ? 1 : 0;

      if (renderMode !== VectorTileRenderType.VECTOR) {
        this.context = createCanvasContext2D();
      }


      listen(labelCache, EventType.CLEAR, this.handleFontsChanged_, this);

    }

    if ( CanvasTileLayerRenderer ) CanvasVectorTileLayerRenderer.__proto__ = CanvasTileLayerRenderer;
    CanvasVectorTileLayerRenderer.prototype = Object.create( CanvasTileLayerRenderer && CanvasTileLayerRenderer.prototype );
    CanvasVectorTileLayerRenderer.prototype.constructor = CanvasVectorTileLayerRenderer;

    /**
     * @inheritDoc
     */
    CanvasVectorTileLayerRenderer.prototype.disposeInternal = function disposeInternal () {
      unlisten(labelCache, EventType.CLEAR, this.handleFontsChanged_, this);
      CanvasTileLayerRenderer.prototype.disposeInternal.call(this);
    };

    /**
     * @inheritDoc
     */
    CanvasVectorTileLayerRenderer.prototype.getTile = function getTile (z, x, y, pixelRatio, projection) {
      var tile = CanvasTileLayerRenderer.prototype.getTile.call(this, z, x, y, pixelRatio, projection);
      if (tile.getState() === TileState.LOADED) {
        this.createReplayGroup_(/** @type {import("../../VectorImageTile.js").default} */ (tile), pixelRatio, projection);
        if (this.context) {
          this.renderTileImage_(/** @type {import("../../VectorImageTile.js").default} */ (tile), pixelRatio, projection);
        }
      }
      return tile;
    };

    /**
     * @inheritDoc
     */
    CanvasVectorTileLayerRenderer.prototype.getTileImage = function getTileImage (tile) {
      var tileLayer = /** @type {import("../../layer/Tile.js").default} */ (this.getLayer());
      return /** @type {import("../../VectorImageTile.js").default} */ (tile).getImage(tileLayer);
    };

    /**
     * @inheritDoc
     */
    CanvasVectorTileLayerRenderer.prototype.prepareFrame = function prepareFrame (frameState, layerState) {
      var layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
      var layerRevision = layer.getRevision();
      if (this.renderedLayerRevision_ != layerRevision) {
        this.renderedTiles.length = 0;
      }
      this.renderedLayerRevision_ = layerRevision;
      return CanvasTileLayerRenderer.prototype.prepareFrame.call(this, frameState, layerState);
    };

    /**
     * @param {import("../../VectorImageTile.js").default} tile Tile.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../../proj/Projection.js").default} projection Projection.
     * @private
     */
    CanvasVectorTileLayerRenderer.prototype.createReplayGroup_ = function createReplayGroup_ (tile, pixelRatio, projection) {
      var this$1 = this;

      var layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
      var revision = layer.getRevision();
      var renderOrder = /** @type {import("../../render.js").OrderFunction} */ (layer.getRenderOrder()) || null;

      var replayState = tile.getReplayState(layer);
      if (!replayState.dirty && replayState.renderedRevision == revision &&
          replayState.renderedRenderOrder == renderOrder) {
        return;
      }

      var source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
      var sourceTileGrid = source.getTileGrid();
      var tileGrid = source.getTileGridForProjection(projection);
      var resolution = tileGrid.getResolution(tile.tileCoord[0]);
      var tileExtent = tile.extent;

      var loop = function ( t, tt ) {
        var sourceTile = tile.getTile(tile.tileKeys[t]);
        if (sourceTile.getState() != TileState.LOADED) {
          return;
        }

        var sourceTileCoord = sourceTile.tileCoord;
        var sourceTileExtent = sourceTileGrid.getTileCoordExtent(sourceTileCoord);
        var sharedExtent = getIntersection(tileExtent, sourceTileExtent);
        var bufferedExtent = equals$2(sourceTileExtent, sharedExtent) ? null :
          buffer(sharedExtent, layer.getRenderBuffer() * resolution, this$1.tmpExtent);
        var tileProjection = sourceTile.getProjection();
        var reproject = false;
        if (!equivalent(projection, tileProjection)) {
          reproject = true;
          sourceTile.setProjection(projection);
        }
        replayState.dirty = false;
        var replayGroup = new CanvasReplayGroup(0, sharedExtent, resolution,
          pixelRatio, source.getOverlaps(), this$1.declutterTree_, layer.getRenderBuffer());
        var squaredTolerance = getSquaredTolerance(resolution, pixelRatio);

        /**
         * @param {import("../../Feature.js").FeatureLike} feature Feature.
         * @this {CanvasVectorTileLayerRenderer}
         */
        var render = function(feature) {
          var styles;
          var styleFunction = feature.getStyleFunction() || layer.getStyleFunction();
          if (styleFunction) {
            styles = styleFunction(feature, resolution);
          }
          if (styles) {
            var dirty = this.renderFeature(feature, squaredTolerance, styles, replayGroup);
            this.dirty_ = this.dirty_ || dirty;
            replayState.dirty = replayState.dirty || dirty;
          }
        };

        var features = sourceTile.getFeatures();
        if (renderOrder && renderOrder !== replayState.renderedRenderOrder) {
          features.sort(renderOrder);
        }
        for (var i = 0, ii = features.length; i < ii; ++i) {
          var feature = features[i];
          if (reproject) {
            if (tileProjection.getUnits() == Units.TILE_PIXELS) {
              // projected tile extent
              tileProjection.setWorldExtent(sourceTileExtent);
              // tile extent in tile pixel space
              tileProjection.setExtent(sourceTile.getExtent());
            }
            feature.getGeometry().transform(tileProjection, projection);
          }
          if (!bufferedExtent || intersects(bufferedExtent, feature.getGeometry().getExtent())) {
            render.call(this$1, feature);
          }
        }
        replayGroup.finish();
        sourceTile.setReplayGroup(layer, tile.tileCoord.toString(), replayGroup);
      };

      for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) loop( t, tt );
      replayState.renderedRevision = revision;
      replayState.renderedRenderOrder = renderOrder;
    };

    /**
     * @inheritDoc
     */
    CanvasVectorTileLayerRenderer.prototype.forEachFeatureAtCoordinate = function forEachFeatureAtCoordinate (coordinate, frameState, hitTolerance, callback, thisArg) {
      var resolution = frameState.viewState.resolution;
      var rotation = frameState.viewState.rotation;
      hitTolerance = hitTolerance == undefined ? 0 : hitTolerance;
      var layer = this.getLayer();
      /** @type {!Object<string, boolean>} */
      var features = {};

      var renderedTiles = /** @type {Array<import("../../VectorImageTile.js").default>} */ (this.renderedTiles);

      var bufferedExtent, found;
      var i, ii;
      for (i = 0, ii = renderedTiles.length; i < ii; ++i) {
        var tile = renderedTiles[i];
        bufferedExtent = buffer(tile.extent, hitTolerance * resolution, bufferedExtent);
        if (!containsCoordinate(bufferedExtent, coordinate)) {
          continue;
        }
        for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
          var sourceTile = tile.getTile(tile.tileKeys[t]);
          if (sourceTile.getState() != TileState.LOADED) {
            continue;
          }
          var replayGroup = /** @type {CanvasReplayGroup} */ (sourceTile.getReplayGroup(layer,
            tile.tileCoord.toString()));
          found = found || replayGroup.forEachFeatureAtCoordinate(coordinate, resolution, rotation, hitTolerance, {},
            /**
             * @param {import("../../Feature.js").FeatureLike} feature Feature.
             * @return {?} Callback result.
             */
            function(feature) {
              var key = getUid(feature);
              if (!(key in features)) {
                features[key] = true;
                return callback.call(thisArg, feature, layer);
              }
            }, null);
        }
      }
      return found;
    };

    /**
     * @param {import("../../VectorTile.js").default} tile Tile.
     * @param {import("../../PluggableMap.js").FrameState} frameState Frame state.
     * @return {import("../../transform.js").Transform} transform Transform.
     * @private
     */
    CanvasVectorTileLayerRenderer.prototype.getReplayTransform_ = function getReplayTransform_ (tile, frameState) {
      var layer = this.getLayer();
      var source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
      var tileGrid = source.getTileGrid();
      var tileCoord = tile.tileCoord;
      var tileResolution = tileGrid.getResolution(tileCoord[0]);
      var viewState = frameState.viewState;
      var pixelRatio = frameState.pixelRatio;
      var renderResolution = viewState.resolution / pixelRatio;
      var tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent);
      var center = viewState.center;
      var origin = getTopLeft(tileExtent);
      var size = frameState.size;
      var offsetX = Math.round(pixelRatio * size[0] / 2);
      var offsetY = Math.round(pixelRatio * size[1] / 2);
      return compose(this.tmpTransform_,
        offsetX, offsetY,
        tileResolution / renderResolution, tileResolution / renderResolution,
        viewState.rotation,
        (origin[0] - center[0]) / tileResolution,
        (center[1] - origin[1]) / tileResolution);
    };

    /**
     * @param {import("../../events/Event.js").default} event Event.
     */
    CanvasVectorTileLayerRenderer.prototype.handleFontsChanged_ = function handleFontsChanged_ (event) {
      var layer = this.getLayer();
      if (layer.getVisible() && this.renderedLayerRevision_ !== undefined) {
        layer.changed();
      }
    };

    /**
     * Handle changes in image style state.
     * @param {import("../../events/Event.js").default} event Image style change event.
     * @private
     */
    CanvasVectorTileLayerRenderer.prototype.handleStyleImageChange_ = function handleStyleImageChange_ (event) {
      this.renderIfReadyAndVisible();
    };

    /**
     * @inheritDoc
     */
    CanvasVectorTileLayerRenderer.prototype.postCompose = function postCompose (context, frameState, layerState) {
      var layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
      var renderMode = layer.getRenderMode();
      if (renderMode != VectorTileRenderType.IMAGE) {
        var declutterReplays = layer.getDeclutter() ? {} : null;
        var source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
        var replayTypes = VECTOR_REPLAYS[renderMode];
        var pixelRatio = frameState.pixelRatio;
        var rotation = frameState.viewState.rotation;
        var size = frameState.size;
        var offsetX, offsetY;
        if (rotation) {
          offsetX = Math.round(pixelRatio * size[0] / 2);
          offsetY = Math.round(pixelRatio * size[1] / 2);
          rotateAtOffset(context, -rotation, offsetX, offsetY);
        }
        if (declutterReplays) {
          this.declutterTree_.clear();
        }
        var viewHints = frameState.viewHints;
        var snapToPixel = !(viewHints[ViewHint.ANIMATING] || viewHints[ViewHint.INTERACTING]);
        var tiles = this.renderedTiles;
        var tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
        var clips = [];
        var zs = [];
        for (var i = tiles.length - 1; i >= 0; --i) {
          var tile = /** @type {import("../../VectorImageTile.js").default} */ (tiles[i]);
          if (tile.getState() == TileState.ABORT) {
            continue;
          }
          var tileCoord = tile.tileCoord;
          var worldOffset = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent)[0] - tile.extent[0];
          var transform = undefined;
          for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
            var sourceTile = tile.getTile(tile.tileKeys[t]);
            if (sourceTile.getState() != TileState.LOADED) {
              continue;
            }
            var replayGroup = /** @type {CanvasReplayGroup} */ (sourceTile.getReplayGroup(layer, tileCoord.toString()));
            if (!replayGroup || !replayGroup.hasReplays(replayTypes)) {
              // sourceTile was not yet loaded when this.createReplayGroup_() was
              // called, or it has no replays of the types we want to render
              continue;
            }
            if (!transform) {
              transform = this.getTransform(frameState, worldOffset);
            }
            var currentZ = sourceTile.tileCoord[0];
            var currentClip = replayGroup.getClipCoords(transform);
            context.save();
            context.globalAlpha = layerState.opacity;
            // Create a clip mask for regions in this low resolution tile that are
            // already filled by a higher resolution tile
            for (var j = 0, jj = clips.length; j < jj; ++j) {
              var clip = clips[j];
              if (currentZ < zs[j]) {
                context.beginPath();
                // counter-clockwise (outer ring) for current tile
                context.moveTo(currentClip[0], currentClip[1]);
                context.lineTo(currentClip[2], currentClip[3]);
                context.lineTo(currentClip[4], currentClip[5]);
                context.lineTo(currentClip[6], currentClip[7]);
                // clockwise (inner ring) for higher resolution tile
                context.moveTo(clip[6], clip[7]);
                context.lineTo(clip[4], clip[5]);
                context.lineTo(clip[2], clip[3]);
                context.lineTo(clip[0], clip[1]);
                context.clip();
              }
            }
            replayGroup.replay(context, transform, rotation, {}, snapToPixel, replayTypes, declutterReplays);
            context.restore();
            clips.push(currentClip);
            zs.push(currentZ);
          }
        }
        if (declutterReplays) {
          replayDeclutter(declutterReplays, context, rotation, snapToPixel);
        }
        if (rotation) {
          rotateAtOffset(context, rotation,
            /** @type {number} */ (offsetX), /** @type {number} */ (offsetY));
        }
      }
      CanvasTileLayerRenderer.prototype.postCompose.call(this, context, frameState, layerState);
    };

    /**
     * @param {import("../../Feature.js").FeatureLike} feature Feature.
     * @param {number} squaredTolerance Squared tolerance.
     * @param {import("../../style/Style.js").default|Array<import("../../style/Style.js").default>} styles The style or array of styles.
     * @param {import("../../render/canvas/ReplayGroup.js").default} replayGroup Replay group.
     * @return {boolean} `true` if an image is loading.
     */
    CanvasVectorTileLayerRenderer.prototype.renderFeature = function renderFeature$1 (feature, squaredTolerance, styles, replayGroup) {
      if (!styles) {
        return false;
      }
      var loading = false;
      if (Array.isArray(styles)) {
        for (var i = 0, ii = styles.length; i < ii; ++i) {
          loading = renderFeature(
            replayGroup, feature, styles[i], squaredTolerance,
            this.handleStyleImageChange_, this) || loading;
        }
      } else {
        loading = renderFeature(
          replayGroup, feature, styles, squaredTolerance,
          this.handleStyleImageChange_, this);
      }
      return loading;
    };

    /**
     * @param {import("../../VectorImageTile.js").default} tile Tile.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../../proj/Projection.js").default} projection Projection.
     * @private
     */
    CanvasVectorTileLayerRenderer.prototype.renderTileImage_ = function renderTileImage_ (tile, pixelRatio, projection) {
      var layer = /** @type {import("../../layer/Vector.js").default} */ (this.getLayer());
      var replayState = tile.getReplayState(layer);
      var revision = layer.getRevision();
      var replays = IMAGE_REPLAYS[layer.getRenderMode()];
      if (replays && replayState.renderedTileRevision !== revision) {
        replayState.renderedTileRevision = revision;
        var tileCoord = tile.wrappedTileCoord;
        var z = tileCoord[0];
        var source = /** @type {import("../../source/VectorTile.js").default} */ (layer.getSource());
        var tileGrid = source.getTileGridForProjection(projection);
        var resolution = tileGrid.getResolution(z);
        var context = tile.getContext(layer);
        var size = source.getTilePixelSize(z, pixelRatio, projection);
        context.canvas.width = size[0];
        context.canvas.height = size[1];
        var tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent);
        for (var i = 0, ii = tile.tileKeys.length; i < ii; ++i) {
          var sourceTile = tile.getTile(tile.tileKeys[i]);
          if (sourceTile.getState() != TileState.LOADED) {
            continue;
          }
          var pixelScale = pixelRatio / resolution;
          var transform = reset(this.tmpTransform_);
          scale$2(transform, pixelScale, -pixelScale);
          translate$1(transform, -tileExtent[0], -tileExtent[3]);
          var replayGroup = /** @type {CanvasReplayGroup} */ (sourceTile.getReplayGroup(layer,
            tile.tileCoord.toString()));
          replayGroup.replay(context, transform, 0, {}, true, replays);
        }
      }
    };

    return CanvasVectorTileLayerRenderer;
  }(CanvasTileLayerRenderer));


  /**
   * Determine if this renderer handles the provided layer.
   * @param {import("../../layer/Layer.js").default} layer The candidate layer.
   * @return {boolean} The renderer can render the layer.
   */
  CanvasVectorTileLayerRenderer['handles'] = function(layer) {
    return layer.getType() === LayerType.VECTOR_TILE;
  };


  /**
   * Create a layer renderer.
   * @param {import("../Map.js").default} mapRenderer The map renderer.
   * @param {import("../../layer/Layer.js").default} layer The layer to be rendererd.
   * @return {CanvasVectorTileLayerRenderer} The layer renderer.
   */
  CanvasVectorTileLayerRenderer['create'] = function(mapRenderer, layer) {
    return new CanvasVectorTileLayerRenderer(/** @type {import("../../layer/VectorTile.js").default} */ (layer));
  };

  /**
   * @module ol/Map
   */

  /**
   * @classdesc
   * The map is the core component of OpenLayers. For a map to render, a view,
   * one or more layers, and a target container are needed:
   *
   *     import Map from 'ol/Map';
   *     import View from 'ol/View';
   *     import TileLayer from 'ol/layer/Tile';
   *     import OSM from 'ol/source/OSM';
   *
   *     var map = new Map({
   *       view: new View({
   *         center: [0, 0],
   *         zoom: 1
   *       }),
   *       layers: [
   *         new TileLayer({
   *           source: new OSM()
   *         })
   *       ],
   *       target: 'map'
   *     });
   *
   * The above snippet creates a map using a {@link module:ol/layer/Tile} to
   * display {@link module:ol/source/OSM~OSM} OSM data and render it to a DOM
   * element with the id `map`.
   *
   * The constructor places a viewport container (with CSS class name
   * `ol-viewport`) in the target element (see `getViewport()`), and then two
   * further elements within the viewport: one with CSS class name
   * `ol-overlaycontainer-stopevent` for controls and some overlays, and one with
   * CSS class name `ol-overlaycontainer` for other overlays (see the `stopEvent`
   * option of {@link module:ol/Overlay~Overlay} for the difference). The map
   * itself is placed in a further element within the viewport.
   *
   * Layers are stored as a {@link module:ol/Collection~Collection} in
   * layerGroups. A top-level group is provided by the library. This is what is
   * accessed by `getLayerGroup` and `setLayerGroup`. Layers entered in the
   * options are added to this group, and `addLayer` and `removeLayer` change the
   * layer collection in the group. `getLayers` is a convenience function for
   * `getLayerGroup().getLayers()`. Note that {@link module:ol/layer/Group~Group}
   * is a subclass of {@link module:ol/layer/Base}, so layers entered in the
   * options or added with `addLayer` can be groups, which can contain further
   * groups, and so on.
   *
   * @fires import("./MapBrowserEvent.js").MapBrowserEvent
   * @fires import("./MapEvent.js").MapEvent
   * @fires module:ol/render/Event~RenderEvent#postcompose
   * @fires module:ol/render/Event~RenderEvent#precompose
   * @api
   */
  var Map = /*@__PURE__*/(function (PluggableMap) {
    function Map(options) {
      options = assign({}, options);
      if (!options.controls) {
        options.controls = defaults();
      }
      if (!options.interactions) {
        options.interactions = defaults$1();
      }

      PluggableMap.call(this, options);
    }

    if ( PluggableMap ) Map.__proto__ = PluggableMap;
    Map.prototype = Object.create( PluggableMap && PluggableMap.prototype );
    Map.prototype.constructor = Map;

    Map.prototype.createRenderer = function createRenderer () {
      var renderer = new CanvasMapRenderer(this);
      renderer.registerLayerRenderers([
        CanvasImageLayerRenderer,
        CanvasTileLayerRenderer,
        CanvasVectorLayerRenderer,
        CanvasVectorTileLayerRenderer
      ]);
      return renderer;
    };

    return Map;
  }(PluggableMap));

  /**
   * @module ol/layer/TileProperty
   */

  /**
   * @enum {string}
   */
  var TileProperty = {
    PRELOAD: 'preload',
    USE_INTERIM_TILES_ON_ERROR: 'useInterimTilesOnError'
  };

  /**
   * @module ol/layer/Tile
   */


  /**
   * @typedef {Object} Options
   * @property {number} [opacity=1] Opacity (0, 1).
   * @property {boolean} [visible=true] Visibility.
   * @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
   * rendered outside of this extent.
   * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
   * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
   * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
   * method was used.
   * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
   * visible.
   * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
   * be visible.
   * @property {number} [preload=0] Preload. Load low-resolution tiles up to `preload` levels. `0`
   * means no preloading.
   * @property {import("../source/Tile.js").default} [source] Source for this layer.
   * @property {import("../PluggableMap.js").default} [map] Sets the layer as overlay on a map. The map will not manage
   * this layer in its layers collection, and the layer will be rendered on top. This is useful for
   * temporary layers. The standard way to add a layer to a map and have it managed by the map is to
   * use {@link module:ol/Map#addLayer}.
   * @property {boolean} [useInterimTilesOnError=true] Use interim tiles on error.
   */

  /**
   * @classdesc
   * For layer sources that provide pre-rendered, tiled images in grids that are
   * organized by zoom levels for specific resolutions.
   * Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
   * property on the layer object; for example, setting `title: 'My Title'` in the
   * options means that `title` is observable, and has get/set accessors.
   *
   * @api
   */
  var TileLayer = /*@__PURE__*/(function (Layer) {
    function TileLayer(opt_options) {
      var options = opt_options ? opt_options : {};

      var baseOptions = assign({}, options);

      delete baseOptions.preload;
      delete baseOptions.useInterimTilesOnError;
      Layer.call(this, baseOptions);

      this.setPreload(options.preload !== undefined ? options.preload : 0);
      this.setUseInterimTilesOnError(options.useInterimTilesOnError !== undefined ?
        options.useInterimTilesOnError : true);

      /**
      * The layer type.
      * @protected
      * @type {import("../LayerType.js").default}
      */
      this.type = LayerType.TILE;

    }

    if ( Layer ) TileLayer.__proto__ = Layer;
    TileLayer.prototype = Object.create( Layer && Layer.prototype );
    TileLayer.prototype.constructor = TileLayer;

    /**
    * Return the level as number to which we will preload tiles up to.
    * @return {number} The level to preload tiles up to.
    * @observable
    * @api
    */
    TileLayer.prototype.getPreload = function getPreload () {
      return /** @type {number} */ (this.get(TileProperty.PRELOAD));
    };

    /**
    * Set the level as number to which we will preload tiles up to.
    * @param {number} preload The level to preload tiles up to.
    * @observable
    * @api
    */
    TileLayer.prototype.setPreload = function setPreload (preload) {
      this.set(TileProperty.PRELOAD, preload);
    };

    /**
    * Whether we use interim tiles on error.
    * @return {boolean} Use interim tiles on error.
    * @observable
    * @api
    */
    TileLayer.prototype.getUseInterimTilesOnError = function getUseInterimTilesOnError () {
      return /** @type {boolean} */ (this.get(TileProperty.USE_INTERIM_TILES_ON_ERROR));
    };

    /**
    * Set whether we use interim tiles on error.
    * @param {boolean} useInterimTilesOnError Use interim tiles on error.
    * @observable
    * @api
    */
    TileLayer.prototype.setUseInterimTilesOnError = function setUseInterimTilesOnError (useInterimTilesOnError) {
      this.set(TileProperty.USE_INTERIM_TILES_ON_ERROR, useInterimTilesOnError);
    };

    return TileLayer;
  }(Layer));


  /**
   * Return the associated {@link module:ol/source/Tile tilesource} of the layer.
   * @function
   * @return {import("../source/Tile.js").default} Source.
   * @api
   */
  TileLayer.prototype.getSource;

  /**
   * @module ol/Tile
   */


  /**
   * A function that takes an {@link module:ol/Tile} for the tile and a
   * `{string}` for the url as arguments. The default is
   * ```js
   * source.setTileLoadFunction(function(tile, src) {
   *   tile.getImage().src = src;
   * });
   * ```
   * For more fine grained control, the load function can use fetch or XMLHttpRequest and involve
   * error handling:
   *
   * ```js
   * import TileState from 'ol/TileState';
   *
   * source.setTileLoadFunction(function(tile, src) {
   *   var xhr = new XMLHttpRequest();
   *   xhr.responseType = 'blob';
   *   xhr.addEventListener('loadend', function (evt) {
   *     var data = this.response;
   *     if (data !== undefined) {
   *       tile.getImage().src = URL.createObjectURL(data);
   *     } else {
   *       tile.setState(TileState.ERROR);
   *     }
   *   });
   *   xhr.addEventListener('error', function () {
   *     tile.setState(TileState.ERROR);
   *   });
   *   xhr.open('GET', src);
   *   xhr.send();
   * });
   * ```
   *
   * @typedef {function(Tile, string)} LoadFunction
   * @api
   */

  /**
   * {@link module:ol/source/Tile~Tile} sources use a function of this type to get
   * the url that provides a tile for a given tile coordinate.
   *
   * This function takes an {@link module:ol/tilecoord~TileCoord} for the tile
   * coordinate, a `{number}` representing the pixel ratio and a
   * {@link module:ol/proj/Projection} for the projection  as arguments
   * and returns a `{string}` representing the tile URL, or undefined if no tile
   * should be requested for the passed tile coordinate.
   *
   * @typedef {function(import("./tilecoord.js").TileCoord, number,
   *           import("./proj/Projection.js").default): (string|undefined)} UrlFunction
   * @api
   */


  /**
   * @typedef {Object} Options
   * @property {number} [transition=250] A duration for tile opacity
   * transitions in milliseconds. A duration of 0 disables the opacity transition.
   * @api
   */


  /**
   * @classdesc
   * Base class for tiles.
   *
   * @abstract
   */
  var Tile = /*@__PURE__*/(function (EventTarget) {
    function Tile(tileCoord, state, opt_options) {
      EventTarget.call(this);

      var options = opt_options ? opt_options : {};

      /**
       * @type {import("./tilecoord.js").TileCoord}
       */
      this.tileCoord = tileCoord;

      /**
       * @protected
       * @type {TileState}
       */
      this.state = state;

      /**
       * An "interim" tile for this tile. The interim tile may be used while this
       * one is loading, for "smooth" transitions when changing params/dimensions
       * on the source.
       * @type {Tile}
       */
      this.interimTile = null;

      /**
       * A key assigned to the tile. This is used by the tile source to determine
       * if this tile can effectively be used, or if a new tile should be created
       * and this one be used as an interim tile for this new tile.
       * @type {string}
       */
      this.key = '';

      /**
       * The duration for the opacity transition.
       * @type {number}
       */
      this.transition_ = options.transition === undefined ? 250 : options.transition;

      /**
       * Lookup of start times for rendering transitions.  If the start time is
       * equal to -1, the transition is complete.
       * @type {Object<string, number>}
       */
      this.transitionStarts_ = {};

    }

    if ( EventTarget ) Tile.__proto__ = EventTarget;
    Tile.prototype = Object.create( EventTarget && EventTarget.prototype );
    Tile.prototype.constructor = Tile;

    /**
     * @protected
     */
    Tile.prototype.changed = function changed () {
      this.dispatchEvent(EventType.CHANGE);
    };

    /**
     * @return {string} Key.
     */
    Tile.prototype.getKey = function getKey () {
      return this.key + '/' + this.tileCoord;
    };

    /**
     * Get the interim tile most suitable for rendering using the chain of interim
     * tiles. This corresponds to the  most recent tile that has been loaded, if no
     * such tile exists, the original tile is returned.
     * @return {!Tile} Best tile for rendering.
     */
    Tile.prototype.getInterimTile = function getInterimTile () {
      if (!this.interimTile) {
        //empty chain
        return this;
      }
      var tile = this.interimTile;

      // find the first loaded tile and return it. Since the chain is sorted in
      // decreasing order of creation time, there is no need to search the remainder
      // of the list (all those tiles correspond to older requests and will be
      // cleaned up by refreshInterimChain)
      do {
        if (tile.getState() == TileState.LOADED) {
          return tile;
        }
        tile = tile.interimTile;
      } while (tile);

      // we can not find a better tile
      return this;
    };

    /**
     * Goes through the chain of interim tiles and discards sections of the chain
     * that are no longer relevant.
     */
    Tile.prototype.refreshInterimChain = function refreshInterimChain () {
      if (!this.interimTile) {
        return;
      }

      var tile = this.interimTile;
      var prev = /** @type {Tile} */ (this);

      do {
        if (tile.getState() == TileState.LOADED) {
          //we have a loaded tile, we can discard the rest of the list
          //we would could abort any LOADING tile request
          //older than this tile (i.e. any LOADING tile following this entry in the chain)
          tile.interimTile = null;
          break;
        } else if (tile.getState() == TileState.LOADING) {
          //keep this LOADING tile any loaded tiles later in the chain are
          //older than this tile, so we're still interested in the request
          prev = tile;
        } else if (tile.getState() == TileState.IDLE) {
          //the head of the list is the most current tile, we don't need
          //to start any other requests for this chain
          prev.interimTile = tile.interimTile;
        } else {
          prev = tile;
        }
        tile = prev.interimTile;
      } while (tile);
    };

    /**
     * Get the tile coordinate for this tile.
     * @return {import("./tilecoord.js").TileCoord} The tile coordinate.
     * @api
     */
    Tile.prototype.getTileCoord = function getTileCoord () {
      return this.tileCoord;
    };

    /**
     * @return {TileState} State.
     */
    Tile.prototype.getState = function getState () {
      return this.state;
    };

    /**
     * Sets the state of this tile. If you write your own {@link module:ol/Tile~LoadFunction tileLoadFunction} ,
     * it is important to set the state correctly to {@link module:ol/TileState~ERROR}
     * when the tile cannot be loaded. Otherwise the tile cannot be removed from
     * the tile queue and will block other requests.
     * @param {TileState} state State.
     * @api
     */
    Tile.prototype.setState = function setState (state) {
      this.state = state;
      this.changed();
    };

    /**
     * Load the image or retry if loading previously failed.
     * Loading is taken care of by the tile queue, and calling this method is
     * only needed for preloading or for reloading in case of an error.
     * @abstract
     * @api
     */
    Tile.prototype.load = function load () {};

    /**
     * Get the alpha value for rendering.
     * @param {string} id An id for the renderer.
     * @param {number} time The render frame time.
     * @return {number} A number between 0 and 1.
     */
    Tile.prototype.getAlpha = function getAlpha (id, time) {
      if (!this.transition_) {
        return 1;
      }

      var start = this.transitionStarts_[id];
      if (!start) {
        start = time;
        this.transitionStarts_[id] = start;
      } else if (start === -1) {
        return 1;
      }

      var delta = time - start + (1000 / 60); // avoid rendering at 0
      if (delta >= this.transition_) {
        return 1;
      }
      return easeIn(delta / this.transition_);
    };

    /**
     * Determine if a tile is in an alpha transition.  A tile is considered in
     * transition if tile.getAlpha() has not yet been called or has been called
     * and returned 1.
     * @param {string} id An id for the renderer.
     * @return {boolean} The tile is in transition.
     */
    Tile.prototype.inTransition = function inTransition (id) {
      if (!this.transition_) {
        return false;
      }
      return this.transitionStarts_[id] !== -1;
    };

    /**
     * Mark a transition as complete.
     * @param {string} id An id for the renderer.
     */
    Tile.prototype.endTransition = function endTransition (id) {
      if (this.transition_) {
        this.transitionStarts_[id] = -1;
      }
    };

    return Tile;
  }(Target));

  /**
   * @module ol/ImageTile
   */


  var ImageTile = /*@__PURE__*/(function (Tile) {
    function ImageTile(tileCoord, state, src, crossOrigin, tileLoadFunction, opt_options) {

      Tile.call(this, tileCoord, state, opt_options);

      /**
       * @private
       * @type {?string}
       */
      this.crossOrigin_ = crossOrigin;

      /**
       * Image URI
       *
       * @private
       * @type {string}
       */
      this.src_ = src;

      /**
       * @private
       * @type {HTMLImageElement|HTMLCanvasElement}
       */
      this.image_ = new Image();
      if (crossOrigin !== null) {
        this.image_.crossOrigin = crossOrigin;
      }

      /**
       * @private
       * @type {Array<import("./events.js").EventsKey>}
       */
      this.imageListenerKeys_ = null;

      /**
       * @private
       * @type {import("./Tile.js").LoadFunction}
       */
      this.tileLoadFunction_ = tileLoadFunction;

    }

    if ( Tile ) ImageTile.__proto__ = Tile;
    ImageTile.prototype = Object.create( Tile && Tile.prototype );
    ImageTile.prototype.constructor = ImageTile;

    /**
     * @inheritDoc
     */
    ImageTile.prototype.disposeInternal = function disposeInternal () {
      if (this.state == TileState.LOADING) {
        this.unlistenImage_();
        this.image_ = getBlankImage();
      }
      if (this.interimTile) {
        this.interimTile.dispose();
      }
      this.state = TileState.ABORT;
      this.changed();
      Tile.prototype.disposeInternal.call(this);
    };

    /**
     * Get the HTML image element for this tile (may be a Canvas, Image, or Video).
     * @return {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} Image.
     * @api
     */
    ImageTile.prototype.getImage = function getImage () {
      return this.image_;
    };

    /**
     * @inheritDoc
     */
    ImageTile.prototype.getKey = function getKey () {
      return this.src_;
    };

    /**
     * Tracks loading or read errors.
     *
     * @private
     */
    ImageTile.prototype.handleImageError_ = function handleImageError_ () {
      this.state = TileState.ERROR;
      this.unlistenImage_();
      this.image_ = getBlankImage();
      this.changed();
    };

    /**
     * Tracks successful image load.
     *
     * @private
     */
    ImageTile.prototype.handleImageLoad_ = function handleImageLoad_ () {
      var image = /** @type {HTMLImageElement} */ (this.image_);
      if (image.naturalWidth && image.naturalHeight) {
        this.state = TileState.LOADED;
      } else {
        this.state = TileState.EMPTY;
      }
      this.unlistenImage_();
      this.changed();
    };

    /**
     * @inheritDoc
     * @api
     */
    ImageTile.prototype.load = function load () {
      if (this.state == TileState.ERROR) {
        this.state = TileState.IDLE;
        this.image_ = new Image();
        if (this.crossOrigin_ !== null) {
          this.image_.crossOrigin = this.crossOrigin_;
        }
      }
      if (this.state == TileState.IDLE) {
        this.state = TileState.LOADING;
        this.changed();
        this.imageListenerKeys_ = [
          listenOnce(this.image_, EventType.ERROR,
            this.handleImageError_, this),
          listenOnce(this.image_, EventType.LOAD,
            this.handleImageLoad_, this)
        ];
        this.tileLoadFunction_(this, this.src_);
      }
    };

    /**
     * Discards event handlers which listen for load completion or errors.
     *
     * @private
     */
    ImageTile.prototype.unlistenImage_ = function unlistenImage_ () {
      this.imageListenerKeys_.forEach(unlistenByKey);
      this.imageListenerKeys_ = null;
    };

    return ImageTile;
  }(Tile));


  /**
   * Get a 1-pixel blank image.
   * @return {HTMLCanvasElement} Blank image.
   */
  function getBlankImage() {
    var ctx = createCanvasContext2D(1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);
    return ctx.canvas;
  }

  /**
   * @module ol/tilecoord
   */


  /**
   * An array of three numbers representing the location of a tile in a tile
   * grid. The order is `z`, `x`, and `y`. `z` is the zoom level.
   * @typedef {Array<number>} TileCoord
   * @api
   */


  /**
   * @param {number} z Z.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {TileCoord=} opt_tileCoord Tile coordinate.
   * @return {TileCoord} Tile coordinate.
   */
  function createOrUpdate$2(z, x, y, opt_tileCoord) {
    if (opt_tileCoord !== undefined) {
      opt_tileCoord[0] = z;
      opt_tileCoord[1] = x;
      opt_tileCoord[2] = y;
      return opt_tileCoord;
    } else {
      return [z, x, y];
    }
  }


  /**
   * @param {number} z Z.
   * @param {number} x X.
   * @param {number} y Y.
   * @return {string} Key.
   */
  function getKeyZXY(z, x, y) {
    return z + '/' + x + '/' + y;
  }


  /**
   * Get the key for a tile coord.
   * @param {TileCoord} tileCoord The tile coord.
   * @return {string} Key.
   */
  function getKey$1(tileCoord) {
    return getKeyZXY(tileCoord[0], tileCoord[1], tileCoord[2]);
  }


  /**
   * Get a tile coord given a key.
   * @param {string} key The tile coord key.
   * @return {TileCoord} The tile coord.
   */
  function fromKey(key) {
    return key.split('/').map(Number);
  }


  /**
   * @param {TileCoord} tileCoord Tile coord.
   * @return {number} Hash.
   */
  function hash(tileCoord) {
    return (tileCoord[1] << tileCoord[0]) + tileCoord[2];
  }


  /**
   * @param {TileCoord} tileCoord Tile coordinate.
   * @param {!import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
   * @return {boolean} Tile coordinate is within extent and zoom level range.
   */
  function withinExtentAndZ(tileCoord, tileGrid) {
    var z = tileCoord[0];
    var x = tileCoord[1];
    var y = tileCoord[2];

    if (tileGrid.getMinZoom() > z || z > tileGrid.getMaxZoom()) {
      return false;
    }
    var extent = tileGrid.getExtent();
    var tileRange;
    if (!extent) {
      tileRange = tileGrid.getFullTileRange(z);
    } else {
      tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
    }
    if (!tileRange) {
      return true;
    } else {
      return tileRange.containsXY(x, y);
    }
  }

  /**
   * @module ol/TileCache
   */

  var TileCache = /*@__PURE__*/(function (LRUCache) {
    function TileCache(opt_highWaterMark) {

      LRUCache.call(this, opt_highWaterMark);

    }

    if ( LRUCache ) TileCache.__proto__ = LRUCache;
    TileCache.prototype = Object.create( LRUCache && LRUCache.prototype );
    TileCache.prototype.constructor = TileCache;

    /**
     * @param {!Object<string, import("./TileRange.js").default>} usedTiles Used tiles.
     */
    TileCache.prototype.expireCache = function expireCache (usedTiles) {
      while (this.canExpireCache()) {
        var tile = this.peekLast();
        var zKey = tile.tileCoord[0].toString();
        if (zKey in usedTiles && usedTiles[zKey].contains(tile.tileCoord)) {
          break;
        } else {
          this.pop().dispose();
        }
      }
    };

    /**
     * Prune all tiles from the cache that don't have the same z as the newest tile.
     */
    TileCache.prototype.pruneExceptNewestZ = function pruneExceptNewestZ () {
      if (this.getCount() === 0) {
        return;
      }
      var key = this.peekFirstKey();
      var tileCoord = fromKey(key);
      var z = tileCoord[0];
      this.forEach(function(tile) {
        if (tile.tileCoord[0] !== z) {
          this.remove(getKey$1(tile.tileCoord));
          tile.dispose();
        }
      }, this);
    };

    return TileCache;
  }(LRUCache));

  /**
   * @module ol/reproj
   */


  /**
   * Calculates ideal resolution to use from the source in order to achieve
   * pixel mapping as close as possible to 1:1 during reprojection.
   * The resolution is calculated regardless of what resolutions
   * are actually available in the dataset (TileGrid, Image, ...).
   *
   * @param {import("./proj/Projection.js").default} sourceProj Source projection.
   * @param {import("./proj/Projection.js").default} targetProj Target projection.
   * @param {import("./coordinate.js").Coordinate} targetCenter Target center.
   * @param {number} targetResolution Target resolution.
   * @return {number} The best resolution to use. Can be +-Infinity, NaN or 0.
   */
  function calculateSourceResolution(sourceProj, targetProj,
    targetCenter, targetResolution) {

    var sourceCenter = transform(targetCenter, targetProj, sourceProj);

    // calculate the ideal resolution of the source data
    var sourceResolution = getPointResolution(targetProj, targetResolution, targetCenter);

    var targetMetersPerUnit = targetProj.getMetersPerUnit();
    if (targetMetersPerUnit !== undefined) {
      sourceResolution *= targetMetersPerUnit;
    }
    var sourceMetersPerUnit = sourceProj.getMetersPerUnit();
    if (sourceMetersPerUnit !== undefined) {
      sourceResolution /= sourceMetersPerUnit;
    }

    // Based on the projection properties, the point resolution at the specified
    // coordinates may be slightly different. We need to reverse-compensate this
    // in order to achieve optimal results.

    var sourceExtent = sourceProj.getExtent();
    if (!sourceExtent || containsCoordinate(sourceExtent, sourceCenter)) {
      var compensationFactor = getPointResolution(sourceProj, sourceResolution, sourceCenter) /
          sourceResolution;
      if (isFinite(compensationFactor) && compensationFactor > 0) {
        sourceResolution /= compensationFactor;
      }
    }

    return sourceResolution;
  }


  /**
   * Enlarge the clipping triangle point by 1 pixel to ensure the edges overlap
   * in order to mask gaps caused by antialiasing.
   *
   * @param {number} centroidX Centroid of the triangle (x coordinate in pixels).
   * @param {number} centroidY Centroid of the triangle (y coordinate in pixels).
   * @param {number} x X coordinate of the point (in pixels).
   * @param {number} y Y coordinate of the point (in pixels).
   * @return {import("./coordinate.js").Coordinate} New point 1 px farther from the centroid.
   */
  function enlargeClipPoint(centroidX, centroidY, x, y) {
    var dX = x - centroidX;
    var dY = y - centroidY;
    var distance = Math.sqrt(dX * dX + dY * dY);
    return [Math.round(x + dX / distance), Math.round(y + dY / distance)];
  }


  /**
   * Renders the source data into new canvas based on the triangulation.
   *
   * @param {number} width Width of the canvas.
   * @param {number} height Height of the canvas.
   * @param {number} pixelRatio Pixel ratio.
   * @param {number} sourceResolution Source resolution.
   * @param {import("./extent.js").Extent} sourceExtent Extent of the data source.
   * @param {number} targetResolution Target resolution.
   * @param {import("./extent.js").Extent} targetExtent Target extent.
   * @param {import("./reproj/Triangulation.js").default} triangulation
   * Calculated triangulation.
   * @param {Array<{extent: import("./extent.js").Extent,
   *                 image: (HTMLCanvasElement|HTMLImageElement|HTMLVideoElement)}>} sources
   * Array of sources.
   * @param {number} gutter Gutter of the sources.
   * @param {boolean=} opt_renderEdges Render reprojection edges.
   * @return {HTMLCanvasElement} Canvas with reprojected data.
   */
  function render$2(width, height, pixelRatio,
    sourceResolution, sourceExtent, targetResolution, targetExtent,
    triangulation, sources, gutter, opt_renderEdges) {

    var context = createCanvasContext2D(Math.round(pixelRatio * width),
      Math.round(pixelRatio * height));

    if (sources.length === 0) {
      return context.canvas;
    }

    context.scale(pixelRatio, pixelRatio);

    var sourceDataExtent = createEmpty();
    sources.forEach(function(src, i, arr) {
      extend$1(sourceDataExtent, src.extent);
    });

    var canvasWidthInUnits = getWidth(sourceDataExtent);
    var canvasHeightInUnits = getHeight(sourceDataExtent);
    var stitchContext = createCanvasContext2D(
      Math.round(pixelRatio * canvasWidthInUnits / sourceResolution),
      Math.round(pixelRatio * canvasHeightInUnits / sourceResolution));

    var stitchScale = pixelRatio / sourceResolution;

    sources.forEach(function(src, i, arr) {
      var xPos = src.extent[0] - sourceDataExtent[0];
      var yPos = -(src.extent[3] - sourceDataExtent[3]);
      var srcWidth = getWidth(src.extent);
      var srcHeight = getHeight(src.extent);

      stitchContext.drawImage(
        src.image,
        gutter, gutter,
        src.image.width - 2 * gutter, src.image.height - 2 * gutter,
        xPos * stitchScale, yPos * stitchScale,
        srcWidth * stitchScale, srcHeight * stitchScale);
    });

    var targetTopLeft = getTopLeft(targetExtent);

    triangulation.getTriangles().forEach(function(triangle, i, arr) {
      /* Calculate affine transform (src -> dst)
       * Resulting matrix can be used to transform coordinate
       * from `sourceProjection` to destination pixels.
       *
       * To optimize number of context calls and increase numerical stability,
       * we also do the following operations:
       * trans(-topLeftExtentCorner), scale(1 / targetResolution), scale(1, -1)
       * here before solving the linear system so [ui, vi] are pixel coordinates.
       *
       * Src points: xi, yi
       * Dst points: ui, vi
       * Affine coefficients: aij
       *
       * | x0 y0 1  0  0 0 |   |a00|   |u0|
       * | x1 y1 1  0  0 0 |   |a01|   |u1|
       * | x2 y2 1  0  0 0 | x |a02| = |u2|
       * |  0  0 0 x0 y0 1 |   |a10|   |v0|
       * |  0  0 0 x1 y1 1 |   |a11|   |v1|
       * |  0  0 0 x2 y2 1 |   |a12|   |v2|
       */
      var source = triangle.source;
      var target = triangle.target;
      var x0 = source[0][0], y0 = source[0][1];
      var x1 = source[1][0], y1 = source[1][1];
      var x2 = source[2][0], y2 = source[2][1];
      var u0 = (target[0][0] - targetTopLeft[0]) / targetResolution;
      var v0 = -(target[0][1] - targetTopLeft[1]) / targetResolution;
      var u1 = (target[1][0] - targetTopLeft[0]) / targetResolution;
      var v1 = -(target[1][1] - targetTopLeft[1]) / targetResolution;
      var u2 = (target[2][0] - targetTopLeft[0]) / targetResolution;
      var v2 = -(target[2][1] - targetTopLeft[1]) / targetResolution;

      // Shift all the source points to improve numerical stability
      // of all the subsequent calculations. The [x0, y0] is used here.
      // This is also used to simplify the linear system.
      var sourceNumericalShiftX = x0;
      var sourceNumericalShiftY = y0;
      x0 = 0;
      y0 = 0;
      x1 -= sourceNumericalShiftX;
      y1 -= sourceNumericalShiftY;
      x2 -= sourceNumericalShiftX;
      y2 -= sourceNumericalShiftY;

      var augmentedMatrix = [
        [x1, y1, 0, 0, u1 - u0],
        [x2, y2, 0, 0, u2 - u0],
        [0, 0, x1, y1, v1 - v0],
        [0, 0, x2, y2, v2 - v0]
      ];
      var affineCoefs = solveLinearSystem(augmentedMatrix);
      if (!affineCoefs) {
        return;
      }

      context.save();
      context.beginPath();
      var centroidX = (u0 + u1 + u2) / 3;
      var centroidY = (v0 + v1 + v2) / 3;
      var p0 = enlargeClipPoint(centroidX, centroidY, u0, v0);
      var p1 = enlargeClipPoint(centroidX, centroidY, u1, v1);
      var p2 = enlargeClipPoint(centroidX, centroidY, u2, v2);

      context.moveTo(p1[0], p1[1]);
      context.lineTo(p0[0], p0[1]);
      context.lineTo(p2[0], p2[1]);
      context.clip();

      context.transform(
        affineCoefs[0], affineCoefs[2], affineCoefs[1], affineCoefs[3], u0, v0);

      context.translate(sourceDataExtent[0] - sourceNumericalShiftX,
        sourceDataExtent[3] - sourceNumericalShiftY);

      context.scale(sourceResolution / pixelRatio,
        -sourceResolution / pixelRatio);

      context.drawImage(stitchContext.canvas, 0, 0);
      context.restore();
    });

    if (opt_renderEdges) {
      context.save();

      context.strokeStyle = 'black';
      context.lineWidth = 1;

      triangulation.getTriangles().forEach(function(triangle, i, arr) {
        var target = triangle.target;
        var u0 = (target[0][0] - targetTopLeft[0]) / targetResolution;
        var v0 = -(target[0][1] - targetTopLeft[1]) / targetResolution;
        var u1 = (target[1][0] - targetTopLeft[0]) / targetResolution;
        var v1 = -(target[1][1] - targetTopLeft[1]) / targetResolution;
        var u2 = (target[2][0] - targetTopLeft[0]) / targetResolution;
        var v2 = -(target[2][1] - targetTopLeft[1]) / targetResolution;

        context.beginPath();
        context.moveTo(u1, v1);
        context.lineTo(u0, v0);
        context.lineTo(u2, v2);
        context.closePath();
        context.stroke();
      });

      context.restore();
    }
    return context.canvas;
  }

  /**
   * @module ol/reproj/Triangulation
   */


  /**
   * Single triangle; consists of 3 source points and 3 target points.
   * @typedef {Object} Triangle
   * @property {Array<import("../coordinate.js").Coordinate>} source
   * @property {Array<import("../coordinate.js").Coordinate>} target
   */


  /**
   * Maximum number of subdivision steps during raster reprojection triangulation.
   * Prevents high memory usage and large number of proj4 calls (for certain
   * transformations and areas). At most `2*(2^this)` triangles are created for
   * each triangulated extent (tile/image).
   * @type {number}
   */
  var MAX_SUBDIVISION = 10;


  /**
   * Maximum allowed size of triangle relative to world width. When transforming
   * corners of world extent between certain projections, the resulting
   * triangulation seems to have zero error and no subdivision is performed. If
   * the triangle width is more than this (relative to world width; 0-1),
   * subdivison is forced (up to `MAX_SUBDIVISION`). Default is `0.25`.
   * @type {number}
   */
  var MAX_TRIANGLE_WIDTH = 0.25;


  /**
   * @classdesc
   * Class containing triangulation of the given target extent.
   * Used for determining source data and the reprojection itself.
   */
  var Triangulation = function Triangulation(sourceProj, targetProj, targetExtent, maxSourceExtent, errorThreshold) {

    /**
     * @type {import("../proj/Projection.js").default}
     * @private
     */
    this.sourceProj_ = sourceProj;

    /**
     * @type {import("../proj/Projection.js").default}
     * @private
     */
    this.targetProj_ = targetProj;

    /** @type {!Object<string, import("../coordinate.js").Coordinate>} */
    var transformInvCache = {};
    var transformInv = getTransform(this.targetProj_, this.sourceProj_);

    /**
     * @param {import("../coordinate.js").Coordinate} c A coordinate.
     * @return {import("../coordinate.js").Coordinate} Transformed coordinate.
     * @private
     */
    this.transformInv_ = function(c) {
      var key = c[0] + '/' + c[1];
      if (!transformInvCache[key]) {
        transformInvCache[key] = transformInv(c);
      }
      return transformInvCache[key];
    };

    /**
     * @type {import("../extent.js").Extent}
     * @private
     */
    this.maxSourceExtent_ = maxSourceExtent;

    /**
     * @type {number}
     * @private
     */
    this.errorThresholdSquared_ = errorThreshold * errorThreshold;

    /**
     * @type {Array<Triangle>}
     * @private
     */
    this.triangles_ = [];

    /**
     * Indicates that the triangulation crosses edge of the source projection.
     * @type {boolean}
     * @private
     */
    this.wrapsXInSource_ = false;

    /**
     * @type {boolean}
     * @private
     */
    this.canWrapXInSource_ = this.sourceProj_.canWrapX() &&
        !!maxSourceExtent &&
        !!this.sourceProj_.getExtent() &&
        (getWidth(maxSourceExtent) == getWidth(this.sourceProj_.getExtent()));

    /**
     * @type {?number}
     * @private
     */
    this.sourceWorldWidth_ = this.sourceProj_.getExtent() ?
      getWidth(this.sourceProj_.getExtent()) : null;

    /**
     * @type {?number}
     * @private
     */
    this.targetWorldWidth_ = this.targetProj_.getExtent() ?
      getWidth(this.targetProj_.getExtent()) : null;

    var destinationTopLeft = getTopLeft(targetExtent);
    var destinationTopRight = getTopRight(targetExtent);
    var destinationBottomRight = getBottomRight(targetExtent);
    var destinationBottomLeft = getBottomLeft(targetExtent);
    var sourceTopLeft = this.transformInv_(destinationTopLeft);
    var sourceTopRight = this.transformInv_(destinationTopRight);
    var sourceBottomRight = this.transformInv_(destinationBottomRight);
    var sourceBottomLeft = this.transformInv_(destinationBottomLeft);

    this.addQuad_(
      destinationTopLeft, destinationTopRight,
      destinationBottomRight, destinationBottomLeft,
      sourceTopLeft, sourceTopRight, sourceBottomRight, sourceBottomLeft,
      MAX_SUBDIVISION);

    if (this.wrapsXInSource_) {
      var leftBound = Infinity;
      this.triangles_.forEach(function(triangle, i, arr) {
        leftBound = Math.min(leftBound,
          triangle.source[0][0], triangle.source[1][0], triangle.source[2][0]);
      });

      // Shift triangles to be as close to `leftBound` as possible
      // (if the distance is more than `worldWidth / 2` it can be closer.
      this.triangles_.forEach(function(triangle) {
        if (Math.max(triangle.source[0][0], triangle.source[1][0],
          triangle.source[2][0]) - leftBound > this.sourceWorldWidth_ / 2) {
          var newTriangle = [[triangle.source[0][0], triangle.source[0][1]],
            [triangle.source[1][0], triangle.source[1][1]],
            [triangle.source[2][0], triangle.source[2][1]]];
          if ((newTriangle[0][0] - leftBound) > this.sourceWorldWidth_ / 2) {
            newTriangle[0][0] -= this.sourceWorldWidth_;
          }
          if ((newTriangle[1][0] - leftBound) > this.sourceWorldWidth_ / 2) {
            newTriangle[1][0] -= this.sourceWorldWidth_;
          }
          if ((newTriangle[2][0] - leftBound) > this.sourceWorldWidth_ / 2) {
            newTriangle[2][0] -= this.sourceWorldWidth_;
          }

          // Rarely (if the extent contains both the dateline and prime meridian)
          // the shift can in turn break some triangles.
          // Detect this here and don't shift in such cases.
          var minX = Math.min(
            newTriangle[0][0], newTriangle[1][0], newTriangle[2][0]);
          var maxX = Math.max(
            newTriangle[0][0], newTriangle[1][0], newTriangle[2][0]);
          if ((maxX - minX) < this.sourceWorldWidth_ / 2) {
            triangle.source = newTriangle;
          }
        }
      }.bind(this));
    }

    transformInvCache = {};
  };

  /**
   * Adds triangle to the triangulation.
   * @param {import("../coordinate.js").Coordinate} a The target a coordinate.
   * @param {import("../coordinate.js").Coordinate} b The target b coordinate.
   * @param {import("../coordinate.js").Coordinate} c The target c coordinate.
   * @param {import("../coordinate.js").Coordinate} aSrc The source a coordinate.
   * @param {import("../coordinate.js").Coordinate} bSrc The source b coordinate.
   * @param {import("../coordinate.js").Coordinate} cSrc The source c coordinate.
   * @private
   */
  Triangulation.prototype.addTriangle_ = function addTriangle_ (a, b, c, aSrc, bSrc, cSrc) {
    this.triangles_.push({
      source: [aSrc, bSrc, cSrc],
      target: [a, b, c]
    });
  };

  /**
   * Adds quad (points in clock-wise order) to the triangulation
   * (and reprojects the vertices) if valid.
   * Performs quad subdivision if needed to increase precision.
   *
   * @param {import("../coordinate.js").Coordinate} a The target a coordinate.
   * @param {import("../coordinate.js").Coordinate} b The target b coordinate.
   * @param {import("../coordinate.js").Coordinate} c The target c coordinate.
   * @param {import("../coordinate.js").Coordinate} d The target d coordinate.
   * @param {import("../coordinate.js").Coordinate} aSrc The source a coordinate.
   * @param {import("../coordinate.js").Coordinate} bSrc The source b coordinate.
   * @param {import("../coordinate.js").Coordinate} cSrc The source c coordinate.
   * @param {import("../coordinate.js").Coordinate} dSrc The source d coordinate.
   * @param {number} maxSubdivision Maximal allowed subdivision of the quad.
   * @private
   */
  Triangulation.prototype.addQuad_ = function addQuad_ (a, b, c, d, aSrc, bSrc, cSrc, dSrc, maxSubdivision) {

    var sourceQuadExtent = boundingExtent([aSrc, bSrc, cSrc, dSrc]);
    var sourceCoverageX = this.sourceWorldWidth_ ?
      getWidth(sourceQuadExtent) / this.sourceWorldWidth_ : null;
    var sourceWorldWidth = /** @type {number} */ (this.sourceWorldWidth_);

    // when the quad is wrapped in the source projection
    // it covers most of the projection extent, but not fully
    var wrapsX = this.sourceProj_.canWrapX() &&
                 sourceCoverageX > 0.5 && sourceCoverageX < 1;

    var needsSubdivision = false;

    if (maxSubdivision > 0) {
      if (this.targetProj_.isGlobal() && this.targetWorldWidth_) {
        var targetQuadExtent = boundingExtent([a, b, c, d]);
        var targetCoverageX = getWidth(targetQuadExtent) / this.targetWorldWidth_;
        needsSubdivision = targetCoverageX > MAX_TRIANGLE_WIDTH ||
          needsSubdivision;
      }
      if (!wrapsX && this.sourceProj_.isGlobal() && sourceCoverageX) {
        needsSubdivision = sourceCoverageX > MAX_TRIANGLE_WIDTH ||
            needsSubdivision;
      }
    }

    if (!needsSubdivision && this.maxSourceExtent_) {
      if (!intersects(sourceQuadExtent, this.maxSourceExtent_)) {
        // whole quad outside source projection extent -> ignore
        return;
      }
    }

    if (!needsSubdivision) {
      if (!isFinite(aSrc[0]) || !isFinite(aSrc[1]) ||
          !isFinite(bSrc[0]) || !isFinite(bSrc[1]) ||
          !isFinite(cSrc[0]) || !isFinite(cSrc[1]) ||
          !isFinite(dSrc[0]) || !isFinite(dSrc[1])) {
        if (maxSubdivision > 0) {
          needsSubdivision = true;
        } else {
          return;
        }
      }
    }

    if (maxSubdivision > 0) {
      if (!needsSubdivision) {
        var center = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        var centerSrc = this.transformInv_(center);

        var dx;
        if (wrapsX) {
          var centerSrcEstimX =
              (modulo(aSrc[0], sourceWorldWidth) +
               modulo(cSrc[0], sourceWorldWidth)) / 2;
          dx = centerSrcEstimX -
              modulo(centerSrc[0], sourceWorldWidth);
        } else {
          dx = (aSrc[0] + cSrc[0]) / 2 - centerSrc[0];
        }
        var dy = (aSrc[1] + cSrc[1]) / 2 - centerSrc[1];
        var centerSrcErrorSquared = dx * dx + dy * dy;
        needsSubdivision = centerSrcErrorSquared > this.errorThresholdSquared_;
      }
      if (needsSubdivision) {
        if (Math.abs(a[0] - c[0]) <= Math.abs(a[1] - c[1])) {
          // split horizontally (top & bottom)
          var bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
          var bcSrc = this.transformInv_(bc);
          var da = [(d[0] + a[0]) / 2, (d[1] + a[1]) / 2];
          var daSrc = this.transformInv_(da);

          this.addQuad_(
            a, b, bc, da, aSrc, bSrc, bcSrc, daSrc, maxSubdivision - 1);
          this.addQuad_(
            da, bc, c, d, daSrc, bcSrc, cSrc, dSrc, maxSubdivision - 1);
        } else {
          // split vertically (left & right)
          var ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          var abSrc = this.transformInv_(ab);
          var cd = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2];
          var cdSrc = this.transformInv_(cd);

          this.addQuad_(
            a, ab, cd, d, aSrc, abSrc, cdSrc, dSrc, maxSubdivision - 1);
          this.addQuad_(
            ab, b, c, cd, abSrc, bSrc, cSrc, cdSrc, maxSubdivision - 1);
        }
        return;
      }
    }

    if (wrapsX) {
      if (!this.canWrapXInSource_) {
        return;
      }
      this.wrapsXInSource_ = true;
    }

    this.addTriangle_(a, c, d, aSrc, cSrc, dSrc);
    this.addTriangle_(a, b, c, aSrc, bSrc, cSrc);
  };

  /**
   * Calculates extent of the 'source' coordinates from all the triangles.
   *
   * @return {import("../extent.js").Extent} Calculated extent.
   */
  Triangulation.prototype.calculateSourceExtent = function calculateSourceExtent () {
    var extent = createEmpty();

    this.triangles_.forEach(function(triangle, i, arr) {
      var src = triangle.source;
      extendCoordinate(extent, src[0]);
      extendCoordinate(extent, src[1]);
      extendCoordinate(extent, src[2]);
    });

    return extent;
  };

  /**
   * @return {Array<Triangle>} Array of the calculated triangles.
   */
  Triangulation.prototype.getTriangles = function getTriangles () {
    return this.triangles_;
  };

  /**
   * @module ol/reproj/Tile
   */


  /**
   * @typedef {function(number, number, number, number) : import("../Tile.js").default} FunctionType
   */


  /**
   * @classdesc
   * Class encapsulating single reprojected tile.
   * See {@link module:ol/source/TileImage~TileImage}.
   *
   */
  var ReprojTile = /*@__PURE__*/(function (Tile) {
    function ReprojTile(
      sourceProj,
      sourceTileGrid,
      targetProj,
      targetTileGrid,
      tileCoord,
      wrappedTileCoord,
      pixelRatio,
      gutter,
      getTileFunction,
      opt_errorThreshold,
      opt_renderEdges
    ) {
      Tile.call(this, tileCoord, TileState.IDLE);

      /**
       * @private
       * @type {boolean}
       */
      this.renderEdges_ = opt_renderEdges !== undefined ? opt_renderEdges : false;

      /**
       * @private
       * @type {number}
       */
      this.pixelRatio_ = pixelRatio;

      /**
       * @private
       * @type {number}
       */
      this.gutter_ = gutter;

      /**
       * @private
       * @type {HTMLCanvasElement}
       */
      this.canvas_ = null;

      /**
       * @private
       * @type {import("../tilegrid/TileGrid.js").default}
       */
      this.sourceTileGrid_ = sourceTileGrid;

      /**
       * @private
       * @type {import("../tilegrid/TileGrid.js").default}
       */
      this.targetTileGrid_ = targetTileGrid;

      /**
       * @private
       * @type {import("../tilecoord.js").TileCoord}
       */
      this.wrappedTileCoord_ = wrappedTileCoord ? wrappedTileCoord : tileCoord;

      /**
       * @private
       * @type {!Array<import("../Tile.js").default>}
       */
      this.sourceTiles_ = [];

      /**
       * @private
       * @type {Array<import("../events.js").EventsKey>}
       */
      this.sourcesListenerKeys_ = null;

      /**
       * @private
       * @type {number}
       */
      this.sourceZ_ = 0;

      var targetExtent = targetTileGrid.getTileCoordExtent(this.wrappedTileCoord_);
      var maxTargetExtent = this.targetTileGrid_.getExtent();
      var maxSourceExtent = this.sourceTileGrid_.getExtent();

      var limitedTargetExtent = maxTargetExtent ?
        getIntersection(targetExtent, maxTargetExtent) : targetExtent;

      if (getArea(limitedTargetExtent) === 0) {
        // Tile is completely outside range -> EMPTY
        // TODO: is it actually correct that the source even creates the tile ?
        this.state = TileState.EMPTY;
        return;
      }

      var sourceProjExtent = sourceProj.getExtent();
      if (sourceProjExtent) {
        if (!maxSourceExtent) {
          maxSourceExtent = sourceProjExtent;
        } else {
          maxSourceExtent = getIntersection(maxSourceExtent, sourceProjExtent);
        }
      }

      var targetResolution = targetTileGrid.getResolution(
        this.wrappedTileCoord_[0]);

      var targetCenter = getCenter(limitedTargetExtent);
      var sourceResolution = calculateSourceResolution(
        sourceProj, targetProj, targetCenter, targetResolution);

      if (!isFinite(sourceResolution) || sourceResolution <= 0) {
        // invalid sourceResolution -> EMPTY
        // probably edges of the projections when no extent is defined
        this.state = TileState.EMPTY;
        return;
      }

      var errorThresholdInPixels = opt_errorThreshold !== undefined ?
        opt_errorThreshold : ERROR_THRESHOLD;

      /**
       * @private
       * @type {!import("./Triangulation.js").default}
       */
      this.triangulation_ = new Triangulation(
        sourceProj, targetProj, limitedTargetExtent, maxSourceExtent,
        sourceResolution * errorThresholdInPixels);

      if (this.triangulation_.getTriangles().length === 0) {
        // no valid triangles -> EMPTY
        this.state = TileState.EMPTY;
        return;
      }

      this.sourceZ_ = sourceTileGrid.getZForResolution(sourceResolution);
      var sourceExtent = this.triangulation_.calculateSourceExtent();

      if (maxSourceExtent) {
        if (sourceProj.canWrapX()) {
          sourceExtent[1] = clamp(
            sourceExtent[1], maxSourceExtent[1], maxSourceExtent[3]);
          sourceExtent[3] = clamp(
            sourceExtent[3], maxSourceExtent[1], maxSourceExtent[3]);
        } else {
          sourceExtent = getIntersection(sourceExtent, maxSourceExtent);
        }
      }

      if (!getArea(sourceExtent)) {
        this.state = TileState.EMPTY;
      } else {
        var sourceRange = sourceTileGrid.getTileRangeForExtentAndZ(
          sourceExtent, this.sourceZ_);

        for (var srcX = sourceRange.minX; srcX <= sourceRange.maxX; srcX++) {
          for (var srcY = sourceRange.minY; srcY <= sourceRange.maxY; srcY++) {
            var tile = getTileFunction(this.sourceZ_, srcX, srcY, pixelRatio);
            if (tile) {
              this.sourceTiles_.push(tile);
            }
          }
        }

        if (this.sourceTiles_.length === 0) {
          this.state = TileState.EMPTY;
        }
      }
    }

    if ( Tile ) ReprojTile.__proto__ = Tile;
    ReprojTile.prototype = Object.create( Tile && Tile.prototype );
    ReprojTile.prototype.constructor = ReprojTile;

    /**
     * @inheritDoc
     */
    ReprojTile.prototype.disposeInternal = function disposeInternal () {
      if (this.state == TileState.LOADING) {
        this.unlistenSources_();
      }
      Tile.prototype.disposeInternal.call(this);
    };

    /**
     * Get the HTML Canvas element for this tile.
     * @return {HTMLCanvasElement} Canvas.
     */
    ReprojTile.prototype.getImage = function getImage () {
      return this.canvas_;
    };

    /**
     * @private
     */
    ReprojTile.prototype.reproject_ = function reproject_ () {
      var sources = [];
      this.sourceTiles_.forEach(function(tile, i, arr) {
        if (tile && tile.getState() == TileState.LOADED) {
          sources.push({
            extent: this.sourceTileGrid_.getTileCoordExtent(tile.tileCoord),
            image: tile.getImage()
          });
        }
      }.bind(this));
      this.sourceTiles_.length = 0;

      if (sources.length === 0) {
        this.state = TileState.ERROR;
      } else {
        var z = this.wrappedTileCoord_[0];
        var size = this.targetTileGrid_.getTileSize(z);
        var width = typeof size === 'number' ? size : size[0];
        var height = typeof size === 'number' ? size : size[1];
        var targetResolution = this.targetTileGrid_.getResolution(z);
        var sourceResolution = this.sourceTileGrid_.getResolution(this.sourceZ_);

        var targetExtent = this.targetTileGrid_.getTileCoordExtent(
          this.wrappedTileCoord_);
        this.canvas_ = render$2(width, height, this.pixelRatio_,
          sourceResolution, this.sourceTileGrid_.getExtent(),
          targetResolution, targetExtent, this.triangulation_, sources,
          this.gutter_, this.renderEdges_);

        this.state = TileState.LOADED;
      }
      this.changed();
    };

    /**
     * @inheritDoc
     */
    ReprojTile.prototype.load = function load () {
      if (this.state == TileState.IDLE) {
        this.state = TileState.LOADING;
        this.changed();

        var leftToLoad = 0;

        this.sourcesListenerKeys_ = [];
        this.sourceTiles_.forEach(function(tile, i, arr) {
          var state = tile.getState();
          if (state == TileState.IDLE || state == TileState.LOADING) {
            leftToLoad++;

            var sourceListenKey = listen(tile, EventType.CHANGE,
              function(e) {
                var state = tile.getState();
                if (state == TileState.LOADED ||
                      state == TileState.ERROR ||
                      state == TileState.EMPTY) {
                  unlistenByKey(sourceListenKey);
                  leftToLoad--;
                  if (leftToLoad === 0) {
                    this.unlistenSources_();
                    this.reproject_();
                  }
                }
              }, this);
            this.sourcesListenerKeys_.push(sourceListenKey);
          }
        }.bind(this));

        this.sourceTiles_.forEach(function(tile, i, arr) {
          var state = tile.getState();
          if (state == TileState.IDLE) {
            tile.load();
          }
        });

        if (leftToLoad === 0) {
          setTimeout(this.reproject_.bind(this), 0);
        }
      }
    };

    /**
     * @private
     */
    ReprojTile.prototype.unlistenSources_ = function unlistenSources_ () {
      this.sourcesListenerKeys_.forEach(unlistenByKey);
      this.sourcesListenerKeys_ = null;
    };

    return ReprojTile;
  }(Tile));

  /**
   * @module ol/tileurlfunction
   */


  /**
   * @param {string} template Template.
   * @param {import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
   * @return {import("./Tile.js").UrlFunction} Tile URL function.
   */
  function createFromTemplate(template, tileGrid) {
    var zRegEx = /\{z\}/g;
    var xRegEx = /\{x\}/g;
    var yRegEx = /\{y\}/g;
    var dashYRegEx = /\{-y\}/g;
    return (
      /**
       * @param {import("./tilecoord.js").TileCoord} tileCoord Tile Coordinate.
       * @param {number} pixelRatio Pixel ratio.
       * @param {import("./proj/Projection.js").default} projection Projection.
       * @return {string|undefined} Tile URL.
       */
      function(tileCoord, pixelRatio, projection) {
        if (!tileCoord) {
          return undefined;
        } else {
          return template.replace(zRegEx, tileCoord[0].toString())
            .replace(xRegEx, tileCoord[1].toString())
            .replace(yRegEx, function() {
              var y = -tileCoord[2] - 1;
              return y.toString();
            })
            .replace(dashYRegEx, function() {
              var z = tileCoord[0];
              var range = tileGrid.getFullTileRange(z);
              assert(range, 55); // The {-y} placeholder requires a tile grid with extent
              var y = range.getHeight() + tileCoord[2];
              return y.toString();
            });
        }
      }
    );
  }


  /**
   * @param {Array<string>} templates Templates.
   * @param {import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
   * @return {import("./Tile.js").UrlFunction} Tile URL function.
   */
  function createFromTemplates(templates, tileGrid) {
    var len = templates.length;
    var tileUrlFunctions = new Array(len);
    for (var i = 0; i < len; ++i) {
      tileUrlFunctions[i] = createFromTemplate(templates[i], tileGrid);
    }
    return createFromTileUrlFunctions(tileUrlFunctions);
  }


  /**
   * @param {Array<import("./Tile.js").UrlFunction>} tileUrlFunctions Tile URL Functions.
   * @return {import("./Tile.js").UrlFunction} Tile URL function.
   */
  function createFromTileUrlFunctions(tileUrlFunctions) {
    if (tileUrlFunctions.length === 1) {
      return tileUrlFunctions[0];
    }
    return (
      /**
       * @param {import("./tilecoord.js").TileCoord} tileCoord Tile Coordinate.
       * @param {number} pixelRatio Pixel ratio.
       * @param {import("./proj/Projection.js").default} projection Projection.
       * @return {string|undefined} Tile URL.
       */
      function(tileCoord, pixelRatio, projection) {
        if (!tileCoord) {
          return undefined;
        } else {
          var h = hash(tileCoord);
          var index = modulo(h, tileUrlFunctions.length);
          return tileUrlFunctions[index](tileCoord, pixelRatio, projection);
        }
      }
    );
  }


  /**
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {number} pixelRatio Pixel ratio.
   * @param {import("./proj/Projection.js").default} projection Projection.
   * @return {string|undefined} Tile URL.
   */
  function nullTileUrlFunction(tileCoord, pixelRatio, projection) {
    return undefined;
  }


  /**
   * @param {string} url URL.
   * @return {Array<string>} Array of urls.
   */
  function expandUrl(url) {
    var urls = [];
    var match = /\{([a-z])-([a-z])\}/.exec(url);
    if (match) {
      // char range
      var startCharCode = match[1].charCodeAt(0);
      var stopCharCode = match[2].charCodeAt(0);
      var charCode;
      for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
        urls.push(url.replace(match[0], String.fromCharCode(charCode)));
      }
      return urls;
    }
    match = match = /\{(\d+)-(\d+)\}/.exec(url);
    if (match) {
      // number range
      var stop = parseInt(match[2], 10);
      for (var i = parseInt(match[1], 10); i <= stop; i++) {
        urls.push(url.replace(match[0], i.toString()));
      }
      return urls;
    }
    urls.push(url);
    return urls;
  }

  /**
   * @module ol/tilegrid/TileGrid
   */


  /**
   * @private
   * @type {import("../tilecoord.js").TileCoord}
   */
  var tmpTileCoord = [0, 0, 0];


  /**
   * @typedef {Object} Options
   * @property {import("../extent.js").Extent} [extent] Extent for the tile grid. No tiles outside this
   * extent will be requested by {@link module:ol/source/Tile} sources. When no `origin` or
   * `origins` are configured, the `origin` will be set to the top-left corner of the extent.
   * @property {number} [minZoom=0] Minimum zoom.
   * @property {import("../coordinate.js").Coordinate} [origin] The tile grid origin, i.e. where the `x`
   * and `y` axes meet (`[z, 0, 0]`). Tile coordinates increase left to right and upwards. If not
   * specified, `extent` or `origins` must be provided.
   * @property {Array<import("../coordinate.js").Coordinate>} [origins] Tile grid origins, i.e. where
   * the `x` and `y` axes meet (`[z, 0, 0]`), for each zoom level. If given, the array length
   * should match the length of the `resolutions` array, i.e. each resolution can have a different
   * origin. Tile coordinates increase left to right and upwards. If not specified, `extent` or
   * `origin` must be provided.
   * @property {!Array<number>} resolutions Resolutions. The array index of each resolution needs
   * to match the zoom level. This means that even if a `minZoom` is configured, the resolutions
   * array will have a length of `maxZoom + 1`.
   * @property {Array<import("../size.js").Size>} [sizes] Sizes.
   * @property {number|import("../size.js").Size} [tileSize] Tile size.
   * Default is `[256, 256]`.
   * @property {Array<import("../size.js").Size>} [tileSizes] Tile sizes. If given, the array length
   * should match the length of the `resolutions` array, i.e. each resolution can have a different
   * tile size.
   */


  /**
   * @classdesc
   * Base class for setting the grid pattern for sources accessing tiled-image
   * servers.
   * @api
   */
  var TileGrid = function TileGrid(options) {

    /**
     * @protected
     * @type {number}
     */
    this.minZoom = options.minZoom !== undefined ? options.minZoom : 0;

    /**
     * @private
     * @type {!Array<number>}
     */
    this.resolutions_ = options.resolutions;
    assert(isSorted(this.resolutions_, function(a, b) {
      return b - a;
    }, true), 17); // `resolutions` must be sorted in descending order


    // check if we've got a consistent zoom factor and origin
    var zoomFactor;
    if (!options.origins) {
      for (var i = 0, ii = this.resolutions_.length - 1; i < ii; ++i) {
        if (!zoomFactor) {
          zoomFactor = this.resolutions_[i] / this.resolutions_[i + 1];
        } else {
          if (this.resolutions_[i] / this.resolutions_[i + 1] !== zoomFactor) {
            zoomFactor = undefined;
            break;
          }
        }
      }
    }


    /**
     * @private
     * @type {number|undefined}
     */
    this.zoomFactor_ = zoomFactor;


    /**
     * @protected
     * @type {number}
     */
    this.maxZoom = this.resolutions_.length - 1;

    /**
     * @private
     * @type {import("../coordinate.js").Coordinate}
     */
    this.origin_ = options.origin !== undefined ? options.origin : null;

    /**
     * @private
     * @type {Array<import("../coordinate.js").Coordinate>}
     */
    this.origins_ = null;
    if (options.origins !== undefined) {
      this.origins_ = options.origins;
      assert(this.origins_.length == this.resolutions_.length,
        20); // Number of `origins` and `resolutions` must be equal
    }

    var extent = options.extent;

    if (extent !== undefined &&
        !this.origin_ && !this.origins_) {
      this.origin_ = getTopLeft(extent);
    }

    assert(
      (!this.origin_ && this.origins_) || (this.origin_ && !this.origins_),
      18); // Either `origin` or `origins` must be configured, never both

    /**
     * @private
     * @type {Array<number|import("../size.js").Size>}
     */
    this.tileSizes_ = null;
    if (options.tileSizes !== undefined) {
      this.tileSizes_ = options.tileSizes;
      assert(this.tileSizes_.length == this.resolutions_.length,
        19); // Number of `tileSizes` and `resolutions` must be equal
    }

    /**
     * @private
     * @type {number|import("../size.js").Size}
     */
    this.tileSize_ = options.tileSize !== undefined ?
      options.tileSize :
      !this.tileSizes_ ? DEFAULT_TILE_SIZE : null;
    assert(
      (!this.tileSize_ && this.tileSizes_) ||
        (this.tileSize_ && !this.tileSizes_),
      22); // Either `tileSize` or `tileSizes` must be configured, never both

    /**
     * @private
     * @type {import("../extent.js").Extent}
     */
    this.extent_ = extent !== undefined ? extent : null;


    /**
     * @private
     * @type {Array<import("../TileRange.js").default>}
     */
    this.fullTileRanges_ = null;

    /**
     * @private
     * @type {import("../size.js").Size}
     */
    this.tmpSize_ = [0, 0];

    if (options.sizes !== undefined) {
      this.fullTileRanges_ = options.sizes.map(function(size, z) {
        var tileRange = new TileRange(
          Math.min(0, size[0]), Math.max(size[0] - 1, -1),
          Math.min(0, size[1]), Math.max(size[1] - 1, -1));
        return tileRange;
      }, this);
    } else if (extent) {
      this.calculateTileRanges_(extent);
    }

  };

  /**
   * Call a function with each tile coordinate for a given extent and zoom level.
   *
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} zoom Integer zoom level.
   * @param {function(import("../tilecoord.js").TileCoord)} callback Function called with each tile coordinate.
   * @api
   */
  TileGrid.prototype.forEachTileCoord = function forEachTileCoord (extent, zoom, callback) {
    var tileRange = this.getTileRangeForExtentAndZ(extent, zoom);
    for (var i = tileRange.minX, ii = tileRange.maxX; i <= ii; ++i) {
      for (var j = tileRange.minY, jj = tileRange.maxY; j <= jj; ++j) {
        callback([zoom, i, j]);
      }
    }
  };

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {function(this: T, number, import("../TileRange.js").default): boolean} callback Callback.
   * @param {T=} opt_this The object to use as `this` in `callback`.
   * @param {import("../TileRange.js").default=} opt_tileRange Temporary import("../TileRange.js").default object.
   * @param {import("../extent.js").Extent=} opt_extent Temporary import("../extent.js").Extent object.
   * @return {boolean} Callback succeeded.
   * @template T
   */
  TileGrid.prototype.forEachTileCoordParentTileRange = function forEachTileCoordParentTileRange (tileCoord, callback, opt_this, opt_tileRange, opt_extent) {
    var tileRange, x, y;
    var tileCoordExtent = null;
    var z = tileCoord[0] - 1;
    if (this.zoomFactor_ === 2) {
      x = tileCoord[1];
      y = tileCoord[2];
    } else {
      tileCoordExtent = this.getTileCoordExtent(tileCoord, opt_extent);
    }
    while (z >= this.minZoom) {
      if (this.zoomFactor_ === 2) {
        x = Math.floor(x / 2);
        y = Math.floor(y / 2);
        tileRange = createOrUpdate$1(x, x, y, y, opt_tileRange);
      } else {
        tileRange = this.getTileRangeForExtentAndZ(tileCoordExtent, z, opt_tileRange);
      }
      if (callback.call(opt_this, z, tileRange)) {
        return true;
      }
      --z;
    }
    return false;
  };

  /**
   * Get the extent for this tile grid, if it was configured.
   * @return {import("../extent.js").Extent} Extent.
   */
  TileGrid.prototype.getExtent = function getExtent () {
    return this.extent_;
  };

  /**
   * Get the maximum zoom level for the grid.
   * @return {number} Max zoom.
   * @api
   */
  TileGrid.prototype.getMaxZoom = function getMaxZoom () {
    return this.maxZoom;
  };

  /**
   * Get the minimum zoom level for the grid.
   * @return {number} Min zoom.
   * @api
   */
  TileGrid.prototype.getMinZoom = function getMinZoom () {
    return this.minZoom;
  };

  /**
   * Get the origin for the grid at the given zoom level.
   * @param {number} z Integer zoom level.
   * @return {import("../coordinate.js").Coordinate} Origin.
   * @api
   */
  TileGrid.prototype.getOrigin = function getOrigin (z) {
    if (this.origin_) {
      return this.origin_;
    } else {
      return this.origins_[z];
    }
  };

  /**
   * Get the resolution for the given zoom level.
   * @param {number} z Integer zoom level.
   * @return {number} Resolution.
   * @api
   */
  TileGrid.prototype.getResolution = function getResolution (z) {
    return this.resolutions_[z];
  };

  /**
   * Get the list of resolutions for the tile grid.
   * @return {Array<number>} Resolutions.
   * @api
   */
  TileGrid.prototype.getResolutions = function getResolutions () {
    return this.resolutions_;
  };

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../TileRange.js").default=} opt_tileRange Temporary import("../TileRange.js").default object.
   * @param {import("../extent.js").Extent=} opt_extent Temporary import("../extent.js").Extent object.
   * @return {import("../TileRange.js").default} Tile range.
   */
  TileGrid.prototype.getTileCoordChildTileRange = function getTileCoordChildTileRange (tileCoord, opt_tileRange, opt_extent) {
    if (tileCoord[0] < this.maxZoom) {
      if (this.zoomFactor_ === 2) {
        var minX = tileCoord[1] * 2;
        var minY = tileCoord[2] * 2;
        return createOrUpdate$1(minX, minX + 1, minY, minY + 1, opt_tileRange);
      }
      var tileCoordExtent = this.getTileCoordExtent(tileCoord, opt_extent);
      return this.getTileRangeForExtentAndZ(
        tileCoordExtent, tileCoord[0] + 1, opt_tileRange);
    }
    return null;
  };

  /**
   * Get the extent for a tile range.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default} tileRange Tile range.
   * @param {import("../extent.js").Extent=} opt_extent Temporary import("../extent.js").Extent object.
   * @return {import("../extent.js").Extent} Extent.
   */
  TileGrid.prototype.getTileRangeExtent = function getTileRangeExtent (z, tileRange, opt_extent) {
    var origin = this.getOrigin(z);
    var resolution = this.getResolution(z);
    var tileSize = toSize(this.getTileSize(z), this.tmpSize_);
    var minX = origin[0] + tileRange.minX * tileSize[0] * resolution;
    var maxX = origin[0] + (tileRange.maxX + 1) * tileSize[0] * resolution;
    var minY = origin[1] + tileRange.minY * tileSize[1] * resolution;
    var maxY = origin[1] + (tileRange.maxY + 1) * tileSize[1] * resolution;
    return createOrUpdate(minX, minY, maxX, maxY, opt_extent);
  };

  /**
   * Get a tile range for the given extent and integer zoom level.
   * @param {import("../extent.js").Extent} extent Extent.
   * @param {number} z Integer zoom level.
   * @param {import("../TileRange.js").default=} opt_tileRange Temporary tile range object.
   * @return {import("../TileRange.js").default} Tile range.
   */
  TileGrid.prototype.getTileRangeForExtentAndZ = function getTileRangeForExtentAndZ (extent, z, opt_tileRange) {
    var tileCoord = tmpTileCoord;
    this.getTileCoordForXYAndZ_(extent[0], extent[1], z, false, tileCoord);
    var minX = tileCoord[1];
    var minY = tileCoord[2];
    this.getTileCoordForXYAndZ_(extent[2], extent[3], z, true, tileCoord);
    return createOrUpdate$1(minX, tileCoord[1], minY, tileCoord[2], opt_tileRange);
  };

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {import("../coordinate.js").Coordinate} Tile center.
   */
  TileGrid.prototype.getTileCoordCenter = function getTileCoordCenter (tileCoord) {
    var origin = this.getOrigin(tileCoord[0]);
    var resolution = this.getResolution(tileCoord[0]);
    var tileSize = toSize(this.getTileSize(tileCoord[0]), this.tmpSize_);
    return [
      origin[0] + (tileCoord[1] + 0.5) * tileSize[0] * resolution,
      origin[1] + (tileCoord[2] + 0.5) * tileSize[1] * resolution
    ];
  };

  /**
   * Get the extent of a tile coordinate.
   *
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("../extent.js").Extent=} opt_extent Temporary extent object.
   * @return {import("../extent.js").Extent} Extent.
   * @api
   */
  TileGrid.prototype.getTileCoordExtent = function getTileCoordExtent (tileCoord, opt_extent) {
    var origin = this.getOrigin(tileCoord[0]);
    var resolution = this.getResolution(tileCoord[0]);
    var tileSize = toSize(this.getTileSize(tileCoord[0]), this.tmpSize_);
    var minX = origin[0] + tileCoord[1] * tileSize[0] * resolution;
    var minY = origin[1] + tileCoord[2] * tileSize[1] * resolution;
    var maxX = minX + tileSize[0] * resolution;
    var maxY = minY + tileSize[1] * resolution;
    return createOrUpdate(minX, minY, maxX, maxY, opt_extent);
  };

  /**
   * Get the tile coordinate for the given map coordinate and resolution.This
   * method considers that coordinates that intersect tile boundaries should be
   * assigned the higher tile coordinate.
   *
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} resolution Resolution.
   * @param {import("../tilecoord.js").TileCoord=} opt_tileCoord Destination import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @api
   */
  TileGrid.prototype.getTileCoordForCoordAndResolution = function getTileCoordForCoordAndResolution (coordinate, resolution, opt_tileCoord) {
    return this.getTileCoordForXYAndResolution_(
      coordinate[0], coordinate[1], resolution, false, opt_tileCoord);
  };

  /**
   * Note that this method should not be called for resolutions that correspond
   * to an integer zoom level.Instead call the `getTileCoordForXYAndZ_` method.
   * @param {number} x X.
   * @param {number} y Y.
   * @param {number} resolution Resolution (for a non-integer zoom level).
   * @param {boolean} reverseIntersectionPolicy Instead of letting edge
   *   intersections go to the higher tile coordinate, let edge intersections
   *   go to the lower tile coordinate.
   * @param {import("../tilecoord.js").TileCoord=} opt_tileCoord Temporary import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @private
   */
  TileGrid.prototype.getTileCoordForXYAndResolution_ = function getTileCoordForXYAndResolution_ (x, y, resolution, reverseIntersectionPolicy, opt_tileCoord) {
    var z = this.getZForResolution(resolution);
    var scale = resolution / this.getResolution(z);
    var origin = this.getOrigin(z);
    var tileSize = toSize(this.getTileSize(z), this.tmpSize_);

    var adjustX = reverseIntersectionPolicy ? 0.5 : 0;
    var adjustY = reverseIntersectionPolicy ? 0 : 0.5;
    var xFromOrigin = Math.floor((x - origin[0]) / resolution + adjustX);
    var yFromOrigin = Math.floor((y - origin[1]) / resolution + adjustY);
    var tileCoordX = scale * xFromOrigin / tileSize[0];
    var tileCoordY = scale * yFromOrigin / tileSize[1];

    if (reverseIntersectionPolicy) {
      tileCoordX = Math.ceil(tileCoordX) - 1;
      tileCoordY = Math.ceil(tileCoordY) - 1;
    } else {
      tileCoordX = Math.floor(tileCoordX);
      tileCoordY = Math.floor(tileCoordY);
    }

    return createOrUpdate$2(z, tileCoordX, tileCoordY, opt_tileCoord);
  };

  /**
   * Although there is repetition between this method and `getTileCoordForXYAndResolution_`,
   * they should have separate implementations.This method is for integer zoom
   * levels.The other method should only be called for resolutions corresponding
   * to non-integer zoom levels.
   * @param {number} x Map x coordinate.
   * @param {number} y Map y coordinate.
   * @param {number} z Integer zoom level.
   * @param {boolean} reverseIntersectionPolicy Instead of letting edge
   *   intersections go to the higher tile coordinate, let edge intersections
   *   go to the lower tile coordinate.
   * @param {import("../tilecoord.js").TileCoord=} opt_tileCoord Temporary import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @private
   */
  TileGrid.prototype.getTileCoordForXYAndZ_ = function getTileCoordForXYAndZ_ (x, y, z, reverseIntersectionPolicy, opt_tileCoord) {
    var origin = this.getOrigin(z);
    var resolution = this.getResolution(z);
    var tileSize = toSize(this.getTileSize(z), this.tmpSize_);

    var adjustX = reverseIntersectionPolicy ? 0.5 : 0;
    var adjustY = reverseIntersectionPolicy ? 0 : 0.5;
    var xFromOrigin = Math.floor((x - origin[0]) / resolution + adjustX);
    var yFromOrigin = Math.floor((y - origin[1]) / resolution + adjustY);
    var tileCoordX = xFromOrigin / tileSize[0];
    var tileCoordY = yFromOrigin / tileSize[1];

    if (reverseIntersectionPolicy) {
      tileCoordX = Math.ceil(tileCoordX) - 1;
      tileCoordY = Math.ceil(tileCoordY) - 1;
    } else {
      tileCoordX = Math.floor(tileCoordX);
      tileCoordY = Math.floor(tileCoordY);
    }

    return createOrUpdate$2(z, tileCoordX, tileCoordY, opt_tileCoord);
  };

  /**
   * Get a tile coordinate given a map coordinate and zoom level.
   * @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
   * @param {number} z Zoom level.
   * @param {import("../tilecoord.js").TileCoord=} opt_tileCoord Destination import("../tilecoord.js").TileCoord object.
   * @return {import("../tilecoord.js").TileCoord} Tile coordinate.
   * @api
   */
  TileGrid.prototype.getTileCoordForCoordAndZ = function getTileCoordForCoordAndZ (coordinate, z, opt_tileCoord) {
    return this.getTileCoordForXYAndZ_(
      coordinate[0], coordinate[1], z, false, opt_tileCoord);
  };

  /**
   * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @return {number} Tile resolution.
   */
  TileGrid.prototype.getTileCoordResolution = function getTileCoordResolution (tileCoord) {
    return this.resolutions_[tileCoord[0]];
  };

  /**
   * Get the tile size for a zoom level. The type of the return value matches the
   * `tileSize` or `tileSizes` that the tile grid was configured with. To always
   * get an `import("../size.js").Size`, run the result through `import("../size.js").Size.toSize()`.
   * @param {number} z Z.
   * @return {number|import("../size.js").Size} Tile size.
   * @api
   */
  TileGrid.prototype.getTileSize = function getTileSize (z) {
    if (this.tileSize_) {
      return this.tileSize_;
    } else {
      return this.tileSizes_[z];
    }
  };

  /**
   * @param {number} z Zoom level.
   * @return {import("../TileRange.js").default} Extent tile range for the specified zoom level.
   */
  TileGrid.prototype.getFullTileRange = function getFullTileRange (z) {
    if (!this.fullTileRanges_) {
      return null;
    } else {
      return this.fullTileRanges_[z];
    }
  };

  /**
   * @param {number} resolution Resolution.
   * @param {number=} opt_direction If 0, the nearest resolution will be used.
   *   If 1, the nearest lower resolution will be used. If -1, the nearest
   *   higher resolution will be used. Default is 0.
   * @return {number} Z.
   * @api
   */
  TileGrid.prototype.getZForResolution = function getZForResolution (resolution, opt_direction) {
    var z = linearFindNearest(this.resolutions_, resolution, opt_direction || 0);
    return clamp(z, this.minZoom, this.maxZoom);
  };

  /**
   * @param {!import("../extent.js").Extent} extent Extent for this tile grid.
   * @private
   */
  TileGrid.prototype.calculateTileRanges_ = function calculateTileRanges_ (extent) {
    var length = this.resolutions_.length;
    var fullTileRanges = new Array(length);
    for (var z = this.minZoom; z < length; ++z) {
      fullTileRanges[z] = this.getTileRangeForExtentAndZ(extent, z);
    }
    this.fullTileRanges_ = fullTileRanges;
  };

  /**
   * @module ol/tilegrid
   */


  /**
   * @param {import("./proj/Projection.js").default} projection Projection.
   * @return {!TileGrid} Default tile grid for the
   * passed projection.
   */
  function getForProjection(projection) {
    var tileGrid = projection.getDefaultTileGrid();
    if (!tileGrid) {
      tileGrid = createForProjection(projection);
      projection.setDefaultTileGrid(tileGrid);
    }
    return tileGrid;
  }


  /**
   * @param {TileGrid} tileGrid Tile grid.
   * @param {import("./tilecoord.js").TileCoord} tileCoord Tile coordinate.
   * @param {import("./proj/Projection.js").default} projection Projection.
   * @return {import("./tilecoord.js").TileCoord} Tile coordinate.
   */
  function wrapX(tileGrid, tileCoord, projection) {
    var z = tileCoord[0];
    var center = tileGrid.getTileCoordCenter(tileCoord);
    var projectionExtent = extentFromProjection(projection);
    if (!containsCoordinate(projectionExtent, center)) {
      var worldWidth = getWidth(projectionExtent);
      var worldsAway = Math.ceil((projectionExtent[0] - center[0]) / worldWidth);
      center[0] += worldWidth * worldsAway;
      return tileGrid.getTileCoordForCoordAndZ(center, z);
    } else {
      return tileCoord;
    }
  }


  /**
   * @param {import("./extent.js").Extent} extent Extent.
   * @param {number=} opt_maxZoom Maximum zoom level (default is
   *     DEFAULT_MAX_ZOOM).
   * @param {number|import("./size.js").Size=} opt_tileSize Tile size (default uses
   *     DEFAULT_TILE_SIZE).
   * @param {Corner=} opt_corner Extent corner (default is `'top-left'`).
   * @return {!TileGrid} TileGrid instance.
   */
  function createForExtent(extent, opt_maxZoom, opt_tileSize, opt_corner) {
    var corner = opt_corner !== undefined ? opt_corner : Corner.TOP_LEFT;

    var resolutions = resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize);

    return new TileGrid({
      extent: extent,
      origin: getCorner(extent, corner),
      resolutions: resolutions,
      tileSize: opt_tileSize
    });
  }


  /**
   * @typedef {Object} XYZOptions
   * @property {import("./extent.js").Extent} [extent] Extent for the tile grid. The origin for an XYZ tile grid is the
   * top-left corner of the extent. The zero level of the grid is defined by the resolution at which one tile fits in the
   * provided extent. If not provided, the extent of the EPSG:3857 projection is used.
   * @property {number} [maxZoom] Maximum zoom. The default is `42`. This determines the number of levels
   * in the grid set. For example, a `maxZoom` of 21 means there are 22 levels in the grid set.
   * @property {number} [minZoom=0] Minimum zoom.
   * @property {number|import("./size.js").Size} [tileSize=[256, 256]] Tile size in pixels.
   */


  /**
   * Creates a tile grid with a standard XYZ tiling scheme.
   * @param {XYZOptions=} opt_options Tile grid options.
   * @return {!TileGrid} Tile grid instance.
   * @api
   */
  function createXYZ(opt_options) {
    /** @type {XYZOptions} */
    var xyzOptions = opt_options || {};

    var extent = xyzOptions.extent || get$2('EPSG:3857').getExtent();

    /** @type {import("./tilegrid/TileGrid.js").Options} */
    var gridOptions = {
      extent: extent,
      minZoom: xyzOptions.minZoom,
      tileSize: xyzOptions.tileSize,
      resolutions: resolutionsFromExtent(
        extent,
        xyzOptions.maxZoom,
        xyzOptions.tileSize
      )
    };
    return new TileGrid(gridOptions);
  }


  /**
   * Create a resolutions array from an extent.  A zoom factor of 2 is assumed.
   * @param {import("./extent.js").Extent} extent Extent.
   * @param {number=} opt_maxZoom Maximum zoom level (default is
   *     DEFAULT_MAX_ZOOM).
   * @param {number|import("./size.js").Size=} opt_tileSize Tile size (default uses
   *     DEFAULT_TILE_SIZE).
   * @return {!Array<number>} Resolutions array.
   */
  function resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize) {
    var maxZoom = opt_maxZoom !== undefined ?
      opt_maxZoom : DEFAULT_MAX_ZOOM;

    var height = getHeight(extent);
    var width = getWidth(extent);

    var tileSize = toSize(opt_tileSize !== undefined ?
      opt_tileSize : DEFAULT_TILE_SIZE);
    var maxResolution = Math.max(
      width / tileSize[0], height / tileSize[1]);

    var length = maxZoom + 1;
    var resolutions = new Array(length);
    for (var z = 0; z < length; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z);
    }
    return resolutions;
  }


  /**
   * @param {import("./proj.js").ProjectionLike} projection Projection.
   * @param {number=} opt_maxZoom Maximum zoom level (default is
   *     DEFAULT_MAX_ZOOM).
   * @param {number|import("./size.js").Size=} opt_tileSize Tile size (default uses
   *     DEFAULT_TILE_SIZE).
   * @param {Corner=} opt_corner Extent corner (default is `'top-left'`).
   * @return {!TileGrid} TileGrid instance.
   */
  function createForProjection(projection, opt_maxZoom, opt_tileSize, opt_corner) {
    var extent = extentFromProjection(projection);
    return createForExtent(extent, opt_maxZoom, opt_tileSize, opt_corner);
  }


  /**
   * Generate a tile grid extent from a projection.  If the projection has an
   * extent, it is used.  If not, a global extent is assumed.
   * @param {import("./proj.js").ProjectionLike} projection Projection.
   * @return {import("./extent.js").Extent} Extent.
   */
  function extentFromProjection(projection) {
    projection = get$2(projection);
    var extent = projection.getExtent();
    if (!extent) {
      var half = 180 * METERS_PER_UNIT[Units.DEGREES] / projection.getMetersPerUnit();
      extent = createOrUpdate(-half, -half, half, half);
    }
    return extent;
  }

  /**
   * @module ol/source/Tile
   */

  /**
   * @typedef {Object} Options
   * @property {import("./Source.js").AttributionLike} [attributions]
   * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
   * @property {number} [cacheSize]
   * @property {boolean} [opaque]
   * @property {number} [tilePixelRatio]
   * @property {import("../proj.js").ProjectionLike} [projection]
   * @property {import("./State.js").default} [state]
   * @property {import("../tilegrid/TileGrid.js").default} [tileGrid]
   * @property {boolean} [wrapX=true]
   * @property {number} [transition]
   * @property {string} [key]
   */


  /**
   * @classdesc
   * Abstract base class; normally only used for creating subclasses and not
   * instantiated in apps.
   * Base class for sources providing images divided into a tile grid.
   * @abstract
   * @api
   */
  var TileSource = /*@__PURE__*/(function (Source) {
    function TileSource(options) {

      Source.call(this, {
        attributions: options.attributions,
        attributionsCollapsible: options.attributionsCollapsible,
        projection: options.projection,
        state: options.state,
        wrapX: options.wrapX
      });

      /**
       * @private
       * @type {boolean}
       */
      this.opaque_ = options.opaque !== undefined ? options.opaque : false;

      /**
       * @private
       * @type {number}
       */
      this.tilePixelRatio_ = options.tilePixelRatio !== undefined ?
        options.tilePixelRatio : 1;

      /**
       * @protected
       * @type {import("../tilegrid/TileGrid.js").default}
       */
      this.tileGrid = options.tileGrid !== undefined ? options.tileGrid : null;

      /**
       * @protected
       * @type {import("../TileCache.js").default}
       */
      this.tileCache = new TileCache(options.cacheSize);

      /**
       * @protected
       * @type {import("../size.js").Size}
       */
      this.tmpSize = [0, 0];

      /**
       * @private
       * @type {string}
       */
      this.key_ = options.key || '';

      /**
       * @protected
       * @type {import("../Tile.js").Options}
       */
      this.tileOptions = {transition: options.transition};

    }

    if ( Source ) TileSource.__proto__ = Source;
    TileSource.prototype = Object.create( Source && Source.prototype );
    TileSource.prototype.constructor = TileSource;

    /**
     * @return {boolean} Can expire cache.
     */
    TileSource.prototype.canExpireCache = function canExpireCache () {
      return this.tileCache.canExpireCache();
    };

    /**
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @param {!Object<string, import("../TileRange.js").default>} usedTiles Used tiles.
     */
    TileSource.prototype.expireCache = function expireCache (projection, usedTiles) {
      var tileCache = this.getTileCacheForProjection(projection);
      if (tileCache) {
        tileCache.expireCache(usedTiles);
      }
    };

    /**
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @param {number} z Zoom level.
     * @param {import("../TileRange.js").default} tileRange Tile range.
     * @param {function(import("../Tile.js").default):(boolean|void)} callback Called with each
     *     loaded tile.  If the callback returns `false`, the tile will not be
     *     considered loaded.
     * @return {boolean} The tile range is fully covered with loaded tiles.
     */
    TileSource.prototype.forEachLoadedTile = function forEachLoadedTile (projection, z, tileRange, callback) {
      var tileCache = this.getTileCacheForProjection(projection);
      if (!tileCache) {
        return false;
      }

      var covered = true;
      var tile, tileCoordKey, loaded;
      for (var x = tileRange.minX; x <= tileRange.maxX; ++x) {
        for (var y = tileRange.minY; y <= tileRange.maxY; ++y) {
          tileCoordKey = getKeyZXY(z, x, y);
          loaded = false;
          if (tileCache.containsKey(tileCoordKey)) {
            tile = /** @type {!import("../Tile.js").default} */ (tileCache.get(tileCoordKey));
            loaded = tile.getState() === TileState.LOADED;
            if (loaded) {
              loaded = (callback(tile) !== false);
            }
          }
          if (!loaded) {
            covered = false;
          }
        }
      }
      return covered;
    };

    /**
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @return {number} Gutter.
     */
    TileSource.prototype.getGutterForProjection = function getGutterForProjection (projection) {
      return 0;
    };

    /**
     * Return the key to be used for all tiles in the source.
     * @return {string} The key for all tiles.
     * @protected
     */
    TileSource.prototype.getKey = function getKey () {
      return this.key_;
    };

    /**
     * Set the value to be used as the key for all tiles in the source.
     * @param {string} key The key for tiles.
     * @protected
     */
    TileSource.prototype.setKey = function setKey (key) {
      if (this.key_ !== key) {
        this.key_ = key;
        this.changed();
      }
    };

    /**
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @return {boolean} Opaque.
     */
    TileSource.prototype.getOpaque = function getOpaque (projection) {
      return this.opaque_;
    };

    /**
     * @inheritDoc
     */
    TileSource.prototype.getResolutions = function getResolutions () {
      return this.tileGrid.getResolutions();
    };

    /**
     * @abstract
     * @param {number} z Tile coordinate z.
     * @param {number} x Tile coordinate x.
     * @param {number} y Tile coordinate y.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @return {!import("../Tile.js").default} Tile.
     */
    TileSource.prototype.getTile = function getTile (z, x, y, pixelRatio, projection) {
      return abstract();
    };

    /**
     * Return the tile grid of the tile source.
     * @return {import("../tilegrid/TileGrid.js").default} Tile grid.
     * @api
     */
    TileSource.prototype.getTileGrid = function getTileGrid () {
      return this.tileGrid;
    };

    /**
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @return {!import("../tilegrid/TileGrid.js").default} Tile grid.
     */
    TileSource.prototype.getTileGridForProjection = function getTileGridForProjection$1 (projection) {
      if (!this.tileGrid) {
        return getForProjection(projection);
      } else {
        return this.tileGrid;
      }
    };

    /**
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @return {import("../TileCache.js").default} Tile cache.
     * @protected
     */
    TileSource.prototype.getTileCacheForProjection = function getTileCacheForProjection (projection) {
      var thisProj = this.getProjection();
      if (thisProj && !equivalent(thisProj, projection)) {
        return null;
      } else {
        return this.tileCache;
      }
    };

    /**
     * Get the tile pixel ratio for this source. Subclasses may override this
     * method, which is meant to return a supported pixel ratio that matches the
     * provided `pixelRatio` as close as possible.
     * @param {number} pixelRatio Pixel ratio.
     * @return {number} Tile pixel ratio.
     */
    TileSource.prototype.getTilePixelRatio = function getTilePixelRatio (pixelRatio) {
      return this.tilePixelRatio_;
    };

    /**
     * @param {number} z Z.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @return {import("../size.js").Size} Tile size.
     */
    TileSource.prototype.getTilePixelSize = function getTilePixelSize (z, pixelRatio, projection) {
      var tileGrid = this.getTileGridForProjection(projection);
      var tilePixelRatio = this.getTilePixelRatio(pixelRatio);
      var tileSize = toSize(tileGrid.getTileSize(z), this.tmpSize);
      if (tilePixelRatio == 1) {
        return tileSize;
      } else {
        return scale$3(tileSize, tilePixelRatio, this.tmpSize);
      }
    };

    /**
     * Returns a tile coordinate wrapped around the x-axis. When the tile coordinate
     * is outside the resolution and extent range of the tile grid, `null` will be
     * returned.
     * @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
     * @param {import("../proj/Projection.js").default=} opt_projection Projection.
     * @return {import("../tilecoord.js").TileCoord} Tile coordinate to be passed to the tileUrlFunction or
     *     null if no tile URL should be created for the passed `tileCoord`.
     */
    TileSource.prototype.getTileCoordForTileUrlFunction = function getTileCoordForTileUrlFunction (tileCoord, opt_projection) {
      var projection = opt_projection !== undefined ?
        opt_projection : this.getProjection();
      var tileGrid = this.getTileGridForProjection(projection);
      if (this.getWrapX() && projection.isGlobal()) {
        tileCoord = wrapX(tileGrid, tileCoord, projection);
      }
      return withinExtentAndZ(tileCoord, tileGrid) ? tileCoord : null;
    };

    /**
     * @inheritDoc
     */
    TileSource.prototype.refresh = function refresh () {
      this.tileCache.clear();
      this.changed();
    };

    /**
     * Marks a tile coord as being used, without triggering a load.
     * @abstract
     * @param {number} z Tile coordinate z.
     * @param {number} x Tile coordinate x.
     * @param {number} y Tile coordinate y.
     * @param {import("../proj/Projection.js").default} projection Projection.
     */
    TileSource.prototype.useTile = function useTile (z, x, y, projection) {};

    return TileSource;
  }(Source));


  /**
   * @classdesc
   * Events emitted by {@link module:ol/source/Tile~TileSource} instances are instances of this
   * type.
   */
  var TileSourceEvent = /*@__PURE__*/(function (Event) {
    function TileSourceEvent(type, tile) {

      Event.call(this, type);

      /**
       * The tile related to the event.
       * @type {import("../Tile.js").default}
       * @api
       */
      this.tile = tile;

    }

    if ( Event ) TileSourceEvent.__proto__ = Event;
    TileSourceEvent.prototype = Object.create( Event && Event.prototype );
    TileSourceEvent.prototype.constructor = TileSourceEvent;

    return TileSourceEvent;
  }(Event));

  /**
   * @module ol/source/TileEventType
   */

  /**
   * @enum {string}
   */
  var TileEventType = {

    /**
     * Triggered when a tile starts loading.
     * @event module:ol/source/Tile.TileSourceEvent#tileloadstart
     * @api
     */
    TILELOADSTART: 'tileloadstart',

    /**
     * Triggered when a tile finishes loading, either when its data is loaded,
     * or when loading was aborted because the tile is no longer needed.
     * @event module:ol/source/Tile.TileSourceEvent#tileloadend
     * @api
     */
    TILELOADEND: 'tileloadend',

    /**
     * Triggered if tile loading results in an error.
     * @event module:ol/source/Tile.TileSourceEvent#tileloaderror
     * @api
     */
    TILELOADERROR: 'tileloaderror'

  };

  /**
   * @module ol/source/UrlTile
   */

  /**
   * @typedef {Object} Options
   * @property {import("./Source.js").AttributionLike} [attributions]
   * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
   * @property {number} [cacheSize]
   * @property {boolean} [opaque]
   * @property {import("../proj.js").ProjectionLike} [projection]
   * @property {import("./State.js").default} [state]
   * @property {import("../tilegrid/TileGrid.js").default} [tileGrid]
   * @property {import("../Tile.js").LoadFunction} tileLoadFunction
   * @property {number} [tilePixelRatio]
   * @property {import("../Tile.js").UrlFunction} [tileUrlFunction]
   * @property {string} [url]
   * @property {Array<string>} [urls]
   * @property {boolean} [wrapX=true]
   * @property {number} [transition]
   * @property {string} [key]
   */


  /**
   * @classdesc
   * Base class for sources providing tiles divided into a tile grid over http.
   *
   * @fires import("./Tile.js").TileSourceEvent
   */
  var UrlTile = /*@__PURE__*/(function (TileSource) {
    function UrlTile(options) {

      TileSource.call(this, {
        attributions: options.attributions,
        cacheSize: options.cacheSize,
        opaque: options.opaque,
        projection: options.projection,
        state: options.state,
        tileGrid: options.tileGrid,
        tilePixelRatio: options.tilePixelRatio,
        wrapX: options.wrapX,
        transition: options.transition,
        key: options.key,
        attributionsCollapsible: options.attributionsCollapsible
      });

      /**
       * @private
       * @type {boolean}
       */
      this.generateTileUrlFunction_ = !options.tileUrlFunction;

      /**
       * @protected
       * @type {import("../Tile.js").LoadFunction}
       */
      this.tileLoadFunction = options.tileLoadFunction;

      /**
       * @protected
       * @type {import("../Tile.js").UrlFunction}
       */
      this.tileUrlFunction = options.tileUrlFunction ? options.tileUrlFunction.bind(this) : nullTileUrlFunction;

      /**
       * @protected
       * @type {!Array<string>|null}
       */
      this.urls = null;

      if (options.urls) {
        this.setUrls(options.urls);
      } else if (options.url) {
        this.setUrl(options.url);
      }

      if (options.tileUrlFunction) {
        this.setTileUrlFunction(options.tileUrlFunction, this.key_);
      }

      /**
       * @private
       * @type {!Object<string, boolean>}
       */
      this.tileLoadingKeys_ = {};

    }

    if ( TileSource ) UrlTile.__proto__ = TileSource;
    UrlTile.prototype = Object.create( TileSource && TileSource.prototype );
    UrlTile.prototype.constructor = UrlTile;

    /**
     * Return the tile load function of the source.
     * @return {import("../Tile.js").LoadFunction} TileLoadFunction
     * @api
     */
    UrlTile.prototype.getTileLoadFunction = function getTileLoadFunction () {
      return this.tileLoadFunction;
    };

    /**
     * Return the tile URL function of the source.
     * @return {import("../Tile.js").UrlFunction} TileUrlFunction
     * @api
     */
    UrlTile.prototype.getTileUrlFunction = function getTileUrlFunction () {
      return this.tileUrlFunction;
    };

    /**
     * Return the URLs used for this source.
     * When a tileUrlFunction is used instead of url or urls,
     * null will be returned.
     * @return {!Array<string>|null} URLs.
     * @api
     */
    UrlTile.prototype.getUrls = function getUrls () {
      return this.urls;
    };

    /**
     * Handle tile change events.
     * @param {import("../events/Event.js").default} event Event.
     * @protected
     */
    UrlTile.prototype.handleTileChange = function handleTileChange (event) {
      var tile = /** @type {import("../Tile.js").default} */ (event.target);
      var uid = getUid(tile);
      var tileState = tile.getState();
      var type;
      if (tileState == TileState.LOADING) {
        this.tileLoadingKeys_[uid] = true;
        type = TileEventType.TILELOADSTART;
      } else if (uid in this.tileLoadingKeys_) {
        delete this.tileLoadingKeys_[uid];
        type = tileState == TileState.ERROR ? TileEventType.TILELOADERROR :
          (tileState == TileState.LOADED || tileState == TileState.ABORT) ?
            TileEventType.TILELOADEND : undefined;
      }
      if (type != undefined) {
        this.dispatchEvent(new TileSourceEvent(type, tile));
      }
    };

    /**
     * Set the tile load function of the source.
     * @param {import("../Tile.js").LoadFunction} tileLoadFunction Tile load function.
     * @api
     */
    UrlTile.prototype.setTileLoadFunction = function setTileLoadFunction (tileLoadFunction) {
      this.tileCache.clear();
      this.tileLoadFunction = tileLoadFunction;
      this.changed();
    };

    /**
     * Set the tile URL function of the source.
     * @param {import("../Tile.js").UrlFunction} tileUrlFunction Tile URL function.
     * @param {string=} key Optional new tile key for the source.
     * @api
     */
    UrlTile.prototype.setTileUrlFunction = function setTileUrlFunction (tileUrlFunction, key) {
      this.tileUrlFunction = tileUrlFunction;
      this.tileCache.pruneExceptNewestZ();
      if (typeof key !== 'undefined') {
        this.setKey(key);
      } else {
        this.changed();
      }
    };

    /**
     * Set the URL to use for requests.
     * @param {string} url URL.
     * @api
     */
    UrlTile.prototype.setUrl = function setUrl (url) {
      var urls = this.urls = expandUrl(url);
      this.setUrls(urls);
    };

    /**
     * Set the URLs to use for requests.
     * @param {Array<string>} urls URLs.
     * @api
     */
    UrlTile.prototype.setUrls = function setUrls (urls) {
      this.urls = urls;
      var key = urls.join('\n');
      if (this.generateTileUrlFunction_) {
        this.setTileUrlFunction(createFromTemplates(urls, this.tileGrid), key);
      } else {
        this.setKey(key);
      }
    };

    /**
     * @inheritDoc
     */
    UrlTile.prototype.useTile = function useTile (z, x, y) {
      var tileCoordKey = getKeyZXY(z, x, y);
      if (this.tileCache.containsKey(tileCoordKey)) {
        this.tileCache.get(tileCoordKey);
      }
    };

    return UrlTile;
  }(TileSource));

  /**
   * @module ol/source/TileImage
   */

  /**
   * @typedef {Object} Options
   * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
   * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
   * @property {number} [cacheSize=2048] Cache size.
   * @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
   * you must provide a `crossOrigin` value if you are using the WebGL renderer or if you want to
   * access pixel data with the Canvas renderer.  See
   * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
   * @property {boolean} [opaque=true] Whether the layer is opaque.
   * @property {import("../proj.js").ProjectionLike} projection Projection.
   * @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
   * Higher values can increase reprojection performance, but decrease precision.
   * @property {import("./State.js").default} [state] Source state.
   * @property {typeof import("../ImageTile.js").default} [tileClass] Class used to instantiate image tiles.
   * Default is {@link module:ol/ImageTile~ImageTile}.
   * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] Tile grid.
   * @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL. The default is
   * ```js
   * function(imageTile, src) {
   *   imageTile.getImage().src = src;
   * };
   * ```
   * @property {number} [tilePixelRatio=1] The pixel ratio used by the tile service. For example, if the tile
   * service advertizes 256px by 256px tiles but actually sends 512px
   * by 512px images (for retina/hidpi devices) then `tilePixelRatio`
   * should be set to `2`.
   * @property {import("../Tile.js").UrlFunction} [tileUrlFunction] Optional function to get tile URL given a tile coordinate and the projection.
   * @property {string} [url] URL template. Must include `{x}`, `{y}` or `{-y}`, and `{z}` placeholders.
   * A `{?-?}` template pattern, for example `subdomain{a-f}.domain.com`, may be
   * used instead of defining each one separately in the `urls` option.
   * @property {Array<string>} [urls] An array of URL templates.
   * @property {boolean} [wrapX] Whether to wrap the world horizontally. The default, is to
   * request out-of-bounds tiles from the server. When set to `false`, only one
   * world will be rendered. When set to `true`, tiles will be requested for one
   * world only, but they will be wrapped horizontally to render multiple worlds.
   * @property {number} [transition] Duration of the opacity transition for rendering.
   * To disable the opacity transition, pass `transition: 0`.
   * @property {string} [key] Optional tile key for proper cache fetching
   */


  /**
   * @classdesc
   * Base class for sources providing images divided into a tile grid.
   *
   * @fires import("./Tile.js").TileSourceEvent
   * @api
   */
  var TileImage = /*@__PURE__*/(function (UrlTile) {
    function TileImage(options) {

      UrlTile.call(this, {
        attributions: options.attributions,
        cacheSize: options.cacheSize,
        opaque: options.opaque,
        projection: options.projection,
        state: options.state,
        tileGrid: options.tileGrid,
        tileLoadFunction: options.tileLoadFunction ?
          options.tileLoadFunction : defaultTileLoadFunction,
        tilePixelRatio: options.tilePixelRatio,
        tileUrlFunction: options.tileUrlFunction,
        url: options.url,
        urls: options.urls,
        wrapX: options.wrapX,
        transition: options.transition,
        key: options.key,
        attributionsCollapsible: options.attributionsCollapsible
      });

      /**
       * @protected
       * @type {?string}
       */
      this.crossOrigin =
          options.crossOrigin !== undefined ? options.crossOrigin : null;

      /**
       * @protected
       * @type {typeof ImageTile}
       */
      this.tileClass = options.tileClass !== undefined ?
        options.tileClass : ImageTile;

      /**
       * @protected
       * @type {!Object<string, TileCache>}
       */
      this.tileCacheForProjection = {};

      /**
       * @protected
       * @type {!Object<string, import("../tilegrid/TileGrid.js").default>}
       */
      this.tileGridForProjection = {};

      /**
       * @private
       * @type {number|undefined}
       */
      this.reprojectionErrorThreshold_ = options.reprojectionErrorThreshold;

      /**
       * @private
       * @type {boolean}
       */
      this.renderReprojectionEdges_ = false;
    }

    if ( UrlTile ) TileImage.__proto__ = UrlTile;
    TileImage.prototype = Object.create( UrlTile && UrlTile.prototype );
    TileImage.prototype.constructor = TileImage;

    /**
     * @inheritDoc
     */
    TileImage.prototype.canExpireCache = function canExpireCache () {
      if (this.tileCache.canExpireCache()) {
        return true;
      } else {
        for (var key in this.tileCacheForProjection) {
          if (this.tileCacheForProjection[key].canExpireCache()) {
            return true;
          }
        }
      }
      return false;
    };

    /**
     * @inheritDoc
     */
    TileImage.prototype.expireCache = function expireCache (projection, usedTiles) {
      var usedTileCache = this.getTileCacheForProjection(projection);

      this.tileCache.expireCache(this.tileCache == usedTileCache ? usedTiles : {});
      for (var id in this.tileCacheForProjection) {
        var tileCache = this.tileCacheForProjection[id];
        tileCache.expireCache(tileCache == usedTileCache ? usedTiles : {});
      }
    };

    /**
     * @inheritDoc
     */
    TileImage.prototype.getGutterForProjection = function getGutterForProjection (projection) {
      if (this.getProjection() && projection && !equivalent(this.getProjection(), projection)) {
        return 0;
      } else {
        return this.getGutter();
      }
    };

    /**
     * @return {number} Gutter.
     */
    TileImage.prototype.getGutter = function getGutter () {
      return 0;
    };

    /**
     * @inheritDoc
     */
    TileImage.prototype.getOpaque = function getOpaque (projection) {
      if (this.getProjection() && projection && !equivalent(this.getProjection(), projection)) {
        return false;
      } else {
        return UrlTile.prototype.getOpaque.call(this, projection);
      }
    };

    /**
     * @inheritDoc
     */
    TileImage.prototype.getTileGridForProjection = function getTileGridForProjection$1 (projection) {
      var thisProj = this.getProjection();
      if (this.tileGrid && (!thisProj || equivalent(thisProj, projection))) {
        return this.tileGrid;
      } else {
        var projKey = getUid(projection);
        if (!(projKey in this.tileGridForProjection)) {
          this.tileGridForProjection[projKey] = getForProjection(projection);
        }
        return (
          /** @type {!import("../tilegrid/TileGrid.js").default} */ (this.tileGridForProjection[projKey])
        );
      }
    };

    /**
     * @inheritDoc
     */
    TileImage.prototype.getTileCacheForProjection = function getTileCacheForProjection (projection) {
      var thisProj = this.getProjection(); if (!thisProj || equivalent(thisProj, projection)) {
        return this.tileCache;
      } else {
        var projKey = getUid(projection);
        if (!(projKey in this.tileCacheForProjection)) {
          this.tileCacheForProjection[projKey] = new TileCache(this.tileCache.highWaterMark);
        }
        return this.tileCacheForProjection[projKey];
      }
    };

    /**
     * @param {number} z Tile coordinate z.
     * @param {number} x Tile coordinate x.
     * @param {number} y Tile coordinate y.
     * @param {number} pixelRatio Pixel ratio.
     * @param {import("../proj/Projection.js").default} projection Projection.
     * @param {string} key The key set on the tile.
     * @return {!import("../Tile.js").default} Tile.
     * @private
     */
    TileImage.prototype.createTile_ = function createTile_ (z, x, y, pixelRatio, projection, key) {
      var tileCoord = [z, x, y];
      var urlTileCoord = this.getTileCoordForTileUrlFunction(
        tileCoord, projection);
      var tileUrl = urlTileCoord ?
        this.tileUrlFunction(urlTileCoord, pixelRatio, projection) : undefined;
      var tile = new this.tileClass(
        tileCoord,
        tileUrl !== undefined ? TileState.IDLE : TileState.EMPTY,
        tileUrl !== undefined ? tileUrl : '',
        this.crossOrigin,
        this.tileLoadFunction,
        this.tileOptions);
      tile.key = key;
      listen(tile, EventType.CHANGE,
        this.handleTileChange, this);
      return tile;
    };

    /**
     * @inheritDoc
     */
    TileImage.prototype.getTile = function getTile (z, x, y, pixelRatio, projection) {
      var sourceProjection = /** @type {!import("../proj/Projection.js").default} */ (this.getProjection());
      if (!sourceProjection || !projection || equivalent(sourceProjection, projection)) {
        return this.getTileInternal(z, x, y, pixelRatio, sourceProjection || projection);
      } else {
        var cache = this.getTileCacheForProjection(projection);
        var tileCoord = [z, x, y];
        var tile;
        var tileCoordKey = getKey$1(tileCoord);
        if (cache.containsKey(tileCoordKey)) {
          tile = /** @type {!import("../Tile.js").default} */ (cache.get(tileCoordKey));
        }
        var key = this.getKey();
        if (tile && tile.key == key) {
          return tile;
        } else {
          var sourceTileGrid = this.getTileGridForProjection(sourceProjection);
          var targetTileGrid = this.getTileGridForProjection(projection);
          var wrappedTileCoord =
              this.getTileCoordForTileUrlFunction(tileCoord, projection);
          var newTile = new ReprojTile(
            sourceProjection, sourceTileGrid,
            projection, targetTileGrid,
            tileCoord, wrappedTileCoord, this.getTilePixelRatio(pixelRatio),
            this.getGutter(),
            function(z, x, y, pixelRatio) {
              return this.getTileInternal(z, x, y, pixelRatio, sourceProjection);
            }.bind(this), this.reprojectionErrorThreshold_,
            this.renderReprojectionEdges_);
          newTile.key = key;

          if (tile) {
            newTile.interimTile = tile;
            newTile.refreshInterimChain();
            cache.replace(tileCoordKey, newTile);
          } else {
            cache.set(tileCoordKey, newTile);
          }
          return newTile;
        }
      }
    };

    /**
     * @param {number} z Tile coordinate z.
     * @param {number} x Tile coordinate x.
     * @param {number} y Tile coordinate y.
     * @param {number} pixelRatio Pixel ratio.
     * @param {!import("../proj/Projection.js").default} projection Projection.
     * @return {!import("../Tile.js").default} Tile.
     * @protected
     */
    TileImage.prototype.getTileInternal = function getTileInternal (z, x, y, pixelRatio, projection) {
      var tile = null;
      var tileCoordKey = getKeyZXY(z, x, y);
      var key = this.getKey();
      if (!this.tileCache.containsKey(tileCoordKey)) {
        tile = this.createTile_(z, x, y, pixelRatio, projection, key);
        this.tileCache.set(tileCoordKey, tile);
      } else {
        tile = this.tileCache.get(tileCoordKey);
        if (tile.key != key) {
          // The source's params changed. If the tile has an interim tile and if we
          // can use it then we use it. Otherwise we create a new tile.  In both
          // cases we attempt to assign an interim tile to the new tile.
          var interimTile = tile;
          tile = this.createTile_(z, x, y, pixelRatio, projection, key);

          //make the new tile the head of the list,
          if (interimTile.getState() == TileState.IDLE) {
            //the old tile hasn't begun loading yet, and is now outdated, so we can simply discard it
            tile.interimTile = interimTile.interimTile;
          } else {
            tile.interimTile = interimTile;
          }
          tile.refreshInterimChain();
          this.tileCache.replace(tileCoordKey, tile);
        }
      }
      return tile;
    };

    /**
     * Sets whether to render reprojection edges or not (usually for debugging).
     * @param {boolean} render Render the edges.
     * @api
     */
    TileImage.prototype.setRenderReprojectionEdges = function setRenderReprojectionEdges (render) {
      if (this.renderReprojectionEdges_ == render) {
        return;
      }
      this.renderReprojectionEdges_ = render;
      for (var id in this.tileCacheForProjection) {
        this.tileCacheForProjection[id].clear();
      }
      this.changed();
    };

    /**
     * Sets the tile grid to use when reprojecting the tiles to the given
     * projection instead of the default tile grid for the projection.
     *
     * This can be useful when the default tile grid cannot be created
     * (e.g. projection has no extent defined) or
     * for optimization reasons (custom tile size, resolutions, ...).
     *
     * @param {import("../proj.js").ProjectionLike} projection Projection.
     * @param {import("../tilegrid/TileGrid.js").default} tilegrid Tile grid to use for the projection.
     * @api
     */
    TileImage.prototype.setTileGridForProjection = function setTileGridForProjection (projection, tilegrid) {
      {
        var proj = get$2(projection);
        if (proj) {
          var projKey = getUid(proj);
          if (!(projKey in this.tileGridForProjection)) {
            this.tileGridForProjection[projKey] = tilegrid;
          }
        }
      }
    };

    return TileImage;
  }(UrlTile));


  /**
   * @param {ImageTile} imageTile Image tile.
   * @param {string} src Source.
   */
  function defaultTileLoadFunction(imageTile, src) {
    /** @type {HTMLImageElement|HTMLVideoElement} */ (imageTile.getImage()).src = src;
  }

  /**
   * @module ol/source/XYZ
   */

  /**
   * @typedef {Object} Options
   * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
   * @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
   * @property {number} [cacheSize=2048] Cache size.
   * @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
   * you must provide a `crossOrigin` value if you are using the WebGL renderer or if you want to
   * access pixel data with the Canvas renderer.  See
   * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
   * @property {boolean} [opaque=true] Whether the layer is opaque.
   * @property {import("../proj.js").ProjectionLike} [projection='EPSG:3857'] Projection.
   * @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
   * Higher values can increase reprojection performance, but decrease precision.
   * @property {number} [maxZoom=18] Optional max zoom level.
   * @property {number} [minZoom=0] Optional min zoom level.
   * @property {import("../tilegrid/TileGrid.js").default} [tileGrid] Tile grid.
   * @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL. The default is
   * ```js
   * function(imageTile, src) {
   *   imageTile.getImage().src = src;
   * };
   * ```
   * @property {number} [tilePixelRatio=1] The pixel ratio used by the tile service.
   * For example, if the tile service advertizes 256px by 256px tiles but actually sends 512px
   * by 512px images (for retina/hidpi devices) then `tilePixelRatio`
   * should be set to `2`.
   * @property {number|import("../size.js").Size} [tileSize=[256, 256]] The tile size used by the tile service.
   * @property {import("../Tile.js").UrlFunction} [tileUrlFunction] Optional function to get
   * tile URL given a tile coordinate and the projection.
   * Required if url or urls are not provided.
   * @property {string} [url] URL template. Must include `{x}`, `{y}` or `{-y}`,
   * and `{z}` placeholders. A `{?-?}` template pattern, for example `subdomain{a-f}.domain.com`,
   * may be used instead of defining each one separately in the `urls` option.
   * @property {Array<string>} [urls] An array of URL templates.
   * @property {boolean} [wrapX=true] Whether to wrap the world horizontally.
   * @property {number} [transition] Duration of the opacity transition for rendering.
   * To disable the opacity transition, pass `transition: 0`.
   */


  /**
   * @classdesc
   * Layer source for tile data with URLs in a set XYZ format that are
   * defined in a URL template. By default, this follows the widely-used
   * Google grid where `x` 0 and `y` 0 are in the top left. Grids like
   * TMS where `x` 0 and `y` 0 are in the bottom left can be used by
   * using the `{-y}` placeholder in the URL template, so long as the
   * source does not have a custom tile grid. In this case,
   * {@link module:ol/source/TileImage} can be used with a `tileUrlFunction`
   * such as:
   *
   *  tileUrlFunction: function(coordinate) {
   *    return 'http://mapserver.com/' + coordinate[0] + '/' +
   *        coordinate[1] + '/' + coordinate[2] + '.png';
   *    }
   *
   * @api
   */
  var XYZ = /*@__PURE__*/(function (TileImage) {
    function XYZ(opt_options) {
      var options = opt_options || {};
      var projection = options.projection !== undefined ?
        options.projection : 'EPSG:3857';

      var tileGrid = options.tileGrid !== undefined ? options.tileGrid :
        createXYZ({
          extent: extentFromProjection(projection),
          maxZoom: options.maxZoom,
          minZoom: options.minZoom,
          tileSize: options.tileSize
        });

      TileImage.call(this, {
        attributions: options.attributions,
        cacheSize: options.cacheSize,
        crossOrigin: options.crossOrigin,
        opaque: options.opaque,
        projection: projection,
        reprojectionErrorThreshold: options.reprojectionErrorThreshold,
        tileGrid: tileGrid,
        tileLoadFunction: options.tileLoadFunction,
        tilePixelRatio: options.tilePixelRatio,
        tileUrlFunction: options.tileUrlFunction,
        url: options.url,
        urls: options.urls,
        wrapX: options.wrapX !== undefined ? options.wrapX : true,
        transition: options.transition,
        attributionsCollapsible: options.attributionsCollapsible
      });

    }

    if ( TileImage ) XYZ.__proto__ = TileImage;
    XYZ.prototype = Object.create( TileImage && TileImage.prototype );
    XYZ.prototype.constructor = XYZ;

    return XYZ;
  }(TileImage));

  /**
   * @module ol/source/OSM
   */


  /**
   * The attribution containing a link to the OpenStreetMap Copyright and License
   * page.
   * @const
   * @type {string}
   * @api
   */
  var ATTRIBUTION = '&#169; ' +
        '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
        'contributors.';


  /**
   * @typedef {Object} Options
   * @property {import("./Source.js").AttributionLike} [attributions] Attributions.
   * @property {number} [cacheSize=2048] Cache size.
   * @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
   * you must provide a `crossOrigin` value if you are using the WebGL renderer or if you want to
   * access pixel data with the Canvas renderer.  See
   * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
   * @property {number} [maxZoom=19] Max zoom.
   * @property {boolean} [opaque=true] Whether the layer is opaque.
   * @property {number} [reprojectionErrorThreshold=1.5] Maximum allowed reprojection error (in pixels).
   * Higher values can increase reprojection performance, but decrease precision.
   * @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL. The default is
   * ```js
   * function(imageTile, src) {
   *   imageTile.getImage().src = src;
   * };
   * ```
   * @property {string} [url='https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'] URL template.
   * Must include `{x}`, `{y}` or `{-y}`, and `{z}` placeholders.
   * @property {boolean} [wrapX=true] Whether to wrap the world horizontally.
   */


  /**
   * @classdesc
   * Layer source for the OpenStreetMap tile server.
   * @api
   */
  var OSM = /*@__PURE__*/(function (XYZ) {
    function OSM(opt_options) {

      var options = opt_options || {};

      var attributions;
      if (options.attributions !== undefined) {
        attributions = options.attributions;
      } else {
        attributions = [ATTRIBUTION];
      }

      var crossOrigin = options.crossOrigin !== undefined ?
        options.crossOrigin : 'anonymous';

      var url = options.url !== undefined ?
        options.url : 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      XYZ.call(this, {
        attributions: attributions,
        cacheSize: options.cacheSize,
        crossOrigin: crossOrigin,
        opaque: options.opaque !== undefined ? options.opaque : true,
        maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
        reprojectionErrorThreshold: options.reprojectionErrorThreshold,
        tileLoadFunction: options.tileLoadFunction,
        url: url,
        wrapX: options.wrapX,
        attributionsCollapsible: false
      });

    }

    if ( XYZ ) OSM.__proto__ = XYZ;
    OSM.prototype = Object.create( XYZ && XYZ.prototype );
    OSM.prototype.constructor = OSM;

    return OSM;
  }(XYZ));

  var source = new OSM();
  var view = new View({
    center: fromLonLat([13.73836, 51.049259]),
    zoom: 12
  });
  var view2 = new View({
    center: fromLonLat([13.73836, 51.049259]),
    zoom: 12
  });

  var map = new Map({
    layers: [
      new TileLayer({
        source: source
      })
    ],
    target: 'map',
    view: view
  });

  var map2 = new Map({
    interactions: defaults$1({
      mouseWheelZoom: false
    }),
    layers: [
      new TileLayer({
        source: source
      })
    ],
    target: 'map2',
    view: view2
  });
  map2.getInteractions().insertAt(0, new MouseWheelZoom({
    condition: shiftKeyOnly
  }));

}());
