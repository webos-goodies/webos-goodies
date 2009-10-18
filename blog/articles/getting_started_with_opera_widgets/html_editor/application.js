var currentFilename = widget.preferenceForKey('filename');
var currentUrl      = 'opera:blank';
var currentText     = '';
var updateTimer     = null;

function onChangeSource(event) {
  updateTimer && clearTimeout(updateTimer);
  updateTimer = setTimeout(saveFile, 3000);
}

function onClickConfig() {
  $('#main, #config').toggle();
}

function onClickBtnDir() {
  var olddir = null;
  try { olddir = opera.io.filesystem.mountPoints.resolve('current'); } catch(e) {}
  opera.io.filesystem.browseForDirectory('current', '', function(dir) {
	if(dir) {
	  olddir && opera.io.filesystem.removeMountPoint(olddir);
	  refreshFiles();
	}
  }, true);
}

function onChangeFiles() {
  var fname = $('#files').attr('value');
  fname && loadFile(fname);
}

function isValidFile(file) {
  return file.exists && file.isFile && !file.readOnly && /\.html?$/.test(file.name);
}

function refreshFiles() {
  var files = $('#files').empty();
  try {
	var dir = opera.io.filesystem.mountPoints.resolve('current');
	dir.refresh();
	for(var i = 0 ; i < dir.length ; ++i) {
	  var file = dir[i];
	  if(isValidFile(file))
		files.append($('<option />').attr('value', file.name).text(decodeURIComponent(file.name)))
	}
  } catch(e) {}
}

function loadFile(fname) {
  currentFilename = null;
  currentUrl      = 'opera:blank';
  currentText     = '';
  try {
	if(fname) {
	  var file = opera.io.filesystem.mountPoints.resolve('current/' + fname)
	  if(isValidFile(file)) {
		var stream = file.open(null, opera.io.filemode.READ);
		try {
		  currentText     = stream.read(stream.bytesAvailable);
		  currentFilename = fname;
		  currentUrl      = file.path;
		} finally { stream.close(); }
	  }
	}
  } catch(e) {}
  $('#source_edit').attr('value', currentText);
  $('#preview').attr('src', currentUrl);
  widget.setPreferenceForKey(currentFilename, 'filename');
}

function saveFile() {
  var text = $('#source_edit').attr('value')
  if(currentFilename && text != currentText) {
	try {
	  var file   = opera.io.filesystem.mountPoints.resolve('current/' + currentFilename)
	  var stream = file.open(null, opera.io.filemode.WRITE);
	  try {
		stream.write(text);
		currentText = text;
	  } finally { stream.close(); }
	  var iframe = $('#preview').get(0);
	  var parent = iframe.parentNode;
	  parent.removeChild(iframe);
	  parent.appendChild(iframe);
	  iframe.src = file.path;
	} catch(e) {throw e;}
  }
}

function initApp() {
  WidgetChrome.ButtonConfig.onclick = onClickConfig;
  WidgetChrome.autoResize('main');
  $('#main').show();
  $('#source_edit').keyup(onChangeSource);
  $('#btn_dir').click(onClickBtnDir);
  $('#files').change(onChangeFiles);
  refreshFiles();
  loadFile(currentFilename);
}

$(window).load(initApp);
