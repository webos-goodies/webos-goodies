var google = {
  'visualization': {
	'Query':         function() {},
	'QueryResponse': function() {},
	'DataTable':     function() {}
  }
};
google.Query.prototype.setQuery               = function() {};
google.Query.prototype.send                   = function() {};
google.QueryResponse.prototype.getMessage     = function(){};
google.QueryResponse.prototype.isError        = function(){};
google.QueryResponse.prototype.getDataTable   = function(){};
google.DataTable.prototype.getColumnLabel     = function(){};
google.DataTable.prototype.getFormattedValue  = function(){};
google.DataTable.prototype.getNumberOfColumns = function(){};
google.DataTable.prototype.getNumberOfRows    = function(){};
google.DataTable.prototype.getValue           = function(){};
