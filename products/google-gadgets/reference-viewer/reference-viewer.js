var ReferenceSearch = (function() {

var useLegacy     = !window.gadgets;
var useOpenSocial = !!window.opensocial;

function gel(id)
{
  return document.getElementById(id);
}

function nel(tag)
{
  return document.createElement(tag);
}

function escapeHtml(str, thruAmp)
{
  if(!thruAmp) str = str.replace(/&/g, '&amp;');
  str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  str = str.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  return str;
}

function escapeUrl(str)
{
  return window.encodeURIComponent ? encodeURIComponent(str) : escape(str);
}

function appendTrailingSlash(str)
{
  return str.replace(/\/index\.html$/, '/').replace(/\/*$/, '/')
}

function fetchContent(url, callback)
{
  if(useLegacy) {
	_IG_FetchContent(url, callback);
  } else {
	var params = [];
	params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
	params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 3600;
	gadgets.io.makeRequest(url, function(response) {
	  callback(response.text);
    }, params);
  }
}

function inherit(derived, base, members)
{
  members    = members || {};
  var medium = function(){};
  medium.prototype = base.prototype;
  var prototype = new medium();
  for(var i in members) {
	if(typeof members[i] === 'function') {
	  prototype[i] = members[i];
	}
  }
  derived.$super           = base;
  derived.prototype        = prototype;
  derived.prototype.$super = base;
  derived.prototype.$class = derived;
}

function escapeSymbols(str) {
  return str.replace(/[\/\^\$\*\+\?\.\(\)\:\=\!\|\{\}\,\[\]\\]/g, '\\$&');
}

function BaseSearcher(opts)
{
  opts         = opts || {};
  var self     = this;
  var entries  = [];
  var indices  = [];
  var ready    = false;
  var numFiles = 0;
  var scope    = opts.scope;
  var onload   = opts.onload;

  self.$addEntry = function(url, title, index)
  {
	entries.push({ url:url, title:title, index:index||title });
  };

  self.$loadIndexFile = function(url, callback)
  {
	var self  = this;
	numFiles += 1;
	fetchContent(url, function(contents) {
	  setTimeout(function() {
	    if(contents) {
		  callback.call(self, contents);
	    }
	    if((numFiles -= 1) <= 0) {
		  self.$finishInitialization();
	    }
	  }, 0);
	});
  };

  self.$finishInitialization = function()
  {
    for(var i = 0, l = entries.length ; i < l ; ++i) {
	  indices.push(entries[i].index + ' ' + i);
    }
	indices = indices.join('\n');
	ready   = true;
	if(onload) {
	  onload.call(scope, this);
	}
  };

  self.$isReady = function()
  {
	return ready;
  };

  self.$load = function()
  {
	this.$buildEntries();
	if(numFiles <= 0) {
	  this.$finishInitialization();
	}
  };

  self.$find = function(str)
  {
	var html = [];
	if(this.$isReady() && str && str.length > 0) {
      var matches = indices.match(new RegExp('(?:^|[\.:#])' + escapeSymbols(str) + '.*', 'gim'));
      if(matches) {
		for(var i = 0, l = matches.length ; i < l ; ++i) {
		  if(/\s(\d+)$/.exec(matches[i])) {
			var entry = entries[parseInt(RegExp.$1, 10)];
			if(entry) {
			  html.push('<a href="' + entry.url + '" target="_blank">' + entry.title + '</a><br />');
			}
		  }
		}
	  }
	}
	return html.join('');
  };

  self.$getSearchEngine = function()
  {
	return null;
  };

  opts = null;
}

function RDocSearcher(opts) {
  opts = opts || {};
  this.$super.call(this, opts);
  var self    = this;
  var baseUrl = appendTrailingSlash(opts.url);
  var files   = ['fr_class_index.html', 'fr_method_index.html'];

  self.$fullUrl = function(url)
  {
	return baseUrl + url;
  };

  self.$buildEntries = function()
  {
	var self     = this;
	var callback = function(contents) {
	  var links = (contents || '').match(/<a\s.*<\/a>/gi) || [];
	  for(var i = 0, l = links.length ; i < l ; ++i) {
		if(/href=\"([^\"]+)\"[^>]*>([^<]+)/i.exec(links[i])) {
		  var url   = self.$fullUrl(RegExp.$1), title = RegExp.$2;
		  var match = /^\S+/.exec(title);
		  if(match) {
			self.$addEntry(url, title, match[0]);
		  }
		}
	  }
	};
	for(var i = 0 ; i < files.length ; ++i) {
	  self.$loadIndexFile(self.$fullUrl(files[i]),  callback);
	}
  };

  self.$getLandingPage = function()
  {
	return this.$fullUrl('files/README.html');
  };

  self.$getSearchEngine = function()
  {
	return ('http://www.google.com/cse/tools/makecse?url=' +
			escapeUrl(this.$fullUrl('fr_class_index.html').replace(/^https?\:\/\//, '')));
  };

  opts = null;
}
inherit(RDocSearcher, BaseSearcher, {});

function JavaDocSearcher(opts) {
  opts = opts || {};
  this.$super.call(this, opts);
  var self    = this;
  var baseUrl = appendTrailingSlash(opts.url);
  var files   = ['overview-frame.html', 'allclasses-frame.html'];

  self.$fullUrl = function(url)
  {
	return baseUrl + url;
  };

  self.$buildEntries = function()
  {
	var self     = this;
	var callback = function(contents) {
	  var links = (contents || '').match(/<a\s.*<\/a>/gi) || [];
	  for(var i = 0, l = links.length ; i < l ; ++i) {
		if(/href=\"([^\"]+)\"[^>]*>([^<]+)/i.exec(links[i])) {
		  var url = self.$fullUrl(RegExp.$1), title = RegExp.$2;
		  self.$addEntry(url.replace(/\/package-frame\.html$/, '/package-summary.html'), title, title);
		}
	  }
	};
	for(var i = 0 ; i < files.length ; ++i) {
	  self.$loadIndexFile(self.$fullUrl(files[i]),  callback);
	}
  };

  self.$getLandingPage = function()
  {
	return this.$fullUrl('overview-summary.html');
  };

  self.$getSearchEngine = function()
  {
	return ('http://www.google.com/cse/tools/makecse?url=' +
			escapeUrl(this.$fullUrl('allclasses-frame.html').replace(/^https?\:\/\//, '')));
  };

  opts = null;
}
inherit(JavaDocSearcher, BaseSearcher, {});

var SearcherClasses = {
  'rdoc'    : RDocSearcher,
  'javadoc' : JavaDocSearcher
};

function SearchControl(opts)
{
  opts           = opts || {}
  var self       = this;
  var prefs      = useLegacy ? new _IG_Prefs() : new gadgets.Prefs();
  var timerID1   = null;
  var timerID2   = null;
  var query      = '';
  var current    = 0;
  var searchers  = [];
  var selectorID = opts.selectorID;
  var scope      = opts.scope;
  var onready    = opts.onready;
  var onchange   = opts.onchange;
  var onidle     = opts.onidle;

  var invokeSearch = function()
  {
	timerID1 = null;
	if(searchers[current] && searchers[current].searcher) {
	  var html = searchers[current].searcher.$find(query);
	  if(onchange) {
		onchange.call(scope, html);
	  }
	}
  };

  var callOnIdle = function()
  {
	timerID2 = null;
	if(onidle) {
	  onidle.call(scope);
	}
  };

  var clearTimers = function()
  {
	if(timerID1) clearTimeout(timerID1);
	if(timerID2) clearTimeout(timerID2);
	timerID1 = timerID2 = null;
  };

  var updateSelectorOptions = function()
  {
	if(selectorID) {
	  var selector = gel(selectorID);
	  var options  = [];
	  var fg = document.createDocumentFragment();
	  for(var i = 0 ; i < searchers.length ; ++i) {
		var e = nel('OPTION');
		e.value     = i;
		e.innerHTML = escapeHtml(searchers[i].label);
		fg.appendChild(e);
	  }
	  var e = nel('OPTION');
	  e.value     = 'edit';
	  e.innerHTML = '編集...';
	  fg.appendChild(e);
	  selector.innerHTML = '';
	  selector.appendChild(fg);
	}
  };

  self.find = function(str)
  {
	if(query != str) {
	  query = str;
	  clearTimers();
	  timerID1 = setTimeout(invokeSearch, 300);
	  timerID2 = setTimeout(callOnIdle, 1000);
	}
  };

  self.changeSearcher = function(newIndex)
  {
	var result = false;
	newIndex   = parseInt(newIndex, 10);
	if(!isNaN(newIndex) && searchers[newIndex]) {
	  clearTimers();
	  current      = newIndex;
	  var searcher = searchers[current];
	  if(!searcher.searcher) {
		var klass = SearcherClasses[searcher.type];
		if(klass) {
		  searcher.searcher = new klass({ url: searcher.url, onload: onready });
		}
		if(searcher.searcher) {
		  searcher.searcher.$load();
		  result = true;
		}
	  }
	}
	return result;
  };

  self.getSearchEngine = function()
  {
	var searcher = searchers[current] && searchers[current].searcher;
	return searcher ? searcher.$getSearchEngine() : null;
  };

  self.getLandingPage = function()
  {
	var searcher = searchers[current] && searchers[current].searcher;
	if(searcher && typeof searcher.$getLandingPage === 'function') {
	  return searcher.$getLandingPage();
	}
	return 'about:blank';
  };

  // -------------------------------------------------------
  var selected  = 0;
  var listboxID = null;
  var typeID    = null;
  var nameID    = null;
  var urlID     = null;

  function selectSearcher(selectedIndex)
  {
	var elements = gel(listboxID).getElementsByTagName('A');
	for(var i = 0 ; i < elements.length ; ++i) {
	  var e = elements[i];
	  if(e.nodeType == 1 && e.tagName == 'A') {
		var index = parseInt(e.title, 10);
		e.className = index == selectedIndex ? 'selected' : '';
	  }
	}
	selected = selectedIndex;
	if(searchers[selected]) {
	  gel(typeID).value = searchers[selected].type;
	  gel(nameID).value = searchers[selected].label;
	  gel(urlID).value  = searchers[selected].url;
	}
  };

  function findItemElement(index) {
	var elements = gel(listboxID).getElementsByTagName('A');
	for(var i = 0 ; i < elements.length ; ++i) {
	  var e = elements[i];
	  if(parseInt(e.title, 10) == index) {
		return e;
	  }
	}
	return null;
  };

  self.initConfig = function(listbox, type, name, url)
  {
	selected  = current;
	listboxID = listbox;
	typeID    = type;
	nameID    = name;
	urlID     = url;
	var html  = [];
	if(searchers) {
	  for(var i = 0 ; i < searchers.length ; ++i) {
		var searcher = searchers[i]
		html.push('<a href="#" title="' + i + '"' + selected + '>' + escapeHtml(searcher.label) + '</a>');
	  }
	}
	gel(listboxID).innerHTML = html.join('');
	selectSearcher(current);
  };

  self.addSearcher = function() {
	searchers.push({ type: 'rdoc', url: '', label: '' });
	var index = searchers.length - 1;
	var e     = nel('A');
	e.href    = "#";
	e.title   = index;
	gel(listboxID).appendChild(e);
	selectSearcher(index);
  };

  self.updateSearcher = function() {
	if(selected < searchers.length) {
	  var searcher = searchers[selected];
	  var type     = gel(typeID).value;
	  var url      = gel(urlID).value;
	  if(searcher.type != type || searcher.url != url) {
		searcher.searcher = null;
	  }
	  searcher.type  = gel(typeID).value;
	  searcher.label = gel(nameID).value;
	  searcher.url   = url;
	  var e          = findItemElement(selected);
	  if(e) {
		e.innerHTML = escapeHtml(searcher.label);
	  }
	}
  };

  self.onClickSearcherList = function(event) {
	event       = event || window.event;
	var element = event.target || event.srcElement;
	while(element) {
	  if(element.nodeType == 1 && element.tagName.toUpperCase() == 'A') {
		index = parseInt(element.title, 10);
		if(!isNaN(index) && 0 <= index && index < searchers.length) {
		  if(index != selected) {
			this.updateSearcher();
			selectSearcher(index);
		  }
		  break;
		}
	  }
	  element = element.parentNode;
	}
	event.preventDefault && event.preventDefault();
	event.returnValue = false;
  };

  self.deleteSearcher = function() {
	if(searchers.length <= 1) {
	  alert('最後の項目は削除できません。');
	  return;
	}
	if(0 <= selected && selected < searchers.length) {
	  searchers.splice(selected, 1);
	  var listbox = gel(listboxID);
	  var e = findItemElement(selected);
	  if(e) {
		listbox.removeChild(e);
	  }
	  var index = 0;
	  for(var i = 0 ; i < listbox.childNodes.length ; ++i) {
		var e = listbox.childNodes[i];
		if(e.nodeType == 1 && e.tagName.toUpperCase() == 'A') {
		  e.title = index;
		  index  += 1;
		}
	  }
	  selected = selected < searchers.length ? selected : searchers.length - 1;
	  selectSearcher(selected);
	}
  };

  self.applyConfiguration = function() {
	this.updateSearcher();

	if(searchers[0]) {
	  topItem = searchers[0];
	  prefs.set('label', topItem.label);
	  prefs.set('url',   topItem.url);
	}

	if(useOpenSocial) {
	  var data = [];
	  for(var i = 1 ; i < searchers.length ; ++i) {
		var searcher = searchers[i];
		data.push({
		  type:  searcher.type,
		  label: searcher.label,
		  url:   searcher.url
		});
	  }
	  var req = opensocial.newDataRequest();
	  req.add(req.newUpdatePersonAppDataRequest('VIEWER', 'searchers', gadgets.json.stringify(data)));
	  req.send(function(){});
	}

	updateSelectorOptions();
	if(current >= searchers.length) {
	  current = searchers.length - 1;
	}
	gel(selectorID).value = current;
	return this.changeSearcher(current);
  };

  // -------------------------------------------------------

  searchers = [{
	type:  prefs.getString('type'),
	label: prefs.getString('label'),
	url:   prefs.getString('url')
  }];

  if(useOpenSocial) {
	(function() {
	  var req = opensocial.newDataRequest();
	  req.add(req.newFetchPersonRequest(opensocial.DataRequest.PersonId.VIEWER), 'viewer');
	  req.add(req.newFetchPersonAppDataRequest('VIEWER', ['searchers']), 'config');
	  req.send(function(data) {
		if(data.hadError()) {
		  alert(data.getErrorMessage());
		} else {
		  var viewer = data.get('viewer');
		  var config = data.get('config');
		  if(viewer.hadError()) {
			alert(viewer.getErrorMessage());
		  } else if(config.hadError()) {
			alert(config.getErrorMessage());
		  } else {
			var d = config.getData()[viewer.getData().getId()]
			if(d['searchers']) {
			  var entries = gadgets.json.parse(gadgets.util.unescapeString(d['searchers']));
			  for(var i = 0, l = entries.length ; i < l ; ++i) {
				var entry = entries[i];
				searchers.push({
				  type:  entry['type'],
				  label: entry['label'],
				  url:   entry['url']
				});
			  }
			}
		  }
		}
		updateSelectorOptions();
		self.changeSearcher(0);
	  });
	})();
  } else {
	updateSelectorOptions();
	self.changeSearcher(0);
  }

}

return {
  RDocSearcher  : RDocSearcher,
  SearchControl : SearchControl
};

})();
