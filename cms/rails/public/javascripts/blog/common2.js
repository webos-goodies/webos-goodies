goog.provide('blog.App');
goog.require('goog.string');
goog.require('goog.array');
goog.require('goog.date.relative');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.uri.utils');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events.EventType');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('wg.FeedRenderer');
goog.require('wg.SpreadsheetRenderer');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
blog.App = function() {
  goog.base(this);

  /**
   * Event handler manager
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);

  /**
   * Observe window resizing.
   * @type {goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.vsm_ = new goog.dom.ViewportSizeMonitor();

  // Opera fast navigation mode.
  if(typeof(history['navigationMode']) != 'undifined') {
    history['navigationMode'] = 'fast';
  }

  // Listen some events.
  this.eh_.listen(window, goog.events.EventType.LOAD, this.onLoad_);
  this.eh_.listen(this,   blog.App.EventType.READY,   this.notifyNewAddress_);
  this.eh_.listen(this,   blog.App.EventType.READY,   this.renderFeeds_);
  this.eh_.listen(this,   blog.App.EventType.READY,   this.showRecommendationWidget_);
  this.eh_.listen(this,   blog.App.EventType.READY,   this.resizeTwitterWidget_);
  this.eh_.listen(this.vsm_, goog.events.EventType.RESIZE, this.resizeTwitterWidget_);
};
goog.inherits(blog.App, goog.events.EventTarget);

/**
 * イベントタイプ
 * enum {string}
 */
blog.App.EventType = {
  READY: 'blog-ready',
  LOAD:  'blog-load'
};

/**
 * window.onload時の処理
 * @param {goog.events.Event} e イベントオブジェクト
 * @private
 */
blog.App.prototype.onLoad_ = function(e) {
  this.dispatchEvent(blog.App.EventType.LOAD);
};

/**
 * 旧livedoor blogのURLでアクセスされた際の表示
 * @param {goog.events.Event} e イベントオブジェクト
 * @private
 */
blog.App.prototype.notifyNewAddress_ = function(e) {
  var regex = /^http\:\/\/blog\.livedoor\.jp\/sourcewalker\/?(.*)$/i
  var match = regex.exec(document.location.href);
  if(match && match[1]) {
	var pageUrl = 'http://webos-goodies.jp/' + (match[1] || '');
	var html = goog.string.buildString(
	  '<div style="text-align:center; color:red; font-weight:bold; margin:16px 0px;">',
	  'サイトを移転しました。<br>',
	  '移転先：<a href="', pageUrl, '">', pageUrl, '</a>',
	  '</div>');
	goog.dom.appendChild(goog.dom.getElement('tpl_old_site_notification'),
						 goog.dom.htmlToDocumentFragment(html));
  }
};

/**
 * 関連リンクを表示する
 * @param {Object} json 関連リンクの情報を格納したオブジェクト
 * @param {string} siteUrl WebサイトのベースURL
 */
blog.App.prototype.generateRelatedLinks = function(json, siteUrl) {
  var regex  = /(\w+)\.html$/;
  var match  = regex.exec(goog.uri.utils.getPath(window.location.href)) || [];
  var docId  = match[1] || '';
  var catUrl = goog.uri.utils.appendPath(siteUrl, 'categories/' + json['t'] + '.html');

  var links = goog.array.map(goog.array.slice(json['p'], 0, 5), function(entry) {
    var match = regex.exec(goog.uri.utils.getPath(entry['u'])) || [];
    var t     = entry['t'] || '';
    return goog.dom.createDom(
      'li', null, match[1] == docId ? t : goog.dom.createDom('a', {'href':entry['u']||''}, t));
  }, this);

  var fg = document.createDocumentFragment();
  fg.appendChild(goog.dom.createDom(
    'h1', null, goog.dom.createDom('a', {'href':catUrl}, json['c'])));
  fg.appendChild(goog.dom.createDom('ul', null, links));
  fg.appendChild(goog.dom.createDom(
    'div', 'morecategory', goog.dom.createDom('a', {'href':catUrl}, '>> もっと読む')));

  return fg;
}

/**
 * コメントの投稿者の整形する
 * @param {string} value フォーマット済みの文字列
 * @param {*} rawValue 生データ
 * @param {Object} values 該当行の全カラムのデータ
 * @private
 */
blog.App.nameFormatter_ = function(value, rawValue, values) {
  var url = (values['Url']||{})['value'];
  if(/^https?:\/\//.test(url)) {
	return goog.string.subs(
      '<a href="%s">%s</a>', goog.string.htmlEscape(url), goog.string.htmlEscape(value));
  } else {
	return goog.string.htmlEscape(value);
  }
};

/**
 * コメントの本文を整形する
 * @param {string} value フォーマット済みの文字列
 * @param {*} rawValue 生データ
 * @param {Object} values 該当行の全カラムのデータ
 * @private
 */
blog.App.bodyFormatter_ = function(value, rawValue, values) {
  return goog.string.newLineToBr(goog.string.htmlEscape(value));
};

/**
 * コメントのタイムスタンプを整形する
 * @param {string} value フォーマット済みの文字列
 * @param {*} rawValue 生データ
 * @param {Object} values 該当行の全カラムのデータ
 * @private
 */
blog.App.absoluteDateFormatter_ = function(value, rawValue, values) {
  if(rawValue instanceof(Date)) {
	return goog.string.subs(
      '%s年%s月%s日 %s:%s',
      rawValue.getFullYear(), rawValue.getMonth()+1, rawValue.getDate(),
	  rawValue.getHours(), rawValue.getMinutes());
  } else {
	return '';
  }
};

/**
 * 整形されたコメントをドキュメントに挿入する
 * @param {string} template 挿入するHTMLのテンプレート
 * @param {string} targetId HTMLを挿入する要素のid
 * @param {string} counterId コメント数を表示する要素のid
 * @param {Array.<string>} html 各コメントのHTML文字列
 * @param {Object} table データソースとなったDataTable
 * @private
 */
blog.App.prototype.renderComments_ = function(template, targetId, counterId, html, table) {
  var index = 1, numRows = table.getNumberOfRows();
  if(numRows > 0) {
	goog.dom.getElement(targetId).innerHTML = goog.string.subs(
      template, html.join('').replace(/<n>/g, function() { return index++; }));
  }
  goog.dom.setTextContent(goog.dom.getElement(counterId), numRows);
};

/**
 * コメントを表示する
 * @param {string} pageId URLのベース名部分
 */
blog.App.prototype.renderComments = function(pageId) {
  renderer = new wg.SpreadsheetRenderer({ key: 'pMIBrnJ4PHK_Tnb_IAz3cTQ' });
  renderer.setTemplate([
	'<div class="comment_item">',
	'<h2><n>.&nbsp;Posted by %Name% &nbsp;&nbsp;&nbsp;%Timestamp%</h2>',
	'<p>%Comment%</p>',
	'</div>'].join(''));
  renderer.setFormatter({
    'Timestamp': blog.App.absoluteDateFormatter_,
    'Name':      blog.App.nameFormatter_,
    'Comment':   blog.App.bodyFormatter_
  });
  if(location.hash == '#comments') {
    goog.dom.insertChildAt(
      goog.dom.getElement('comment_form'),
      goog.dom.createDom(
        'div', 'notice', '※ コメントの反映には時間がかかることがあります。'), 0);
  }
  var renderFunc = goog.bind(
    this.renderComments_, this,
    '<h1>この記事へのコメント</h1><div class="comment_body">%s</div>',
    'tpl_comments', 'tpl_num_comments');
  renderer.render("select * WHERE B = '" + pageId + "' ORDER BY A", renderFunc);
};

/**
 * トラックバックを表示する
 * @param {string} pageId URLのベース名部分
 */
blog.App.prototype.renderTrackbacks = function(pageId) {
  renderer = new wg.SpreadsheetRenderer({ key: 'pMIBrnJ4PHK_XSOfGkVhjTQ' });
  renderer.setTemplate([
	'<div class="trackback_item">',
	'<h2><n>.&nbsp;%Source%&nbsp;&nbsp;[&nbsp;%Site%&nbsp;]&nbsp;&nbsp;&nbsp;%Timestamp%</h2>',
	'<p>%Excerpt%</p>',
	'</div>'].join(''));
  renderer.setFormatter({
    'Timestamp': blog.App.absoluteDateFormatter_,
    'Source':    blog.App.nameFormatter_,
    'Excerpt':   blog.App.bodyFormatter_
  });
  var renderFunc = goog.bind(
    this.renderComments_, this,
    ['<div class="trackback"><h1>トラックバックURL</h1>',
     '<div class="trackback_form">',
     '<div class="notice">※トラックバックの受け付けは中止しております。</div>',
     '</div>',
     '<h1>この記事へのトラックバック</h1><div class="trackback_body">%s</div>',
     '</div>'].join(''),
    'tpl_trackbacks', 'tpl_num_trackbacks');
  renderer.render("select * WHERE B = '" + pageId + "' ORDER BY A", renderFunc);
};

/**
 * フィードのタイムスタンプを整形する
 * @param {string} value タイムスタンプの文字列
 * @param {Object} entry 該当エントリのデータ
 */
blog.App.relativeDateFormatter_ = function(value, entry) {
  var date = new Date(value);
  return (goog.date.relative.formatPast(date.getTime()) ||
          (new goog.i18n.DateTimeFormat(
            goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME)).format(date));
};

/**
 * Recent ArticlesとTwitterのフィードを表示する
 * @param {goog.events.Event} e イベントオブジェクト
 * @private
 */
blog.App.prototype.renderFeeds_ = function(e) {
  var renderer = new wg.FeedRenderer({
	'key':'ABQIAAAADFolcpMzeDEXDBR65zomPRSdobuQ8nl73Zh0G-Y7QnxRnfXdORRvX5O5---NvrXXjsKrVcjvSimLkw'
  });

  // recent articles
  renderer.setTemplate('<a class="sidebody" href="%link%">%title%</a>');
  renderer.render('http://webos-goodies.jp/atom.xml', 'tpl_recent_articles', { 'num': 8 });

  // Twitter
  /*
  renderer.setTemplate(goog.string.buildString(
	'<a class="sidebody" href="%link%" target="_blank">%contentSnippet%<br>',
	'<span class="tpl-activity-date">%publishedDate%</span></a>'));
  renderer.setFormatter({'publishedDate': blog.App.relativeDateFormatter_});
  renderer.render('https://twitter.com/statuses/user_timeline/24371070.rss',
				  'tpl_activity', { 'num': 16 });
  */
};

/**
 * Facebookのリコメンデーションウィジェットを表示する
 * @param {goog.events.Event} e イベントオブジェクト
 * @private
 */
blog.App.prototype.showRecommendationWidget_ = function(e) {
  var parent = goog.dom.$('tpl_recommendations');
  if(parent) {
	var width  = parent.clientWidth;
	var height = parent.clientHeight;
	parent.innerHTML = '<iframe src="http://www.facebook.com/plugins/recommendations.php?site=webos-goodies.jp&amp;width='+width+'&amp;height='+height+'&amp;header=false&amp;border_color=white" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:'+width+'px; height:'+height+'px;" allowTransparency="true"></iframe>';
  }
};

/**
 * Twitterウィジェットをサイドバーの幅にリサイズする
 * @param {goog.events.Event} e イベントオブジェクト
 * @private
 */
blog.App.prototype.resizeTwitterWidget_ = function() {
  var parentEl = goog.dom.getElement('rightside-wrap');
  var tweetEl  = parentEl && goog.dom.getElementByClass('twitter-timeline', parentEl);
  if(tweetEl) {
    tweetEl.setAttribute('width', parentEl.clientWidth - 8);
  }
};

var app = new blog.App();

var template             = {};
window['template']       = template;
template['FeedRenderer'] = wg.FeedRenderer;
template['feedCallback'] = function(){ wg.FeedRenderer.processResponse.apply(this, arguments) };
wg.FeedRenderer.setDefaultCallbackName('template.feedCallback');

template['addWindowEvent'] = function(name, handler) {
  var type = name == 'ready' ? blog.App.EventType.READY : blog.App.EventType.LOAD;
  app.addEventListener(type, handler);
};

template['invokeContentReady'] = function() {
  app.dispatchEvent(blog.App.EventType.READY);
};

template['generateRelatedLinks'] = function(json, siteUrl) {
  return app.generateRelatedLinks(json, siteUrl);
};

template['renderComments'] = function(pageId) {
  app.renderComments(pageId);
};

template['renderTrackbacks'] = function(pageId) {
  app.renderTrackbacks(pageId);
};
