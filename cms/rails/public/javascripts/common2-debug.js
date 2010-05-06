goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.date.relative');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.dom');
goog.require('wg.FeedRenderer');
goog.require('wg.SpreadsheetRenderer');

//----------------------------------------------------------
// Opera fast navigation mode.
//----------------------------------------------------------

if(typeof(history['navigationMode']) != 'undifined') {
  history['navigationMode'] = 'fast';
}


//----------------------------------------------------------
// Create namespace for template code.
//----------------------------------------------------------

var template             = {};
window['template']       = template;
template['FeedRenderer'] = wg.FeedRenderer;
template['feedCallback'] = function(){ wg.FeedRenderer.processResponse.apply(this, arguments) };
wg.FeedRenderer.setDefaultCallbackName('template.feedCallback');


//----------------------------------------------------------
// Utility functions.
//----------------------------------------------------------

var onloadHandlers = [], onreadyHandlers = [];

template.addWindowEvent = function(name, handler) {
  if(name == 'ready')
	onreadyHandlers.push(handler)
  else
	onloadHandlers.push(handler);
};
template['addWindowEvent'] = template.addWindowEvent;

template['invokeContentReady'] = function() {
  goog.array.forEach(onreadyHandlers, function(handler) {
	handler();
  });
}

window.onload = function() {
  goog.array.forEach(onloadHandlers, function(handler) {
	handler();
  });
};


//----------------------------------------------------------
// Notification for old url.
//----------------------------------------------------------

template.addWindowEvent('ready', function() {
  if(document.location.href.match(/^http\:\/\/blog\.livedoor\.jp\/sourcewalker\/?(.*)$/i)) {
	var pageUrl = 'http://webos-goodies.jp/' + (RegExp.$1 || '');
	var html = goog.string.buildString(
	  '<div style="text-align:center; color:red; font-weight:bold; margin:16px 0px;">',
	  'サイトを移転しました。<br>',
	  '移転先：<a href="', pageUrl, '">', pageUrl, '</a>',
	  '</div>');
	goog.dom.appendChild(goog.dom.$('tpl_old_site_notification'),
						 goog.dom.htmlToDocumentFragment(html));
  }
});


//----------------------------------------------------------
// Generating related links of the article.
//----------------------------------------------------------

template['generateRelatedLinks'] = function(json, root) {
  var docIdMatch = /(\w+)\.html$/;
  var docId = '';
  if(window.location.href.match(docIdMatch))
    docId = RegExp.$1;

  var html = [];
  goog.array.forEach(goog.array.slice(json['p'], 0, 5), function(entry, index) {
	var template = (
	  entry['u'].match(docIdMatch) && RegExp.$1 == docId ?
		'<li>%t%</li>' : '<li><a href="%u%">%t%</a></li>');
	html[index] = template.replace(/%([^%]*)%/g, function(match, label) {
	  return goog.string.htmlEscape(entry[label] || '');
	});
  });

  var catURL = goog.string.htmlEscape(root + 'categories/' + json['t'] + '.html');
  html = goog.array.concat(
	['<h1><a href="', catURL, '">', json['c'], '</a></h1><ul>'],
	html,
	['</ul><div class="morecategory"><a href="', catURL, '">&gt;&gt; もっと読む</a></div>']);
  html = goog.string.buildString.apply(null, html)
  return goog.dom.htmlToDocumentFragment(html);
}


//----------------------------------------------------------
// rendering comments
//----------------------------------------------------------

var commentFormatter = {
  'Timestamp': function(value, rawValue) {
	if(rawValue instanceof(Date)) {
	  return goog.string.buildString(
		rawValue.getFullYear(), '年', rawValue.getMonth()+1, '月', rawValue.getDate(), '日 ',
		rawValue.getHours(), ':', rawValue.getMinutes());
	} else {
	  return '';
	}
  },
  'Name': function(value, rawValue, values) {
	var url = (values['Url']||{})['value'];
	if(/^https?:\/\//.test(url)) {
	  return goog.string.buildString(
		'<a href="', goog.string.htmlEscape(url), '">',
		goog.string.htmlEscape(value), '</a>');
	} else {
	  return goog.string.htmlEscape(value);
	}
  },
  'Comment': function(value, rawValue) {
	return goog.string.newLineToBr(goog.string.htmlEscape(value));
  }
};
commentFormatter['Source']  = commentFormatter['Name'];
commentFormatter['Excerpt'] = commentFormatter['Comment'];

template['renderComments'] = function(pageId) {
  renderer = new wg.SpreadsheetRenderer({ key: 'pMIBrnJ4PHK_Tnb_IAz3cTQ' });
  renderer.setTemplate([
	'<div class="comment_item">',
	'<h2><n>.&nbsp;Posted by %Name% &nbsp;&nbsp;&nbsp;%Timestamp%</h2>',
	'<p>%Comment%</p>',
	'</div>'].join(''));
  renderer.setFormatter(commentFormatter);
  renderer.render("select * WHERE B = '" + pageId + "' ORDER BY A", function(html, table) {
	var index = 1, numRows = table.getNumberOfRows();
	if(numRows > 0) {
	  html = html.join('').replace(/<n>/g, function() { return index++; });
	  html = goog.string.buildString(
		'<h1>この記事へのコメント</h1><div class="comment_body">', html, '</div>');
	  goog.dom.appendChild(goog.dom.$('tpl_comments'),
						   goog.dom.htmlToDocumentFragment(html));
	}
	goog.dom.setTextContent(goog.dom.$('tpl_num_comments'), numRows);
  });
};


//----------------------------------------------------------
// rendering trackbacks
//----------------------------------------------------------

template['renderTrackbacks'] = function(pageId) {
  renderer = new wg.SpreadsheetRenderer({ key: 'pMIBrnJ4PHK_XSOfGkVhjTQ' });
  renderer.setTemplate([
	'<div class="trackback_item">',
	'<h2><n>.&nbsp;%Source%&nbsp;&nbsp;[&nbsp;%Site%&nbsp;]&nbsp;&nbsp;&nbsp;%Timestamp%</h2>',
	'<p>%Excerpt%</p>',
	'</div>'].join(''));
  renderer.setFormatter(commentFormatter);
  renderer.render("select * WHERE B = '" + pageId + "' ORDER BY A", function(html, table) {
	var index = 1, numRows = table.getNumberOfRows();
	if(numRows > 0) {
	  html = html.join('').replace(/<n>/g, function() { return index++; });
	  html = goog.string.buildString(
		'<h1>この記事へのトラックバック</h1><div class="trackback_body">', html, '</div>');
	  goog.dom.appendChild(goog.dom.$('tpl_trackbacks'),
						   goog.dom.htmlToDocumentFragment(html));
	}
	goog.dom.setTextContent(goog.dom.$('tpl_num_trackbacks'), numRows);
  });
};


//----------------------------------------------------------
// show recent articles and buzz.
//----------------------------------------------------------

var buzzFormatter = {
  'publishedDate': function(value, entry) {
	var date   = new Date(value);
	var format = new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME);
	var str    = (goog.date.relative.formatPast(date.getTime()) || format.format(date));
	return str;
  }
};

template.addWindowEvent('ready', function() {
  var renderer = new wg.FeedRenderer({
	'key':'ABQIAAAADFolcpMzeDEXDBR65zomPRSdobuQ8nl73Zh0G-Y7QnxRnfXdORRvX5O5---NvrXXjsKrVcjvSimLkw'
  });

  // recent articles
  renderer.setTemplate('<a class="sidebody" href="%link%">%title%</a>');
  renderer.render('http://webos-goodies.jp/atom.xml', 'tpl_recent_articles', { 'num': 8 });

  // buzz
  renderer.setTemplate(goog.string.buildString(
	'<a class="sidebody" href="%link%" target="_blank">%contentSnippet%<br>',
	'<span class="tpl-buzz-date">%publishedDate%</span></a>'));
  renderer.setFormatter(buzzFormatter);
  renderer.render('http://buzz.googleapis.com/feeds/113438044941105226764/public/posted',
				  'tpl_buzz', { 'num': 16 });
});


//----------------------------------------------------------
// show recent articles and buzz.
//----------------------------------------------------------

template.addWindowEvent('ready', function() {
  var parent = goog.dom.$('tpl_recommendations');
  if(parent) {
	var width  = parent.clientWidth;
	var height = parent.clientHeight;
	parent.innerHTML = '<iframe src="http://www.facebook.com/plugins/recommendations.php?site=webos-goodies.jp&amp;width='+width+'&amp;height='+height+'&amp;header=true&amp;border_color=%2523cdcdcd" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:'+width+'px; height:'+height+'px;" allowTransparency="true"></iframe>';
  }
});
