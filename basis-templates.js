// resources (14):
//   [function] ../../src/basis/template/theme.js -> 5.js
//   [function] templates.js -> 0.js
//   [function] ../../src/basis/template/const.js -> 2.js
//   [function] ../../src/basis/template/declaration.js -> 3.js
//   [function] ../../src/basis/template/tokenize.js -> c.js
//   [function] ../../src/basis/template/isolateCss.js -> d.js
//   [function] ../../src/basis/template/store.js -> 4.js
//   [function] ../../src/basis/template.js -> 1.js
//   [function] ../../src/basis/template/html.js -> 6.js
//   [function] ../../src/basis/l10n.js -> 7.js
//   [function] ../../src/basis/event.js -> 8.js
//   [function] ../../src/basis/template/htmlfgen.js -> 9.js
//   [function] ../../src/basis/template/buildDom.js -> a.js
//   [function] ../../src/basis/dom/event.js -> b.js
//
// filelist (1): 
//   templates.js
(function(){
"use strict";

var __namespace_map__ = {"0.js":"templates","1.js":"basis.template","2.js":"basis.template.const","3.js":"basis.template.declaration","4.js":"basis.template.store","5.js":"basis.template.theme","6.js":"basis.template.html","7.js":"basis.l10n","8.js":"basis.event","9.js":"basis.template.htmlfgen","a.js":"basis.template.buildDom","b.js":"basis.dom.event"};
var templates;

var __resources__ = {
  "5.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var namespace = this.path;
    var themes = {};
    var sourceByPath = {};
    var themeChangeHandlers = [];
    var currentThemeName = "base";
    var baseTheme;
    var Theme = basis.Class(null, {
      className: namespace + ".Theme",
      get: getSourceByPath
    });
    var SourceWrapper = basis.Class(basis.Token, {
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
          this.baseURI = (typeof content == "object" || typeof content == "function") && "baseURI" in content ? content.baseURI : basis.path.dirname(this.url) + "/";
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
    function syncCurrentTheme() {
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
            for (var themeName in changed) if (themeHasEffect(themeName)) {
              syncCurrentTheme();
              break;
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
    function onThemeChange(fn, context, fire) {
      themeChangeHandlers.push({
        fn: fn,
        context: context
      });
      if (fire) fn.call(context, currentThemeName);
    }
    basis.cleaner.add({
      destroy: function() {
        for (var path in sourceByPath) sourceByPath[path].destroy();
        themes = null;
        sourceByPath = null;
      }
    });
    baseTheme = getTheme();
    module.exports = {
      SourceWrapper: SourceWrapper,
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
  "0.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var resolveTemplateById = basis.require("./1.js").resolveTemplateById;
    var HtmlTemplate = basis.require("./6.js").Template;
    var srcMap = [];
    var tmplMap = [];
    function templateWrapper(src) {
      var index = srcMap.indexOf(src);
      if (index != -1) return tmplMap[index];
      var template = new HtmlTemplate(src);
      srcMap.push(src);
      tmplMap.push(template);
      return template;
    }
    global.bt = module.exports = basis.object.extend(templateWrapper, {
      init: function(config) {
        if (!config) return this;
        if (config.noConflict) {
          delete global.bt;
          return this;
        }
      },
      dispose: function(tmpl) {
        var template = resolveTemplateById(tmpl.templateId_);
        if (!template) {
          basis.dev.warn("Template is not resolved for ", tmpl);
          return;
        }
        template.clearInstance(tmpl);
      },
      template: templateWrapper
    });
  },
  "2.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var MARKER = "basisTemplateId_" + basis.genUID();
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
    var ELEMENT_ATTRIBUTES_AND_CHILDREN = 4;
    var TEXT_VALUE = 3;
    var COMMENT_VALUE = 3;
    var CLASS_BINDING_ENUM = 1;
    var CLASS_BINDING_BOOL = 2;
    var CLASS_BINDING_INVERT = 3;
    var CLASS_BINDING_EQUAL = 4;
    var CLASS_BINDING_NOTEQUAL = 5;
    var document = global.document;
    var CLONE_NORMALIZATION_TEXT_BUG = !document ? true : function() {
      var element = document.createElement("div");
      element.appendChild(document.createTextNode("a"));
      element.appendChild(document.createTextNode("a"));
      return element.cloneNode(true).childNodes.length == 1;
    }();
    module.exports = {
      MARKER: MARKER,
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
      ATTR_TYPE_BY_NAME: ATTR_TYPE_BY_NAME,
      ATTR_VALUE_INDEX: ATTR_VALUE_INDEX,
      ELEMENT_NAME: ELEMENT_NAME,
      ELEMENT_ATTRIBUTES_AND_CHILDREN: ELEMENT_ATTRIBUTES_AND_CHILDREN,
      TEXT_VALUE: TEXT_VALUE,
      COMMENT_VALUE: COMMENT_VALUE,
      CLASS_BINDING_ENUM: CLASS_BINDING_ENUM,
      CLASS_BINDING_BOOL: CLASS_BINDING_BOOL,
      CLASS_BINDING_INVERT: CLASS_BINDING_INVERT,
      CLASS_BINDING_EQUAL: CLASS_BINDING_EQUAL,
      CLASS_BINDING_NOTEQUAL: CLASS_BINDING_NOTEQUAL,
      CLONE_NORMALIZATION_TEXT_BUG: CLONE_NORMALIZATION_TEXT_BUG
    };
  },
  "3.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var arraySearch = basis.array.search;
    var arrayAdd = basis.array.add;
    var arrayRemove = basis.array.remove;
    var tokenize = basis.require("./c.js");
    var isolateCss = basis.require("./d.js");
    var consts = basis.require("./2.js");
    var TYPE_ELEMENT = consts.TYPE_ELEMENT;
    var TYPE_ATTRIBUTE = consts.TYPE_ATTRIBUTE;
    var TYPE_ATTRIBUTE_CLASS = consts.TYPE_ATTRIBUTE_CLASS;
    var TYPE_ATTRIBUTE_STYLE = consts.TYPE_ATTRIBUTE_STYLE;
    var TYPE_ATTRIBUTE_EVENT = consts.TYPE_ATTRIBUTE_EVENT;
    var TYPE_TEXT = consts.TYPE_TEXT;
    var TYPE_COMMENT = consts.TYPE_COMMENT;
    var TOKEN_TYPE = consts.TOKEN_TYPE;
    var TOKEN_BINDINGS = consts.TOKEN_BINDINGS;
    var TOKEN_REFS = consts.TOKEN_REFS;
    var ATTR_NAME = consts.ATTR_NAME;
    var ATTR_VALUE = consts.ATTR_VALUE;
    var ATTR_NAME_BY_TYPE = consts.ATTR_NAME_BY_TYPE;
    var ATTR_TYPE_BY_NAME = consts.ATTR_TYPE_BY_NAME;
    var ATTR_VALUE_INDEX = consts.ATTR_VALUE_INDEX;
    var ELEMENT_ATTRIBUTES_AND_CHILDREN = consts.ELEMENT_ATTRIBUTES_AND_CHILDREN;
    var TEXT_VALUE = consts.TEXT_VALUE;
    var CLASS_BINDING_ENUM = consts.CLASS_BINDING_ENUM;
    var CLASS_BINDING_BOOL = consts.CLASS_BINDING_BOOL;
    var IDENT = /^[a-z_][a-z0-9_\-]*$/i;
    var ATTR_EVENT_RX = /^event-(.+)$/;
    var Template = function() {};
    var resolveResource = function() {};
    function genIsolateMarker() {
      return basis.genUID() + "__";
    }
    var makeDeclaration = function() {
      var includeStack = [];
      var styleNamespaceIsolate = {};
      var styleNamespaceResource = {};
      function getTokenName(token) {
        return (token.prefix ? token.prefix + ":" : "") + token.name;
      }
      function refList(token) {
        var array = token.refs;
        if (!array || !array.length) return 0;
        return array;
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
          if (indexBinding) if (idx == token[TOKEN_BINDINGS] - 1) {
            token[TOKEN_BINDINGS] = refName;
            indexBinding = false;
          }
          if (!token[TOKEN_REFS].length) token[TOKEN_REFS] = 0; else {
            if (indexBinding) token[TOKEN_BINDINGS] -= idx < token[TOKEN_BINDINGS] - 1;
          }
        }
      }
      function tokenAttrs(token) {
        var result = {};
        if (token.attrs) for (var i = 0, attr; attr = token.attrs[i]; i++) result[getTokenName(attr)] = attr.value;
        return result;
      }
      function tokenAttrs_(token) {
        var result = {};
        if (token.attrs) for (var i = 0, attr; attr = token.attrs[i]; i++) result[getTokenName(attr)] = attr;
        return result;
      }
      function addUnique(array, items) {
        for (var i = 0; i < items.length; i++) arrayAdd(array, items[i]);
      }
      function importStyles(array, items, prefix, includeToken) {
        for (var i = 0, item; item = items[i]; i++) {
          if (item[1] !== styleNamespaceIsolate) item[1] = prefix + item[1];
          if (!item[3]) item[3] = includeToken;
        }
        array.unshift.apply(array, items);
      }
      function addStyle(template, token, src, isolatePrefix, namespace) {
        var text = token.children[0];
        var url = src ? basis.resource.resolveURI(src, template.baseURI, '<b:style src="{url}"/>') : basis.resource.virtual("css", text ? text.value : "", template.sourceUrl).url;
        token.sourceUrl = template.sourceUrl;
        template.resources.push([ url, isolatePrefix, token, null, src ? false : text || true, namespace ]);
        return url;
      }
      function getLocation(template, loc) {
        if (loc) return (template.sourceUrl || "") + ":" + loc.start.line + ":" + (loc.start.column + 1);
      }
      function addTemplateWarn(template, options, message, loc) {
        if (loc && options.loc) {
          message = Object(message);
          message.loc = typeof loc == "string" ? loc : getLocation(template, loc);
        }
        template.warns.push(message);
      }
      function applyTokenLocation(template, options, dest, source) {
        if (options.loc && source && source.loc && !dest.loc) dest.loc = getLocation(template, source.loc);
      }
      function process(tokens, template, options) {
        function addTokenLocation(item, token) {
          applyTokenLocation(template, options, item, token);
        }
        function getAttributeValueLocationMap(token) {
          if (!token || !token.map_) return null;
          return token.map_.reduce(function(res, part) {
            if (!part.binding) res[part.value] = getLocation(template, part.loc);
            return res;
          }, {});
        }
        function addStateInfo(name, type, value) {
          if (!hasOwnProperty.call(template.states, name)) template.states[name] = {};
          var info = template.states[name];
          var isArray = Array.isArray(value);
          if (!hasOwnProperty.call(info, type) || !isArray) info[type] = isArray ? basis.array(value) : value; else addUnique(info[type], value);
        }
        function parseIncludeOptions(str) {
          var result = {};
          var pairs = (str || "").trim().split(/\s*,\s*/);
          for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split(/\s*:\s*/);
            if (pair.length != 2) {
              return {};
            }
            result[pair[0]] = pair[1];
          }
          return result;
        }
        function getAttrByName(token, name) {
          var offset = typeof token[0] == "number" ? ELEMENT_ATTRIBUTES_AND_CHILDREN : 0;
          for (var i = offset, attr, attrName; attr = token[i]; i++) {
            if (attr[TOKEN_TYPE] == TYPE_ATTRIBUTE_EVENT) attrName = "event-" + attr[1]; else attrName = ATTR_NAME_BY_TYPE[attr[TOKEN_TYPE]] || attr[ATTR_NAME];
            if (attrName == name) return attr;
          }
        }
        function getStyleBindingProperty(attr, name) {
          var bindings = attr[TOKEN_BINDINGS];
          if (bindings) for (var i = 0, binding; binding = bindings[i]; i++) if (binding[2] == name) return binding;
        }
        function setStylePropertyBinding(host, attr, property, showByDefault, defaultValue) {
          var styleAttr = getAttrByName(host, "style");
          if (!styleAttr) {
            styleAttr = [ TYPE_ATTRIBUTE_STYLE, 0, 0 ];
            addTokenLocation(styleAttr, attr);
            host.push(styleAttr);
          }
          var binding = attr.binding;
          var addDefault = false;
          var show = attr.name == showByDefault;
          var value = styleAttr[3];
          if (!binding || binding[0].length != binding[1].length) {
            addDefault = !(show ^ attr.value === "");
          } else {
            var bindings = styleAttr[TOKEN_BINDINGS];
            binding = binding.concat(property, attr.name);
            addDefault = show;
            if (bindings) {
              arrayRemove(bindings, getStyleBindingProperty(styleAttr, property));
              bindings.push(binding);
            } else styleAttr[TOKEN_BINDINGS] = [ binding ];
          }
          if (value) value = value.replace(new RegExp(property + "\\s*:\\s*[^;]+(;|$)"), "");
          if (addDefault) value = (value ? value + " " : "") + defaultValue;
          styleAttr[3] = value;
        }
        function applyShowHideAttribute(host, attr) {
          if (attr.name == "show" || attr.name == "hide") setStylePropertyBinding(host, attr, "display", "show", "display: none;");
          if (attr.name == "visible" || attr.name == "hidden") setStylePropertyBinding(host, attr, "visibility", "visible", "visibility: hidden;");
        }
        function processAttrs(token, declToken) {
          var result = [];
          var styleAttr;
          var displayAttr;
          var visibilityAttr;
          var item;
          var m;
          for (var i = 0, attr; attr = token.attrs[i]; i++) {
            if (attr.prefix == "b") {
              switch (attr.name) {
                case "ref":
                  var refs = (attr.value || "").trim().split(/\s+/);
                  for (var j = 0; j < refs.length; j++) addTokenRef(declToken, refs[j]);
                  break;
                case "show":
                case "hide":
                  displayAttr = attr;
                  break;
                case "visible":
                case "hidden":
                  visibilityAttr = attr;
                  break;
              }
              continue;
            }
            if (m = attr.name.match(ATTR_EVENT_RX)) {
              item = m[1] == attr.value ? [ TYPE_ATTRIBUTE_EVENT, m[1] ] : [ TYPE_ATTRIBUTE_EVENT, m[1], attr.value ];
            } else {
              item = [ attr.type, attr.binding, 0 ];
              if (attr.type == 2) item.push(getTokenName(attr));
              if (attr.value && (!options.optimizeSize || !attr.binding || attr.type != 2)) item.push(attr.value);
              if (attr.type == TYPE_ATTRIBUTE_STYLE) styleAttr = item;
            }
            item.valueLocMap = getAttributeValueLocationMap(attr);
            item.sourceToken = attr;
            addTokenLocation(item, attr);
            result.push(item);
          }
          if (displayAttr) applyShowHideAttribute(result, displayAttr);
          if (visibilityAttr) applyShowHideAttribute(result, visibilityAttr);
          return result.length ? result : 0;
        }
        function modifyAttr(include, token, name, action) {
          var attrs = tokenAttrs(token);
          var attrs_ = tokenAttrs_(token);
          if (name) attrs.name = name;
          if (!attrs.name) {
            addTemplateWarn(template, options, "Instruction <b:" + token.name + "> has no `name` attribute", token.loc);
            return;
          }
          if (!IDENT.test(attrs.name)) {
            addTemplateWarn(template, options, "Bad attribute name `" + attrs.name + "`", token.loc);
            return;
          }
          var includedToken = tokenRefMap[attrs.ref || "element"];
          if (includedToken) {
            if (includedToken.token[TOKEN_TYPE] == TYPE_ELEMENT) {
              var itAttrs = includedToken.token;
              var isEvent = attrs.name.match(ATTR_EVENT_RX);
              var isClassOrStyle = attrs.name == "class" || attrs.name == "style";
              var itType = isEvent ? TYPE_ATTRIBUTE_EVENT : ATTR_TYPE_BY_NAME[attrs.name] || TYPE_ATTRIBUTE;
              var valueIdx = ATTR_VALUE_INDEX[itType] || ATTR_VALUE;
              var valueLocMap = getAttributeValueLocationMap(attrs_.value);
              var itAttrToken = itAttrs && getAttrByName(itAttrs, attrs.name);
              if (itAttrToken && action == "set") {
                template.removals.push({
                  reason: "<b:" + token.name + ">",
                  removeToken: token,
                  includeToken: include,
                  token: itAttrToken
                });
                arrayRemove(itAttrs, itAttrToken);
                itAttrToken = null;
              }
              if (!itAttrToken && (action == "set" || action == "append")) {
                action = "set";
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
                itAttrToken.valueLocMap = valueLocMap;
                addTokenLocation(itAttrToken, token);
              }
              switch (action) {
                case "set":
                  if (itAttrToken[TOKEN_TYPE] == TYPE_ATTRIBUTE_EVENT) {
                    if (attrs.value == isEvent[1]) itAttrToken.length = 2; else itAttrToken[valueIdx] = attrs.value;
                    return;
                  }
                  var valueAttr = attrs_.value || {};
                  itAttrToken[TOKEN_BINDINGS] = valueAttr.binding || 0;
                  itAttrToken.valueLocMap = valueLocMap;
                  if (!options.optimizeSize || !itAttrToken[TOKEN_BINDINGS] || isClassOrStyle) itAttrToken[valueIdx] = valueAttr.value || ""; else itAttrToken.length = valueIdx;
                  if (isClassOrStyle) if (!itAttrToken[TOKEN_BINDINGS] && !itAttrToken[valueIdx]) {
                    arrayRemove(itAttrs, itAttrToken);
                    return;
                  }
                  break;
                case "append":
                  var valueAttr = attrs_.value || {};
                  var appendValue = valueAttr.value || "";
                  var appendBinding = valueAttr.binding;
                  if (!isEvent) {
                    if (appendBinding) {
                      var attrBindings = itAttrToken[TOKEN_BINDINGS];
                      if (attrBindings) {
                        switch (attrs.name) {
                          case "style":
                            for (var i = 0, newBinding; newBinding = appendBinding[i]; i++) {
                              arrayRemove(attrBindings, getStyleBindingProperty(itAttrToken, newBinding[2]));
                              attrBindings.push(newBinding);
                            }
                            break;
                          case "class":
                            attrBindings.push.apply(attrBindings, appendBinding);
                            break;
                          default:
                            appendBinding[0].forEach(function(name) {
                              arrayAdd(this, name);
                            }, attrBindings[0]);
                            for (var i = 0; i < appendBinding[1].length; i++) {
                              var value = appendBinding[1][i];
                              if (typeof value == "number") value = attrBindings[0].indexOf(appendBinding[0][value]);
                              attrBindings[1].push(value);
                            }
                        }
                      } else {
                        itAttrToken[TOKEN_BINDINGS] = appendBinding;
                        if (!isClassOrStyle) itAttrToken[TOKEN_BINDINGS][1].unshift(itAttrToken[valueIdx]);
                      }
                    } else {
                      if (!isClassOrStyle && itAttrToken[TOKEN_BINDINGS]) itAttrToken[TOKEN_BINDINGS][1].push(attrs.value);
                    }
                  }
                  if (appendValue) {
                    if (isEvent || attrs.name == "class") {
                      var parts = (itAttrToken[valueIdx] || "").trim();
                      var appendParts = appendValue.trim();
                      parts = parts ? parts.split(/\s+/) : [];
                      appendParts = appendParts ? appendParts.split(/\s+/) : [];
                      for (var i = 0; i < appendParts.length; i++) {
                        var part = appendParts[i];
                        basis.array.remove(parts, part);
                        parts.push(part);
                      }
                      itAttrToken[valueIdx] = parts.join(" ");
                    } else {
                      itAttrToken[valueIdx] = (itAttrToken[valueIdx] || "") + (itAttrToken[valueIdx] && isClassOrStyle ? " " : "") + appendValue;
                    }
                    if (valueLocMap) {
                      if (itAttrToken.valueLocMap) for (var name in valueLocMap) itAttrToken.valueLocMap[name] = valueLocMap[name]; else itAttrToken.valueLocMap = valueLocMap;
                    }
                  }
                  if (isClassOrStyle && !itAttrToken[TOKEN_BINDINGS] && !itAttrToken[valueIdx]) arrayRemove(itAttrs, itAttrToken);
                  break;
                case "remove-class":
                  if (itAttrToken) {
                    var valueAttr = attrs_.value || {};
                    var values = (itAttrToken[valueIdx] || "").split(" ");
                    var removeValues = (valueAttr.value || "").split(" ");
                    var bindings = itAttrToken[TOKEN_BINDINGS];
                    var removedValues = [];
                    var removedBindings = 0;
                    if (valueAttr.binding && bindings) {
                      for (var i = 0, removeBinding; removeBinding = valueAttr.binding[i]; i++) for (var j = bindings.length - 1, classBinding; classBinding = bindings[j]; j--) {
                        var prefix = classBinding[0];
                        var bindingName = classBinding[3] || classBinding[1];
                        if (prefix === removeBinding[0] && bindingName === removeBinding[1]) {
                          bindings.splice(j, 1);
                          if (!removedBindings) removedBindings = [ classBinding ]; else removedBindings.push(classBinding);
                        }
                      }
                      if (!bindings.length) itAttrToken[TOKEN_BINDINGS] = 0;
                    }
                    for (var i = 0; i < removeValues.length; i++) {
                      if (values.indexOf(removeValues[i]) != -1) removedValues.push(removeValues[i]);
                      arrayRemove(values, removeValues[i]);
                      if (itAttrToken.valueLocMap) delete itAttrToken.valueLocMap[removeValues[i]];
                    }
                    itAttrToken[valueIdx] = values.join(" ");
                    if (!bindings.length && !values.length) arrayRemove(itAttrs, itAttrToken);
                    if (removedValues.length || removedBindings.length) template.removals.push({
                      reason: "<b:" + token.name + ">",
                      removeToken: token,
                      includeToken: include,
                      token: [ TYPE_ATTRIBUTE_CLASS, removedBindings, 0, removedValues.join(" ") ]
                    });
                  }
                  break;
                case "remove":
                  if (itAttrToken) {
                    arrayRemove(itAttrs, itAttrToken);
                    template.removals.push({
                      reason: "<b:" + token.name + ">",
                      removeToken: token,
                      includeToken: include,
                      token: itAttrToken
                    });
                  }
                  break;
              }
            } else {
              addTemplateWarn(template, options, "Attribute modificator is not reference to element token (reference name: " + (attrs.ref || "element") + ")", token.loc);
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
                var elAttrs_ = tokenAttrs_(token);
                switch (token.name) {
                  case "style":
                    var useStyle = true;
                    if (elAttrs.options) {
                      var filterOptions = parseIncludeOptions(elAttrs.options);
                      for (var name in filterOptions) useStyle = useStyle && filterOptions[name] == options.includeOptions[name];
                    }
                    if (useStyle) {
                      var namespaceAttrName = elAttrs.namespace ? "namespace" : "ns";
                      var styleNamespace = elAttrs[namespaceAttrName];
                      var styleIsolate = styleNamespace ? styleNamespaceIsolate : "";
                      var src = addStyle(template, token, elAttrs.src, styleIsolate, styleNamespace);
                      if (styleNamespace) {
                        if (src in styleNamespaceIsolate == false) styleNamespaceIsolate[src] = genIsolateMarker();
                        template.styleNSPrefix[styleNamespace] = {
                          loc: getLocation(template, elAttrs_[namespaceAttrName].loc),
                          used: false,
                          name: styleNamespace,
                          prefix: styleNamespaceIsolate[src]
                        };
                      }
                    } else {
                      token.sourceUrl = template.sourceUrl;
                      template.resources.push([ null, styleIsolate, token, null, elAttrs.src ? false : token.children[0] || true, styleNamespace ]);
                    }
                    break;
                  case "isolate":
                    if (!template.isolate) template.isolate = elAttrs.prefix || options.isolate || genIsolateMarker(); else addTemplateWarn(template, options, "<b:isolate> is already set to `" + template.isolate + "`", token.loc);
                    break;
                  case "l10n":
                    if (elAttrs.src) options.dictURI = basis.resource.resolveURI(elAttrs.src, template.baseURI, "<b:" + token.name + ' src="{url}"/>');
                    break;
                  case "define":
                    if ("name" in elAttrs == false) addTemplateWarn(template, options, "<b:define> has no `name` attribute", token.loc);
                    if ("type" in elAttrs == false) addTemplateWarn(template, options, "<b:define> has no `type` attribute", token.loc);
                    if (hasOwnProperty.call(options.defines, elAttrs.name)) addTemplateWarn(template, options, "<b:define> for `" + elAttrs.name + "` has already defined", token.loc);
                    if ("name" in elAttrs && "type" in elAttrs && !hasOwnProperty.call(options.defines, elAttrs.name)) {
                      var bindingName = elAttrs.from || elAttrs.name;
                      var defineName = elAttrs.name;
                      var define = false;
                      var defaultIndex;
                      var values;
                      switch (elAttrs.type) {
                        case "bool":
                          define = [ bindingName, CLASS_BINDING_BOOL, defineName, elAttrs["default"] == "true" ? 1 : 0 ];
                          addStateInfo(bindingName, "bool", true);
                          break;
                        case "enum":
                          if ("values" in elAttrs == false) {
                            addTemplateWarn(template, options, "Enum <b:define> has no `values` attribute", token.loc);
                            break;
                          }
                          values = (elAttrs.values || "").trim();
                          if (!values) {
                            addTemplateWarn(template, options, "Enum <b:define> has no variants (`values` attribute is empty)", elAttrs_.values && elAttrs_.values.loc);
                            break;
                          }
                          values = values.split(/\s+/);
                          defaultIndex = values.indexOf(elAttrs["default"]);
                          if ("default" in elAttrs && defaultIndex == -1) addTemplateWarn(template, options, "Enum <b:define> has bad value as default (value ignored)", elAttrs_["default"] && elAttrs_["default"].loc);
                          define = [ bindingName, CLASS_BINDING_ENUM, defineName, defaultIndex + 1, values ];
                          addStateInfo(bindingName, "enum", values);
                          break;
                        default:
                          addTemplateWarn(template, options, "Bad type in <b:define> for `" + defineName + "`: " + elAttrs.type, elAttrs_.type && elAttrs_.type.valueLoc);
                      }
                      if (define) {
                        addTokenLocation(define, token);
                        options.defines[defineName] = define;
                      }
                    }
                    break;
                  case "text":
                    var text = token.children[0];
                    tokens[i--] = basis.object.extend(text, {
                      refs: (elAttrs.ref || "").trim().split(/\s+/),
                      value: "notrim" in elAttrs ? text.value : text.value.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, "")
                    });
                    break;
                  case "include":
                    var templateSrc = elAttrs.src;
                    if (templateSrc) {
                      var resource = resolveResource(templateSrc, template.baseURI);
                      if (!resource) {
                        addTemplateWarn(template, options, '<b:include src="' + templateSrc + '"> is not resolved, instruction ignored', token.loc);
                        continue;
                      }
                      if (includeStack.indexOf(resource) == -1) {
                        var isolatePrefix = elAttrs_.isolate ? elAttrs_.isolate.value || genIsolateMarker() : "";
                        var includeOptions = elAttrs.options ? parseIncludeOptions(elAttrs.options) : null;
                        var declarationOptions = basis.object.merge(options, {
                          includeOptions: includeOptions
                        });
                        var decl = getDeclFromSource(resource, "", true, declarationOptions);
                        arrayAdd(template.deps, resource);
                        template.includes.push({
                          token: token,
                          resource: resource,
                          nested: decl.includes
                        });
                        if (decl.deps) addUnique(template.deps, decl.deps);
                        if (decl.warns) template.warns.push.apply(template.warns, decl.warns);
                        if (decl.removals) template.removals.push.apply(template.removals, decl.removals);
                        if (decl.resources && "no-style" in elAttrs == false) importStyles(template.resources, decl.resources, isolatePrefix, token);
                        var instructions = basis.array(token.children);
                        var styleNSIsolate = {
                          map: options.styleNSIsolateMap,
                          prefix: genIsolateMarker()
                        };
                        var tokenRefMap = normalizeRefs(decl.tokens, styleNSIsolate);
                        for (var key in decl.styleNSPrefix) template.styleNSPrefix[styleNSIsolate.prefix + key] = basis.object.merge(decl.styleNSPrefix[key], {
                          used: hasOwnProperty.call(options.styleNSIsolateMap, styleNSIsolate.prefix + key)
                        });
                        if (isolatePrefix) {
                          isolateTokens(decl.tokens, isolatePrefix);
                          if (decl.removals) decl.removals.forEach(function(item) {
                            isolateTokens([ item.token ], isolatePrefix);
                          });
                        }
                        for (var includeAttrName in elAttrs_) switch (includeAttrName) {
                          case "class":
                            instructions.unshift({
                              type: TYPE_ELEMENT,
                              prefix: "b",
                              name: "append-class",
                              attrs: [ basis.object.complete({
                                name: "value"
                              }, elAttrs_["class"]) ]
                            });
                            break;
                          case "id":
                            instructions.unshift({
                              type: TYPE_ELEMENT,
                              prefix: "b",
                              name: "set-attr",
                              attrs: [ {
                                type: TYPE_ATTRIBUTE,
                                name: "name",
                                value: "id"
                              }, basis.object.complete({
                                name: "value"
                              }, elAttrs_.id) ]
                            });
                            break;
                          case "ref":
                            if (tokenRefMap.element) elAttrs.ref.trim().split(/\s+/).map(function(refName) {
                              addTokenRef(tokenRefMap.element.token, refName);
                            });
                            break;
                          case "show":
                          case "hide":
                          case "visible":
                          case "hidden":
                            var tokenRef = tokenRefMap.element;
                            var token = tokenRef && tokenRef.token;
                            if (token && token[TOKEN_TYPE] == TYPE_ELEMENT) applyShowHideAttribute(token, elAttrs_[includeAttrName]);
                            break;
                        }
                        for (var j = 0, child; child = instructions[j]; j++) {
                          if (child.type == TYPE_ELEMENT && child.prefix == "b") {
                            switch (child.name) {
                              case "style":
                                var childAttrs = tokenAttrs(child);
                                var childAttrs_ = tokenAttrs_(child);
                                var useStyle = true;
                                if (childAttrs.options) {
                                  var filterOptions = parseIncludeOptions(childAttrs.options);
                                  for (var name in filterOptions) useStyle = useStyle && filterOptions[name] == includeOptions[name];
                                }
                                if (useStyle) {
                                  var namespaceAttrName = childAttrs.namespace ? "namespace" : "ns";
                                  var styleNamespace = childAttrs[namespaceAttrName];
                                  var styleIsolate = styleNamespace ? styleNamespaceIsolate : isolatePrefix;
                                  var src = addStyle(template, child, childAttrs.src, styleIsolate, styleNamespace);
                                  if (styleNamespace) {
                                    if (src in styleNamespaceIsolate == false) styleNamespaceIsolate[src] = genIsolateMarker();
                                    template.styleNSPrefix[styleNSIsolate.prefix + styleNamespace] = {
                                      loc: getLocation(template, childAttrs_[namespaceAttrName].loc),
                                      used: false,
                                      name: styleNamespace,
                                      prefix: styleNamespaceIsolate[src]
                                    };
                                  }
                                } else {
                                  child.sourceUrl = template.sourceUrl;
                                  template.resources.push([ null, styleIsolate, child, token, childAttrs.src ? false : child.children[0] || true, styleNamespace ]);
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
                                  var parent = tokenRef.owner;
                                  var pos = parent.indexOf(tokenRef.token);
                                  if (pos != -1) {
                                    var args = [ pos + (child.name == "after"), replaceOrRemove ];
                                    if (child.name != "remove") args = args.concat(process(child.children, template, options) || []);
                                    parent.splice.apply(parent, args);
                                    if (replaceOrRemove) template.removals.push({
                                      reason: "<b:" + child.name + ">",
                                      removeToken: child,
                                      includeToken: token,
                                      token: tokenRef.token
                                    });
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
                                  var children = process(child.children, template, options) || [];
                                  if (child.name == "prepend") token.splice.apply(token, [ ELEMENT_ATTRIBUTES_AND_CHILDREN, 0 ].concat(children)); else token.push.apply(token, children);
                                }
                                break;
                              case "show":
                              case "hide":
                              case "visible":
                              case "hidden":
                                var childAttrs = tokenAttrs(child);
                                var ref = "ref" in childAttrs ? childAttrs.ref : "element";
                                var tokenRef = ref && tokenRefMap[ref];
                                var token = tokenRef && tokenRef.token;
                                if (token && token[TOKEN_TYPE] == TYPE_ELEMENT) {
                                  var expr = tokenAttrs_(child).expr;
                                  if (!expr) {
                                    addTemplateWarn(template, options, "Instruction <b:" + child.name + "> has no `expr` attribute", child.loc);
                                    break;
                                  }
                                  applyShowHideAttribute(token, basis.object.complete({
                                    name: child.name
                                  }, tokenAttrs_(child).expr));
                                }
                                break;
                              case "attr":
                              case "set-attr":
                                modifyAttr(token, child, false, "set");
                                break;
                              case "append-attr":
                                modifyAttr(token, child, false, "append");
                                break;
                              case "remove-attr":
                                modifyAttr(token, child, false, "remove");
                                break;
                              case "class":
                              case "append-class":
                                modifyAttr(token, child, "class", "append");
                                break;
                              case "set-class":
                                modifyAttr(token, child, "class", "set");
                                break;
                              case "remove-class":
                                var childAttrs_ = tokenAttrs_(child);
                                var valueAttr = childAttrs_.value;
                                if (valueAttr) {
                                  valueAttr.value = valueAttr.value.split(/\s+/).map(function(name) {
                                    return name.indexOf(":") > 0 ? styleNSIsolate.prefix + name : name;
                                  }).join(" ");
                                  if (valueAttr.binding) valueAttr.binding.forEach(function(bind) {
                                    if (bind[0].indexOf(":") > 0) bind[0] = styleNSIsolate.prefix + bind[0];
                                  });
                                  if (valueAttr.map_) valueAttr.map_.forEach(function(item) {
                                    if (item.value.indexOf(":") > 0) item.value = styleNSIsolate.prefix + item.value;
                                  });
                                }
                                modifyAttr(token, child, "class", "remove-class");
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
                                addTemplateWarn(template, options, "Unknown instruction tag: <b:" + child.name + ">", child.loc);
                            }
                          } else {
                            decl.tokens.push.apply(decl.tokens, process([ child ], template, options) || []);
                          }
                        }
                        if (tokenRefMap.element) removeTokenRef(tokenRefMap.element.token, "element");
                        result.push.apply(result, decl.tokens);
                      } else {
                        var stack = includeStack.slice(includeStack.indexOf(resource) || 0).concat(resource).map(function(res) {
                          if (res instanceof Template) res = res.source;
                          return res.id || res.url || "[inline template]";
                        });
                        template.warns.push("Recursion: ", stack.join(" -> "));
                        basis.dev.warn("Recursion in template: ", stack.join(" -> "));
                      }
                    }
                    break;
                  default:
                    addTemplateWarn(template, options, "Unknown instruction tag: <b:" + token.name + ">", token.loc);
                }
                continue;
              }
              item = [ 1, bindings, refs, getTokenName(token) ];
              item.push.apply(item, processAttrs(token, item, options.optimizeSize) || []);
              item.push.apply(item, process(token.children, template, options) || []);
              addTokenLocation(item, token);
              item.sourceToken = token;
              break;
            case TYPE_TEXT:
              if (refs && refs.length == 2 && arraySearch(refs, "element")) bindings = refs[+!refs.lastSearchIndex];
              item = [ 3, bindings, refs ];
              if (!refs || token.value != "{" + refs.join("|") + "}") item.push(token.value);
              addTokenLocation(item, token);
              item.sourceToken = token;
              break;
            case TYPE_COMMENT:
              if (options.optimizeSize && !bindings && !refs) continue;
              item = [ 8, bindings, refs ];
              if (!options.optimizeSize) if (!refs || token.value != "{" + refs.join("|") + "}") item.push(token.value);
              addTokenLocation(item, token);
              item.sourceToken = token;
              break;
          }
          while (item[item.length - 1] === 0) item.pop();
          result.push(item);
        }
        return result.length ? result : 0;
      }
      function absl10n(value, dictURI, l10nMap) {
        if (typeof value == "string") {
          var parts = value.split(":");
          var key = parts[1];
          if (parts[0] == "l10n") {
            if (parts.length == 2 && key.indexOf("@") == -1) {
              if (!dictURI) return false;
              key = key + "@" + dictURI;
              value = "l10n:" + key;
            }
            arrayAdd(l10nMap, key);
          }
        }
        return value;
      }
      function normalizeRefs(tokens, isolate, map, stIdx) {
        function processName(name) {
          if (name.indexOf(":") <= 0) return name;
          var prefix = name.split(":")[0];
          isolate.map[isolate.prefix + prefix] = prefix;
          return isolate.prefix + name;
        }
        if (!map) map = {};
        for (var i = stIdx || 0, token; token = tokens[i]; i++) {
          var tokenType = token[TOKEN_TYPE];
          var refs = token[TOKEN_REFS];
          if (isolate && tokenType == TYPE_ATTRIBUTE_CLASS) {
            var bindings = token[TOKEN_BINDINGS];
            var valueIndex = ATTR_VALUE_INDEX[tokenType];
            if (token[valueIndex]) token[valueIndex] = token[valueIndex].split(/\s+/).map(processName).join(" ");
            if (token.valueLocMap) {
              var oldValueLocMap = token.valueLocMap;
              token.valueLocMap = {};
              for (var name in oldValueLocMap) token.valueLocMap[processName(name)] = oldValueLocMap[name];
            }
            if (bindings) for (var k = 0, bind; bind = bindings[k]; k++) bind[0] = processName(bind[0]);
          }
          if (tokenType != TYPE_ATTRIBUTE_EVENT && refs) {
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
          if (tokenType === TYPE_ELEMENT) normalizeRefs(token, isolate, map, ELEMENT_ATTRIBUTES_AND_CHILDREN);
        }
        return map;
      }
      function applyDefines(tokens, template, options, stIdx) {
        for (var i = stIdx || 0, token; token = tokens[i]; i++) {
          var tokenType = token[TOKEN_TYPE];
          var bindings = token[TOKEN_BINDINGS];
          switch (token[TOKEN_TYPE]) {
            case TYPE_ELEMENT:
              applyDefines(token, template, options, ELEMENT_ATTRIBUTES_AND_CHILDREN);
              break;
            case TYPE_TEXT:
              if (bindings) {
                var binding = absl10n(bindings, options.dictURI, template.l10n);
                token[TOKEN_BINDINGS] = binding || 0;
                if (binding === false) {
                  addTemplateWarn(template, options, "Dictionary for l10n binding on text node can't be resolved: {" + bindings + "}", token.loc);
                  token[TEXT_VALUE] = "{" + bindings + "}";
                }
              }
              break;
            case TYPE_ATTRIBUTE:
              if (bindings) {
                var array = bindings[0];
                for (var j = 0; j < array.length; j++) {
                  var binding = absl10n(array[j], options.dictURI, template.l10n);
                  array[j] = binding === false ? "{" + array[j] + "}" : binding;
                  if (binding === false) addTemplateWarn(template, options, "Dictionary for l10n binding on attribute can't be resolved: {" + array[j] + "}", token.loc);
                }
              }
              break;
            case TYPE_ATTRIBUTE_CLASS:
              if (bindings) {
                for (var k = 0, bind; bind = bindings[k]; k++) {
                  if (bind.length > 2) continue;
                  applyTokenLocation(template, options, bind, bind.info_);
                  var bindNameParts = bind[1].split(":");
                  var bindName = bindNameParts.pop();
                  var bindPrefix = bindNameParts.pop() || "";
                  if (hasOwnProperty.call(options.defines, bindName)) {
                    var define = options.defines[bindName];
                    bind[1] = (bindPrefix ? bindPrefix + ":" : "") + define[0];
                    bind.push.apply(bind, define.slice(1));
                    define.used = true;
                  } else {
                    bind.push(0);
                    addTemplateWarn(template, options, "Unpredictable class binding: " + bind[0] + "{" + bind[1] + "}", bind.loc);
                  }
                }
                if (options.optimizeSize) {
                  var valueIdx = ATTR_VALUE_INDEX[tokenType];
                  if (!token[valueIdx]) token.length = valueIdx;
                }
              }
              break;
          }
        }
      }
      function isolateTokens(tokens, isolate, template, options, stIdx) {
        function processName(name) {
          if (name.indexOf(":") == -1) return isolate + name;
          if (!template) return name;
          var parts = name.split(":");
          if (!parts[0]) return parts[1];
          var namespace = hasOwnProperty.call(template.styleNSPrefix, parts[0]) ? template.styleNSPrefix[parts[0]] : false;
          if (!namespace) {
            var isolatedPrefix = options.styleNSIsolateMap[parts[0]];
            var oldPrefix = parts[0];
            var fullName = arguments[1];
            var loc = arguments[2];
            if (fullName) {
              if (isolatedPrefix) fullName = fullName.replace(oldPrefix, isolatedPrefix);
              addTemplateWarn(template, options, "Namespace `" + (isolatedPrefix || oldPrefix) + "` is not defined: " + fullName, loc);
            }
            return false;
          } else {
            namespace.used = true;
            return namespace.prefix + parts[1];
          }
        }
        for (var i = stIdx || 0, token; token = tokens[i]; i++) {
          var tokenType = token[TOKEN_TYPE];
          if (tokenType == TYPE_ELEMENT) isolateTokens(token, isolate, template, options, ELEMENT_ATTRIBUTES_AND_CHILDREN);
          if (tokenType == TYPE_ATTRIBUTE_CLASS) {
            var bindings = token[TOKEN_BINDINGS];
            var valueIndex = ATTR_VALUE_INDEX[tokenType];
            if (token[valueIndex]) token[valueIndex] = token[valueIndex].split(/\s+/).map(function(name) {
              return processName(name, name, token.valueLocMap ? token.valueLocMap[name] : null);
            }).filter(Boolean).join(" ");
            if (bindings) {
              for (var j = 0, bind, prefix, removed; bind = bindings[j]; j++) {
                prefix = processName(bind[0], bind[0] + "{" + bind[1] + "}", bind.loc);
                if (prefix === false) {
                  removed = true;
                  bindings[j] = null;
                } else bind[0] = prefix;
              }
              if (removed) {
                bindings = bindings.filter(Boolean);
                token[TOKEN_BINDINGS] = bindings.length ? bindings : 0;
              }
            }
            if (token.valueLocMap) {
              var oldValueLocMap = token.valueLocMap;
              token.valueLocMap = {};
              for (var name in oldValueLocMap) {
                var newKey = processName(name);
                if (newKey) token.valueLocMap[newKey] = oldValueLocMap[name];
              }
            }
          }
        }
      }
      function styleHash(style) {
        return style[0] + "|" + style[1];
      }
      return function makeDeclaration(source, baseURI, options, sourceUrl, sourceOrigin) {
        var warns = [];
        var source_;
        options = basis.object.slice(options);
        options.includeOptions = options.includeOptions || {};
        options.defines = {};
        options.dictURI = sourceUrl ? basis.path.resolve(sourceUrl) : baseURI || "";
        options.styleNSIsolateMap = {};
        options.loc = true;
        options.range = true;
        var result = {
          sourceUrl: sourceUrl,
          baseURI: baseURI || "",
          tokens: null,
          includes: [],
          deps: [],
          isolate: false,
          styleNSPrefix: {},
          resources: [],
          l10n: [],
          warns: warns
        };
        result.removals = [];
        result.states = {};
        if (options.dictURI) {
          var extname = basis.path.extname(options.dictURI);
          if (extname && extname != ".l10n") options.dictURI = options.dictURI.substr(0, options.dictURI.length - extname.length) + ".l10n";
        }
        if (!source.templateTokens) {
          source_ = source;
          source = tokenize(String(source), {
            loc: !!options.loc,
            range: !!options.range
          });
        }
        if (source.warns) source.warns.forEach(function(warn) {
          addTemplateWarn(result, options, warn[0], warn[1].loc);
        });
        includeStack.push(sourceOrigin !== true && sourceOrigin || {});
        result.tokens = process(source, result, options);
        includeStack.pop();
        if (!result.tokens) result.tokens = [ [ TYPE_TEXT, 0, 0, "" ] ];
        if (source_) result.tokens.source_ = source_;
        addTokenRef(result.tokens[0], "element");
        normalizeRefs(result.tokens);
        applyDefines(result.tokens, result, options);
        if (/^[^a-z]/i.test(result.isolate)) basis.dev.error("basis.template: isolation prefix `" + result.isolate + "` should not starts with symbol other than letter, otherwise it leads to incorrect css class names and broken styles");
        if (includeStack.length == 0) {
          isolateTokens(result.tokens, result.isolate || "", result, options);
          result.warns = [];
          if (result.removals) result.removals.forEach(function(item) {
            isolateTokens([ item.token ], result.isolate || "", result, options);
          });
          result.warns = warns;
          for (var key in result.styleNSPrefix) {
            var styleNSPrefix = result.styleNSPrefix[key];
            if (!styleNSPrefix.used) addTemplateWarn(result, options, "Unused namespace: " + styleNSPrefix.name, styleNSPrefix.loc);
          }
          if (result.isolate) for (var i = 0, item; item = result.resources[i]; i++) if (item[1] !== styleNamespaceIsolate) item[1] = result.isolate + item[1];
          var styles = result.resources;
          result.resources = result.resources.filter(function(item, idx, array) {
            return item[0] && !basis.array.search(array, styleHash(item), styleHash, idx + 1);
          }).map(function(item) {
            var url = item[0];
            var isolate = item[1];
            var namespaceIsolate = isolate === styleNamespaceIsolate;
            var cssMap;
            if (namespaceIsolate) {
              isolate = styleNamespaceIsolate[url];
              if (url in styleNamespaceResource) {
                item.url = styleNamespaceResource[url].url;
                return styleNamespaceResource[url].url;
              }
            }
            if (!isolate) {
              item.url = url;
              return url;
            }
            var resource = basis.resource.virtual("css", "").ready(function(cssResource) {
              cssResource.url = url + "?isolate-prefix=" + isolate;
              cssResource.baseURI = basis.path.dirname(url) + "/";
              cssResource.map = cssMap;
              sourceResource();
            });
            var sourceResource = basis.resource(url).ready(function(cssResource) {
              var isolated = isolateCss(cssResource.cssText || "", isolate, true);
              if (typeof global.btoa == "function") isolated.css += "\n/*# sourceMappingURL=data:application/json;base64," + global.btoa('{"version":3,"sources":["' + basis.path.origin + url + '"],' + '"mappings":"AAAA' + basis.string.repeat(";AACA", isolated.css.split("\n").length) + '"}') + " */";
              cssMap = isolated.map;
              resource.update(isolated.css);
            });
            if (namespaceIsolate) styleNamespaceResource[url] = resource;
            item.url = resource.url;
            return resource.url;
          });
          result.styles = styles.map(function(item, idx) {
            var sourceUrl = item[0] || tokenAttrs(item[2]).src;
            return {
              resource: item.url || false,
              sourceUrl: basis.resource.resolveURI(sourceUrl),
              isolate: item[1] === styleNamespaceIsolate ? styleNamespaceIsolate[item[0]] : item[1] || false,
              namespace: item[5] || false,
              inline: item[4],
              styleToken: item[2],
              includeToken: item[3]
            };
          });
        }
        for (var key in options.defines) {
          var define = options.defines[key];
          if (!define.used) addTemplateWarn(result, options, "Unused define: " + key, define.loc);
        }
        if (!warns.length) result.warns = false;
        return result;
      };
    }();
    function cloneDecl(array) {
      var result = [];
      if (array.source_) result.source_ = array.source_;
      for (var i = 0; i < array.length; i++) result.push(Array.isArray(array[i]) ? cloneDecl(array[i]) : array[i]);
      return result;
    }
    function getDeclFromSource(source, baseURI, clone, options) {
      var result = source;
      var sourceUrl;
      if (source.bindingBridge) {
        baseURI = "baseURI" in source ? source.baseURI : "url" in source ? basis.path.dirname(source.url) : baseURI;
        sourceUrl = "url" in source ? source.url : sourceUrl;
        result = source.bindingBridge.get(source);
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
    basis.resource("./1.js").ready(function(exports) {
      resolveResource = exports.resolveResource;
      Template = exports.Template;
    });
    module.exports = {
      VERSION: 3,
      makeDeclaration: makeDeclaration,
      getDeclFromSource: getDeclFromSource
    };
  },
  "c.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var consts = basis.require("./2.js");
    var TYPE_ELEMENT = consts.TYPE_ELEMENT;
    var TYPE_ATTRIBUTE = consts.TYPE_ATTRIBUTE;
    var TYPE_TEXT = consts.TYPE_TEXT;
    var TYPE_COMMENT = consts.TYPE_COMMENT;
    var ATTR_TYPE_BY_NAME = consts.ATTR_TYPE_BY_NAME;
    var SYNTAX_ERROR = "Invalid or unsupported syntax";
    var TEXT = /((?:.|[\r\n])*?)(\{(?:l10n:([a-zA-Z_][a-zA-Z0-9_\-]*(?:\.[a-zA-Z_][a-zA-Z0-9_\-]*)*(?:\.\{[a-zA-Z_][a-zA-Z0-9_\-]*\})?)\})?|<(\/|!--(\s*\{)?)?|$)/g;
    var TAG_NAME = /([a-z_][a-z0-9\-_]*)(:|\{|\s*(\/?>)?)/ig;
    var ATTRIBUTE_NAME_OR_END = /([a-z_][a-z0-9_\-]*)(:|\{|=|\s*)|(\/?>)/ig;
    var COMMENT = /(.|[\r\n])*?-->/g;
    var CLOSE_TAG = /([a-z_][a-z0-9_\-]*(?::[a-z_][a-z0-9_\-]*)?)>/ig;
    var REFERENCE = /([a-z_][a-z0-9_]*)(\||\}\s*)/ig;
    var ATTRIBUTE_VALUE = /"((?:(\\")|[^"])*?)"\s*/g;
    var QUOTE_UNESCAPE = /\\"/g;
    var BREAK_TAG_PARSE = /^/g;
    var SINGLETON_TAG = /^(area|base|br|col|command|embed|hr|img|input|link|meta|param|source)$/i;
    var TAG_IGNORE_CONTENT = {
      text: /((?:.|[\r\n])*?)(?:<\/b:text>|$)/g,
      style: /((?:.|[\r\n])*?)(?:<\/b:style>|$)/g
    };
    var ATTR_BINDING = /\{([a-z_][a-z0-9_]*|l10n:[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)*(?:\.\{[a-z_][a-z0-9_]*\})?)\}/i;
    var CLASS_ATTR_BINDING = /^((?:[a-z_][a-z0-9_\-]*)?(?::(?:[a-z_][a-z0-9_\-]*)?)?)\{((anim:)?[a-z_][a-z0-9_\-]*)\}$/i;
    var STYLE_ATTR_PARTS = /\s*[^:]+?\s*:(?:\(.*?\)|".*?"|'.*?'|[^;]+?)+(?:;|$)/gi;
    var STYLE_PROPERTY = /\s*([^:]+?)\s*:((?:\(.*?\)|".*?"|'.*?'|[^;]+?)+);?$/i;
    var STYLE_ATTR_BINDING = /\{([a-z_][a-z0-9_]*)\}/i;
    var ATTRIBUTE_MODE = /^(?:|append-|set-|remove-)(class|attr)$/;
    var decodeHTMLTokens = function() {
      var tokenMap = {};
      var tokenElement = !basis.NODE_ENV ? global.document.createElement("div") : null;
      var NAMED_CHARACTER_REF = /&([a-z]+\d*|#\d+|#x[0-9a-f]{1,4});?/gi;
      if (basis.NODE_ENV) tokenMap = __nodejsRequire("./htmlentity.json");
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
      return function decodeHTMLTokens(string) {
        return String(string).replace(NAMED_CHARACTER_REF, namedCharReplace);
      };
    }();
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
        if (parts[j]) expression.push(decodeHTMLTokens(parts[j]));
      }
      return [ names, expression ];
    }
    function processAttr(token, mode, convertRange) {
      var value = token.value;
      var bindings = 0;
      var parts;
      var m;
      if (value) {
        switch (mode) {
          case "class":
            var pos = token.valueRange.start_;
            var rx = /(\s*)(\S+)/g;
            var newValue = [];
            var partMap = [];
            var binding;
            bindings = [];
            while (part = rx.exec(value)) {
              var val = part[2];
              var valInfo = {
                value: val,
                binding: false,
                range: {
                  start_: pos += part[1].length,
                  end_: pos += val.length
                }
              };
              convertRange(valInfo);
              if (m = val.match(CLASS_ATTR_BINDING)) {
                binding = [ m[1] || "", m[2] ];
                binding.info_ = valInfo;
                valInfo.binding = true;
                bindings.push(binding);
              } else newValue.push(val);
              partMap.push(valInfo);
            }
            value = newValue.join(" ");
            token.map_ = partMap;
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
                } else props.push(propertyName + ": " + decodeHTMLTokens(value));
              }
            } else {
              if (/\S/.test(value)) basis.dev.warn("Bad value for style attribute (value ignored):", value);
            }
            value = props.join("; ");
            if (value) value += ";";
            break;
          default:
            parts = value.split(ATTR_BINDING);
            if (parts.length > 1) bindings = buildAttrExpression(parts); else value = decodeHTMLTokens(value);
        }
      }
      if (bindings && !bindings.length) bindings = 0;
      token.binding = bindings;
      token.value = value;
      token.type = ATTR_TYPE_BY_NAME[mode] || TYPE_ATTRIBUTE;
    }
    function postProcessing(tokens, options, source) {
      function tokenName(token) {
        return (token.prefix ? token.prefix + ":" : "") + token.name;
      }
      function getTokenAttrs(token) {
        return token.attrs.reduce(function(res, attr) {
          res[tokenName(attr)] = attr.value;
          return res;
        }, {});
      }
      function buildLocationIndex() {
        var line = 1;
        var column = 0;
        lineIdx = new Array(source.length);
        columnIdx = new Array(source.length);
        for (var i = 0; i < source.length + 1; i++) {
          lineIdx[i] = line;
          columnIdx[i] = column;
          if (source[i] === "\n") {
            line++;
            column = 0;
          } else column++;
        }
      }
      function findLocationByOffset(offset) {
        return {
          line: lineIdx[offset],
          column: columnIdx[offset]
        };
      }
      function getLocationFromRange(range) {
        return {
          start: findLocationByOffset(range.start_),
          end: findLocationByOffset(range.end_)
        };
      }
      function convertRange(token) {
        if (options.loc) {
          token.loc = getLocationFromRange(token.range);
          if (token.valueRange) token.valueLoc = getLocationFromRange(token.valueRange);
        }
        if (options.range) {
          token.range = [ token.range.start_, token.range.end_ ];
          if (token.valueRange) token.valueRange = [ token.valueRange.start_, token.valueRange.end_ ];
        } else {
          delete token.range;
          delete token.valueRange;
        }
      }
      function walk(tokens) {
        var token;
        var prev;
        for (var i = 0; token = tokens[i++]; prev = token) {
          if (token.type == TYPE_ELEMENT) {
            var attrs = getTokenAttrs(token);
            for (var j = 0, attr; attr = token.attrs[j++]; ) {
              var mode = attr.name;
              if (token.prefix == "b" && attr.name == "value") {
                var m = token.name.match(ATTRIBUTE_MODE);
                if (m) mode = m[1] == "class" ? "class" : attrs.name;
              }
              processAttr(attr, mode, convertRange);
              convertRange(attr);
            }
            walk(token.children);
          }
          if (token.type == TYPE_TEXT) {
            token.value = decodeHTMLTokens(token.value);
            if (!token.refs && prev && prev.type == TYPE_TEXT && !prev.refs) {
              prev.value += token.value;
              prev.end_ = token.end_;
              tokens.splice(--i, 1);
            }
          }
          if (token.type == TYPE_COMMENT) {
            token.value = decodeHTMLTokens(token.value);
          }
          convertRange(token);
        }
      }
      var lineIdx;
      var columnIdx;
      if (options.loc) buildLocationIndex();
      walk(tokens);
    }
    function tokenize(source, options) {
      var result = [];
      var tagStack = [];
      var lastTag = {
        children: result
      };
      var parseTag = false;
      var token;
      var state = TEXT;
      var pos = 0;
      var textStateEndPos = 0;
      var textEndPos;
      var bufferPos;
      var startPos;
      var m;
      var attrMap;
      result.source_ = source;
      result.warns = [];
      if (!options || options.trim !== false) {
        pos = textStateEndPos = source.match(/^\s*/)[0].length;
        source = source.trimRight();
      }
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
          if (token) lastTag.children.pop();
          if (token = lastTag.children.pop()) {
            if (token.type == TYPE_TEXT && !token.refs) textStateEndPos -= "len" in token ? token.len : token.value.length; else lastTag.children.push(token);
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
              var sourceText = textStateEndPos == startPos ? m[1] : source.substring(textStateEndPos, textEndPos);
              sourceText = sourceText.replace(/\s*(\r\n?|\n\r?)\s*/g, "");
              if (sourceText) lastTag.children.push({
                type: TYPE_TEXT,
                len: sourceText.length,
                value: sourceText,
                range: {
                  start_: textStateEndPos,
                  end_: textEndPos
                }
              });
            }
            textStateEndPos = textEndPos;
            if (m[3]) {
              lastTag.children.push({
                type: TYPE_TEXT,
                refs: [ "l10n:" + m[3] ],
                value: "{l10n:" + m[3] + "}",
                range: {
                  start_: textEndPos,
                  end_: pos
                }
              });
            } else if (m[2] == "{") {
              bufferPos = pos - 1;
              lastTag.children.push(token = {
                type: TYPE_TEXT,
                range: {
                  start_: textEndPos,
                  end_: textEndPos
                }
              });
              state = REFERENCE;
            } else if (m[4]) {
              if (m[4] == "/") {
                token = null;
                state = CLOSE_TAG;
              } else {
                lastTag.children.push(token = {
                  type: TYPE_COMMENT,
                  range: {
                    start_: textEndPos,
                    end_: textEndPos
                  }
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
              lastTag.children.push(token = {
                type: TYPE_ELEMENT,
                attrs: [],
                children: [],
                range: {
                  start_: textEndPos,
                  end_: textEndPos
                }
              });
              lastTag = token;
              state = TAG_NAME;
              attrMap = {};
            }
            break;
          case CLOSE_TAG:
            if (m[1] !== (lastTag.prefix ? lastTag.prefix + ":" : "") + lastTag.name) {
              lastTag.children.push({
                type: TYPE_TEXT,
                value: "</" + m[0],
                range: {
                  start_: startPos - 2,
                  end_: startPos + m[0].length
                }
              });
              result.warns.push([ "Wrong close tag: " + source.substr(startPos - 2, m[0].length + 2), lastTag.children[lastTag.children.length - 1] ]);
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
              token.range.end_ = startPos + m[1].length;
              if (token.type == TYPE_ATTRIBUTE) {
                var fullName = (token.prefix ? token.prefix + ":" : "") + token.name;
                if (Object.prototype.hasOwnProperty.call(attrMap, fullName)) result.warns.push([ "Duplicate attribute: " + fullName, token ]);
                attrMap[fullName] = true;
                lastTag.attrs.push(token);
              }
            }
            if (m[2] == "{") {
              if (token.type == TYPE_ELEMENT) state = REFERENCE; else state = BREAK_TAG_PARSE;
              break;
            }
            if (m[3]) {
              parseTag = false;
              lastTag.range.end_ = pos;
              if (m[3] == "/>" || !lastTag.prefix && SINGLETON_TAG.test(lastTag.name)) {
                if (m[3] != "/>") result.warns.push([ "Tag <" + lastTag.name + "> doesn't closed explicit (use `/>` as tag ending)", lastTag ]);
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
              type: TYPE_ATTRIBUTE,
              range: {
                start_: pos,
                end_: pos
              }
            };
            state = ATTRIBUTE_NAME_OR_END;
            break;
          case COMMENT:
            token.value = source.substring(bufferPos, pos - 3);
            token.range.end_ = pos;
            state = TEXT;
            break;
          case REFERENCE:
            if (token.refs) token.refs.push(m[1]); else token.refs = [ m[1] ];
            if (m[2] != "|") {
              if (token.type == TYPE_TEXT) {
                pos -= m[2].length - 1;
                token.value = source.substring(bufferPos, pos);
                token.range.end_ = pos;
                state = TEXT;
              } else if (token.type == TYPE_COMMENT) {
                state = COMMENT;
              } else if (token.type == TYPE_ATTRIBUTE && source[pos] == "=") {
                pos++;
                state = ATTRIBUTE_VALUE;
              } else {
                token = {
                  type: TYPE_ATTRIBUTE,
                  range: {
                    start_: pos,
                    end_: pos
                  }
                };
                state = ATTRIBUTE_NAME_OR_END;
              }
            }
            break;
          case ATTRIBUTE_VALUE:
            token.value = m[1].replace(QUOTE_UNESCAPE, '"');
            token.range.end_ = pos;
            token.valueRange = {
              start_: startPos + 1,
              end_: startPos + 1 + m[1].length
            };
            token = {
              type: TYPE_ATTRIBUTE,
              range: {
                start_: pos,
                end_: pos
              }
            };
            state = ATTRIBUTE_NAME_OR_END;
            break;
          case TAG_IGNORE_CONTENT.text:
          case TAG_IGNORE_CONTENT.style:
            lastTag.children.push({
              type: TYPE_TEXT,
              value: m[1],
              range: {
                start_: startPos,
                end_: startPos + m[1].length
              }
            });
            lastTag = tagStack.pop();
            state = TEXT;
            break;
          default:
            throw SYNTAX_ERROR;
        }
        if (state == TEXT) textStateEndPos = pos;
      }
      if (textStateEndPos != pos) lastTag.children.push({
        type: TYPE_TEXT,
        value: source.substring(textStateEndPos, pos),
        range: {
          start_: textStateEndPos,
          end_: pos
        }
      });
      postProcessing(result, options || {}, source);
      if (lastTag.name) result.warns.push([ "No close tag for <" + (lastTag.prefix ? lastTag.prefix + ":" : "") + lastTag.name + ">", lastTag ]);
      if (!result.warns.length) delete result.warns;
      result.templateTokens = true;
      return result;
    }
    module.exports = tokenize;
  },
  "d.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var CSS_CLASSNAME_START = /^\-?([_a-z]|[^\x00-\xb1]|\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f])/i;
    var CSS_CLASSNAME_START_MAXLEN = 8;
    var CSS_NESTED_ATRULE = /^(media|supports|document)\b/i;
    var CSS_NESTED_ATRULE_MAXLEN = 8;
    var CSS_FNSELECTOR = /^(not|has|matches|nth-child|nth-last-child)\(/i;
    var CSS_FNSELECTOR_MAXLEN = 15;
    function genIsolateMarker() {
      return basis.genUID() + "__";
    }
    function isolateCss(css, prefix, info) {
      function jumpAfter(str, offset) {
        var index = css.indexOf(str, offset);
        i = index !== -1 ? index + str.length : sym.length;
      }
      function parseString() {
        var quote = sym[i];
        if (quote !== '"' && quote !== "'") return;
        for (i++; i < len && sym[i] !== quote; i++) if (sym[i] === "\\") i++;
        return true;
      }
      function parseBraces() {
        var bracket = sym[i];
        if (bracket === "(") {
          jumpAfter(")", i + 1);
          return true;
        }
        if (bracket === "[") {
          for (i++; i < len && sym[i] !== "]"; i++) parseString();
          return true;
        }
      }
      function parseComment() {
        if (sym[i] !== "/" || sym[i + 1] !== "*") return;
        jumpAfter("*/", i + 2);
        return true;
      }
      function parsePseudoContent() {
        for (; i < len && sym[i] != ")"; i++) if (parseComment() || parseBraces() || parsePseudo() || parseClassName()) continue;
      }
      function parsePseudo() {
        if (sym[i] !== ":") return;
        var m = css.substr(i + 1, CSS_FNSELECTOR_MAXLEN).match(CSS_FNSELECTOR);
        if (m) {
          i += m[0].length + 1;
          parsePseudoContent();
        }
        return true;
      }
      function parseAtRule() {
        if (sym[i] !== "@") return;
        var m = css.substr(i + 1, CSS_NESTED_ATRULE_MAXLEN).match(CSS_NESTED_ATRULE);
        if (m) {
          i += m[0].length;
          nestedStyleSheet = true;
        }
        return true;
      }
      function parseBlock() {
        if (sym[i] !== "{") return;
        if (nestedStyleSheet) {
          i++;
          parseStyleSheet(true);
          return;
        }
        for (i++; i < len && sym[i] !== "}"; i++) parseString() || parseBraces();
        return true;
      }
      function parseClassName() {
        if (sym[i] !== ".") return;
        var m = css.substr(i + 1, CSS_CLASSNAME_START_MAXLEN).match(CSS_CLASSNAME_START);
        if (m) {
          i++;
          map[i + result.length / 2 * prefix.length - 1] = i;
          result.push(css.substring(lastMatchPos, i), prefix);
          lastMatchPos = i;
        }
        return true;
      }
      function parseStyleSheet(nested) {
        for (nestedStyleSheet = false; i < len; i++) {
          if (parseComment() || parseAtRule() || parsePseudo() || parseBraces() || parseClassName()) continue;
          if (nested && sym[i] == "}") return;
          parseBlock();
        }
      }
      var map = {};
      var result = [];
      var sym = css.split("");
      var len = sym.length;
      var lastMatchPos = 0;
      var i = 0;
      var nestedStyleSheet;
      if (!prefix) prefix = genIsolateMarker();
      parseStyleSheet(false);
      result = result.join("") + css.substring(lastMatchPos);
      return info ? {
        css: result,
        map: map,
        prefix: prefix
      } : result;
    }
    module.exports = isolateCss;
  },
  "4.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var templates = {};
    function add(id, template, instances) {
      templates[id] = {
        template: template,
        instances: instances
      };
    }
    function remove(id) {
      delete templates[id];
    }
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
    function resolveActionById(refId) {
      var templateRef = resolveInstanceById(refId);
      return templateRef && {
        context: templateRef.context,
        action: templateRef.action
      };
    }
    function getDebugInfoById(refId) {
      var templateRef = resolveInstanceById(refId);
      return templateRef && templateRef.debug && templateRef.debug();
    }
    module.exports = {
      getDebugInfoById: getDebugInfoById,
      add: add,
      remove: remove,
      resolveActionById: resolveActionById,
      resolveTemplateById: resolveTemplateById,
      resolveObjectById: resolveObjectById,
      resolveTmplById: resolveTmplById
    };
  },
  "1.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var namespace = this.path;
    var document = global.document;
    var Class = basis.Class;
    var cleaner = basis.cleaner;
    var path = basis.path;
    var consts = basis.require("./2.js");
    var DECLARATION_VERSION = basis.require("./3.js").VERSION;
    var getDeclFromSource = basis.require("./3.js").getDeclFromSource;
    var makeDeclaration = basis.require("./3.js").makeDeclaration;
    var store = basis.require("./4.js");
    var theme = basis.require("./5.js");
    var getSourceByPath = theme.get;
    var templateList = [];
    var sourceByDocumentId = {};
    function resolveSourceByDocumentId(sourceId) {
      var resource = sourceByDocumentId[sourceId];
      if (!resource) {
        var host = document.getElementById(sourceId);
        var source = "";
        if (host && host.tagName == "SCRIPT" && host.type == "text/basis-template") source = host.textContent || host.text; else if (!host) basis.dev.warn("Template script element with id `" + sourceId + "` not found"); else basis.dev.warn('Template should be declared in <script type="text/basis-template"> element (id `' + sourceId + "`)");
        resource = sourceByDocumentId[sourceId] = basis.resource.virtual("tmpl", source || "");
        resource.id = sourceId;
        resource.url = '<script id="' + sourceId + '"/>';
      }
      return resource;
    }
    function resolveResource(ref, baseURI) {
      if (/^#\d+$/.test(ref)) return templateList[ref.substr(1)];
      if (/^id:/.test(ref)) return resolveSourceByDocumentId(ref.substr(3));
      if (/^[a-z0-9\.]+$/i.test(ref) && !/\.tmpl$/.test(ref)) return getSourceByPath(ref);
      return basis.resource(basis.resource.resolveURI(ref, baseURI, '<b:include src="{url}"/>'));
    }
    function templateSourceUpdate() {
      if (this.destroyBuilder) buildTemplate.call(this);
      var cursor = this;
      while (cursor = cursor.attaches_) cursor.handler.call(cursor.context);
    }
    function buildTemplate() {
      var declaration = getDeclFromSource(this.source, this.baseURI, false, {
        isolate: this.getIsolatePrefix()
      });
      var destroyBuilder = this.destroyBuilder;
      var instances = {};
      var funcs = this.builder(declaration.tokens, instances);
      this.createInstance = funcs.createInstance;
      this.clearInstance = funcs.destroyInstance;
      this.destroyBuilder = funcs.destroy;
      store.add(this.templateId, this, instances);
      this.instances_ = instances;
      this.decl_ = declaration;
      var newDeps = declaration.deps;
      var oldDeps = this.deps_;
      this.deps_ = newDeps;
      if (oldDeps) for (var i = 0, dep; dep = oldDeps[i]; i++) dep.bindingBridge.detach(dep, buildTemplate, this);
      if (newDeps) for (var i = 0, dep; dep = newDeps[i]; i++) dep.bindingBridge.attach(dep, buildTemplate, this);
      var newResources = declaration.resources;
      var oldResources = this.resources;
      this.resources = newResources;
      if (newResources) for (var i = 0, url; url = newResources[i]; i++) {
        var resource = basis.resource(url).fetch();
        if (typeof resource.startUse == "function") resource.startUse();
      }
      if (oldResources) for (var i = 0, url; url = oldResources[i]; i++) {
        var resource = basis.resource(url).fetch();
        if (typeof resource.stopUse == "function") resource.stopUse();
      }
      if (destroyBuilder) destroyBuilder(true);
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
      url: "",
      attaches_: null,
      init: function(source) {
        if (templateList.length == 4096) throw "Too many templates (maximum 4096)";
        this.setSource(source || "");
        this.templateId = templateList.push(this) - 1;
      },
      bindingBridge: {
        attach: function(template, handler, context) {
          var cursor = template;
          while (cursor = cursor.attaches_) if (cursor.handler === handler && cursor.context === context) basis.dev.warn("basis.template.Template#bindingBridge.attach: duplicate handler & context pair");
          template.attaches_ = {
            handler: handler,
            context: context,
            attaches_: template.attaches_
          };
        },
        detach: function(template, handler, context) {
          var cursor = template;
          var prev;
          while (prev = cursor, cursor = cursor.attaches_) if (cursor.handler === handler && cursor.context === context) {
            prev.attaches_ = cursor.attaches_;
            return;
          }
          basis.dev.warn("basis.template.Template#bindingBridge.detach: handler & context pair not found, nothing was removed");
        },
        get: function(template) {
          var source = template.source;
          return source && source.bindingBridge ? source.bindingBridge.get(source) : source;
        }
      },
      createInstance: function(object, actionCallback, updateCallback, bindings, bindingInterface) {
        buildTemplate.call(this);
        return this.createInstance(object, actionCallback, updateCallback, bindings, bindingInterface);
      },
      clearInstance: function() {},
      getIsolatePrefix: function() {
        return "i" + this.templateId + "__";
      },
      setSource: function(source) {
        var oldSource = this.source;
        if (oldSource != source) {
          if (typeof source == "string") {
            var m = source.match(/^([a-z]+):/);
            if (m) {
              source = source.substr(m[0].length);
              switch (m[1]) {
                case "id":
                  source = resolveSourceByDocumentId(source);
                  break;
                case "path":
                  source = getSourceByPath(source);
                  break;
                default:
                  basis.dev.warn(namespace + ".Template.setSource: Unknown prefix " + m[1] + " for template source was ingnored.");
              }
            }
          }
          if (oldSource && oldSource.bindingBridge) {
            this.url = "";
            this.baseURI = "";
            oldSource.bindingBridge.detach(oldSource, templateSourceUpdate, this);
          }
          if (source && source.bindingBridge) {
            if (source.url) {
              this.url = source.url;
              this.baseURI = path.dirname(source.url) + "/";
            }
            source.bindingBridge.attach(source, templateSourceUpdate, this);
          }
          this.source = source;
          templateSourceUpdate.call(this);
        }
      },
      destroy: function() {
        if (this.destroyBuilder) {
          store.remove(this.templateId);
          this.destroyBuilder();
        }
        this.attaches_ = null;
        this.createInstance = null;
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
      if (!rule) {
        rule = events;
        events = null;
      }
      if (typeof events == "string") events = events.split(/\s+/);
      return new TemplateSwitchConfig({
        rule: rule,
        events: events
      });
    }
    cleaner.add({
      destroy: function() {
        for (var i = 0, template; template = templateList[i]; i++) template.destroy();
        templateList = null;
      }
    });
    module.exports = {
      DECLARATION_VERSION: DECLARATION_VERSION,
      TYPE_ELEMENT: consts.TYPE_ELEMENT,
      TYPE_ATTRIBUTE: consts.TYPE_ATTRIBUTE,
      TYPE_ATTRIBUTE_CLASS: consts.TYPE_ATTRIBUTE_CLASS,
      TYPE_ATTRIBUTE_STYLE: consts.TYPE_ATTRIBUTE_STYLE,
      TYPE_ATTRIBUTE_EVENT: consts.TYPE_ATTRIBUTE_EVENT,
      TYPE_TEXT: consts.TYPE_TEXT,
      TYPE_COMMENT: consts.TYPE_COMMENT,
      TOKEN_TYPE: consts.TOKEN_TYPE,
      TOKEN_BINDINGS: consts.TOKEN_BINDINGS,
      TOKEN_REFS: consts.TOKEN_REFS,
      ATTR_NAME: consts.ATTR_NAME,
      ATTR_VALUE: consts.ATTR_VALUE,
      ATTR_NAME_BY_TYPE: consts.ATTR_NAME_BY_TYPE,
      CLASS_BINDING_ENUM: consts.CLASS_BINDING_ENUM,
      CLASS_BINDING_BOOL: consts.CLASS_BINDING_BOOL,
      ELEMENT_NAME: consts.ELEMENT_NAME,
      ELEMENT_ATTRS: consts.ELEMENT_ATTRIBUTES_AND_CHILDREN,
      ELEMENT_ATTRIBUTES_AND_CHILDREN: consts.ELEMENT_ATTRIBUTES_AND_CHILDREN,
      TEXT_VALUE: consts.TEXT_VALUE,
      COMMENT_VALUE: consts.COMMENT_VALUE,
      TemplateSwitchConfig: TemplateSwitchConfig,
      TemplateSwitcher: TemplateSwitcher,
      Template: Template,
      switcher: switcher,
      getDeclFromSource: getDeclFromSource,
      makeDeclaration: makeDeclaration,
      resolveResource: resolveResource,
      getDebugInfoById: store.getDebugInfoById,
      getTemplateCount: function() {
        return templateList.length;
      },
      resolveTemplateById: store.resolveTemplateById,
      resolveObjectById: store.resolveObjectById,
      resolveTmplById: store.resolveTmplById,
      SourceWrapper: theme.SourceWrapper,
      Theme: theme.Theme,
      theme: theme.theme,
      getThemeList: theme.getThemeList,
      currentTheme: theme.currentTheme,
      setTheme: theme.setTheme,
      onThemeChange: theme.onThemeChange,
      define: theme.define,
      get: theme.get,
      getPathList: theme.getPathList
    };
  },
  "6.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var namespace = this.path;
    var document = global.document;
    var Node = global.Node;
    var camelize = basis.string.camelize;
    var isMarkupToken = basis.require("./7.js").isMarkupToken;
    var getL10nToken = basis.require("./7.js").token;
    var getFunctions = basis.require("./9.js").getFunctions;
    var basisTemplate = basis.require("./1.js");
    var TemplateSwitchConfig = basisTemplate.TemplateSwitchConfig;
    var TemplateSwitcher = basisTemplate.TemplateSwitcher;
    var Template = basisTemplate.Template;
    var getSourceByPath = basisTemplate.get;
    var buildDOM = basis.require("./a.js");
    var CLONE_NORMALIZATION_TEXT_BUG = basis.require("./2.js").CLONE_NORMALIZATION_TEXT_BUG;
    var IS_SET_STYLE_SAFE = !!function() {
      try {
        return document.documentElement.style.color = "x";
      } catch (e) {}
    }();
    var l10nTemplate = {};
    var l10nTemplateSource = {};
    function getSourceFromL10nToken(token) {
      var dict = token.dictionary;
      var url = dict.resource ? dict.resource.url : "dictionary" + dict.basisObjectId;
      var name = token.getName();
      var id = name + "@" + url;
      var result = l10nTemplateSource[id];
      var sourceWrapper;
      if (!result) {
        var sourceToken = dict.token(name);
        result = l10nTemplateSource[id] = sourceToken.as(function(value) {
          if (sourceToken.getType() == "markup") {
            var parentType = sourceToken.getParentType();
            if (typeof value == "string" && (parentType == "plural" || parentType == "plural-markup")) value = value.replace(/\{#\}/g, "{__templateContext}");
            if (value != this.value) if (sourceWrapper) {
              sourceWrapper.detach(sourceToken, sourceToken.apply);
              sourceWrapper = null;
            }
            if (value && String(value).substr(0, 5) == "path:") {
              sourceWrapper = getSourceByPath(value.substr(5));
              sourceWrapper.attach(sourceToken, sourceToken.apply);
            }
            return sourceWrapper ? sourceWrapper.bindingBridge.get(sourceWrapper) : value;
          }
          return this.value;
        });
        result.id = "{l10n:" + id + "}";
        result.url = url + ":" + name;
      }
      return result;
    }
    function getL10nHtmlTemplate(token) {
      if (typeof token == "string") token = getL10nToken(token);
      if (!token) return null;
      var templateSource = getSourceFromL10nToken(token);
      var id = templateSource.id;
      var htmlTemplate = l10nTemplate[id];
      if (!htmlTemplate) htmlTemplate = l10nTemplate[id] = new HtmlTemplate(templateSource);
      return htmlTemplate;
    }
    var builder = function() {
      var WHITESPACE = /\s+/;
      var CLASSLIST_SUPPORTED = global.DOMTokenList && document && document.documentElement.classList instanceof global.DOMTokenList;
      var W3C_DOM_NODE_SUPPORTED = function() {
        try {
          return document instanceof Node;
        } catch (e) {}
      }() || false;
      function collapseDomFragment(fragment) {
        var startMarker = fragment.startMarker;
        var endMarker = fragment.endMarker;
        var cursor = startMarker.nextSibling;
        while (cursor && cursor !== endMarker) {
          var tmp = cursor;
          cursor = cursor.nextSibling;
          fragment.appendChild(tmp);
        }
        endMarker.parentNode.removeChild(endMarker);
        fragment.startMarker = null;
        fragment.endMarker = null;
        return startMarker;
      }
      var bind_node = W3C_DOM_NODE_SUPPORTED ? function(domRef, oldNode, newValue, domNodeBindingProhibited) {
        var newNode = !domNodeBindingProhibited && newValue && newValue instanceof Node ? newValue : domRef;
        if (newNode !== oldNode) {
          if (newNode.nodeType === 11 && !newNode.startMarker) {
            newNode.startMarker = document.createTextNode("");
            newNode.endMarker = document.createTextNode("");
            newNode.insertBefore(newNode.startMarker, newNode.firstChild);
            newNode.appendChild(newNode.endMarker);
          }
          if (oldNode.nodeType === 11 && oldNode.startMarker) oldNode = collapseDomFragment(oldNode);
          oldNode.parentNode.replaceChild(newNode, oldNode);
        }
        return newNode;
      } : function(domRef, oldNode, newValue, domNodeBindingProhibited) {
        var newNode = !domNodeBindingProhibited && newValue && typeof newValue == "object" ? newValue : domRef;
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
      var bind_element = function(domRef, oldNode, newValue, domNodeBindingProhibited) {
        var newNode = bind_node(domRef, oldNode, newValue, domNodeBindingProhibited);
        if (newNode === domRef && typeof newValue == "string") domRef.innerHTML = newValue;
        return newNode;
      };
      var bind_comment = bind_node;
      var bind_textNode = function(domRef, oldNode, newValue, domNodeBindingProhibited) {
        var newNode = bind_node(domRef, oldNode, newValue, domNodeBindingProhibited);
        if (newNode === domRef) domRef.nodeValue = String(newValue);
        return newNode;
      };
      var bind_attrClass = CLASSLIST_SUPPORTED ? function(domRef, oldClass, newValue, anim) {
        var newClass = newValue ? newValue : "";
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
      } : function(domRef, oldClass, newValue, anim) {
        var newClass = newValue ? newValue : "";
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
            var isMarkup = isMarkupToken(value);
            var template;
            if (isMarkup) template = getL10nHtmlTemplate(value);
            if (!oldAttach || oldAttach.value !== value || oldAttach.template !== template) {
              if (oldAttach) {
                if (oldAttach.tmpl) oldAttach.template.clearInstance(oldAttach.tmpl);
                oldAttach.value.bindingBridge.detach(oldAttach.value, updateAttach, oldAttach);
              }
              if (template) {
                var context = this.context;
                var bindings = this.bindings;
                var bindingInterface = this.bindingInterface;
                tmpl = template.createInstance(context, null, function onRebuild() {
                  tmpl = newAttach.tmpl = template.createInstance(context, null, onRebuild, bindings, bindingInterface);
                  tmpl.parent = tmpl.element.parentNode || tmpl.element;
                  updateAttach.call(newAttach);
                }, bindings, bindingInterface);
                tmpl.parent = tmpl.element.parentNode || tmpl.element;
              }
              if (!this.attaches) this.attaches = new Attaches;
              var newAttach = this.attaches[bindingName] = {
                name: bindingName,
                value: value,
                template: template,
                tmpl: tmpl,
                set: this.tmpl.set
              };
              bridge.attach(value, updateAttach, newAttach);
            } else tmpl = value && isMarkupToken(value) ? oldAttach.tmpl : null;
            if (tmpl) {
              tmpl.set("__templateContext", value.value);
              return tmpl.parent;
            }
            value = bridge.get(value);
          } else {
            if (oldAttach) {
              if (oldAttach.tmpl) oldAttach.template.clearInstance(oldAttach.tmpl);
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
        return function getBinding(instance, set) {
          var bindings = instance.bindings;
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
          if (set) result.sync.call(set, instance.context);
          if (!instance.bindingInterface) return;
          if (result.handler) instance.bindingInterface.attach(instance.context, result.handler, set);
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
        l10nToken: getL10nToken
      };
      return function(tokens, instances) {
        var fn = getFunctions(tokens, true, this.source.url, tokens.source_, !CLONE_NORMALIZATION_TEXT_BUG);
        var hasL10n = fn.createL10nSync;
        var initInstance;
        var l10nProtoSync;
        var l10nMap = {};
        var l10nLinks = [];
        var l10nMarkupTokens = [];
        var seed = 0;
        var proto = {
          cloneNode: function() {
            if (seed == 1) return buildDOM(tokens);
            proto = buildDOM(tokens);
            if (hasL10n) {
              l10nProtoSync = fn.createL10nSync(proto, l10nMap, bind_attr, CLONE_NORMALIZATION_TEXT_BUG);
              for (var i = 0, l10nToken; l10nToken = l10nLinks[i]; i++) l10nProtoSync(l10nToken.path, l10nMap[l10nToken.path]);
            }
            return proto.cloneNode(true);
          }
        };
        var createDOM = function() {
          return proto.cloneNode(true);
        };
        if (hasL10n) {
          var initL10n = function(set) {
            for (var i = 0, token; token = l10nLinks[i]; i++) set(token.path, l10nMap[token.path]);
          };
          var linkHandler = function(value) {
            var isMarkup = isMarkupToken(this.token);
            if (isMarkup) basis.array.add(l10nMarkupTokens, this); else basis.array.remove(l10nMarkupTokens, this);
            l10nMap[this.path] = isMarkup ? undefined : value == null ? "{" + this.path + "}" : value;
            if (l10nProtoSync) l10nProtoSync(this.path, l10nMap[this.path]);
            for (var key in instances) instances[key].tmpl.set(this.path, isMarkup ? this.token : value);
          };
          l10nLinks = fn.l10nKeys.map(function(key) {
            var token = getL10nToken(key);
            var link = {
              path: key,
              token: token,
              handler: linkHandler
            };
            token.attach(linkHandler, link);
            if (isMarkupToken(token)) l10nMarkupTokens.push(link); else l10nMap[key] = token.value == null ? "{" + key + "}" : token.value;
            return link;
          });
        }
        initInstance = fn.createInstanceFactory(this.templateId, createDOM, tools, l10nMap, l10nMarkupTokens, createBindingFunction(fn.keys), CLONE_NORMALIZATION_TEXT_BUG);
        return {
          createInstance: function(obj, onAction, onRebuild, bindings, bindingInterface) {
            var instanceId = seed++;
            var instance = {
              context: obj,
              action: onAction,
              rebuild: onRebuild,
              handler: null,
              bindings: bindings,
              bindingInterface: bindingInterface,
              attaches: null,
              compute: null,
              tmpl: null
            };
            initInstance(instanceId, instance, !instanceId ? initL10n : null);
            instances[instanceId] = instance;
            return instance.tmpl;
          },
          destroyInstance: function(tmpl) {
            var instanceId = tmpl.templateId_;
            var instance = instances[instanceId];
            if (instance) {
              if (instance.handler) instance.bindingInterface.detach(instance.context, instance.handler, instance.tmpl.set);
              if (instance.compute) {
                for (var i = 0; i < instance.compute.length; i++) instance.compute[i].destroy();
                instance.compute = null;
              }
              for (var key in instance.attaches) resolveValue.call(instance, key, null);
              delete instances[instanceId];
            }
          },
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
      Template: HtmlTemplate,
      TemplateSwitcher: HtmlTemplateSwitcher
    };
  },
  "7.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var namespace = this.path;
    var Class = basis.Class;
    var Emitter = basis.require("./8.js").Emitter;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    basis.resource.extensions[".l10n"] = function(content, url) {
      return resolveDictionary(url).update(basis.resource.extensions[".json"](content, url));
    };
    var tokenIndex = [];
    var tokenComputeFn = {};
    var basisTokenPrototypeSet = basis.Token.prototype.set;
    var tokenType = {
      "default": true,
      plural: true,
      markup: true,
      "plural-markup": true,
      "enum-markup": true
    };
    var nestedType = {
      "default": "default",
      plural: "default",
      markup: "default",
      "plural-markup": "markup",
      "enum-markup": "markup"
    };
    var isPluralType = {
      plural: true,
      "plural-markup": true
    };
    var ComputeToken = Class(basis.Token, {
      className: namespace + ".ComputeToken",
      dictionary: null,
      token: null,
      parent: "",
      init: function(value) {
        this.token.computeTokens[this.basisObjectId] = this;
        basis.Token.prototype.init.call(this, value);
      },
      get: function() {
        var value = this.dictionary.getValue(this.getName());
        if (isPluralType[this.token.getType()]) value = String(value).replace(/\{#\}/g, this.value);
        return value;
      },
      getName: function() {
        var key = this.value;
        if (isPluralType[this.token.getType()]) key = cultures[currentCulture].plural(key);
        return this.parent + "." + key;
      },
      getType: function() {
        var type = this.token.getType();
        return this.dictionary.types[this.getName()] || nestedType[type] || "default";
      },
      getParentType: function() {
        return this.token.getType();
      },
      toString: function() {
        return this.get();
      },
      destroy: function() {
        delete this.token.computeTokens[this.basisObjectId];
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
      computeTokenClass: null,
      init: function(dictionary, tokenName, value) {
        basis.Token.prototype.init.call(this, value);
        this.index = tokenIndex.push(this) - 1;
        this.name = tokenName;
        this.parent = tokenName.replace(/(^|\.)[^.]+$/, "");
        this.dictionary = dictionary;
        this.computeTokens = {};
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
      getName: function() {
        return this.name;
      },
      getType: function() {
        return this.dictionary.types[this.name] || nestedType[this.dictionary.types[this.parent]] || "default";
      },
      getParentType: function() {
        return this.parent ? this.dictionary.token(this.parent).getType() : "default";
      },
      setType: function() {
        basis.dev.warn("basis.l10n: Token#setType() is deprecated");
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
          basisTokenPrototypeSet.call(this, getter(object));
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
            computeToken = objectTokenMap[objectId] = token.computeToken(getter(object));
            object.addHandler(handler, computeToken);
          }
          return computeToken;
        };
      },
      computeToken: function(value) {
        var ComputeTokenClass = this.computeTokenClass;
        if (!ComputeTokenClass) ComputeTokenClass = this.computeTokenClass = ComputeToken.subclass({
          dictionary: this.dictionary,
          token: this,
          parent: this.name
        });
        return new ComputeTokenClass(value);
      },
      token: function(name) {
        if (isPluralType[this.getType()]) return this.computeToken(name, this);
        if (this.dictionary) return this.dictionary.token(this.name + "." + name);
      },
      destroy: function() {
        for (var key in this.computeTokens) this.computeTokens[key].destroy();
        this.computeTokenClass = null;
        this.computeTokens = null;
        this.value = null;
        this.dictionary = null;
        tokenIndex[this.index] = null;
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
    function isToken(value) {
      return value ? value instanceof Token || value instanceof ComputeToken : false;
    }
    function isPluralToken(value) {
      return isToken(value) && isPluralType[value.getType()];
    }
    function isMarkupToken(value) {
      return isToken(value) && value.getType() == "markup";
    }
    var dictionaries = [];
    var dictionaryByUrl = {};
    var createDictionaryNotifier = new basis.Token;
    function walkTokens(dictionary, culture, tokens, path) {
      var cultureValues = dictionary.cultureValues[culture];
      path = path ? path + "." : "";
      for (var name in tokens) {
        if (name.indexOf(".") != -1) {
          basis.dev.warn((dictionary.resource ? dictionary.resource.url : "[anonymous dictionary]") + ": wrong token name `" + name + "`, token ignored.");
          continue;
        }
        if (hasOwnProperty.call(tokens, name)) {
          var tokenName = path + name;
          var tokenValue = tokens[name];
          cultureValues[tokenName] = tokenValue;
          if (tokenValue && (typeof tokenValue == "object" || Array.isArray(tokenValue))) walkTokens(dictionary, culture, tokenValue, tokenName);
        }
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
        var newTypes = data._meta && data._meta.type || {};
        var currentTypes = {};
        for (var path in this.tokens) currentTypes[path] = this.tokens[path].getType();
        this.types = {};
        for (var path in newTypes) this.types[path] = tokenType[newTypes[path]] == true ? newTypes[path] : "default";
        for (var path in this.tokens) {
          var token = this.tokens[path];
          if (token.getType() != currentTypes[path]) this.tokens[path].apply();
        }
        this.syncValues();
        return this;
      },
      syncValues: function() {
        for (var tokenName in this.tokens) basisTokenPrototypeSet.call(this.tokens[tokenName], this.getValue(tokenName));
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
          token = this.tokens[tokenName] = new Token(this, tokenName, this.getValue(tokenName));
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
        if (extname != ".l10n") location = location.replace(new RegExp(extname + "([#?]|$)"), ".l10n$1");
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
    var pluralForms = [ [ 1, function() {
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
      isToken: isToken,
      isPluralToken: isPluralToken,
      isMarkupToken: isMarkupToken,
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
    (function() {
      var value = false;
      try {
        Object.defineProperty(module.exports, "enableMarkup", {
          get: function() {
            return value;
          },
          set: function(newValue) {
            basis.dev.warn("basis.l10n: enableMarkup option is deprecated, just remove it from your source code as markup l10n tokens enabled by default now");
            value = newValue;
          }
        });
      } catch (e) {}
    })();
  },
  "8.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var namespace = this.path;
    var Class = basis.Class;
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
        eventFunction = (new Function('return {"' + namespace + ".events." + eventName + '":\n\n      ' + "function(" + basis.array(arguments, 1).join(", ") + "){" + eventFunction.toString().replace(/\beventName\b/g, '"' + eventName + '"').replace(/^function[^(]*\(\)[^{]*\{|\}$/g, "") + "}" + '\n\n}["' + namespace + ".events." + eventName + '"];'))();
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
  "9.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var consts = basis.require("./2.js");
    var MARKER = consts.MARKER;
    var TYPE_ELEMENT = consts.TYPE_ELEMENT;
    var TYPE_ATTRIBUTE = consts.TYPE_ATTRIBUTE;
    var TYPE_ATTRIBUTE_CLASS = consts.TYPE_ATTRIBUTE_CLASS;
    var TYPE_ATTRIBUTE_STYLE = consts.TYPE_ATTRIBUTE_STYLE;
    var TYPE_ATTRIBUTE_EVENT = consts.TYPE_ATTRIBUTE_EVENT;
    var TYPE_TEXT = consts.TYPE_TEXT;
    var TYPE_COMMENT = consts.TYPE_COMMENT;
    var TOKEN_TYPE = consts.TOKEN_TYPE;
    var TOKEN_BINDINGS = consts.TOKEN_BINDINGS;
    var TOKEN_REFS = consts.TOKEN_REFS;
    var ATTR_NAME = consts.ATTR_NAME;
    var ATTR_NAME_BY_TYPE = consts.ATTR_NAME_BY_TYPE;
    var ELEMENT_NAME = consts.ELEMENT_NAME;
    var ELEMENT_ATTRIBUTES_AND_CHILDREN = consts.ELEMENT_ATTRIBUTES_AND_CHILDREN;
    var CLASS_BINDING_ENUM = consts.CLASS_BINDING_ENUM;
    var CLASS_BINDING_BOOL = consts.CLASS_BINDING_BOOL;
    var inlineSeed = 1;
    var tmplFunctions = {};
    var SET_NONELEMENT_PROPERTY_SUPPORT = function() {
      try {
        global.document.createTextNode("").x = 1;
        return true;
      } catch (e) {
        return false;
      }
    }();
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
      function processTokens(tokens, path, noTextBug) {
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
            putBinding([ token[TOKEN_TYPE], localPath, token[TOKEN_BINDINGS], refs ? refs.indexOf("element") != -1 : false ]);
          }
          if (path == rootPath && (SET_NONELEMENT_PROPERTY_SUPPORT || token[TOKEN_TYPE] == TYPE_ELEMENT)) markedElementList.push(localPath + "." + MARKER);
          if (token[TOKEN_TYPE] == TYPE_ELEMENT) {
            myRef = -1;
            if (!explicitRef) {
              localPath = putPath(localPath);
              myRef = pathList.length;
            }
            var attrs = [];
            var children = [];
            for (var j = ELEMENT_ATTRIBUTES_AND_CHILDREN, t; t = token[j]; j++) if (t[TOKEN_TYPE] == TYPE_ELEMENT || t[TOKEN_TYPE] == TYPE_TEXT || t[TOKEN_TYPE] == TYPE_COMMENT) children.push(t); else attrs.push(t);
            for (var j = 0, attr; attr = attrs[j]; j++) {
              var attrTokenType = attr[TOKEN_TYPE];
              if (attrTokenType == TYPE_ATTRIBUTE_EVENT) continue;
              var attrName = ATTR_NAME_BY_TYPE[attrTokenType] || attr[ATTR_NAME];
              if (refs = attr[TOKEN_REFS]) {
                explicitRef = true;
                putRefs(refs, putPath(localPath + '.getAttributeNode("' + attrName + '")'));
              }
              if (bindings = attr[TOKEN_BINDINGS]) {
                explicitRef = true;
                switch (attrTokenType) {
                  case TYPE_ATTRIBUTE_CLASS:
                    for (var k = 0, binding; binding = bindings[k]; k++) putBinding([ 2, localPath, binding[1], attrName, binding[0] ].concat(binding[2] == -1 ? [] : binding.slice(2)));
                    break;
                  case TYPE_ATTRIBUTE_STYLE:
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
      return function(tokens, path, noTextBug) {
        pathList = [];
        refList = [];
        bindingList = [];
        markedElementList = [];
        rootPath = path || "_";
        attrExprId = 0;
        processTokens(tokens, rootPath, noTextBug);
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
      var STYLE_EXPR_VALUE = {
        show: '"none"',
        visible: '"hidden"'
      };
      var STYLE_EXPR_TOGGLE = {
        hide: '?"none":""',
        show: '?"":"none"',
        hidden: '?"hidden":""',
        visible: '?"":"hidden"'
      };
      var bindFunctions = {
        1: "bind_element",
        3: "bind_textNode",
        8: "bind_comment"
      };
      function quoteString(value) {
        return '"' + value.replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
      }
      function simpleStringify(val) {
        return typeof val == "string" ? quoteString(val) : val;
      }
      function buildAttrExpression(binding, special, l10n) {
        var expression = [];
        var symbols = binding[5];
        var dictionary = binding[4];
        var exprVar;
        var colonPos;
        for (var j = 0; j < symbols.length; j++) {
          if (typeof symbols[j] == "string") expression.push(quoteString(symbols[j])); else {
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
              if (bindingName) expression.push(l10n[exprVar.substr(colonPos + 1)]); else expression.push('l10n["' + l10nPath + '"]');
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
        var bindVarSeed = 0;
        var varList = [];
        var result = [];
        var bindingsWoL10nCompute = [];
        var varName;
        var l10nMap;
        var l10nCompute = [];
        var l10nBindings = {};
        var l10nBindSeed = 0;
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
          var nodeBindingProhibited = binding[3];
          var namePart = bindName.split(":");
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
                l10nCompute.push(varName);
                varList.push(varName + '=tools.l10nToken("' + l10nName + '").computeToken()');
                bindCode = bindMap[l10nBinding];
                if (!bindCode) {
                  bindCode = bindMap[l10nBinding] = [];
                  varList.push("__" + l10nBinding);
                }
                bindCode.push(varName + ".set(__" + l10nBinding + ");");
              }
              bindName = l10nBindings[l10nFullPath];
              bindVar = "_" + bindVarSeed++;
              varName = "__" + bindName;
              bindCode = bindMap[bindName];
              if (!bindCode) {
                bindCode = bindMap[bindName] = [];
                varList.push(varName);
              }
              if (bindType == TYPE_TEXT) {
                debugList.push("{" + [ 'binding:"' + bindName + '"', "dom:" + domRef, "val:" + bindVar, "l10n:true", "attachment:" + bindName ] + "}");
                varList.push(bindVar + "=" + domRef);
                putBindCode(bindFunctions[bindType], domRef, bindVar, "value", nodeBindingProhibited);
              } else {
                attrName = '"' + binding[ATTR_NAME] + '"';
                debugList.push("{" + [ 'binding:"' + l10nFullPath + '"', "dom:" + domRef, "attr:" + attrName, "val:" + bindVar, "l10n:true", "attachment:" + bindName ] + "}");
                varList.push(bindVar);
                putBindCode("bind_attr", domRef, attrName, bindVar, buildAttrExpression(binding, false, l10nBindings));
              }
              continue;
            }
          }
          bindingsWoL10nCompute.push(binding);
        }
        for (var i = 0, binding; binding = bindingsWoL10nCompute[i]; i++) {
          var bindType = binding[0];
          var domRef = binding[1];
          var bindName = binding[2];
          var nodeBindingProhibited = binding[3];
          if ([ "get", "set", "templateId_" ].indexOf(bindName) != -1) {
            basis.dev.warn("binding name `" + bindName + "` is prohibited, binding ignored");
            continue;
          }
          var namePart = bindName.split(":");
          var anim = namePart[0] == "anim";
          var l10n = namePart[0] == "l10n";
          if (anim) bindName = namePart[1];
          bindCode = hasOwnProperty.call(bindMap, bindName) ? bindMap[bindName] : null;
          bindVar = "_" + bindVarSeed++;
          varName = "__" + bindName;
          if (l10n && namePart[1]) {
            var l10nFullPath = namePart[1];
            var l10nBinding = null;
            var l10nName = l10nFullPath;
            if (!l10nMap) l10nMap = {};
            if (!bindMap[l10nName]) {
              bindMap[l10nName] = [];
              bindMap[l10nName].l10n = "$l10n_" + l10nBindSeed++;
              varList.push("__" + bindMap[l10nName].l10n + '=l10n["' + l10nName + '"]');
              l10nMap[l10nName] = [];
            }
            bindCode = bindMap[l10nName];
            if (bindType == TYPE_TEXT) {
              debugList.push("{" + [ 'binding:"' + l10nFullPath + '"', "dom:" + domRef, 'val:l10n["' + l10nName + '"]', "l10n:true", 'attachment:l10nToken("' + l10nName + '")' ] + "}");
              toolsUsed.l10nToken = true;
              l10nMap[l10nName].push(domRef + ".nodeValue=value;");
              if (!bindCode.nodeBind) {
                varList.push(bindVar + "=" + domRef);
                putBindCode(bindFunctions[bindType], domRef, bindVar, "value", nodeBindingProhibited);
                bindCode.nodeBind = bindVar;
              } else {
                bindCode.push(domRef + ".nodeValue=value;");
              }
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
              putBindCode(bindFunctions[bindType], domRef, bindVar, "value", nodeBindingProhibited);
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
                var bindingType = binding[5];
                var defaultValue = binding[7];
                switch (bindingType) {
                  case CLASS_BINDING_BOOL:
                    var values = [ binding[6] ];
                    var prefix = binding[4];
                    var classes = Array.isArray(prefix) ? prefix : values.map(function(val) {
                      return prefix + val;
                    });
                    valueExpr = 'value?"' + classes[0] + '":""';
                    if (defaultValue) defaultExpr = classes[defaultValue - 1];
                    break;
                  case CLASS_BINDING_ENUM:
                    var values = binding[8];
                    var prefix = binding[4];
                    var classes = Array.isArray(prefix) ? prefix : values.map(function(val) {
                      return prefix + val;
                    });
                    valueExpr = values.map(function(val, idx) {
                      return 'value=="' + val + '"?"' + classes[idx] + '"';
                    }).join(":") + ':""';
                    if (defaultValue) defaultExpr = classes[defaultValue - 1];
                    break;
                  default:
                    var prefix = binding[4];
                    valueExpr = 'typeof value=="string"||typeof value=="number"?"' + prefix + '"+value:(value?"' + prefix + bindName + '":"")';
                }
                varList.push(bindVar + '="' + defaultExpr + '"');
                putBindCode("bind_attrClass", domRef, bindVar, valueExpr, anim);
                debugList.push("{" + [ 'binding:"' + bindName + '"', "raw:__" + bindName, 'prefix:"' + "???" + '"', "anim:" + anim, "dom:" + domRef, 'attr:"' + attrName + '"', "val:" + bindVar, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
                break;
              case "style":
                var expr = buildAttrExpression(binding, false, l10nBindings);
                attrExprId = binding[8];
                if (!attrExprMap[attrExprId]) {
                  attrExprMap[attrExprId] = bindVar;
                  varList.push(bindVar + "=" + (STYLE_EXPR_VALUE[binding[7]] || '""'));
                }
                if (binding[7]) expr = expr.replace(/\+""$/, "") + (STYLE_EXPR_TOGGLE[binding[7]] || "");
                bindVar = attrExprMap[attrExprId];
                putBindCode("bind_attrStyle", domRef, '"' + binding[6] + '"', bindVar, expr);
                debugList.push("{" + [ 'binding:"' + bindName + '"', "raw:__" + bindName, 'property:"' + binding[6] + '"', "expr:[[" + binding[5].map(simpleStringify) + "],[" + binding[4].map(simpleStringify) + "]]", "dom:" + domRef, 'attr:"' + attrName + '"', "val:" + bindVar, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
                break;
              default:
                var specialAttr = SPECIAL_ATTR_MAP[attrName];
                var tagName = binding[6].toLowerCase();
                var expr = specialAttr && SPECIAL_ATTR_SINGLE[attrName] ? buildAttrExpression(binding, "bool", l10nBindings) + '?"' + attrName + '":""' : buildAttrExpression(binding, false, l10nBindings);
                attrExprId = binding[7];
                if (!attrExprMap[attrExprId]) {
                  varList.push(bindVar + "=" + expr);
                  attrExprMap[attrExprId] = bindVar;
                }
                bindVar = attrExprMap[attrExprId];
                if (attrName == "tabindex") putBindCode("bind_attr", domRef, '"' + attrName + '"', bindVar, expr + "==-1?" + ([ "input", "button", "textarea" ].indexOf(tagName) == -1 ? '""' : "-1") + ":" + expr); else putBindCode("bind_attr", domRef, '"' + attrName + '"', bindVar, expr);
                if (specialAttr && (specialAttr == "*" || specialAttr.indexOf(tagName) != -1)) bindCode.push("if(" + domRef + "." + attrName + "!=" + bindVar + ")" + domRef + "." + attrName + "=" + (SPECIAL_ATTR_SINGLE[attrName] ? "!!" + bindVar : bindVar) + ";");
                debugList.push("{" + [ 'binding:"' + bindName + '"', "raw:" + (l10n ? 'l10n["' + bindName + '"]' : "__" + bindName), 'type:"' + (specialAttr && SPECIAL_ATTR_SINGLE[attrName] ? "bool" : "string") + '"', "expr:[[" + binding[5].map(simpleStringify) + "],[" + binding[4].map(simpleStringify) + "]]", "dom:" + domRef, 'attr:"' + attrName + '"', "val:" + bindVar, 'attachment:instance.attaches&&instance.attaches["' + bindName + '"]&&instance.attaches["' + bindName + '"].value' ] + "}");
            }
          }
        }
        result.push(";function set(bindName,value){" + 'if(typeof bindName!="string")');
        for (var bindName in bindMap) if (bindMap[bindName].nodeBind) {
          result.push("if(bindName===" + bindMap[bindName].nodeBind + ")" + 'bindName="' + bindName + '";' + "else ");
        }
        result.push("return;");
        result.push("value=resolve.call(instance,bindName,value,Attaches);" + "switch(bindName){");
        for (var bindName in bindMap) {
          var stateVar = bindMap[bindName].l10n || bindName;
          varList.push("$$" + stateVar + "=0");
          result.push('case"' + bindName + '":' + "if(__" + stateVar + "!==value)" + "{" + "$$" + stateVar + "++;" + "__" + stateVar + "=value;" + bindMap[bindName].join("") + "}" + "break;");
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
    var getFunctions = function(tokens, debug, uri, source, noTextBug) {
      var fn = tmplFunctions[uri && basis.path.relative(uri)];
      if (fn) return fn;
      var paths = buildPathes(tokens, "_", noTextBug);
      var bindings = buildBindings(paths.binding);
      var objectRefs = paths.markedElementList.join("=");
      var result = {
        keys: bindings.keys,
        l10nKeys: basis.object.keys(bindings.l10n)
      };
      if (tokens.length == 1) paths.path[0] = "a=_";
      if (!uri) uri = basis.path.baseURI + "inline_template" + inlineSeed++ + ".tmpl";
      if (bindings.l10n) {
        var code = [];
        for (var key in bindings.l10n) code.push('case"' + key + '":' + bindings.l10n[key].join("") + "break;");
        result.createL10nSync = compileFunction([ "_", "l10n", "bind_attr", "TEXT_BUG" ], (source ? "\n// " + source.split(/\r\n?|\n\r?/).join("\n// ") + "\n\n" : "") + "var " + paths.path + ";" + "return function(path, value){" + "switch(path){" + code.join("") + "}" + "}" + "\n\n//# sourceURL=" + basis.path.origin + uri + "_l10n");
      }
      result.createInstanceFactory = compileFunction([ "tid", "createDOM", "tools", "l10nMap", "l10nMarkup", "getBindings", "TEXT_BUG" ], (source ? "\n// " + source.split(/\r\n?|\n\r?/).join("\n// ") + "\n\n" : "") + "var " + (bindings.tools.length ? bindings.tools + "," : "") + "Attaches=function(){};" + "Attaches.prototype={" + bindings.keys.map(function(key) {
        return key + ":null";
      }) + "};" + "return function createTmpl_(id,instance,initL10n){" + "var _=createDOM()," + (bindings.l10n ? "l10n=initL10n?{}:l10nMap," : "") + paths.path.concat(bindings.vars) + (debug ? ";instance.debug=function debug(){" + "return {" + "bindings:[" + bindings.debugList + "]," + "values:{" + bindings.keys.map(function(key) {
        return '"' + key + '":__' + key;
      }) + "}," + "compute:Array.prototype.slice.call(instance.compute || [])" + "}" + "}" : "") + (bindings.l10nCompute.length ? ";instance.compute=[" + bindings.l10nCompute + "]" : "") + ";instance.tmpl={" + [ paths.ref, "templateId_:id", "set:set" ] + "}" + (objectRefs ? ";if(instance.context||instance.onAction)" + objectRefs + "=(id<<12)|tid" : "") + bindings.set + (bindings.l10n ? ";if(initL10n){l10n=l10nMap;initL10n(set)}" + ";if(l10nMarkup.length)for(var idx=0,token;token=l10nMarkup[idx];idx++)set(token.path,token.token);" : "") + ";if(instance.bindings)instance.handler=getBindings(instance,set)" + ";" + bindings.l10nCompute.map(function(varName) {
        return 'set("' + varName + '",' + varName + ")";
      }) + "}" + "\n\n//# sourceURL=" + basis.path.origin + uri);
      return result;
    };
    module.exports = {
      getFunctions: getFunctions
    };
  },
  "a.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var Node = global.Node;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var eventUtils = basis.require("./b.js");
    var resolveActionById = basis.require("./4.js").resolveActionById;
    var consts = basis.require("./2.js");
    var MARKER = consts.MARKER;
    var CLONE_NORMALIZATION_TEXT_BUG = consts.CLONE_NORMALIZATION_TEXT_BUG;
    var TYPE_ELEMENT = consts.TYPE_ELEMENT;
    var TYPE_ATTRIBUTE = consts.TYPE_ATTRIBUTE;
    var TYPE_ATTRIBUTE_CLASS = consts.TYPE_ATTRIBUTE_CLASS;
    var TYPE_ATTRIBUTE_STYLE = consts.TYPE_ATTRIBUTE_STYLE;
    var TYPE_ATTRIBUTE_EVENT = consts.TYPE_ATTRIBUTE_EVENT;
    var TYPE_TEXT = consts.TYPE_TEXT;
    var TYPE_COMMENT = consts.TYPE_COMMENT;
    var TOKEN_TYPE = consts.TOKEN_TYPE;
    var TOKEN_BINDINGS = consts.TOKEN_BINDINGS;
    var TOKEN_REFS = consts.TOKEN_REFS;
    var ATTR_NAME = consts.ATTR_NAME;
    var ATTR_VALUE = consts.ATTR_VALUE;
    var ATTR_VALUE_INDEX = consts.ATTR_VALUE_INDEX;
    var ELEMENT_NAME = consts.ELEMENT_NAME;
    var ELEMENT_ATTRIBUTES_AND_CHILDREN = consts.ELEMENT_ATTRIBUTES_AND_CHILDREN;
    var TEXT_VALUE = consts.TEXT_VALUE;
    var COMMENT_VALUE = consts.COMMENT_VALUE;
    var CLASS_BINDING_ENUM = consts.CLASS_BINDING_ENUM;
    var CLASS_BINDING_BOOL = consts.CLASS_BINDING_BOOL;
    var MOUSE_ENTER_LEAVE_SUPPORT = "onmouseenter" in document.documentElement;
    var USE_CAPTURE_FALLBACK = false;
    var tmplEventListeners = {};
    var afterEventAction = {};
    var insideElementEvent = {};
    var contains;
    if (Node && !Node.prototype.contains) contains = function(parent, child) {
      return parent.compareDocumentPosition(child) & 16;
    }; else contains = function(parent, child) {
      return parent.contains(child);
    };
    if (!document.addEventListener) USE_CAPTURE_FALLBACK = basis.publicCallback(function(eventName, event) {
      eventUtils.fireEvent(document, eventName);
      event.returnValue = true;
      var listener = tmplEventListeners[eventName];
      if (listener) listener(new eventUtils.Event(event));
    }, true);
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
            if (relTarget && (cursor === relTarget || contains(cursor, relTarget))) cursor = null;
          }
          while (cursor) {
            refId = cursor[MARKER];
            if (typeof refId == "number") {
              if (tmplRef = resolveActionById(refId)) break;
            }
            cursor = cursor.parentNode;
          }
          var actions = attr.trim().split(/\s+/);
          var actionCallback = tmplRef && tmplRef.action;
          for (var i = 0, actionName; actionName = actions[i++]; ) switch (actionName) {
            case "prevent-default":
              event.preventDefault();
              break;
            case "stop-propagation":
              event.stopPropagation();
              break;
            case "log-event":
              basis.dev.log("Template event:", event);
              break;
            default:
              if (actionCallback) {
                event.actionTarget = actionTarget;
                actionCallback.call(tmplRef.context, actionName, event);
              }
          }
        }
        if (event.type in afterEventAction) afterEventAction[event.type](event, attrCursor);
      };
    }
    function emulateEvent(origEventName, emulEventName) {
      regEventHandler(emulEventName);
      insideElementEvent[origEventName] = true;
      afterEventAction[emulEventName] = function(event) {
        event = new eventUtils.Event(event);
        event.type = origEventName;
        tmplEventListeners[origEventName](event);
      };
      afterEventAction[origEventName] = function(event, cursor) {
        if (!cursor || !cursor.parentNode) return;
        event = new eventUtils.Event(event);
        event.type = origEventName;
        event.sender = cursor.parentNode;
        tmplEventListeners[origEventName](event);
      };
    }
    function regEventHandler(eventName) {
      if (hasOwnProperty.call(tmplEventListeners, eventName)) return;
      tmplEventListeners[eventName] = createEventHandler("event-" + eventName);
      if (USE_CAPTURE_FALLBACK) return;
      if (!MOUSE_ENTER_LEAVE_SUPPORT) {
        if (eventName == "mouseenter") return emulateEvent(eventName, "mouseover");
        if (eventName == "mouseleave") return emulateEvent(eventName, "mouseout");
      }
      for (var i = 0, names = eventUtils.browserEvents(eventName), browserEventName; browserEventName = names[i]; i++) eventUtils.addGlobalHandler(browserEventName, tmplEventListeners[eventName]);
    }
    var namespaceURI = {
      svg: "http://www.w3.org/2000/svg"
    };
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
    function setEventAttribute(node, eventName, actions) {
      regEventHandler(eventName);
      if (USE_CAPTURE_FALLBACK) node.setAttribute("on" + eventName, USE_CAPTURE_FALLBACK + '("' + eventName + '",event)');
      node.setAttribute("event-" + eventName, actions);
    }
    function setAttribute(node, name, value) {
      if (SET_CLASS_ATTRIBUTE_BUG && name == "class") name = "className";
      if (SET_STYLE_ATTRIBUTE_BUG && name == "style") return node.style.cssText = value;
      node.setAttribute(name, value);
    }
    var buildDOM = function(tokens, parent) {
      var result = parent || document.createDocumentFragment();
      var offset = parent ? ELEMENT_ATTRIBUTES_AND_CHILDREN : 0;
      for (var i = offset, token; token = tokens[i]; i++) {
        var tokenType = token[TOKEN_TYPE];
        switch (tokenType) {
          case TYPE_ELEMENT:
            var tagName = token[ELEMENT_NAME];
            var colonIndex = tagName.indexOf(":");
            var element = colonIndex != -1 ? document.createElementNS(namespaceURI[tagName.substr(0, colonIndex)], tagName) : document.createElement(tagName);
            buildDOM(token, element);
            result.appendChild(element);
            break;
          case TYPE_ATTRIBUTE:
            if (!token[TOKEN_BINDINGS]) setAttribute(result, token[ATTR_NAME], token[ATTR_VALUE] || "");
            break;
          case TYPE_ATTRIBUTE_CLASS:
            var attrValue = token[ATTR_VALUE_INDEX[tokenType]];
            attrValue = attrValue ? [ attrValue ] : [];
            if (token[TOKEN_BINDINGS]) for (var j = 0, binding; binding = token[TOKEN_BINDINGS][j]; j++) {
              var defaultValue = binding[4];
              if (defaultValue) {
                var prefix = binding[0];
                if (Array.isArray(prefix)) {
                  attrValue.push(prefix[defaultValue - 1]);
                } else {
                  switch (binding[2]) {
                    case CLASS_BINDING_BOOL:
                      attrValue.push(prefix + binding[3]);
                      break;
                    case CLASS_BINDING_ENUM:
                      attrValue.push(prefix + binding[5][defaultValue - 1]);
                      break;
                  }
                }
              }
            }
            if (attrValue.length) setAttribute(result, "class", attrValue.join(" "));
            break;
          case TYPE_ATTRIBUTE_STYLE:
            var attrValue = token[ATTR_VALUE_INDEX[tokenType]];
            if (attrValue) setAttribute(result, "style", attrValue);
            break;
          case TYPE_ATTRIBUTE_EVENT:
            setEventAttribute(result, token[1], token[2] || token[1]);
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
    module.exports = buildDOM;
  },
  "b.js": function(exports, module, basis, global, __filename, __dirname, require, resource, asset) {
    var namespace = this.path;
    var document = global.document;
    var $null = basis.fn.$null;
    var arrayFrom = basis.array.from;
    var globalEvents = {};
    var EVENT_HOLDER = "basisEvents_" + basis.genUID();
    var W3CSUPPORT = !!document.addEventListener;
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
      mousewheel: [ "wheel", "mousewheel", "DOMMouseScroll" ]
    };
    function browserEvents(eventName) {
      return BROWSER_EVENTS[eventName] || [ eventName ];
    }
    var Event = basis.Class(null, {
      className: namespace + ".Event",
      KEY: KEY,
      init: function(event) {
        event = wrap(event);
        for (var name in event) if (name != "returnValue" && name != "keyLocation" && name != "layerX" && name != "layerY" && (event.type != "progress" || name != "totalSize" && name != "position")) if (typeof event[name] != "function" && name in this == false) this[name] = event[name];
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
      if ("deltaY" in event) delta = -event.deltaY; else if ("wheelDelta" in event) delta = event.wheelDelta; else if (event.type == "DOMMouseScroll") delta = -event.detail;
      return delta && delta / Math.abs(delta);
    }
    var globalHandlers = {};
    var captureHandlers = {};
    var noCaptureScheme = !W3CSUPPORT;
    var flushAsap = true;
    var lastFrameStartEvent;
    var lastFrameFinishEvent;
    function startFrame(event) {
      if (flushAsap && event !== lastFrameStartEvent) {
        lastFrameStartEvent = event;
        basis.codeFrame.start();
      }
    }
    function finishFrame(event) {
      if (flushAsap && event !== lastFrameFinishEvent) {
        lastFrameFinishEvent = event;
        basis.codeFrame.finish();
      }
    }
    function observeGlobalEvents(event) {
      var handlers = arrayFrom(globalHandlers[event.type]);
      var captureHandler = captureHandlers[event.type];
      var wrappedEvent = new Event(event);
      startFrame(event);
      if (captureHandler) {
        captureHandler.handler.call(captureHandler.thisObject, wrappedEvent);
      } else {
        if (handlers) {
          for (var i = handlers.length; i-- > 0; ) {
            var handlerObject = handlers[i];
            handlerObject.handler.call(handlerObject.thisObject, wrappedEvent);
          }
        }
      }
      finishFrame(event);
    }
    function captureEvent(eventType, handler, thisObject) {
      if (captureHandlers[eventType]) releaseEvent(eventType);
      if (!handler) handler = basis.fn.$undef;
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
      var handlers = node === global ? globalEvents : node[EVENT_HOLDER];
      if (!handlers) handlers = node[EVENT_HOLDER] = {};
      var eventTypeHandlers = handlers[eventType];
      var handlerObject = {
        handler: handler,
        thisObject: thisObject
      };
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
          startFrame(event);
          for (var i = 0, wrappedEvent = new Event(event), item; item = eventTypeHandlers[i++]; ) item.handler.call(item.thisObject, wrappedEvent);
          finishFrame(event);
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
      var handlers = node === global ? globalEvents : node[EVENT_HOLDER];
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
      var handlers = node === global ? globalEvents : node[EVENT_HOLDER];
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
      var handlers = node === global ? globalEvents : node[EVENT_HOLDER];
      if (handlers && handlers[eventType]) {
        try {
          flushAsap = false;
          handlers[eventType].fireEvent(event);
        } finally {
          flushAsap = true;
        }
      }
    }
    function onUnload(handler, thisObject) {
      basis.dev.warn("basis.dom.event.onUnload() is deprecated, use basis.teardown() instead");
      basis.teardown(handler, thisObject);
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
  }
};

(function createBasisInstance(context, __basisFilename, __config) {
  "use strict";
  var VERSION = "1.4.0";
  var global = Function("return this")();
  var NODE_ENV = global !== context ? global : false;
  var document = global.document;
  var location = global.location;
  var process = global.process;
  var toString = Object.prototype.toString;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  global = context;
  var FACTORY = {};
  var PROXY = {};
  FACTORY = new (devVerboseName("basis.FACTORY", {}, function() {}));
  PROXY = new (devVerboseName("basis.PROXY", {}, function() {}));
  function genUID(len) {
    function base36(val) {
      return Math.round(val).toString(36);
    }
    var result = base36(10 + 25 * Math.random());
    if (!len) len = 16;
    while (result.length < len) result += base36(new Date * Math.random());
    return result.substr(0, len);
  }
  var warnPropertyAccess = function() {
    try {
      if (Object.defineProperty) {
        var obj = {};
        Object.defineProperty(obj, "foo", {
          get: function() {
            return true;
          }
        });
        if (obj.foo === true) {
          return function(object, name, value, warning) {
            Object.defineProperty(object, name, {
              get: function() {
                consoleMethods.warn(warning);
                return value;
              },
              set: function(newValue) {
                value = newValue;
              }
            });
          };
        }
      }
    } catch (e) {}
    return function() {};
  }();
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
    var GETTER_ID_PREFIX = "basisGetterId" + genUID() + "_";
    var GETTER_ID = GETTER_ID_PREFIX + "root";
    var ID = GETTER_ID_PREFIX;
    var SOURCE = GETTER_ID_PREFIX + "base";
    var PARENT = GETTER_ID_PREFIX + "parent";
    var getterSeed = 1;
    var pathCache = {};
    function as(path) {
      var self = this;
      var wrapper;
      var result;
      var id;
      if (typeof path == "function" || typeof path == "string") {
        wrapper = resolveFunction(path, self[ID]);
        id = GETTER_ID_PREFIX + wrapper[ID];
        if (hasOwnProperty.call(self, id)) return self[id];
        if (typeof wrapper[SOURCE] == "function") wrapper = wrapper[SOURCE];
        result = function(value) {
          return wrapper(self(value));
        };
      } else {
        var map = path;
        if (!map) return nullGetter;
        result = function(value) {
          return map[self(value)];
        };
      }
      result[PARENT] = self;
      result[ID] = getterSeed++;
      result[SOURCE] = path;
      result.__extend__ = getter;
      result.as = as;
      if (id) self[id] = result;
      return result;
    }
    function buildFunction(path) {
      return new Function("object", "return object != null ? object." + path + " : object");
    }
    function resolveFunction(value, id) {
      var fn = value;
      var result;
      if (value && typeof value == "string") {
        if (hasOwnProperty.call(pathCache, value)) return pathCache[value];
        fn = pathCache[value] = buildFunction(value);
      }
      if (typeof fn != "function") {
        basis.dev.warn("path for root getter should be function or non-empty string");
        return nullGetter;
      }
      if (fn.__extend__ === getter) return fn;
      if (hasOwnProperty.call(fn, id)) return fn[id];
      result = fn[id] = fn !== value ? fn : function(value) {
        return fn(value);
      };
      result[ID] = getterSeed++;
      result[SOURCE] = value;
      result.__extend__ = getter;
      result.as = as;
      return result;
    }
    function getter(path, value) {
      var result = path && path !== nullGetter ? resolveFunction(path, GETTER_ID) : nullGetter;
      if (value || value === "") {
        basis.dev.warn("second argument for getter is deprecated, use `as` method of getter instead");
        if (typeof value == "string") value = stringFunctions.formatter(value);
        return result.as(value);
      }
      return result;
    }
    getter.ID = ID;
    getter.SOURCE = SOURCE;
    getter.PARENT = PARENT;
    return getter;
  }();
  var nullGetter = function() {
    var nullGetter = function() {};
    nullGetter[getter.ID] = getter.ID + "nullGetter";
    nullGetter.__extend__ = getter, nullGetter.as = function() {
      return nullGetter;
    };
    return nullGetter;
  }();
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
  function factory(fn) {
    if (typeof fn != "function") fn = getter(fn);
    var result = function(value) {
      return fn(value);
    };
    result.factory = FACTORY;
    return result;
  }
  function isFactory(value) {
    return typeof value === "function" && value.factory === FACTORY;
  }
  function publicCallback(fn, permanent) {
    var name = "basisjsCallback" + genUID();
    global[name] = permanent ? fn : function() {
      try {
        delete global[name];
      } catch (e) {
        global[name] = undefined;
      }
      fn.apply(this, arguments);
    };
    return name;
  }
  function devVerboseName(name, args, fn) {
    return (new Function(keys(args), 'return {"' + name + '": ' + fn + '\n}["' + name + '"]')).apply(null, values(args));
  }
  var consoleMethods = function() {
    var console = global.console;
    var methods = {
      log: $undef,
      info: $undef,
      warn: $undef,
      error: $undef
    };
    if (console) iterate(methods, function(methodName) {
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
  if (!setImmediate) {
    (function() {
      var runTask = function() {
        var taskById = {};
        var taskId = 0;
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
        clearImmediate = function(taskId) {
          delete taskById[taskId];
        };
        return function(taskId) {
          var task = taskById[taskId];
          if (task) {
            delete taskById[taskId];
            task.fn.apply(undefined, task.args);
          }
          asap.process();
        };
      }();
      var addToQueue = function(taskId) {
        setTimeout(function() {
          runTask(taskId);
        }, 0);
      };
      if (NODE_ENV && NODE_ENV.process && typeof process.nextTick == "function") {
        addToQueue = function(taskId) {
          process.nextTick(function() {
            runTask(taskId);
          });
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
          var taskIdByMessage = {};
          var setImmediateHandler = function(event) {
            if (event && event.source == global) {
              var data = event.data;
              if (hasOwnProperty.call(taskIdByMessage, data)) {
                var taskId = taskIdByMessage[data];
                delete taskIdByMessage[data];
                runTask(taskId);
              }
            }
          };
          if (global.addEventListener) global.addEventListener("message", setImmediateHandler, true); else global.attachEvent("onmessage", setImmediateHandler);
          addToQueue = function(taskId) {
            var message = genUID(32);
            taskIdByMessage[message] = taskId;
            global.postMessage(message, "*");
          };
        } else {
          if (global.MessageChannel) {
            var channel = new global.MessageChannel;
            channel.port1.onmessage = function(event) {
              runTask(event.data);
            };
            addToQueue = function(taskId) {
              channel.port2.postMessage(taskId);
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
  }
  var asap = function() {
    var queue = [];
    var processing = false;
    var timer;
    function processQueue() {
      try {
        processing = true;
        var item;
        while (item = queue.shift()) item.fn.call(item.context);
      } finally {
        processing = false;
        if (queue.length) timer = setImmediate(process);
      }
    }
    function process() {
      if (timer) timer = clearImmediate(timer);
      if (queue.length) processQueue();
    }
    var asap = function(fn, context) {
      queue.push({
        fn: fn,
        context: context
      });
      if (!timer) timer = setImmediate(process);
      return true;
    };
    asap.process = function() {
      if (!processing) process();
    };
    asap.schedule = function(scheduleFn) {
      var queue = {};
      var scheduled = false;
      function process() {
        var etimer = setImmediate(process);
        scheduled = false;
        for (var id in queue) {
          var object = queue[id];
          delete queue[id];
          scheduleFn(object);
        }
        clearImmediate(etimer);
        if (!scheduled) queue = {};
      }
      return {
        add: function(object) {
          queue[object.basisObjectId] = object;
          if (!scheduled) scheduled = basis.asap(process);
        },
        remove: function(object) {
          delete queue[object.basisObjectId];
        }
      };
    };
    return asap;
  }();
  var codeFrame = function() {
    var count = 0;
    var info = {
      id: count,
      start: function() {
        info.id = count++;
      },
      finish: function() {
        asap.process();
        info.id = "unknown";
      }
    };
    return info;
  }();
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
      resolve: function() {
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
    implicitExt: true,
    modules: {},
    autoload: [ "./0.js" ]
  };
  function fetchConfig() {
    var config = __config;
    if (!config) {
      if (NODE_ENV) {
        basisFilename = process.basisjsFilename;
        if (process.basisjsConfig) {
          config = process.basisjsConfig;
          if (typeof config == "string") {
            try {
              config = Function("return{" + config + "}")();
            } catch (e) {
              consoleMethods.error("basis-config: basis.js config parse fault: " + e);
            }
          }
        }
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
  function processConfig(config) {
    config = slice(config);
    complete(config, {
      implicitExt: NODE_ENV ? true : "warn"
    });
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
    var TOSTRING_BUG = function() {
      for (var key in {
        toString: 1
      }) return false;
      return true;
    }();
    function createClass(SuperClass) {
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
    var customExtendProperty = function(extension, fn) {
      return {
        __extend__: function(extension) {
          if (!extension) return extension;
          if (extension && extension.__extend__) return extension;
          var Base = function() {};
          Base = devVerboseName(arguments[2] || "customExtendProperty", {}, Base);
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
        for (var key in extension) if (hasOwnProperty.call(extension, key)) {
          var value = result[key];
          var newValue = extension[key];
          if (newValue) result[key] = value && value.__extend__ ? value.__extend__(newValue) : extensibleProperty(newValue); else result[key] = null;
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
          for (var key in keys) if (hasOwnProperty.call(keys, key) && keys[key]) result[key] = fn;
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
      attach: function(host, fn, context, onDestroy) {
        host.attach(fn, context, onDestroy);
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
    attach: function(fn, context, onDestroy) {
      var cursor = this;
      while (cursor = cursor.handler) if (cursor.fn === fn && cursor.context === context) consoleMethods.warn("basis.Token#attach: duplicate fn & context pair");
      this.handler = {
        fn: fn,
        context: context,
        destroy: onDestroy || null,
        handler: this.handler
      };
    },
    detach: function(fn, context) {
      var cursor = this;
      var prev;
      while (prev = cursor, cursor = cursor.handler) if (cursor.fn === fn && cursor.context === context) {
        cursor.fn = $undef;
        cursor.destroy = cursor.destroy && $undef;
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
        token = this.deferredToken = new DeferredToken(this.get());
        this.attach(token.set, token);
      }
      return token;
    },
    as: function(fn) {
      var token = new Token;
      var setter = function(value) {
        this.set(fn.call(this, value));
      };
      if (typeof fn != "function") fn = getter(fn);
      setter.call(token, this.get());
      this.attach(setter, token, token.destroy);
      token.attach($undef, this, function() {
        this.detach(setter, token);
      });
      return token;
    },
    destroy: function() {
      if (this.deferredToken) {
        this.deferredToken.destroy();
        this.deferredToken = null;
      }
      this.attach = $undef;
      this.detach = $undef;
      var cursor = this;
      while (cursor = cursor.handler) if (cursor.destroy) cursor.destroy.call(cursor.context);
      this.handler = null;
      this.value = null;
    }
  });
  var deferredTokenApplyQueue = asap.schedule(function(token) {
    token.apply();
  });
  var DeferredToken = Token.subclass({
    className: "basis.DeferredToken",
    set: function(value) {
      if (this.value !== value) {
        this.value = value;
        deferredTokenApplyQueue.add(this);
      }
    },
    deferred: function() {
      return this;
    }
  });
  var resources = {};
  var resourceRequestCache = {};
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
  var resolveResourceFilename = function(url, baseURI) {
    var rootNS = url.match(/^([a-zA-Z0-9\_\-]+):/);
    if (rootNS) {
      var namespaceRoot = rootNS[1];
      if (namespaceRoot in nsRootPath == false) nsRootPath[namespaceRoot] = pathUtils.baseURI + namespaceRoot + "/";
      url = nsRootPath[namespaceRoot] + pathUtils.normalize("./" + url.substr(rootNS[0].length));
    } else {
      if (!/^(\.\/|\.\.|\/)/.test(url)) {
        var clr = arguments[2];
        consoleMethods.warn("Bad usage: " + (clr ? clr.replace("{url}", url) : url) + ".\nFilenames should starts with `./`, `..` or `/`. Otherwise it may treats as special reference in next releases.");
      }
      url = pathUtils.resolve(baseURI, url);
    }
    return url;
  };
  var getResourceContent = function(url, ignoreCache) {
    if (ignoreCache || !hasOwnProperty.call(resourceContentCache, url)) {
      var resourceContent = "";
      if (!NODE_ENV) {
        var req = new global.XMLHttpRequest;
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
    resourceRequestCache[resourceUrl] = resource;
    return resource;
  };
  var getResource = function(url, baseURI) {
    var reference = baseURI ? baseURI + "\0" + url : url;
    var resource = resourceRequestCache[reference];
    if (!resource) {
      var resolvedUrl = resolveResourceFilename(url, baseURI, "basis.resource('{url}')");
      resource = resources[resolvedUrl] || createResource(resolvedUrl);
      resourceRequestCache[reference] = resource;
    }
    return resource;
  };
  extend(getResource, {
    resolveURI: resolveResourceFilename,
    isResource: function(value) {
      return value ? resources[value.url] === value : false;
    },
    isResolved: function(resourceUrl) {
      var resource = getResource.get(resourceUrl);
      return resource ? resource.isResolved() : false;
    },
    exists: function(resourceUrl) {
      return hasOwnProperty.call(resources, resolveResourceFilename(resourceUrl, null, "basis.resource.exists('{url}')"));
    },
    get: function(resourceUrl) {
      resourceUrl = resolveResourceFilename(resourceUrl, null, "basis.resource.get('{url}')");
      if (!getResource.exists(resourceUrl)) return null;
      return getResource(resourceUrl);
    },
    getFiles: function(cache) {
      return cache ? keys(resourceContentCache) : keys(resources).filter(function(filename) {
        return !resources[filename].virtual;
      });
    },
    virtual: function(type, content, ownerUrl) {
      return createResource((ownerUrl ? ownerUrl + ":" : pathUtils.normalize(pathUtils.baseURI == "/" ? "" : pathUtils.baseURI) + "/") + "virtual-resource" + virtualResourceSeed++ + "." + type, content);
    },
    extensions: {
      ".js": extend(function processJsResourceContent(content, filename) {
        var namespace = filename2namespace[filename];
        if (!namespace) {
          var implicitNamespace = true;
          var resolvedFilename = (pathUtils.dirname(filename) + "/" + pathUtils.basename(filename, pathUtils.extname(filename))).replace(/^\/\//, "/");
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
        var ns = getNamespace(namespace);
        if (!ns.inited) {
          var savedRequires = requires;
          requires = [];
          ns.inited = true;
          ns.exports = runScriptInContext({
            path: ns.path,
            exports: ns.exports
          }, filename, content).exports;
          if (ns.exports && ns.exports.constructor === Object) {
            if (config.implicitExt) {
              if (config.implicitExt == "warn") {
                for (var key in ns.exports) if (key in ns == false && key != "path") {
                  ns[key] = ns.exports[key];
                  warnPropertyAccess(ns, key, ns.exports[key], "basis.js: Access to implicit namespace property `" + namespace + "." + key + "`");
                }
              } else complete(ns, ns.exports);
            }
          }
          ns.filename_ = filename;
          ns.source_ = content;
          ns.requires_ = requires;
          requires = savedRequires;
        }
        return ns.exports;
      }, {
        permanent: true
      }),
      ".css": function processCssResourceContent(content, url, cssResource) {
        if (!cssResource) cssResource = new CssResource(url);
        cssResource.updateCssText(content);
        return cssResource;
      },
      ".json": function processJsonResourceContent(content) {
        if (typeof content == "object") return content;
        var result;
        try {
          content = String(content);
          result = basis.json.parse(content);
        } catch (e) {
          var url = arguments[1];
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
      return new Function(args, '"use strict";\n' + (NODE_ENV ? "var __nodejsRequire = require;\n" : "") + body + "\n\n//# sourceURL=" + pathUtils.origin + sourceURL);
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
    var baseURL = pathUtils.dirname(sourceURL);
    var compiledSourceCode = sourceCode;
    if (!context.exports) context.exports = {};
    if (typeof compiledSourceCode != "function") compiledSourceCode = compileFunction(sourceURL, [ "exports", "module", "basis", "global", "__filename", "__dirname", "resource", "require", "asset" ], sourceCode);
    if (typeof compiledSourceCode == "function") {
      compiledSourceCode.displayName = "[module] " + (filename2namespace[sourceURL] || sourceURL);
      compiledSourceCode.call(context.exports, context.exports, context, basis, global, sourceURL, baseURL, function(path) {
        return getResource(path, baseURL);
      }, function(path) {
        return requireNamespace(path, baseURL);
      }, function(path) {
        return resolveResourceFilename(path, baseURL, "asset('{url}')");
      });
    }
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
      var filename = resolveResourceFilename(namespaceRoot + ":" + parts.join("/") + ".js").replace(/\/\.js$/, ".js");
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
    if (hasOwnProperty.call(namespaces, path)) return namespaces[path];
    path = path.split(".");
    var rootNs = getRootNamespace(path[0]);
    var cursor = rootNs;
    for (var i = 1; i < path.length; i++) {
      var name = path[i];
      var nspath = path.slice(0, i + 1).join(".");
      if (!hasOwnProperty.call(rootNs.namespaces_, nspath)) {
        var namespace = new Namespace(nspath);
        if (config.implicitExt) {
          cursor[name] = namespace;
          if (config.implicitExt == "warn") {
            cursor[name] = namespace;
            warnPropertyAccess(cursor, name, namespace, "basis.js: Access to implicit namespace `" + nspath + "`");
          }
        }
        rootNs.namespaces_[nspath] = namespace;
      }
      cursor = rootNs.namespaces_[nspath];
    }
    namespaces[path.join(".")] = cursor;
    return cursor;
  }
  var requireNamespace = function(path, baseURI) {
    if (!/[^a-z0-9_\.]/i.test(path) && pathUtils.extname(path) != ".js") {
      path = resolveNSFilename(path);
    } else {
      if (!/[\?#]/.test(path)) path = resolveResourceFilename(path, baseURI, "basis.require('{url}')");
    }
    return getResource(path).fetch();
  };
  requireNamespace.displayName = "basis.require";
  function patch(filename, patchFn) {
    if (!/[^a-z0-9_\.]/i.test(filename) && pathUtils.extname(filename) != ".js") {
      filename = resolveNSFilename(filename);
    } else {
      filename = resolveResourceFilename(filename, null, "basis.patch('{url}')");
    }
    if (!resourcePatch[filename]) resourcePatch[filename] = [ patchFn ]; else resourcePatch[filename].push(patchFn);
    var resource = getResource.get(filename);
    if (resource && resource.isResolved()) {
      consoleMethods.info("Apply patch for " + resource.url);
      patchFn(resource.get(), resource.url);
    }
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
  var stringFormatCache = {};
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
    formatter: function(formatString) {
      formatString = String(formatString);
      if (hasOwnProperty.call(stringFormatCache, formatString)) return stringFormatCache[formatString];
      var formatter = function(value) {
        return stringFunctions.format(formatString, value);
      };
      var escapsedFormatString = '"' + formatString.replace(/"/g, '\\"') + '"';
      formatter = (new Function("stringFunctions", "return " + formatter.toString().replace("formatString", escapsedFormatString)))(stringFunctions);
      formatter.toString = function() {
        return "basis.string.formatter(" + escapsedFormatString + ")";
      };
      stringFormatCache[formatString] = formatter;
      return formatter;
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
      if (!pattern || pattern instanceof RegExp == false || pattern.source == "") return nativeStringSplit.call(this, pattern, count);
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
    var eventFired = !document || document.readyState == "complete";
    var readyHandlers = [];
    var timer;
    function processReadyHandler() {
      var handler;
      if (timer) timer = clearImmediate(timer);
      if (readyHandlers.length > 1) timer = setImmediate(processReadyHandler);
      while (handler = readyHandlers.shift()) handler[0].call(handler[1]);
      timer = clearImmediate(timer);
      asap.process();
    }
    function fireHandlers() {
      if (!(eventFired++)) processReadyHandler();
    }
    function doScrollCheck() {
      try {
        document.documentElement.doScroll("left");
        fireHandlers();
      } catch (e) {
        setTimeout(doScrollCheck, 1);
      }
    }
    if (!eventFired) {
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
      if (!readyHandlers.length && eventFired && !timer) timer = setImmediate(processReadyHandler);
      readyHandlers.push([ callback, context ]);
    };
  }();
  var teardown = function() {
    if ("addEventListener" in global) return function(callback, context) {
      global.addEventListener("unload", function(event) {
        callback.call(context || null, event || global.event);
      }, false);
    };
    if ("attachEvent" in global) return function(callback, context) {
      global.attachEvent("onunload", function(event) {
        callback.call(context || null, event || global.event);
      });
    };
    return $undef;
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
    function destroy() {
      var logDestroy = arguments[0] === true;
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
      objects = [];
    }
    if (teardown === $undef) return {
      add: $undef,
      remove: $undef
    };
    teardown(destroy);
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
    dev: (new Namespace("basis.dev")).extend(consoleMethods).extend({
      warnPropertyAccess: warnPropertyAccess
    }),
    resolveNSFilename: resolveNSFilename,
    patch: patch,
    namespace: getNamespace,
    require: requireNamespace,
    resource: getResource,
    asset: function(path) {
      return resolveResourceFilename(path, null, "basis.asset('{url}')");
    },
    setImmediate: setImmediate,
    clearImmediate: clearImmediate,
    nextTick: function() {
      setImmediate.apply(null, arguments);
    },
    asap: asap,
    FACTORY: FACTORY,
    PROXY: PROXY,
    Class: Class,
    Token: Token,
    DeferredToken: DeferredToken,
    codeFrame: codeFrame,
    ready: ready,
    teardown: teardown,
    cleaner: cleaner,
    genUID: genUID,
    getter: getter,
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
      factory: factory,
      isFactory: isFactory,
      lazyInit: lazyInit,
      lazyInitAndRun: lazyInitAndRun,
      runOnce: runOnce,
      publicCallback: publicCallback
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
  if (config.autoload && !NODE_ENV) config.autoload.forEach(function(name) {
    requireNamespace(name);
  });
  if (NODE_ENV && exports) exports.basis = basis;
  return basis;
})(this);
}).call(this);