(function() {

function $gel(id) {return typeof id === 'string' ? document.getElementById(id) : id;}
function $nel(t) {return document.createElement(t);}
function $nfg() {return document.createDocumentFragment();}

function $isUndefined(o) { return typeof o === 'undefined'; };
function $isObject(o) { return o && (typeof o === 'object' || typeof o === 'function'); }
function $isFunction(o) { return typeof o === 'function'; };
function $isString(o) { return typeof o === 'string'; }
function $isElement(o, t) { return typeof o === 'object' && (!t || o.nodeType == t); }

function $hesc(a)
{
  a = a.replace(/&/g, '&amp;');
  a = a.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  a = a.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  return a;
}

function $currying($self, $callback)
{
  var $fixedArgs = [];
  for(var i = 2 ; i < arguments.length ; ++i)
    $fixedArgs[$fixedArgs.length] = arguments[i];
  return function() {
	var $args = $fixedArgs.slice(0);
	for(var i = 0 ; i < arguments.length ; ++i)
	  $args[$args.length] = arguments[i];
	$callback.apply($self, $args)
  };
}

function $applyStyles(el, styles)
{
  if($isString(styles))
  {
    el.style.cssText = styles;
  }
  else
  {
    for(i in styles)
    {
      if($isString(styles[i]))
        el.style[i] = styles[i];
    }
  }
}

(function() {

$styleTable = {
  width:          '100%',
  borderCollapse: 'separate',
  borderSpacing:  '0px',
  emptyCells:     'show',
  fontSize:       '12px',
  textAlign:      'center',
  lineHeight:     '1'
};

$styleTabBase = {
  backgroundColor: '#dddddd',
  color:           'black',
  fontWeight:      'normal',
  margin:          '0px',
  padding:         '2px 8px 2px 8px',
  borderStyle:     'solid',
  borderWidth:     '1px',
  borderColor:     '#aaa #aaa #666 #aaa',
  width:           '80px',
  cursor:          'pointer'
};

$styleTabActive = {
  backgroundColor: 'white',
  borderColor:     '#666 #666 #fff #666',
  color:           '#36c',
  fontWeight:      'bold',
  cursor:          'default'
};

$styleTabSpacer = {
  padding:      '0px',
  margin:       '0px',
  borderStyle:  'none none solid none',
  borderWidth:  '1px',
  borderColor:  '#666',
  width:        '3px'
};

function $TabEntry($index, $labelEl, $contentEl, $options)
{
  this.$index     = $index;
  this.$labelEl   = $labelEl;
  this.$contentEl = $contentEl;
  this.$callback  = $options.callback;
  this.$scope     = $options.scope;
}
$TabEntry.prototype = {
  getIndex            : function() { return this.$index; },
  getNameContainer    : function() { return this.$labelEl; },
  getContentContainer : function() { return this.$contentEl; },

  $onSelect : function()
  {
	if($isFunction(this.$callback))
	  this.$callback.call(this.$scope || window, this);
  }
};

function SimpleTab($container, $options)
{
  $options = $isObject($options) ? $options : {};

  this.$container        = $isString($container) ? $gel($container) : $container;
  this.$tabContainer     = $nel('TR');
  this.$contentContainer = $nel('DIV');
  this.$tabs             = [];
  this.$currentIndex     = $options.current || 0;

  var $table = $nel('TABLE');
  var $tbody = $nel('TBODY');
  $applyStyles($table, $styleTable);
  $table.cellSpacing = '0';
  $table.width = '100%';
  $tbody.appendChild(this.$tabContainer);
  $table.appendChild($tbody);
  this.$appendSpacer();
  this.$appendSpacer();
  this.$tabContainer.lastChild.style.width = '';
  this.$container.appendChild($table);
  this.$container.appendChild(this.$contentContainer);
};
SimpleTab.prototype = {

  $onClick : function($index)
  {
    for(var i = 0 ; i < this.$tabs.length ; ++i)
    {
      var $tab = this.$tabs[i];
      $applyStyles($tab.$labelEl, $styleTabBase);
	  $tab.$contentEl.style.display = 'none';
      if(i == $index)
	  {
        $applyStyles($tab.$labelEl, $styleTabActive);
		$tab.$contentEl.style.display = '';
		$tab.$onSelect();
	  }
    }
  },

  $appendSpacer : function()
  {
    var $element = $nel('TD');
    $applyStyles($element, $styleTabSpacer);
    $element.innerHTML = '&nbsp;';
    this.$tabContainer.insertBefore($element, this.$tabContainer.lastChild);
  },

  $activateTab : function($index)
  {
	if(0 <= $index && $index < this.$tabs.length)
	{
	  var $tab = this.$tabs[$index];
      $applyStyles($tab.$labelEl, $styleTabActive);
	  $tab.$contentEl.style.display = '';
	}
  },

  addTab : function($label, $options)
  {
	$options = $isObject($options) ? $options : {};
    if(this.$tabs.length > 0)
      this.$appendSpacer();

    var $labelEl = $nel('TD');
    $applyStyles($labelEl, $styleTabBase);
    $labelEl.innerHTML = $hesc($label);
    $labelEl.onclick   = $currying(this, this.$onClick, this.$tabs.length);
    this.$tabContainer.insertBefore($labelEl, this.$tabContainer.lastChild);

	var $contentEl = $isElement($options.content, 1) ? $options.content : $nel('DIV');
	$contentEl.style.display = 'none';
	if($isString($options.content))
	  $contentEl.innerHTML = $options.content;
	if(!$contentEl.parentNode)
	  this.$contentContainer.appendChild($contentEl);

	var $index = this.$tabs.length;
	var $tab   = new $TabEntry($index, $labelEl, $contentEl, $options);
    this.$tabs.push($tab);

	if(this.$currentIndex == $index)
	{
	  this.$activateTab($index);
	  $tab.$onSelect();
	}

	return $tab;
  },

  getTabs : function()
  {
	return this.$tabs;
  },

  getHeaderContainer : function()
  {
	return this.$tabContainer;
  },

  getContentContainer : function()
  {
	return this.$contentContainer;
  }

};

window.WebOSGoodies = window.WebOSGoodies || {};
window.WebOSGoodies.SimpleTab = window.WebOSGoodies.SimpleTab || SimpleTab;

})(); // SimpleTab

if(!window.WebOSGoodies.CodeNanigaC)
{
  var $prefix = 'WebOSGoodies_CodeNanigaC';
  var $nextId = 0;

  function Widget($domId, $options)
  {
	$options = $isObject($options) ? $options : {};
	this.$domId        = $domId;
	this.$tabs         = null;
	this.$container    = null;
	this.$footer       = null;
	this.$height       = $options.height;
	this.$showSource   = $isUndefined($options.showSource) ? true : $options.showSource;
	this.$showInfo     = $isUndefined($options.showInfo) ? true : $options.showInfo;
	this.$showComments = $isUndefined($options.showComments) ? true : $options.showComments;
	this.$showTabs     = $options.showTabs;
	this.$showFooter   = $isUndefined($options.showFooter) ? true : $options.showFooter;
	this.$showBorder   = $isUndefined($options.showBorder) ? true : $options.showBorder;
	this.$sourceClass  = $options.sourceClass || 'prettyprint';
  };
  Widget.prototype = {

	$buildTable : function($source)
	{
	  var $element = $nfg();
	  for(var i = 0 ; i < $source.length ; ++i)
	  {
		var $item = $source[i];
		var tr    = $nel('TR');
		var td0   = $nel('TD');
		var td1   = $nel('TD');
		$applyStyles(td0, this.$styleLeft);
		$applyStyles(td1, this.$styleRight);
		td0.innerHTML = $item[0];
		td1.innerHTML = $item[1];
		tr.appendChild(td0);
		tr.appendChild(td1);
		$element.appendChild(tr);
	  }
	  return $element;
	},

	$buildLink : function($path, $text)
	{
	  return '<a href="http://code.nanigac.com' + $hesc($path) + '" target="_blank">' + $hesc($text) + '</a>';
	},

	$buildDate : function($date)
	{
	  if(/(\d+-\d+-\d+)T(\d+:\d+)/.exec($date))
	  {
		var d = RegExp.$1, t = RegExp.$2;
		return d.replace(/-/g, '/') + ' '+ t;
	  }
	  else
	  {
		return '';
	  }
	},

	$markup : function($text)
	{
	  var $links = [], $blocks = [], $stylePre = this.$stylePre;
	  $text = $text.replace(/~/g, '~T');
	  $text = $text.replace(/(\s)(https?:\/\/[^\s]+)/g, function(d, $preceding, $match) {
		$links[$links.length] = $match;
		return $preceding + '~L';
	  });
	  $text = $text.replace(/\s*\[block\]((?:.|[\r\n])*?)\[\/block\]\s*/g, function(d, $match) {
		$blocks[$blocks.length] = $match;
		return '~B';
	  });
	  $text = $text.replace(/\r\n|\r|\n/g, '~N');
	  $text = $text;
	  $text = $text.replace(/~B/g, function() {
		var $str = $blocks.shift();
		return '<pre style="' + $stylePre + '">' + $str + '</pre>';
	  });
	  $text = $text.replace(/~L/g, function() {
		var $url = $links.shift();
		var $str = $url;
		if($str.length > 60)
		  $str = $str.slice(0, 60) + '...';
		return '<a href="' + $url + '">' + $str + '</a>';
	  });
	  $text = $text.replace(/~N/g, '<br/>').replace(/~T/g, '~');
	  return $text;
	},

	$addTab : function($label, $callback)
	{
	  var $element = $nel('DIV');
	  $applyStyles($element, this.$styleContent);
	  if(this.$tabs)
		this.$tabs.addTab($label, { content:$element });
	  else
		this.$container.appendChild($element);
	  $callback.call(this, $element);
	},

	$initSourceTab : function($content)
	{
	  var $el;
	  this.$addTab('ソース', function($element) {
		$element.innerHTML = '<pre style="margin:0px;padding:0px;border:none;">'+$content.entry.src_sourcecode+'</pre>';
		$element.firstChild.className = this.$sourceClass;
	  });
	},

	$initDescriptionTab : function($content)
	{
	  this.$addTab('詳細', function($element) {
		var $table = $nel('TABLE');
		var $tbody = $nel('TBODY');
		var $desc  = $nel('DIV');
		var $entry = $content.entry;
		var $data = [
		  ['タイトル', this.$buildLink('/source/view/' + $entry.src_id, $entry.src_title)],
		  ['ソースコードID', $entry.src_id],
		  ['登録者', this.$buildLink('/user/profile/' + $content.auth_id, $content.auth_name)],
		  ['登録日時', this.$buildDate($content.auth_regdate)],
		  ['最終更新者', this.$buildLink('/user/profile/' + $content.modifier_id, $content.auth_modifier_name)],
		  ['最終更新日時', this.$buildDate($content.auth_modify_date)],
		  ['GoodJob数', $entry.src_gj],
		  ['アクセス数', $entry.src_access_num],
		  ['コメント数', $entry.src_comment_num]
		];
		if($content.tagdata.length > 0)
		{
		  var $tagdata = $content.tagdata, $tags = [];
		  for(var i = 0 ; i < $tagdata.length ; ++i)
		  {
			var $tag = $tagdata[i].tag;
			$tags[$tags.length] = this.$buildLink('/code/search?q=' + $tag + '&tag=1&code_type=1', $tag);
		  }
		  $data[$data.length] = ['タグ', $tags.join('&nbsp;')];
		}
		if($entry.src_relate_name)
		  $data[$data.length] = ['関連トピック', $hesc($entry.src_relate_name)];

		$applyStyles($table, this.$styleTable);
		$tbody.appendChild(this.$buildTable($data));
		$table.appendChild($tbody);
		$element.appendChild($table);

		$applyStyles($desc, this.$styleDesc);
		$desc.innerHTML = this.$markup($entry.src_description);
		$element.appendChild($desc);
	  });
	},

	$initCommentTab : function($content)
	{
	  var $comments = $content.commnt;
	  $comments.sort(function(a, b) {
		return a.com_num - b.com_num;
	  });
	  this.$addTab('コメント', function($element) {
		for(var i = 0 ; i < $comments.length ; ++i)
		{
		  var $comment = $comments[i];
		  var $outer   = $nel('DIV');
		  var $caption = $nel('DIV');
		  var $body    = $nel('DIV');
		  $applyStyles($outer, this.$styleComment);
		  $applyStyles($caption, this.$styleCommentCaption);
		  $applyStyles($body, this.$styleCommentBody);
		  if(i != $content.entry.src_comment_num - 1)
			$outer.style.borderBottom = 'dotted 1px #333';
		  $caption.innerHTML = ($comment.com_num + ': ' +
								this.$buildLink('/user/profile/' + $comment.com_id, $comment.com_name) + ' (' +
								this.$buildDate($comment.com_regdate) + ')');
		  $body.innerHTML = $comment.com_description.replace(/\r\n|\r|\n/g, '<br/>');
		  $outer.appendChild($caption);
		  $outer.appendChild($body);
		  $element.appendChild($outer);
		}
		if($comments.length != $content.entry.src_comment_num)
		{
		  var $footer = $nel('DIV');
		  $applyStyles($footer, this.$styleCommentFooter);
		  $footer.innerHTML = this.$buildLink('/source/view/' + $content.entry.src_id, '>> もっと読む');
		  $element.appendChild($footer);
		}
	  });
	},

	$initFooter : function($content)
	{
	  this.$footer = $nel('DIV');
	  $applyStyles(this.$footer, this.$styleFooter);
	  this.$footer.innerHTML =
		this.$buildLink('/source/view/' + $content.entry.src_id, '説明') + ' | ' +
		this.$buildLink('/source/history/' + $content.entry.src_id + ' ?pid=1', '履歴') + ' | ' +
		this.$buildLink('/source/download/' + $content.entry.src_id + ' ?pid=1', 'コピペ用');
	  $gel(this.$domId).appendChild(this.$footer);
	},

	$setContent : function($content)
	{
	  this.$styleContainer = { width:'100%', margin:'0px', padding:'4px', overflow:'auto', borderWidth:'1px', borderColor:'#666' };
	  this.$styleContent = { margin:'0px', padding:'0px' };
	  this.$styleTable = { margin:'8px 8px', padding:'0px', borderCollapse:'separate', borderSpacing:'0px', emptyCells:'show', lineHeight: '1.5' };
	  this.$styleLeft = { fontSize:'11px', textAlign:'right', padding:'0px 8px 0px 0px', whiteSpace:'pre' };
	  this.$styleRight = { fontSize:'12px', textAlign:'left', padding:'0px' };
	  this.$styleDesc = { margin:'12px 8px 0px 8px', padding:'8px', border:'dashed 1px #888' };
	  this.$styleComment = { margin:'0px', padding:'8px 0px' };
	  this.$styleCommentCaption = { margin:'0px 0px 4px 0px', padding:'0px' };
	  this.$styleCommentBody = { margin:'0px 0px 0px 1em', padding:'0px' };
	  this.$styleCommentFooter = { margin:'4px', padding:'0px', textAlign:'right', fontSize:'10px' };
	  this.$styleFooter = { margin:'3px 0px 0px 0px', padding:'0px', textAlign:'right', fontSize:'12px', border:'none', lineHeight:'1' };
	  this.$stylePre = 'margin:0.8em 0px;padding:0.8em;background-color:#eee;border:solid 1px #888;';

	  var $showComments = this.$showComments && $content.commnt.length > 0;
	  var $numTabs      = (this.$showSource ? 1 : 0) + (this.$showInfo ? 1 : 0) + ($showComments ? 1 : 0);
	  var $showTabs     = $numTabs >= 2 || this.$showTabs;
	  if($showTabs)
	  {
		this.$tabs      = new WebOSGoodies.SimpleTab(this.$domId);
		this.$container = this.$tabs.getContentContainer();
		$applyStyles(this.$container, this.$styleContainer);
		this.$container.style.borderStyle = 'none solid solid solid';
	  }
	  else
	  {
		this.$container = $nel('DIV');
		$applyStyles(this.$container, this.$styleContainer);
		this.$container.style.borderStyle = 'solid';
		$gel(this.$domId).appendChild(this.$container);
	  }

	  if(window.Components)
		this.$container.style.setProperty('-moz-box-sizing', 'border-box', null);
	  else if($isFunction(this.$container.style.setProperty))
		this.$container.style.setProperty('box-sizing', 'border-box', null);

	  if(!this.$showBorder)
		this.$container.style.borderStyle = 'none';
	  if(this.$height)
		this.$container.style.height = this.$height + 'px';

	  if(this.$showSource)
		this.$initSourceTab($content);
	  if(this.$showInfo)
		this.$initDescriptionTab($content);
	  if($showComments)
		this.$initCommentTab($content);
	  if(this.$showFooter)
		this.$initFooter($content);

	  if(window.ActiveXObject)
	  {
		var $element = $gel(this.$domId).parentNode;
		if($element.offsetWidth < this.$container.offsetWidth)
		{
		  this.$container.style.width = $element.offsetWidth - (this.$container.offsetWidth - $element.offsetWidth);
		}
	  }
	},

	getTabs : function()
	{
	  return this.$tabs;
	},

	getContentContainer : function()
	{
	  return this.$container;
	},

	getFooterContainer: function()
	{
	  return this.$footer;
	}

  };

  window.WebOSGoodies.CodeNanigaC = {

	$callback : function($widget, $content)
	{
	  $widget.$setContent($content);
	},

	write : function($sourceId, $options)
	{
	  var $id       = $nextId++;
	  var $domId    = $prefix + $id;
	  var $callback = 'callback' + $id;
	  var $widget   = new Widget($domId, $options);
	  this[$callback] = $currying(this, this.$callback, $widget);
	  document.open();
	  document.write('<div id="' + $domId + '" style="width:100%;"></div>');
	  document.write('<scr' + 'ipt type="text/javascript" src="http://api.code.nanigac.com/getSource.php?id=' + parseInt($sourceId, 10) + '&fmt=json&jsonp=window.WebOSGoodies.CodeNanigaC.' + $callback + '&comment=1-10"></scr' + 'ipt>');
	  document.close();
	  return $widget;
	}

  };
}

})();
