goog.provide('booksearchgadget.App');
goog.require('goog.dom');
goog.require('goog.events');

booksearchgadget.App = function() {};

function onSubmit(e) {
  e.preventDefault();
  var text = goog.dom.getElement('text').value;
  var url  = 'http://books.google.com/books/feeds/volumes?q=' + _esc(text);
  _IG_FetchXmlContent(url, function(response) {
    var resultEl = goog.dom.getElement('result');
    goog.dom.removeChildren(resultEl);
    try {
      var feed = new atomparser.Feed(response);
      var ul   = goog.dom.createDom('ul');
      feed.forEachEntry(function(entry) {
        var url = entry.getLink('alternate', 'text/html');
        var el  = goog.dom.createDom(
          'li', null, goog.dom.createDom('a', { 'href': url }, entry.title));
        goog.dom.appendChild(ul, el);
      });
      goog.dom.appendChild(goog.dom.getElement('result'), ul);
    } catch(e) {
      goog.dom.setTextContent(goog.dom.getElement('result'), e);
    }
  });
}

goog.events.listen(goog.dom.getElement('search-form'),
                   goog.events.EventType.SUBMIT,
                   onSubmit);
