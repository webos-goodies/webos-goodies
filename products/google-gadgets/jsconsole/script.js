var u = {};

//--------------------------------------------------------------------
// Enviroment detection

u.useLegacy     = !(window.gadgets && gadgets.views && gadgets.views.getCurrentView() !== undefined);
u.useOpenSocial = !u.useLegacy && !!window.opensocial;

//--------------------------------------------------------------------
// type detection

u.isNull     = function(obj) { return obj === null; };
u.isFunction = function(obj) { return typeof obj === 'function'; };
u.isString   = function(obj) { return typeof obj === 'string'; };


//--------------------------------------------------------------------
// Utilities

u.generateHandler = function($self, $name)
{
  var $method = $self[$name];
  return function() { $method.apply($self, arguments) };
};

u.generateProxy = function($self, $name)
{
  var $method = $self[$name];
  var $args   = [];
  for(var i = 2 ; i < arguments.length ; ++i)
	$args[$args.length] = arguments[i];
  return function() { $method.apply($self, $args) };
};


//--------------------------------------------------------------------
// DOM handling

u.nel = function(tag)
{
  return document.createElement(tag);
};

u.nfg = function()
{
  return document.createDocumentFragment();
};

u.gel = function(id)
{
  return document.getElementById(id);
};

u.gtx = function($element_or_id)
{
  var $el = u.isString($element_or_id) ? u.gel($element_or_id) : $element_or_id;
  return $el.textContent !== undefined ? $el.textContent : $el.innerText;
};


//--------------------------------------------------------------------
// text operation

u.hesc = function(a)
{
  a = a.replace(/&/g, '&amp;');
  a = a.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  a = a.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  return a;
};

u.esc = function(a)
{
  return (window.encodeURIComponent ? encodeURIComponent(a) : escape(a)).replace(/\%20/g, '+');
};

u.unesc = function (a)
{
  a = a.replace(/\+/g, '%20');
  return window.decodeURIComponent ? decodeURIComponent(a) : unescape(a);
};


//--------------------------------------------------------------------
// DomBuilder

u.DomBuilder = function()
{
  this._nodes = {};
};

u.DomBuilder.prototype = {

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
	if(!root) root = document.createDocumentFragment();
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
	  var el = document.createElement(tree.tag ? tree.tag : 'DIV');
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
	  for(i in styles)
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

u.DelayCall = function($callback, $interval)
{
  this.$callback = $callback;
  this.$interval = $interval;
  this.$timerId  = null;
};

u.DelayCall.prototype = {

  invoke : function()
  {
	if(u.isNull(this.$timerId)) clearTimeout(this.$timerId);
	this.$timerId = setTimeout(this.$callback, this.$interval);
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
// Text editor

function TextView()
{
  this.$tabs      = new _IG_Tabs(Gadget.getModuleId());
  this.$numTexts  = 5;
  this.$doms      = null;

  // create tab contents.
  var $tree      = [];
  var $textStyle =
	'width:100%;' +
	'height:' + parseInt(Gadget.getPrefValue('textRows'), 10) + 'em;' +
	'font-size:' + parseInt(Gadget.getPrefValue('fontSize'), 10) + 'px;';
  for(var i = 1 ; i <= this.$numTexts ; ++i)
  {
	$tree.push({
	  tag: 'DIV', index: 'tab' + i, id: Gadget.generateId(),	cn: [
		{ tag: 'TEXTAREA', index: 'text' + i, id: Gadget.generateId(), wrap: 'off', style: $textStyle }
	  ]
	});
  }
  var $builder = new u.DomBuilder();
  $builder.build($tree);
  this.$doms = $builder.getElements();

  this.$tabs.alignTabs('left');
  for(var i = 1 ; i <= this.$numTexts ; ++i)
  {
	var $dom = this.$doms['text' + i];
	$dom.onchange = u.generateProxy(this, '$onChange', i);
	this.$tabs.addTab(i, {
	  contentContainer : this.$doms['tab' + i] });
  }

  this.onStorageReady();
}

TextView.prototype = {

  $getContent : function($index)
  {
	var i = parseInt($index, 10);
	return (0 < $index && $index <= this.$numTexts) ? this.$doms['text' + $index] : null;
  },

  $getCurrentIndex : function()
  {
	return this.$tabs.getSelectedTab().getIndex() + 1;
  },

  $onChange : function($index)
  {
	this.$saveText($index);
  },

  $saveText : function($index)
  {
	if(0 < $index && $index <= this.$numTexts)
	{
	  $index = 'text' + $index;
	  Gadget.storageSetData($index, this.$doms[$index].value);
	}
  },

  onStorageReady : function()
  {
	if(Gadget.storageIsOk())
	{
	  for(var i = 1 ; i <= this.$numTexts ; ++i)
	  {
		Gadget.storageGetData('text' + i, this, function($name, $value) {
		  if($value) {
			this.$doms[$name].value = $value;
		  }
		});
	  }
	}
  },

  getText : function($index)
  {
	var $content = this.$getContent($index);
	return $content ? $content.value : '';
  },

  getCurrentText : function()
  {
	var $current = this.$getContent(this.$getCurrentIndex());
	return $current ? $current.value : '';
  },

  setCurrentText : function($newText)
  {
	var $index   = this.$getCurrentIndex();
	var $current = this.$getContent($index);
	if($current)
	  $current.value = $newText;
	this.$saveText($index);
  },

  clearCurrentText : function()
  {
	var $index   = this.$getCurrentIndex();
	var $current = this.$getContent($index);
	if($current) $current.value = '';
	this.$saveText($index);
  }

};


//--------------------------------------------------------------------
// OutputView

function OutputView()
{
  this.$frame = u.nel('DIV');

  this.$frame.id        = Gadget.generateId();
  this.$frame.className = Gadget.getPrefix('extraframe');
  this.setText();
}

OutputView.prototype = {

  getTabLabel : function()
  {
	return Gadget.getMsg('tab_out');
  },

  getContent : function()
  {
	return this.$frame;
  },

  setText : function($text, $error)
  {
	var $msg = typeof $text === 'undefined' ? Gadget.getMsg('msg_out') : u.hesc(String($text));
	var $style =
	  'margin:0px; padding:0px; overflow:auto;' +
	  'font-size:' + parseInt(Gadget.getPrefValue('fontSize'), 10) + 'px;' +
	  'max-height:' + parseInt(Gadget.getPrefValue('maxOutputRows'), 10) + 'em;';
	if($error)
	  $style += 'background-color:#ffaaaa';
	this.$frame.innerHTML = '<pre style="' + $style + '">' + $msg + '</pre>';
  }

}


//--------------------------------------------------------------------
// LogView

function LogView()
{
  this.$doms = null;

  var $builder = new u.DomBuilder();
  var $textStyle =
	'width:100%;' +
	'height:' + parseInt(Gadget.getPrefValue('logRows'), 10) + 'em;' +
	'font-size:' + parseInt(Gadget.getPrefValue('fontSize'), 10) + 'px;';
  $builder.build({
	tag:'DIV', index:'frame', id:Gadget.generateId(), cn:[
	  { tag:'DIV', cn:
		{ tag:'TEXTAREA', index:'log', style:$textStyle, wrap:'off', readonly:'true' } },
	  { tag:'DIV', style:{ textAlign:'right', marginTop:'4px' }, cn:
		{ tag:'INPUT', index:'clr', type:'button', value:Gadget.getMsg('btn_clr') } }
	]
  });
  this.$doms = $builder.getElements();
  this.$doms.log.value   = Gadget.getMsg('msg_log');
  this.$doms.clr.onclick = u.generateHandler(this, '$onClear');
}

LogView.prototype = {

  $onClear : function()
  {
	this.$doms.log.value = '';
  },

  getTabLabel : function()
  {
	return Gadget.getMsg('tab_log');
  },

  getContent : function()
  {
	return this.$doms.frame;
  },

  log : function($text)
  {
	this.$doms.log.value += $text;
  }

}


//--------------------------------------------------------------------
// HtmlView

function HtmlView()
{
  this.$frame = u.nel('DIV');

  this.$frame.id        = Gadget.generateId();
  this.$frame.className = Gadget.getPrefix('extraframe');
  this.setHTML();
}

HtmlView.prototype = {

  getTabLabel : function()
  {
	return Gadget.getMsg('tab_htm');
  },

  getContent : function()
  {
	return this.$frame;
  },

  setHTML : function($html)
  {
	if(typeof $html === 'undefined')
	{
	  var $style = 'font-size:' + parseInt(Gadget.getPrefValue('fontSize'), 10) + 'px;';
	  this.$frame.innerHTML = '<div style="' + $style + '">' + Gadget.getMsg('msg_htm') + '</div>';
	}
	else
	{
	  this.$frame.innerHTML = String($html);
	}
  }

}


//--------------------------------------------------------------------
// GadgetView

function GadgetView()
{
  this.$doms        = null;
  this.$tabs        = null;
  this.$settingDoms = null;
  this.$previewDoms = null;
  this.$sourceDoms  = null;
  this.$gadget      = null;

  var $builder = new u.DomBuilder();
  $builder.build({
	tag:'DIV', index:'frame', id:Gadget.generateId(), cls:Gadget.getPrefix('extraframe'), style:{display:'none'}, cn:[
	  { tag:'DIV', index:'tabs' },
	  { tag:'DIV', style:{margin:'4px 0px', textAlign:'right'}, cn:[
		{ tag:'INPUT', index:'generate', type:'button', value:Gadget.getMsg('btn_gad') } ] }
	]
  });
  this.$doms = $builder.getElements();

  this.$tabs = new _IG_Tabs(Gadget.getModuleId(), 0, this.$doms.tabs);
  this.$tabs.alignTabs('left');
  this.$initSettingTab();
  this.$initPreviewTab();
  this.$initSourceTab();

  this.$doms.generate.onclick = u.generateHandler(this, '$onGenerate');
}

GadgetView.prototype = {

  $initSettingTab : function()
  {
	var $tableStyle = 'width:98%;margin:0px;';
	var $labelStyle = 'width:10%; text-align:right; font-size:12px; overflow:hidden;';
	var $formStyle1 = 'width:89%;';
	var $formStyle2 = 'width:39%;';
	var $tboxStyle  = 'width:100%;font-size:12px;'
	  var $selStyle   = 'width:100%;font-size:12px;'

	var $builder = new u.DomBuilder();
	$builder.build({ tag:'DIV', index:'frame', cn:{ tag:'TABLE', style:$tableStyle, cn:{ tag:'TBODY', cn:[
	  { tag:'TR', cn:[
		{ tag:'TD', style:$labelStyle, html:Gadget.getMsg('gad_ttl') },
		{ tag:'TD', colSpan:'3', style:$formStyle1, cn:
		  { tag:'INPUT', index:'title', type:'text', style:$tboxStyle } }
	  ] },
	  { tag:'TR', cn:[
		{ tag:'TD', style:$labelStyle, html:Gadget.getMsg('gad_wdt') },
		{ tag:'TD', style:$formStyle2, cn:{ tag:'INPUT', index:'width', type:'text', style:$tboxStyle } },
		{ tag:'TD', style:$labelStyle, html:Gadget.getMsg('gad_hgt') },
		{ tag:'TD', style:$formStyle2, cn:{ tag:'INPUT', index:'height', type:'text', style:$tboxStyle } }
	  ] },
	  { tag:'TR', cn:[
		{ tag:'TD', style:$labelStyle, html:Gadget.getMsg('gad_htm') },
		{ tag:'TD', style:$formStyle2, cn:
		  { tag:'SELECT', index:'html', style:$selStyle, cn:[
			{ tag:'OPTION', value:'1', html:Gadget.getMsg('tab') + ' 1' },
			{ tag:'OPTION', value:'2', html:Gadget.getMsg('tab') + ' 2' },
			{ tag:'OPTION', value:'3', html:Gadget.getMsg('tab') + ' 3' },
			{ tag:'OPTION', value:'4', html:Gadget.getMsg('tab') + ' 4' },
			{ tag:'OPTION', value:'5', html:Gadget.getMsg('tab') + ' 5' }
		  ] }
		},
		{ tag:'TD', style:$labelStyle, html:Gadget.getMsg('gad_scp') },
		{ tag:'TD', style:$formStyle2, cn:
		  { tag:'SELECT', index:'script', style:$selStyle, cn:[
			{ tag:'OPTION', value:'0', html:'----' },
			{ tag:'OPTION', value:'1', html:Gadget.getMsg('tab') + ' 1' },
			{ tag:'OPTION', value:'2', html:Gadget.getMsg('tab') + ' 2' },
			{ tag:'OPTION', value:'3', html:Gadget.getMsg('tab') + ' 3' },
			{ tag:'OPTION', value:'4', html:Gadget.getMsg('tab') + ' 4' },
			{ tag:'OPTION', value:'5', html:Gadget.getMsg('tab') + ' 5' }
		  ] }
		}
	  ] }
	] } } });
	this.$settingDoms = $builder.getElements();
	this.$tabs.addTab(Gadget.getMsg('tab_set'), {
	  contentContainer : this.$settingDoms.frame,
	  callback         : u.generateHandler(this, '$onChangeTab') });
  },

  $initPreviewTab : function()
  {
	this.$previewDoms = {
	  frame:   _gel(Gadget.getPrefix('gadgetframe')),
	  msg:     _gel(Gadget.getPrefix('gadgetmsg')),
	  border:  _gel(Gadget.getPrefix('gadgetborder'))
	};
	this.$tabs.addTab(Gadget.getMsg('tab_prv'), {
	  contentContainer : this.$previewDoms.frame,
	  callback         : u.generateHandler(this, '$onChangeTab') });

	this.$gadget = new GadgetPreview(
	  this.$previewDoms.border.id,
	  { 'height' : parseInt(Gadget.getPrefValue('maxGadgetHeight'), 10) });
  },

  $initSourceTab : function()
  {
	var $textStyle = {width:'100%',height:'10em',fontSize:parseInt(Gadget.getPrefValue('fontSize'),10)+'px'};
	var $builder   = new u.DomBuilder();
	$builder.build({
	  tag:'DIV', index:'frame', cn:{
		tag:'TEXTAREA', index:'source', style:$textStyle, readonly:'true'
	  }
	});
	this.$sourceDoms = $builder.getElements();
	this.$tabs.addTab(Gadget.getMsg('tab_src'), {
	  contentContainer : this.$sourceDoms.frame,
	  callback         : u.generateHandler(this, '$onChangeTab') });
  },

  $onGenerate : function()
  {
	var title  = this.$settingDoms.title.value;
	var width  = parseInt(this.$settingDoms.width.value,  10);
	var height = parseInt(this.$settingDoms.height.value, 10);
	var html   = Gadget.getText(this.$settingDoms.html.value);
	var script = Gadget.getText(this.$settingDoms.script.value);

	if(title)  { title  = '\n      title="'  + u.hesc(title) + '"'; } else { title  = ''; }
	if(width)  { width  = '\n      width="'  + width         + '"'; } else { width  = ''; }
	if(height) { height = '\n      height="' + height        + '"'; } else { height = ''; }

	if(script)
	  script = '<scr' + 'ipt type="text/javascript">\n' + script + '\n</scr' + 'ipt>';

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
	  '    <![' + 'CDATA[',
	  html,
	  script,
	  '    ]' + ']>',
	  '  </Content>',
	  '</Module>'].join('\n');
	this.$sourceDoms.source.value = text;

	this.$previewDoms.msg.style.display    = 'none';
	this.$previewDoms.border.style.display = 'block';

	this.$gadget.update(text);

	this.$centeringPreview();
	Gadget.adjustHeight();
  },

  $onChangeTab : function($tabId)
  {
	if(this.$previewDoms && this.$previewDoms.frame.id == $tabId)
	  this.$centeringPreview();
	Gadget.adjustHeight();
  },

  $centeringPreview : function()
  {
	var $border = this.$previewDoms.border;
    var $maxWidth  = $border.parentNode.offsetWidth;
    var $maxHeight = this.$gadget.getDefaultHeight();
    if($maxWidth > 0)
    {
	  $border.style.width  = (_min($maxWidth,  this.$gadget.getWidth())  + 2) + 'px';
	  $border.style.height = (_min($maxHeight, this.$gadget.getHeight()) + 2) + 'px';
    }
  },

  getTabLabel : function()
  {
	return Gadget.getMsg('tab_gad');
  },

  getContent : function()
  {
	return this.$doms.frame;
  }

}


//--------------------------------------------------------------------
// ToolsView

function toolHtmlEscape()
{
  Gadget.setCurrentText(u.hesc(Gadget.getCurrentText()));
}

function toolHtmlUnescape()
{
  var $text = Gadget.getCurrentText();
  $text = $text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  $text = $text.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  var $div = u.nel('div');
  $div.innerHTML = '<pre>' + $text + '</pre>';
  Gadget.setCurrentText(u.gtx($div));
}

function toolUrlEscape()
{
  Gadget.setCurrentText(u.esc(Gadget.getCurrentText()));
}

function toolUrlUnescape()
{
  Gadget.setCurrentText(u.unesc(Gadget.getCurrentText()));
}

function ToolBookmarkletize($frame)
{
  var $builder = new u.DomBuilder();
  $builder.build($frame, [
	{ tag:'DIV', index:'msg', html:Gadget.getMsg('tol_bkm') },
	{ tag:'DIV', index:'result', style:{display:'none'}, cn:[
	  { tag:'DIV', cn: { tag:'A', index:'link', html:Gadget.getMsg('tol_bkc')} },
	  { tag:'DIV', style:{marginTop:'4px'}, cn: [
		{ tag:'DIV', html:Gadget.getMsg('tol_src') },
		{ tag:'TEXTAREA', index:'source', style:{width:'100%', height:'5em'}, readonly:'true', wrap:'soft' }
	  ]}
	]}
  ]);
  this.$doms = $builder.getElements();
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
	var $text     = Gadget.getCurrentText();
	var $literals = [];
	$text = $text.replace(/\r\n?/g, '\n');
	$text = $text.replace(/\~/g, '~T');
	$text = $text.replace(/\+\+/g, '~P');
	$text = $text.replace(/\-\-/g, '~M');
	$text = $text.replace(this.$pattern, function(m0, m1, m2, m3) {
	  if(m1)
	  {
		$literals[$literals.length] = m0;
		return '~S';
	  }
	  else if(m2 && m3)
	  {
		$literals[$literals.length] = m3;
		return m2 + '~S';
	  }
	  else
	  {
		return '';
	  }
	});
	$text = $text.replace(/\s+/g, ' ');
	$text = $text.replace(/^ +| +$/g, '');
	$text = $text.replace(/\~S/g, function(){
	  return $literals.shift();
	});
	$text = $text.replace(/\~P/g, '++').replace(/\~M/g, '--').replace(/\~T/g, '~');

	this.$doms.link.href    = 'javascript:' + '(function(){' + $text + '})()';
	this.$doms.source.value = $text;

	this.$doms.msg.style.display    = 'none';
	this.$doms.result.style.display = 'block';

	Gadget.adjustHeight();
  }
};

function ToolsView()
{
  this.$doms    = null;
  this.$entries = [];

  var $options = [];
  for(var i = 0 ; i < ToolsView.$template.length ; ++i)
  {
	var $template = ToolsView.$template[i];
	$options[i] = {tag:'OPTION', value:i, html:Gadget.getMsg($template.label)};
	var $entry = {};
	if(u.isFunction($template.cls))
	{
	  $div = u.nel('DIV');
	  $div.style.display   = 'none';
	  $div.style.fontSize  = Gadget.getPrefValue('fontSize') + 'px';
	  $div.style.marginTop = '4px';
	  $entry.scope = new $template.cls($div);
	  $entry.func  = $entry.scope.onExecute;
	  $entry.frame = $div;
	}
	else if(u.isFunction($template.func))
	{
	  $entry.scope = window;
	  $entry.func  = $template.func;
	}
	this.$entries[i] = $entry;
  }

  var $builder = new u.DomBuilder();
  $builder.build({
	tag:'DIV', index:'frame', id:Gadget.generateId(), cls:Gadget.getPrefix('extraframe'), cn:[
	  { tag:'DIV', cn:[
		{ tag:'SELECT', index:'select', cn:$options},
		{ tag:'INPUT', index:'execute', type:'button', value:Gadget.getMsg('tol_exe'), style:{marginLeft:'8px'} }
	  ]},
	  { tag:'DIV', index:'content' }
	]
  });
  this.$doms = $builder.getElements();
  this.$doms.execute.onclick = u.generateHandler(this, '$onExecute');
  this.$doms.select.onchange = u.generateHandler(this, '$onChange');

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
	var $value = parseInt(this.$doms.select.value, 10);
	if(0 <= $value && $value < this.$entries.length)
	{
	  var $entry = this.$entries[$value];
	  if(typeof $entry.func === 'function')
		$entry.func.call($entry.scope);
	}
  },

  $onChange : function()
  {
	var $selected = parseInt(this.$doms.select.value, 10);
	for(var i = 0 ; i < this.$entries.length ; ++i)
	{
	  if(this.$entries[i].frame)
		this.$entries[i].frame.style.display = (i == $selected ? 'block' : 'none');
	}
	Gadget.adjustHeight();
  },

  getTabLabel : function()
  {
	return Gadget.getMsg('tab_tol');
  },

  getContent : function()
  {
	return this.$doms.frame;
  }

};


//--------------------------------------------------------------------
// jsconsole

function JSConsole()
{
  this.$prefix = '\n----\n'
}

JSConsole.prototype = {

  log : function($text)
  {
    Gadget.log(this.$prefix + $text);
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

  $moduleId   : modId,
  $nextId     : 0,
  $prefs      : new _IG_Prefs(modId),
  $prefix     : 'mod' + modId,
  $flash      : null,
  $storageId  : 'mod' + modId + 'JsConsoleStorage',
  $storageHdl : null,
  $storage    : {},
  $textView   : null,
  $extraTabs  : null,
  $outputView : null,
  $logView    : null,
  $htmlView   : null,
  $gadgetView : null,
  $toolsView  : null,
  $minimsg    : null,

  $prefsMap : {
	prefsVer        : 'pr',
	fontSize        : 'fs',
	textRows        : 'tr',
	maxOutputRows   : 'or',
	logRows         : 'lr',
	maxGadgetHeight : 'gh',
	saveText        : 'sv'
  },

  init : function()
  {
	this.$textView   = new TextView();
	this.$minimsg    = new _IG_MiniMessage(this.$moduleId);
	this.$storageHdl = new u.DelayCall(u.generateProxy(this, 'onStorageFlush'), 3000);

	if(this.$prefs.getBool('sv') && !u.useOpenSocial)
	{
	  if(this.$prefs.getBool('sm'))
	  {
		var $msg = this.getMsg('msg_sav').replace(/_\_MODULE_ID__/, this.$moduleId).replace(/^\s+|\s+$/,'');
		this.$minimsg.createDismissibleMessage($msg, u.generateHandler(this, '$onSaveWarningDismissed'));
	  }
	}
	else if(!this.$prefs.getBool('sm'))
	{
	  this.$prefs.set('sm', 1);
	}

	if(/synd=ig/.test(document.location)) {
	  for(var i = 0 ; i <= 0 ; ++i) {
		var prefs = this.$prefs;
		var index = ('00' + i).substr(-3);
		var msg   = (this.getMsg('notification' + index)||'').replace(/_\_MODULE_ID__/, this.$moduleId);
		if(msg && prefs.getBool('n' + index)) {
		  this.$minimsg.createDismissibleMessage(msg, function() {
			prefs.set('n' + index, '0');
			setTimeout(function() { _IG_AdjustIFrameHeight(); }, 0);
			return true;
		  });
		}
	  }
	}

	this.$initExtraViews();
	this.$initButtons();
	this.adjustHeight();
  },

  $initButtons : function()
  {
	var $builder   = new u.DomBuilder();
	var $container = u.gel(this.$prefix + 'buttons');

	$container.style.margin = '4px 0px';

	var $style = { marginRight:'8px' };
	$builder.build($container, [
	  { tag:'DIV', style:'float:right', cn:[
		{ tag:'INPUT', index:'clr', type:'button', value:this.getMsg('btn_clr')} ] },
	  { tag:'DIV', cn:[
		{ tag:'INPUT', index:'run', type:'button', value:this.getMsg('btn_run'), style:$style },
		{ tag:'INPUT', index:'htm', type:'button', value:this.getMsg('btn_htm'), style:$style } ] }
	]);

	var $self = this;
	$builder.getEl('run').onclick = u.generateHandler(this, '$onRunAsScript');
	$builder.getEl('htm').onclick = u.generateHandler(this, '$onReplaceHTML');
	$builder.getEl('clr').onclick = u.generateHandler(this, '$onClearText');
  },

  $initExtraViews : function()
  {
	this.$extraTabs  = new _IG_Tabs(this.$moduleId, 0, u.gel(this.$prefix + 'extraview'));
	this.$outputView = new OutputView();
	this.$logView    = new LogView();
	this.$htmlView   = new HtmlView();
	this.$gadgetView = new GadgetView();
	this.$toolsView  = new ToolsView();

	this.$extraTabs.alignTabs('left');

	var $views = [this.$outputView, this.$logView, this.$htmlView, this.$gadgetView, this.$toolsView];
	for(var i = 0 ; i < $views.length ; ++i)
	{
	  var $view     = $views[i];
	  var $label    = $view.getTabLabel();
	  var $content  = $view.getContent();
	  var $callback = u.generateHandler(this, '$onChangeTab');
	  this.$extraTabs.addTab($label, {
		contentContainer : $content,
		callback         : $callback});
	}
  },

  $onRunAsScript : function()
  {
	var $text = this.$textView.getCurrentText();
	var $output = '';
	var $error  = false;
	try
	{
	  var $self = this;
	  $output = (function() {
		var jsconsole = new JSConsole();
		return eval($text);
	  })();
	}
	catch(e)
	{
	  $output = e.message || e.description || String(e);
	  $error  = true;
	}
	this.$outputView.setText($output, $error);
	this.adjustHeight();
  },

  $onClearText : function()
  {
	this.$textView.clearCurrentText();
  },

  $onReplaceHTML : function()
  {
    var $text = this.$textView.getCurrentText();
    if($text)
    {
	  this.$htmlView.setHTML($text);
	  this.adjustHeight();
    }
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
	return this.$moduleId;
  },

  getPrefix : function($text)
  {
	return this.$prefix + $text;
  },

  getPrefs : function()
  {
	return this.$prefs;
  },

  getPrefValue : function($name)
  {
	return this.$prefs.getString(this.$prefsMap[$name] || $name);
  },

  getPrefBool : function($name)
  {
	return this.$prefs.getBool(this.$prefsMap[$name] || $name);
  },

  getMsg : function(id)
  {
	return this.$prefs.getMsg(id);
  },

  getText : function($index)
  {
	return this.$textView.getText($index)
  },

  getCurrentText : function()
  {
	return this.$textView.getCurrentText();
  },

  setCurrentText : function($newText)
  {
	this.$textView.setCurrentText($newText);
  },

  log : function($text)
  {
	this.$logView.log($text);
  },

  onStorageReady : function()
  {
	if(!u.useOpenSocial) {
	  this.$flash = u.gel(Gadget.getPrefix('JsConsoleStorage'));
	  this.$flash.open(this.$storageId);
	  if(this.$textView) {
		this.$textView.onStorageReady();
	  }
	}
  },

  onStorageFlush : function()
  {
	if(u.useOpenSocial) {
	  var $storage = this.$storage;
	  for(var i in $storage) {
		SocialGoodies.DataRequest.storeAppData('VIEWER', i, $storage[i]);
	  }
	} else if(this.$flash) {
	  this.$flash.flush();
	}
  },

  storageSetData : function($name, $value)
  {
	if(u.useOpenSocial) {
	  this.$storage[$name] = $value;
	  this.$storageHdl.invoke();
	} else if(this.$flash) {
	  this.$flash.setData($name, $value);
	  this.$storageHdl.invoke();
	}
  },

  storageGetData : function($name, $scope, $callback)
  {
	if(u.useOpenSocial) {
	  SocialGoodies.DataRequest.fetchAppData('VIEWER', $name, {
		escape   : 'none',
		callback : function($data) {
		  for(var i in $data) {
			$callback.call($scope, $name, $data[i][$name]);
			break;
		  }
		}
	  });
	} else if(this.$flash) {
	  $callback.call($scope, $name, this.$flash.getData($name));
	}
  },

  storageIsOk : function()
  {
	return this.$flash ? this.$flash.isOk() : u.useOpenSocial;
  }

};

window[Gadget.getPrefix('Gadget')] = Gadget;
