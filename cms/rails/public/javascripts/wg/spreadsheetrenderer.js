goog.provide('wg.SpreadsheetRenderer');

goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.array');

/** @constructor */
wg.SpreadsheetRenderer = function(source, opt_params) {
  source     = source     || {};
  opt_params = opt_params || {};
  var url    = source;
  if(typeof url != 'string') {
	var key = source['key'];
	var pub = source['pub'] === false ? false : true;
	if(!key)
	  throw wg.SpreadsheetRenderer.makeMsg('The "key" parameter is required.');
	url = [(pub ? 'http' : 'https'), '://spreadsheets.google.com'];
	if(source['domain'] && !pub)
	  url.push('/a/', goog.string.urlEncode(source['domain']));
	url.push('/tq?key=', goog.string.urlEncode(key));
	if(source['sheet'])
	  url.push('&sheet=', goog.string.urlEncode(source['sheet']));
	else
	  url.push('&gid=', goog.string.urlEncode(source['gid'] || 0));
	if(goog.isNumber(source['headers']))
	  url.push('&headers=', source['headers']);
	if(pub)
	  url.push('&pub=1');
	url = goog.string.buildString.apply(null, url);
	var params = {};
	goog.mixin(params, source);
	goog.mixin(params, opt_params);
	opt_params = params;
  }
  this.query_     = new google.visualization.Query(url);
  this.template_  = opt_params['template']  || '';
  this.formatter_ = opt_params['formatter'] || {};
}
wg.SpreadsheetRenderer.defaultFormatter_ = function(value, rawValue, values) {
  return goog.string.htmlEscape('' + value);
};
wg.SpreadsheetRenderer.makeMsg = function(msg) {
  return 'SpreadsheetRenderer : ' + msg;
};
wg.SpreadsheetRenderer.prototype.setTemplate = function(template) {
  this.template_ = template;
};
wg.SpreadsheetRenderer.prototype.setFormatter = function(formatter) {
  this.formatter_ = formatter;
};
wg.SpreadsheetRenderer.prototype.render = function(query, element_or_function) {
  this.query_.setQuery(query),
  this.query_.send(goog.bind(this.renderResponse_, this, element_or_function));
};
wg.SpreadsheetRenderer.prototype.renderResponse_ = function(element_or_function, response) {
  if(!response)          throw wg.SpreadsheetRenderer.makeMsg("Null response.");
  if(response.isError()) throw wg.SpreadsheetRenderer.makeMsg(response.getMessage());
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
						 wg.SpreadsheetRenderer.defaultFormatter_);
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
