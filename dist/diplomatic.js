(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@rgrove/parse-xml/dist/browser.js
  var require_browser = __commonJS({
    "node_modules/@rgrove/parse-xml/dist/browser.js"(exports, module) {
      "use strict";
      var __defProp2 = Object.defineProperty;
      var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
      var __getOwnPropNames2 = Object.getOwnPropertyNames;
      var __hasOwnProp2 = Object.prototype.hasOwnProperty;
      var __export = (target, all) => {
        for (var name in all)
          __defProp2(target, name, { get: all[name], enumerable: true });
      };
      var __copyProps2 = (to, from, except, desc) => {
        if (from && typeof from === "object" || typeof from === "function") {
          for (let key of __getOwnPropNames2(from))
            if (!__hasOwnProp2.call(to, key) && key !== except)
              __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
        }
        return to;
      };
      var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
      var src_exports = {};
      __export(src_exports, {
        XmlCdata: () => XmlCdata,
        XmlComment: () => XmlComment,
        XmlDeclaration: () => XmlDeclaration,
        XmlDocument: () => XmlDocument,
        XmlDocumentType: () => XmlDocumentType,
        XmlElement: () => XmlElement,
        XmlError: () => XmlError,
        XmlNode: () => XmlNode,
        XmlProcessingInstruction: () => XmlProcessingInstruction,
        XmlText: () => XmlText,
        parseXml: () => parseXml2
      });
      module.exports = __toCommonJS(src_exports);
      var emptyString = "";
      var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      var StringScanner = class {
        constructor(string) {
          this.k = this.u(string, true);
          this.d = 0;
          this.length = string.length;
          this.l = this.k !== this.length;
          this.h = string;
          if (this.l) {
            let charsToBytes = [];
            for (let byteIndex = 0, charIndex = 0; charIndex < this.k; ++charIndex) {
              charsToBytes[charIndex] = byteIndex;
              byteIndex += string.codePointAt(byteIndex) > 65535 ? 2 : 1;
            }
            this.A = charsToBytes;
          }
        }
        /**
         * Whether the current character index is at the end of the input string.
         */
        get B() {
          return this.d >= this.k;
        }
        // -- Protected Methods ------------------------------------------------------
        /**
         * Returns the number of characters in the given string, which may differ from
         * the byte length if the string contains multibyte characters.
         */
        u(string, multiByteSafe = this.l) {
          return multiByteSafe ? string.replace(surrogatePair, "_").length : string.length;
        }
        // -- Public Methods ---------------------------------------------------------
        /**
         * Advances the scanner by the given number of characters, stopping if the end
         * of the string is reached.
         */
        p(count = 1) {
          this.d = Math.min(this.k, this.d + count);
        }
        /**
         * Returns the byte index of the given character index in the string. The two
         * may differ in strings that contain multibyte characters.
         */
        f(charIndex = this.d) {
          var _a;
          return this.l ? (_a = this.A[charIndex]) != null ? _a : Infinity : charIndex;
        }
        /**
         * Consumes and returns the given number of characters if possible, advancing
         * the scanner and stopping if the end of the string is reached.
         *
         * If no characters could be consumed, an empty string will be returned.
         */
        G(charCount = 1) {
          let chars = this.m(charCount);
          this.p(charCount);
          return chars;
        }
        /**
         * Consumes and returns the given number of bytes if possible, advancing the
         * scanner and stopping if the end of the string is reached.
         *
         * It's up to the caller to ensure that the given byte count doesn't split a
         * multibyte character.
         *
         * If no bytes could be consumed, an empty string will be returned.
         */
        v(byteCount) {
          let byteIndex = this.f();
          let result = this.h.slice(byteIndex, byteIndex + byteCount);
          this.p(this.u(result));
          return result;
        }
        /**
         * Consumes and returns all characters for which the given function returns
         * `true`, stopping when `false` is returned or the end of the input is
         * reached.
         */
        w(fn) {
          let { length, l: multiByteMode, h: string } = this;
          let startByteIndex = this.f();
          let endByteIndex = startByteIndex;
          if (multiByteMode) {
            while (endByteIndex < length) {
              let char = string[endByteIndex];
              let isSurrogatePair = char >= "\uD800" && char <= "\uDBFF";
              if (isSurrogatePair) {
                char += string[endByteIndex + 1];
              }
              if (!fn(char)) {
                break;
              }
              endByteIndex += isSurrogatePair ? 2 : 1;
            }
          } else {
            while (endByteIndex < length && fn(string[endByteIndex])) {
              ++endByteIndex;
            }
          }
          return this.v(endByteIndex - startByteIndex);
        }
        /**
         * Consumes the given string if it exists at the current character index, and
         * advances the scanner.
         *
         * If the given string doesn't exist at the current character index, an empty
         * string will be returned and the scanner will not be advanced.
         */
        b(stringToConsume) {
          let { length } = stringToConsume;
          let byteIndex = this.f();
          if (stringToConsume === this.h.slice(byteIndex, byteIndex + length)) {
            this.p(length === 1 ? 1 : this.u(stringToConsume));
            return stringToConsume;
          }
          return emptyString;
        }
        /**
         * Consumes characters until the given global regex is matched, advancing the
         * scanner up to (but not beyond) the beginning of the match. If the regex
         * doesn't match, nothing will be consumed.
         *
         * Returns the consumed string, or an empty string if nothing was consumed.
         */
        x(regex) {
          let matchByteIndex = this.h.slice(this.f()).search(regex);
          return matchByteIndex > 0 ? this.v(matchByteIndex) : emptyString;
        }
        /**
         * Consumes characters until the given string is found, advancing the scanner
         * up to (but not beyond) that point. If the string is never found, nothing
         * will be consumed.
         *
         * Returns the consumed string, or an empty string if nothing was consumed.
         */
        s(searchString) {
          let byteIndex = this.f();
          let matchByteIndex = this.h.indexOf(searchString, byteIndex);
          return matchByteIndex > 0 ? this.v(matchByteIndex - byteIndex) : emptyString;
        }
        /**
         * Returns the given number of characters starting at the current character
         * index, without advancing the scanner and without exceeding the end of the
         * input string.
         */
        m(count = 1) {
          let { d: charIndex, h: string } = this;
          return this.l ? string.slice(this.f(charIndex), this.f(charIndex + count)) : string.slice(charIndex, charIndex + count);
        }
        /**
         * Resets the scanner position to the given character _index_, or to the start
         * of the input string if no index is given.
         *
         * If _index_ is negative, the scanner position will be moved backward by that
         * many characters, stopping if the beginning of the string is reached.
         */
        n(index = 0) {
          this.d = index >= 0 ? Math.min(this.k, index) : Math.max(0, this.d + index);
        }
      };
      var attValueCharDoubleQuote = /["&<]/;
      var attValueCharSingleQuote = /['&<]/;
      var attValueNormalizedWhitespace = /\r\n|[\n\r\t]/g;
      var endCharData = /<|&|]]>/;
      var predefinedEntities = Object.freeze(Object.assign(/* @__PURE__ */ Object.create(null), {
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        quot: '"'
      }));
      function isNameChar(char) {
        let cp = char.codePointAt(0);
        return cp >= 97 && cp <= 122 || cp >= 65 && cp <= 90 || cp >= 48 && cp <= 57 || cp === 45 || cp === 46 || cp === 183 || cp >= 768 && cp <= 879 || cp === 8255 || cp === 8256 || isNameStartChar(char, cp);
      }
      function isNameStartChar(char, cp = char.codePointAt(0)) {
        return cp >= 97 && cp <= 122 || cp >= 65 && cp <= 90 || cp === 58 || cp === 95 || cp >= 192 && cp <= 214 || cp >= 216 && cp <= 246 || cp >= 248 && cp <= 767 || cp >= 880 && cp <= 893 || cp >= 895 && cp <= 8191 || cp === 8204 || cp === 8205 || cp >= 8304 && cp <= 8591 || cp >= 11264 && cp <= 12271 || cp >= 12289 && cp <= 55295 || cp >= 63744 && cp <= 64975 || cp >= 65008 && cp <= 65533 || cp >= 65536 && cp <= 983039;
      }
      function isReferenceChar(char) {
        return char === "#" || isNameChar(char);
      }
      function isWhitespace(char) {
        let cp = char.codePointAt(0);
        return cp === 32 || cp === 9 || cp === 10 || cp === 13;
      }
      function isXmlCodePoint(cp) {
        return cp >= 32 && cp <= 55295 || cp === 10 || cp === 9 || cp === 13 || cp >= 57344 && cp <= 65533 || cp >= 65536 && cp <= 1114111;
      }
      var _XmlNode = class _XmlNode2 {
        constructor() {
          this.parent = null;
          this.start = -1;
          this.end = -1;
        }
        /**
         * Document that contains this node, or `null` if this node is not associated
         * with a document.
         */
        get document() {
          var _a, _b;
          return (_b = (_a = this.parent) == null ? void 0 : _a.document) != null ? _b : null;
        }
        /**
         * Whether this node is the root node of the document (also known as the
         * document element).
         */
        get isRootNode() {
          return this.parent !== null && this.parent === this.document && this.type === _XmlNode2.TYPE_ELEMENT;
        }
        /**
         * Whether whitespace should be preserved in the content of this element and
         * its children.
         *
         * This is influenced by the value of the special `xml:space` attribute, and
         * will be `true` for any node whose `xml:space` attribute is set to
         * "preserve". If a node has no such attribute, it will inherit the value of
         * the nearest ancestor that does (if any).
         *
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#sec-white-space
         */
        get preserveWhitespace() {
          var _a;
          return !!((_a = this.parent) == null ? void 0 : _a.preserveWhitespace);
        }
        /**
         * Type of this node.
         *
         * The value of this property is a string that matches one of the static
         * `TYPE_*` properties on the `XmlNode` class (e.g. `TYPE_ELEMENT`,
         * `TYPE_TEXT`, etc.).
         *
         * The `XmlNode` class itself is a base class and doesn't have its own type
         * name.
         */
        get type() {
          return "";
        }
        /**
         * Returns a JSON-serializable object representing this node, minus properties
         * that could result in circular references.
         */
        toJSON() {
          let json = {
            type: this.type
          };
          if (this.isRootNode) {
            json.isRootNode = true;
          }
          if (this.preserveWhitespace) {
            json.preserveWhitespace = true;
          }
          if (this.start !== -1) {
            json.start = this.start;
            json.end = this.end;
          }
          return json;
        }
      };
      _XmlNode.TYPE_CDATA = "cdata";
      _XmlNode.TYPE_COMMENT = "comment";
      _XmlNode.TYPE_DOCUMENT = "document";
      _XmlNode.TYPE_DOCUMENT_TYPE = "doctype";
      _XmlNode.TYPE_ELEMENT = "element";
      _XmlNode.TYPE_PROCESSING_INSTRUCTION = "pi";
      _XmlNode.TYPE_TEXT = "text";
      _XmlNode.TYPE_XML_DECLARATION = "xmldecl";
      var XmlNode = _XmlNode;
      var XmlText = class extends XmlNode {
        constructor(text = "") {
          super();
          this.text = text;
        }
        get type() {
          return XmlNode.TYPE_TEXT;
        }
        toJSON() {
          return Object.assign(XmlNode.prototype.toJSON.call(this), {
            text: this.text
          });
        }
      };
      var XmlCdata = class extends XmlText {
        get type() {
          return XmlNode.TYPE_CDATA;
        }
      };
      var XmlComment = class extends XmlNode {
        constructor(content = "") {
          super();
          this.content = content;
        }
        get type() {
          return XmlNode.TYPE_COMMENT;
        }
        toJSON() {
          return Object.assign(XmlNode.prototype.toJSON.call(this), {
            content: this.content
          });
        }
      };
      var XmlDeclaration = class extends XmlNode {
        constructor(version, encoding, standalone) {
          super();
          this.version = version;
          this.encoding = encoding != null ? encoding : null;
          this.standalone = standalone != null ? standalone : null;
        }
        get type() {
          return XmlNode.TYPE_XML_DECLARATION;
        }
        toJSON() {
          let json = XmlNode.prototype.toJSON.call(this);
          json.version = this.version;
          for (let key of ["encoding", "standalone"]) {
            if (this[key] !== null) {
              json[key] = this[key];
            }
          }
          return json;
        }
      };
      var XmlElement = class _XmlElement extends XmlNode {
        constructor(name, attributes = /* @__PURE__ */ Object.create(null), children = []) {
          super();
          this.name = name;
          this.attributes = attributes;
          this.children = children;
        }
        /**
         * Whether this element is empty (meaning it has no children).
         */
        get isEmpty() {
          return this.children.length === 0;
        }
        get preserveWhitespace() {
          let node = this;
          while (node instanceof _XmlElement) {
            if ("xml:space" in node.attributes) {
              return node.attributes["xml:space"] === "preserve";
            }
            node = node.parent;
          }
          return false;
        }
        /**
         * Text content of this element and all its descendants.
         */
        get text() {
          return this.children.map((child) => "text" in child ? child.text : "").join("");
        }
        get type() {
          return XmlNode.TYPE_ELEMENT;
        }
        toJSON() {
          return Object.assign(XmlNode.prototype.toJSON.call(this), {
            name: this.name,
            attributes: this.attributes,
            children: this.children.map((child) => child.toJSON())
          });
        }
      };
      var XmlDocument = class extends XmlNode {
        constructor(children = []) {
          super();
          this.children = children;
        }
        get document() {
          return this;
        }
        /**
         * Root element of this document, or `null` if this document is empty.
         */
        get root() {
          for (let child of this.children) {
            if (child instanceof XmlElement) {
              return child;
            }
          }
          return null;
        }
        /**
         * Text content of this document and all its descendants.
         */
        get text() {
          return this.children.map((child) => "text" in child ? child.text : "").join("");
        }
        get type() {
          return XmlNode.TYPE_DOCUMENT;
        }
        toJSON() {
          return Object.assign(XmlNode.prototype.toJSON.call(this), {
            children: this.children.map((child) => child.toJSON())
          });
        }
      };
      var XmlDocumentType = class extends XmlNode {
        constructor(name, publicId, systemId, internalSubset) {
          super();
          this.name = name;
          this.publicId = publicId != null ? publicId : null;
          this.systemId = systemId != null ? systemId : null;
          this.internalSubset = internalSubset != null ? internalSubset : null;
        }
        get type() {
          return XmlNode.TYPE_DOCUMENT_TYPE;
        }
        toJSON() {
          let json = XmlNode.prototype.toJSON.call(this);
          json.name = this.name;
          for (let key of ["publicId", "systemId", "internalSubset"]) {
            if (this[key] !== null) {
              json[key] = this[key];
            }
          }
          return json;
        }
      };
      var XmlError = class extends Error {
        constructor(message, charIndex, xml) {
          let column = 1;
          let excerpt = "";
          let line = 1;
          for (let i = 0; i < charIndex; ++i) {
            let char = xml[i];
            if (char === "\n") {
              column = 1;
              excerpt = "";
              line += 1;
            } else {
              column += 1;
              excerpt += char;
            }
          }
          let eol = xml.indexOf("\n", charIndex);
          excerpt += eol === -1 ? xml.slice(charIndex) : xml.slice(charIndex, eol);
          let excerptStart = 0;
          if (excerpt.length > 50) {
            if (column < 40) {
              excerpt = excerpt.slice(0, 50);
            } else {
              excerptStart = column - 20;
              excerpt = excerpt.slice(excerptStart, column + 30);
            }
          }
          super(
            `${message} (line ${line}, column ${column})
  ${excerpt}
` + " ".repeat(column - excerptStart + 1) + "^\n"
          );
          this.column = column;
          this.excerpt = excerpt;
          this.line = line;
          this.name = "XmlError";
          this.pos = charIndex;
        }
      };
      var XmlProcessingInstruction = class extends XmlNode {
        constructor(name, content = "") {
          super();
          this.name = name;
          this.content = content;
        }
        get type() {
          return XmlNode.TYPE_PROCESSING_INSTRUCTION;
        }
        toJSON() {
          return Object.assign(XmlNode.prototype.toJSON.call(this), {
            name: this.name,
            content: this.content
          });
        }
      };
      var emptyString2 = "";
      var Parser = class {
        /**
         * @param xml XML string to parse.
         * @param options Parser options.
         */
        constructor(xml, options = {}) {
          let doc = this.document = new XmlDocument();
          this.j = doc;
          this.g = options;
          this.c = new StringScanner(xml);
          if (this.g.includeOffsets) {
            doc.start = 0;
            doc.end = xml.length;
          }
          this.parse();
        }
        /**
         * Adds the given `XmlNode` as a child of `this.currentNode`.
         */
        i(node, charIndex) {
          node.parent = this.j;
          if (this.g.includeOffsets) {
            node.start = this.c.f(charIndex);
            node.end = this.c.f();
          }
          this.j.children.push(node);
          return true;
        }
        /**
         * Adds the given _text_ to the document, either by appending it to a
         * preceding `XmlText` node (if possible) or by creating a new `XmlText` node.
         */
        y(text, charIndex) {
          let { children } = this.j;
          let { length } = children;
          text = normalizeLineBreaks(text);
          if (length > 0) {
            let prevNode = children[length - 1];
            if ((prevNode == null ? void 0 : prevNode.type) === XmlNode.TYPE_TEXT) {
              let textNode = prevNode;
              textNode.text += text;
              if (this.g.includeOffsets) {
                textNode.end = this.c.f();
              }
              return true;
            }
          }
          return this.i(new XmlText(text), charIndex);
        }
        /**
         * Consumes element attributes.
         *
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#sec-starttags
         */
        H() {
          let attributes = /* @__PURE__ */ Object.create(null);
          while (this.e()) {
            let attrName = this.q();
            if (!attrName) {
              break;
            }
            let attrValue = this.t() && this.I();
            if (attrValue === false) {
              throw this.a("Attribute value expected");
            }
            if (attrName in attributes) {
              throw this.a(`Duplicate attribute: ${attrName}`);
            }
            if (attrName === "xml:space" && attrValue !== "default" && attrValue !== "preserve") {
              throw this.a('Value of the `xml:space` attribute must be "default" or "preserve"');
            }
            attributes[attrName] = attrValue;
          }
          if (this.g.sortAttributes) {
            let attrNames = Object.keys(attributes).sort();
            let sortedAttributes = /* @__PURE__ */ Object.create(null);
            for (let i = 0; i < attrNames.length; ++i) {
              let attrName = attrNames[i];
              sortedAttributes[attrName] = attributes[attrName];
            }
            attributes = sortedAttributes;
          }
          return attributes;
        }
        /**
         * Consumes an `AttValue` (attribute value) if possible.
         *
         * @returns
         *   Contents of the `AttValue` minus quotes, or `false` if nothing was
         *   consumed. An empty string indicates that an `AttValue` was consumed but
         *   was empty.
         *
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-AttValue
         */
        I() {
          let { c: scanner } = this;
          let quote = scanner.m();
          if (quote !== '"' && quote !== "'") {
            return false;
          }
          scanner.p();
          let chars;
          let isClosed = false;
          let value = emptyString2;
          let regex = quote === '"' ? attValueCharDoubleQuote : attValueCharSingleQuote;
          matchLoop: while (!scanner.B) {
            chars = scanner.x(regex);
            if (chars) {
              this.o(chars);
              value += chars.replace(attValueNormalizedWhitespace, " ");
            }
            switch (scanner.m()) {
              case quote:
                isClosed = true;
                break matchLoop;
              case "&":
                value += this.C();
                continue;
              case "<":
                throw this.a("Unescaped `<` is not allowed in an attribute value");
              default:
                break matchLoop;
            }
          }
          if (!isClosed) {
            throw this.a("Unclosed attribute");
          }
          scanner.p();
          return value;
        }
        /**
         * Consumes a CDATA section if possible.
         *
         * @returns Whether a CDATA section was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#sec-cdata-sect
         */
        J() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          if (!scanner.b("<![CDATA[")) {
            return false;
          }
          let text = scanner.s("]]>");
          this.o(text);
          if (!scanner.b("]]>")) {
            throw this.a("Unclosed CDATA section");
          }
          return this.g.preserveCdata ? this.i(new XmlCdata(normalizeLineBreaks(text)), startIndex) : this.y(text, startIndex);
        }
        /**
         * Consumes character data if possible.
         *
         * @returns Whether character data was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#dt-chardata
         */
        K() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          let charData = scanner.x(endCharData);
          if (!charData) {
            return false;
          }
          this.o(charData);
          if (scanner.m(3) === "]]>") {
            throw this.a("Element content may not contain the CDATA section close delimiter `]]>`");
          }
          return this.y(charData, startIndex);
        }
        /**
         * Consumes a comment if possible.
         *
         * @returns Whether a comment was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Comment
         */
        D() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          if (!scanner.b("<!--")) {
            return false;
          }
          let content = scanner.s("--");
          this.o(content);
          if (!scanner.b("-->")) {
            if (scanner.m(2) === "--") {
              throw this.a("The string `--` isn't allowed inside a comment");
            }
            throw this.a("Unclosed comment");
          }
          return this.g.preserveComments ? this.i(new XmlComment(normalizeLineBreaks(content)), startIndex) : true;
        }
        /**
         * Consumes a reference in a content context if possible.
         *
         * This differs from `consumeReference()` in that a consumed reference will be
         * added to the document as a text node instead of returned.
         *
         * @returns Whether a reference was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#entproc
         */
        L() {
          let startIndex = this.c.d;
          let ref = this.C();
          return ref ? this.y(ref, startIndex) : false;
        }
        /**
         * Consumes a doctype declaration if possible.
         *
         * This is a loose implementation since doctype declarations are currently
         * discarded without further parsing.
         *
         * @returns Whether a doctype declaration was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#dtd
         */
        M() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          if (!scanner.b("<!DOCTYPE")) {
            return false;
          }
          let name = this.e() && this.q();
          if (!name) {
            throw this.a("Expected a name");
          }
          let publicId;
          let systemId;
          if (this.e()) {
            if (scanner.b("PUBLIC")) {
              publicId = this.e() && this.N();
              if (publicId === false) {
                throw this.a("Expected a public identifier");
              }
              this.e();
            }
            if (publicId !== void 0 || scanner.b("SYSTEM")) {
              this.e();
              systemId = this.r();
              if (systemId === false) {
                throw this.a("Expected a system identifier");
              }
              this.e();
            }
          }
          let internalSubset;
          if (scanner.b("[")) {
            internalSubset = scanner.x(/\][\x20\t\r\n]*>/);
            if (!scanner.b("]")) {
              throw this.a("Unclosed internal subset");
            }
            this.e();
          }
          if (!scanner.b(">")) {
            throw this.a("Unclosed doctype declaration");
          }
          return this.g.preserveDocumentType ? this.i(new XmlDocumentType(name, publicId, systemId, internalSubset), startIndex) : true;
        }
        /**
         * Consumes an element if possible.
         *
         * @returns Whether an element was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-element
         */
        E() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          if (!scanner.b("<")) {
            return false;
          }
          let name = this.q();
          if (!name) {
            scanner.n(startIndex);
            return false;
          }
          let attributes = this.H();
          let isEmpty = !!scanner.b("/>");
          let element = new XmlElement(name, attributes);
          element.parent = this.j;
          if (!isEmpty) {
            if (!scanner.b(">")) {
              throw this.a(`Unclosed start tag for element \`${name}\``);
            }
            this.j = element;
            do {
              this.K();
            } while (this.E() || this.L() || this.J() || this.F() || this.D());
            let endTagMark = scanner.d;
            let endTagName;
            if (!scanner.b("</") || !(endTagName = this.q()) || endTagName !== name) {
              scanner.n(endTagMark);
              throw this.a(`Missing end tag for element ${name}`);
            }
            this.e();
            if (!scanner.b(">")) {
              throw this.a(`Unclosed end tag for element ${name}`);
            }
            this.j = element.parent;
          }
          return this.i(element, startIndex);
        }
        /**
         * Consumes an `Eq` production if possible.
         *
         * @returns Whether an `Eq` production was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Eq
         */
        t() {
          this.e();
          if (this.c.b("=")) {
            this.e();
            return true;
          }
          return false;
        }
        /**
         * Consumes `Misc` content if possible.
         *
         * @returns Whether anything was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Misc
         */
        z() {
          return this.D() || this.F() || this.e();
        }
        /**
         * Consumes one or more `Name` characters if possible.
         *
         * @returns `Name` characters, or an empty string if none were consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Name
         */
        q() {
          return isNameStartChar(this.c.m()) ? this.c.w(isNameChar) : emptyString2;
        }
        /**
         * Consumes a processing instruction if possible.
         *
         * @returns Whether a processing instruction was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#sec-pi
         */
        F() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          if (!scanner.b("<?")) {
            return false;
          }
          let name = this.q();
          if (name) {
            if (name.toLowerCase() === "xml") {
              scanner.n(startIndex);
              throw this.a("XML declaration isn't allowed here");
            }
          } else {
            throw this.a("Invalid processing instruction");
          }
          if (!this.e()) {
            if (scanner.b("?>")) {
              return this.i(new XmlProcessingInstruction(name), startIndex);
            }
            throw this.a("Whitespace is required after a processing instruction name");
          }
          let content = scanner.s("?>");
          this.o(content);
          if (!scanner.b("?>")) {
            throw this.a("Unterminated processing instruction");
          }
          return this.i(new XmlProcessingInstruction(name, normalizeLineBreaks(content)), startIndex);
        }
        /**
         * Consumes a prolog if possible.
         *
         * @returns Whether a prolog was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#sec-prolog-dtd
         */
        O() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          this.P();
          while (this.z()) {
          }
          if (this.M()) {
            while (this.z()) {
            }
          }
          return startIndex < scanner.d;
        }
        /**
         * Consumes a public identifier literal if possible.
         *
         * @returns
         *   Value of the public identifier literal minus quotes, or `false` if
         *   nothing was consumed. An empty string indicates that a public id literal
         *   was consumed but was empty.
         *
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-PubidLiteral
         */
        N() {
          let startIndex = this.c.d;
          let value = this.r();
          if (value !== false && !/^[-\x20\r\na-zA-Z0-9'()+,./:=?;!*#@$_%]*$/.test(value)) {
            this.c.n(startIndex);
            throw this.a("Invalid character in public identifier");
          }
          return value;
        }
        /**
         * Consumes a reference if possible.
         *
         * This differs from `consumeContentReference()` in that a consumed reference
         * will be returned rather than added to the document.
         *
         * @returns
         *   Parsed reference value, or `false` if nothing was consumed (to
         *   distinguish from a reference that resolves to an empty string).
         *
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Reference
         */
        C() {
          let { c: scanner } = this;
          if (!scanner.b("&")) {
            return false;
          }
          let ref = scanner.w(isReferenceChar);
          if (scanner.G() !== ";") {
            throw this.a("Unterminated reference (a reference must end with `;`)");
          }
          let parsedValue;
          if (ref[0] === "#") {
            let codePoint = ref[1] === "x" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
            if (isNaN(codePoint)) {
              throw this.a("Invalid character reference");
            }
            if (!isXmlCodePoint(codePoint)) {
              throw this.a("Character reference resolves to an invalid character");
            }
            parsedValue = String.fromCodePoint(codePoint);
          } else {
            parsedValue = predefinedEntities[ref];
            if (parsedValue === void 0) {
              let {
                ignoreUndefinedEntities,
                resolveUndefinedEntity
              } = this.g;
              let wrappedRef = `&${ref};`;
              if (resolveUndefinedEntity) {
                let resolvedValue = resolveUndefinedEntity(wrappedRef);
                if (resolvedValue !== null && resolvedValue !== void 0) {
                  let type = typeof resolvedValue;
                  if (type !== "string") {
                    throw new TypeError(`\`resolveUndefinedEntity()\` must return a string, \`null\`, or \`undefined\`, but returned a value of type ${type}`);
                  }
                  return resolvedValue;
                }
              }
              if (ignoreUndefinedEntities) {
                return wrappedRef;
              }
              scanner.n(-wrappedRef.length);
              throw this.a(`Named entity isn't defined: ${wrappedRef}`);
            }
          }
          return parsedValue;
        }
        /**
         * Consumes a `SystemLiteral` if possible.
         *
         * A `SystemLiteral` is similar to an attribute value, but allows the
         * characters `<` and `&` and doesn't replace references.
         *
         * @returns
         *   Value of the `SystemLiteral` minus quotes, or `false` if nothing was
         *   consumed. An empty string indicates that a `SystemLiteral` was consumed
         *   but was empty.
         *
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-SystemLiteral
         */
        r() {
          let { c: scanner } = this;
          let quote = scanner.b('"') || scanner.b("'");
          if (!quote) {
            return false;
          }
          let value = scanner.s(quote);
          this.o(value);
          if (!scanner.b(quote)) {
            throw this.a("Missing end quote");
          }
          return value;
        }
        /**
         * Consumes one or more whitespace characters if possible.
         *
         * @returns Whether any whitespace characters were consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#white
         */
        e() {
          return !!this.c.w(isWhitespace);
        }
        /**
         * Consumes an XML declaration if possible.
         *
         * @returns Whether an XML declaration was consumed.
         * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-XMLDecl
         */
        P() {
          let { c: scanner } = this;
          let startIndex = scanner.d;
          if (!scanner.b("<?xml")) {
            return false;
          }
          if (!this.e()) {
            throw this.a("Invalid XML declaration");
          }
          let version = !!scanner.b("version") && this.t() && this.r();
          if (version === false) {
            throw this.a("XML version is missing or invalid");
          } else if (!/^1\.[0-9]+$/.test(version)) {
            throw this.a("Invalid character in version number");
          }
          let encoding;
          let standalone;
          if (this.e()) {
            encoding = !!scanner.b("encoding") && this.t() && this.r();
            if (encoding) {
              if (!/^[A-Za-z][\w.-]*$/.test(encoding)) {
                throw this.a("Invalid character in encoding name");
              }
              this.e();
            }
            standalone = !!scanner.b("standalone") && this.t() && this.r();
            if (standalone) {
              if (standalone !== "yes" && standalone !== "no") {
                throw this.a('Only "yes" and "no" are permitted as values of `standalone`');
              }
              this.e();
            }
          }
          if (!scanner.b("?>")) {
            throw this.a("Invalid or unclosed XML declaration");
          }
          return this.g.preserveXmlDeclaration ? this.i(new XmlDeclaration(
            version,
            encoding || void 0,
            standalone || void 0
          ), startIndex) : true;
        }
        /**
         * Returns an `XmlError` for the current scanner position.
         */
        a(message) {
          let { c: scanner } = this;
          return new XmlError(message, scanner.d, scanner.h);
        }
        /**
         * Parses the XML input.
         */
        parse() {
          this.c.b("\uFEFF");
          this.O();
          if (!this.E()) {
            throw this.a("Root element is missing or invalid");
          }
          while (this.z()) {
          }
          if (!this.c.B) {
            throw this.a("Extra content at the end of the document");
          }
        }
        /**
         * Throws an invalid character error if any character in the given _string_
         * isn't a valid XML character.
         */
        o(string) {
          let { length } = string;
          for (let i = 0; i < length; ++i) {
            let cp = string.codePointAt(i);
            if (!isXmlCodePoint(cp)) {
              this.c.n(-([...string].length - i));
              throw this.a("Invalid character");
            }
            if (cp > 65535) {
              i += 1;
            }
          }
        }
      };
      function normalizeLineBreaks(text) {
        let i = 0;
        while ((i = text.indexOf("\r", i)) !== -1) {
          text = text[i + 1] === "\n" ? text.slice(0, i) + text.slice(i + 1) : text.slice(0, i) + "\n" + text.slice(i + 1);
        }
        return text;
      }
      function parseXml2(xml, options) {
        return new Parser(xml, options).document;
      }
    }
  });

  // src/diplomatic.js
  var import_parse_xml = __toESM(require_browser());

  // node_modules/@thednp/dommatrix/dist/dommatrix.mjs
  var Z = Object.defineProperty;
  var z = (s, t, e) => t in s ? Z(s, t, { enumerable: true, configurable: true, writable: true, value: e }) : s[t] = e;
  var p = (s, t, e) => z(s, typeof t != "symbol" ? t + "" : t, e);
  var $ = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    m11: 1,
    m12: 0,
    m13: 0,
    m14: 0,
    m21: 0,
    m22: 1,
    m23: 0,
    m24: 0,
    m31: 0,
    m32: 0,
    m33: 1,
    m34: 0,
    m41: 0,
    m42: 0,
    m43: 0,
    m44: 1,
    is2D: true,
    isIdentity: true
  };
  var E = (s) => (s instanceof Float64Array || s instanceof Float32Array || Array.isArray(s) && s.every((t) => typeof t == "number")) && [6, 16].some((t) => s.length === t);
  var P = (s) => s instanceof DOMMatrix || s instanceof y || typeof s == "object" && Object.keys($).every((t) => s && t in s);
  var g = (s) => {
    const t = new y(), e = Array.from(s);
    if (!E(e))
      throw TypeError(
        `CSSMatrix: "${e.join(",")}" must be an array with 6/16 numbers.`
      );
    if (e.length === 16) {
      const [
        n,
        i,
        r,
        a,
        l,
        m,
        h,
        c,
        u,
        f,
        w,
        o,
        d,
        A,
        M2,
        b
      ] = e;
      t.m11 = n, t.a = n, t.m21 = l, t.c = l, t.m31 = u, t.m41 = d, t.e = d, t.m12 = i, t.b = i, t.m22 = m, t.d = m, t.m32 = f, t.m42 = A, t.f = A, t.m13 = r, t.m23 = h, t.m33 = w, t.m43 = M2, t.m14 = a, t.m24 = c, t.m34 = o, t.m44 = b;
    } else if (e.length === 6) {
      const [n, i, r, a, l, m] = e;
      t.m11 = n, t.a = n, t.m12 = i, t.b = i, t.m21 = r, t.c = r, t.m22 = a, t.d = a, t.m41 = l, t.e = l, t.m42 = m, t.f = m;
    }
    return t;
  };
  var X = (s) => {
    if (P(s))
      return g([
        s.m11,
        s.m12,
        s.m13,
        s.m14,
        s.m21,
        s.m22,
        s.m23,
        s.m24,
        s.m31,
        s.m32,
        s.m33,
        s.m34,
        s.m41,
        s.m42,
        s.m43,
        s.m44
      ]);
    throw TypeError(
      `CSSMatrix: "${JSON.stringify(s)}" is not a DOMMatrix / CSSMatrix / JSON compatible object.`
    );
  };
  var O = (s) => {
    if (typeof s != "string")
      throw TypeError(`CSSMatrix: "${JSON.stringify(s)}" is not a string.`);
    const t = String(s).replace(/\s/g, "");
    let e = new y();
    const n = `CSSMatrix: invalid transform string "${s}"`;
    return t.split(")").filter((i) => i).forEach((i) => {
      const [r, a] = i.split("(");
      if (!a) throw TypeError(n);
      const l = a.split(",").map(
        (o) => o.includes("rad") ? parseFloat(o) * (180 / Math.PI) : parseFloat(o)
      ), [m, h, c, u] = l, f = [m, h, c], w = [m, h, c, u];
      if (r === "perspective" && m && [h, c].every((o) => o === void 0))
        e.m34 = -1 / m;
      else if (r.includes("matrix") && [6, 16].includes(l.length) && l.every((o) => !Number.isNaN(+o))) {
        const o = l.map((d) => Math.abs(d) < 1e-6 ? 0 : d);
        e = e.multiply(g(o));
      } else if (r === "translate3d" && f.every((o) => !Number.isNaN(+o)))
        e = e.translate(m, h, c);
      else if (r === "translate" && m && c === void 0)
        e = e.translate(m, h || 0, 0);
      else if (r === "rotate3d" && w.every((o) => !Number.isNaN(+o)) && u)
        e = e.rotateAxisAngle(m, h, c, u);
      else if (r === "rotate" && m && [h, c].every((o) => o === void 0))
        e = e.rotate(0, 0, m);
      else if (r === "scale3d" && f.every((o) => !Number.isNaN(+o)) && f.some((o) => o !== 1))
        e = e.scale(m, h, c);
      else if (
        // prop === "scale" && !Number.isNaN(x) && x !== 1 && z === undefined
        // prop === "scale" && !Number.isNaN(x) && [x, y].some((n) => n !== 1) &&
        r === "scale" && !Number.isNaN(m) && (m !== 1 || h !== 1) && c === void 0
      ) {
        const d = Number.isNaN(+h) ? m : h;
        e = e.scale(m, d, 1);
      } else if (r === "skew" && (m || !Number.isNaN(m) && h) && c === void 0)
        e = e.skew(m, h || 0);
      else if (["translate", "rotate", "scale", "skew"].some(
        (o) => r.includes(o)
      ) && /[XYZ]/.test(r) && m && [h, c].every((o) => o === void 0))
        if (r === "skewX" || r === "skewY")
          e = e[r](m);
        else {
          const o = r.replace(/[XYZ]/, ""), d = r.replace(o, ""), A = ["X", "Y", "Z"].indexOf(d), M2 = o === "scale" ? 1 : 0, b = [
            A === 0 ? m : M2,
            A === 1 ? m : M2,
            A === 2 ? m : M2
          ];
          e = e[o](...b);
        }
      else
        throw TypeError(n);
    }), e;
  };
  var x = (s, t) => t ? [s.a, s.b, s.c, s.d, s.e, s.f] : [
    s.m11,
    s.m12,
    s.m13,
    s.m14,
    s.m21,
    s.m22,
    s.m23,
    s.m24,
    s.m31,
    s.m32,
    s.m33,
    s.m34,
    s.m41,
    s.m42,
    s.m43,
    s.m44
  ];
  var Y = (s, t, e) => {
    const n = new y();
    return n.m41 = s, n.e = s, n.m42 = t, n.f = t, n.m43 = e, n;
  };
  var F = (s, t, e) => {
    const n = new y(), i = Math.PI / 180, r = s * i, a = t * i, l = e * i, m = Math.cos(r), h = -Math.sin(r), c = Math.cos(a), u = -Math.sin(a), f = Math.cos(l), w = -Math.sin(l), o = c * f, d = -c * w;
    n.m11 = o, n.a = o, n.m12 = d, n.b = d, n.m13 = u;
    const A = h * u * f + m * w;
    n.m21 = A, n.c = A;
    const M2 = m * f - h * u * w;
    return n.m22 = M2, n.d = M2, n.m23 = -h * c, n.m31 = h * w - m * u * f, n.m32 = h * f + m * u * w, n.m33 = m * c, n;
  };
  var T = (s, t, e, n) => {
    const i = new y(), r = Math.sqrt(s * s + t * t + e * e);
    if (r === 0)
      return i;
    const a = s / r, l = t / r, m = e / r, h = n * (Math.PI / 360), c = Math.sin(h), u = Math.cos(h), f = c * c, w = a * a, o = l * l, d = m * m, A = 1 - 2 * (o + d) * f;
    i.m11 = A, i.a = A;
    const M2 = 2 * (a * l * f + m * c * u);
    i.m12 = M2, i.b = M2, i.m13 = 2 * (a * m * f - l * c * u);
    const b = 2 * (l * a * f - m * c * u);
    i.m21 = b, i.c = b;
    const k = 1 - 2 * (d + w) * f;
    return i.m22 = k, i.d = k, i.m23 = 2 * (l * m * f + a * c * u), i.m31 = 2 * (m * a * f + l * c * u), i.m32 = 2 * (m * l * f - a * c * u), i.m33 = 1 - 2 * (w + o) * f, i;
  };
  var I = (s, t, e) => {
    const n = new y();
    return n.m11 = s, n.a = s, n.m22 = t, n.d = t, n.m33 = e, n;
  };
  var v = (s, t) => {
    const e = new y();
    if (s) {
      const n = s * Math.PI / 180, i = Math.tan(n);
      e.m21 = i, e.c = i;
    }
    if (t) {
      const n = t * Math.PI / 180, i = Math.tan(n);
      e.m12 = i, e.b = i;
    }
    return e;
  };
  var R = (s) => v(s, 0);
  var D = (s) => v(0, s);
  var N = (s, t) => {
    const e = t.m11 * s.m11 + t.m12 * s.m21 + t.m13 * s.m31 + t.m14 * s.m41, n = t.m11 * s.m12 + t.m12 * s.m22 + t.m13 * s.m32 + t.m14 * s.m42, i = t.m11 * s.m13 + t.m12 * s.m23 + t.m13 * s.m33 + t.m14 * s.m43, r = t.m11 * s.m14 + t.m12 * s.m24 + t.m13 * s.m34 + t.m14 * s.m44, a = t.m21 * s.m11 + t.m22 * s.m21 + t.m23 * s.m31 + t.m24 * s.m41, l = t.m21 * s.m12 + t.m22 * s.m22 + t.m23 * s.m32 + t.m24 * s.m42, m = t.m21 * s.m13 + t.m22 * s.m23 + t.m23 * s.m33 + t.m24 * s.m43, h = t.m21 * s.m14 + t.m22 * s.m24 + t.m23 * s.m34 + t.m24 * s.m44, c = t.m31 * s.m11 + t.m32 * s.m21 + t.m33 * s.m31 + t.m34 * s.m41, u = t.m31 * s.m12 + t.m32 * s.m22 + t.m33 * s.m32 + t.m34 * s.m42, f = t.m31 * s.m13 + t.m32 * s.m23 + t.m33 * s.m33 + t.m34 * s.m43, w = t.m31 * s.m14 + t.m32 * s.m24 + t.m33 * s.m34 + t.m34 * s.m44, o = t.m41 * s.m11 + t.m42 * s.m21 + t.m43 * s.m31 + t.m44 * s.m41, d = t.m41 * s.m12 + t.m42 * s.m22 + t.m43 * s.m32 + t.m44 * s.m42, A = t.m41 * s.m13 + t.m42 * s.m23 + t.m43 * s.m33 + t.m44 * s.m43, M2 = t.m41 * s.m14 + t.m42 * s.m24 + t.m43 * s.m34 + t.m44 * s.m44;
    return g([
      e,
      n,
      i,
      r,
      a,
      l,
      m,
      h,
      c,
      u,
      f,
      w,
      o,
      d,
      A,
      M2
    ]);
  };
  var y = class {
    /**
     * @constructor
     * @param init accepts all parameter configurations:
     * * valid CSS transform string,
     * * CSSMatrix/DOMMatrix instance,
     * * a 6/16 elements *Array*.
     */
    constructor(t) {
      return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.e = 0, this.f = 0, this.m11 = 1, this.m12 = 0, this.m13 = 0, this.m14 = 0, this.m21 = 0, this.m22 = 1, this.m23 = 0, this.m24 = 0, this.m31 = 0, this.m32 = 0, this.m33 = 1, this.m34 = 0, this.m41 = 0, this.m42 = 0, this.m43 = 0, this.m44 = 1, t ? this.setMatrixValue(t) : this;
    }
    /**
     * A `Boolean` whose value is `true` if the matrix is the identity matrix. The identity
     * matrix is one in which every value is 0 except those on the main diagonal from top-left
     * to bottom-right corner (in other words, where the offsets in each direction are equal).
     *
     * @return the current property value
     */
    get isIdentity() {
      return this.m11 === 1 && this.m12 === 0 && this.m13 === 0 && this.m14 === 0 && this.m21 === 0 && this.m22 === 1 && this.m23 === 0 && this.m24 === 0 && this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 && this.m41 === 0 && this.m42 === 0 && this.m43 === 0 && this.m44 === 1;
    }
    /**
     * A `Boolean` flag whose value is `true` if the matrix was initialized as a 2D matrix
     * and `false` if the matrix is 3D.
     *
     * @return the current property value
     */
    get is2D() {
      return this.m31 === 0 && this.m32 === 0 && this.m33 === 1 && this.m34 === 0 && this.m43 === 0 && this.m44 === 1;
    }
    /**
     * The `setMatrixValue` method replaces the existing matrix with one computed
     * in the browser. EG: `matrix(1,0.25,-0.25,1,0,0)`
     *
     * The method accepts any *Array* values, the result of
     * `DOMMatrix` instance method `toFloat64Array()` / `toFloat32Array()` calls
     * or `CSSMatrix` instance method `toArray()`.
     *
     * This method expects valid *matrix()* / *matrix3d()* string values, as well
     * as other transform functions like *translateX(10px)*.
     *
     * @param source
     * @return the matrix instance
     */
    setMatrixValue(t) {
      return typeof t == "string" && t.length && t !== "none" ? O(t) : Array.isArray(t) || t instanceof Float64Array || t instanceof Float32Array ? g(t) : typeof t == "object" ? X(t) : this;
    }
    /**
     * Returns a *Float32Array* containing elements which comprise the matrix.
     * The method can return either the 16 elements or the 6 elements
     * depending on the value of the `is2D` parameter.
     *
     * @param is2D *Array* representation of the matrix
     * @return an *Array* representation of the matrix
     */
    toFloat32Array(t) {
      return Float32Array.from(x(this, t));
    }
    /**
     * Returns a *Float64Array* containing elements which comprise the matrix.
     * The method can return either the 16 elements or the 6 elements
     * depending on the value of the `is2D` parameter.
     *
     * @param is2D *Array* representation of the matrix
     * @return an *Array* representation of the matrix
     */
    toFloat64Array(t) {
      return Float64Array.from(x(this, t));
    }
    /**
     * Creates and returns a string representation of the matrix in `CSS` matrix syntax,
     * using the appropriate `CSS` matrix notation.
     *
     * matrix3d *matrix3d(m11, m12, m13, m14, m21, ...)*
     * matrix *matrix(a, b, c, d, e, f)*
     *
     * @return a string representation of the matrix
     */
    toString() {
      const { is2D: t } = this, e = this.toFloat64Array(t).join(", ");
      return `${t ? "matrix" : "matrix3d"}(${e})`;
    }
    /**
     * Returns a JSON representation of the `CSSMatrix` instance, a standard *Object*
     * that includes `{a,b,c,d,e,f}` and `{m11,m12,m13,..m44}` properties as well
     * as the `is2D` & `isIdentity` properties.
     *
     * The result can also be used as a second parameter for the `fromMatrix` static method
     * to load values into another matrix instance.
     *
     * @return an *Object* with all matrix values.
     */
    toJSON() {
      const { is2D: t, isIdentity: e } = this;
      return { ...this, is2D: t, isIdentity: e };
    }
    /**
     * The Multiply method returns a new CSSMatrix which is the result of this
     * matrix multiplied by the passed matrix, with the passed matrix to the right.
     * This matrix is not modified.
     *
     * @param m2 CSSMatrix
     * @return The resulted matrix.
     */
    multiply(t) {
      return N(this, t);
    }
    /**
     * The translate method returns a new matrix which is this matrix post
     * multiplied by a translation matrix containing the passed values. If the z
     * component is undefined, a 0 value is used in its place. This matrix is not
     * modified.
     *
     * @param x X component of the translation value.
     * @param y Y component of the translation value.
     * @param z Z component of the translation value.
     * @return The resulted matrix
     */
    translate(t, e, n) {
      const i = t;
      let r = e, a = n;
      return typeof r > "u" && (r = 0), typeof a > "u" && (a = 0), N(this, Y(i, r, a));
    }
    /**
     * The scale method returns a new matrix which is this matrix post multiplied by
     * a scale matrix containing the passed values. If the z component is undefined,
     * a 1 value is used in its place. If the y component is undefined, the x
     * component value is used in its place. This matrix is not modified.
     *
     * @param x The X component of the scale value.
     * @param y The Y component of the scale value.
     * @param z The Z component of the scale value.
     * @return The resulted matrix
     */
    scale(t, e, n) {
      const i = t;
      let r = e, a = n;
      return typeof r > "u" && (r = t), typeof a > "u" && (a = 1), N(this, I(i, r, a));
    }
    /**
     * The rotate method returns a new matrix which is this matrix post multiplied
     * by each of 3 rotation matrices about the major axes, first X, then Y, then Z.
     * If the y and z components are undefined, the x value is used to rotate the
     * object about the z axis, as though the vector (0,0,x) were passed. All
     * rotation values are in degrees. This matrix is not modified.
     *
     * @param rx The X component of the rotation, or Z if Y and Z are null.
     * @param ry The (optional) Y component of the rotation value.
     * @param rz The (optional) Z component of the rotation value.
     * @return The resulted matrix
     */
    rotate(t, e, n) {
      let i = t, r = e || 0, a = n || 0;
      return typeof t == "number" && typeof e > "u" && typeof n > "u" && (a = i, i = 0, r = 0), N(this, F(i, r, a));
    }
    /**
     * The rotateAxisAngle method returns a new matrix which is this matrix post
     * multiplied by a rotation matrix with the given axis and `angle`. The right-hand
     * rule is used to determine the direction of rotation. All rotation values are
     * in degrees. This matrix is not modified.
     *
     * @param x The X component of the axis vector.
     * @param y The Y component of the axis vector.
     * @param z The Z component of the axis vector.
     * @param angle The angle of rotation about the axis vector, in degrees.
     * @return The resulted matrix
     */
    rotateAxisAngle(t, e, n, i) {
      if ([t, e, n, i].some((r) => Number.isNaN(+r)))
        throw new TypeError("CSSMatrix: expecting 4 values");
      return N(this, T(t, e, n, i));
    }
    /**
     * Specifies a skew transformation along the `x-axis` by the given angle.
     * This matrix is not modified.
     *
     * @param angle The angle amount in degrees to skew.
     * @return The resulted matrix
     */
    skewX(t) {
      return N(this, R(t));
    }
    /**
     * Specifies a skew transformation along the `y-axis` by the given angle.
     * This matrix is not modified.
     *
     * @param angle The angle amount in degrees to skew.
     * @return The resulted matrix
     */
    skewY(t) {
      return N(this, D(t));
    }
    /**
     * Specifies a skew transformation along both the `x-axis` and `y-axis`.
     * This matrix is not modified.
     *
     * @param angleX The X-angle amount in degrees to skew.
     * @param angleY The angle amount in degrees to skew.
     * @return The resulted matrix
     */
    skew(t, e) {
      return N(this, v(t, e));
    }
    /**
     * Transforms a specified vector using the matrix, returning a new
     * {x,y,z,w} Tuple *Object* comprising the transformed vector.
     * Neither the matrix nor the original vector are altered.
     *
     * The method is equivalent with `transformPoint()` method
     * of the `DOMMatrix` constructor.
     *
     * @param t Tuple with `{x,y,z,w}` components
     * @return the resulting Tuple
     */
    transformPoint(t) {
      const e = this.m11 * t.x + this.m21 * t.y + this.m31 * t.z + this.m41 * t.w, n = this.m12 * t.x + this.m22 * t.y + this.m32 * t.z + this.m42 * t.w, i = this.m13 * t.x + this.m23 * t.y + this.m33 * t.z + this.m43 * t.w, r = this.m14 * t.x + this.m24 * t.y + this.m34 * t.z + this.m44 * t.w;
      return t instanceof DOMPoint ? new DOMPoint(e, n, i, r) : {
        x: e,
        y: n,
        z: i,
        w: r
      };
    }
  };
  p(y, "Translate", Y), p(y, "Rotate", F), p(y, "RotateAxisAngle", T), p(y, "Scale", I), p(y, "SkewX", R), p(y, "SkewY", D), p(y, "Skew", v), p(y, "Multiply", N), p(y, "fromArray", g), p(y, "fromMatrix", X), p(y, "fromString", O), p(y, "toArray", x), p(y, "isCompatibleArray", E), p(y, "isCompatibleObject", P);

  // node_modules/svg-path-commander/dist/svg-path-commander.mjs
  var Bt = (t, e, n) => {
    let [o, r] = t, [s, a] = e;
    return [o + (s - o) * n, r + (a - r) * n];
  };
  var E2 = Bt;
  var $t = (t, e) => Math.sqrt((t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1]));
  var re = $t;
  var ce = (t, e, n, o) => re([t, e], [n, o]);
  var Le = (t, e, n, o, r) => {
    let s = { x: t, y: e };
    if (typeof r == "number") {
      let a = re([t, e], [n, o]);
      if (r <= 0) s = { x: t, y: e };
      else if (r >= a) s = { x: n, y: o };
      else {
        let [i, m] = E2([t, e], [n, o], r / a);
        s = { x: i, y: m };
      }
    }
    return s;
  };
  var Ge = (t, e, n, o) => {
    let { min: r, max: s } = Math;
    return [r(t, n), r(e, o), s(t, n), s(e, o)];
  };
  var ot = { getLineBBox: Ge, getLineLength: ce, getPointAtLineLength: Le };
  var st = (t, e, n) => {
    let o = n / 2, r = Math.sin(o), s = Math.cos(o), a = t ** 2 * r ** 2, i = e ** 2 * s ** 2, m = Math.sqrt(a + i) * n;
    return Math.abs(m);
  };
  var pe = (t, e, n, o, r, s) => {
    let { sin: a, cos: i } = Math, m = i(r), u = a(r), l = n * i(s), c = o * a(s);
    return [t + m * l - u * c, e + u * l + m * c];
  };
  var at = (t, e) => {
    let { x: n, y: o } = t, { x: r, y: s } = e, a = n * r + o * s, i = Math.sqrt((n ** 2 + o ** 2) * (r ** 2 + s ** 2));
    return (n * s - o * r < 0 ? -1 : 1) * Math.acos(a / i);
  };
  var _e = (t, e, n, o, r, s, a, i, m) => {
    let { abs: u, sin: l, cos: c, sqrt: f, PI: g2 } = Math, p2 = u(n), h = u(o), S = (r % 360 + 360) % 360 * (g2 / 180);
    if (t === i && e === m) return { rx: p2, ry: h, startAngle: 0, endAngle: 0, center: { x: i, y: m } };
    if (p2 === 0 || h === 0) return { rx: p2, ry: h, startAngle: 0, endAngle: 0, center: { x: (i + t) / 2, y: (m + e) / 2 } };
    let A = (t - i) / 2, d = (e - m) / 2, b = { x: c(S) * A + l(S) * d, y: -l(S) * A + c(S) * d }, P2 = b.x ** 2 / p2 ** 2 + b.y ** 2 / h ** 2;
    P2 > 1 && (p2 *= f(P2), h *= f(P2));
    let C = p2 ** 2 * h ** 2 - p2 ** 2 * b.y ** 2 - h ** 2 * b.x ** 2, V = p2 ** 2 * b.y ** 2 + h ** 2 * b.x ** 2, k = C / V;
    k = k < 0 ? 0 : k;
    let w = (s !== a ? 1 : -1) * f(k), v2 = { x: w * (p2 * b.y / h), y: w * (-(h * b.x) / p2) }, j = { x: c(S) * v2.x - l(S) * v2.y + (t + i) / 2, y: l(S) * v2.x + c(S) * v2.y + (e + m) / 2 }, ue = { x: (b.x - v2.x) / p2, y: (b.y - v2.y) / h }, q = at({ x: 1, y: 0 }, ue), x2 = { x: (-b.x - v2.x) / p2, y: (-b.y - v2.y) / h }, Q = at(ue, x2);
    !a && Q > 0 ? Q -= 2 * g2 : a && Q < 0 && (Q += 2 * g2), Q %= 2 * g2;
    let H = q + Q;
    return { center: j, startAngle: q, endAngle: H, rx: p2, ry: h };
  };
  var ve = (t, e, n, o, r, s, a, i, m) => {
    let { rx: u, ry: l, startAngle: c, endAngle: f } = _e(t, e, n, o, r, s, a, i, m);
    return st(u, l, f - c);
  };
  var mt = (t, e, n, o, r, s, a, i, m, u) => {
    let l = { x: t, y: e }, { center: c, rx: f, ry: g2, startAngle: p2, endAngle: h } = _e(t, e, n, o, r, s, a, i, m);
    if (typeof u == "number") {
      let y2 = st(f, g2, h - p2);
      if (u <= 0) l = { x: t, y: e };
      else if (u >= y2) l = { x: i, y: m };
      else {
        if (t === i && e === m) return { x: i, y: m };
        if (f === 0 || g2 === 0) return Le(t, e, i, m, u);
        let { PI: S, cos: A, sin: d } = Math, b = h - p2, C = (r % 360 + 360) % 360 * (S / 180), V = p2 + b * (u / y2), k = f * A(V), w = g2 * d(V);
        l = { x: A(C) * k - d(C) * w + c.x, y: d(C) * k + A(C) * w + c.y };
      }
    }
    return l;
  };
  var it = (t, e, n, o, r, s, a, i, m) => {
    let { center: u, rx: l, ry: c, startAngle: f, endAngle: g2 } = _e(t, e, n, o, r, s, a, i, m), p2 = g2 - f, { min: h, max: y2, tan: S, atan2: A, PI: d } = Math, { x: b, y: P2 } = u, C = r * d / 180, V = S(C), k = A(-c * V, l), w = k, v2 = k + d, j = A(c, l * V), ue = j + d, q = [i], x2 = [m], Q = h(t, i), H = y2(t, i), I2 = h(e, m), W = y2(e, m), ye = g2 - p2 * 1e-5, le = pe(b, P2, l, c, C, ye), N2 = g2 - p2 * 0.99999, D2 = pe(b, P2, l, c, C, N2);
    if (le[0] > H || D2[0] > H) {
      let z2 = pe(b, P2, l, c, C, w);
      q.push(z2[0]), x2.push(z2[1]);
    }
    if (le[0] < Q || D2[0] < Q) {
      let z2 = pe(b, P2, l, c, C, v2);
      q.push(z2[0]), x2.push(z2[1]);
    }
    if (le[1] < I2 || D2[1] < I2) {
      let z2 = pe(b, P2, l, c, C, ue);
      q.push(z2[0]), x2.push(z2[1]);
    }
    if (le[1] > W || D2[1] > W) {
      let z2 = pe(b, P2, l, c, C, j);
      q.push(z2[0]), x2.push(z2[1]);
    }
    return Q = h.apply([], q), I2 = h.apply([], x2), H = y2.apply([], q), W = y2.apply([], x2), [Q, I2, H, W];
  };
  var ut = { angleBetween: at, arcLength: st, arcPoint: pe, getArcBBox: it, getArcLength: ve, getArcProps: _e, getPointAtArcLength: mt };
  var lt = [-0.06405689286260563, 0.06405689286260563, -0.1911188674736163, 0.1911188674736163, -0.3150426796961634, 0.3150426796961634, -0.4337935076260451, 0.4337935076260451, -0.5454214713888396, 0.5454214713888396, -0.6480936519369755, 0.6480936519369755, -0.7401241915785544, 0.7401241915785544, -0.820001985973903, 0.820001985973903, -0.8864155270044011, 0.8864155270044011, -0.9382745520027328, 0.9382745520027328, -0.9747285559713095, 0.9747285559713095, -0.9951872199970213, 0.9951872199970213];
  var zt = [0.12793819534675216, 0.12793819534675216, 0.1258374563468283, 0.1258374563468283, 0.12167047292780339, 0.12167047292780339, 0.1155056680537256, 0.1155056680537256, 0.10744427011596563, 0.10744427011596563, 0.09761865210411388, 0.09761865210411388, 0.08619016153195327, 0.08619016153195327, 0.0733464814110803, 0.0733464814110803, 0.05929858491543678, 0.05929858491543678, 0.04427743881741981, 0.04427743881741981, 0.028531388628933663, 0.028531388628933663, 0.0123412297999872, 0.0123412297999872];
  var Vt = (t) => {
    let e = [];
    for (let n = t, o = n.length, r = o - 1; o > 1; o -= 1, r -= 1) {
      let s = [];
      for (let a = 0; a < r; a += 1) s.push({ x: r * (n[a + 1].x - n[a].x), y: r * (n[a + 1].y - n[a].y), t: 0 });
      e.push(s), n = s;
    }
    return e;
  };
  var Rt = (t, e) => {
    if (e === 0) return t[0].t = 0, t[0];
    let n = t.length - 1;
    if (e === 1) return t[n].t = 1, t[n];
    let o = 1 - e, r = t;
    if (n === 0) return t[0].t = e, t[0];
    if (n === 1) return { x: o * r[0].x + e * r[1].x, y: o * r[0].y + e * r[1].y, t: e };
    let s = o * o, a = e * e, i = 0, m = 0, u = 0, l = 0;
    return n === 2 ? (r = [r[0], r[1], r[2], { x: 0, y: 0 }], i = s, m = o * e * 2, u = a) : n === 3 && (i = s * o, m = s * e * 3, u = o * a * 3, l = e * a), { x: i * r[0].x + m * r[1].x + u * r[2].x + l * r[3].x, y: i * r[0].y + m * r[1].y + u * r[2].y + l * r[3].y, t: e };
  };
  var kt = (t, e) => {
    let n = t(e), o = n.x * n.x + n.y * n.y;
    return Math.sqrt(o);
  };
  var qt = (t) => {
    let n = lt.length, o = 0;
    for (let r = 0, s; r < n; r++) s = 0.5 * lt[r] + 0.5, o += zt[r] * kt(t, s);
    return 0.5 * o;
  };
  var fe = (t) => {
    let e = [];
    for (let o = 0, r = t.length, s = 2; o < r; o += s) e.push({ x: t[o], y: t[o + 1] });
    let n = Vt(e);
    return qt((o) => Rt(n[0], o));
  };
  var Qt = 1e-8;
  var Ne = ([t, e, n]) => {
    let o = Math.min(t, n), r = Math.max(t, n);
    if (e >= t ? n >= e : n <= e) return [o, r];
    let s = (t * n - e * e) / (t - 2 * e + n);
    return s < o ? [s, r] : [o, s];
  };
  var Ue = ([t, e, n, o]) => {
    let r = t - 3 * e + 3 * n - o;
    if (Math.abs(r) < Qt) return t === o && t === e ? [t, o] : Ne([t, -0.5 * t + 1.5 * e, t - 3 * e + 3 * n]);
    let s = -t * n + t * o - e * n - e * o + e * e + n * n;
    if (s <= 0) return [Math.min(t, o), Math.max(t, o)];
    let a = Math.sqrt(s), i = Math.min(t, o), m = Math.max(t, o), u = t - 2 * e + n;
    for (let l = (u + a) / r, c = 1; c <= 2; l = (u - a) / r, c++) {
      if (l > 0 && l < 1) {
        let f = t * (1 - l) * (1 - l) * (1 - l) + e * 3 * (1 - l) * (1 - l) * l + n * 3 * (1 - l) * l * l + o * l * l * l;
        f < i && (i = f), f > m && (m = f);
      }
    }
    return [i, m];
  };
  var ct = { bezierLength: qt, calculateBezier: kt, CBEZIER_MINMAX_EPSILON: Qt, computeBezier: Rt, Cvalues: zt, deriveBezier: Vt, getBezierLength: fe, minmaxC: Ue, minmaxQ: Ne, Tvalues: lt };
  var Dt = ([t, e, n, o, r, s, a, i], m) => {
    let u = 1 - m;
    return { x: u ** 3 * t + 3 * u ** 2 * m * n + 3 * u * m ** 2 * r + m ** 3 * a, y: u ** 3 * e + 3 * u ** 2 * m * o + 3 * u * m ** 2 * s + m ** 3 * i };
  };
  var Pe = (t, e, n, o, r, s, a, i) => fe([t, e, n, o, r, s, a, i]);
  var pt = (t, e, n, o, r, s, a, i, m) => {
    let u = typeof m == "number", l = { x: t, y: e };
    if (u) {
      let c = fe([t, e, n, o, r, s, a, i]);
      m <= 0 || (m >= c ? l = { x: a, y: i } : l = Dt([t, e, n, o, r, s, a, i], m / c));
    }
    return l;
  };
  var Fe = (t, e, n, o, r, s, a, i) => {
    let m = Ue([t, n, r, a]), u = Ue([e, o, s, i]);
    return [m[0], u[0], m[1], u[1]];
  };
  var ft = { getCubicBBox: Fe, getCubicLength: Pe, getPointAtCubicLength: pt, getPointAtCubicSegmentLength: Dt };
  var Et = ([t, e, n, o, r, s], a) => {
    let i = 1 - a;
    return { x: i ** 2 * t + 2 * i * a * n + a ** 2 * r, y: i ** 2 * e + 2 * i * a * o + a ** 2 * s };
  };
  var xe = (t, e, n, o, r, s) => fe([t, e, n, o, r, s]);
  var gt = (t, e, n, o, r, s, a) => {
    let i = typeof a == "number", m = { x: t, y: e };
    if (i) {
      let u = fe([t, e, n, o, r, s]);
      a <= 0 || (a >= u ? m = { x: r, y: s } : m = Et([t, e, n, o, r, s], a / u));
    }
    return m;
  };
  var Ke = (t, e, n, o, r, s) => {
    let a = Ne([t, n, r]), i = Ne([e, o, s]);
    return [a[0], i[0], a[1], i[1]];
  };
  var ht = { getPointAtQuadLength: gt, getPointAtQuadSegmentLength: Et, getQuadBBox: Ke, getQuadLength: xe };
  var jt = (t) => {
    let e = t.length, n = -1, o, r = t[e - 1], s = 0;
    for (; ++n < e; ) o = r, r = t[n], s += o[1] * r[0] - o[0] * r[1];
    return s / 2;
  };
  var Ht = (t) => t.reduce((e, n, o) => o ? e + re(t[o - 1], n) : 0, 0);
  var bt = { polygonArea: jt, polygonLength: Ht };
  var Zt = (t, e, n) => {
    let { sin: o, cos: r } = Math, s = t * r(n) - e * o(n), a = t * o(n) + e * r(n);
    return { x: s, y: a };
  };
  var ne = Zt;
  var Gt = (t, e) => {
    let n = e >= 1 ? 10 ** e : 1;
    return e > 0 ? Math.round(t * n) / n : Math.round(t);
  };
  var M = Gt;
  var _t = { origin: [0, 0, 0], round: 4 };
  var O2 = _t;
  var Ut = { a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0 };
  var Z2 = Ut;
  var Ft = (t) => {
    let e = t.pathValue[t.segmentStart], n = e.toLowerCase(), { data: o } = t;
    for (; o.length >= Z2[n] && (n === "m" && o.length > 2 ? (t.segments.push([e].concat(o.splice(0, 2))), n = "l", e = e === "m" ? "l" : "L") : t.segments.push([e].concat(o.splice(0, Z2[n]))), !!Z2[n]); ) ;
  };
  var Se = Ft;
  var Kt = "SVGPathCommander Error";
  var R2 = Kt;
  var Jt = (t) => {
    let { index: e, pathValue: n } = t, o = n.charCodeAt(e);
    if (o === 48) {
      t.param = 0, t.index += 1;
      return;
    }
    if (o === 49) {
      t.param = 1, t.index += 1;
      return;
    }
    t.err = `${R2}: invalid Arc flag "${n[e]}", expecting 0 or 1 at index ${e}`;
  };
  var we = Jt;
  var Wt = (t) => t >= 48 && t <= 57;
  var B = Wt;
  var Xt = "Invalid path value";
  var $2 = Xt;
  var Yt = (t) => {
    let { max: e, pathValue: n, index: o } = t, r = o, s = false, a = false, i = false, m = false, u;
    if (r >= e) {
      t.err = `${R2}: ${$2} at index ${r}, "pathValue" is missing param`;
      return;
    }
    if (u = n.charCodeAt(r), (u === 43 || u === 45) && (r += 1, u = n.charCodeAt(r)), !B(u) && u !== 46) {
      t.err = `${R2}: ${$2} at index ${r}, "${n[r]}" is not a number`;
      return;
    }
    if (u !== 46) {
      if (s = u === 48, r += 1, u = n.charCodeAt(r), s && r < e && u && B(u)) {
        t.err = `${R2}: ${$2} at index ${o}, "${n[o]}" illegal number`;
        return;
      }
      for (; r < e && B(n.charCodeAt(r)); ) r += 1, a = true;
      u = n.charCodeAt(r);
    }
    if (u === 46) {
      for (m = true, r += 1; B(n.charCodeAt(r)); ) r += 1, i = true;
      u = n.charCodeAt(r);
    }
    if (u === 101 || u === 69) {
      if (m && !a && !i) {
        t.err = `${R2}: ${$2} at index ${r}, "${n[r]}" invalid float exponent`;
        return;
      }
      if (r += 1, u = n.charCodeAt(r), (u === 43 || u === 45) && (r += 1), r < e && B(n.charCodeAt(r))) for (; r < e && B(n.charCodeAt(r)); ) r += 1;
      else {
        t.err = `${R2}: ${$2} at index ${r}, "${n[r]}" invalid integer exponent`;
        return;
      }
    }
    t.index = r, t.param = +t.pathValue.slice(o, r);
  };
  var ze = Yt;
  var er = (t) => [5760, 6158, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279, 10, 13, 8232, 8233, 32, 9, 11, 12, 160].includes(t);
  var Ve = er;
  var tr = (t) => {
    let { pathValue: e, max: n } = t;
    for (; t.index < n && Ve(e.charCodeAt(t.index)); ) t.index += 1;
  };
  var G = tr;
  var rr = (t) => {
    switch (t | 32) {
      case 109:
      case 122:
      case 108:
      case 104:
      case 118:
      case 99:
      case 115:
      case 113:
      case 116:
      case 97:
        return true;
      default:
        return false;
    }
  };
  var Re = rr;
  var nr = (t) => B(t) || t === 43 || t === 45 || t === 46;
  var ke = nr;
  var or = (t) => (t | 32) === 97;
  var qe = or;
  var ar = (t) => {
    switch (t | 32) {
      case 109:
      case 77:
        return true;
      default:
        return false;
    }
  };
  var Qe = ar;
  var sr = (t) => {
    let { max: e, pathValue: n, index: o, segments: r } = t, s = n.charCodeAt(o), a = Z2[n[o].toLowerCase()];
    if (t.segmentStart = o, !Re(s)) {
      t.err = `${R2}: ${$2} "${n[o]}" is not a path command at index ${o}`;
      return;
    }
    let i = r[r.length - 1];
    if (!Qe(s) && i?.[0]?.toLocaleLowerCase() === "z") {
      t.err = `${R2}: ${$2} "${n[o]}" is not a MoveTo path command at index ${o}`;
      return;
    }
    if (t.index += 1, G(t), t.data = [], !a) {
      Se(t);
      return;
    }
    for (; ; ) {
      for (let m = a; m > 0; m -= 1) {
        if (qe(s) && (m === 3 || m === 4) ? we(t) : ze(t), t.err.length) return;
        t.data.push(t.param), G(t), t.index < e && n.charCodeAt(t.index) === 44 && (t.index += 1, G(t));
      }
      if (t.index >= t.max || !ke(n.charCodeAt(t.index))) break;
    }
    Se(t);
  };
  var ge = sr;
  var F2 = class {
    constructor(e) {
      this.segments = [], this.pathValue = e, this.max = e.length, this.index = 0, this.param = 0, this.segmentStart = 0, this.data = [], this.err = "";
    }
  };
  var mr = (t) => {
    if (typeof t != "string") return t.slice(0);
    let e = new F2(t);
    for (G(e); e.index < e.max && !e.err.length; ) ge(e);
    if (!e.err.length) e.segments.length && (e.segments[0][0] = "M");
    else throw TypeError(e.err);
    return e.segments;
  };
  var L = mr;
  var ir = (t, e, n, o) => {
    let [r] = t, s = r.toUpperCase(), a = s === r;
    if (e === 0 || a) return t;
    if (s === "A") return [s, t[1], t[2], t[3], t[4], t[5], t[6] + n, t[7] + o];
    if (s === "V") return [s, t[1] + o];
    if (s === "H") return [s, t[1] + n];
    if (s === "L") return [s, t[1] + n, t[2] + o];
    {
      let i = [], m = t.length;
      for (let u = 1; u < m; u += 1) i.push(t[u] + (u % 2 ? n : o));
      return [s].concat(i);
    }
  };
  var _ = ir;
  var ur = (t, e) => {
    let n = t.length, o, r = "M", s = "M", a = false, i = 0, m = 0, u = 0, l = 0, c = 0;
    for (let f = 0; f < n; f += 1) {
      o = t[f], [r] = o, c = o.length, s = r.toUpperCase(), a = s !== r;
      let g2 = e(o, f, i, m);
      if (g2 === false) break;
      s === "Z" ? (i = u, m = l) : s === "H" ? i = o[1] + (a ? i : 0) : s === "V" ? m = o[1] + (a ? m : 0) : (i = o[c - 2] + (a ? i : 0), m = o[c - 1] + (a ? m : 0), s === "M" && (u = i, l = m)), g2 && (t[f] = g2, g2[0] === "C" && (n = t.length));
    }
    return t;
  };
  var T2 = ur;
  var lr = (t) => {
    let e = L(t);
    return T2(e, _);
  };
  var oe = lr;
  var cr = (t, e, n, o) => {
    let [r] = t, s = r.toLowerCase(), a = r === s;
    if (e === 0 || a) return t;
    if (s === "a") return [s, t[1], t[2], t[3], t[4], t[5], t[6] - n, t[7] - o];
    if (s === "v") return [s, t[1] - o];
    if (s === "h") return [s, t[1] - n];
    if (s === "l") return [s, t[1] - n, t[2] - o];
    {
      let i = [], m = t.length;
      for (let u = 1; u < m; u += 1) i.push(t[u] - (u % 2 ? n : o));
      return [s].concat(i);
    }
  };
  var he = cr;
  var pr = (t) => {
    let e = L(t);
    return T2(e, he);
  };
  var Je = pr;
  var Ot = (t, e, n, o, r, s, a, i, m, u) => {
    let l = t, c = e, f = n, g2 = o, p2 = i, h = m, y2 = Math.PI * 120 / 180, S = Math.PI / 180 * (+r || 0), A = [], d, b, P2, C, V;
    if (u) [b, P2, C, V] = u;
    else {
      d = ne(l, c, -S), l = d.x, c = d.y, d = ne(p2, h, -S), p2 = d.x, h = d.y;
      let N2 = (l - p2) / 2, D2 = (c - h) / 2, z2 = N2 * N2 / (f * f) + D2 * D2 / (g2 * g2);
      z2 > 1 && (z2 = Math.sqrt(z2), f *= z2, g2 *= z2);
      let rt = f * f, nt = g2 * g2, wt = (s === a ? -1 : 1) * Math.sqrt(Math.abs((rt * nt - rt * D2 * D2 - nt * N2 * N2) / (rt * D2 * D2 + nt * N2 * N2)));
      C = wt * f * D2 / g2 + (l + p2) / 2, V = wt * -g2 * N2 / f + (c + h) / 2, b = Math.asin(((c - V) / g2 * 10 ** 9 >> 0) / 10 ** 9), P2 = Math.asin(((h - V) / g2 * 10 ** 9 >> 0) / 10 ** 9), b = l < C ? Math.PI - b : b, P2 = p2 < C ? Math.PI - P2 : P2, b < 0 && (b = Math.PI * 2 + b), P2 < 0 && (P2 = Math.PI * 2 + P2), a && b > P2 && (b -= Math.PI * 2), !a && P2 > b && (P2 -= Math.PI * 2);
    }
    let k = P2 - b;
    if (Math.abs(k) > y2) {
      let N2 = P2, D2 = p2, z2 = h;
      P2 = b + y2 * (a && P2 > b ? 1 : -1), p2 = C + f * Math.cos(P2), h = V + g2 * Math.sin(P2), A = Ot(p2, h, f, g2, r, 0, a, D2, z2, [P2, N2, C, V]);
    }
    k = P2 - b;
    let w = Math.cos(b), v2 = Math.sin(b), j = Math.cos(P2), ue = Math.sin(P2), q = Math.tan(k / 4), x2 = 4 / 3 * f * q, Q = 4 / 3 * g2 * q, H = [l, c], I2 = [l + x2 * v2, c - Q * w], W = [p2 + x2 * ue, h - Q * j], ye = [p2, h];
    if (I2[0] = 2 * H[0] - I2[0], I2[1] = 2 * H[1] - I2[1], u) return [I2[0], I2[1], W[0], W[1], ye[0], ye[1]].concat(A);
    A = [I2[0], I2[1], W[0], W[1], ye[0], ye[1]].concat(A);
    let le = [];
    for (let N2 = 0, D2 = A.length; N2 < D2; N2 += 1) le[N2] = N2 % 2 ? ne(A[N2 - 1], A[N2], S).y : ne(A[N2], A[N2 + 1], S).x;
    return le;
  };
  var be = Ot;
  var fr = (t, e, n, o, r, s) => {
    let a = 0.3333333333333333, i = 2 / 3;
    return [a * t + i * n, a * e + i * o, a * r + i * n, a * s + i * o, r, s];
  };
  var De = fr;
  var gr = (t, e, n, o) => {
    let r = E2([t, e], [n, o], 0.3333333333333333), s = E2([t, e], [n, o], 2 / 3);
    return [r[0], r[1], s[0], s[1], n, o];
  };
  var Ae = gr;
  var hr = (t, e) => {
    let [n] = t, o = t.slice(1).map(Number), [r, s] = o, { x1: a, y1: i, x: m, y: u } = e;
    return "TQ".includes(n) || (e.qx = null, e.qy = null), n === "M" ? (e.x = r, e.y = s, t) : n === "A" ? ["C"].concat(be(a, i, o[0], o[1], o[2], o[3], o[4], o[5], o[6])) : n === "Q" ? (e.qx = r, e.qy = s, ["C"].concat(De(a, i, o[0], o[1], o[2], o[3]))) : n === "L" ? ["C"].concat(Ae(a, i, r, s)) : n === "Z" ? ["C"].concat(Ae(a, i, m, u)) : t;
  };
  var Ee = hr;
  var br = (t, e) => {
    let [n] = t, o = n.toUpperCase(), r = n !== o, { x1: s, y1: a, x2: i, y2: m, x: u, y: l } = e, c = t.slice(1), f = c.map((g2, p2) => g2 + (r ? p2 % 2 ? l : u : 0));
    "TQ".includes(o) || (e.qx = null, e.qy = null);
    if (o === "A") return f = c.slice(0, -2).concat(c[5] + (r ? u : 0), c[6] + (r ? l : 0)), ["A"].concat(f);
    if (o === "H") return ["L", t[1] + (r ? u : 0), a];
    if (o === "V") return ["L", s, t[1] + (r ? l : 0)];
    if (o === "L") return ["L", t[1] + (r ? u : 0), t[2] + (r ? l : 0)];
    if (o === "M") return ["M", t[1] + (r ? u : 0), t[2] + (r ? l : 0)];
    if (o === "C") return ["C"].concat(f);
    if (o === "S") {
      let g2 = s * 2 - i, p2 = a * 2 - m;
      return e.x1 = g2, e.y1 = p2, ["C", g2, p2].concat(f);
    } else if (o === "T") {
      let g2 = s * 2 - (e.qx ? e.qx : 0), p2 = a * 2 - (e.qy ? e.qy : 0);
      return e.qx = g2, e.qy = p2, ["Q", g2, p2].concat(f);
    } else if (o === "Q") {
      let [g2, p2] = f;
      return e.qx = g2, e.qy = p2, ["Q"].concat(f);
    } else if (o === "Z") return ["Z"];
    return t;
  };
  var X2 = br;
  var dr = { x1: 0, y1: 0, x2: 0, y2: 0, x: 0, y: 0, qx: null, qy: null };
  var U = dr;
  var yr = (t) => {
    let e = { ...U }, n = L(t);
    return T2(n, (o, r, s, a) => {
      e.x = s, e.y = a;
      let i = X2(o, e), m = Ee(i, e);
      m[0] === "C" && m.length > 7 && (n.splice(r + 1, 0, ["C"].concat(m.slice(7))), m = m.slice(0, 7));
      let l = m.length;
      return e.x1 = +m[l - 2], e.y1 = +m[l - 1], e.x2 = +m[l - 4] || e.x1, e.y2 = +m[l - 3] || e.y1, m;
    });
  };
  var ae = yr;
  var Pr = (t, e) => {
    let n = t.length, { round: o } = O2, r = t[0], s = "";
    o = e === "off" || typeof e == "number" && e >= 0 ? e : typeof o == "number" && o >= 0 ? o : "off";
    for (let a = 0; a < n; a += 1) {
      r = t[a];
      let [i] = r, m = r.slice(1);
      if (s += i, o === "off") s += m.join(" ");
      else {
        let u = 0, l = m.length;
        for (; u < l; ) s += M(m[u], o), u !== l - 1 && (s += " "), u += 1;
      }
    }
    return s;
  };
  var Ce = Pr;
  var xr = (t) => {
    if (!t) return { x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0, cx: 0, cy: 0, cz: 0 };
    let e = L(t), n = "M", o = 0, r = 0, { max: s, min: a } = Math, i = 1 / 0, m = 1 / 0, u = -1 / 0, l = -1 / 0, c = 0, f = 0, g2 = 0, p2 = 0, h = 0, y2 = 0, S = 0, A = 0, d = 0, b = 0;
    T2(e, (V, k, w, v2) => {
      [n] = V;
      let j = n.toUpperCase(), q = j !== n ? _(V, k, w, v2) : V.slice(0), x2 = j === "V" ? ["L", w, q[1]] : j === "H" ? ["L", q[1], v2] : q;
      [n] = x2, "TQ".includes(j) || (d = 0, b = 0);
      if (n === "M") [, o, r] = x2, c = o, f = r, g2 = o, p2 = r;
      else if (n === "L") [c, f, g2, p2] = Ge(w, v2, x2[1], x2[2]);
      else if (n === "A") [c, f, g2, p2] = it(w, v2, x2[1], x2[2], x2[3], x2[4], x2[5], x2[6], x2[7]);
      else if (n === "S") {
        let Q = h * 2 - S, H = y2 * 2 - A;
        [c, f, g2, p2] = Fe(w, v2, Q, H, x2[1], x2[2], x2[3], x2[4]);
      } else n === "C" ? [c, f, g2, p2] = Fe(w, v2, x2[1], x2[2], x2[3], x2[4], x2[5], x2[6]) : n === "T" ? (d = h * 2 - d, b = y2 * 2 - b, [c, f, g2, p2] = Ke(w, v2, d, b, x2[1], x2[2])) : n === "Q" ? (d = x2[1], b = x2[2], [c, f, g2, p2] = Ke(w, v2, x2[1], x2[2], x2[3], x2[4])) : n === "Z" && ([c, f, g2, p2] = Ge(w, v2, o, r));
      i = a(c, i), m = a(f, m), u = s(g2, u), l = s(p2, l), [h, y2] = n === "Z" ? [o, r] : x2.slice(-2), [S, A] = n === "C" ? [x2[3], x2[4]] : n === "S" ? [x2[1], x2[2]] : [h, y2];
    });
    let P2 = u - i, C = l - m;
    return { width: P2, height: C, x: i, y: m, x2: u, y2: l, cx: i + P2 / 2, cy: m + C / 2, cz: Math.max(P2, C) + Math.min(P2, C) / 2 };
  };
  var We = xr;
  var Sr = (t) => {
    let e = L(t), n = 0, o = 0, r = 0, s = 0, a = 0, i = 0, m = "M", u = 0, l = 0, c = 0;
    return T2(e, (f, g2, p2, h) => {
      [m] = f;
      let y2 = m.toUpperCase(), A = y2 !== m ? _(f, g2, p2, h) : f.slice(0), d = y2 === "V" ? ["L", p2, A[1]] : y2 === "H" ? ["L", A[1], h] : A;
      [m] = d, "TQ".includes(y2) || (a = 0, i = 0);
      if (m === "M") [, u, l] = d;
      else if (m === "L") c += ce(p2, h, d[1], d[2]);
      else if (m === "A") c += ve(p2, h, d[1], d[2], d[3], d[4], d[5], d[6], d[7]);
      else if (m === "S") {
        let b = n * 2 - r, P2 = o * 2 - s;
        c += Pe(p2, h, b, P2, d[1], d[2], d[3], d[4]);
      } else m === "C" ? c += Pe(p2, h, d[1], d[2], d[3], d[4], d[5], d[6]) : m === "T" ? (a = n * 2 - a, i = o * 2 - i, c += xe(p2, h, a, i, d[1], d[2])) : m === "Q" ? (a = d[1], i = d[2], c += xe(p2, h, d[1], d[2], d[3], d[4])) : m === "Z" && (c += ce(p2, h, u, l));
      [n, o] = m === "Z" ? [u, l] : d.slice(-2), [r, s] = m === "C" ? [d[3], d[4]] : m === "S" ? [d[1], d[2]] : [n, o];
    }), c;
  };
  var K = Sr;
  var se = 1e-5;
  var Ar = (t) => {
    let e = L(t), n = { ...U };
    return T2(e, (o, r, s, a) => {
      n.x = s, n.y = a;
      let i = X2(o, n), m = i.length;
      return n.x1 = +i[m - 2], n.y1 = +i[m - 1], n.x2 = +i[m - 4] || n.x1, n.y2 = +i[m - 3] || n.y1, i;
    });
  };
  var J = Ar;
  var Cr = (t, e) => {
    let n = J(t), o = false, r = [], s = "M", a = 0, i = 0, [m, u] = n[0].slice(1), l = typeof e == "number", c = { x: m, y: u }, f = 0, g2 = c, p2 = 0;
    return !l || e < se ? c : (T2(n, (h, y2, S, A) => {
      [s] = h, o = s === "M", r = o ? r : [S, A].concat(h.slice(1));
      if (o ? ([, m, u] = h, c = { x: m, y: u }, f = 0) : s === "L" ? (c = Le(r[0], r[1], r[2], r[3], e - p2), f = ce(r[0], r[1], r[2], r[3])) : s === "A" ? (c = mt(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], e - p2), f = ve(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8])) : s === "C" ? (c = pt(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], e - p2), f = Pe(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7])) : s === "Q" ? (c = gt(r[0], r[1], r[2], r[3], r[4], r[5], e - p2), f = xe(r[0], r[1], r[2], r[3], r[4], r[5])) : s === "Z" && (r = [S, A, m, u], c = { x: m, y: u }, f = ce(r[0], r[1], r[2], r[3])), [a, i] = r.slice(-2), p2 < e) g2 = c;
      else return false;
      p2 += f;
    }), e > p2 - se ? { x: a, y: i } : g2);
  };
  var me = Cr;
  var Tr = (t, e) => {
    let n = L(t), o = n.slice(0), r = K(o), s = o.length - 1, a = 0, i = 0, m = n[0];
    if (s <= 0 || !e || !Number.isFinite(e)) return { segment: m, index: 0, length: i, lengthAtSegment: a };
    if (e >= r) return o = n.slice(0, -1), a = K(o), i = r - a, m = n[s], { segment: m, index: s, length: i, lengthAtSegment: a };
    let u = [];
    for (; s > 0; ) m = o[s], o = o.slice(0, -1), a = K(o), i = r - a, r = a, u.push({ segment: m, index: s, length: i, lengthAtSegment: a }), s -= 1;
    return u.find(({ lengthAtSegment: l }) => l <= e);
  };
  var de = Tr;
  var Mr = (t, e) => {
    let n = L(t), o = J(n), r = K(o), s = (b) => {
      let P2 = b.x - e.x, C = b.y - e.y;
      return P2 * P2 + C * C;
    }, a = 8, i, m = { x: 0, y: 0 }, u = 0, l = 0, c = 1 / 0;
    for (let b = 0; b <= r; b += a) i = me(o, b), u = s(i), u < c && (m = i, l = b, c = u);
    a /= 2;
    let f, g2, p2 = 0, h = 0, y2 = 0, S = 0;
    for (; a > 1e-6 && (p2 = l - a, f = me(o, p2), y2 = s(f), h = l + a, g2 = me(o, h), S = s(g2), p2 >= 0 && y2 < c ? (m = f, l = p2, c = y2) : h <= r && S < c ? (m = g2, l = h, c = S) : a /= 2, !(a < 1e-5)); ) ;
    let A = de(n, l), d = Math.sqrt(c);
    return { closest: m, distance: d, segment: A };
  };
  var Y2 = Mr;
  var Lr = (t, e) => Y2(t, e).closest;
  var dt = Lr;
  var vr = (t, e, n, o, r, s, a, i) => 3 * ((i - e) * (n + r) - (a - t) * (o + s) + o * (t - r) - n * (e - s) + i * (r + t / 3) - a * (s + e / 3)) / 20;
  var Nr = (t) => {
    let e = 0, n = 0, o = 0;
    return ae(t).map((r) => {
      switch (r[0]) {
        case "M":
          return [, e, n] = r, 0;
        default:
          return o = vr(e, n, r[1], r[2], r[3], r[4], r[5], r[6]), [e, n] = r.slice(-2), o;
      }
    }).reduce((r, s) => r + s, 0);
  };
  var Oe = Nr;
  var wr = (t) => Oe(ae(t)) >= 0;
  var yt = wr;
  var zr = (t, e) => de(t, e).segment;
  var Pt = zr;
  var Vr = (t, e) => Y2(t, e).segment;
  var xt = Vr;
  var Rr = (t) => Array.isArray(t) && t.every((e) => {
    let n = e[0].toLowerCase();
    return Z2[n] === e.length - 1 && "achlmqstvz".includes(n) && e.slice(1).every(Number.isFinite);
  }) && t.length > 0;
  var ee = Rr;
  var kr = (t) => ee(t) && t.every(([e]) => e === e.toUpperCase());
  var Ie = kr;
  var qr = (t) => Ie(t) && t.every(([e]) => "ACLMQZ".includes(e));
  var Be = qr;
  var Qr = (t) => Be(t) && t.every(([e]) => "MC".includes(e));
  var St = Qr;
  var Dr = (t, e) => {
    let { distance: n } = Y2(t, e);
    return Math.abs(n) < se;
  };
  var At = Dr;
  var Er = (t) => ee(t) && t.slice(1).every(([e]) => e === e.toLowerCase());
  var Ct = Er;
  var Or = (t) => {
    if (typeof t != "string" || !t.length) return false;
    let e = new F2(t);
    for (G(e); e.index < e.max && !e.err.length; ) ge(e);
    return !e.err.length && "mM".includes(e.segments[0][0]);
  };
  var $e = Or;
  var Ir = { line: ["x1", "y1", "x2", "y2"], circle: ["cx", "cy", "r"], ellipse: ["cx", "cy", "rx", "ry"], rect: ["width", "height", "x", "y", "rx", "ry"], polygon: ["points"], polyline: ["points"], glyph: ["d"] };
  var te = Ir;
  var Br = (t) => t != null && typeof t == "object" && t.nodeType === 1;
  var Xe = Br;
  var $r = (t) => {
    let { x1: e, y1: n, x2: o, y2: r } = t;
    return [e, n, o, r] = [e, n, o, r].map((s) => +s), [["M", e, n], ["L", o, r]];
  };
  var jr = (t) => {
    let e = [], n = (t.points || "").trim().split(/[\s|,]/).map((r) => +r), o = 0;
    for (; o < n.length; ) e.push([o ? "L" : "M", n[o], n[o + 1]]), o += 2;
    return t.type === "polygon" ? [...e, ["z"]] : e;
  };
  var Hr = (t) => {
    let { cx: e, cy: n, r: o } = t;
    return [e, n, o] = [e, n, o].map((r) => +r), [["M", e - o, n], ["a", o, o, 0, 1, 0, 2 * o, 0], ["a", o, o, 0, 1, 0, -2 * o, 0]];
  };
  var Zr = (t) => {
    let { cx: e, cy: n } = t, o = t.rx || 0, r = t.ry || o;
    return [e, n, o, r] = [e, n, o, r].map((s) => +s), [["M", e - o, n], ["a", o, r, 0, 1, 0, 2 * o, 0], ["a", o, r, 0, 1, 0, -2 * o, 0]];
  };
  var Gr = (t) => {
    let e = +t.x || 0, n = +t.y || 0, o = +t.width, r = +t.height, s = +(t.rx || 0), a = +(t.ry || s);
    if (s || a) {
      s * 2 > o && (s -= (s * 2 - o) / 2);
      return a * 2 > r && (a -= (a * 2 - r) / 2), [["M", e + s, n], ["h", o - s * 2], ["s", s, 0, s, a], ["v", r - a * 2], ["s", 0, a, -s, a], ["h", -o + s * 2], ["s", -s, 0, -s, -a], ["v", -r + a * 2], ["s", 0, -a, s, -a]];
    }
    return [["M", e, n], ["h", o], ["v", r], ["H", e], ["Z"]];
  };
  var _r = (t) => {
    let e = Object.keys(te), n = Xe(t), o = n ? t.tagName : null;
    if (o && [...e, "path"].every((m) => o !== m)) throw TypeError(`${R2}: "${o}" is not SVGElement`);
    let r = n ? o : t.type, s = te[r], a = { type: r };
    n ? s.forEach((m) => {
      a[m] = t.getAttribute(m);
    }) : Object.assign(a, t);
    let i = [];
    return r === "circle" ? i = Hr(a) : r === "ellipse" ? i = Zr(a) : ["polyline", "polygon"].includes(r) ? i = jr(a) : r === "rect" ? i = Gr(a) : r === "line" ? i = $r(a) : ["glyph", "path"].includes(r) && (i = L(n ? t.getAttribute("d") || "" : t.d || "")), ee(i) && i.length ? i : false;
  };
  var je = _r;
  var Ur = (t, e, n) => {
    let o = n || document, r = Object.keys(te), s = Xe(t), a = s ? t.tagName : null;
    if (a === "path") throw TypeError(`${R2}: "${a}" is already SVGPathElement`);
    if (a && r.every((p2) => a !== p2)) throw TypeError(`${R2}: "${a}" is not SVGElement`);
    let i = o.createElementNS("http://www.w3.org/2000/svg", "path"), m = s ? a : t.type, u = te[m], l = { type: m }, c = O2.round, f = je(t), g2 = f && f.length ? Ce(f, c) : "";
    return s ? (u.forEach((p2) => {
      l[p2] = t.getAttribute(p2);
    }), Object.values(t.attributes).forEach(({ name: p2, value: h }) => {
      u.includes(p2) || i.setAttribute(p2, h);
    })) : (Object.assign(l, t), Object.keys(l).forEach((p2) => {
      !u.includes(p2) && p2 !== "type" && i.setAttribute(p2.replace(/[A-Z]/g, (h) => `-${h.toLowerCase()}`), l[p2]);
    })), $e(g2) ? (i.setAttribute("d", g2), e && s && (t.before(i, t), t.remove()), i) : false;
  };
  var Tt = Ur;
  var Fr = (t, e, n, o) => {
    let [r] = t, { round: s } = O2, a = typeof s == "number" ? s : 4, i = e.slice(1), { x1: m, y1: u, x2: l, y2: c, x: f, y: g2 } = n, [p2, h] = i.slice(-2), y2 = t;
    if ("TQ".includes(r) || (n.qx = null, n.qy = null), r === "L") {
      if (M(f, a) === M(p2, a)) return ["V", h];
      if (M(g2, a) === M(h, a)) return ["H", p2];
    } else if (r === "C") {
      let [S, A] = i;
      if (n.x1 = S, n.y1 = A, "CS".includes(o) && (M(S, a) === M(m * 2 - l, a) && M(A, a) === M(u * 2 - c, a) || M(m, a) === M(l * 2 - f, a) && M(u, a) === M(c * 2 - g2, a))) return ["S", i[2], i[3], i[4], i[5]];
    } else if (r === "Q") {
      let [S, A] = i;
      if (n.qx = S, n.qy = A, "QT".includes(o) && M(S, a) === M(m * 2 - l, a) && M(A, a) === M(u * 2 - c, a)) return ["T", i[2], i[3]];
    }
    return y2;
  };
  var He = Fr;
  var Kr = (t, e) => {
    let n = t.slice(1).map((o) => M(o, e));
    return [t[0]].concat(n);
  };
  var ie = Kr;
  var Jr = (t, e) => {
    let n = oe(t), o = typeof e == "number" && e >= 0 ? e : 2, r = { ...U }, s = [], a = "M", i = "Z";
    return T2(n, (m, u, l, c) => {
      r.x = l, r.y = c;
      let f = X2(m, r), g2 = m;
      if ([a] = m, s[u] = a, u) {
        i = s[u - 1];
        let h = He(m, f, r, i), y2 = ie(h, o), S = y2.join(""), A = he(h, u, l, c), d = ie(A, o), b = d.join("");
        g2 = S.length < b.length ? y2 : d;
      }
      let p2 = f.length;
      return r.x1 = +f[p2 - 2], r.y1 = +f[p2 - 1], r.x2 = +f[p2 - 4] || r.x1, r.y2 = +f[p2 - 3] || r.y1, g2;
    });
  };
  var Ye = Jr;
  var Wr = (t) => {
    let e = oe(t), n = J(e), o = e.length, r = e[o - 1][0] === "Z", s = T2(e, (a, i) => {
      let m = n[i], u = i && e[i - 1], l = u && u[0], c = e[i + 1], f = c && c[0], [g2] = a, [p2, h] = n[i ? i - 1 : o - 1].slice(-2), y2 = a;
      switch (g2) {
        case "M":
          y2 = r ? ["Z"] : [g2, p2, h];
          break;
        case "A":
          y2 = [g2, a[1], a[2], a[3], a[4], a[5] === 1 ? 0 : 1, p2, h];
          break;
        case "C":
          c && f === "S" ? y2 = ["S", a[1], a[2], p2, h] : y2 = [g2, a[3], a[4], a[1], a[2], p2, h];
          break;
        case "S":
          l && "CS".includes(l) && (!c || f !== "S") ? y2 = ["C", m[3], m[4], m[1], m[2], p2, h] : y2 = [g2, m[1], m[2], p2, h];
          break;
        case "Q":
          c && f === "T" ? y2 = ["T", p2, h] : y2 = [g2, a[1], a[2], p2, h];
          break;
        case "T":
          l && "QT".includes(l) && (!c || f !== "T") ? y2 = ["Q", m[1], m[2], p2, h] : y2 = [g2, p2, h];
          break;
        case "Z":
          y2 = ["M", p2, h];
          break;
        case "H":
          y2 = [g2, p2];
          break;
        case "V":
          y2 = [g2, h];
          break;
        default:
          y2 = [g2].concat(a.slice(1, -2), p2, h);
      }
      return y2;
    });
    return r ? s.reverse() : [s[0]].concat(s.slice(1).reverse());
  };
  var Te = Wr;
  var Xr = (t) => {
    let e = [], n, o = -1, r = 0, s = 0, a = 0, i = 0, m = { ...U };
    return t.forEach((u) => {
      let [l] = u, c = l.toUpperCase(), f = l.toLowerCase(), g2 = l === f, p2 = u.slice(1);
      c === "M" ? (o += 1, [r, s] = p2, r += g2 ? m.x : 0, s += g2 ? m.y : 0, a = r, i = s, n = [g2 ? [c, a, i] : u]) : (c === "Z" ? (r = a, s = i) : c === "H" ? ([, r] = u, r += g2 ? m.x : 0) : c === "V" ? ([, s] = u, s += g2 ? m.y : 0) : ([r, s] = u.slice(-2), r += g2 ? m.x : 0, s += g2 ? m.y : 0), n.push(u)), m.x = r, m.y = s, e[o] = n;
    }), e;
  };
  var et = Xr;
  var en = (t) => {
    let e = new y(), { origin: n } = t, [o, r] = n, { translate: s } = t, { rotate: a } = t, { skew: i } = t, { scale: m } = t;
    return Array.isArray(s) && s.length >= 2 && s.every((u) => !Number.isNaN(+u)) && s.some((u) => u !== 0) ? e = e.translate(...s) : typeof s == "number" && !Number.isNaN(s) && (e = e.translate(s)), (a || i || m) && (e = e.translate(o, r), Array.isArray(a) && a.length >= 2 && a.every((u) => !Number.isNaN(+u)) && a.some((u) => u !== 0) ? e = e.rotate(...a) : typeof a == "number" && !Number.isNaN(a) && (e = e.rotate(a)), Array.isArray(i) && i.length === 2 && i.every((u) => !Number.isNaN(+u)) && i.some((u) => u !== 0) ? (e = i[0] ? e.skewX(i[0]) : e, e = i[1] ? e.skewY(i[1]) : e) : typeof i == "number" && !Number.isNaN(i) && (e = e.skewX(i)), Array.isArray(m) && m.length >= 2 && m.every((u) => !Number.isNaN(+u)) && m.some((u) => u !== 1) ? e = e.scale(...m) : typeof m == "number" && !Number.isNaN(m) && (e = e.scale(m)), e = e.translate(-o, -r)), e;
  };
  var Ze = en;
  var rn = (t, e) => {
    let n = y.Translate(e[0], e[1], e[2]);
    return [, , , n.m44] = e, n = t.multiply(n), [n.m41, n.m42, n.m43, n.m44];
  };
  var nn = (t, e, n) => {
    let [o, r, s] = n, [a, i, m] = rn(t, [e[0], e[1], 0, 1]), u = a - o, l = i - r, c = m - s;
    return [u * (Math.abs(s) / Math.abs(c) || 1) + o, l * (Math.abs(s) / Math.abs(c) || 1) + r];
  };
  var Me = nn;
  var on = (t, e) => {
    let n = 0, o = 0, r = 0, s = 0, a = 0, i = 0, m = "M", u = L(t), l = e && Object.keys(e);
    if (!e || l && !l.length) return u.slice(0);
    e.origin || Object.assign(e, { origin: O2.origin });
    let c = e.origin, f = Ze(e);
    return f.isIdentity ? u.slice(0) : T2(u, (g2, p2, h, y2) => {
      [m] = g2;
      let S = m.toUpperCase(), d = S !== m ? _(g2, p2, h, y2) : g2.slice(0), b = S === "A" ? ["C"].concat(be(h, y2, d[1], d[2], d[3], d[4], d[5], d[6], d[7])) : S === "V" ? ["L", h, d[1]] : S === "H" ? ["L", d[1], y2] : d;
      m = b[0];
      let P2 = m === "C" && b.length > 7, C = P2 ? b.slice(0, 7) : b.slice(0);
      if (P2 && (u.splice(p2 + 1, 0, ["C"].concat(b.slice(7))), b = C), m === "L") {
        [r, s] = Me(f, [b[1], b[2]], c);
        n !== r && o !== s ? b = ["L", r, s] : o === s ? b = ["H", r] : n === r && (b = ["V", s]);
      } else for (a = 1, i = b.length; a < i; a += 2) [r, s] = Me(f, [+b[a], +b[a + 1]], c), b[a] = r, b[a + 1] = s;
      return n = r, o = s, b;
    });
  };
  var tt = on;
  var an = (t) => {
    let e = t.slice(1).map((n, o, r) => o ? r[o - 1].slice(-2).concat(n.slice(1)) : t[0].slice(1).concat(n.slice(1))).map((n) => n.map((o, r) => n[n.length - r - 2 * (1 - r % 2)])).reverse();
    return [["M"].concat(e[0].slice(0, 2))].concat(e.map((n) => ["C"].concat(n.slice(2))));
  };
  var Mt = an;
  var sn = (t, e) => {
    let { round: n } = O2;
    n = e === "off" || typeof e == "number" && e >= 0 ? e : typeof n == "number" && n >= 0 ? n : "off";
    return n === "off" ? t.slice(0) : T2(t, (o) => ie(o, n));
  };
  var Lt = sn;
  var mn = (t, e = 0.5) => {
    let n = e, o = t.slice(0, 2), r = t.slice(2, 4), s = t.slice(4, 6), a = t.slice(6, 8), i = E2(o, r, n), m = E2(r, s, n), u = E2(s, a, n), l = E2(i, m, n), c = E2(m, u, n), f = E2(l, c, n);
    return [["C", i[0], i[1], l[0], l[1], f[0], f[1]], ["C", c[0], c[1], u[0], u[1], a[0], a[1]]];
  };
  var vt = mn;
  var Nt = class {
    constructor(e, n) {
      let o = n || {}, r = typeof e > "u";
      if (r || !e.length) throw TypeError(`${R2}: "pathValue" is ${r ? "undefined" : "empty"}`);
      this.segments = L(e);
      let { round: s, origin: a } = o, i;
      Number.isInteger(s) || s === "off" ? i = s : i = O2.round;
      let m = O2.origin;
      if (Array.isArray(a) && a.length >= 2) {
        let [u, l, c] = a.map(Number);
        m = [Number.isNaN(u) ? 0 : u, Number.isNaN(l) ? 0 : l, Number.isNaN(c) ? 0 : c];
      }
      return this.round = i, this.origin = m, this;
    }
    get bbox() {
      return We(this.segments);
    }
    get length() {
      return K(this.segments);
    }
    getBBox() {
      return this.bbox;
    }
    getTotalLength() {
      return this.length;
    }
    getPointAtLength(e) {
      return me(this.segments, e);
    }
    toAbsolute() {
      let { segments: e } = this;
      return this.segments = oe(e), this;
    }
    toRelative() {
      let { segments: e } = this;
      return this.segments = Je(e), this;
    }
    toCurve() {
      let { segments: e } = this;
      return this.segments = ae(e), this;
    }
    reverse(e) {
      let { segments: n } = this, o = et(n), r = o.length > 1 ? o : false, s = r ? r.map((i, m) => e ? m ? Te(i) : i.slice(0) : Te(i)) : n.slice(0), a = [];
      return r ? a = s.flat(1) : a = e ? n : Te(n), this.segments = a.slice(0), this;
    }
    normalize() {
      let { segments: e } = this;
      return this.segments = J(e), this;
    }
    optimize() {
      let { segments: e } = this, n = this.round === "off" ? 2 : this.round;
      return this.segments = Ye(e, n), this;
    }
    transform(e) {
      if (!e || typeof e != "object" || typeof e == "object" && !["translate", "rotate", "skew", "scale"].some((m) => m in e)) return this;
      let { segments: n, origin: [o, r, s] } = this, a = {};
      for (let [m, u] of Object.entries(e)) {
        m === "skew" && Array.isArray(u) || (m === "rotate" || m === "translate" || m === "origin" || m === "scale") && Array.isArray(u) ? a[m] = u.map(Number) : m !== "origin" && typeof Number(u) == "number" && (a[m] = Number(u));
      }
      let { origin: i } = a;
      if (Array.isArray(i) && i.length >= 2) {
        let [m, u, l] = i.map(Number);
        a.origin = [Number.isNaN(m) ? o : m, Number.isNaN(u) ? r : u, l || s];
      } else a.origin = [o, r, s];
      return this.segments = tt(n, a), this;
    }
    flipX() {
      let { cx: e, cy: n } = this.bbox;
      return this.transform({ rotate: [0, 180, 0], origin: [e, n, 0] }), this;
    }
    flipY() {
      let { cx: e, cy: n } = this.bbox;
      return this.transform({ rotate: [180, 0, 0], origin: [e, n, 0] }), this;
    }
    toString() {
      return Ce(this.segments, this.round);
    }
    dispose() {
      Object.keys(this).forEach((e) => delete this[e]);
    }
    static get options() {
      return O2;
    }
    static get CSSMatrix() {
      return y;
    }
    static get arcTools() {
      return ut;
    }
    static get bezierTools() {
      return ct;
    }
    static get cubicTools() {
      return ft;
    }
    static get lineTools() {
      return ot;
    }
    static get polygonTools() {
      return bt;
    }
    static get quadTools() {
      return ht;
    }
    static get pathToAbsolute() {
      return oe;
    }
    static get pathToRelative() {
      return Je;
    }
    static get pathToCurve() {
      return ae;
    }
    static get pathToString() {
      return Ce;
    }
    static get distanceSquareRoot() {
      return re;
    }
    static get midPoint() {
      return E2;
    }
    static get rotateVector() {
      return ne;
    }
    static get roundTo() {
      return M;
    }
    static get parsePathString() {
      return L;
    }
    static get finalizeSegment() {
      return Se;
    }
    static get invalidPathValue() {
      return $2;
    }
    static get isArcCommand() {
      return qe;
    }
    static get isDigit() {
      return B;
    }
    static get isDigitStart() {
      return ke;
    }
    static get isMoveCommand() {
      return Qe;
    }
    static get isPathCommand() {
      return Re;
    }
    static get isSpace() {
      return Ve;
    }
    static get paramsCount() {
      return Z2;
    }
    static get paramsParser() {
      return U;
    }
    static get pathParser() {
      return F2;
    }
    static get scanFlag() {
      return we;
    }
    static get scanParam() {
      return ze;
    }
    static get scanSegment() {
      return ge;
    }
    static get skipSpaces() {
      return G;
    }
    static get distanceEpsilon() {
      return se;
    }
    static get getClosestPoint() {
      return dt;
    }
    static get getDrawDirection() {
      return yt;
    }
    static get getPathArea() {
      return Oe;
    }
    static get getPathBBox() {
      return We;
    }
    static get getPointAtLength() {
      return me;
    }
    static get getPropertiesAtLength() {
      return de;
    }
    static get getPropertiesAtPoint() {
      return Y2;
    }
    static get getSegmentAtLength() {
      return Pt;
    }
    static get getSegmentOfPoint() {
      return xt;
    }
    static get getTotalLength() {
      return K;
    }
    static get isAbsoluteArray() {
      return Ie;
    }
    static get isCurveArray() {
      return St;
    }
    static get isNormalizedArray() {
      return Be;
    }
    static get isPathArray() {
      return ee;
    }
    static get isPointInStroke() {
      return At;
    }
    static get isRelativeArray() {
      return Ct;
    }
    static get isValidPath() {
      return $e;
    }
    static get shapeParams() {
      return te;
    }
    static get shapeToPath() {
      return Tt;
    }
    static get shapeToPathArray() {
      return je;
    }
    static get absolutizeSegment() {
      return _;
    }
    static get arcToCubic() {
      return be;
    }
    static get getSVGMatrix() {
      return Ze;
    }
    static get iterate() {
      return T2;
    }
    static get lineToCubic() {
      return Ae;
    }
    static get normalizePath() {
      return J;
    }
    static get normalizeSegment() {
      return X2;
    }
    static get optimizePath() {
      return Ye;
    }
    static get projection2d() {
      return Me;
    }
    static get quadToCubic() {
      return De;
    }
    static get relativizeSegment() {
      return he;
    }
    static get reverseCurve() {
      return Mt;
    }
    static get reversePath() {
      return Te;
    }
    static get roundPath() {
      return Lt;
    }
    static get roundSegment() {
      return ie;
    }
    static get segmentToCubic() {
      return Ee;
    }
    static get shortenSegment() {
      return He;
    }
    static get splitCubic() {
      return vt;
    }
    static get splitPath() {
      return et;
    }
    static get transformPath() {
      return tt;
    }
  };
  var It = Nt;
  var Ci = It;

  // src/diplomatic.js
  var renderWord = (text, coords, container2) => {
    let scale = 0.3;
    const path = "M" + coords + "Z";
    let pathcom = new Ci(path);
    let c = document.createElement("DIV");
    container2.appendChild(c);
    c.style.position = "absolute";
    c.style.left = pathcom.bbox.x * scale + "px";
    c.style.top = pathcom.bbox.y * scale + "px";
    c.style.width = pathcom.bbox.width * scale + "px";
    c.style.height = pathcom.bbox.height * scale + "px";
    let s = document.createElement("DIV");
    c.appendChild(s);
    s.innerText = text;
    s.className = "text";
    s.style.fontFamily = "monospace";
    s.style.display = "block";
    s.style.fontSize = "20px";
  };
  var isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => scrollWidth > clientWidth;
  var resizeText = (el, minSize = 1, maxSize = 150, step = 1, unit = "px") => {
    {
      let i = minSize;
      let overflow = false;
      const parent = el.parentNode;
      while (!overflow && i < maxSize) {
        el.style.fontSize = `${i}${unit}`;
        overflow = isOverflown(parent);
        if (!overflow) i += step;
      }
      el.style.fontSize = `${i - step}${unit}`;
      const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2;
      el.style.marginTop = `${verticalAdjust}${unit}`;
    }
  };
  var observer = new MutationObserver((mutationList, observer2) => {
    for (const mut of mutationList) {
      if (mut.type == "childList") {
        for (const ad of mut.addedNodes) {
          if (ad.className == "text") {
            resizeText(ad);
          }
        }
      }
    }
  });
  var container = document.createElement("DIV");
  document.body.appendChild(container);
  observer.observe(container, { attributes: false, childList: true, subtree: true });
  fetch("../data/3598_selection/NL-HaNA_1.04.02_3598_0797.xml").then((response) => response.text()).then((data) => {
    const xml = (0, import_parse_xml.parseXml)(data);
    const regions = xml.children[0].children.filter((x2) => x2["name"] == "Page")[0].children.filter((x2) => x2["name"] == "TextRegion");
    for (const region of regions) {
      const lines = region.children.filter((x2) => x2["name"] == "TextLine");
      for (const line of lines) {
        const words = line.children.filter((x2) => x2["name"] == "Word");
        for (const word of words) {
          const coords = word.children.filter((x2) => x2["name"] == "Coords")[0].attributes["points"];
          const text = word.children.filter((x2) => x2["name"] == "TextEquiv")[0].children.filter((x2) => x2["name"] == "Unicode")[0].children[0].text;
          renderWord(text, coords, container);
        }
      }
    }
  });
})();
/*! Bundled license information:

@rgrove/parse-xml/dist/browser.js:
  (*! @rgrove/parse-xml v4.2.0 | ISC License | Copyright Ryan Grove *)

@thednp/dommatrix/dist/dommatrix.mjs:
  (* istanbul ignore else @preserve *)
*/
