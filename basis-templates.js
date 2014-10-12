// resources (7):
//  [function] templates.js -> 0.js
//  [function] ../../src/basis/template/html.js -> 1.js
//  [function] ../../src/basis/dom/event.js -> 2.js
//  [function] ../../src/basis/l10n.js -> 3.js
//  [function] ../../src/basis/event.js -> 4.js
//  [function] ../../src/basis/template.js -> 5.js
//  [function] ../../src/basis/template/htmlfgen.js -> 6.js
//
// filelist (1): 
//   templates.js
(function(){
"use strict";

var __namespace_map__ = {"0.js":"templates","1.js":"basis.template.html","2.js":"basis.dom.event","3.js":"basis.l10n","4.js":"basis.event","5.js":"basis.template","6.js":"basis.template.htmlfgen"};
var templates;

var __resources__ = {
  "0.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    basis.require("./1.js");
    var srcMap = [];
    var tmplMap = [];
    function templateWrapper(src) {
      var index = srcMap.indexOf(src);
      if (index != -1) return tmplMap[index];
      var template = new basis.template.html.Template(src);
      srcMap.push(src);
      tmplMap.push(template);
      return template;
    }
    global["bt"] = module.exports = basis.object.extend(templateWrapper, {
      init: function(config) {
        if (!config) return this;
        if (config.noConflict) {
          delete window.bt;
          return this;
        }
      },
      dispose: function(tmpl) {
        var template = basis.template.resolveTemplateById(tmpl.templateId_);
        if (!template) {
          basis.dev.warn("Template is not resolved for ", tmpl);
          return;
        }
        template.clearInstance(tmpl);
      },
      template: templateWrapper
    });
  },
  "1.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    basis.require("./2.js");
    basis.require("./3.js");
    basis.require("./5.js");
    basis.require("./6.js");
    var namespace = this.path;
    var document = global.document;
    var domEvent = basis.dom.event;
    var arrayFrom = basis.array.from;
    var camelize = basis.string.camelize;
    var l10nToken = basis.l10n.token;
    var getFunctions = basis.template.htmlfgen.getFunctions;
    var TemplateSwitchConfig = basis.template.TemplateSwitchConfig;
    var TemplateSwitcher = basis.template.TemplateSwitcher;
    var Template = basis.template.Template;
    var TYPE_ELEMENT = basis.template.TYPE_ELEMENT;
    var TYPE_ATTRIBUTE = basis.template.TYPE_ATTRIBUTE;
    var TYPE_TEXT = basis.template.TYPE_TEXT;
    var TYPE_COMMENT = basis.template.TYPE_COMMENT;
    var TOKEN_TYPE = basis.template.TOKEN_TYPE;
    var TOKEN_BINDINGS = basis.template.TOKEN_BINDINGS;
    var TOKEN_REFS = basis.template.TOKEN_REFS;
    var ATTR_NAME = basis.template.ATTR_NAME;
    var ATTR_VALUE = basis.template.ATTR_VALUE;
    var ATTR_NAME_BY_TYPE = basis.template.ATTR_NAME_BY_TYPE;
    var ELEMENT_NAME = basis.template.ELEMENT_NAME;
    var TEXT_VALUE = basis.template.TEXT_VALUE;
    var COMMENT_VALUE = basis.template.COMMENT_VALUE;
    var eventAttr = /^event-(.+)+/;
    var basisTemplateIdMarker = "basisTemplateId_" + basis.genUID();
    var tmplEventListeners = {};
    var templates = {};
    var namespaceURI = {
      svg: "http://www.w3.org/2000/svg"
    };
    var afterEventAction = {};
    var insideElementEvent = {};
    var MOUSE_ENTER_LEAVE_SUPPORT = "onmouseenter" in document.documentElement;
    var CAPTURE_FALLBACK = !document.addEventListener && "__basisTemplate" + parseInt(1e9 * Math.random());
    if (CAPTURE_FALLBACK) global[CAPTURE_FALLBACK] = function(eventName, event) {
      domEvent.fireEvent(document, eventName);
      event.returnValue = true;
      var listener = tmplEventListeners[eventName];
      if (listener) listener(new domEvent.Event(event));
    };
    var CLONE_NORMALIZATION_TEXT_BUG = function() {
      var element = document.createElement("div");
      element.appendChild(document.createTextNode("a"));
      element.appendChild(document.createTextNode("a"));
      return element.cloneNode(true).childNodes.length == 1;
    }();
    var SET_CLASS_ATTRIBUTE_BUG = function() {
      var element = document.createElement("div");
      element.setAttribute("class", "a");
      return !element.className;
    }();
    var SET_STYLE_ATTRIBUTE_BUG = function() {
      var element = document.createElement("div");
      element.setAttribute("style", "position:absolute");
      return element.style.position != "absolute";
    }();
    var IS_SET_STYLE_SAFE = !!function() {
      try {
        return document.documentElement.style.color = "x";
      } catch (e) {}
    }();
    if (typeof Node != "undefined" && !Node.prototype.contains) Node.prototype.contains = function(child) {
      return !!(this.compareDocumentPosition(child) & 16);
    };
    var l10nTemplates = {};
    function getL10nTemplate(token) {
      var template = basis.template.getL10nTemplate(token);
      var id = template.templateId;
      var htmlTemplate = l10nTemplates[id];
      if (!htmlTemplate) htmlTemplate = l10nTemplates[id] = new HtmlTemplate(template.source);
      return htmlTemplate;
    }
    function createEventHandler(attrName) {
      return function(event) {
        if (event.type == "click" && event.which == 3) return;
        var bubble = insideElementEvent[event.type] || event.type != "mouseenter" && event.type != "mouseleave";
        var attrCursor = event.sender;
        var attr;
        while (attrCursor) {
          attr = attrCursor.getAttribute && attrCursor.getAttribute(attrName);
          if (!bubble || typeof attr == "string") break;
          attrCursor = attrCursor.parentNode;
        }
        if (typeof attr == "string") {
          var cursor = attrCursor;
          var actionTarget = cursor;
          var refId;
          var tmplRef;
          if (insideElementEvent[event.type]) {
            var relTarget = event.relatedTarget;
            if (relTarget && (cursor === relTarget || cursor.contains(relTarget))) cursor = null;
          }
          while (cursor) {
            refId = cursor[basisTemplateIdMarker];
            if (typeof refId == "number") {
              if (tmplRef = resolveInstanceById(refId)) break;
            }
            cursor = cursor.parentNode;
          }
          if (tmplRef && tmplRef.action) {
            var actions = attr.trim().split(/\s+/);
            event.actionTarget = actionTarget;
            for (var i = 0, actionName; actionName = actions[i++]; ) switch (actionName) {
              case "prevent-default":
                event.preventDefault();
                break;
              case "stop-propagation":
                event.stopPropagation();
                break;
              default:
                tmplRef.action.call(tmplRef.context, actionName, event);
            }
          }
        }
        if (event.type in afterEventAction) afterEventAction[event.type](event, attrCursor);
      };
    }
    var buildHtml = function(tokens, parent) {
      function emulateEvent(origEventName, emulEventName) {
        regEventHandler(emulEventName);
        insideElementEvent[origEventName] = true;
        afterEventAction[emulEventName] = function(event) {
          event = new domEvent.Event(event);
          event.type = origEventName;
          tmplEventListeners[origEventName](event);
        };
        afterEventAction[origEventName] = function(event, cursor) {
          cursor = cursor && cursor.parentNode;
          if (cursor) {
            event = new domEvent.Event(event);
            event.type = origEventName;
            event.sender = cursor;
            tmplEventListeners[origEventName](event);
          }
        };
      }
      function regEventHandler(eventName) {
        if (!tmplEventListeners[eventName]) {
          tmplEventListeners[eventName] = createEventHandler("event-" + eventName);
          if (!CAPTURE_FALLBACK) {
            if (!MOUSE_ENTER_LEAVE_SUPPORT && eventName == "mouseenter") return emulateEvent(eventName, "mouseover");
            if (!MOUSE_ENTER_LEAVE_SUPPORT && eventName == "mouseleave") return emulateEvent(eventName, "mouseout");
            for (var i = 0, names = domEvent.browserEvents(eventName), browserEventName; browserEventName = names[i]; i++) domEvent.addGlobalHandler(browserEventName, tmplEventListeners[eventName]);
          }
        }
      }
      function setEventAttribute(eventName, actions) {
        regEventHandler(eventName);
        if (CAPTURE_FALLBACK) result.setAttribute("on" + eventName, CAPTURE_FALLBACK + '("' + eventName + '",event)');
        result.setAttribute("event-" + eventName, actions);
      }
      function setAttribute(name, value) {
        if (SET_CLASS_ATTRIBUTE_BUG && name == "class") name = "className";
        if (SET_STYLE_ATTRIBUTE_BUG && name == "style") return result.style.cssText = value;
        result.setAttribute(name, value);
      }
      var result = parent || document.createDocumentFragment();
      for (var i = parent ? 4 : 0, token; token = tokens[i]; i++) {
        switch (token[TOKEN_TYPE]) {
          case TYPE_ELEMENT:
            var tagName = token[ELEMENT_NAME];
            var parts = tagName.split(/:/);
            var element = parts.length > 1 ? document.createElementNS(namespaceURI[parts[0]], tagName) : document.createElement(tagName);
            buildHtml(token, element);
            result.appendChild(element);
            break;
          case TYPE_ATTRIBUTE:
            var attrName = token[ATTR_NAME];
            var attrValue = token[ATTR_VALUE];
            var eventName = attrName.replace(/^event-/, "");
            if (eventName != attrName) {
              setEventAttribute(eventName, attrValue);
            } else {
              if (attrName != "class" && attrName != "style" ? !token[TOKEN_BINDINGS] : attrValue) setAttribute(attrName, attrValue || "");
            }
            break;
          case 4:
          case 5:
            var attrValue = token[ATTR_VALUE - 1];
            if (attrValue) setAttribute(ATTR_NAME_BY_TYPE[token[TOKEN_TYPE]], attrValue);
            break;
          case 6:
            setEventAttribute(token[1], token[2] || token[1]);
            break;
          case TYPE_COMMENT:
            result.appendChild(document.createComment(token[COMMENT_VALUE] || (token[TOKEN_REFS] ? "{" + token[TOKEN_REFS].join("|") + "}" : "")));
            break;
          case TYPE_TEXT:
            if (CLONE_NORMALIZATION_TEXT_BUG && i && tokens[i - 1][TOKEN_TYPE] == TYPE_TEXT) result.appendChild(document.createComment(""));
            result.appendChild(document.createTextNode(token[TEXT_VALUE] || (token[TOKEN_REFS] ? "{" + token[TOKEN_REFS].join("|") + "}" : "") || (token[TOKEN_BINDINGS] ? "{" + token[TOKEN_BINDINGS] + "}" : "")));
            break;
        }
      }
      if (!parent && tokens.length == 1) result = result.firstChild;
      return result;
    };
    function resolveTemplateById(refId) {
      var templateId = refId & 4095;
      var object = templates[templateId];
      return object && object.template;
    }
    function resolveInstanceById(refId) {
      var templateId = refId & 4095;
      var instanceId = refId >> 12;
      var object = templates[templateId];
      return object && object.instances[instanceId];
    }
    function resolveObjectById(refId) {
      var templateRef = resolveInstanceById(refId);
      return templateRef && templateRef.context;
    }
    function resolveTmplById(refId) {
      var templateRef = resolveInstanceById(refId);
      return templateRef && templateRef.tmpl;
    }
    function getDebugInfoById(refId) {
      var templateRef = resolveInstanceById(refId);
      return templateRef && templateRef.debug && templateRef.debug();
    }
    var builder = function() {
      var WHITESPACE = /\s+/;
      var W3C_DOM_NODE_SUPPORTED = typeof Node == "function" && document instanceof Node;
      var CLASSLIST_SUPPORTED = global.DOMTokenList && document && document.documentElement.classList instanceof global.DOMTokenList;
      var bind_node = W3C_DOM_NODE_SUPPORTED ? function(domRef, oldNode, newValue) {
        var newNode = newValue && newValue instanceof Node ? newValue : domRef;
        if (newNode !== oldNode) oldNode.parentNode.replaceChild(newNode, oldNode);
        return newNode;
      } : function(domRef, oldNode, newValue) {
        var newNode = newValue && typeof newValue == "object" ? newValue : domRef;
        if (newNode !== oldNode) {
          try {
            oldNode.parentNode.replaceChild(newNode, oldNode);
          } catch (e) {
            newNode = domRef;
            if (oldNode !== newNode) oldNode.parentNode.replaceChild(newNode, oldNode);
          }
        }
        return newNode;
      };
      var bind_element = function(domRef, oldNode, newValue) {
        var newNode = bind_node(domRef, oldNode, newValue);
        if (newNode === domRef && typeof newValue == "string") domRef.innerHTML = newValue;
        return newNode;
      };
      var bind_comment = bind_node;
      var bind_textNode = function(domRef, oldNode, newValue) {
        var newNode = bind_node(domRef, oldNode, newValue);
        if (newNode === domRef) domRef.nodeValue = newValue;
        return newNode;
      };
      var bind_attrClass = CLASSLIST_SUPPORTED ? function(domRef, oldClass, newValue, prefix, anim) {
        var newClass = newValue ? prefix + newValue : "";
        if (newClass != oldClass) {
          if (oldClass) domRef.classList.remove(oldClass);
          if (newClass) {
            domRef.classList.add(newClass);
            if (anim) {
              domRef.classList.add(newClass + "-anim");
              basis.nextTick(function() {
                domRef.classList.remove(newClass + "-anim");
              });
            }
          }
        }
        return newClass;
      } : function(domRef, oldClass, newValue, prefix, anim) {
        var newClass = newValue ? prefix + newValue : "";
        if (newClass != oldClass) {
          var className = domRef.className;
          var classNameIsObject = typeof className != "string";
          var classList;
          if (classNameIsObject) className = className.baseVal;
          classList = className.split(WHITESPACE);
          if (oldClass) basis.array.remove(classList, oldClass);
          if (newClass) {
            classList.push(newClass);
            if (anim) {
              basis.array.add(classList, newClass + "-anim");
              basis.nextTick(function() {
                var classList = (classNameIsObject ? domRef.className.baseVal : domRef.className).split(WHITESPACE);
                basis.array.remove(classList, newClass + "-anim");
                if (classNameIsObject) domRef.className.baseVal = classList.join(" "); else domRef.className = classList.join(" ");
              });
            }
          }
          if (classNameIsObject) domRef.className.baseVal = classList.join(" "); else domRef.className = classList.join(" ");
        }
        return newClass;
      };
      var bind_attrStyle = IS_SET_STYLE_SAFE ? function(domRef, propertyName, oldValue, newValue) {
        if (oldValue !== newValue) domRef.style[camelize(propertyName)] = newValue;
        return newValue;
      } : function(domRef, propertyName, oldValue, newValue) {
        if (oldValue !== newValue) {
          try {
            domRef.style[camelize(propertyName)] = newValue;
          } catch (e) {}
        }
        return newValue;
      };
      var bind_attr = function(domRef, attrName, oldValue, newValue) {
        if (oldValue !== newValue) {
          if (newValue) domRef.setAttribute(attrName, newValue); else domRef.removeAttribute(attrName);
        }
        return newValue;
      };
      function updateAttach() {
        this.set(this.name, this.value);
      }
      function resolveValue(bindingName, value, Attaches) {
        var bridge = value && value.bindingBridge;
        var oldAttach = this.attaches && this.attaches[bindingName];
        var tmpl = null;
        if (bridge || oldAttach) {
          if (bridge) {
            if (!oldAttach || value !== oldAttach.value) {
              if (oldAttach) {
                if (oldAttach.tmpl) {
                  oldAttach.tmpl.element.toString = null;
                  getL10nTemplate(oldAttach.value).clearInstance(oldAttach.tmpl);
                }
                oldAttach.value.bindingBridge.detach(oldAttach.value, updateAttach, oldAttach);
              }
              if (value.type == "markup" && value instanceof basis.l10n.Token) {
                var template = getL10nTemplate(value);
                var context = this.context;
                var bindings = this.bindings;
                var bindingInterface = this.bindingInterface;
                tmpl = template.createInstance(context, null, function onRebuild() {
                  tmpl = newAttach.tmpl = template.createInstance(context, null, onRebuild, bindings, bindingInterface);
                  tmpl.element.toString = function() {
                    return value.value;
                  };
                  updateAttach.call(newAttach);
                }, bindings, bindingInterface);
                tmpl.element.toString = function() {
                  return value.value;
                };
              }
              if (!this.attaches) this.attaches = new Attaches;
              var newAttach = this.attaches[bindingName] = {
                name: bindingName,
                value: value,
                tmpl: tmpl,
                set: this.tmpl.set
              };
              bridge.attach(value, updateAttach, newAttach);
            } else tmpl = value && value.type == "markup" ? oldAttach.tmpl : null;
            if (tmpl) return tmpl.element;
            value = bridge.get(value);
          } else {
            if (oldAttach) {
              if (oldAttach.tmpl) {
                oldAttach.tmpl.element.toString = null;
                getL10nTemplate(oldAttach.value).clearInstance(oldAttach.tmpl);
              }
              oldAttach.value.bindingBridge.detach(oldAttach.value, updateAttach, oldAttach);
              this.attaches[bindingName] = null;
            }
          }
        }
        return value;
      }
      function createBindingUpdater(names, getters) {
        var name1 = names[0];
        var name2 = names[1];
        var getter1 = getters[name1];
        var getter2 = getters[name2];
        switch (names.length) {
          case 1:
            return function bindingUpdater1(object) {
              this(name1, getter1(object));
            };
          case 2:
            return function bindingUpdater2(object) {
              this(name1, getter1(object));
              this(name2, getter2(object));
            };
          default:
            var getters_ = names.map(function(name) {
              return getters[name];
            });
            return function bindingUpdaterN(object) {
              for (var i = 0; i < names.length; i++) this(names[i], getters_[i](object));
            };
        }
      }
      function makeHandler(events, getters) {
        for (var name in events) events[name] = createBindingUpdater(events[name], getters);
        return name ? events : null;
      }
      function createBindingFunction(keys) {
        var bindingCache = {};
        return function getBinding(bindings, obj, set, bindingInterface) {
          if (!bindings) return {};
          var cacheId = "bindingId" in bindings ? bindings.bindingId : null;
          if (!cacheId) basis.dev.warn("basis.template.Template.getBinding: bindings has no bindingId property, cache is not used");
          var result = bindingCache[cacheId];
          if (!result) {
            var names = [];
            var getters = {};
            var events = {};
            for (var i = 0, bindingName; bindingName = keys[i]; i++) {
              var binding = bindings[bindingName];
              var getter = binding && binding.getter;
              if (getter) {
                getters[bindingName] = getter;
                names.push(bindingName);
                if (binding.events) {
                  var eventList = String(binding.events).trim().split(/\s+|\s*,\s*/);
                  for (var j = 0, eventName; eventName = eventList[j]; j++) {
                    if (events[eventName]) events[eventName].push(bindingName); else events[eventName] = [ bindingName ];
                  }
                }
              }
            }
            result = {
              names: names,
              sync: createBindingUpdater(names, getters),
              handler: makeHandler(events, getters)
            };
            if (cacheId) bindingCache[cacheId] = result;
          }
          if (obj && set) result.sync.call(set, obj);
          if (!bindingInterface) return;
          if (result.handler) bindingInterface.attach(obj, result.handler, set);
          return result.handler;
        };
      }
      var tools = {
        bind_textNode: bind_textNode,
        bind_node: bind_node,
        bind_element: bind_element,
        bind_comment: bind_comment,
        bind_attr: bind_attr,
        bind_attrClass: bind_attrClass,
        bind_attrStyle: bind_attrStyle,
        resolve: resolveValue,
        l10nToken: l10nToken,
        createBindingFunction: createBindingFunction
      };
      return function(tokens) {
        var fn = getFunctions(tokens, true, this.source.url, tokens.source_, !CLONE_NORMALIZATION_TEXT_BUG, basisTemplateIdMarker);
        var createInstance;
        var instances = {};
        var l10nMap = {};
        var l10nLinks = [];
        var seed = 0;
        var proto = buildHtml(tokens);
        var id = this.templateId;
        templates[id] = {
          template: this,
          instances: instances
        };
        if (fn.createL10nSync) {
          var l10nProtoSync = fn.createL10nSync(proto, l10nMap, bind_attr, CLONE_NORMALIZATION_TEXT_BUG);
          for (var i = 0, key; key = fn.l10nKeys[i]; i++) l10nProtoSync(key, l10nToken(key).value);
          if (fn.l10nKeys) for (var i = 0, key; key = fn.l10nKeys[i]; i++) {
            var link = {
              path: key,
              token: l10nToken(key),
              handler: function(value) {
                l10nProtoSync(this.path, value);
                for (var key in instances) instances[key].tmpl.set(this.path, value);
              }
            };
            link.token.attach(link.handler, link);
            l10nLinks.push(link);
            link = null;
          }
        }
        createInstance = fn.createInstance(id, instances, proto, tools, l10nMap, CLONE_NORMALIZATION_TEXT_BUG);
        return {
          createInstance: function(obj, onAction, onRebuild, bindings, bindingInterface) {
            var instanceId = seed++;
            var instance = createInstance(instanceId, obj, onAction, onRebuild, bindings, bindingInterface);
            instances[instanceId] = instance;
            return instance.tmpl;
          },
          destroyInstance: function(tmpl) {
            var instanceId = tmpl.templateId_;
            var instance = instances[instanceId];
            if (instance) {
              if (instance.handler) instance.bindingInterface.detach(instance.context, instance.handler, instance.tmpl.set);
              for (var key in instance.attaches) resolveValue.call(instance, key, null);
              delete instances[instanceId];
            }
          },
          keys: fn.keys,
          instances_: instances,
          destroy: function(rebuild) {
            for (var i = 0, link; link = l10nLinks[i]; i++) link.token.detach(link.handler, link);
            for (var key in instances) {
              var instance = instances[key];
              if (rebuild && instance.rebuild) instance.rebuild.call(instance.context);
              if (!rebuild || key in instances) {
                if (instance.handler) instance.bindingInterface.detach(instance.context, instance.handler, instance.tmpl.set);
                for (var key in instance.attaches) resolveValue.call(key, null);
              }
            }
            if (templates[id] && templates[id].instances === instances) delete templates[id];
            fn = null;
            proto = null;
            l10nMap = null;
            l10nLinks = null;
            l10nProtoSync = null;
            instances = null;
          }
        };
      };
    }();
    var HtmlTemplate = Template.subclass({
      className: namespace + ".Template",
      __extend__: function(value) {
        if (value instanceof HtmlTemplate) return value;
        if (value instanceof TemplateSwitchConfig) return new HtmlTemplateSwitcher(value);
        return new HtmlTemplate(value);
      },
      builder: builder
    });
    var HtmlTemplateSwitcher = TemplateSwitcher.subclass({
      className: namespace + ".TemplateSwitcher",
      templateClass: HtmlTemplate
    });
    module.exports = {
      marker: basisTemplateIdMarker,
      Template: HtmlTemplate,
      TemplateSwitcher: HtmlTemplateSwitcher
    };
    basis.template.extend({
      getDebugInfoById: getDebugInfoById,
      buildHtml: buildHtml,
      resolveTemplateById: resolveTemplateById,
      resolveObjectById: resolveObjectById,
      resolveTmplById: resolveTmplById
    });
  },
  "2.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    var namespace = this.path;
    var document = global.document;
    var $null = basis.fn.$null;
    var arrayFrom = basis.array.from;
    var W3CSUPPORT = !!document.addEventListener;
    var EVENT_HOLDER = "__basisEvents";
    var KEY = {
      BACKSPACE: 8,
      TAB: 9,
      CTRL_ENTER: 10,
      ENTER: 13,
      SHIFT: 16,
      CTRL: 17,
      ALT: 18,
      ESC: 27,
      ESCAPE: 27,
      SPACE: 32,
      PAGEUP: 33,
      PAGEDOWN: 34,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      INSERT: 45,
      DELETE: 46,
      F1: 112,
      F2: 113,
      F3: 114,
      F4: 115,
      F5: 116,
      F6: 117,
      F7: 118,
      F8: 119,
      F9: 120,
      F10: 121,
      F11: 122,
      F12: 123
    };
    var MOUSE_LEFT = {
      VALUE: 1,
      BIT: 1
    };
    var MOUSE_MIDDLE = {
      VALUE: 2,
      BIT: 4
    };
    var MOUSE_RIGHT = {
      VALUE: 3,
      BIT: 2
    };
    var BROWSER_EVENTS = {
      mousewheel: [ "mousewheel", "DOMMouseScroll" ]
    };
    function browserEvents(eventName) {
      return BROWSER_EVENTS[eventName] || [ eventName ];
    }
    var Event = basis.Class(null, {
      className: namespace + ".Event",
      KEY: KEY,
      init: function(event) {
        event = wrap(event);
        for (var name in event) if (name != "returnValue" && name != "keyLocation" && name != "layerX" && name != "layerY") if (typeof event[name] != "function" && name in this == false) this[name] = event[name];
        var target = sender(event);
        basis.object.extend(this, {
          event_: event,
          sender: target,
          target: target,
          key: key(event),
          charCode: charCode(event),
          mouseLeft: mouseButton(event, MOUSE_LEFT),
          mouseMiddle: mouseButton(event, MOUSE_MIDDLE),
          mouseRight: mouseButton(event, MOUSE_RIGHT),
          mouseX: mouseX(event),
          mouseY: mouseY(event),
          wheelDelta: wheelDelta(event)
        });
      },
      stopBubble: function() {
        cancelBubble(this.event_);
      },
      stopPropagation: function() {
        cancelBubble(this.event_);
      },
      preventDefault: function() {
        cancelDefault(this.event_);
      },
      die: function() {
        this.stopBubble();
        this.preventDefault();
      }
    });
    function wrap(event) {
      return event instanceof Event ? event.event_ : event || global.event;
    }
    function getNode(ref) {
      return typeof ref == "string" ? document.getElementById(ref) : ref;
    }
    function sender(event) {
      var target = event.target || event.srcElement || document;
      return target.nodeType == 3 ? target.parentNode : target;
    }
    function cancelBubble(event) {
      if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
    }
    function cancelDefault(event) {
      if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
    }
    function kill(event, node) {
      node = getNode(node);
      if (node) addHandler(node, event, kill); else {
        cancelDefault(event);
        cancelBubble(event);
      }
    }
    function key(event) {
      return event.keyCode || event.which || 0;
    }
    function charCode(event) {
      return event.charCode || event.keyCode || 0;
    }
    function mouseButton(event, button) {
      if (typeof event.which == "number") return event.which == button.VALUE; else return !!(event.button & button.BIT);
    }
    function mouseX(event) {
      if (event.changedTouches) return event.changedTouches[0].pageX; else if ("pageX" in event) return event.pageX; else return "clientX" in event ? event.clientX + (document.compatMode == "CSS1Compat" ? document.documentElement.scrollLeft : document.body.scrollLeft) : 0;
    }
    function mouseY(event) {
      if (event.changedTouches) return event.changedTouches[0].pageY; else if ("pageY" in event) return event.pageY; else return "clientY" in event ? event.clientY + (document.compatMode == "CSS1Compat" ? document.documentElement.scrollTop : document.body.scrollTop) : 0;
    }
    function wheelDelta(event) {
      var delta = 0;
      if ("wheelDelta" in event) delta = event.wheelDelta; else if (event.type == "DOMMouseScroll") delta = -event.detail;
      return delta && delta / Math.abs(delta);
    }
    var globalHandlers = {};
    var captureHandlers = {};
    var noCaptureScheme = !W3CSUPPORT;
    function observeGlobalEvents(event) {
      var handlers = arrayFrom(globalHandlers[event.type]);
      var captureHandler = captureHandlers[event.type];
      var wrappedEvent = new Event(event);
      if (captureHandler) {
        captureHandler.handler.call(captureHandler.thisObject, wrappedEvent);
        kill(event);
        return;
      }
      if (handlers) {
        for (var i = handlers.length; i-- > 0; ) {
          var handlerObject = handlers[i];
          handlerObject.handler.call(handlerObject.thisObject, wrappedEvent);
        }
      }
    }
    function captureEvent(eventType, handler, thisObject) {
      if (captureHandlers[eventType]) releaseEvent(eventType);
      addGlobalHandler(eventType, handler, thisObject);
      captureHandlers[eventType] = {
        handler: handler,
        thisObject: thisObject
      };
    }
    function releaseEvent(eventType) {
      var handlerObject = captureHandlers[eventType];
      if (handlerObject) {
        removeGlobalHandler(eventType, handlerObject.handler, handlerObject.thisObject);
        delete captureHandlers[eventType];
      }
    }
    function addGlobalHandler(eventType, handler, thisObject) {
      var handlers = globalHandlers[eventType];
      if (handlers) {
        for (var i = 0, item; item = handlers[i]; i++) if (item.handler === handler && item.thisObject === thisObject) return;
      } else {
        if (noCaptureScheme) addHandler(document, eventType, $null); else document.addEventListener(eventType, observeGlobalEvents, true);
        handlers = globalHandlers[eventType] = [];
      }
      handlers.push({
        handler: handler,
        thisObject: thisObject
      });
    }
    function removeGlobalHandler(eventType, handler, thisObject) {
      var handlers = globalHandlers[eventType];
      if (handlers) {
        for (var i = 0, item; item = handlers[i]; i++) {
          if (item.handler === handler && item.thisObject === thisObject) {
            handlers.splice(i, 1);
            if (!handlers.length) {
              delete globalHandlers[eventType];
              if (noCaptureScheme) removeHandler(document, eventType, $null); else document.removeEventListener(eventType, observeGlobalEvents, true);
            }
            return;
          }
        }
      }
    }
    function addHandler(node, eventType, handler, thisObject) {
      node = getNode(node);
      if (!node) throw "basis.event.addHandler: can't attach event listener to undefined";
      if (typeof handler != "function") throw "basis.event.addHandler: handler is not a function";
      if (!node[EVENT_HOLDER]) node[EVENT_HOLDER] = {};
      var handlerObject = {
        handler: handler,
        thisObject: thisObject
      };
      var handlers = node[EVENT_HOLDER];
      var eventTypeHandlers = handlers[eventType];
      if (!eventTypeHandlers) {
        eventTypeHandlers = handlers[eventType] = [ handlerObject ];
        eventTypeHandlers.fireEvent = function(event) {
          event = wrap(event);
          if (noCaptureScheme && event && globalHandlers[eventType]) {
            if (typeof event.returnValue == "undefined") {
              observeGlobalEvents(event);
              if (event.cancelBubble === true) return;
              if (typeof event.returnValue == "undefined") event.returnValue = true;
            }
          }
          for (var i = 0, wrappedEvent = new Event(event), item; item = eventTypeHandlers[i++]; ) item.handler.call(item.thisObject, wrappedEvent);
        };
        if (W3CSUPPORT) node.addEventListener(eventType, eventTypeHandlers.fireEvent, false); else node.attachEvent("on" + eventType, eventTypeHandlers.fireEvent);
      } else {
        for (var i = 0, item; item = eventTypeHandlers[i]; i++) if (item.handler === handler && item.thisObject === thisObject) return;
        eventTypeHandlers.push(handlerObject);
      }
    }
    function addHandlers(node, handlers, thisObject) {
      node = getNode(node);
      for (var eventType in handlers) addHandler(node, eventType, handlers[eventType], thisObject);
    }
    function removeHandler(node, eventType, handler, thisObject) {
      node = getNode(node);
      var handlers = node[EVENT_HOLDER];
      if (handlers) {
        var eventTypeHandlers = handlers[eventType];
        if (eventTypeHandlers) {
          for (var i = 0, item; item = eventTypeHandlers[i]; i++) {
            if (item.handler === handler && item.thisObject === thisObject) {
              eventTypeHandlers.splice(i, 1);
              if (!eventTypeHandlers.length) clearHandlers(node, eventType);
              return;
            }
          }
        }
      }
    }
    function clearHandlers(node, eventType) {
      node = getNode(node);
      var handlers = node[EVENT_HOLDER];
      if (handlers) {
        if (typeof eventType != "string") {
          for (eventType in handlers) clearHandlers(node, eventType);
        } else {
          var eventTypeHandlers = handlers[eventType];
          if (eventTypeHandlers) {
            if (node.removeEventListener) node.removeEventListener(eventType, eventTypeHandlers.fireEvent, false); else node.detachEvent("on" + eventType, eventTypeHandlers.fireEvent);
            delete handlers[eventType];
          }
        }
      }
    }
    function fireEvent(node, eventType, event) {
      node = getNode(node);
      var handlers = node[EVENT_HOLDER];
      if (handlers && handlers[eventType]) handlers[eventType].fireEvent(event);
    }
    function onUnload(handler, thisObject) {
      addHandler(global, "unload", handler, thisObject);
    }
    var tagNameEventMap = {};
    function getEventInfo(eventName, tagName) {
      if (!tagName) tagName = "div";
      var id = tagName + "-" + eventName;
      if (tagNameEventMap[id]) return tagNameEventMap[id]; else {
        var supported = false;
        var bubble = false;
        if (!W3CSUPPORT) {
          var onevent = "on" + eventName;
          var host = document.createElement("div");
          var target = host.appendChild(document.createElement(tagName));
          host[onevent] = function() {
            bubble = true;
          };
          try {
            target.fireEvent(onevent);
            supported = true;
          } catch (e) {}
        }
        return tagNameEventMap[id] = {
          supported: supported,
          bubble: bubble
        };
      }
    }
    function wrapEventFunction(fn) {
      return function(event, arg) {
        return fn(wrap(event), arg);
      };
    }
    module.exports = {
      W3CSUPPORT: W3CSUPPORT,
      browserEvents: browserEvents,
      getEventInfo: getEventInfo,
      KEY: KEY,
      MOUSE_LEFT: MOUSE_LEFT,
      MOUSE_RIGHT: MOUSE_RIGHT,
      MOUSE_MIDDLE: MOUSE_MIDDLE,
      Event: Event,
      sender: wrapEventFunction(sender),
      cancelBubble: wrapEventFunction(cancelBubble),
      cancelDefault: wrapEventFunction(cancelDefault),
      kill: wrapEventFunction(kill),
      key: wrapEventFunction(key),
      charCode: wrapEventFunction(charCode),
      mouseButton: wrapEventFunction(mouseButton),
      mouseX: wrapEventFunction(mouseX),
      mouseY: wrapEventFunction(mouseY),
      wheelDelta: wrapEventFunction(wheelDelta),
      addGlobalHandler: addGlobalHandler,
      removeGlobalHandler: removeGlobalHandler,
      captureEvent: captureEvent,
      releaseEvent: releaseEvent,
      addHandler: addHandler,
      addHandlers: addHandlers,
      removeHandler: removeHandler,
      clearHandlers: clearHandlers,
      fireEvent: fireEvent,
      onUnload: onUnload,
      wrap: wrap
    };
  },
  "3.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    basis.require("./4.js");
    var namespace = this.path;
    var Class = basis.Class;
    var Emitter = basis.event.Emitter;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    basis.resource.extensions[".l10n"] = function(content, url) {
      return resolveDictionary(url).update(basis.resource.extensions[".json"](content, url));
    };
    function ownKeys(object) {
      var result = [];
      for (var key in object) if (hasOwnProperty.call(object, key)) result.push(key);
      return result;
    }
    var tokenIndex = [];
    var tokenComputeFn = {};
    var tokenComputes = {};
    var updateToken = basis.Token.prototype.set;
    var ComputeToken = Class(basis.Token, {
      className: namespace + ".ComputeToken",
      init: function(value, token) {
        token.computeTokens[this.basisObjectId] = this;
        this.token = token;
        basis.Token.prototype.init.call(this, value);
      },
      get: function() {
        var key = this.token.type == "plural" ? cultures[currentCulture].plural(this.value) : this.value;
        return this.token.dictionary.getValue(this.token.name + "." + key);
      },
      toString: function() {
        return this.get();
      },
      destroy: function() {
        delete this.token.computeTokens[this.basisObjectId];
        this.token = null;
        basis.Token.prototype.destroy.call(this);
      }
    });
    var Token = Class(basis.Token, {
      className: namespace + ".Token",
      index: NaN,
      dictionary: null,
      name: "",
      type: "default",
      computeTokens: null,
      init: function(dictionary, tokenName, type, value) {
        basis.Token.prototype.init.call(this, value);
        this.index = tokenIndex.push(this) - 1;
        this.name = tokenName;
        this.dictionary = dictionary;
        this.computeTokens = {};
        if (type) this.setType(type); else this.apply();
      },
      toString: function() {
        return this.get();
      },
      apply: function() {
        for (var key in this.computeTokens) this.computeTokens[key].apply();
        basis.Token.prototype.apply.call(this);
      },
      set: function() {
        basis.dev.warn("basis.l10n: Value for l10n token can't be set directly, but through dictionary update only");
      },
      setType: function(type) {
        if (type != "plural" && (!basis.l10n.enableMarkup || type != "markup")) type = "default";
        if (this.type != type) {
          this.type = type;
          this.apply();
        }
      },
      compute: function(events, getter) {
        if (arguments.length == 1) {
          getter = events;
          events = "";
        }
        getter = basis.getter(getter);
        events = String(events).trim().split(/\s+|\s*,\s*/).sort();
        var tokenId = this.basisObjectId;
        var enumId = events.concat(tokenId, getter[basis.getter.ID]).join("_");
        if (tokenComputeFn[enumId]) return tokenComputeFn[enumId];
        var token = this;
        var objectTokenMap = {};
        var updateValue = function(object) {
          updateToken.call(this, getter(object));
        };
        var handler = {
          destroy: function(object) {
            delete objectTokenMap[object.basisObjectId];
            this.destroy();
          }
        };
        for (var i = 0, eventName; eventName = events[i]; i++) if (eventName != "destroy") handler[eventName] = updateValue;
        return tokenComputeFn[enumId] = function(object) {
          if (object instanceof Emitter == false) throw "basis.l10n.Token#compute: object must be an instanceof Emitter";
          var objectId = object.basisObjectId;
          var computeToken = objectTokenMap[objectId];
          if (!computeToken) {
            computeToken = objectTokenMap[objectId] = new ComputeToken(getter(object), token);
            object.addHandler(handler, computeToken);
          }
          return computeToken;
        };
      },
      computeToken: function(value) {
        return new ComputeToken(value, this);
      },
      token: function(name) {
        if (this.type == "plural") name = cultures[currentCulture].plural(name);
        if (this.dictionary) return this.dictionary.token(this.name + "." + name);
      },
      destroy: function() {
        for (var key in this.computeTokens) this.computeTokens[key].destroy();
        this.computeTokens = null;
        this.value = null;
        basis.Token.prototype.destroy.call(this);
      }
    });
    function resolveToken(path) {
      if (path.charAt(0) == "#") {
        return tokenIndex[parseInt(path.substr(1), 36)];
      } else {
        var parts = path.match(/^(.+?)@(.+)$/);
        if (parts) return resolveDictionary(basis.path.resolve(parts[2])).token(parts[1]);
        basis.dev.warn("basis.l10n.token accepts token references in format `token.path@path/to/dict.l10n` only");
      }
    }
    var dictionaries = [];
    var dictionaryByUrl = {};
    var createDictionaryNotifier = new basis.Token;
    function walkTokens(dictionary, culture, tokens, path) {
      var cultureValues = dictionary.cultureValues[culture];
      path = path ? path + "." : "";
      for (var name in tokens) if (hasOwnProperty.call(tokens, name)) {
        var tokenName = path + name;
        var tokenValue = tokens[name];
        cultureValues[tokenName] = tokenValue;
        if (tokenValue && (typeof tokenValue == "object" || Array.isArray(tokenValue))) walkTokens(dictionary, culture, tokenValue, tokenName);
      }
    }
    var Dictionary = Class(null, {
      className: namespace + ".Dictionary",
      tokens: null,
      types: null,
      cultureValues: null,
      index: NaN,
      resource: null,
      init: function(content) {
        this.tokens = {};
        this.types = {};
        this.cultureValues = {};
        this.index = dictionaries.push(this) - 1;
        if (basis.resource.isResource(content)) {
          var resource = content;
          this.resource = resource;
          if (!dictionaryByUrl[resource.url]) {
            dictionaryByUrl[resource.url] = this;
            createDictionaryNotifier.set(resource.url);
          }
          resource.fetch();
        } else {
          basis.dev.warn("Use object as content of dictionary is experimental and not production-ready");
          this.update(content || {});
        }
      },
      update: function(data) {
        if (!data) data = {};
        this.cultureValues = {};
        for (var culture in data) if (!/^_|_$/.test(culture)) {
          this.cultureValues[culture] = {};
          walkTokens(this, culture, data[culture]);
        }
        this.types = data._meta && data._meta.type || {};
        for (var key in this.tokens) this.tokens[key].setType(this.types[key]);
        this.syncValues();
        return this;
      },
      syncValues: function() {
        for (var tokenName in this.tokens) updateToken.call(this.tokens[tokenName], this.getValue(tokenName));
      },
      getValue: function(tokenName) {
        var fallback = cultureFallback[currentCulture] || [];
        for (var i = 0, cultureName; cultureName = fallback[i]; i++) {
          var cultureValues = this.cultureValues[cultureName];
          if (cultureValues && tokenName in cultureValues) return cultureValues[tokenName];
        }
      },
      getCultureValue: function(culture, tokenName) {
        return this.cultureValues[culture] && this.cultureValues[culture][tokenName];
      },
      token: function(tokenName) {
        var token = this.tokens[tokenName];
        if (!token) {
          token = this.tokens[tokenName] = new Token(this, tokenName, this.types[tokenName], this.getValue(tokenName));
        }
        return token;
      },
      destroy: function() {
        this.tokens = null;
        this.cultureValues = null;
        basis.array.remove(dictionaries, this);
        if (this.resource) {
          delete dictionaryByUrl[this.resource.url];
          this.resource = null;
        }
      }
    });
    function resolveDictionary(source) {
      var dictionary;
      if (typeof source == "string") {
        var location = source;
        var extname = basis.path.extname(location);
        if (extname != ".l10n") location = basis.path.dirname(location) + "/" + basis.path.basename(location, extname) + ".l10n";
        source = basis.resource(location);
      }
      if (basis.resource.isResource(source)) dictionary = dictionaryByUrl[source.url];
      return dictionary || new Dictionary(source);
    }
    function getDictionaries() {
      return dictionaries.slice(0);
    }
    var cultureList = [];
    var currentCulture = null;
    var cultures = {};
    var cultureFallback = {};
    var pluralFormsMap = {};
    var pluralForms = [ [ 1, function(n) {
      return 0;
    } ], [ 2, function(n) {
      return n == 1 || n % 10 == 1 ? 0 : 1;
    } ], [ 2, function(n) {
      return n == 0 ? 0 : 1;
    } ], [ 2, function(n) {
      return n == 1 ? 0 : 1;
    } ], [ 2, function(n) {
      return n == 0 || n == 1 ? 0 : 1;
    } ], [ 2, function(n) {
      return n % 10 != 1 || n % 100 == 11 ? 1 : 0;
    } ], [ 3, function(n) {
      return n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    } ], [ 3, function(n) {
      return n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2;
    } ], [ 3, function(n) {
      return n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    } ], [ 3, function(n) {
      return n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    } ], [ 3, function(n) {
      return n == 0 ? 0 : n == 1 ? 1 : 2;
    } ], [ 3, function(n) {
      return n == 1 ? 0 : n == 0 || n % 100 > 0 && n % 100 < 20 ? 1 : 2;
    } ], [ 3, function(n) {
      return n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    } ], [ 3, function(n) {
      return n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
    } ], [ 4, function(n) {
      return n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3;
    } ], [ 4, function(n) {
      return n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3;
    } ], [ 4, function(n) {
      return n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0;
    } ], [ 4, function(n) {
      return n == 1 ? 0 : n == 0 || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3;
    } ], [ 4, function(n) {
      return n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3;
    } ], [ 5, function(n) {
      return n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4;
    } ], [ 6, function(n) {
      return n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
    } ] ];
    [ "ay bo cgg dz fa id ja jbo ka kk km ko ky lo ms my sah su th tt ug vi wo zh", "mk", "jv", "af an ast az bg bn brx ca da de doi el en eo es es-AR et eu ff fi fo fur fy gl gu ha he hi hne hu hy ia it kn ku lb mai ml mn mni mr nah nap nb ne nl nn no nso or pa pap pms ps pt rm rw sat sco sd se si so son sq sv sw ta te tk ur yo", "ach ak am arn br fil fr gun ln mfe mg mi oc pt-BR tg ti tr uz wa zh", "is", "csb", "lv", "lt", "be bs hr ru sr uk", "mnk", "ro", "pl", "cs sk", "cy", "kw", "sl", "mt", "gd", "ga", "ar" ].forEach(function(langs, idx) {
      langs.split(" ").forEach(function(lang) {
        pluralFormsMap[lang] = this;
      }, pluralForms[idx]);
    });
    var Culture = basis.Class(null, {
      className: namespace + ".Culture",
      name: "",
      pluralForm: null,
      init: function(name, pluralForm) {
        this.name = name;
        if (!cultures[name]) cultures[name] = this;
        this.pluralForm = pluralForm || pluralFormsMap[name] || pluralFormsMap[name.split("-")[0]] || pluralForms[0];
      },
      plural: function(value) {
        return Number(this.pluralForm[1](Math.abs(parseInt(value, 10))));
      }
    });
    function resolveCulture(name, pluralForm) {
      if (name && !cultures[name]) cultures[name] = new Culture(name, pluralForm);
      return cultures[name || currentCulture];
    }
    basis.object.extend(resolveCulture, new basis.Token);
    resolveCulture.set = setCulture;
    function getCulture() {
      return currentCulture;
    }
    function setCulture(culture) {
      if (!culture) return;
      if (currentCulture != culture) {
        if (cultureList.indexOf(culture) == -1) {
          basis.dev.warn("basis.l10n.setCulture: culture `" + culture + "` not in the list, the culture isn't changed");
          return;
        }
        currentCulture = culture;
        for (var i = 0, dictionary; dictionary = dictionaries[i]; i++) dictionary.syncValues();
        basis.Token.prototype.set.call(resolveCulture, culture);
      }
    }
    function getCultureList() {
      return cultureList.slice(0);
    }
    function setCultureList(list) {
      if (typeof list == "string") list = list.trim().split(" ");
      if (!list.length) {
        basis.dev.warn("basis.l10n.setCultureList: culture list can't be empty, the culture list isn't changed");
        return;
      }
      var cultures = {};
      var cultureRow;
      var baseCulture;
      cultureFallback = {};
      for (var i = 0, culture, cultureName; culture = list[i]; i++) {
        cultureRow = culture.split("/");
        if (cultureRow.length > 2) {
          basis.dev.warn("basis.l10n.setCultureList: only one fallback culture can be set for certain culture, try to set `" + culture + "`; other cultures except first one was ignored");
          cultureRow = cultureRow.slice(0, 2);
        }
        cultureName = cultureRow[0];
        if (!baseCulture) baseCulture = cultureName;
        cultures[cultureName] = resolveCulture(cultureName);
        cultureFallback[cultureName] = cultureRow;
      }
      for (var cultureName in cultureFallback) {
        cultureFallback[cultureName] = basis.array.flatten(cultureFallback[cultureName].map(function(name) {
          return cultureFallback[name];
        })).concat(baseCulture).filter(function(item, idx, array) {
          return !idx || array.lastIndexOf(item, idx - 1) == -1;
        });
      }
      cultureList = basis.object.keys(cultures);
      if (currentCulture in cultures == false) setCulture(baseCulture);
    }
    function onCultureChange(fn, context, fire) {
      resolveCulture.attach(fn, context);
      if (fire) fn.call(context, currentCulture);
    }
    setCultureList("en-US");
    setCulture("en-US");
    module.exports = {
      ComputeToken: ComputeToken,
      Token: Token,
      token: resolveToken,
      Dictionary: Dictionary,
      dictionary: resolveDictionary,
      getDictionaries: getDictionaries,
      addCreateDictionaryHandler: createDictionaryNotifier.attach.bind(createDictionaryNotifier),
      removeCreateDictionaryHandler: createDictionaryNotifier.detach.bind(createDictionaryNotifier),
      Culture: Culture,
      culture: resolveCulture,
      getCulture: getCulture,
      setCulture: setCulture,
      getCultureList: getCultureList,
      setCultureList: setCultureList,
      pluralForms: pluralForms,
      onCultureChange: onCultureChange
    };
  },
  "4.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    var namespace = this.path;
    var Class = basis.Class;
    var extend = basis.object.extend;
    var slice = Array.prototype.slice;
    var NULL_HANDLER = {};
    var events = {};
    var warnOnDestroy = function() {
      basis.dev.warn("Object had been destroyed before. Destroy method must not be called more than once.");
    };
    function createDispatcher(eventName) {
      var eventFunction = events[eventName];
      if (!eventFunction) {
        eventFunction = function() {
          var cursor = this;
          var args;
          var fn;
          while (cursor = cursor.handler) {
            fn = cursor.callbacks[eventName];
            if (typeof fn == "function") {
              if (!args) {
                args = [ this ];
                for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
              }
              fn.apply(cursor.context || this, args);
            }
            fn = cursor.callbacks["*"];
            if (typeof fn == "function") {
              if (!args) {
                args = [ this ];
                for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
              }
              fn.call(cursor.context || this, {
                sender: this,
                type: eventName,
                args: args
              });
            }
          }
          if (this.debug_emit) {
            args = [];
            for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
            this.debug_emit({
              sender: this,
              type: eventName,
              args: args
            });
          }
        };
        eventFunction = (new Function("slice", 'return {"' + namespace + ".events." + eventName + '":\n\n      ' + "function(" + slice.call(arguments, 1).join(", ") + "){" + eventFunction.toString().replace(/\beventName\b/g, '"' + eventName + '"').replace(/^function[^(]*\(\)[^{]*\{|\}$/g, "") + "}" + '\n\n}["' + namespace + ".events." + eventName + '"];'))(slice);
        events[eventName] = eventFunction;
      }
      return eventFunction;
    }
    function createHandler(events, eventCallback) {
      var handler = {
        events: []
      };
      if (events) {
        events = String(events).trim().split(/\s+|\s*,\s*/).sort();
        handler = {
          events: events
        };
        for (var i = 0, eventName; eventName = events[i]; i++) if (eventName != "destroy") handler[eventName] = eventCallback;
      }
      return handler;
    }
    var Emitter = Class(null, {
      className: namespace + ".Emitter",
      extendConstructor_: true,
      handler: null,
      emit_destroy: createDispatcher("destroy"),
      listen: Class.nestedExtendProperty(),
      debug_handlers: function() {
        var result = [];
        var cursor = this;
        while (cursor = cursor.handler) result.push([ cursor.callbacks, cursor.context ]);
        return result;
      },
      debug_emit: null,
      init: function() {
        if (this.handler && !this.handler.callbacks) this.handler = {
          callbacks: this.handler,
          context: this,
          handler: null
        };
      },
      addHandler: function(callbacks, context) {
        if (!callbacks) basis.dev.warn(namespace + ".Emitter#addHandler: callbacks is not an object (", callbacks, ")");
        context = context || this;
        var cursor = this;
        while (cursor = cursor.handler) {
          if (cursor.callbacks === callbacks && cursor.context === context) {
            basis.dev.warn(namespace + ".Emitter#addHandler: add duplicate event callbacks", callbacks, "to Emitter instance:", this);
            break;
          }
        }
        this.handler = {
          callbacks: callbacks,
          context: context,
          handler: this.handler
        };
      },
      removeHandler: function(callbacks, context) {
        var cursor = this;
        var prev;
        context = context || this;
        while (prev = cursor, cursor = cursor.handler) if (cursor.callbacks === callbacks && cursor.context === context) {
          cursor.callbacks = NULL_HANDLER;
          prev.handler = cursor.handler;
          return;
        }
        basis.dev.warn(namespace + ".Emitter#removeHandler: no handler removed");
      },
      destroy: function() {
        this.destroy = warnOnDestroy;
        this.emit_destroy();
        this.handler = null;
      }
    });
    module.exports = {
      create: createDispatcher,
      createHandler: createHandler,
      events: events,
      Emitter: Emitter
    };
  },
  "5.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    basis.require("./3.js");
    var namespace = this.path;
    var Class = basis.Class;
    var cleaner = basis.cleaner;
    var path = basis.path;
    var arraySearch = basis.array.search;
    var arrayAdd = basis.array.add;
    var arrayRemove = basis.array.remove;
    var templateList = [];
    var tmplFilesMap = {};
    var DECLARATION_VERSION = 2;
    var TYPE_ELEMENT = 1;
    var TYPE_ATTRIBUTE = 2;
    var TYPE_ATTRIBUTE_CLASS = 4;
    var TYPE_ATTRIBUTE_STYLE = 5;
    var TYPE_ATTRIBUTE_EVENT = 6;
    var TYPE_TEXT = 3;
    var TYPE_COMMENT = 8;
    var TOKEN_TYPE = 0;
    var TOKEN_BINDINGS = 1;
    var TOKEN_REFS = 2;
    var ATTR_NAME = 3;
    var ATTR_VALUE = 4;
    var ATTR_EVENT_RX = /^event-(.+)$/;
    var ATTR_NAME_BY_TYPE = {
      4: "class",
      5: "style"
    };
    var ATTR_TYPE_BY_NAME = {
      "class": TYPE_ATTRIBUTE_CLASS,
      style: TYPE_ATTRIBUTE_STYLE
    };
    var ATTR_VALUE_INDEX = {
      2: ATTR_VALUE,
      4: ATTR_VALUE - 1,
      5: ATTR_VALUE - 1,
      6: 2
    };
    var ELEMENT_NAME = 3;
    var ELEMENT_ATTRS = 4;
    var ELEMENT_CHILDS = 5;
    var TEXT_VALUE = 3;
    var COMMENT_VALUE = 3;
    var SYNTAX_ERROR = "Invalid or unsupported syntax";
    var TEXT = /((?:.|[\r\n])*?)(\{(?:l10n:([a-zA-Z_][a-zA-Z0-9_\-]*(?:\.[a-zA-Z_][a-zA-Z0-9_\-]*)*(?:\.\{[a-zA-Z_][a-zA-Z0-9_\-]*\})?)\})?|<(\/|!--(\s*\{)?)?|$)/g;
    var TAG_NAME = /([a-z_][a-z0-9\-_]*)(:|\{|\s*(\/?>)?)/ig;
    var ATTRIBUTE_NAME_OR_END = /([a-z_][a-z0-9_\-]*)(:|\{|=|\s*)|(\/?>)/ig;
    var COMMENT = /(.|[\r\n])*?-->/g;
    var CLOSE_TAG = /([a-z_][a-z0-9_\-]*(?::[a-z_][a-z0-9_\-]*)?)>/ig;
    var REFERENCE = /([a-z_][a-z0-9_]*)(\||\}\s*)/ig;
    var ATTRIBUTE_VALUE = /"((?:(\\")|[^"])*?)"\s*/g;
    var BREAK_TAG_PARSE = /^/g;
    var SINGLETON_TAG = /^(area|base|br|col|command|embed|hr|img|input|link|meta|param|source)$/i;
    var TAG_IGNORE_CONTENT = {
      text: /((?:.|[\r\n])*?)(?:<\/b:text>|$)/g,
      style: /((?:.|[\r\n])*?)(?:<\/b:style>|$)/g
    };
    var quoteUnescape = /\\"/g;
    var tokenize = function(source) {
      var result = [];
      var tagStack = [];
      var lastTag = {
        childs: result
      };
      var sourceText;
      var token;
      var bufferPos;
      var startPos;
      var parseTag = false;
      var textStateEndPos = 0;
      var textEndPos;
      var state = TEXT;
      var pos = 0;
      var m;
      source = source.trim();
      result.warns = [];
      while (pos < source.length || state != TEXT) {
        state.lastIndex = pos;
        startPos = pos;
        m = state.exec(source);
        if (!m || m.index !== pos) {
          if (state == REFERENCE && token && token.type == TYPE_COMMENT) {
            state = COMMENT;
            continue;
          }
          if (parseTag) lastTag = tagStack.pop();
          if (token) lastTag.childs.pop();
          if (token = lastTag.childs.pop()) {
            if (token.type == TYPE_TEXT && !token.refs) textStateEndPos -= "len" in token ? token.len : token.value.length; else lastTag.childs.push(token);
          }
          parseTag = false;
          state = TEXT;
          continue;
        }
        pos = state.lastIndex;
        switch (state) {
          case TEXT:
            textEndPos = startPos + m[1].length;
            if (textStateEndPos != textEndPos) {
              sourceText = textStateEndPos == startPos ? m[1] : source.substring(textStateEndPos, textEndPos);
              token = sourceText.replace(/\s*(\r\n?|\n\r?)\s*/g, "");
              if (token) lastTag.childs.push({
                type: TYPE_TEXT,
                len: sourceText.length,
                value: token
              });
            }
            textStateEndPos = textEndPos;
            if (m[3]) {
              lastTag.childs.push({
                type: TYPE_TEXT,
                refs: [ "l10n:" + m[3] ],
                value: "{l10n:" + m[3] + "}"
              });
            } else if (m[2] == "{") {
              bufferPos = pos - 1;
              lastTag.childs.push(token = {
                type: TYPE_TEXT
              });
              state = REFERENCE;
            } else if (m[4]) {
              if (m[4] == "/") {
                token = null;
                state = CLOSE_TAG;
              } else {
                lastTag.childs.push(token = {
                  type: TYPE_COMMENT
                });
                if (m[5]) {
                  bufferPos = pos - m[5].length;
                  state = REFERENCE;
                } else {
                  bufferPos = pos;
                  state = COMMENT;
                }
              }
            } else if (m[2]) {
              parseTag = true;
              tagStack.push(lastTag);
              lastTag.childs.push(token = {
                type: TYPE_ELEMENT,
                attrs: [],
                childs: []
              });
              lastTag = token;
              state = TAG_NAME;
            }
            break;
          case CLOSE_TAG:
            if (m[1] !== (lastTag.prefix ? lastTag.prefix + ":" : "") + lastTag.name) {
              lastTag.childs.push({
                type: TYPE_TEXT,
                value: "</" + m[0]
              });
            } else lastTag = tagStack.pop();
            state = TEXT;
            break;
          case TAG_NAME:
          case ATTRIBUTE_NAME_OR_END:
            if (m[2] == ":") {
              if (token.prefix) state = BREAK_TAG_PARSE; else token.prefix = m[1];
              break;
            }
            if (m[1]) {
              token.name = m[1];
              if (token.type == TYPE_ATTRIBUTE) lastTag.attrs.push(token);
            }
            if (m[2] == "{") {
              if (token.type == TYPE_ELEMENT) state = REFERENCE; else state = BREAK_TAG_PARSE;
              break;
            }
            if (m[3]) {
              parseTag = false;
              if (m[3] == "/>" || !lastTag.prefix && SINGLETON_TAG.test(lastTag.name)) {
                if (m[3] != "/>") result.warns.push("Tag <" + lastTag.name + "> doesn't closed explicit (use `/>` as tag ending)");
                lastTag = tagStack.pop();
              } else {
                if (lastTag.prefix == "b" && lastTag.name in TAG_IGNORE_CONTENT) {
                  state = TAG_IGNORE_CONTENT[lastTag.name];
                  break;
                }
              }
              state = TEXT;
              break;
            }
            if (m[2] == "=") {
              state = ATTRIBUTE_VALUE;
              break;
            }
            token = {
              type: TYPE_ATTRIBUTE
            };
            state = ATTRIBUTE_NAME_OR_END;
            break;
          case COMMENT:
            token.value = source.substring(bufferPos, pos - 3);
            state = TEXT;
            break;
          case REFERENCE:
            if (token.refs) token.refs.push(m[1]); else token.refs = [ m[1] ];
            if (m[2] != "|") {
              if (token.type == TYPE_TEXT) {
                pos -= m[2].length - 1;
                token.value = source.substring(bufferPos, pos);
                state = TEXT;
              } else if (token.type == TYPE_COMMENT) {
                state = COMMENT;
              } else if (token.type == TYPE_ATTRIBUTE && source[pos] == "=") {
                pos++;
                state = ATTRIBUTE_VALUE;
              } else {
                token = {
                  type: TYPE_ATTRIBUTE
                };
                state = ATTRIBUTE_NAME_OR_END;
              }
            }
            break;
          case ATTRIBUTE_VALUE:
            token.value = m[1].replace(quoteUnescape, '"');
            token = {
              type: TYPE_ATTRIBUTE
            };
            state = ATTRIBUTE_NAME_OR_END;
            break;
          case TAG_IGNORE_CONTENT.text:
          case TAG_IGNORE_CONTENT.style:
            lastTag.childs.push({
              type: TYPE_TEXT,
              value: m[1]
            });
            lastTag = tagStack.pop();
            state = TEXT;
            break;
          default:
            throw "Parser bug";
        }
        if (state == TEXT) textStateEndPos = pos;
      }
      if (textStateEndPos != pos) lastTag.childs.push({
        type: TYPE_TEXT,
        value: source.substring(textStateEndPos, pos)
      });
      if (lastTag.name) result.warns.push("No close tag for <" + lastTag.name + ">");
      if (!result.warns.length) delete result.warns;
      result.templateTokens = true;
      return result;
    };
    var tokenTemplate = {};
    var L10nProxyToken = basis.Token.subclass({
      className: namespace + ".L10nProxyToken",
      token: null,
      url: "",
      init: function(token) {
        this.url = token.dictionary.resource.url + ":" + token.name;
        this.token = token;
        this.set();
        token.attach(this.set, this);
      },
      set: function() {
        return basis.Token.prototype.set.call(this, this.token.type == "markup" ? processMarkup(this.token.value, this.token.name + "@" + this.token.dictionary.resource.url) : "");
      },
      destroy: function() {
        basis.Token.prototype.destroy.call(this);
        this.token = null;
      }
    });
    function processMarkup(value, id) {
      return '<span class="basisjs-markup" data-basisjs-l10n="' + id + '">' + String(value) + "</span>";
    }
    function getL10nTemplate(token) {
      if (typeof token == "string") token = basis.l10n.token(token);
      if (!token) return null;
      var id = token.basisObjectId;
      var template = tokenTemplate[id];
      if (!template) template = tokenTemplate[id] = new Template(new L10nProxyToken(token));
      return template;
    }
    function genIsolateMarker() {
      return "i" + basis.genUID() + "__";
    }
    function isolateCss(css, prefix) {
      function addMatch(prefix) {
        if (i > lastMatchPos) {
          result.push((prefix || "") + css.substring(lastMatchPos, i));
          lastMatchPos = i;
        }
      }
      var result = [];
      var sym = css.split("");
      var len = sym.length;
      var lastMatchPos = 0;
      var blockScope = false;
      var strSym;
      if (!prefix) prefix = genIsolateMarker();
      for (var i = 0; i < len; i++) {
        switch (sym[i]) {
          case "'":
          case '"':
            strSym = sym[i];
            while (++i < len) {
              if (sym[i] == "\\") i++; else if (sym[i] == strSym) {
                i++;
                break;
              }
            }
            break;
          case "/":
            if (sym[i + 1] == "*") {
              i++;
              while (++i < len) if (sym[i] == "*" && sym[i + 1] == "/") {
                i += 2;
                break;
              }
            }
            break;
          case "{":
            blockScope = true;
            break;
          case "}":
            blockScope = false;
            break;
          case ".":
            if (!blockScope) {
              i++;
              addMatch();
              while (++i < len) if (!/[a-z0-9\-\_]/.test(sym[i])) {
                addMatch(prefix);
                i -= 1;
                break;
              }
            }
            break;
        }
      }
      addMatch();
      return result.join("");
    }
    var makeDeclaration = function() {
      var IDENT = /^[a-z_][a-z0-9_\-]*$/i;
      var CLASS_ATTR_PARTS = /(\S+)/g;
      var CLASS_ATTR_BINDING = /^((?:[a-z_][a-z0-9_\-]*)?(?::(?:[a-z_][a-z0-9_\-]*)?)?)\{((anim:)?[a-z_][a-z0-9_\-]*)\}$/i;
      var STYLE_ATTR_PARTS = /\s*[^:]+?\s*:(?:\(.*?\)|".*?"|'.*?'|[^;]+?)+(?:;|$)/gi;
      var STYLE_PROPERTY = /\s*([^:]+?)\s*:((?:\(.*?\)|".*?"|'.*?'|[^;]+?)+);?$/i;
      var STYLE_ATTR_BINDING = /\{([a-z_][a-z0-9_]*)\}/i;
      var ATTR_BINDING = /\{([a-z_][a-z0-9_]*|l10n:[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)*(?:\.\{[a-z_][a-z0-9_]*\})?)\}/i;
      var NAMED_CHARACTER_REF = /&([a-z]+|#[0-9]+|#x[0-9a-f]{1,4});?/gi;
      var tokenMap = basis.NODE_ENV ? __nodejsRequire("./template/htmlentity.json") : {};
      var tokenElement = !basis.NODE_ENV ? document.createElement("div") : null;
      var includeStack = [];
      var styleNamespaceIsolate = {};
      function name(token) {
        return (token.prefix ? token.prefix + ":" : "") + token.name;
      }
      function namedCharReplace(m, token) {
        if (!tokenMap[token]) {
          if (token.charAt(0) == "#") {
            tokenMap[token] = String.fromCharCode(token.charAt(1) == "x" || token.charAt(1) == "X" ? parseInt(token.substr(2), 16) : token.substr(1));
          } else {
            if (tokenElement) {
              tokenElement.innerHTML = m;
              tokenMap[token] = tokenElement.firstChild ? tokenElement.firstChild.nodeValue : m;
            }
          }
        }
        return tokenMap[token] || m;
      }
      function untoken(value) {
        return value.replace(NAMED_CHARACTER_REF, namedCharReplace);
      }
      function refList(token) {
        var array = token.refs;
        if (!array || !array.length) return 0;
        return array;
      }
      function buildAttrExpression(parts) {
        var bindName;
        var names = [];
        var expression = [];
        var map = {};
        for (var j = 0; j < parts.length; j++) if (j % 2) {
          bindName = parts[j];
          if (!map[bindName]) {
            map[bindName] = names.length;
            names.push(bindName);
          }
          expression.push(map[bindName]);
        } else {
          if (parts[j]) expression.push(untoken(parts[j]));
        }
        return [ names, expression ];
      }
      function processAttr(name, value) {
        var bindings = 0;
        var parts;
        var m;
        if (value) {
          switch (name) {
            case "class":
              if (parts = value.match(CLASS_ATTR_PARTS)) {
                var newValue = [];
                bindings = [];
                for (var j = 0, part; part = parts[j]; j++) {
                  if (m = part.match(CLASS_ATTR_BINDING)) bindings.push([ m[1] || "", m[2] ]); else newValue.push(part);
                }
                value = newValue.join(" ");
              }
              break;
            case "style":
              var props = [];
              bindings = [];
              if (parts = value.match(STYLE_ATTR_PARTS)) {
                for (var j = 0, part; part = parts[j]; j++) {
                  var m = part.match(STYLE_PROPERTY);
                  var propertyName = m[1];
                  var value = m[2].trim();
                  var valueParts = value.split(STYLE_ATTR_BINDING);
                  if (valueParts.length > 1) {
                    var expr = buildAttrExpression(valueParts);
                    expr.push(propertyName);
                    bindings.push(expr);
                  } else props.push(propertyName + ": " + untoken(value));
                }
              } else {
                if (/\S/.test(value)) basis.dev.warn("Bad value for style attribute (value ignored):", value);
              }
              value = props.join("; ");
              if (value) value += ";";
              break;
            default:
              parts = value.split(ATTR_BINDING);
              if (parts.length > 1) bindings = buildAttrExpression(parts); else value = untoken(value);
          }
        }
        if (bindings && !bindings.length) bindings = 0;
        return {
          binding: bindings,
          value: value,
          type: ATTR_TYPE_BY_NAME[name] || 2
        };
      }
      function attrs(token, declToken, optimizeSize) {
        var attrs = token.attrs;
        var result = [];
        var styleAttr;
        var display;
        var m;
        for (var i = 0, attr; attr = attrs[i]; i++) {
          if (attr.prefix == "b") {
            switch (attr.name) {
              case "ref":
                var refs = (attr.value || "").trim().split(/\s+/);
                for (var j = 0; j < refs.length; j++) addTokenRef(declToken, refs[j]);
                break;
              case "show":
              case "hide":
                display = attr;
                break;
            }
            continue;
          }
          if (m = attr.name.match(ATTR_EVENT_RX)) {
            result.push(m[1] == attr.value ? [ TYPE_ATTRIBUTE_EVENT, m[1] ] : [ TYPE_ATTRIBUTE_EVENT, m[1], attr.value ]);
            continue;
          }
          var parsed = processAttr(attr.name, attr.value);
          var item = [ parsed.type, parsed.binding, refList(attr) ];
          if (parsed.type == 2) item.push(name(attr));
          if (parsed.value && (!optimizeSize || !parsed.binding || parsed.type != 2)) item.push(parsed.value);
          if (parsed.type == TYPE_ATTRIBUTE_STYLE) styleAttr = item;
          result.push(item);
        }
        if (display) {
          if (!styleAttr) {
            styleAttr = [ TYPE_ATTRIBUTE_STYLE, 0, 0 ];
            result.push(styleAttr);
          }
          if (!styleAttr[1]) styleAttr[1] = [];
          var displayExpr = buildAttrExpression((display.value || display.name).split(ATTR_BINDING));
          if (displayExpr[0].length - displayExpr[1].length) {
            styleAttr[3] = (styleAttr[3] ? styleAttr[3] + "; " : "") + (display.name == "show" ^ display.value === "" ? "" : "display: none");
          } else {
            if (display.name == "show") styleAttr[3] = (styleAttr[3] ? styleAttr[3] + "; " : "") + "display: none";
            styleAttr[1].push(displayExpr.concat("display", display.name));
          }
        }
        return result.length ? result : 0;
      }
      function addTokenRef(token, refName) {
        if (!token[TOKEN_REFS]) token[TOKEN_REFS] = [];
        arrayAdd(token[TOKEN_REFS], refName);
        if (refName != "element") token[TOKEN_BINDINGS] = token[TOKEN_REFS].length == 1 ? refName : 0;
      }
      function removeTokenRef(token, refName) {
        var idx = token[TOKEN_REFS].indexOf(refName);
        if (idx != -1) {
          var indexBinding = token[TOKEN_BINDINGS] && typeof token[TOKEN_BINDINGS] == "number";
          token[TOKEN_REFS].splice(idx, 1);
          if (indexBinding) if (idx == token[TOKEN_BINDINGS] - 1) token[TOKEN_BINDINGS] = refName;
          if (!token[TOKEN_REFS].length) token[TOKEN_REFS] = 0; else {
            if (indexBinding) token[TOKEN_BINDINGS] -= idx < token[TOKEN_BINDINGS] - 1;
          }
        }
      }
      function tokenAttrs(token) {
        var result = {};
        if (token.attrs) for (var i = 0, attr; attr = token.attrs[i]; i++) result[name(attr)] = attr.value;
        return result;
      }
      function addUnique(array, items) {
        for (var i = 0; i < items.length; i++) arrayAdd(array, items[i]);
      }
      function addStyles(array, items, prefix) {
        for (var i = 0, item; item = items[i]; i++) if (item[1] !== styleNamespaceIsolate) item[1] = prefix + item[1];
        array.unshift.apply(array, items);
      }
      function addStyle(template, token, src, isolatePrefix) {
        var url;
        if (src) {
          if (!/^(\.\/|\.\.|\/)/.test(src)) basis.dev.warn("Bad usage: <b:" + token.name + ' src="' + src + '"/>.\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.');
          url = path.resolve(template.baseURI + src);
        } else {
          var text = token.childs[0];
          url = basis.resource.virtual("css", text ? text.value : "", template.sourceUrl).url;
        }
        template.resources.push([ url, isolatePrefix ]);
        return url;
      }
      function process(tokens, template, options, context) {
        function modifyAttr(token, name, action) {
          var attrs = tokenAttrs(token);
          if (name) attrs.name = name;
          if (!attrs.name) {
            template.warns.push("Instruction <b:" + token.name + "> has no attribute name");
            return;
          }
          if (!IDENT.test(attrs.name)) {
            template.warns.push("Bad attribute name `" + attrs.name + "`");
            return;
          }
          var includedToken = tokenRefMap[attrs.ref || "element"];
          if (includedToken) {
            if (includedToken.token[TOKEN_TYPE] == TYPE_ELEMENT) {
              var itAttrs = includedToken.token;
              var isEvent = attrs.name.match(ATTR_EVENT_RX);
              var itType = isEvent ? TYPE_ATTRIBUTE_EVENT : ATTR_TYPE_BY_NAME[attrs.name] || TYPE_ATTRIBUTE;
              var valueIdx = ATTR_VALUE_INDEX[itType] || ATTR_VALUE;
              var itAttrToken = itAttrs && arraySearch(itAttrs, attrs.name, function(token) {
                if (token[TOKEN_TYPE] == TYPE_ATTRIBUTE_EVENT) return "event-" + token[1];
                return ATTR_NAME_BY_TYPE[token[TOKEN_TYPE]] || token[ATTR_NAME];
              }, ELEMENT_ATTRS);
              if (!itAttrToken && action != "remove") {
                if (isEvent) {
                  itAttrToken = [ itType, isEvent[1] ];
                } else {
                  itAttrToken = [ itType, 0, 0, itType == TYPE_ATTRIBUTE ? attrs.name : "" ];
                  if (itType == TYPE_ATTRIBUTE) itAttrToken.push("");
                }
                if (!itAttrs) {
                  itAttrs = [];
                  includedToken.token.push(itAttrs);
                }
                itAttrs.push(itAttrToken);
              }
              var classOrStyle = attrs.name == "class" || attrs.name == "style";
              switch (action) {
                case "set":
                  if (itAttrToken[TOKEN_TYPE] == TYPE_ATTRIBUTE_EVENT) {
                    if (attrs.value == isEvent[1]) itAttrToken.length = 2; else itAttrToken[valueIdx] = attrs.value;
                    return;
                  }
                  var parsed = processAttr(attrs.name, attrs.value);
                  itAttrToken[TOKEN_BINDINGS] = parsed.binding;
                  if (!options.optimizeSize || !itAttrToken[TOKEN_BINDINGS] || classOrStyle) itAttrToken[valueIdx] = parsed.value || ""; else itAttrToken.length = valueIdx;
                  if (classOrStyle) if (!itAttrToken[TOKEN_BINDINGS] && !itAttrToken[valueIdx]) {
                    arrayRemove(itAttrs, itAttrToken);
                    return;
                  }
                  break;
                case "append":
                  var parsed = processAttr(attrs.name, attrs.value);
                  if (!isEvent) {
                    if (parsed.binding) {
                      var attrBindings = itAttrToken[TOKEN_BINDINGS];
                      if (attrBindings) {
                        switch (attrs.name) {
                          case "style":
                            var oldBindingMap = {};
                            for (var i = 0, oldBinding; oldBinding = attrBindings[i]; i++) oldBindingMap[oldBinding[2]] = i;
                            for (var i = 0, newBinding; newBinding = parsed.binding[i]; i++) if (newBinding[2] in oldBindingMap) attrBindings[oldBindingMap[newBinding[2]]] = newBinding; else attrBindings.push(newBinding);
                            break;
                          case "class":
                            attrBindings.push.apply(attrBindings, parsed.binding);
                            break;
                          default:
                            parsed.binding[0].forEach(function(name) {
                              arrayAdd(this, name);
                            }, attrBindings[0]);
                            for (var i = 0; i < parsed.binding[1].length; i++) {
                              var value = parsed.binding[1][i];
                              if (typeof value == "number") value = attrBindings[0].indexOf(parsed.binding[0][value]);
                              attrBindings[1].push(value);
                            }
                        }
                      } else {
                        itAttrToken[TOKEN_BINDINGS] = parsed.binding;
                        if (!classOrStyle) itAttrToken[TOKEN_BINDINGS][1].unshift(itAttrToken[valueIdx]);
                      }
                    } else {
                      if (!classOrStyle && itAttrToken[TOKEN_BINDINGS]) itAttrToken[TOKEN_BINDINGS][1].push(attrs.value);
                    }
                  }
                  if (parsed.value) itAttrToken[valueIdx] = (itAttrToken[valueIdx] || "") + (itAttrToken[valueIdx] && (isEvent || classOrStyle) ? " " : "") + parsed.value;
                  if (classOrStyle) if (!itAttrToken[TOKEN_BINDINGS] && !itAttrToken[valueIdx]) {
                    arrayRemove(itAttrs, itAttrToken);
                    return;
                  }
                  break;
                case "remove":
                  if (itAttrToken) arrayRemove(itAttrs, itAttrToken);
                  break;
              }
            } else {
              template.warns.push("Attribute modificator is not reference to element token (reference name: " + (attrs.ref || "element") + ")");
            }
          }
        }
        var result = [];
        for (var i = 0, token, item; token = tokens[i]; i++) {
          var refs = refList(token);
          var bindings = refs && refs.length == 1 ? refs[0] : 0;
          switch (token.type) {
            case TYPE_ELEMENT:
              if (token.prefix == "b") {
                var elAttrs = tokenAttrs(token);
                switch (token.name) {
                  case "style":
                    var styleNamespace = elAttrs.namespace || elAttrs.ns;
                    var styleIsolate = styleNamespace ? styleNamespaceIsolate : context && context.isolate || "";
                    var src = addStyle(template, token, elAttrs.src, styleIsolate);
                    if (styleNamespace) {
                      if (src in styleNamespaceIsolate == false) styleNamespaceIsolate[src] = genIsolateMarker();
                      template.styleNSPrefix[styleNamespace] = styleNamespaceIsolate[src];
                    }
                    break;
                  case "isolate":
                    if (!template.isolate) template.isolate = elAttrs.prefix || options.isolate || genIsolateMarker(); else basis.dev.warn("<b:isolate> is set already to `" + template.isolate + "`");
                    break;
                  case "l10n":
                    if (template.l10nResolved) template.warns.push("<b:l10n> must be declared before any `l10n:` token (instruction ignored)");
                    if (elAttrs.src) {
                      if (!/^(\.\/|\.\.|\/)/.test(elAttrs.src)) basis.dev.warn("Bad usage: <b:" + token.name + ' src="' + elAttrs.src + '"/>.\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.');
                      template.dictURI = path.resolve(template.baseURI, elAttrs.src);
                    }
                    break;
                  case "define":
                    if ("name" in elAttrs && !template.defines[elAttrs.name]) {
                      switch (elAttrs.type) {
                        case "bool":
                          template.defines[elAttrs.name] = [ elAttrs["default"] == "true" ? 1 : 0 ];
                          break;
                        case "enum":
                          var values = elAttrs.values ? elAttrs.values.trim().split(" ") : [];
                          template.defines[elAttrs.name] = [ values.indexOf(elAttrs["default"]) + 1, values ];
                          break;
                        default:
                          template.warns.push("Bad define type `" + elAttrs.type + "` for " + elAttrs.name);
                      }
                    }
                    break;
                  case "text":
                    var text = token.childs[0];
                    tokens[i--] = basis.object.extend(text, {
                      refs: (elAttrs.ref || "").trim().split(/\s+/),
                      value: "notrim" in elAttrs ? text.value : text.value.replace(/^\s*[\r\n]+|[\r\n]\s*$/g, "")
                    });
                    break;
                  case "include":
                    var templateSrc = elAttrs.src;
                    if (templateSrc) {
                      var isTemplateRef = /^#\d+$/.test(templateSrc);
                      var isDocumentIdRef = /^id:/.test(templateSrc);
                      var url = isTemplateRef ? templateSrc.substr(1) : templateSrc;
                      var resource;
                      if (isTemplateRef) {
                        resource = templateList[url];
                      } else if (isDocumentIdRef) {
                        resource = resolveSourceByDocumentId(url.substr(3));
                      } else if (/^[a-z0-9\.]+$/i.test(url) && !/\.tmpl$/.test(url)) {
                        resource = getSourceByPath(url);
                      } else {
                        if (!/^(\.\/|\.\.|\/)/.test(url)) basis.dev.warn('Bad usage: <b:include src="' + url + '"/>.\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.');
                        resource = basis.resource(path.resolve(template.baseURI + url));
                      }
                      if (!resource) {
                        template.warns.push('<b:include src="' + templateSrc + '"> is not resolved, instruction ignored');
                        basis.dev.warn('<b:include src="' + templateSrc + '"> is not resolved, instruction ignored');
                        continue;
                      }
                      if (includeStack.indexOf(resource) == -1) {
                        var isolatePrefix = "isolate" in elAttrs ? elAttrs.isolate || genIsolateMarker() : "";
                        var decl;
                        if (!isDocumentIdRef) arrayAdd(template.deps, resource);
                        if (isTemplateRef) {
                          if (resource.source.bindingBridge) arrayAdd(template.deps, resource.source);
                          decl = getDeclFromSource(resource.source, resource.baseURI, true, options);
                        } else {
                          decl = getDeclFromSource(resource, resource.url ? path.dirname(resource.url) + "/" : "", true, options);
                        }
                        if (decl.resources && "no-style" in elAttrs == false) addStyles(template.resources, decl.resources, isolatePrefix);
                        if (decl.deps) addUnique(template.deps, decl.deps);
                        if (decl.l10n) addUnique(template.l10n, decl.l10n);
                        var tokenRefMap = normalizeRefs(decl.tokens);
                        var instructions = (token.childs || []).slice();
                        var styleNSPrefixMap = basis.object.slice(decl.styleNSPrefix);
                        if (elAttrs["class"]) instructions.push({
                          type: TYPE_ELEMENT,
                          prefix: "b",
                          name: "append-class",
                          attrs: [ {
                            type: TYPE_ATTRIBUTE,
                            name: "value",
                            value: elAttrs["class"]
                          } ]
                        });
                        if (elAttrs.id) instructions.push({
                          type: TYPE_ELEMENT,
                          prefix: "b",
                          name: "set-attr",
                          attrs: [ {
                            type: TYPE_ATTRIBUTE,
                            name: "name",
                            value: "id"
                          }, {
                            type: TYPE_ATTRIBUTE,
                            name: "value",
                            value: elAttrs.id
                          } ]
                        });
                        if (elAttrs.ref) if (tokenRefMap.element) elAttrs.ref.trim().split(/\s+/).map(function(refName) {
                          addTokenRef(tokenRefMap.element.token, refName);
                        });
                        for (var j = 0, child; child = instructions[j]; j++) {
                          if (child.type == TYPE_ELEMENT && child.prefix == "b") {
                            switch (child.name) {
                              case "style":
                                var childAttrs = tokenAttrs(child);
                                var styleNamespace = childAttrs.namespace || childAttrs.ns;
                                var styleIsolate = styleNamespace ? styleNamespaceIsolate : isolatePrefix;
                                var src = addStyle(template, child, childAttrs.src, styleIsolate);
                                if (styleNamespace) {
                                  if (src in styleNamespaceIsolate == false) styleNamespaceIsolate[src] = genIsolateMarker();
                                  styleNSPrefixMap[styleNamespace] = styleNamespaceIsolate[src];
                                }
                                break;
                              case "replace":
                              case "remove":
                              case "before":
                              case "after":
                                var replaceOrRemove = child.name == "replace" || child.name == "remove";
                                var childAttrs = tokenAttrs(child);
                                var ref = "ref" in childAttrs || !replaceOrRemove ? childAttrs.ref : "element";
                                var tokenRef = ref && tokenRefMap[ref];
                                if (tokenRef) {
                                  var pos = tokenRef.owner.indexOf(tokenRef.token);
                                  if (pos != -1) {
                                    var args = [ pos + (child.name == "after"), replaceOrRemove ];
                                    if (child.name != "remove") args = args.concat(process(child.childs, template, options) || []);
                                    tokenRef.owner.splice.apply(tokenRef.owner, args);
                                  }
                                }
                                break;
                              case "prepend":
                              case "append":
                                var childAttrs = tokenAttrs(child);
                                var ref = "ref" in childAttrs ? childAttrs.ref : "element";
                                var tokenRef = ref && tokenRefMap[ref];
                                var token = tokenRef && tokenRef.token;
                                if (token && token[TOKEN_TYPE] == TYPE_ELEMENT) {
                                  var childs = process(child.childs, template, options) || [];
                                  if (child.name == "prepend") token.splice.apply(token, [ ELEMENT_ATTRS, 0 ].concat(childs)); else token.push.apply(token, childs);
                                }
                                break;
                              case "attr":
                              case "set-attr":
                                modifyAttr(child, false, "set");
                                break;
                              case "append-attr":
                                modifyAttr(child, false, "append");
                                break;
                              case "remove-attr":
                                modifyAttr(child, false, "remove");
                                break;
                              case "class":
                              case "append-class":
                                modifyAttr(child, "class", "append");
                                break;
                              case "set-class":
                                modifyAttr(child, "class", "set");
                                break;
                              case "remove-class":
                                modifyAttr(child, "class", "remove");
                                break;
                              case "add-ref":
                                var childAttrs = tokenAttrs(child);
                                var ref = "ref" in childAttrs ? childAttrs.ref : "element";
                                var tokenRef = ref && tokenRefMap[ref];
                                var token = tokenRef && tokenRef.token;
                                if (token && childAttrs.name) addTokenRef(token, childAttrs.name);
                                break;
                              case "remove-ref":
                                var childAttrs = tokenAttrs(child);
                                var ref = "ref" in childAttrs ? childAttrs.ref : "element";
                                var tokenRef = ref && tokenRefMap[ref];
                                var token = tokenRef && tokenRef.token;
                                if (token) removeTokenRef(token, childAttrs.name || childAttrs.ref);
                                break;
                              default:
                                template.warns.push("Unknown instruction tag <b:" + child.name + ">");
                            }
                          } else decl.tokens.push.apply(decl.tokens, process([ child ], template, options) || []);
                        }
                        if (tokenRefMap.element) removeTokenRef(tokenRefMap.element.token, "element");
                        basis.object.complete(template.styleNSPrefix, styleNSPrefixMap);
                        if (isolatePrefix) isolateTokens(decl.tokens, isolatePrefix); else if (decl.isolate && !template.isolate) template.isolate = options.isolate || genIsolateMarker();
                        result.push.apply(result, decl.tokens);
                      } else {
                        var stack = includeStack.slice(includeStack.indexOf(resource) || 0).concat(resource).map(function(res) {
                          if (res instanceof Template) res = res.source;
                          if (res instanceof L10nProxyToken) return "{l10n:" + res.token.name + "@" + res.token.dictionary.resource.url + "}";
                          return res.url || "[inline template]";
                        });
                        template.warns.push("Recursion: ", stack.join(" -> "));
                        basis.dev.warn("Recursion in template: ", stack.join(" -> "));
                      }
                    }
                    break;
                }
                continue;
              }
              item = [ 1, bindings, refs, name(token) ];
              item.push.apply(item, attrs(token, item, options.optimizeSize) || []);
              item.push.apply(item, process(token.childs, template, options) || []);
              break;
            case TYPE_TEXT:
              if (refs && refs.length == 2 && arraySearch(refs, "element")) bindings = refs[+!refs.lastSearchIndex];
              if (bindings) {
                var l10nBinding = absl10n(bindings, template.dictURI);
                var parts = l10nBinding.split(/[:@\{]/);
                if (parts[0] == "l10n" && parts.length == 3) {
                  if (!parts[2]) {
                    arrayRemove(refs, bindings);
                    if (refs.length == 0) refs = null;
                    bindings = 0;
                    token.value = token.value.replace(/\}$/, "@undefined}");
                  } else {
                    var l10nId = parts.slice(1).join("@");
                    var l10nToken = basis.l10n.token(l10nId);
                    var l10nTemplate = getL10nTemplate(l10nToken);
                    template.l10nResolved = true;
                    if (l10nTemplate && l10nToken.type == "markup") {
                      tokens[i--] = tokenize('<b:include src="#' + l10nTemplate.templateId + '"/>')[0];
                      continue;
                    } else arrayAdd(template.l10n, l10nId);
                  }
                }
              }
              item = [ 3, bindings, refs ];
              if (!refs || token.value != "{" + refs.join("|") + "}") item.push(untoken(token.value));
              break;
            case TYPE_COMMENT:
              if (options.optimizeSize && !bindings && !refs) continue;
              item = [ 8, bindings, refs ];
              if (!options.optimizeSize) if (!refs || token.value != "{" + refs.join("|") + "}") item.push(untoken(token.value));
              break;
          }
          while (item[item.length - 1] === 0) item.pop();
          result.push(item);
        }
        return result.length ? result : 0;
      }
      function absl10n(value, dictURI) {
        if (typeof value != "string") return value;
        var parts = value.split(":");
        if (parts.length == 2 && parts[0] == "l10n" && parts[1].indexOf("@") == -1) parts[1] = parts[1] + "@" + dictURI;
        return parts.join(":");
      }
      function normalizeRefs(tokens, dictURI, map, stIdx) {
        if (!map) map = {};
        for (var i = stIdx || 0, token; token = tokens[i]; i++) {
          if (token[TOKEN_TYPE] == TYPE_ATTRIBUTE_EVENT) continue;
          var refs = token[TOKEN_REFS];
          if (refs) {
            for (var j = refs.length - 1, refName; refName = refs[j]; j--) {
              if (refName.indexOf(":") != -1) {
                removeTokenRef(token, refName);
                continue;
              }
              if (map[refName]) removeTokenRef(map[refName].token, refName);
              if (token[TOKEN_BINDINGS] == refName) token[TOKEN_BINDINGS] = j + 1;
              map[refName] = {
                owner: tokens,
                token: token
              };
            }
          }
          switch (token[TOKEN_TYPE]) {
            case TYPE_TEXT:
              token[TOKEN_BINDINGS] = absl10n(token[TOKEN_BINDINGS], dictURI);
              break;
            case TYPE_ATTRIBUTE:
              if (token[TOKEN_BINDINGS]) {
                var array = token[TOKEN_BINDINGS][0];
                for (var j = 0; j < array.length; j++) array[j] = absl10n(array[j], dictURI);
              }
              break;
            case TYPE_ELEMENT:
              normalizeRefs(token, dictURI, map, ELEMENT_ATTRS);
              break;
          }
        }
        return map;
      }
      function applyDefines(tokens, template, options, stIdx) {
        var unpredictable = 0;
        for (var i = stIdx || 0, token; token = tokens[i]; i++) {
          var tokenType = token[TOKEN_TYPE];
          if (tokenType == TYPE_ELEMENT) unpredictable += applyDefines(token, template, options, ELEMENT_ATTRS);
          if (tokenType == TYPE_ATTRIBUTE_CLASS || tokenType == TYPE_ATTRIBUTE && token[ATTR_NAME] == "class") {
            var bindings = token[TOKEN_BINDINGS];
            var valueIdx = ATTR_VALUE_INDEX[tokenType];
            if (bindings) {
              var newAttrValue = (token[valueIdx] || "").trim().split(" ");
              for (var k = 0, bind; bind = bindings[k]; k++) {
                if (bind.length > 2) continue;
                var bindName = bind[1].split(":").pop();
                var bindDef = template.defines[bindName];
                if (bindDef) {
                  bind.push.apply(bind, bindDef);
                  bindDef.used = true;
                  if (bindDef[0]) {
                    if (bindDef.length == 1) arrayAdd(newAttrValue, bind[0] + bindName); else arrayAdd(newAttrValue, bind[0] + bindDef[1][bindDef[0] - 1]);
                  }
                } else {
                  template.warns.push("Unpredictable value `" + bindName + "` in class binding: " + bind[0] + "{" + bind[1] + "}");
                  unpredictable++;
                }
              }
              token[valueIdx] = newAttrValue.join(" ");
              if (options.optimizeSize && !token[valueIdx]) token.length = valueIdx;
            }
          }
        }
        return unpredictable;
      }
      function isolateTokens(tokens, isolate, template, stIdx) {
        function processName(name) {
          var parts = name.split(":");
          if (parts.length == 1) return isolate + parts[0];
          if (!template) return name;
          if (!parts[0]) return parts[1];
          if (parts[0] in template.styleNSPrefix == false) {
            template.warns.push("Namespace `" + parts[0] + "` is not defined in template, no prefix added");
            return name;
          }
          return template.styleNSPrefix[parts[0]] + parts[1];
        }
        for (var i = stIdx || 0, token; token = tokens[i]; i++) {
          var tokenType = token[TOKEN_TYPE];
          if (tokenType == TYPE_ELEMENT) isolateTokens(token, isolate, template, ELEMENT_ATTRS);
          if (tokenType == TYPE_ATTRIBUTE_CLASS || tokenType == TYPE_ATTRIBUTE && token[ATTR_NAME] == "class") {
            var bindings = token[TOKEN_BINDINGS];
            var valueIndex = ATTR_VALUE_INDEX[tokenType];
            if (token[valueIndex]) token[valueIndex] = token[valueIndex].split(/\s+/).map(processName).join(" ");
            if (bindings) for (var k = 0, bind; bind = bindings[k]; k++) bind[0] = processName(bind[0]);
          }
        }
      }
      return function makeDeclaration(source, baseURI, options, sourceUrl, sourceOrigin) {
        options = options || {};
        var warns = [];
        var source_;
        var result = {
          sourceUrl: sourceUrl,
          baseURI: baseURI || "",
          tokens: null,
          resources: [],
          styleNSPrefix: {},
          deps: [],
          l10n: [],
          defines: {},
          unpredictable: true,
          warns: warns,
          isolate: false
        };
        result.dictURI = sourceUrl ? basis.path.resolve(sourceUrl) : baseURI || "";
        if (result.dictURI) {
          var extname = basis.path.extname(result.dictURI);
          if (extname && extname != ".l10n") result.dictURI = result.dictURI.substr(0, result.dictURI.length - extname.length) + ".l10n";
        }
        if (!source.templateTokens) {
          source_ = source;
          source = tokenize(String(source));
        }
        if (source.warns) warns.push.apply(warns, source.warns);
        includeStack.push(sourceOrigin !== true && sourceOrigin || {});
        result.tokens = process(source, result, options);
        includeStack.pop();
        if (!result.tokens) result.tokens = [ [ 3, 0, 0, "" ] ];
        if (source_) result.tokens.source_ = source_;
        addTokenRef(result.tokens[0], "element");
        normalizeRefs(result.tokens, result.dictURI);
        result.unpredictable = !!applyDefines(result.tokens, result, options);
        if (/^[^a-z]/i.test(result.isolate)) basis.dev.error("basis.template: isolation prefix `" + result.isolate + "` should not starts with symbol other than letter, otherwise it leads to incorrect css class names and broken styles");
        if (includeStack.length == 0) {
          isolateTokens(result.tokens, result.isolate || "", result);
          if (result.isolate) for (var i = 0, item; item = result.resources[i]; i++) if (item[1] !== styleNamespaceIsolate) item[1] = result.isolate + item[1];
          result.resources = result.resources.filter(function(item, idx, array) {
            return !basis.array.search(array, String(item), String, idx + 1);
          }).map(function(item) {
            var url = item[0];
            var isolate = item[1];
            if (isolate === styleNamespaceIsolate) isolate = styleNamespaceIsolate[url];
            if (!isolate) return url;
            var resource = basis.resource.virtual("css", "").ready(function(cssResource) {
              sourceResource();
              basis.object.extend(cssResource, {
                url: url + "?isolate-prefix=" + isolate,
                baseURI: basis.path.dirname(url) + "/"
              });
            });
            var sourceResource = basis.resource(url).ready(function(cssResource) {
              var cssText = isolateCss(cssResource.cssText || "", isolate);
              if (typeof btoa == "function") cssText += "\n/*# sourceMappingURL=data:application/json;base64," + btoa('{"version":3,"sources":["' + basis.path.origin + url + '"],' + '"mappings":"AAAA' + basis.string.repeat(";AACA", cssText.split("\n").length) + '"}') + " */";
              resource.update(cssText);
            });
            return resource.url;
          });
        }
        for (var key in result.defines) if (!result.defines[key].used) warns.push("Unused define for " + key);
        delete result.defines;
        delete result.l10nResolved;
        if (!warns.length) result.warns = false;
        return result;
      };
    }();
    function startUseResource(uri) {
      var resource = basis.resource(uri).fetch();
      if (typeof resource.startUse == "function") resource.startUse();
    }
    function stopUseResource(uri) {
      var resource = basis.resource(uri).fetch();
      if (typeof resource.stopUse == "function") resource.stopUse();
    }
    function templateSourceUpdate() {
      if (this.destroyBuilder) buildTemplate.call(this);
      for (var i = 0, attach; attach = this.attaches_[i]; i++) attach.handler.call(attach.context);
    }
    function cloneDecl(array) {
      var result = [];
      if (array.source_) result.source_ = array.source_;
      for (var i = 0; i < array.length; i++) result.push(Array.isArray(array[i]) ? cloneDecl(array[i]) : array[i]);
      return result;
    }
    function getDeclFromSource(source, baseURI, clone, options) {
      var result = source;
      var sourceUrl;
      if (typeof result == "function") {
        baseURI = "baseURI" in source ? source.baseURI : baseURI;
        sourceUrl = "url" in source ? source.url : sourceUrl;
        result = result();
      }
      if (result instanceof basis.Token) {
        baseURI = "baseURI" in source ? source.baseURI : baseURI;
        sourceUrl = "url" in source ? source.url : sourceUrl;
        result = result.get();
      }
      if (Array.isArray(result)) {
        if (clone) result = cloneDecl(result);
        result = {
          tokens: result
        };
      } else {
        if (typeof result != "object" || !Array.isArray(result.tokens)) result = String(result);
      }
      if (typeof result == "string") result = makeDeclaration(result, baseURI, options, sourceUrl, source);
      return result;
    }
    function l10nHandler(value) {
      if (this.type != "markup" && this.token.type == "markup") {
        buildTemplate.call(this.template);
      }
    }
    function buildTemplate() {
      var decl = getDeclFromSource(this.source, this.baseURI, false, {
        isolate: this.getIsolatePrefix()
      });
      var destroyBuilder = this.destroyBuilder;
      var funcs = this.builder(decl.tokens, this);
      var deps = this.deps_;
      var l10n = this.l10n_;
      if (deps) {
        this.deps_ = null;
        for (var i = 0, dep; dep = deps[i]; i++) dep.bindingBridge.detach(dep, buildTemplate, this);
      }
      if (l10n) for (var i = 0, item; item = l10n[i]; i++) item.token.bindingBridge.detach(item.token, l10nHandler, item);
      if (decl.deps && decl.deps.length) {
        deps = decl.deps;
        this.deps_ = deps;
        for (var i = 0, dep; dep = deps[i]; i++) dep.bindingBridge.attach(dep, buildTemplate, this);
      }
      if (decl.l10n) {
        l10n = decl.l10n;
        this.l10n_ = {};
        for (var i = 0, key; key = l10n[i]; i++) {
          var l10nToken = basis.l10n.token(key);
          l10nToken.bindingBridge.attach(l10nToken, l10nHandler, this.l10n_[key] = {
            template: this,
            token: l10nToken,
            type: l10nToken.type
          });
        }
      }
      this.createInstance = funcs.createInstance;
      this.clearInstance = funcs.destroyInstance;
      this.getBinding = function() {
        return {
          names: funcs.keys
        };
      };
      this.destroyBuilder = funcs.destroy;
      this.instances_ = funcs.instances_;
      this.decl_ = decl;
      var declResources = decl.resources && decl.resources.length > 0 ? decl.resources : null;
      if (declResources) for (var i = 0, res; res = declResources[i]; i++) startUseResource(res);
      if (this.resources) for (var i = 0, res; res = this.resources[i]; i++) stopUseResource(res);
      this.resources = declResources;
      if (destroyBuilder) destroyBuilder(true);
    }
    var sourceByDocumentIdResolvers = {};
    function getTemplateByDocumentId(id) {
      var resolver = resolveSourceByDocumentId(id);
      if (resolver.template) return resolver.template;
      var host = document.getElementById(id);
      var source = "";
      if (host && host.tagName == "SCRIPT" && host.type == "text/basis-template") source = host.textContent || host.text; else if (!host) basis.dev.warn("Template script element with id `" + id + "` not found"); else basis.dev.warn('Template should be declared in <script type="text/basis-template"> element (id `' + sourceId + "`)");
      return resolver.template = new Template(source);
    }
    function resolveSourceByDocumentId(sourceId) {
      var resolver = sourceByDocumentIdResolvers[sourceId];
      if (!resolver) {
        resolver = sourceByDocumentIdResolvers[sourceId] = function() {
          return getTemplateByDocumentId(sourceId).source;
        };
        resolver.id = sourceId;
        resolver.url = '<script id="' + sourceId + '"/>';
      }
      return resolver;
    }
    var Template = Class(null, {
      className: namespace + ".Template",
      __extend__: function(value) {
        if (value instanceof Template) return value;
        if (value instanceof TemplateSwitchConfig) return new TemplateSwitcher(value);
        return new Template(value);
      },
      source: "",
      baseURI: "",
      init: function(source) {
        if (templateList.length == 4096) throw "Too many templates (maximum 4096)";
        this.attaches_ = [];
        this.setSource(source || "");
        this.templateId = templateList.push(this) - 1;
      },
      bindingBridge: {
        attach: function(template, handler, context) {
          for (var i = 0, listener; listener = template.attaches_[i]; i++) if (listener.handler == handler && listener.context == context) return;
          template.attaches_.push({
            handler: handler,
            context: context
          });
        },
        detach: function(template, handler, context) {
          for (var i = 0, listener; listener = template.attaches_[i]; i++) if (listener.handler == handler && listener.context == context) {
            template.attaches_.splice(i, 1);
            return;
          }
        },
        get: function() {}
      },
      createInstance: function(object, actionCallback, updateCallback, bindings, bindingInterface) {
        buildTemplate.call(this);
        return this.createInstance(object, actionCallback, updateCallback, bindings, bindingInterface);
      },
      clearInstance: function(tmpl) {},
      getIsolatePrefix: function() {
        return "i" + this.templateId + "__";
      },
      getBinding: function(bindings) {
        buildTemplate.call(this);
        return this.getBinding(bindings);
      },
      setSource: function(source) {
        var oldSource = this.source;
        if (oldSource != source) {
          if (typeof source == "string") {
            var m = source.match(/^([a-z]+):/);
            if (m) {
              var prefix = m[1];
              source = source.substr(m[0].length);
              switch (prefix) {
                case "file":
                  source = basis.resource(source);
                  break;
                case "id":
                  source = resolveSourceByDocumentId(source);
                  break;
                case "tokens":
                  source = basis.string.toObject(source);
                  source.isDecl = true;
                  break;
                case "raw":
                  break;
                case "path":
                  source = getSourceByPath(source);
                  break;
                default:
                  basis.dev.warn(namespace + ".Template.setSource: Unknown prefix " + prefix + " for template source was ingnored.");
              }
            }
          }
          if (oldSource && oldSource.bindingBridge) {
            var tmplList = oldSource.url && tmplFilesMap[oldSource.url];
            if (tmplList) {
              arrayRemove(tmplList, this);
              if (!tmplList.length) delete tmplFilesMap[oldSource.url];
            }
            this.baseURI = "";
            this.source.bindingBridge.detach(oldSource, templateSourceUpdate, this);
          }
          if (source && source.bindingBridge) {
            if (source.url) {
              this.baseURI = path.dirname(source.url) + "/";
              if (!tmplFilesMap[source.url]) tmplFilesMap[source.url] = [];
              arrayAdd(tmplFilesMap[source.url], this);
            }
            source.bindingBridge.attach(source, templateSourceUpdate, this);
          }
          this.source = source;
          templateSourceUpdate.call(this);
        }
      },
      destroy: function() {
        if (this.destroyBuilder) this.destroyBuilder();
        this.attaches_ = null;
        this.createInstance = null;
        this.getBinding = null;
        this.resources = null;
        this.source = null;
        this.instances_ = null;
        this.decl_ = null;
      }
    });
    var TemplateSwitchConfig = function(config) {
      basis.object.extend(this, config);
    };
    var TemplateSwitcher = basis.Class(null, {
      className: namespace + ".TemplateSwitcher",
      ruleRet_: null,
      templates_: null,
      templateClass: Template,
      ruleEvents: null,
      rule: String,
      init: function(config) {
        this.ruleRet_ = [];
        this.templates_ = [];
        this.rule = config.rule;
        var events = config.events;
        if (events && events.length) {
          this.ruleEvents = {};
          for (var i = 0, eventName; eventName = events[i]; i++) this.ruleEvents[eventName] = true;
        }
        cleaner.add(this);
      },
      resolve: function(object) {
        var ret = this.rule(object);
        var idx = this.ruleRet_.indexOf(ret);
        if (idx == -1) {
          this.ruleRet_.push(ret);
          idx = this.templates_.push(new this.templateClass(ret)) - 1;
        }
        return this.templates_[idx];
      },
      destroy: function() {
        this.rule = null;
        this.templates_ = null;
        this.ruleRet_ = null;
      }
    });
    function switcher(events, rule) {
      var args = basis.array(arguments);
      var rule = args.pop();
      return new TemplateSwitchConfig({
        rule: rule,
        events: args.join(" ").trim().split(/\s+/)
      });
    }
    var Theme = Class(null, {
      className: namespace + ".Theme",
      get: getSourceByPath
    });
    var SourceWrapper = Class(basis.Token, {
      className: namespace + ".SourceWrapper",
      path: "",
      url: "",
      baseURI: "",
      init: function(value, path) {
        this.path = path;
        basis.Token.prototype.init.call(this, "");
      },
      get: function() {
        return this.value && this.value.bindingBridge ? this.value.bindingBridge.get(this.value) : this.value;
      },
      set: function() {
        var content = getThemeSource(currentThemeName, this.path);
        if (this.value != content) {
          if (this.value && this.value.bindingBridge) this.value.bindingBridge.detach(this.value, SourceWrapper.prototype.apply, this);
          this.value = content;
          this.url = content && content.url || "";
          this.baseURI = (typeof content == "object" || typeof content == "function") && "baseURI" in content ? content.baseURI : path.dirname(this.url) + "/";
          if (this.value && this.value.bindingBridge) this.value.bindingBridge.attach(this.value, SourceWrapper.prototype.apply, this);
          this.apply();
        }
      },
      destroy: function() {
        this.url = null;
        this.baseURI = null;
        if (this.value && this.value.bindingBridge) this.value.bindingBridge.detach(this.value, this.apply, this);
        basis.Token.prototype.destroy.call(this);
      }
    });
    function getSourceByPath() {
      var path = basis.array(arguments).join(".");
      var source = sourceByPath[path];
      if (!source) {
        source = new SourceWrapper("", path);
        sourceByPath[path] = source;
      }
      return source;
    }
    function normalize(list) {
      var used = {};
      var result = [];
      for (var i = 0; i < list.length; i++) if (!used[list[i]]) {
        used[list[i]] = true;
        result.push(list[i]);
      }
      return result;
    }
    function extendFallback(themeName, list) {
      var result = [];
      result.source = normalize(list).join("/");
      var used = {
        base: true
      };
      for (var i = 0; i < list.length; i++) {
        var name = list[i] || "base";
        if (name == themeName || used[name]) continue;
        var theme = getTheme(name);
        used[name] = true;
        result.push(name);
        list.splice.apply(list, [ i + 1, 0 ].concat(themes[name].fallback));
      }
      result.unshift(themeName);
      if (themeName != "base") result.push("base");
      result.value = result.join("/");
      return result;
    }
    function getThemeSource(name, path) {
      var sourceList = themes[name].sourcesList;
      for (var i = 0, map; map = sourceList[i]; i++) if (map.hasOwnProperty(path)) return map[path];
      return "";
    }
    function themeHasEffect(themeName) {
      return themes[currentThemeName].fallback.indexOf(themeName) != -1;
    }
    function syncCurrentThemePath(path) {
      getSourceByPath(path).set();
    }
    function syncCurrentTheme(changed) {
      basis.dev.log("re-apply templates");
      for (var path in sourceByPath) syncCurrentThemePath(path);
    }
    function getTheme(name) {
      if (!name) name = "base";
      if (themes[name]) return themes[name].theme;
      if (!/^([a-z0-9\_\-]+)$/.test(name)) throw "Bad name for theme - " + name;
      var sources = {};
      var sourceList = [ sources ];
      var themeInterface = new Theme;
      themes[name] = {
        theme: themeInterface,
        sources: sources,
        sourcesList: sourceList,
        fallback: []
      };
      var addSource = function(path, source) {
        if (path in sources == false) {
          sources[path] = source;
          if (themeHasEffect(name)) syncCurrentThemePath(path);
        } else basis.dev.warn("Template path `" + path + "` is already defined for theme `" + name + "` (definition ignored).");
        return getSourceByPath(path);
      };
      basis.object.extend(themeInterface, {
        name: name,
        fallback: function(value) {
          if (themeInterface !== baseTheme && arguments.length > 0) {
            var newFallback = typeof value == "string" ? value.split("/") : [];
            var changed = {};
            newFallback = extendFallback(name, newFallback);
            if (themes[name].fallback.source != newFallback.source) {
              themes[name].fallback.source = newFallback.source;
              basis.dev.log("fallback changed");
              for (var themeName in themes) {
                var curFallback = themes[themeName].fallback;
                var newFallback = extendFallback(themeName, (curFallback.source || "").split("/"));
                if (newFallback.value != curFallback.value) {
                  changed[themeName] = true;
                  themes[themeName].fallback = newFallback;
                  var sourceList = themes[themeName].sourcesList;
                  sourceList.length = newFallback.length;
                  for (var i = 0; i < sourceList.length; i++) sourceList[i] = themes[newFallback[i]].sources;
                }
              }
            }
            var currentFallback = themes[currentThemeName].fallback;
            for (var themeName in changed) {
              if (themeHasEffect(themeName)) {
                syncCurrentTheme();
                break;
              }
            }
          }
          var result = themes[name].fallback.slice(1);
          result.source = themes[name].fallback.source;
          return result;
        },
        define: function(what, wherewith) {
          if (typeof what == "function") what = what();
          if (typeof what == "string") {
            if (typeof wherewith == "object") {
              var namespace = what;
              var dictionary = wherewith;
              var result = {};
              for (var key in dictionary) if (dictionary.hasOwnProperty(key)) result[key] = addSource(namespace + "." + key, dictionary[key]);
              return result;
            } else {
              if (arguments.length == 1) {
                return getSourceByPath(what);
              } else {
                return addSource(what, wherewith);
              }
            }
          } else {
            if (typeof what == "object") {
              var dictionary = what;
              for (var path in dictionary) if (dictionary.hasOwnProperty(path)) addSource(path, dictionary[path]);
              return themeInterface;
            } else {
              basis.dev.warn("Wrong first argument for basis.template.Theme#define");
            }
          }
        },
        apply: function() {
          if (name != currentThemeName) {
            currentThemeName = name;
            syncCurrentTheme();
            for (var i = 0, handler; handler = themeChangeHandlers[i]; i++) handler.fn.call(handler.context, name);
            basis.dev.info("Template theme switched to `" + name + "`");
          }
          return themeInterface;
        },
        getSource: function(path, withFallback) {
          return withFallback ? getThemeSource(name, path) : sources[path];
        },
        drop: function(path) {
          if (sources.hasOwnProperty(path)) {
            delete sources[path];
            if (themeHasEffect(name)) syncCurrentThemePath(path);
          }
        }
      });
      themes[name].fallback = extendFallback(name, []);
      sourceList.push(themes.base.sources);
      return themeInterface;
    }
    var themes = {};
    var sourceByPath = {};
    var baseTheme = getTheme();
    var currentThemeName = "base";
    var themeChangeHandlers = [];
    function onThemeChange(fn, context, fire) {
      themeChangeHandlers.push({
        fn: fn,
        context: context
      });
      if (fire) fn.call(context, currentThemeName);
    }
    cleaner.add({
      destroy: function() {
        for (var path in sourceByPath) sourceByPath[path].destroy();
        themes = null;
        sourceByPath = null;
        for (var i = 0, template; template = templateList[i]; i++) template.destroy();
        templateList = null;
      }
    });
    module.exports = {
      DECLARATION_VERSION: DECLARATION_VERSION,
      TYPE_ELEMENT: TYPE_ELEMENT,
      TYPE_ATTRIBUTE: TYPE_ATTRIBUTE,
      TYPE_ATTRIBUTE_CLASS: TYPE_ATTRIBUTE_CLASS,
      TYPE_ATTRIBUTE_STYLE: TYPE_ATTRIBUTE_STYLE,
      TYPE_ATTRIBUTE_EVENT: TYPE_ATTRIBUTE_EVENT,
      TYPE_TEXT: TYPE_TEXT,
      TYPE_COMMENT: TYPE_COMMENT,
      TOKEN_TYPE: TOKEN_TYPE,
      TOKEN_BINDINGS: TOKEN_BINDINGS,
      TOKEN_REFS: TOKEN_REFS,
      ATTR_NAME: ATTR_NAME,
      ATTR_VALUE: ATTR_VALUE,
      ATTR_NAME_BY_TYPE: ATTR_NAME_BY_TYPE,
      ELEMENT_NAME: ELEMENT_NAME,
      ELEMENT_ATTRS: ELEMENT_ATTRS,
      ELEMENT_CHILDS: ELEMENT_CHILDS,
      TEXT_VALUE: TEXT_VALUE,
      COMMENT_VALUE: COMMENT_VALUE,
      L10nProxyToken: L10nProxyToken,
      TemplateSwitchConfig: TemplateSwitchConfig,
      TemplateSwitcher: TemplateSwitcher,
      Template: Template,
      SourceWrapper: SourceWrapper,
      switcher: switcher,
      tokenize: tokenize,
      isolateCss: isolateCss,
      getDeclFromSource: getDeclFromSource,
      makeDeclaration: makeDeclaration,
      getL10nTemplate: getL10nTemplate,
      Theme: Theme,
      theme: getTheme,
      getThemeList: function() {
        return basis.object.keys(themes);
      },
      currentTheme: function() {
        return themes[currentThemeName].theme;
      },
      setTheme: function(name) {
        return getTheme(name).apply();
      },
      onThemeChange: onThemeChange,
      define: baseTheme.define,
      get: getSourceByPath,
      getPathList: function() {
        return basis.object.keys(sourceByPath);
      }
    };
  },
  "6.js": function(exports, module, basis, global, __filename, __dirname, require, resource) {
    basis.require("./5.js");
    var TYPE_ELEMENT = basis.template.TYPE_ELEMENT;
    var TYPE_ATTRIBUTE = basis.template.TYPE_ATTRIBUTE;
    var TYPE_TEXT = basis.template.TYPE_TEXT;
    var TYPE_COMMENT = basis.template.TYPE_COMMENT;
    var TOKEN_TYPE = basis.template.TOKEN_TYPE;
    var TOKEN_BINDINGS = basis.template.TOKEN_BINDINGS;
    var TOKEN_REFS = basis.template.TOKEN_REFS;
    var ATTR_NAME = basis.template.ATTR_NAME;
    var ATTR_NAME_BY_TYPE = basis.template.ATTR_NAME_BY_TYPE;
    var ELEMENT_NAME = basis.template.ELEMENT_NAME;
    var ELEMENT_ATTRS = basis.template.ELEMENT_ATTRS;
    var ELEMENT_CHILDS = basis.template.ELEMENT_CHILDS;
    var TEXT_VALUE = basis.template.TEXT_VALUE;
    var COMMENT_VALUE = basis.template.COMMENT_VALUE;
    var tmplFunctions = {};
    var inlineSeed = 1;
    var buildPathes = function() {
      var PATH_REF_NAME = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      var pathList;
      var refList;
      var bindingList;
      var markedElementList;
      var rootPath;
      var attrExprId;
      function putRefs(refs, pathIdx) {
        for (var i = 0, refName; refName = refs[i]; i++) if (refName.indexOf(":") == -1) refList.push(refName + ":" + pathIdx);
      }
      function putPath(path) {
        var len = pathList.length;
        var pathRef = PATH_REF_NAME[len] || "r" + len;
        pathList.push(pathRef + "=" + path);
        return pathRef;
      }
      function putBinding(binding) {
        bindingList.push(binding);
      }
      function processTokens(tokens, path, noTextBug, templateMarker) {
        var localPath;
        var refs;
        var myRef;
        var explicitRef;
        var bindings;
        for (var i = 0, cp = 0, closeText = 0, token; token = tokens[i]; i++, cp++, explicitRef = false) {
          if (!i) localPath = path + ".firstChild"; else {
            if (!tokens[i + 1]) localPath = path + ".lastChild"; else {
              if (token[TOKEN_TYPE] == tokens[i - 1][TOKEN_TYPE] && token[TOKEN_TYPE] == TYPE_TEXT) closeText++;
              localPath = path + ".childNodes[" + (noTextBug ? cp : cp + (closeText ? " + " + closeText + " * TEXT_BUG" : "")) + "]";
            }
          }
          if (refs = token[TOKEN_REFS]) {
            explicitRef = true;
            localPath = putPath(localPath);
            putRefs(refs, localPath);
          }
          if (token[TOKEN_BINDINGS]) {
            if (token[TOKEN_BINDINGS] && typeof token[TOKEN_BINDINGS] == "number") token[TOKEN_BINDINGS] = token[TOKEN_REFS][token[TOKEN_BINDINGS] - 1];
            if (!explicitRef) {
              explicitRef = true;
              localPath = putPath(localPath);
            }
            putBinding([ token[TOKEN_TYPE], localPath, token[TOKEN_BINDINGS] ]);
          }
          if (token[TOKEN_TYPE] == TYPE_ELEMENT) {
            myRef = -1;
            if (path == rootPath) markedElementList.push(localPath + "." + templateMarker);
            if (!explicitRef) {
              localPath = putPath(localPath);
              myRef = pathList.length;
            }
            var attrs = [];
            var children = [];
            for (var j = ELEMENT_ATTRS, t; t = token[j]; j++) if (t[TOKEN_TYPE] == TYPE_ELEMENT || t[TOKEN_TYPE] == TYPE_TEXT || t[TOKEN_TYPE] == TYPE_COMMENT) children.push(t); else attrs.push(t);
            for (var j = 0, attr; attr = attrs[j]; j++) {
              if (attr[TOKEN_TYPE] == 6) continue;
              var attrName = ATTR_NAME_BY_TYPE[attr[TOKEN_TYPE]] || attr[ATTR_NAME];
              if (refs = attr[TOKEN_REFS]) {
                explicitRef = true;
                putRefs(refs, putPath(localPath + '.getAttributeNode("' + attrName + '")'));
              }
              if (bindings = attr[TOKEN_BINDINGS]) {
                explicitRef = true;
                switch (attrName) {
                  case "class":
                    for (var k = 0, binding; binding = bindings[k]; k++) putBinding([ 2, localPath, binding[1], attrName, binding[0] ].concat(binding.slice(2)));
                    break;
                  case "style":
                    for (var k = 0, property; property = bindings[k]; k++) {
                      attrExprId++;
                      for (var m = 0, bindName; bindName = property[0][m]; m++) putBinding([ 2, localPath, bindName, attrName, property[0], property[1], property[2], property[3], attrExprId ]);
                    }
                    break;
                  default:
                    attrExprId++;
                    for (var k = 0, bindName; bindName = bindings[0][k]; k++) putBinding([ 2, localPath, bindName, attrName, bindings[0], bindings[1], token[ELEMENT_NAME], attrExprId ]);
                }
              }
            }
            if (children.length) processTokens(children, localPath, noTextBug);
            if (!explicitRef && myRef == pathList.length) pathList.pop();
          }
        }
      }
      return function(tokens, path, noTextBug, templateMarker) {
        pathList = [];
        refList = [];
        bindingList = [];
        markedElementList = [];
        rootPath = path || "_";
        attrExprId = 0;
        processTokens(tokens, rootPath, noTextBug, templateMarker);
        return {
          path: pathList,
          ref: refList,
          binding: bindingList,
          markedElementList: markedElementList
        };
      };
    }();
    var buildBindings = function() {
      var L10N_BINDING = /\.\{([a-zA-Z_][a-zA-Z0-9_\-]*)\}/;
      var SPECIAL_ATTR_MAP = {
        disabled: "*",
        checked: [ "input" ],
        indeterminate: [ "input" ],
        value: [ "input", "textarea", "select" ],
        minlength: [ "input" ],
        maxlength: [ "input" ],
        readonly: [ "input" ],
        selected: [ "option" ],
        multiple: [ "select" ]
      };
      var SPECIAL_ATTR_SINGLE = {
        disabled: true,
        checked: true,
        selected: true,
        readonly: true,
        multiple: true,
        indeterminate: true
      };
      var bindFunctions = {
        1: "bind_element",
        3: "bind_textNode",
        8: "bind_comment"
      };
      function buildAttrExpression(binding, special, l10n) {
        var expression = [];
        var symbols = binding[5];
        var dictionary = binding[4];
        var exprVar;
        var colonPos;
        for (var j = 0; j < symbols.length; j++) {
          if (typeof symbols[j] == "string") expression.push('"' + symbols[j].replace(/"/g, '\\"') + '"'); else {
            exprVar = dictionary[symbols[j]];
            colonPos = exprVar.indexOf(":");
            if (colonPos == -1) {
              expression.push(special == "l10n" ? '"{' + exprVar + '}"' : special == "bool" ? "(__" + exprVar + '||"")' : "__" + exprVar);
            } else {
              var bindingName = null;
              var l10nPath = exprVar.substr(colonPos + 1).replace(L10N_BINDING, function(m, name) {
                bindingName = name;
                return "";
              });
              if (bindingName) expression.push(l10n[exprVar.substr(colonPos + 1)]); else expression.push('__l10n["' + l10nPath + '"]');
            }
          }
        }
        if (expression.length == 1) expression.push('""');
        return expression.join("+");
      }
      return function(bindings) {
        function putBindCode(type) {
          toolsUsed[type] = true;
          bindCode.push(bindVar + "=" + type + "(" + basis.array(arguments, 1) + ");");
        }
        var bindMap = {};
        var bindCode;
        var bindVar;
        var varList = [];
        var result = [];
        var varName;
        var l10nMap;
        var l10nCompute = [];
        var l10nBindings = {};
        var l10nBindSeed = 1;
        var specialAttr;
        var attrExprId;
        var attrExprMap = {};
        var debugList = [];
        var toolsUsed = {
          resolve: true
        };
        for (var i = 0, binding; binding = bindings[i]; i++) {
          var bindType = binding[0];
          var domRef = binding[1];
          var bindName = binding[2];
          if ([ "get", "set", "templateId_" ].indexOf(bindName) != -1) {
            basis.dev.warn("binding name `" + bindName + "` is prohibited, binding ignored");
            continue;
          }
          var namePart = bindName.split(":");
          var anim = namePart[0] == "anim";
          if (anim) bindName = namePart[1];
          bindCode = bindMap[bindName];
          bindVar = "_" + i;
          varName = "__" + bindName;
          if (namePart[0] == "l10n" && namePart[1]) {
            var l10nFullPath = namePart[1];
            var l10nBinding = null;
            var l10nName = l10nFullPath.replace(L10N_BINDING, function(m, name) {
              l10nBinding = name;
              return "";
            });
            if (l10nBinding) {
              if (l10nFullPath in l10nBindings == false) {
                varName = "$l10n_" + l10nBindSeed++;
                l10nBindings[l10nFullPath] = varName;
                l10nCompute.push('set("' + varName + '",' + varName + ")");
                varList.push(varName + '=tools.l10nToken("' + l10nName + '").computeToken()');
                bindCode = bindMap[l10nBinding];
                if (!bindCode) {
                  bindCode = bindMap[l10nBinding] = [];
                  varList.push("__" + l10nBinding);
                }
                bindCode.push(varName + ".set(__" + l10nBinding + ");");
              }
              bindName = l10nBindings[l10nFullPath];
              bindVar = "_" + i;
              varName = "__" + bindName;
              bindCode = bindMap[bindName];
              if (!bindCode) {
                bindCode = bindMap[bindName] = [];
                varList.push(varName);
              }
              if (bindType == TYPE_TEXT) {
                debugList.push("{" + [ 'binding:"' + bindName + '"', "dom:" + domRef, "val:" + bindVar, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
                varList.push(bindVar + "=" + domRef);
                putBindCode(bindFunctions[bindType], domRef, bindVar, "value");
              } else {
                attrName = '"' + binding[ATTR_NAME] + '"';
                debugList.push("{" + [ 'binding:"' + l10nFullPath + '"', "dom:" + domRef, "attr:" + attrName, "val:" + bindVar, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
                varList.push(bindVar);
                putBindCode("bind_attr", domRef, attrName, bindVar, buildAttrExpression(binding, false, l10nBindings));
              }
              continue;
            }
            if (!l10nMap) l10nMap = {};
            if (!bindMap[l10nName]) {
              bindMap[l10nName] = [];
              l10nMap[l10nName] = [];
            }
            bindCode = bindMap[l10nName];
            bindCode.l10n = true;
            if (bindType == TYPE_TEXT) {
              debugList.push("{" + [ 'binding:"' + l10nFullPath + '"', "dom:" + domRef, 'val:__l10n["' + l10nName + '"]', 'attachment:l10nToken("' + l10nName + '")' ] + "}");
              toolsUsed.l10nToken = true;
              l10nMap[l10nName].push(domRef + ".nodeValue=value;");
              bindCode.push(domRef + '.nodeValue=__l10n["' + l10nName + '"]' + (l10nBinding ? "[__" + l10nBinding + "]" : "") + ";");
              continue;
            } else {
              l10nMap[l10nName].push("bind_attr(" + [ domRef, '"' + binding[ATTR_NAME] + '"', "NaN", buildAttrExpression(binding, "l10n", l10nBindings) ] + ");");
            }
          }
          if (!bindCode) {
            bindCode = bindMap[bindName] = [];
            varList.push(varName);
          }
          if (bindType != TYPE_ATTRIBUTE) {
            debugList.push("{" + [ 'binding:"' + bindName + '"', "dom:" + domRef, "val:" + (bindCode.nodeBind ? varName : bindVar), "updates:$$" + bindName, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
            if (!bindCode.nodeBind) {
              varList.push(bindVar + "=" + domRef);
              putBindCode(bindFunctions[bindType], domRef, bindVar, "value");
              bindCode.nodeBind = bindVar;
            } else {
              switch (bindType) {
                case TYPE_ELEMENT:
                  putBindCode(bindFunctions[bindType], domRef, domRef, "value!==null?String(value):null");
                  break;
                case TYPE_TEXT:
                  bindCode.push(domRef + ".nodeValue=value;");
                  break;
              }
            }
          } else {
            var attrName = binding[ATTR_NAME];
            switch (attrName) {
              case "class":
                var defaultExpr = "";
                var valueExpr = "value";
                var prefix = binding[4];
                var bindingLength = binding.length;
                if (bindingLength >= 6) {
                  if (bindingLength == 6 || typeof binding[6] == "string") {
                    if (bindingLength == 6) {
                      valueExpr = 'value?"' + bindName + '":""';
                      if (binding[5]) defaultExpr = prefix + bindName;
                    } else {
                      prefix = "";
                      valueExpr = 'value?"' + binding[6] + '":""';
                      if (binding[5]) defaultExpr = binding[6];
                    }
                  } else {
                    if (!binding[6].length) continue;
                    if (bindingLength == 7) {
                      valueExpr = binding[6].map(function(val) {
                        return 'value=="' + val + '"';
                      }).join("||") + '?value:""';
                      if (binding[5]) defaultExpr = prefix + binding[6][binding[5] - 1];
                    } else {
                      prefix = "";
                      valueExpr = binding[6].map(function(val, idx) {
                        return 'value=="' + val + '"?"' + this[idx] + '"';
                      }, binding[7]).join(":") + ':""';
                      if (binding[5]) defaultExpr = binding[7][binding[5] - 1];
                    }
                  }
                } else {
                  valueExpr = 'typeof value=="string"||typeof value=="number"?value:(value?"' + bindName + '":"")';
                }
                varList.push(bindVar + '="' + defaultExpr + '"');
                putBindCode("bind_attrClass", domRef, bindVar, valueExpr, '"' + prefix + '"', anim);
                break;
              case "style":
                var expr = buildAttrExpression(binding, false, l10nBindings);
                attrExprId = binding[8];
                if (!attrExprMap[attrExprId]) {
                  attrExprMap[attrExprId] = bindVar;
                  varList.push(bindVar + "=" + (binding[7] == "hide" ? '""' : '"none"'));
                }
                if (binding[7]) expr = expr.replace(/\+""$/, "") + (binding[7] == "hide" ? '?"none":""' : '?"":"none"');
                bindVar = attrExprMap[attrExprId];
                putBindCode("bind_attrStyle", domRef, '"' + binding[6] + '"', bindVar, expr);
                break;
              default:
                specialAttr = SPECIAL_ATTR_MAP[attrName];
                attrExprId = binding[7];
                if (!attrExprMap[attrExprId]) {
                  varList.push(bindVar + "=" + buildAttrExpression(binding, "l10n", l10nBindings));
                  attrExprMap[attrExprId] = bindVar;
                }
                bindVar = attrExprMap[attrExprId];
                putBindCode("bind_attr", domRef, '"' + attrName + '"', bindVar, specialAttr && SPECIAL_ATTR_SINGLE[attrName] ? buildAttrExpression(binding, "bool", l10nBindings) + '?"' + attrName + '":""' : buildAttrExpression(binding, false, l10nBindings));
                if (specialAttr && (specialAttr == "*" || specialAttr.indexOf(binding[6].toLowerCase()) != -1)) bindCode.push("if(" + domRef + "." + attrName + "!=" + bindVar + ")" + domRef + "." + attrName + "=" + (SPECIAL_ATTR_SINGLE[attrName] ? "!!" + bindVar : bindVar) + ";");
            }
            debugList.push("{" + [ 'binding:"' + bindName + '"', "dom:" + domRef, 'attr:"' + attrName + '"', "val:" + bindVar, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
          }
        }
        result.push(";function set(bindName,value){" + 'if(typeof bindName!="string")');
        for (var bindName in bindMap) if (bindMap[bindName].nodeBind) {
          result.push("if(bindName===" + bindMap[bindName].nodeBind + ")" + 'bindName="' + bindName + '";' + "else ");
        }
        result.push("return;");
        result.push("value=resolve.call(instance,bindName,value,Attaches);" + "switch(bindName){");
        for (var bindName in bindMap) {
          if (bindName.indexOf("@") == -1) varList.push("$$" + bindName + "=0");
          result.push('case"' + bindName + '":' + (bindMap[bindName].l10n ? bindMap[bindName].join("") : "if(__" + bindName + "!==value)" + "{" + "$$" + bindName + "++;" + "__" + bindName + "=value;" + bindMap[bindName].join("") + "}") + "break;");
        }
        result.push("}}");
        var toolsVarList = [];
        for (var key in toolsUsed) toolsVarList.push(key + "=tools." + key);
        return {
          debugList: debugList,
          keys: basis.object.keys(bindMap).filter(function(key) {
            return key.indexOf("@") == -1;
          }),
          tools: toolsVarList,
          vars: varList,
          set: result.join(""),
          l10n: l10nMap,
          l10nCompute: l10nCompute
        };
      };
    }();
    function compileFunction(args, body) {
      try {
        return new Function(args, body);
      } catch (e) {
        basis.dev.error("Can't build template function: " + e + "\n", "function(" + args + "){\n" + body + "\n}");
      }
    }
    var getFunctions = function(tokens, debug, uri, source, noTextBug, templateMarker) {
      var fn = tmplFunctions[uri && basis.path.relative(uri)];
      if (fn) return fn;
      var paths = buildPathes(tokens, "_", noTextBug, templateMarker);
      var bindings = buildBindings(paths.binding);
      var objectRefs = paths.markedElementList.join("=");
      var createInstance;
      var fnBody;
      var result = {
        keys: bindings.keys,
        l10nKeys: basis.object.keys(bindings.l10n)
      };
      if (tokens.length == 1) paths.path[0] = "a=_";
      if (!uri) uri = basis.path.baseURI + "inline_template" + inlineSeed++ + ".tmpl";
      if (bindings.l10n) {
        var code = [];
        for (var key in bindings.l10n) code.push('case"' + key + '":' + 'if(value==null)value="{' + key + '}";' + "__l10n[token]=value;" + bindings.l10n[key].join("") + "break;");
        result.createL10nSync = compileFunction([ "_", "__l10n", "bind_attr", "TEXT_BUG" ], (source ? "\n// " + source.split(/\r\n?|\n\r?/).join("\n// ") + "\n\n" : "") + "var " + paths.path + ";" + "return function(token, value){" + "switch(token){" + code.join("") + "}" + "}" + "\n\n//# sourceURL=" + basis.path.origin + uri + "_l10n");
      }
      result.createInstance = compileFunction([ "tid", "map", "proto", "tools", "__l10n", "TEXT_BUG" ], (source ? "\n// " + source.split(/\r\n?|\n\r?/).join("\n// ") + "\n\n" : "") + "var getBindings=tools.createBindingFunction([" + bindings.keys.map(function(key) {
        return '"' + key + '"';
      }) + "])," + (bindings.tools.length ? bindings.tools + "," : "") + "Attaches=function(){};" + "Attaches.prototype={" + bindings.keys.map(function(key) {
        return key + ":null";
      }) + "};" + "return function createInstance_(id,obj,onAction,onRebuild,bindings,bindingInterface){" + "var _=proto.cloneNode(true)," + paths.path.concat(bindings.vars) + "," + "instance={" + "context:obj," + "action:onAction," + "rebuild:onRebuild," + (debug ? "debug:function debug(){return[" + bindings.debugList + "]}," : "") + "handler:null," + "bindings:bindings," + "bindingInterface:bindingInterface," + "attaches:null," + "tmpl:{" + [ paths.ref, "templateId_:id", "set:set" ] + "}" + "}" + (objectRefs ? ";if(obj||onAction)" + objectRefs + "=(id<<12)|tid" : "") + bindings.set + ";if(bindings)instance.handler=getBindings(bindings,obj,set,bindingInterface)" + ";" + bindings.l10nCompute + ";return instance" + "}" + "\n\n//# sourceURL=" + basis.path.origin + uri);
      return result;
    };
    module.exports = {
      getFunctions: getFunctions
    };
  }
};

(function createBasisInstance(global, __basisFilename, __config) {
  "use strict";
  var VERSION = "1.3.3";
  var document = global.document;
  var toString = Object.prototype.toString;
  function genUID(len) {
    function base36(val) {
      return Math.round(val).toString(36);
    }
    var result = base36(10 + 25 * Math.random());
    if (!len) len = 16;
    while (result.length < len) result += base36(new Date * Math.random());
    return result.substr(0, len);
  }
  function extend(dest, source) {
    for (var key in source) dest[key] = source[key];
    return dest;
  }
  function complete(dest, source) {
    for (var key in source) if (key in dest == false) dest[key] = source[key];
    return dest;
  }
  function keys(object) {
    var result = [];
    for (var key in object) result.push(key);
    return result;
  }
  function values(object) {
    var result = [];
    for (var key in object) result.push(object[key]);
    return result;
  }
  function slice(source, keys) {
    var result = {};
    if (!keys) return extend(result, source);
    for (var i = 0, key; key = keys[i++]; ) if (key in source) result[key] = source[key];
    return result;
  }
  function splice(source, keys) {
    var result = {};
    if (!keys) return extend(result, source);
    for (var i = 0, key; key = keys[i++]; ) if (key in source) {
      result[key] = source[key];
      delete source[key];
    }
    return result;
  }
  function merge() {
    var result = {};
    for (var i = 0; i < arguments.length; i++) extend(result, arguments[i]);
    return result;
  }
  function iterate(object, callback, thisObject) {
    var result = [];
    for (var key in object) result.push(callback.call(thisObject, key, object[key]));
    return result;
  }
  function $undefined(value) {
    return value == undefined;
  }
  function $defined(value) {
    return value != undefined;
  }
  function $isNull(value) {
    return value == null || value == undefined;
  }
  function $isNotNull(value) {
    return value != null && value != undefined;
  }
  function $isSame(value) {
    return value === this;
  }
  function $isNotSame(value) {
    return value !== this;
  }
  function $self(value) {
    return value;
  }
  function $const(value) {
    return function() {
      return value;
    };
  }
  function $false() {
    return false;
  }
  function $true() {
    return true;
  }
  function $null() {
    return null;
  }
  function $undef() {}
  var getter = function() {
    var ID = "basisGetterId" + genUID() + "_";
    var modificatorSeed = 1;
    var simplePath = /^[a-z$_][a-z$_0-9]*(\.[a-z$_][a-z$_0-9]*)*$/i;
    var getterMap = [];
    var pathCache = {};
    var modCache = {};
    function buildFunction(path) {
      if (simplePath.test(path)) {
        var parts = path.split(".");
        var foo = parts[0];
        var bar = parts[1];
        var baz = parts[2];
        var fn;
        switch (parts.length) {
          case 1:
            fn = function(object) {
              return object != null ? object[foo] : object;
            };
            break;
          case 2:
            fn = function(object) {
              return object != null ? object[foo][bar] : object;
            };
            break;
          case 3:
            fn = function(object) {
              return object != null ? object[foo][bar][baz] : object;
            };
            break;
          default:
            fn = function(object) {
              if (object != null) {
                object = object[foo][bar][baz];
                for (var i = 3, key; key = parts[i]; i++) object = object[key];
              }
              return object;
            };
        }
        fn = Function("parts", "return " + fn.toString().replace(/(foo|bar|baz)/g, function(m, w) {
          return '"' + parts[w == "foo" ? 0 : w == "bar" ? 1 : 2] + '"';
        }).replace(/\[\"([^"]+)\"\]/g, ".$1"))(parts);
        return fn;
      }
      return new Function("object", "return object != null ? object." + path + " : object");
    }
    var getterFn = function(path, modificator) {
      var func;
      var result;
      var getterId;
      if (!path || path === nullGetter) return nullGetter;
      if (typeof path == "function") {
        getterId = path[ID];
        if (getterId) {
          func = getterMap[Math.abs(getterId) - 1];
        } else {
          func = function(object) {
            return path(object);
          };
          func.base = path;
          func.__extend__ = getter;
          getterId = getterMap.push(func);
          path[ID] = -getterId;
          func[ID] = getterId;
        }
      } else {
        func = pathCache[path];
        if (func) {
          getterId = func[ID];
        } else {
          func = buildFunction(path);
          func.base = path;
          func.__extend__ = getter;
          getterId = getterMap.push(func);
          func[ID] = getterId;
          pathCache[path] = func;
        }
      }
      var modType = modificator != null && typeof modificator;
      if (!modType) return func;
      var modList = modCache[getterId];
      var modId;
      if (modType == "string") modId = modType + modificator; else if (modType == "function") modId = modificator.basisModId_; else if (modType != "object") {
        consoleMethods.warn("basis.getter: wrong modificator type, modificator not used, path: ", path, ", modificator:", modificator);
        return func;
      }
      if (modId && modList && modList[modId]) return modList[modId];
      if (typeof func.base == "function") func = func.base;
      switch (modType) {
        case "string":
          result = function(object) {
            return stringFunctions.format(modificator, func(object));
          };
          break;
        case "function":
          if (!modId) {
            modId = modType + modificatorSeed++;
            modificator.basisModId_ = modId;
          }
          result = function(object) {
            return modificator(func(object));
          };
          break;
        default:
          result = function(object) {
            return modificator[func(object)];
          };
      }
      result.base = func.base || func;
      result.__extend__ = getter;
      if (modId) {
        if (!modList) {
          modList = {};
          modCache[getterId] = modList;
        }
        modList[modId] = result;
        result.mod = modificator;
        result[ID] = getterMap.push(result);
      } else {}
      return result;
    };
    getterFn.ID = ID;
    return getterFn;
  }();
  var nullGetter = extend(function() {}, {
    __extend__: getter
  });
  function wrapper(key) {
    return function(value) {
      var result = {};
      result[key] = value;
      return result;
    };
  }
  function lazyInit(init, thisObject) {
    var inited = 0;
    var self;
    var data;
    return self = function() {
      if (!(inited++)) {
        self.inited = true;
        self.data = data = init.apply(thisObject || this, arguments);
        if (typeof data == "undefined") consoleMethods.warn("lazyInit function returns nothing:\n" + init);
      }
      return data;
    };
  }
  function lazyInitAndRun(init, run, thisObject) {
    var inited = 0;
    var self;
    var data;
    return self = function() {
      if (!(inited++)) {
        self.inited = true;
        self.data = data = init.call(thisObject || this);
        if (typeof data == "undefined") consoleMethods.warn("lazyInitAndRun function returns nothing:\n" + init);
      }
      run.apply(data, arguments);
      return data;
    };
  }
  function runOnce(run, thisObject) {
    var fired = 0;
    return function() {
      if (!(fired++)) return run.apply(thisObject || this, arguments);
    };
  }
  var consoleMethods = function() {
    var methods = {
      log: $undef,
      info: $undef,
      warn: $undef,
      error: $undef
    };
    if (typeof console != "undefined") iterate(methods, function(methodName) {
      methods[methodName] = "bind" in Function.prototype && typeof console[methodName] == "function" ? Function.prototype.bind.call(console[methodName], console) : function() {
        Function.prototype.apply.call(console[methodName], console, arguments);
      };
    });
    return methods;
  }();
  var setImmediate = global.setImmediate || global.msSetImmediate;
  var clearImmediate = global.clearImmediate || global.msSetImmediate;
  if (setImmediate) setImmediate = setImmediate.bind(global);
  if (clearImmediate) clearImmediate = clearImmediate.bind(global);
  if (!setImmediate) (function() {
    var MESSAGE_NAME = "basisjs.setImmediate";
    var runTask = function() {
      var taskById = {};
      var taskId = 1;
      setImmediate = function(fn) {
        if (typeof fn != "function") {
          consoleMethods.warn("basis.setImmediate() and basis.nextTick() accept functions only (call ignored)");
          return;
        }
        taskById[++taskId] = {
          fn: fn,
          args: arrayFrom(arguments, 1)
        };
        addToQueue(taskId);
        return taskId;
      };
      clearImmediate = function(id) {
        delete taskById[id];
      };
      return function(id) {
        var task = taskById[id];
        if (task) {
          delete taskById[id];
          return task.fn.apply(undefined, task.args);
        }
      };
    }();
    var addToQueue = function(taskId) {
      setTimeout(function() {
        runTask(taskId);
      }, 0);
    };
    if (global.process && typeof process.nextTick == "function") {
      addToQueue = function(taskId) {
        process.nextTick(function() {
          runTask(taskId);
        });
      };
    } else {
      if (global.MessageChannel) {
        var channel = new global.MessageChannel;
        channel.port1.onmessage = function(event) {
          var taskId = event.data;
          runTask(taskId);
        };
        addToQueue = function(taskId) {
          channel.port2.postMessage(taskId);
        };
      } else {
        var postMessageSupported = global.postMessage && !global.importScripts;
        if (postMessageSupported) {
          var oldOnMessage = global.onmessage;
          global.onmessage = function() {
            postMessageSupported = false;
          };
          global.postMessage("", "*");
          global.onmessage = oldOnMessage;
        }
        if (postMessageSupported) {
          var setImmediateHandler = function(event) {
            if (event && event.source == global) {
              var taskId = String(event.data).split(MESSAGE_NAME)[1];
              if (taskId) runTask(taskId);
            }
          };
          if (global.addEventListener) global.addEventListener("message", setImmediateHandler, true); else global.attachEvent("onmessage", setImmediateHandler);
          addToQueue = function(taskId) {
            global.postMessage(MESSAGE_NAME + taskId, "*");
          };
        } else {
          var createScript = function() {
            return document.createElement("script");
          };
          if (document && "onreadystatechange" in createScript()) {
            var defaultAddToQueue = addToQueue;
            addToQueue = function beforeHeadReady(taskId) {
              if (typeof documentInterface != "undefined") {
                addToQueue = defaultAddToQueue;
                documentInterface.head.ready(function() {
                  addToQueue = function(taskId) {
                    var scriptEl = createScript();
                    scriptEl.onreadystatechange = function() {
                      scriptEl.onreadystatechange = null;
                      documentInterface.remove(scriptEl);
                      scriptEl = null;
                      runTask(taskId);
                    };
                    documentInterface.head.add(scriptEl);
                  };
                });
              }
              if (addToQueue === beforeHeadReady) defaultAddToQueue(taskId); else addToQueue(taskId);
            };
          }
        }
      }
    }
  })();
  var NODE_ENV = typeof process == "object" && toString.call(process) == "[object process]";
  var pathUtils = function() {
    var ABSOLUTE_RX = /^([^\/]+:|\/)/;
    var PROTOCOL_RX = /^[a-zA-Z0-9\-]+:\/?/;
    var ORIGIN_RX = /^(?:[a-zA-Z0-9\-]+:)?\/\/[^\/]+\/?/;
    var SEARCH_HASH_RX = /[\?#].*$/;
    var baseURI;
    var origin;
    var utils;
    if (NODE_ENV) {
      var path = (process.basisjsBaseURI || require("path").resolve(".")).replace(/\\/g, "/");
      baseURI = path.replace(/^[^\/]*/, "");
      origin = path.replace(/\/.*/, "");
    } else {
      baseURI = location.pathname.replace(/[^\/]+$/, "");
      origin = location.protocol + "//" + location.host;
    }
    utils = {
      baseURI: baseURI,
      origin: origin,
      normalize: function(path) {
        path = (path || "").replace(PROTOCOL_RX, "/").replace(ORIGIN_RX, "/").replace(SEARCH_HASH_RX, "");
        var result = [];
        var parts = path.split("/");
        for (var i = 0; i < parts.length; i++) {
          if (parts[i] == "..") {
            if (result.length > 1 || result[0]) result.pop();
          } else {
            if ((parts[i] || !i) && parts[i] != ".") result.push(parts[i]);
          }
        }
        return result.join("/") || (path[0] === "/" ? "/" : "");
      },
      dirname: function(path) {
        var result = utils.normalize(path);
        return result.replace(/\/([^\/]*)$|^[^\/]+$/, "") || (result[0] == "/" ? "/" : ".");
      },
      extname: function(path) {
        var ext = utils.normalize(path).match(/[^\/](\.[^\/\.]*)$/);
        return ext ? ext[1] : "";
      },
      basename: function(path, ext) {
        var filename = utils.normalize(path).match(/[^\\\/]*$/);
        filename = filename ? filename[0] : "";
        if (ext == utils.extname(filename)) filename = filename.substring(0, filename.length - ext.length);
        return filename;
      },
      resolve: function(from, to) {
        var args = arrayFrom(arguments).reverse();
        var path = [];
        var absoluteFound = false;
        for (var i = 0; !absoluteFound && i < args.length; i++) if (typeof args[i] == "string") {
          path.unshift(args[i]);
          absoluteFound = ABSOLUTE_RX.test(args[i]);
        }
        if (!absoluteFound) path.unshift(baseURI == "/" ? "" : baseURI);
        return utils.normalize(path.join("/"));
      },
      relative: function(from, to) {
        if (typeof to != "string") {
          to = from;
          from = baseURI;
        }
        from = utils.normalize(from);
        to = utils.normalize(to);
        if (from[0] == "/" && to[0] != "/") return from;
        if (to[0] == "/" && from[0] != "/") return to;
        var base = from.replace(/^\/$/, "").split(/\//);
        var path = to.replace(/^\/$/, "").split(/\//);
        var result = [];
        var i = 0;
        while (path[i] == base[i] && typeof base[i] == "string") i++;
        for (var j = base.length - i; j > 0; j--) result.push("..");
        return result.concat(path.slice(i).filter(Boolean)).join("/");
      }
    };
    return utils;
  }();
  var basisFilename = __basisFilename || "";
  var config = __config || {
    noConflict: true,
    modules: {},
    autoload: [ "./0.js" ]
  };
  function fetchConfig() {
    var config = __config;
    if (!config) {
      if (NODE_ENV) {
        basisFilename = __filename.replace(/\\/g, "/");
      } else {
        var scripts = document.scripts;
        for (var i = 0, scriptEl; scriptEl = scripts[i]; i++) {
          var configAttrValue = scriptEl.hasAttribute("basis-config") ? scriptEl.getAttribute("basis-config") : scriptEl.getAttribute("data-basis-config");
          scriptEl.removeAttribute("basis-config");
          scriptEl.removeAttribute("data-basis-config");
          if (configAttrValue !== null) {
            basisFilename = pathUtils.normalize(scriptEl.src);
            try {
              config = Function("return{" + configAttrValue + "}")();
            } catch (e) {
              consoleMethods.error("basis-config: basis.js config parse fault: " + e);
            }
            break;
          }
        }
      }
    }
    return processConfig(config);
  }
  function processConfig(config, verbose) {
    config = slice(config);
    if ("extProto" in config) consoleMethods.warn("basis-config: `extProto` option in basis-config is not support anymore");
    if ("path" in config) consoleMethods.warn("basis-config: `path` option in basis-config is deprecated, use `modules` instead");
    var autoload = [];
    var modules = merge(config.path, config.modules, {
      basis: basisFilename
    });
    config.modules = {};
    if (config.autoload) {
      var m = String(config.autoload).match(/^((?:[^\/]*\/)*)([a-z$_][a-z0-9$_]*)((?:\.[a-z$_][a-z0-9$_]*)*)$/i);
      if (m) {
        modules[m[2]] = {
          autoload: true,
          filename: m[1] + m[2] + (m[3] || ".js")
        };
      } else {
        consoleMethods.warn("basis-config: wrong `autoload` value (setting ignored): " + config.autoload);
      }
      delete config.autoload;
    }
    for (var name in modules) {
      var module = modules[name];
      if (typeof module == "string") module = {
        filename: module.replace(/\/$/, "/" + name + ".js")
      };
      var filename = module.filename;
      var path = module.path;
      if (filename && !path) {
        filename = pathUtils.resolve(filename);
        path = filename.substr(0, filename.length - pathUtils.extname(filename).length);
        filename = "../" + pathUtils.basename(filename);
      }
      path = pathUtils.resolve(path);
      if (!filename && path) {
        filename = pathUtils.basename(path);
        path = pathUtils.dirname(path);
      }
      if (!pathUtils.extname(filename)) filename += ".js";
      filename = pathUtils.resolve(path, filename);
      config.modules[name] = {
        path: path,
        filename: filename
      };
      if (module.autoload) {
        config.autoload = autoload;
        autoload.push(name);
      }
    }
    return config;
  }
  var Class = function() {
    var instanceSeed = {
      id: 1
    };
    var classSeed = 1;
    var classes = [];
    var SELF = {};
    function isClass(object) {
      return typeof object == "function" && !!object.basisClassId_;
    }
    function isSubclassOf(superClass) {
      var cursor = this;
      while (cursor && cursor !== superClass) cursor = cursor.superClass_;
      return cursor === superClass;
    }
    function devVerboseName(name, args, fn) {
      return (new Function(keys(args), 'return {"' + name + '": ' + fn + '\n}["' + name + '"]')).apply(null, values(args));
    }
    var TOSTRING_BUG = function() {
      for (var key in {
        toString: 1
      }) return false;
      return true;
    }();
    function createClass(SuperClass, extensions) {
      var classId = classSeed++;
      if (typeof SuperClass != "function") SuperClass = BaseClass;
      var className = "";
      for (var i = 1, extension; extension = arguments[i]; i++) if (typeof extension != "function" && extension.className) className = extension.className;
      if (!className) className = SuperClass.className + "._Class" + classId;
      var NewClassProto = function() {};
      NewClassProto = devVerboseName(className, {}, NewClassProto);
      NewClassProto.prototype = SuperClass.prototype;
      var newProto = new NewClassProto;
      var newClassProps = {
        className: className,
        basisClassId_: classId,
        superClass_: SuperClass,
        extendConstructor_: !!SuperClass.extendConstructor_,
        isSubclassOf: isSubclassOf,
        subclass: function() {
          return createClass.apply(null, [ newClass ].concat(arrayFrom(arguments)));
        },
        extend: extendClass,
        __extend__: function(value) {
          if (value && value !== SELF && (typeof value == "object" || typeof value == "function" && !isClass(value))) return BaseClass.create.call(null, newClass, value); else return value;
        },
        prototype: newProto
      };
      for (var i = 1, extension; extension = arguments[i]; i++) newClassProps.extend(extension);
      if (newProto.init !== BaseClass.prototype.init && !/^function[^(]*\(\)/.test(newProto.init) && newClassProps.extendConstructor_) consoleMethods.warn("probably wrong extendConstructor_ value for " + newClassProps.className);
      var newClass = newClassProps.extendConstructor_ ? function(extend) {
        this.basisObjectId = instanceSeed.id++;
        var prop;
        for (var key in extend) {
          prop = this[key];
          this[key] = prop && prop.__extend__ ? prop.__extend__(extend[key]) : extend[key];
        }
        this.init();
        this.postInit();
      } : function() {
        this.basisObjectId = instanceSeed.id++;
        this.init.apply(this, arguments);
        this.postInit();
      };
      newClass = devVerboseName(className, {
        instanceSeed: instanceSeed
      }, newClass);
      newProto.constructor = newClass;
      for (var key in newProto) if (newProto[key] === SELF) newProto[key] = newClass;
      extend(newClass, newClassProps);
      classes.push(newClass);
      return newClass;
    }
    function extendClass(source) {
      var proto = this.prototype;
      if (typeof source == "function" && !isClass(source)) source = source(this.superClass_.prototype, slice(proto));
      if (source.prototype) source = source.prototype;
      for (var key in source) {
        var value = source[key];
        var protoValue = proto[key];
        if (key == "className" || key == "extendConstructor_") this[key] = value; else {
          if (protoValue && protoValue.__extend__) proto[key] = protoValue.__extend__(value); else {
            proto[key] = value;
          }
        }
      }
      if (TOSTRING_BUG && source[key = "toString"] !== toString) proto[key] = source[key];
      return this;
    }
    var BaseClass = extend(createClass, {
      className: "basis.Class",
      extendConstructor_: false,
      prototype: {
        basisObjectId: 0,
        constructor: null,
        init: function() {},
        postInit: function() {},
        toString: function() {
          return "[object " + (this.constructor || this).className + "]";
        },
        destroy: function() {
          for (var prop in this) if (hasOwnProperty.call(this, prop)) this[prop] = null;
          this.destroy = $undef;
        }
      }
    });
    var customExtendProperty = function(extension, fn, devName) {
      return {
        __extend__: function(extension) {
          if (!extension) return extension;
          if (extension && extension.__extend__) return extension;
          var Base = function() {};
          Base = devVerboseName(devName || "customExtendProperty", {}, Base);
          Base.prototype = this;
          var result = new Base;
          fn(result, extension);
          return result;
        }
      }.__extend__(extension || {});
    };
    var extensibleProperty = function(extension) {
      return customExtendProperty(extension, extend, "extensibleProperty");
    };
    var nestedExtendProperty = function(extension) {
      return customExtendProperty(extension, function(result, extension) {
        for (var key in extension) {
          var value = result[key];
          result[key] = value && value.__extend__ ? value.__extend__(extension[key]) : extensibleProperty(extension[key]);
        }
      }, "nestedExtendProperty");
    };
    var oneFunctionProperty = function(fn, keys) {
      var create = function(keys) {
        var result = {
          __extend__: create
        };
        if (keys) {
          if (keys.__extend__) return keys;
          var Cls = devVerboseName("oneFunctionProperty", {}, function() {});
          result = new Cls;
          result.__extend__ = create;
          for (var key in keys) if (keys[key]) result[key] = fn;
        }
        return result;
      };
      return create(keys || {});
    };
    return extend(BaseClass, {
      all_: classes,
      SELF: SELF,
      create: createClass,
      isClass: isClass,
      customExtendProperty: customExtendProperty,
      extensibleProperty: extensibleProperty,
      nestedExtendProperty: nestedExtendProperty,
      oneFunctionProperty: oneFunctionProperty
    });
  }();
  var Token = Class(null, {
    className: "basis.Token",
    value: null,
    handler: null,
    deferredToken: null,
    bindingBridge: {
      attach: function(host, fn, context) {
        host.attach(fn, context);
      },
      detach: function(host, fn, context) {
        host.detach(fn, context);
      },
      get: function(host) {
        return host.get();
      }
    },
    init: function(value) {
      this.value = value;
    },
    get: function() {
      return this.value;
    },
    set: function(value) {
      if (this.value !== value) {
        this.value = value;
        this.apply();
      }
    },
    attach: function(fn, context) {
      var cursor = this;
      while (cursor = cursor.handler) if (cursor.fn === fn && cursor.context === context) consoleMethods.warn("basis.Token#attach: duplicate fn & context pair");
      this.handler = {
        fn: fn,
        context: context,
        handler: this.handler
      };
    },
    detach: function(fn, context) {
      var cursor = this;
      var prev;
      while (prev = cursor, cursor = cursor.handler) if (cursor.fn === fn && cursor.context === context) {
        cursor.fn = $undef;
        prev.handler = cursor.handler;
        return;
      }
      consoleMethods.warn("basis.Token#detach: fn & context pair not found, nothing was removed");
    },
    apply: function() {
      var value = this.get();
      var cursor = this;
      while (cursor = cursor.handler) cursor.fn.call(cursor.context, value);
    },
    deferred: function() {
      var token = this.deferredToken;
      if (!token) {
        token = this.deferredToken = new DeferredToken(this.value);
        this.attach(token.set, token);
      }
      return token;
    },
    destroy: function() {
      if (this.deferredToken) {
        this.deferredToken.destroy();
        this.deferredToken = null;
      }
      this.handler = null;
      this.value = null;
      this.attach = $undef;
      this.detach = $undef;
    }
  });
  var awaitToApply = function() {
    var tokens = {};
    var timer;
    function applyTokens() {
      var list = tokens;
      tokens = {};
      timer = null;
      for (var key in list) list[key].apply();
    }
    return function(token) {
      if (token.basisObjectId in tokens) return;
      tokens[token.basisObjectId] = token;
      if (!timer) setImmediate(applyTokens);
    };
  }();
  var DeferredToken = Token.subclass({
    className: "basis.DeferredToken",
    set: function(value) {
      if (this.value !== value) {
        this.value = value;
        awaitToApply(this);
      }
    },
    deferred: function() {
      return this;
    }
  });
  var resources = {};
  var resourceContentCache = {};
  var resourcePatch = {};
  var virtualResourceSeed = 1;
  var resourceResolvingStack = [];
  var requires;
  (function() {
    var map = typeof __resources__ != "undefined" ? __resources__ : null;
    if (map) {
      for (var key in map) resourceContentCache[pathUtils.resolve(key)] = map[key];
    }
  })();
  function applyResourcePatches(resource) {
    var patches = resourcePatch[resource.url];
    if (patches) for (var i = 0; i < patches.length; i++) {
      consoleMethods.info("Apply patch for " + resource.url);
      patches[i](resource.get(), resource.url);
    }
  }
  var getResourceContent = function(url, ignoreCache) {
    if (ignoreCache || !resourceContentCache.hasOwnProperty(url)) {
      var resourceContent = "";
      if (!NODE_ENV) {
        var req = new XMLHttpRequest;
        req.open("GET", url, false);
        req.setRequestHeader("If-Modified-Since", (new Date(0)).toGMTString());
        req.setRequestHeader("X-Basis-Resource", 1);
        req.send("");
        if (req.status >= 200 && req.status < 400) resourceContent = req.responseText; else {
          consoleMethods.error("basis.resource: Unable to load " + url + " (status code " + req.status + ")");
        }
      } else {
        try {
          resourceContent = process.basisjsReadFile ? process.basisjsReadFile(url) : require("fs").readFileSync(url, "utf-8");
        } catch (e) {
          consoleMethods.error("basis.resource: Unable to load " + url, e);
        }
      }
      resourceContentCache[url] = resourceContent;
    }
    return resourceContentCache[url];
  };
  var createResource = function(resourceUrl, content) {
    var contentType = pathUtils.extname(resourceUrl);
    var contentWrapper = getResource.extensions[contentType];
    var isVirtual = arguments.length > 1;
    var resolved = false;
    var wrapped = false;
    var wrappedContent;
    if (isVirtual) resourceUrl += "#virtual";
    var resource = function() {
      if (resolved) return content;
      var urlContent = isVirtual ? content : getResourceContent(resourceUrl);
      var idx = resourceResolvingStack.indexOf(resourceUrl);
      if (idx != -1) consoleMethods.warn("basis.resource recursion:", resourceResolvingStack.slice(idx).concat(resourceUrl).map(pathUtils.relative, pathUtils).join(" -> "));
      resourceResolvingStack.push(resourceUrl);
      if (contentWrapper) {
        if (!wrapped) {
          wrapped = true;
          content = contentWrapper(urlContent, resourceUrl);
          wrappedContent = urlContent;
        }
      } else {
        content = urlContent;
      }
      resolved = true;
      applyResourcePatches(resource);
      resource.apply();
      resourceResolvingStack.pop();
      return content;
    };
    extend(resource, extend(new Token, {
      url: resourceUrl,
      type: contentType,
      virtual: isVirtual,
      fetch: function() {
        return resource();
      },
      toString: function() {
        return "[basis.resource " + resourceUrl + "]";
      },
      isResolved: function() {
        return resolved;
      },
      hasChanges: function() {
        return contentWrapper ? resourceContentCache[resourceUrl] !== wrappedContent : false;
      },
      update: function(newContent) {
        if (!resolved || isVirtual || newContent != resourceContentCache[resourceUrl]) {
          if (!isVirtual) resourceContentCache[resourceUrl] = newContent;
          if (contentWrapper) {
            if (!wrapped && isVirtual) content = newContent;
            if (wrapped && !contentWrapper.permanent) {
              content = contentWrapper(newContent, resourceUrl, content);
              applyResourcePatches(resource);
              resource.apply();
            }
          } else {
            content = newContent;
            resolved = true;
            applyResourcePatches(resource);
            resource.apply();
          }
        }
      },
      reload: function() {
        if (isVirtual) return;
        var oldContent = resourceContentCache[resourceUrl];
        var newContent = getResourceContent(resourceUrl, true);
        if (newContent != oldContent) {
          resolved = false;
          resource.update(newContent);
        }
      },
      get: function(source) {
        if (isVirtual) if (source) return contentWrapper ? wrappedContent : content;
        return source ? getResourceContent(resourceUrl) : resource();
      },
      ready: function(fn, context) {
        if (resolved) {
          fn.call(context, resource());
          if (contentWrapper && contentWrapper.permanent) return;
        }
        resource.attach(fn, context);
        return resource;
      }
    }));
    resources[resourceUrl] = resource;
    return resource;
  };
  var getResource = function(resourceUrl) {
    var resource = resources[resourceUrl];
    if (resource) return resource;
    if (!/^(\.\/|\.\.|\/)/.test(resourceUrl)) consoleMethods.warn("Bad usage: basis.resource('" + resourceUrl + "').\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.");
    resourceUrl = pathUtils.resolve(resourceUrl);
    resource = resources[resourceUrl];
    return resource || createResource(resourceUrl);
  };
  extend(getResource, {
    isResource: function(value) {
      return value ? resources[value.url] === value : false;
    },
    isResolved: function(resourceUrl) {
      var resource = getResource.get(resourceUrl);
      return resource ? resource.isResolved() : false;
    },
    exists: function(resourceUrl) {
      if (!/^(\.\/|\.\.|\/)/.test(resourceUrl)) consoleMethods.warn("Bad usage: basis.resource.exists('" + resourceUrl + "').\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.");
      return resources.hasOwnProperty(pathUtils.resolve(resourceUrl));
    },
    get: function(resourceUrl) {
      if (!/^(\.\/|\.\.|\/)/.test(resourceUrl)) consoleMethods.warn("Bad usage: basis.resource.get('" + resourceUrl + "').\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.");
      resourceUrl = pathUtils.resolve(resourceUrl);
      if (!getResource.exists(resourceUrl)) return null;
      return getResource(resourceUrl);
    },
    getFiles: function(cache) {
      return keys(cache ? resourceContentCache : resources).map(pathUtils.relative);
    },
    virtual: function(type, content, ownerUrl) {
      return createResource((ownerUrl ? ownerUrl + ":" : pathUtils.normalize(pathUtils.baseURI == "/" ? "" : pathUtils.baseURI) + "/") + "virtual-resource" + virtualResourceSeed++ + "." + type, content);
    },
    extensions: {
      ".js": extend(function(content, filename) {
        var namespace = filename2namespace[filename];
        if (!namespace) {
          var implicitNamespace = true;
          var resolvedFilename = pathUtils.dirname(filename) + "/" + pathUtils.basename(filename, pathUtils.extname(filename));
          for (var ns in nsRootPath) {
            var path = nsRootPath[ns] + ns + "/";
            if (resolvedFilename.substr(0, path.length) == path) {
              implicitNamespace = false;
              resolvedFilename = resolvedFilename.substr(nsRootPath[ns].length);
              break;
            }
          }
          namespace = resolvedFilename.replace(/\./g, "_").replace(/^\//g, "").replace(/\//g, ".");
          if (implicitNamespace) namespace = "implicit." + namespace;
        }
        if (requires) arrayFunctions.add(requires, namespace);
        if (!namespaces[namespace]) {
          var ns = getNamespace(namespace);
          var savedRequires = requires;
          requires = [];
          ns.exports = runScriptInContext({
            path: ns.path,
            exports: ns.exports
          }, filename, content).exports;
          if (ns.exports && ns.exports.constructor === Object) complete(ns, ns.exports);
          ns.filename_ = filename;
          ns.source_ = content;
          ns.requires_ = requires;
          requires = savedRequires;
        }
        return namespaces[namespace].exports;
      }, {
        permanent: true
      }),
      ".css": function(content, url, cssResource) {
        if (!cssResource) cssResource = new CssResource(url);
        cssResource.updateCssText(content);
        return cssResource;
      },
      ".json": function(content, url) {
        if (typeof content == "object") return content;
        var result;
        try {
          content = String(content);
          result = basis.json.parse(content);
        } catch (e) {
          consoleMethods.warn("basis.resource: Can't parse JSON from " + url, {
            url: url,
            content: content
          });
        }
        return result || null;
      }
    }
  });
  function compileFunction(sourceURL, args, body) {
    try {
      return new Function(args, body + "\n\n//# sourceURL=" + pathUtils.origin + sourceURL);
    } catch (e) {
      if (document && "line" in e == false && "addEventListener" in global) {
        global.addEventListener("error", function onerror(event) {
          if (event.filename == pathUtils.origin + sourceURL) {
            global.removeEventListener("error", onerror);
            consoleMethods.error("Compilation error at " + event.filename + ":" + event.lineno + ": " + e);
            event.preventDefault();
          }
        });
        var script = document.createElement("script");
        script.src = sourceURL;
        script.async = false;
        document.head.appendChild(script);
        document.head.removeChild(script);
      }
      consoleMethods.error("Compilation error at " + sourceURL + ("line" in e ? ":" + (e.line - 1) : "") + ": " + e);
    }
  }
  var runScriptInContext = function(context, sourceURL, sourceCode) {
    var baseURL = pathUtils.dirname(sourceURL) + "/";
    var compiledSourceCode = sourceCode;
    if (!context.exports) context.exports = {};
    if (typeof compiledSourceCode != "function") compiledSourceCode = compileFunction(sourceURL, [ "exports", "module", "basis", "global", "__filename", "__dirname", "resource", "require" ], '"use strict";\n' + sourceCode);
    if (typeof compiledSourceCode == "function") compiledSourceCode.call(context.exports, context.exports, context, basis, global, sourceURL, baseURL, function(relativePath) {
      if (!/^(\.\/|\.\.|\/)/.test(relativePath)) consoleMethods.warn("Bad usage: resource('" + relativePath + "').\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.");
      return getResource(pathUtils.resolve(baseURL, relativePath));
    }, function(relativePath, base) {
      return requireNamespace(relativePath, base || baseURL);
    });
    return context;
  };
  var namespaces = {};
  var namespace2filename = {};
  var filename2namespace = {};
  var nsRootPath = {};
  iterate(config.modules, function(name, module) {
    nsRootPath[name] = module.path + "/";
    namespace2filename[name] = module.filename;
    filename2namespace[module.filename] = name;
  });
  (function(map) {
    var map = typeof __namespace_map__ != "undefined" ? __namespace_map__ : null;
    if (map) {
      for (var key in map) {
        var filename = pathUtils.resolve(key);
        var namespace = map[key];
        filename2namespace[filename] = namespace;
        namespace2filename[namespace] = filename;
      }
    }
  })();
  var Namespace = Class(null, {
    className: "basis.Namespace",
    init: function(name) {
      this.name = name;
      this.exports = {
        path: this.name
      };
    },
    toString: function() {
      return "[basis.namespace " + this.path + "]";
    },
    extend: function(names) {
      extend(this.exports, names);
      return complete(this, names);
    }
  });
  function resolveNSFilename(namespace) {
    if (namespace in namespace2filename == false) {
      var parts = namespace.split(".");
      var namespaceRoot = parts.shift();
      var filename = parts.join("/") + ".js";
      if (namespaceRoot in nsRootPath == false) nsRootPath[namespaceRoot] = pathUtils.baseURI + namespaceRoot + "/";
      if (namespaceRoot == namespace) filename = nsRootPath[namespaceRoot].replace(/\/$/, "") + ".js"; else filename = nsRootPath[namespaceRoot] + filename;
      namespace2filename[namespace] = filename;
      filename2namespace[filename] = namespace;
    }
    return namespace2filename[namespace];
  }
  function getRootNamespace(name) {
    var namespace = namespaces[name];
    if (!namespace) {
      namespace = namespaces[name] = new Namespace(name);
      namespace.namespaces_ = {};
      namespace.namespaces_[name] = namespace;
      if (!config.noConflict) global[name] = namespace;
    }
    if (name == "templates" && !templates) templates = namespaces[name];
    return namespace;
  }
  function getNamespace(path) {
    path = path.split(".");
    var rootNs = getRootNamespace(path[0]);
    var cursor = rootNs;
    for (var i = 1, name; name = path[i]; i++) {
      if (!cursor[name]) {
        var nspath = path.slice(0, i + 1).join(".");
        cursor[name] = new Namespace(nspath);
        rootNs.namespaces_[nspath] = cursor[name];
      }
      cursor = cursor[name];
    }
    namespaces[path.join(".")] = cursor;
    return cursor;
  }
  var requireNamespace = function() {
    if (NODE_ENV) {
      var moduleProto = module.constructor.prototype;
      return function(filename, dirname) {
        if (!/[^a-z0-9_\.]/i.test(filename) || pathUtils.extname(filename) == ".js") {
          var _compile = moduleProto._compile;
          var namespace = getNamespace(filename);
          moduleProto._compile = function(content, filename) {
            this.basis = basis;
            content = "var __nodejsRequire = require;\n" + "var basis = module.basis;\n" + 'var resource = function(filename){ return basis.resource(__dirname + "/" + filename) };\n' + "var require = function(filename, baseURI){ return basis.require(filename, baseURI || __dirname) };\n" + content;
            _compile.call(extend(this, namespace), content, filename);
          };
          var exports = require(__dirname + "/" + filename.replace(/\./g, "/"));
          namespace.exports = exports;
          if (exports && exports.constructor === Object) complete(namespace, exports);
          moduleProto._compile = _compile;
          return exports;
        } else {
          filename = pathUtils.resolve(dirname, filename);
          return require(filename);
        }
      };
    } else {
      return function(filename, dirname) {
        if (!/[^a-z0-9_\.]/i.test(filename) && pathUtils.extname(filename) != ".js") {
          filename = resolveNSFilename(filename);
        } else {
          if (!/^(\.\/|\.\.|\/)/.test(filename)) consoleMethods.warn("Bad usage: require('" + filename + "').\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.");
          filename = pathUtils.resolve(dirname, filename);
        }
        return getResource(filename).fetch();
      };
    }
  }();
  function patch(filename, patchFn) {
    if (!/[^a-z0-9_\.]/i.test(filename) && pathUtils.extname(filename) != ".js") {
      filename = resolveNSFilename(filename);
    } else {
      if (!/^(\.\/|\.\.|\/)/.test(filename)) consoleMethods.warn("Bad usage: basis.patch('" + filename + "').\nFilenames should starts with `./`, `..` or `/`. Otherwise it will treats as special reference in next minor release.");
      filename = pathUtils.resolve(filename);
    }
    if (!resourcePatch[filename]) resourcePatch[filename] = [ patchFn ]; else resourcePatch[filename].push(patchFn);
    var resource = getResource.get(filename);
    if (resource && resource.isResolved()) patchFn(resource.get(), resource.url);
  }
  complete(Function.prototype, {
    bind: function(thisObject) {
      var fn = this;
      var params = arrayFrom(arguments, 1);
      return params.length ? function() {
        return fn.apply(thisObject, params.concat.apply(params, arguments));
      } : function() {
        return fn.apply(thisObject, arguments);
      };
    }
  });
  complete(Array, {
    isArray: function(value) {
      return toString.call(value) === "[object Array]";
    }
  });
  function arrayFrom(object, offset) {
    if (object != null) {
      var len = object.length;
      if (typeof len == "undefined" || toString.call(object) == "[object Function]") return [ object ];
      if (!offset) offset = 0;
      if (len - offset > 0) {
        for (var result = [], k = 0, i = offset; i < len; ) result[k++] = object[i++];
        return result;
      }
    }
    return [];
  }
  function createArray(length, fillValue, thisObject) {
    var result = [];
    var isFunc = typeof fillValue == "function";
    for (var i = 0; i < length; i++) result[i] = isFunc ? fillValue.call(thisObject, i, result) : fillValue;
    return result;
  }
  complete(Array.prototype, {
    indexOf: function(searchElement, offset) {
      offset = parseInt(offset, 10) || 0;
      if (offset < 0) return -1;
      for (; offset < this.length; offset++) if (this[offset] === searchElement) return offset;
      return -1;
    },
    lastIndexOf: function(searchElement, offset) {
      var len = this.length;
      offset = parseInt(offset, 10);
      if (isNaN(offset) || offset >= len) offset = len - 1; else offset = (offset + len) % len;
      for (; offset >= 0; offset--) if (this[offset] === searchElement) return offset;
      return -1;
    },
    forEach: function(callback, thisObject) {
      for (var i = 0, len = this.length; i < len; i++) if (i in this) callback.call(thisObject, this[i], i, this);
    },
    every: function(callback, thisObject) {
      for (var i = 0, len = this.length; i < len; i++) if (i in this && !callback.call(thisObject, this[i], i, this)) return false;
      return true;
    },
    some: function(callback, thisObject) {
      for (var i = 0, len = this.length; i < len; i++) if (i in this && callback.call(thisObject, this[i], i, this)) return true;
      return false;
    },
    filter: function(callback, thisObject) {
      var result = [];
      for (var i = 0, len = this.length; i < len; i++) if (i in this && callback.call(thisObject, this[i], i, this)) result.push(this[i]);
      return result;
    },
    map: function(callback, thisObject) {
      var result = [];
      for (var i = 0, len = this.length; i < len; i++) if (i in this) result[i] = callback.call(thisObject, this[i], i, this);
      return result;
    },
    reduce: function(callback, initialValue) {
      var len = this.length;
      var argsLen = arguments.length;
      if (len == 0 && argsLen == 1) throw new TypeError;
      var result;
      var inited = 0;
      if (argsLen > 1) {
        result = initialValue;
        inited = 1;
      }
      for (var i = 0; i < len; i++) if (i in this) if (inited++) result = callback.call(null, result, this[i], i, this); else result = this[i];
      return result;
    }
  });
  var arrayFunctions = {
    from: arrayFrom,
    create: createArray,
    flatten: function(this_) {
      return this_.concat.apply([], this_);
    },
    repeat: function(this_, count) {
      return arrayFunctions.flatten(createArray(parseInt(count, 10) || 0, this_));
    },
    search: function(this_, value, getter_, offset) {
      this_.lastSearchIndex = -1;
      getter_ = getter(getter_ || $self);
      for (var index = parseInt(offset, 10) || 0, len = this_.length; index < len; index++) if (getter_(this_[index]) === value) return this_[this_.lastSearchIndex = index];
    },
    lastSearch: function(this_, value, getter_, offset) {
      this_.lastSearchIndex = -1;
      getter_ = getter(getter_ || $self);
      var len = this_.length;
      var index = isNaN(offset) || offset == null ? len : parseInt(offset, 10);
      for (var i = index > len ? len : index; i-- > 0; ) if (getter_(this_[i]) === value) return this_[this_.lastSearchIndex = i];
    },
    add: function(this_, value) {
      return this_.indexOf(value) == -1 && !!this_.push(value);
    },
    remove: function(this_, value) {
      var index = this_.indexOf(value);
      return index != -1 && !!this_.splice(index, 1);
    },
    has: function(this_, value) {
      return this_.indexOf(value) != -1;
    },
    sortAsObject: function() {
      consoleMethods.warn("basis.array.sortAsObject is deprecated, use basis.array.sort instead");
      return arrayFunctions.sort.apply(this, arguments);
    },
    sort: function(this_, getter_, comparator, desc) {
      getter_ = getter(getter_);
      desc = desc ? -1 : 1;
      return this_.map(function(item, index) {
        return {
          i: index,
          v: getter_(item)
        };
      }).sort(comparator || function(a, b) {
        return desc * (a.v > b.v || -(a.v < b.v) || (a.i > b.i ? 1 : -1));
      }).map(function(item) {
        return this[item.i];
      }, this_);
    }
  };
  if (![ 1, 2 ].splice(1).length) {
    var nativeArraySplice = Array.prototype.splice;
    Array.prototype.splice = function() {
      var params = arrayFrom(arguments);
      if (params.length < 2) params[1] = this.length;
      return nativeArraySplice.apply(this, params);
    };
  }
  var ESCAPE_FOR_REGEXP = /([\/\\\(\)\[\]\?\{\}\|\*\+\-\.\^\$])/g;
  var FORMAT_REGEXP = /\{([a-z\d_]+)(?::([\.0])(\d+)|:(\?))?\}/gi;
  complete(String, {
    toLowerCase: function(value) {
      return String(value).toLowerCase();
    },
    toUpperCase: function(value) {
      return String(value).toUpperCase();
    },
    trim: function(value) {
      return String(value).trim();
    },
    trimLeft: function(value) {
      return String(value).trimLeft();
    },
    trimRight: function(value) {
      return String(value).trimRight();
    }
  });
  complete(String.prototype, {
    trimLeft: function() {
      return this.replace(/^\s+/, "");
    },
    trimRight: function() {
      return this.replace(/\s+$/, "");
    },
    trim: function() {
      return this.trimLeft().trimRight();
    }
  });
  var stringFunctions = {
    toObject: function(this_, rethrow) {
      try {
        return (new Function("return 0," + this_))();
      } catch (e) {
        if (rethrow) throw e;
      }
    },
    repeat: function(this_, count) {
      return (new Array(parseInt(count, 10) + 1 || 0)).join(this_);
    },
    qw: function(this_) {
      var trimmed = this_.trim();
      return trimmed ? trimmed.split(/\s+/) : [];
    },
    forRegExp: function(this_) {
      return this_.replace(ESCAPE_FOR_REGEXP, "\\$1");
    },
    format: function(this_, first) {
      var data = arrayFrom(arguments, 1);
      if (typeof first == "object") extend(data, first);
      return this_.replace(FORMAT_REGEXP, function(m, key, numFormat, num, noNull) {
        var value = key in data ? data[key] : noNull ? "" : m;
        if (numFormat && !isNaN(value)) {
          value = Number(value);
          return numFormat == "." ? value.toFixed(num) : numberFunctions.lead(value, num);
        }
        return value;
      });
    },
    capitalize: function(this_) {
      return this_.charAt(0).toUpperCase() + this_.substr(1).toLowerCase();
    },
    camelize: function(this_) {
      return this_.replace(/-(.)/g, function(m, chr) {
        return chr.toUpperCase();
      });
    },
    dasherize: function(this_) {
      return this_.replace(/[A-Z]/g, function(m) {
        return "-" + m.toLowerCase();
      });
    },
    isEmpty: function(value) {
      return value == null || String(value) == "";
    },
    isNotEmpty: function(value) {
      return value != null && String(value) != "";
    }
  };
  if ("|||".split(/\|/).length + "|||".split(/(\|)/).length != 11) {
    var nativeStringSplit = String.prototype.split;
    String.prototype.split = function(pattern, count) {
      if (!pattern || pattern instanceof RegExp == false || pattern.source == "") return nativeStringSplit.apply(this, arguments);
      var result = [];
      var pos = 0;
      var match;
      if (!pattern.global) pattern = new RegExp(pattern.source, /\/([mi]*)$/.exec(pattern)[1] + "g");
      while (match = pattern.exec(this)) {
        match[0] = this.substring(pos, match.index);
        result.push.apply(result, match);
        pos = pattern.lastIndex;
      }
      result.push(this.substr(pos));
      return result;
    };
  }
  if ("12".substr(-1) != "2") {
    var nativeStringSubstr = String.prototype.substr;
    String.prototype.substr = function(start, end) {
      return nativeStringSubstr.call(this, start < 0 ? Math.max(0, this.length + start) : start, end);
    };
  }
  var numberFunctions = {
    fit: function(this_, min, max) {
      if (!isNaN(min) && this_ < min) return Number(min);
      if (!isNaN(max) && this_ > max) return Number(max);
      return this_;
    },
    lead: function(this_, len, leadChar) {
      return String(this_).replace(/\d+/, function(number) {
        return (len -= number.length - 1) > 1 ? (new Array(len)).join(leadChar || 0) + number : number;
      });
    },
    group: function(this_, len, splitter) {
      return String(this_).replace(/\d+/, function(number) {
        return number.replace(/\d/g, function(m, pos) {
          return !pos + (number.length - pos) % (len || 3) ? m : (splitter || " ") + m;
        });
      });
    },
    format: function(this_, prec, gs, prefix, postfix, comma) {
      var res = this_.toFixed(prec);
      if (gs || comma) res = res.replace(/(\d+)(\.?)/, function(m, number, c) {
        return (gs ? basis.number.group(Number(number), 3, gs) : number) + (c ? comma || c : "");
      });
      if (prefix) res = res.replace(/^-?/, "$&" + (prefix || ""));
      return res + (postfix || "");
    }
  };
  complete(Date, {
    now: function() {
      return Number(new Date);
    }
  });
  var ready = function() {
    function isReady() {
      return document.readyState == "complete" && !!document.body;
    }
    var fired = !document || isReady();
    var deferredHandler;
    function runReadyHandler(handler) {
      handler.callback.call(handler.context);
    }
    function fireHandlers() {
      if (isReady()) if (!(fired++)) while (deferredHandler) {
        runReadyHandler(deferredHandler);
        deferredHandler = deferredHandler.next;
      }
    }
    function doScrollCheck() {
      try {
        document.documentElement.doScroll("left");
        fireHandlers();
      } catch (e) {
        setTimeout(doScrollCheck, 1);
      }
    }
    if (!fired) {
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", fireHandlers, false);
        global.addEventListener("load", fireHandlers, false);
      } else {
        document.attachEvent("onreadystatechange", fireHandlers);
        global.attachEvent("onload", fireHandlers);
        try {
          if (!global.frameElement && document.documentElement.doScroll) doScrollCheck();
        } catch (e) {}
      }
    }
    return function(callback, context) {
      if (!fired) {
        deferredHandler = {
          callback: callback,
          context: context,
          next: deferredHandler
        };
      } else runReadyHandler({
        callback: callback,
        context: context
      });
    };
  }();
  var documentInterface = function() {
    var timer;
    var reference = {};
    var callbacks = {
      head: [],
      body: []
    };
    function getParent(name) {
      if (document && !reference[name]) {
        reference[name] = document[name] || document.getElementsByTagName(name)[0];
        if (reference[name]) {
          var items = callbacks[name];
          delete callbacks[name];
          for (var i = 0, cb; cb = items[i]; i++) cb[0].call(cb[1], reference[name]);
        }
      }
      return reference[name];
    }
    function add() {
      var name = this[0];
      var node = this[1];
      var ref = this[2];
      remove(node);
      var parent = getParent(name);
      if (parent) {
        if (ref === true) ref = parent.firstChild;
        if (!ref || ref.parentNode !== parent) ref = null;
        parent.insertBefore(node, ref);
      } else callbacks[name].push([ add, [ name, node, ref ] ]);
    }
    function docReady(name, fn, context) {
      if (callbacks[name]) callbacks[name].push([ fn, context ]); else fn.call(context, reference[name]);
    }
    function remove(node) {
      for (var key in callbacks) {
        var entry = arrayFunctions.search(callbacks[key], node, function(item) {
          return item[1] && item[1][1];
        });
        if (entry) arrayFunctions.remove(callbacks[key], entry);
      }
      if (node && node.parentNode && node.parentNode.nodeType == 1) node.parentNode.removeChild(node);
    }
    function checkParents() {
      if (timer && getParent("head") && getParent("body")) timer = clearInterval(timer);
    }
    if (document && (!getParent("head") || !getParent("body"))) {
      timer = setInterval(checkParents, 5);
      ready(checkParents);
    }
    return {
      head: {
        ready: function(fn, context) {
          docReady("head", fn, context);
        },
        add: function(node, ref) {
          add.call([ "head", node, ref ]);
        }
      },
      body: {
        ready: function(fn, context) {
          docReady("body", fn, context);
        },
        add: function(node, ref) {
          add.call([ "body", node, ref ]);
        }
      },
      remove: remove
    };
  }();
  var cleaner = function() {
    var objects = [];
    function destroy(log) {
      var logDestroy = log && typeof log == "boolean";
      result.globalDestroy = true;
      result.add = $undef;
      result.remove = $undef;
      var object;
      while (object = objects.pop()) {
        if (typeof object.destroy == "function") {
          try {
            if (logDestroy) consoleMethods.log("destroy", "[" + String(object.className) + "]", object);
            object.destroy();
          } catch (e) {
            consoleMethods.warn(String(object), e);
          }
        } else {
          for (var prop in object) object[prop] = null;
        }
      }
      objects.length = 0;
    }
    if ("attachEvent" in global) global.attachEvent("onunload", destroy); else if ("addEventListener" in global) global.addEventListener("unload", destroy, false); else return {
      add: $undef,
      remove: $undef
    };
    var result = {
      add: function(object) {
        if (object != null) objects.push(object);
      },
      remove: function(object) {
        arrayFunctions.remove(objects, object);
      }
    };
    result.destroy_ = destroy;
    result.objects_ = objects;
    return result;
  }();
  var CssResource = function() {
    var STYLE_APPEND_BUGGY = function() {
      try {
        return !document.createElement("style").appendChild(document.createTextNode(""));
      } catch (e) {
        return true;
      }
    }();
    var baseEl = document && document.createElement("base");
    function setBase(baseURI) {
      baseEl.setAttribute("href", baseURI);
      documentInterface.head.add(baseEl, true);
    }
    function restoreBase() {
      baseEl.setAttribute("href", location.href);
      documentInterface.remove(baseEl);
    }
    function injectStyleToHead() {
      setBase(this.baseURI);
      if (!this.element) {
        this.element = document.createElement("style");
        if (!STYLE_APPEND_BUGGY) this.element.appendChild(document.createTextNode(""));
        this.element.setAttribute("src", this.url);
      }
      documentInterface.head.add(this.element);
      this.syncCssText();
      restoreBase();
    }
    return Class(null, {
      className: "basis.CssResource",
      inUse: 0,
      url: "",
      baseURI: "",
      cssText: undefined,
      element: null,
      init: function(url) {
        this.url = url;
        this.baseURI = pathUtils.dirname(url) + "/";
      },
      updateCssText: function(cssText) {
        if (this.cssText != cssText) {
          this.cssText = cssText;
          if (this.inUse && this.element) {
            setBase(this.baseURI);
            this.syncCssText();
            restoreBase();
          }
        }
      },
      syncCssText: STYLE_APPEND_BUGGY ? function() {
        this.element.styleSheet.cssText = this.cssText;
      } : function() {
        var cssText = this.cssText;
        cssText += "\n/*# sourceURL=" + pathUtils.origin + this.url + " */";
        this.element.firstChild.nodeValue = cssText;
      },
      startUse: function() {
        if (!this.inUse) documentInterface.head.ready(injectStyleToHead, this);
        this.inUse += 1;
      },
      stopUse: function() {
        if (this.inUse) {
          this.inUse -= 1;
          if (!this.inUse && this.element) documentInterface.remove(this.element);
        }
      },
      destroy: function() {
        if (this.element) documentInterface.remove(this.element);
        this.element = null;
        this.cssText = null;
      }
    });
  }();
  var basis = getNamespace("basis").extend({
    filename_: basisFilename,
    processConfig: processConfig,
    version: VERSION,
    NODE_ENV: NODE_ENV,
    config: config,
    createSandbox: function(config) {
      return createBasisInstance(global, basisFilename, complete({
        noConflict: true
      }, config));
    },
    resolveNSFilename: resolveNSFilename,
    patch: patch,
    namespace: getNamespace,
    require: requireNamespace,
    resource: getResource,
    asset: function(url) {
      return url;
    },
    setImmediate: setImmediate,
    clearImmediate: clearImmediate,
    nextTick: function() {
      setImmediate.apply(null, arguments);
    },
    Class: Class,
    Token: Token,
    DeferredToken: DeferredToken,
    genUID: genUID,
    getter: getter,
    ready: ready,
    cleaner: cleaner,
    console: consoleMethods,
    path: pathUtils,
    doc: documentInterface,
    object: {
      extend: extend,
      complete: complete,
      keys: keys,
      values: values,
      slice: slice,
      splice: splice,
      merge: merge,
      iterate: iterate
    },
    fn: {
      $undefined: $undefined,
      $defined: $defined,
      $isNull: $isNull,
      $isNotNull: $isNotNull,
      $isSame: $isSame,
      $isNotSame: $isNotSame,
      $self: $self,
      $const: $const,
      $false: $false,
      $true: $true,
      $null: $null,
      $undef: $undef,
      getter: getter,
      nullGetter: nullGetter,
      wrapper: wrapper,
      lazyInit: lazyInit,
      lazyInitAndRun: lazyInitAndRun,
      runOnce: runOnce
    },
    array: extend(arrayFrom, arrayFunctions),
    string: stringFunctions,
    number: numberFunctions,
    bool: {
      invert: function(value) {
        return !value;
      }
    },
    json: {
      parse: typeof JSON != "undefined" ? JSON.parse : function(str) {
        return stringFunctions.toObject(str, true);
      }
    }
  });
  getNamespace("basis.dev").extend(consoleMethods);
  if (config.autoload) config.autoload.forEach(function(name) {
    requireNamespace(name);
  });
  return basis;
})(this);
}).call(this);