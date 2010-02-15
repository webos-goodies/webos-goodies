var config      = {};
var preferences = ['view', 'language', 'width', 'height'];
var configItems = ['view', 'language'];

var messageBundles = {
  'english': {
	'view':      'Initial View',
	'following': 'Following',
	'menu':      'Menu',
	'language':  'Language',
	'english':   'English',
	'japanese':  'Japanese'
  },
  'japanese': {
	'view':      '起動時に表示するビュー',
	'following': 'フォロー中',
	'menu':      'メニュー',
	'language':  '言語',
	'english':   '英語',
	'japanese':  '日本語'
  }
};

function onClickConfig() {
  $('#buzz-view, #config-view').toggle();
}

function loadConfig() {
  if(widget && typeof widget.preferenceForKey == 'function') {
	$.each(preferences, function() {
	  config[this] = widget.preferenceForKey(this);
	});
  }
  config['view']     = config['view']     || 'following';
  config['language'] = config['language'] || 'english';
}

function saveConfig() {
  if(widget && typeof widget.setPreferenceForKey == 'function') {
	$.each(preferences, function() {
	  widget.setPreferenceForKey(config[this], this);
	});
  }
}

function updateConfig() {
  $.each(configItems, function() {
	var item = this;
	$('#config-' + item + '-set input').each(function() {
	  this.checked = config[item] == this.value ? true : false;
	});
  });
}

function changeLanguage() {
  var bundle = messageBundles[config['language']] || messageBundles['english'];
  $.each(bundle, function(key) {
	document.getElementById('label-' + key).innerText = this;
  });
  var url = ('https://m.google.com/app/buzz?force=1&hl=' +
			 (config['language'] == 'japanese' ? 'ja' : 'en') +
			 '#~buzz:view=' + config['view']);
  document.getElementById('buzz').src = url;
}

function onChangeConfig(e) {
  var language = config['language'];
  $.each(configItems, function() {
	var item = this;
	$('#config-' + item + '-set input').each(function() {
	  if(this.checked)
		config[item] = this.value;
	});
  });
  saveConfig();
  if(config['language'] != language) {
	changeLanguage();
  }
}

function onResize(width, height) {
  config['width']  = width;
  config['height'] = height;
  saveConfig();
}

function initApp() {
  loadConfig();
  updateConfig();
  changeLanguage();
  if(config['width'] && config['height']) {
	window.resizeTo(config['width'], config['height']);
	WidgetChrome.redraw();
  }
  WidgetChrome.ButtonConfig.onclick = onClickConfig;
  WidgetChrome.onresize = onResize;
  $('#config-view input').change(onChangeConfig);
}

$(window).load(initApp);
