(function() {

function $gel(id) {return typeof id === 'string' ? document.getElementById(id) : id;}
function $nel(t)  {return document.createElement(t);}

function $hesc(a)
{
  a = a.replace(/&/g, '&amp;');
  a = a.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  a = a.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
  return a;
}

function $currying($self, $method)
{
  var $args   = [];
  for(var i = 2 ; i < arguments.length ; ++i)
    $args[$args.length] = arguments[i];
  return function() { $method.apply($self, $args) };
}

function $applyStyles(el, styles)
{
  if(typeof styles === 'string')
  {
    el.style.cssText = styles;
  }
  else
  {
    for(i in styles)
    {
      if(typeof styles[i] === 'string')
        el.style[i] = styles[i];
    }
  }
}

$styleTable = {
  width:          '100%',
  borderCollapse: 'separate',
  borderSpacing:  '0px',
  emptyCells:     'show'
};

$styleTabBase = {
  backgroundColor: '#dddddd',
  color:           'black',
  fontSize:        '12px',
  fontWeight:      'normal',
  margin:          '0px',
  padding:         '2px 8px 2px 8px',
  borderTop:       'solid 1px #aaaaaa',
  borderLeft:      'solid 1px #aaaaaa',
  borderRight:     'solid 1px #aaaaaa',
  borderBottom:    'solid 1px #676767',
  textAlign:       'center',
  width:           '80px'
};

$styleTabActive = {
  backgroundColor: 'white',
  borderBottom:    'solid 1px white',
  color:           '#3366cc',
  fontWeight:      'bold'
};

$styleTabSpacer = {
  padding:      '0px',
  margin:       '0px',
  borderTop:    'none',
  borderLeft:   'none',
  borderRight:  'none',
  borderBottom: 'solid 1px #676767',
  width:        '3px'
};

function SimpleTab($tabContainer, $options)
{
  this.$tabContainer = $tabContainer;
  this.$tabParent    = $nel('TR');
  this.$tabs         = [];

  var $table = $nel('TABLE');
  var $tbody = $nel('TBODY');
  $applyStyles($table, $styleTable);
  $tbody.appendChild(this.$tabParent);
  $table.appendChild($tbody);
  this.$appendSpacer();
  this.$appendSpacer();
  this.$tabParent.lastChild.style.width = '';
  this.$tabContainer.appendChild($table);
};
SimpleTab.prototype = {

  $onClick : function($index)
  {
    for(var i = 0 ; i < this.$tabs.length ; ++i)
    {
      var $tab = this.$tabs[i];
      $applyStyles($tab.$element, $styleTabBase);
      if(i == $index)
        $applyStyles($tab.$element, $styleTabActive);
    }
  },

  $appendSpacer : function()
  {
    var $element = $nel('TD');
    $applyStyles($element, $styleTabSpacer);
    $element.innerHTML = ' ';
    this.$tabParent.insertBefore($element, this.$tabParent.lastChild);
  },

  addTab : function($label)
  {
    if(this.$tabs.length > 0)
      this.$appendSpacer();
    var $element = $nel('TD');
    $applyStyles($element, $styleTabBase);
    $element.innerHTML = $hesc($label);
    $element.onclick   = $currying(this, this.$onClick, this.$tabs.length);
    this.$tabParent.insertBefore($element, this.$tabParent.lastChild);
    this.$tabs.push({
      $element: $element
    });
  }

};

window.WebOSGoodies = window.WebOSGoodies || {};
window.WebOSGoodies.SimpleTab = SimpleTab;

})();

var tabs = new SimpleTab(_gel('tabs'));
tabs.addTab('tab1');
tabs.addTab('tab2');
tabs.addTab('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
tabs.addTab('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
tabs.addTab('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
