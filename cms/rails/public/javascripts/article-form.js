function SimpleTab(tabsId, opts) {
  opts = opts || {};

  var tabPrefix     = opts['tabPrefix']     || 'tab-';
  var contentPrefix = opts['contentPrefix'] || 'content-';
  var currentClass  = opts['currentClass']  || 'current';
  var callback      = opts['callback']      || function(){};
  var regexp        = new RegExp('^' + tabPrefix + '(.*)');
  var selector      = '#' + tabsId + ">li>a[id^='" + tabPrefix + "']";

  $(selector).each(function() {
	$('#' + contentPrefix + regexp.exec(this.id)[1]).css('display', $(this).hasClass(currentClass) ? 'block' : 'none');
  }).click(function(event) {
	var self = this;
	$(selector).each(function() {
	  var content = $('#' + contentPrefix + regexp.exec(this.id)[1]);
	  if(self.id == this.id) {
		$(this).addClass(currentClass);
		content.css('display', 'block');
	  } else {
		$(this).removeClass(currentClass);
		content.css('display', 'none');
	  }
	});
	callback.call(this);
	event.preventDefault();
	event.stopPropagation();
  });

}

jQuery(function(){
  SimpleTab('menu');
  $('#btn-submit').click(function(event) {
	$('#article-form').get(0).submit();
	event.preventDefault();
	event.stopPropagation();
  });
})
