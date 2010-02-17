goog.provide('wg.FeedReader');

goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');

/** @constructor */
wg.FeedRenderer = function(opt_params) {
  opt_params      = opt_params || {};
  this.key_       = opt_params['key'];
  this.template_  = opt_params['template']  || '';
  this.formatter_ = opt_params['formatter'] || {};
}
wg.FeedRenderer.defaultFormatter_ = function(value, entry) {
  return goog.string.htmlEscape('' + value);
};
wg.FeedRenderer.callback_ = function(context, response, status, details) {
  if(!response || status < 200 || 300 <= status)
	throw 'FeedRenderer : ' + details;
  var request = wg.FeedRenderer.prototype.requests_[context - 0];
  if(request) {
	var html      = [];
	var template  = request.template  || '';
	var formatter = request.formatter || {};
	var element   = request.element   || '';
	goog.array.forEach(response['feed']['entries'], function(entry, i) {
	  html[i] = template.replace(/%([^%]*)%/g, function(match, label) {
		if(label in entry) {
		  var f = formatter[label] || wg.FeedRenderer.defaultFormatter_;
		  return f(entry[label], entry);
		} else {
		  return '';
		}
	  });
	});
	if(goog.isFunction(element)) {
	  element(html, response);
	} else {
	  html = html.join('');
	  if(!goog.dom.isNodeLike(element))
		element = goog.dom.$(element);
	  if(element)
		goog.dom.appendChild(element, goog.dom.htmlToDocumentFragment(html));
	}
  }
};
wg.FeedRenderer.prototype.callbackName = 'wg.FeedRenderer.callback_';
wg.FeedRenderer.prototype.requests_    = [];
wg.FeedRenderer.prototype.setTemplate = function(template) {
  this.template_ = template;
};
wg.FeedRenderer.prototype.setFormatter = function(formatter) {
  this.formatter_ = formatter;
};
wg.FeedRenderer.prototype.render = function(source, element_or_function, opt_maxEntries) {
  var url = [
	'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&callback=',
	goog.string.urlEncode(this.callbackName),
	'&q=', goog.string.urlEncode(source),
	'&context=', this.requests_.length];
  var num = opt_maxEntries, key = this.key_;
  if(num)
	url = goog.array.concat(url, ['&num=', goog.string.urlEncode(num)]);
  if(key)
	url = goog.array.concat(url, ['&key=', goog.string.urlEncode(key)]);
  this.requests_.push({
	element:   element_or_function,
	template:  this.template_,
	formatter: this.formatter_
  });
  goog.dom.appendChild(document.body, goog.dom.createDom('script', {
	'type': 'text/javascript',
	'src':  goog.string.buildString.apply(goog.string.buildString, url)
  }));
};
