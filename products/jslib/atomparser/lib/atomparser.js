goog.provide('atomparser');
goog.provide('atomparser.Feed');
goog.provide('atomparser.Entry');
goog.provide('atomparser.Error');
goog.require('goog.array');
goog.require('goog.date');
goog.require('goog.debug.Error');

/**
 * Collects the text of text nodes in the element
 * @param {Element} element The element collects the text from.
 * @return {string} The text of the element.
 */
atomparser.collectsText = function(element) {
  var texts = [], nodes = element.childNodes, node;
  for(var i = 0, l = nodes.length ; i < l ; ++i) {
	node = nodes[i];
	if(node.nodeType == 3 || node.nodeType == 4) {
	  texts[texts.length] = node.data || '';
	}
  }
  return texts.join('');
}

/**
 * Joins two string with '|' separator.
 * @param {string} str1 The first string.
 * @param {string} str2 The second string.
 * @return The joined string.
 */
atomparser.joinStr = function(str1, str2) {
  return (str1 || '').replace('|', '%7C') + '|' + (str2 || '');
}

/**
 * An Abstract parser.
 * @constructor
 * @param {!Element} rootNode The target of parsing.
 */
atomparser.Base = function(rootNode) {
  this.rootNode_   = rootNode;
  this.children_   = {};
  this.id          = '';
  this.published   = null;
  this.updated     = null;
  this.title       = '';
  this.summary     = '';
  this.authorName  = '';
  this.authorEMail = '';
  this.link_       = {};
  this.entries_    = [];

  var children = this.children_;
  var nodes    = this.rootNode_.childNodes;
  var node, nodeName, arr, index;
  for(var i = 0 , l = nodes.length ; i < l ; ++i) {
	node = nodes[i];
	if(node.nodeType != 1) {
	  continue;
	}

	nodeName        = node.localName || node.baseName;
	index           = atomparser.joinStr(node.namespaceURI, nodeName);
	children[index] = arr = children[index] || [];
	arr[arr.length] = node;
	if(node.namespaceURI != atomparser.Base.NAMESPACE_URI) {
	  continue;
	}

	if(nodeName == 'id') {
	  this.id = atomparser.collectsText(node);
	} else if(nodeName == 'published') {
	  this.published = goog.date.fromIsoString(atomparser.collectsText(node));
	} else if(nodeName == 'updated') {
	  this.updated = goog.date.fromIsoString(atomparser.collectsText(node));
	} else if(nodeName == 'title') {
	  this.title = atomparser.collectsText(node);
	} else if(nodeName == 'summary') {
	  this.summary = atomparser.collectsText(node);
	} else if(nodeName == 'link') {
	  index = atomparser.joinStr(node.getAttribute('rel'), node.getAttribute('type'));
	  this.link_[index] = node.getAttribute('href');
	} else if(nodeName == 'author') {
	  this.parseAuthor_(node);
	} else if(nodeName == 'entry') {
	  this.entries_[this.entries_.length] = new atomparser.Entry(node);
	}
  }
};

/**
 * The namespace URI for ATOM feed.
 * @type {string}
 * @const
 */
atomparser.Base.NAMESPACE_URI = 'http://www.w3.org/2005/Atom';

/**
 * The root node of the feed.
 * @type {Element}
 * @private
 */
atomparser.Base.prototype.rootNode_;

/**
 * Child elements of the root node.
 * @type {Object.<string, Element>}
 * @private
 */
atomparser.Base.prototype.children_;

/**
 * The value of id node.
 * @type {string}
 */
atomparser.Base.prototype.id;

/**
 * The value of published node.
 * @type {goog.date.DateTime}
 */
atomparser.Base.prototype.published;

/**
 * The value of updated node.
 * @type {goog.date.DateTime}
 */
atomparser.Base.prototype.updated;

/**
 * The value of title node.
 * @type {string}
 */
atomparser.Base.prototype.title;

/**
 * The value of summary node.
 * @type {string}
 */
atomparser.Base.prototype.summary;

/**
 * The value of author/name node.
 * @type {string}
 */
atomparser.Base.prototype.authorName;

/**
 * The value of author/email node.
 * @type {string}
 */
atomparser.Base.prototype.authorName;

/**
 * The map of the value of link nodes.
 * @type {Object.<string, string>}
 * @private
 */
atomparser.Base.prototype.link_;

/**
 * The array of entries.
 * @type {Array.<atomparser.Entry>}
 * @private
 */
atomparser.Base.prototype.entries_;

/**
 * Parse the author node.
 * @param {Element} authorNode The author node.
 * @private
 */
atomparser.Base.prototype.parseAuthor_ = function(authorNode) {
  var nodes = authorNode.childNodes;
  var node, nodeName;
  for(var i = 0 , l = nodes.length ; i < l ; ++i) {
	node = nodes[i];
	if(node.nodeType == 1 && node.namespaceURI == atomparser.Base.NAMESPACE_URI) {
	  nodeName = node.localName || node.baseName;
	  if(nodeName == 'name') {
		this.authorName = atomparser.collectsText(node);
	  } else if(nodeName == 'email') {
		this.authorEMail = atomparser.collectsText(node);
	  }
	}
  }
};

/**
 * Returns elements that have the specific name and namespace.
 * @param {string} name The element name.
 * @param {string=} opt_namespace
 *     The namespace of the element.
 *     Defaults to atomparser.Base.NAMESPACE_URI.
 * @return {Array.<Element>}
 *     The array of matched elements. If no element is matched,
 *     the return value is an empty array.
 */
atomparser.Base.prototype.getElements = function(name, opt_namespace) {
  opt_namespace = opt_namespace || atomparser.Base.NAMESPACE_URI;
  return this.children_[atomparser.joinStr(opt_namespace, name)] || [];
}

/**
 * Returns the href attribute of the specific link node.
 * @param {string} rel The value of rel attribute.
 * @param {string} type The value of type attribute.
 * @return {?string} The href value.
 */
atomparser.Base.prototype.getLink = function(rel, type) {
  return this.link_[atomparser.joinStr(rel, type)] || null;
};

/**
 * Returns the entry of the specified index.
 * @param {number} index The index of entry.
 * @return {?atomparser.Entry} If index is valid, the entry instance. Otherwise null.
 */
atomparser.Base.prototype.getEntry = function(index) {
  return this.entries_[index] || null;
};

/**
 * Returns the number of entries.
 * @return {number} The number of entries.
 */
atomparser.Base.prototype.getNumEntries = function(index) {
  return this.entries_.length;
};

/**
 * Calls a function for each entry.
 * @param {Function} f The function to call for every element.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
atomparser.Base.prototype.forEachEntry = function(f, opt_obj) {
  goog.array.forEach(this.entries_, f, opt_obj);
};

/**
 * An entry of the ATOM feed.
 * @constructor
 * @param {Document|Element} rootNode The document of the feed or it's root node.
 */
atomparser.Feed = function(rootNode) {
  if(rootNode.nodeType != 1) {
	rootNode = rootNode.documentElement;
	if(!rootNode || (rootNode.localName || rootNode.baseName) != 'feed' ||
	   rootNode.namespaceURI != atomparser.Base.NAMESPACE_URI) {
	  throw new atomparser.Error('Not ATOM feed.');
	}
  }
  goog.base(this, rootNode);
};
goog.inherits(atomparser.Feed, atomparser.Base);

/**
 * An entry of an ATOM entry feed.
 * @constructor
 * @param {Document|Element} entryNode The document of the feed or it's root node.
 */
atomparser.Entry = function(entryNode) {
  if(entryNode.nodeType != 1) {
	entryNode = entryNode.documentElement;
	if(!entryNode || (entryNode.localName || entryNode.baseName) != 'entry' ||
	   entryNode.namespaceURI != atomparser.Base.NAMESPACE_URI) {
	  throw new atmo.Error('Not ATOM feed.');
	}
  }
  goog.base(this, entryNode);
};
goog.inherits(atomparser.Entry, atomparser.Base);

/**
 * An error class for atomparser.* class.
 * @constructor
 * @param {*=} opt_msg The message associated with the error.
 */
atomparser.Error = function(opt_msg) {
  goog.base(this, opt_msg);
};
goog.inherits(atomparser.Error, goog.debug.Error);

/**
 * The name of the error
 * @type {string}
 */
atomparser.Error.prototype.name = 'AtomParseError';
