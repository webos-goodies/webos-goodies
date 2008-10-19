var Gadget = (function() {

//--------------------------------------------------------------------
// Global variables

var _document      = document;
var moduleId       = __MODULE_ID__;
var prefs          = new _IG_Prefs(moduleId);
var useLegacy      = !(window.gadgets && gadgets.views && gadgets.views.getCurrentView() !== undefined);
var useOpenSocial  = !useLegacy && !!window.opensocial;
var nextId         = 1;
var tabBorderStyle = 'border: 1px solid #676767; border-top-style: none; padding: 4px;';


//--------------------------------------------------------------------
// type detection

function isNull(obj)     { return obj === null; };
function isFunction(obj) { return typeof obj === 'function'; };
function isString(obj)   { return typeof obj === 'string'; };


//--------------------------------------------------------------------
// Utilities

function generateHandler(self, name)
{
  var method = self[name];
  return function() { method.apply(self, arguments) };
};

function generateProxy(self, name)
{
  var method = self[name];
  var args   = [];
  for(var i = 2 ; i < arguments.length ; ++i) {
	args[args.length] = arguments[i];
  }
  return function() { method.apply(self, args) };
};


//--------------------------------------------------------------------
// DOM handling

function nel(tag)
{
  return _document.createElement(tag);
}

function nfg()
{
  return _document.createDocumentFragment();
}

function gel(id)
{
  return _document.getElementById(id);
}

function gtx(element_or_id)
{
  var el = isString(element_or_id) ? gel(element_or_id) : element_or_id;
  return el.textContent !== undefined ? el.textContent : el.innerText;
}

function appendBodyChild(child)
{
  _document.body.appendChild(child);
}

function createHiddenDiv(id, style, html)
{
  var div           = nel('div');
  div.id            = id;
  div.style.cssText = 'display:none;' + (style || '');
  div.innerHTML     = html || '';
  appendBodyChild(div);
  return div;
}


//--------------------------------------------------------------------
// text operation

function escapeHtml(a)
{
  a = a.replace(/&/g, '&amp;');
  a = a.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  a = a.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  return a;
}

function escapeUrl(a)
{
  return (window.encodeURIComponent ? encodeURIComponent(a) : escape(a)).replace(/\%20/g, '+');
}

function unescapeUrl(a)
{
  a = a.replace(/\+/g, '%20');
  return window.decodeURIComponent ? decodeURIComponent(a) : unescape(a);
}

function generateUniqueId()
{
  return 'JsConsole8395' + nextId++;
}

function tinyTemplate(template, args)
{
  return template.replace(/\$(\d+)/g, function(str, p1) {
	return args[parseInt(p1, 10)];
  });
}


//--------------------------------------------------------------------
// DomBuilder

function DomBuilder()
{
  this._nodes = {};
};

DomBuilder.prototype = {

  getEl : function(index)
  {
	return this._nodes[index];
  },

  getElements : function()
  {
	var ret = {};
	for(var i in this._nodes)
	  ret[i] = this._nodes[i];
	return ret;
  },

  build : function(root, tree)
  {
	this._nodes = {};
	if(!tree) { tree = root; root = null; }
	if(!root) root = _document.createDocumentFragment();
	return this._build(root, tree);
  },

  _build : function(root, tree)
  {
	if(tree instanceof Array)
	{
	  for(var i = 0 ; i < tree.length ; ++i)
		this._build(root, tree[i]);
	}
	else if(tree.nodeType)
	{
	  root.appendChild(tree);
	}
	else
	{
	  var el = _document.createElement(tree.tag ? tree.tag : 'DIV');
	  var sa = el.setAttribute ? true : false, cn = null;
	  for(var i in tree)
	  {
		if(!tree.hasOwnProperty(i) || typeof tree[i] == 'function')
		  continue;
		var v = tree[i];
		switch(i)
		{
		case 'tag':
		case 'html':
		  break;
		case 'cls':
		  el.className = v;
		  break;
		case 'style':
		  this.applyStyles(el, v);
		  break;
		case 'value':
		  el[i] = v;
		  break;
		case 'index':
		  this._nodes[v] = el;
		  break;
		case 'children':
		case 'cn':
		  cn = v;
		  break;
		default:
		  if(sa) el.setAttribute(i, v); else el[i] = v;
		  break;
		}
	  }
	  if(cn) this._build(el, cn);
	  if(tree.html) el.innerHTML += tree.html;
	  root.appendChild(el);
	}
	return root;
  },

  applyStyles : function(el, styles)
  {
	if(typeof styles === 'string')
	{
	  el.style.cssText = styles;
	}
	else
	{
	  for(var i in styles)
	  {
		if(typeof styles[i] === 'string')
		  el.style[i] = styles[i];
	  }
	}
  }

};


//--------------------------------------------------------------------
// SocialGoodies

SocialGoodies = (function() {

  var dataRequest    = null,
      requestTimerId = null,
	  requestRecords = [],
	  nextRequestKey = 0;

  var DataRequest = {
	fetchPerson : function(idSpec, opts)
	{
	  dataRequestTemplate(opts, function(key, opts) {
		dataRequest.add(dataRequest.newFetchPersonRequest(idSpec), key);
		return { type : 'fetchPerson', hasData : true };
	  });
	},
	fetchPeople : function(idSpec, opts)
	{
	  dataRequestTemplate(opts, function(key, opts) {
		dataRequest.add(dataRequest.newFetchPeopleRequest(makeIdSpec(idSpec)), key);
		return { type : 'fetchPeople', hasData : true };
	  });
	},
	storeAppData : function(idSpec, field, value, opts)
	{
	  dataRequestTemplate(opts, function(key, opts) {
		dataRequest.add(dataRequest.newUpdatePersonAppDataRequest(idSpec, field, value), key);
		return { type : 'storeAppData', hasData : false };
	  });
	},
	fetchAppData : function(idSpec, fields, opts)
	{
	  dataRequestTemplate(opts, function(key, opts) {
		dataRequest.add(dataRequest.newFetchPersonAppDataRequest(makeIdSpec(idSpec), fields, opts.params), key);
		return { type: 'fetchAppData', hasData: true };
	  });
	},
	removeAppData : function(idSpec, fields, opts)
	{
	  dataRequestTemplate(opts, function(key, opts) {
		dataRequest.add(dataRequest.newRemovePersonAppDataRequest(idSpec, fields), key);
		return { type: 'removeAppData', hasData: false };
	  });
	},
	send : function() {
	  clearTimeout(requestTimerId);
	  requestTimerId = null;
	  sendDataRequest();
	},
	Error : function(errorCode, errorMessage, isBatchLevelError) {
	  var self = this;
	  self.getErrorCode = function() {
		return errorCode || errorMessage;
	  }
	  self.getErrorMessage = function() {
		return errorMessage || errorCode;
	  }
	  self.isBatchLevelError = function() {
		return isBatchLevelError;
	  }
	}
  };

  function dataRequestTemplate(opts, func) {
	opts = opts || {};
	setupDataRequest();
	var params = {};
	if(opts.escape == 'none') {
	  params[opensocial.DataRequest.DataRequestFields.ESCAPE_TYPE] =
		opensocial.EscapeType.NONE;
	}
	opts.params = params;
	var key    = generateUniqueKey();
	var record = func(key, opts || {});
	record['key']      = key;
	record['callback'] = opts.callback;
	record['scope']    = opts.scope;
	requestRecords.push(record);
  }

  function generateUniqueKey()
  {
	return 'uniqueKey' + nextRequestKey++;
  }

  function setupDataRequest()
  {
	if(!dataRequest) {
	  dataRequest = opensocial.newDataRequest();
	}
	if(requestTimerId === null) {
	  requestTimerId = setTimeout(sendDataRequest, 0);
	}
  }

  function makeIdSpec(idSpec) {
	if(typeof idSpec == 'string') {
	  if(/^(.+)_FRIENDS$/.exec(idSpec)) {
		idSpec = opensocial.newIdSpec({ userId: RegExp.$1, groupId: 'FRIENDS' });
	  } else {
		idSpec = opensocial.newIdSpec({ userId: idSpec, groupId: 'SELF' });
	  }
	}
	return idSpec;
  }

  function sendDataRequest()
  {
	var req     = dataRequest,
	    records = requestRecords;

	requestTimerId = null;
	dataRequest    = null;
	requestRecords = [];

	if(records.length > 0) {
	  req.send(function(response) {
		if(!response.hadError()) {
		  for(var i = 0, l = records.length ; i < l ; ++i) {
			var record = records[i];
			if(typeof record.callback == 'function') {
			  var item  = response.get(record.key),
			      data  = null,
			      error = null;
			  if(!item || item.hadError()) {
				error = new DataRequest.Error(item.getErrorCode(), item.getErrorMessage(), false);
			  } else if(record.hasData) {
				data = item.getData();
			  }
			  record.callback.call(record.scope, data, error);
			}
		  }
		} else {
		  var error = new DataRequest.Error('', response.getErrorMessage(), true);
		  for(var i = 0, l = records.length ; i < l ; ++i) {
			var record = records[i];
			if(typeof response.callback == 'function') {
			  record.callback.call(record.scope, null, error);
			}
		  }
		}
	  });
	}
  }

  return {
	DataRequest : DataRequest
  };
})();

//--------------------------------------------------------------------
// DelayCall

function DelayCall(callback, interval)
{
  this.$callback = callback;
  this.$interval = interval;
  this.$timerId  = null;
};

DelayCall.prototype = {

  invoke : function()
  {
	var self = this;
	if(isNull(self.$timerId)) clearTimeout(self.$timerId);
	self.$timerId = setTimeout(self.$callback, self.$interval);
  }

};


//--------------------------------------------------------------------
// GadgetPreview

var GadgetPreview = (function() {

  var nextID = 0, form = null, textarea = null;

  function nel(tag)
  {
	return document.createElement(tag);
  }

  function htmlUnescape(html)
  {
	html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	html = html.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
	var div = nel('div');
	div.innerHTML = '<pre>' + html + '</pre>';
	return div.textContent !== undefined ? div.textContent : div.innerText;
  }

  function GadgetPreview(previewFrameId, option) {
    if(!(this instanceof GadgetPreview)) {
	  return new GadgetPreview(previewFrameId, option);
	}

	var self = this;
	option   = option || {};

	var previewName   = option['previewName'] || 'gadgetPreview' + nextID++,
	    defaultTitle  = option['title'] || 'no title',
	    defaultWidth  = parseInt(option['width'] || 320, 10),
	    defaultHeight = parseInt(option['height'] || 200, 10),
	    title         = defaultTitle,
	    width         = defaultWidth,
	    height        = defaultHeight,
	    border        = option['border'] ? 1 : 0;

	if(!form) {
	  var div  = nel('DIV');
	  textarea = textarea || nel('TEXTAREA');
	  form     = nel('FORM');
	  textarea.name     = 'rawxml';
	  form.method       = 'POST';
	  div.style.display = 'none';
	  form.appendChild(textarea);
	  div.appendChild(form);
	  document.body.appendChild(div);
	}

	self.update = function(spec)
	{
	  var self  = this;
	  var prefs = spec.substring(0, spec.search(/<(?:UserPref|Content)/));

	  title  = prefs.match(/title="([^\u0022]*)"/) ? htmlUnescape(RegExp.$1) : defaultTitle;
	  width  = prefs.match(/width="(\d+)"/)   ? parseInt(RegExp.$1, 10) : defaultWidth;
	  height = prefs.match(/height="(\d+)"/)  ? parseInt(RegExp.$1, 10) : defaultHeight;

	  try { delete window.frames[previewName]; } catch(e) {}

	  document.getElementById(previewFrameId).innerHTML = [
		'<iframe id="' + previewName + '" name="' + previewName + '"',
		'src="about:blank" frameborder=' + border,
		'width=' + width,
		'height=' + height,
		,'></iframe>'].join(' ')

	  textarea.value = spec;

	  form.action = [
		"http://www.gmodules.com/ig/ifr?",
		"title=" + (window.encodeURIComponent ? encodeURIComponent : escape)(title).replace(/%20/g, "+"),
		"w=" + width,
		"h=" + height,
		"synd=open",
		"nocache=1",
		"output=html"].join("&");
	  form.target = previewName;
	  form.submit();
	};

	self.getPreviewName   = function() { return previewName; };
	self.getTitle         = function() { return title; };
	self.getWidth         = function() { return width; };
	self.getHeight        = function() { return height; };
	self.getDefaultTitle  = function() { return defaultTitle; };
	self.getDefaultWidth  = function() { return defaultWidth; };
	self.getDefaultHeight = function() { return defaultHeight; };

	self = null;
  }

  return GadgetPreview;
})();


//--------------------------------------------------------------------
// TabView

function TabView(opts)
{
  opts = opts || {};

  var self     = this,
	  tabs     = new _IG_Tabs(moduleId, 0, opts.parentId ? gel(opts.parentId) : null),
	  panels   = [],
	  callback = opts.callback,
	  scope    = opts.scope;

  tabs.alignTabs('left');

  function onChange(tabId) {
	for(var i = 0, l = panels.length ; i < l ; ++i) {
	  var panel = panels[i];
	  if(panel.$getId() == tabId && isFunction(panel.$onActivate)) {
		panel.$onActivate.call(panel);
	  }
	}
	if(isFunction(callback)) {
	  callback.call(scope, tabId);
	}
  }

  self.$getPanel  = function(i) { return panels[i]; }
  self.$numPanels = function(i) { return panels.length; }

  self.$getCurrentPanel = function()
  {
	var tab = tabs.getSelectedTab();
	return tab ? panels[tab.getIndex()] : null;
  };

  self.$addPanel = function(panel)
  {
	panels.push(panel);
	tabs.addTab(panel.$getLabel(), {
	  contentContainer : gel(panel.$getId()),
	  callback         : onChange });
  };

  self.$forEach = function(func, scope) {
	for(var i = 0, l = panels.length ; i < l ; ++i) {
	  func.call(scope, panels[i], i, panels);
	}
  };

  self = opts = null;
}


//--------------------------------------------------------------------
// Text editor

function EditorPanel(index)
{
  var self       = this,
	  divId      = generateUniqueId(),
	  textId     = generateUniqueId(),
	  storageTag = 'text' + index,
      template   = ('<textarea id="$0" wrap="off" style="width:100%; height:$1em; font-size:$2px;">' +
					'</textarea>');

  createHiddenDiv(divId, '', tinyTemplate(template, [textId, prefs.getInt('tr'), prefs.getInt('fs')]));

  self.$getId      = function()  { return divId; };
  self.$getLabel   = function()  { return '' + index; };
  self.$getContent = function()  { return gel(textId).value; };
  self.$setContent = function(t) { gel(textId).value = t; };

  self.$save = function()
  {
	Gadget.storageSetData(storageTag, gel(textId).value);
  };

  self.$load = function()
  {
	Gadget.storageGetData(storageTag, this, function(name, value) {
	  if(value) {
		this.$setContent(value);
	  }
	});
  }

  gel(textId).onchange = generateProxy(self, '$save');

  self = null;
}


//--------------------------------------------------------------------
// OutputView

function OutputView()
{
  var self     = this,
      divId    = generateUniqueId(),
      template = ('<pre style="' +
				  'margin:0px; padding:0px; overflow:auto; font-size:$0px; max-height:$1em; $2' +
				  '">$3</pre>');

  createHiddenDiv(divId, tabBorderStyle);

  self.$getId    = function() { return divId; };
  self.$getLabel = function() { return Gadget.getMsg('tab_out'); };

  self.$setText  = function(text, error)
  {
	gel(divId).innerHTML = tinyTemplate(template, [
	  prefs.getInt('fs'),
	  prefs.getInt('or'),
	  error ? 'background-color:#ffaaaa' : '',
	  typeof text === 'undefined' ? Gadget.getMsg('msg_out') : escapeHtml('' + text)]);
  };

  self.$setText();
  Gadget.$addEventHandler('output', generateHandler(this, '$setText'));

  self = null;
}


//--------------------------------------------------------------------
// LogView

function LogView()
{
  var self     = this,
	  divId    = generateUniqueId(),
	  logId    = generateUniqueId(),
	  btnId    = generateUniqueId(),
	  template = ('<div><textarea id="$0" wrap="off" readonly="true"' +
				  ' style="width:100%; height:$1em; font-size:$2px;"></textarea></div>' +
				  '<div style="text-align:right; marginTop:4px;">' +
				  '<input type="button" id="$3" value="$4" /></div>');

  createHiddenDiv(divId, '', tinyTemplate(template, [
	logId,
	prefs.getInt('lr'),
	prefs.getInt('fs'),
	btnId,
	Gadget.getMsg('btn_clr')]));

  self.$getId    = function()  { return divId; };
  self.$onClear  = function()  { gel(logId).value = ''; };
  self.$getLabel = function()  { return Gadget.getMsg('tab_log'); };
  self.$log      = function(t) { gel(logId).value += t; };

  gel(logId).value   = Gadget.getMsg('msg_log');
  gel(btnId).onclick = generateHandler(self, '$onClear');
  Gadget.$addEventHandler('log', generateHandler(self, '$log'));

  self = null;
}


//--------------------------------------------------------------------
// HtmlView

function HtmlView()
{
  var self     = this,
	  divId    = generateUniqueId(),
	  template = '<div style="font-size:$0px;">$1</div>';

  createHiddenDiv(divId, tabBorderStyle);

  self.$getId    = function() { return divId; };
  self.$getLabel = function() { return Gadget.getMsg('tab_htm'); };

  self.$setHTML = function(html)
  {
	gel(divId).innerHTML = html || tinyTemplate(template, [prefs.getInt('fs'), Gadget.getMsg('msg_htm')]);
  };

  self.$setHTML();
  Gadget.$addEventHandler('html', generateHandler(self, '$setHTML'));
}


//--------------------------------------------------------------------
// GadgetView

function GadgetView()
{
  var divId    = generateUniqueId(),
	  tabId    = generateUniqueId(),
	  btnId    = generateUniqueId(),
	  tabs     = null,
	  template = ('<div id="$0"></div>' +
				  '<div style="margin:4px 0px; text-align:right;">' +
				  '<input id="$1" type="button" value="$2" />' +
				  '</div>');

  createHiddenDiv(divId, tabBorderStyle,
				  tinyTemplate(template, [tabId, btnId, Gadget.getMsg('btn_gad')]));

  var SettingPanel = function()
  {
	var self     = this,
	    divId    = generateUniqueId(),
	    titleId  = generateUniqueId(),
	    widthId  = generateUniqueId(),
	    heightId = generateUniqueId(),
	    htmlId   = generateUniqueId(),
	    scriptId = generateUniqueId(),
	    options  = '',
	    tabMsg   = Gadget.getMsg('tab') + ' ',
	    template = ('<table style="width:98%;margin:0px;"><tr>' +
					'<td style="$0">$5</td>' +
					'<td colspan="3" style="$1"><input id="$6" type="text" style="$3" /></td>' +
					'</tr><tr>' +
					'<td style="$0">$7</td>' +
					'<td style="$2"><input id="$8" type="text" style="$3" /></td>' +
					'<td style="$0">$9</td>' +
					'<td style="$2"><input id="$10" type="text" style="$3" /></td>' +
					'</tr><tr>' +
					'<td style="$0">$11</td>' +
					'<td style="$2"><select id="$12" style="$4">$15</select></td>' +
					'<td style="$0">$13</td>' +
					'<td style="$2"><select id="$14" style="$4">' +
					'<option value="0">----</option>$15' +
					'</select></td>' +
					'</table>');

	for(var i = 1 ; i <= 5 ; ++i) {
	  options += '<option value="' + i + '">' + tabMsg + i + '</option>';
	}

	createHiddenDiv(divId, '', tinyTemplate(template, [
	  'width:10%; text-align:right; font-size:12px; overflow:hidden;', // $0
	  'width:89%;',                 // $1
	  'width:39%;',                 // $2
	  'width:100%;font-size:12px;', // $3
	  'width:100%;font-size:12px;', // $4
	  Gadget.getMsg('gad_ttl'),     // $5
	  titleId,                      // $6
	  Gadget.getMsg('gad_wdt'),     // $7
	  widthId,                      // $8
	  Gadget.getMsg('gad_hgt'),     // $9
	  heightId,                     // $10
	  Gadget.getMsg('gad_htm'),     // $11
	  htmlId,                       // $12
	  Gadget.getMsg('gad_scp'),     // $13
	  scriptId,                     // $14
	  options                       // $15
	]));

	self.$getId    = function() { return divId; };
	self.$getLabel = function() { return Gadget.getMsg('tab_set'); };

	self.$getContent = function() {
	  return {
		title:  gel(titleId).value,
		width:  parseInt(gel(widthId).value, 10),
		height: parseInt(gel(heightId).value, 10),
		html:   Gadget.getText(gel(htmlId).value),
		script: Gadget.getText(gel(scriptId).value)
	  };
	};

	self = null;
  };

  var PreviewPanel = function()
  {
	var self     = this,
	    divId    = generateUniqueId();
	    msgId    = generateUniqueId();
	    borderId = generateUniqueId();
	    preview  = null,
	    template = ('<div id="$0" style="font-size:$1px; margin-top: 4px;">$2</div>' +
					'<div id="$3" style="border:1px dotted #676767;margin:0px auto;overflow:auto;display:none;"></div>');

	createHiddenDiv(divId, '', tinyTemplate(template, [
	  msgId, prefs.getInt('fs'), Gadget.getMsg('msg_gad'), borderId]));

	preview = new GadgetPreview( borderId, { height : prefs.getInt('gh') });

	self.$getId      = function() { return divId; };
	self.$getLabel   = function() { return Gadget.getMsg('tab_prv'); };
	self.$onActivate = function() { this.$centering(); }

	self.$centering = function()
	{
	  var border    = gel(borderId),
		  maxWidth  = border.parentNode.offsetWidth,
		  maxHeight = preview.getDefaultHeight();
      if(maxWidth > 0) {
		border.style.width  = (_min(maxWidth,  preview.getWidth())  + 2) + 'px';
		border.style.height = (_min(maxHeight, preview.getHeight()) + 2) + 'px';
      }
	};

	self.$update = function(xml)
	{
	  gel(msgId).style.display    = 'none';
	  gel(borderId).style.display = 'block';
	  preview.update(xml);
	};

	self = null;
  };

  var SourcePanel = function()
  {
	var self = this,
	  divId = generateUniqueId(),
	  srcId = generateUniqueId(),
	  template = ('<textarea id="$0" wrap="off" readonly="true"' +
				  ' style="width:100%; height:10em; font-size:$1px;"></textarea>');

	createHiddenDiv(divId, '', tinyTemplate(template, [srcId, prefs.getInt('fs')]));

	self.$getId    = function() { return divId; };
	self.$getLabel = function() { return Gadget.getMsg('tab_src'); };

	self.$setContent = function(xml)
	{
	  gel(srcId).value = xml;
	};

	self = null;
  };

  this.$onGenerate = function()
  {
	var settings = tabs.$getPanel(0).$getContent();
	var title    = settings.title;
	var width    = settings.width;
	var height   = settings.height;
	var html     = settings.html;
	var script   = settings.script;

	if(title)  { title  = '\n      title="'  + escapeHtml(title) + '"'; } else { title  = ''; }
	if(width)  { width  = '\n      width="'  + width             + '"'; } else { width  = ''; }
	if(height) { height = '\n      height="' + height            + '"'; } else { height = ''; }

	if(script)
	  script = '\u003cscript type="text/javascript"\u003e\n' + script + '\n\u003c/script\u003e';

	var text = [
	  '<?xml version="1.0" encoding="UTF-8" ?>',
	  '<Module>',
	  '  <ModulePrefs' + title + width + height + '>',
	  '    <Require feature="setprefs" />',
	  '    <Require feature="settitle" />',
	  '    <Require feature="dynamic-height" />',
	  '    <Require feature="tabs" />',
	  '    <Require feature="drag" />',
	  '    <Require feature="grid" />',
	  '    <Require feature="minimessage" />',
	  '    <Require feature="analytics" />',
	  '    <Require feature="flash" />',
	  '  </ModulePrefs>',
	  '  <Content type="html">',
	  '    \u003c![CDATA[',
	  html,
	  script,
	  '    ]]\u003e',
	  '  </Content>',
	  '</Module>'].join('\n');

	tabs.$getPanel(2).$setContent(text);
	tabs.$getPanel(1).$update(text);
	tabs.$getPanel(1).$centering();

	Gadget.adjustHeight();
  };

  this.$getId       = function() { return divId; };
  this.$getLabel    = function() { return Gadget.getMsg('tab_gad'); };
  this.$onChangeTab = function() { Gadget.adjustHeight(); };

  tabs = new TabView({ parentId: tabId, callback: generateHandler(this, '$onChangeTab') });
  tabs.$addPanel(new SettingPanel());
  tabs.$addPanel(new PreviewPanel());
  tabs.$addPanel(new SourcePanel());

  gel(btnId).onclick = generateHandler(this, '$onGenerate');
}


//--------------------------------------------------------------------
// ToolsView

function toolHtmlEscape()
{
  Gadget.setCurrentText(escapeHtml(Gadget.getCurrentText()));
}

function toolHtmlUnescape()
{
  var text = Gadget.getCurrentText();
  text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  text = text.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  var div = nel('div');
  div.innerHTML = '<pre>' + text + '</pre>';
  Gadget.setCurrentText(gtx(div));
}

function toolUrlEscape()
{
  Gadget.setCurrentText(escapeUrl(Gadget.getCurrentText()));
}

function toolUrlUnescape()
{
  Gadget.setCurrentText(unescapeUrl(Gadget.getCurrentText()));
}

function ToolBookmarkletize(frame)
{
  var builder = new DomBuilder();
  builder.build(frame, [
	{ tag:'DIV', index:'msg', html:Gadget.getMsg('tol_bkm') },
	{ tag:'DIV', index:'result', style:{display:'none'}, cn:[
	  { tag:'DIV', cn: { tag:'A', index:'link', html:Gadget.getMsg('tol_bkc')} },
	  { tag:'DIV', style:{marginTop:'4px'}, cn: [
		{ tag:'DIV', html:Gadget.getMsg('tol_src') },
		{ tag:'TEXTAREA', index:'source', style:{width:'100%', height:'5em', fontSize:'12px'}, readonly:'true', wrap:'soft' }
	  ]}
	]}
  ]);
  this.$doms = builder.getElements();
  this.$pattern = new RegExp([
	'//.*',
	'/\\*(?:[^*]|\\*(?!/))+\\*/',
	'(\'|")(?:[^\\\\\\1]|\\\\.)*?\\1',
	'([^.)\\]$\\w\\s]\\s*)(/(?![/\\*])(?:[^\\\\/\\[]|\\\\.|\\[(?:[^\\\\\\]]|\\\\.)*\\])*?/)'
  ].join('|'), 'g');
}
ToolBookmarkletize.prototype = {
  onExecute : function()
  {
	var text     = Gadget.getCurrentText();
	var literals = [];
	text = text.replace(/\r\n?/g, '\n');
	text = text.replace(/\~/g, '~T');
	text = text.replace(/\+\+/g, '~P');
	text = text.replace(/\-\-/g, '~M');
	text = text.replace(this.$pattern, function(m0, m1, m2, m3) {
	  if(m1)
	  {
		literals[literals.length] = m0;
		return '~S';
	  }
	  else if(m2 && m3)
	  {
		literals[literals.length] = m3;
		return m2 + '~S';
	  }
	  else
	  {
		return '';
	  }
	});
	text = text.replace(/\s+/g, ' ');
	text = text.replace(/^ +| +$/g, '');
	text = text.replace(/\~S/g, function(){
	  return literals.shift();
	});
	text = text.replace(/\~P/g, '++').replace(/\~M/g, '--').replace(/\~T/g, '~');

	this.$doms.link.href    = 'javascript:' + '(function(){' + text + '})()';
	this.$doms.source.value = text;

	this.$doms.msg.style.display    = 'none';
	this.$doms.result.style.display = 'block';

	Gadget.adjustHeight();
  }
};

function ToolsView()
{
  this.$doms    = null;
  this.$entries = [];

  var options = [];
  for(var i = 0 ; i < ToolsView.$template.length ; ++i)
  {
	var template = ToolsView.$template[i];
	options[i] = {tag:'OPTION', value:i, html:Gadget.getMsg(template.label)};
	var entry = {};
	if(isFunction(template.cls))
	{
	  var div = nel('DIV');
	  div.style.display   = 'none';
	  div.style.fontSize  = Gadget.getPrefValue('fontSize') + 'px';
	  div.style.marginTop = '4px';
	  entry.scope = new template.cls(div);
	  entry.func  = entry.scope.onExecute;
	  entry.frame = div;
	}
	else if(isFunction(template.func))
	{
	  entry.scope = window;
	  entry.func  = template.func;
	}
	this.$entries[i] = entry;
  }

  var builder = new DomBuilder();
  builder.build({
	tag:'DIV', index:'frame', id:Gadget.generateId(), cls:Gadget.getPrefix('extraframe'), cn:[
	  { tag:'DIV', cn:[
		{ tag:'SELECT', index:'select', cn:options},
		{ tag:'INPUT', index:'execute', type:'button', value:Gadget.getMsg('tol_exe'), style:{marginLeft:'8px'} }
	  ]},
	  { tag:'DIV', index:'content' }
	]
  });
  this.$doms = builder.getElements();
  this.$doms.execute.onclick = generateHandler(this, '$onExecute');
  this.$doms.select.onchange = generateHandler(this, '$onChange');
  _document.body.appendChild(this.$doms.frame);

  for(var i = 0 ; i < this.$entries.length ; ++i)
  {
	if(this.$entries[i].frame)
	  this.$doms.content.appendChild(this.$entries[i].frame);
  }
}

ToolsView.$template = [
  { label:'tol_hes', func:toolHtmlEscape },
  { label:'tol_hue', func:toolHtmlUnescape },
  { label:'tol_ues', func:toolUrlEscape },
  { label:'tol_uue', func:toolUrlUnescape },
  { label:'tol_bkl', cls: ToolBookmarkletize }
];

ToolsView.prototype = {

  $onExecute : function()
  {
	var value = parseInt(this.$doms.select.value, 10);
	if(0 <= value && value < this.$entries.length)
	{
	  var entry = this.$entries[value];
	  if(typeof entry.func === 'function')
		entry.func.call(entry.scope);
	}
  },

  $onChange : function()
  {
	var selected = parseInt(this.$doms.select.value, 10);
	for(var i = 0 ; i < this.$entries.length ; ++i)
	{
	  if(this.$entries[i].frame)
		this.$entries[i].frame.style.display = (i == selected ? 'block' : 'none');
	}
	Gadget.adjustHeight();
  },

  $getId : function()
  {
	return this.$doms.frame.id;
  },

  $getLabel : function()
  {
	return Gadget.getMsg('tab_tol');
  }

};


//--------------------------------------------------------------------
// jsconsole

function JSConsole()
{
  this.$prefix = '\n----\n'
}

JSConsole.prototype = {

  log : function(text)
  {
    Gadget.log(this.$prefix + text);
    this.$prefix = '';
  },

  getPrefs : function()
  {
    return Gadget.getPrefs();
  }

};


//--------------------------------------------------------------------
// Main module

var Gadget = {

  $nextId     : 0,
  $prefs      : prefs,
  $prefix     : 'mod' + moduleId,
  $flash      : null,
  $storageId  : 'mod' + moduleId + 'JsConsoleStorage',
  $storageHdl : null,
  $storage    : {},
  $textView   : null,
  $extraTabs  : null,
  $extraPanels: [],
  $minimsg    : null,
  $events     : { output:[], log:[], html:[] },

  $prefsMap : {
	prefsVer        : 'pr',
	fontSize        : 'fs',
	textRows        : 'tr',
	maxOutputRows   : 'or',
	logRows         : 'lr',
	maxGadgetHeight : 'gh',
	saveText        : 'sv'
  },

  $addEventHandler : function(event, func)
  {
	if(this.$events[event]) {
	  this.$events[event].push(func);
	}
  },

  $invokeEvent : function(event) {
	var handlers = this.$events[event] || [],
	    args     = Array.prototype.slice.call(arguments, 1);
	for(var i = 0, l = handlers.length ; i < l ; ++i) {
	  handlers[i].apply(window, args);
	}
  },

  init : function()
  {
	this.$textView   = new TabView();
	this.$minimsg    = new _IG_MiniMessage(moduleId);
	this.$storageHdl = new DelayCall(generateProxy(this, 'onStorageFlush'), 3000);

	if(this.$prefs.getBool('sv') && !useOpenSocial) {
	  if(this.$prefs.getBool('sm')) {
		var msg = this.getMsg('msg_sav').replace(/_\_MODULE_ID__/, moduleId).replace(/^\s+|\s+$/,'');
		this.$minimsg.createDismissibleMessage(msg, generateHandler(this, '$onSaveWarningDismissed'));
	  }
	} else if(!this.$prefs.getBool('sm')) {
	  this.$prefs.set('sm', 1);
	}

	if(/synd=ig/.test(_document.location)) {
	  for(var i = 0 ; i <= 0 ; ++i) {
		var prefs = this.$prefs;
		var index = ('00' + i).substr(-3);
		var msg   = (this.getMsg('notification' + index)||'').replace(/_\_MODULE_ID__/, moduleId);
		if(msg && prefs.getBool('n' + index)) {
		  this.$minimsg.createDismissibleMessage(msg, function() {
			prefs.set('n' + index, '0');
			setTimeout(function() { _IG_AdjustIFrameHeight(); }, 0);
			return true;
		  });
		}
	  }
	}

	for(var i = 0 ; i < 5 ; ++i) {
	  this.$textView.$addPanel(new EditorPanel(i + 1));
	}
	if(this.storageIsOk()) {
	  this.$textView.$forEach(function(panel) { panel.$load(); });
	}

	this.$initExtraViews();
	this.$initButtons();
	this.adjustHeight();
  },

  $initButtons : function()
  {
	var self      = this;
	var builder   = new DomBuilder();
	var container = gel(self.$prefix + 'buttons');

	container.style.margin = '4px 0px';

	var style = { marginRight:'8px' };
	builder.build(container, [
	  { tag:'DIV', style:'float:right', cn:[
		{ tag:'INPUT', index:'clr', type:'button', value:self.getMsg('btn_clr')} ] },
	  { tag:'DIV', cn:[
		{ tag:'INPUT', index:'run', type:'button', value:self.getMsg('btn_run'), style:style },
		{ tag:'INPUT', index:'htm', type:'button', value:self.getMsg('btn_htm'), style:style } ] }
	]);

	builder.getEl('run').onclick = generateHandler(self, '$onRunAsScript');
	builder.getEl('htm').onclick = generateHandler(self, '$onReplaceHTML');
	builder.getEl('clr').onclick = generateHandler(self, '$onClearText');
  },

  $initExtraViews : function()
  {
	var panels = this.$extraPanels;

	this.$extraTabs  = new _IG_Tabs(moduleId, 0, gel(this.$prefix + 'extraview'));
	panels.push(new OutputView());
	panels.push(new LogView());
	panels.push(new HtmlView());
	panels.push(new GadgetView());
	panels.push(new ToolsView());

	this.$extraTabs.alignTabs('left');

	for(var i = 0 ; i < panels.length ; ++i)
	{
	  var panel    = panels[i],
		  label    = panel.$getLabel(),
		  content  = gel(panel.$getId()),
		  callback = generateHandler(this, '$onChangeTab');
	  this.$extraTabs.addTab(label, {
		contentContainer : content,
		callback         : callback});
	}
  },

  $onRunAsScript : function()
  {
	var text = this.$textView.$getCurrentPanel().$getContent();
	var output = '';
	var error  = false;
	try
	{
	  output = (function() {
		window.jsconsole = new JSConsole();
		return this.$eval(text);
	  }).call(this);
	}
	catch(e)
	{
	  output = e.message || e.description || String(e);
	  error  = true;
	}
	this.$invokeEvent('output', output, error);
	this.adjustHeight();
  },

  $onClearText : function()
  {
	var panel = this.$textView.$getCurrentPanel();
	panel.$setContent('');
	panel.$save();
  },

  $onReplaceHTML : function()
  {
	this.$invokeEvent('html', this.$textView.$getCurrentPanel().$getContent());
	this.adjustHeight();
  },

  $onChangeTab : function()
  {
	this.adjustHeight();
  },

  $onSaveWarningDismissed : function()
  {
	this.$prefs.set('sm', 0);
	Gadget.adjustHeight();
	return true;
  },

  adjustHeight : function()
  {
	_IG_AdjustIFrameHeight();
  },

  generateId : function()
  {
	return this.$prefix + 'generatedId' + this.$nextId++;
  },

  getModuleId : function()
  {
	return moduleId;
  },

  getPrefix : function(text)
  {
	return this.$prefix + text;
  },

  getPrefs : function()
  {
	return this.$prefs;
  },

  getPrefValue : function(name)
  {
	return this.$prefs.getString(this.$prefsMap[name] || name);
  },

  getPrefBool : function(name)
  {
	return this.$prefs.getBool(this.$prefsMap[name] || name);
  },

  getMsg : function(id)
  {
	return this.$prefs.getMsg(id);
  },

  getText : function(index)
  {
	var panel = this.$textView.$getPanel(index - 1);
	return panel ? panel.$getContent() : '';
  },

  getCurrentText : function()
  {
	return this.$textView.$getCurrentPanel().$getContent();
  },

  setCurrentText : function(newText)
  {
	this.$textView.$getCurrentPanel().$setContent(newText);
  },

  log : function(text)
  {
	this.$invokeEvent('log', text);
  },

  onStorageReady : function()
  {
	if(!useOpenSocial) {
	  this.$flash = gel(Gadget.getPrefix('JsConsoleStorage'));
	  this.$flash.open(this.$storageId);
	  if(this.$textView) {
		this.$textView.$forEach(function(panel) { panel.$load() });
	  }
	}
  },

  onStorageFlush : function()
  {
	if(useOpenSocial) {
	  var storage = this.$storage;
	  for(var i in storage) {
		SocialGoodies.DataRequest.storeAppData('VIEWER', i, storage[i]);
	  }
	} else if(this.$flash) {
	  this.$flash.flush();
	}
  },

  storageSetData : function(name, value)
  {
	if(useOpenSocial) {
	  this.$storage[name] = value;
	  this.$storageHdl.invoke();
	} else if(this.$flash) {
	  this.$flash.setData(name, value);
	  this.$storageHdl.invoke();
	}
  },

  storageGetData : function(name, scope, callback)
  {
	if(useOpenSocial) {
	  SocialGoodies.DataRequest.fetchAppData('VIEWER', name, {
		escape   : 'none',
		callback : function(data) {
		  for(var i in data) {
			callback.call(scope, name, data[i][name]);
			break;
		  }
		}
	  });
	} else if(this.$flash) {
	  callback.call(scope, name, this.$flash.getData(name));
	}
  },

  storageIsOk : function()
  {
	return this.$flash ? this.$flash.isOk() : useOpenSocial;
  },

  useLegacy     : useLegacy,
  useOpenSocial : useOpenSocial

};

if(window.Components) {
  Gadget.init();
} else {
  _IG_RegisterOnloadHandler(function(){ Gadget.init(); });
}

return Gadget;

})();

// If eval is directly called in the above namespace, YUI Compressor cannot shorten symbols.
Gadget.$eval = function(text) {
  return eval(text);
}
