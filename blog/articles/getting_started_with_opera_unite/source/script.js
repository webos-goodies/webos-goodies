function toppageHandler(event) {
  var connection = event.connection;
  var template   = new Markuper('top.html', {});
  connection.response.write(template.parse().html());
  connection.response.close();
}
handlers.push(['_index', toppageHandler]);

function requestInfoHandler(event) {
  var connection = event.connection;
  var template   = new Markuper('request-info.html', { connection : connection });
  connection.response.write(template.parse().html());
  connection.response.close();
}
handlers.push(['request-info', requestInfoHandler]);

function memoHandler(event) {
  var connection = event.connection;
  var request    = connection.request;
  var response   = connection.response;
  if(request.method == 'POST' && connection.isOwner && request.bodyItems.data) {
    widget.setPreferenceForKey(decodeURIComponent(request.bodyItems.data[0]), 'memoData');
  }
  var template = new Markuper('memo.html', {
    data : widget.preferenceForKey('memoData') || ''
  });
  response.write(template.parse().html());
  response.close();
}
handlers.push(['memo', memoHandler]);

function externalHandler(event) {
  var response = event.connection.response;
  xhr = new XMLHttpRequest();
  xhr.open('GET', "http://webos-goodies.jp/atom.xml", false);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      response.setResponseHeader('Content-Type', 'application/xml; charset=utf-8');
      response.write(xhr.responseText);
      response.close();
    }
  }
  xhr.send(null);
}
handlers.push(['external', externalHandler]);

function fileHandler(event) {
  var connection = event.connection;
  var request    = connection.request;
  var response   = connection.response;
  var shared     = opera.io.filesystem.mountSystemDirectory('shared');
  var paths      = request.uri.split('?')[0].replace(/^\/+|\/+$/g, '').split('/');
  if(connection.isOwner) {
    if(paths.length <= 2) {

      if(request.method == "POST") {
        var stream = shared.open(request.files[0].name, opera.io.filemode.WRITE);
        stream.writeFile(request.files[0]);
        stream.close();
      }
      shared.refresh();
      var files = [];
      for(var i = 0 ; i < shared.length ; ++i) {
        if(shared[i].isFile)
          files.push({ name: shared[i].name, displayName: decodeURIComponent(shared[i].name) });
      }
      var template = new Markuper('file.html', { files: files });
      response.write(template.parse().html());

    } else if(paths.length == 3 && paths[2].indexOf('.') != 0) {

      var file = shared.resolve(paths[2]);
      var type = opera.io.webserver.getContentType(file.name);
      response.setResponseHeader('Content-Type', type);
      response.writeFile(file);

    }
  }
  response.close();
}
handlers.push(['file', fileHandler]);
