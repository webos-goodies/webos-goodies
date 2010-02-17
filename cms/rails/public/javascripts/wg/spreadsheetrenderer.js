goog.provide('wg.SpreadsheetReader');

goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');

/** @constructor */
wg.SpreadsheetsRenderer = function(source, opt_params) {
  source     = source     || {};
  opt_params = opt_params || {};
  var url    = source;
  if(typeof url != 'string') {
	var key    = source['key'];
	var domain = source['domain'] || '';
	var pub    = ('pub' in source) && !goog.isNull(source['pub']) ? source['pub'] : 1;
	if(!key)
	  throw this.makeMsg('The "key" parameter is required.');
	if(domain && pub == 0)
	  domain = '/a/' + goog.string.urlEncode(domain);
	url = goog.string.buildString('http://spreadsheets.google.com',
								  domain,
								  '/tq?key=', goog.string.urlEncode(key),
								  '&gid=',    goog.string.urlEncode(source['gid'] || 0),
								  '&pub=',    goog.string.urlEncode(pub));
	var params = {};
	goog.mixin(params, source);
	goog.mixin(params, opt_params);
  }
  this.query_     = new google.visualization.Query(url);
  this.template_  = opt_params['template']  || '';
  this.formatter_ = opt_params['formatter'] || {};
}
wg.SpreadsheetsRenderer.defaultFormatter_ = function(value, rawValue, values) {
  return goog.string.htmlEscape('' + value);
};
wg.SpreadsheetsRenderer.prototype.makeMsg = function(msg) {
  return 'SpreadsheetsRenderer : ' + msg;
};
wg.SpreadsheetsRenderer.prototype.setTemplate = function(template) {
  this.template_ = template;
};
wg.SpreadsheetsRenderer.prototype.setFormatter = function(formatter) {
  this.formatter_ = formatter;
};
wg.SpreadsheetsRenderer.prototype.render = function(query, element_or_function) {
  this.query_.setQuery(query),
  this.query_.send(goog.bind(this.renderResponse_, this, element_or_function));
};
wg.SpreadsheetsRenderer.prototype.renderResponse_ = function(element_or_function, response) {
  if(!response)          throw this.makeMsg("Null response.");
  if(response.isError()) throw this.makeMsg(this.getMessage());
  var table      = response.getDataTable();
  var numColumns = table.getNumberOfColumns();
  var numRows    = table.getNumberOfRows();
  var labels     = [];
  var formatter  = [];
  var html       = [];
  var column, row, values, htmlValues;
  for(column = 0 ; column < numColumns ; ++column) {
	labels[column]    = table.getColumnLabel(column);
	formatter[column] = (this.formatter_[labels[column]] || this.formatter_[column] ||
						 wg.SpreadsheetsRenderer.defaultFormatter_);
  }
  for(row = 0 ; row < numRows ; ++row) {
	values = {}; htmlValues = {};
	for(column = 0 ; column < numColumns ; ++column) {
	  values[column] = values[labels[column]] = {
		'value':    table.getFormattedValue(row, column),
		'rawValue': table.getValue(row, column)
	  };
	}
	for(column = 0 ; column < numColumns ; ++column) {
	  htmlValues[column] = htmlValues[labels[column]] =
		formatter[column](values[column]['value'], values[column]['rawValue'], values);
	}
	html[row] = this.template_.replace(/%([^%]*)%/g, function(match, label) {
	  if(!label || label.length <= 0) return '%';
	  return htmlValues[label];
	});
  }
  if(goog.isFunction(element_or_function)) {
	element_or_function(html, table);
  } else {
	html = html.join('');
	if(!goog.dom.isNodeLike(element_or_function))
	  element_or_function = goog.dom.$(element_or_function);
	if(element_or_function)
	  goog.dom.appendChild(element_or_function,
						   goog.dom.htmlToDocumentFragment(html));
  }
};
