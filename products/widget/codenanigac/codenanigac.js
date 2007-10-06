(function(){function $0(id){return typeof id==='string'?document.getElementById(id):id;}
function $1(t){return document.createElement(t);}
function $2(){return document.createDocumentFragment();}
function $3(o){return typeof o==='undefined';};function $4(o){return o&&(typeof o==='object'||typeof o==='function');}
function $5(o){return typeof o==='function';};function $6(o){return typeof o==='string';}
function $7(o,t){return typeof o==='object'&&(!t||o.nodeType==t);}
function $8(a)
{a=a.replace(/&/g,'&amp;');a=a.replace(/</g,'&lt;').replace(/>/g,'&gt;');a=a.replace(/\"/g,'&quot;').replace(/\'/g,'&#39;');return a;}
function $9($a,$b)
{var $c=[];for(var i=2;i<arguments.length;++i)
$c[$c.length]=arguments[i];return function(){var $d=$c.slice(0);for(var i=0;i<arguments.length;++i)
$d[$d.length]=arguments[i];$b.apply($a,$d)};}
function $e(el,styles)
{if($6(styles))
{el.style.cssText=styles;}
else
{for(i in styles)
{if($6(styles[i]))
el.style[i]=styles[i];}}}
(function(){$f={width:'100%',borderCollapse:'separate',borderSpacing:'0px',emptyCells:'show',fontSize:'12px',textAlign:'center',lineHeight:'1'};$g={backgroundColor:'#dddddd',color:'black',fontWeight:'normal',margin:'0px',padding:'2px 8px 2px 8px',borderStyle:'solid',borderWidth:'1px',borderColor:'#aaa #aaa #666 #aaa',width:'80px',cursor:'pointer'};$h={backgroundColor:'white',borderColor:'#666 #666 #fff #666',color:'#36c',fontWeight:'bold',cursor:'default'};$i={padding:'0px',margin:'0px',borderStyle:'none none solid none',borderWidth:'1px',borderColor:'#666',width:'3px'};function $j($k,$l,$m,$n)
{this.$k=$k;this.$l=$l;this.$m=$m;this.$b=$n.callback;this.$o=$n.scope;}
$j.prototype={getIndex:function(){return this.$k;},getNameContainer:function(){return this.$l;},getContentContainer:function(){return this.$m;},$p:function()
{if($5(this.$b))
this.$b.call(this.$o||window,this);}};function SimpleTab($q,$n)
{$n=$4($n)?$n:{};this.$q=$6($q)?$0($q):$q;this.$r=$1('TR');this.$s=$1('DIV');this.$t=[];this.$u=$n.current||0;var $v=$1('TABLE');var $w=$1('TBODY');$e($v,$f);$v.cellSpacing='0';$v.width='100%';$w.appendChild(this.$r);$v.appendChild($w);this.$x();this.$x();this.$r.lastChild.style.width='';this.$q.appendChild($v);this.$q.appendChild(this.$s);};SimpleTab.prototype={$y:function($k)
{for(var i=0;i<this.$t.length;++i)
{var $z=this.$t[i];$e($z.$l,$g);$z.$m.style.display='none';if(i==$k)
{$e($z.$l,$h);$z.$m.style.display='';$z.$p();}}},$x:function()
{var $A=$1('TD');$e($A,$i);$A.innerHTML='&nbsp;';this.$r.insertBefore($A,this.$r.lastChild);},$B:function($k)
{if(0<=$k&&$k<this.$t.length)
{var $z=this.$t[$k];$e($z.$l,$h);$z.$m.style.display='';}},addTab:function($C,$n)
{$n=$4($n)?$n:{};if(this.$t.length>0)
this.$x();var $l=$1('TD');$e($l,$g);$l.innerHTML=$8($C);$l.onclick=$9(this,this.$y,this.$t.length);this.$r.insertBefore($l,this.$r.lastChild);var $m=$7($n.content,1)?$n.content:$1('DIV');$m.style.display='none';if($6($n.content))
$m.innerHTML=$n.content;if(!$m.parentNode)
this.$s.appendChild($m);var $k=this.$t.length;var $z=new $j($k,$l,$m,$n);this.$t.push($z);if(this.$u==$k)
{this.$B($k);$z.$p();}
return $z;},getTabs:function()
{return this.$t;},getHeaderContainer:function()
{return this.$r;},getContentContainer:function()
{return this.$s;}};window.WebOSGoodies=window.WebOSGoodies||{};window.WebOSGoodies.SimpleTab=window.WebOSGoodies.SimpleTab||SimpleTab;})();if(!window.WebOSGoodies.CodeNanigaC)
{var $D='WebOSGoodies_CodeNanigaC';var $E=0;function Widget($F,$n)
{$n=$4($n)?$n:{};this.$F=$F;this.$t=null;this.$q=null;this.$G=null;this.$H=$n.height;this.$I=$3($n.showSource)?true:$n.showSource;this.$J=$3($n.showInfo)?true:$n.showInfo;this.$K=$3($n.showComments)?true:$n.showComments;this.$L=$n.showTabs;this.$M=$3($n.showFooter)?true:$n.showFooter;this.$N=$3($n.showBorder)?true:$n.showBorder;this.$O=$n.sourceClass||'prettyprint';};Widget.prototype={$P:function($Q)
{var $A=$2();for(var i=0;i<$Q.length;++i)
{var $R=$Q[i];var tr=$1('TR');var td0=$1('TD');var td1=$1('TD');$e(td0,this.$S);$e(td1,this.$T);td0.innerHTML=$R[0];td1.innerHTML=$R[1];tr.appendChild(td0);tr.appendChild(td1);$A.appendChild(tr);}
return $A;},$U:function($V,$W)
{return'<a href="http://code.nanigac.com'+$8($V)+'" target="_blank">'+$8($W)+'</a>';},$X:function($Y)
{if(/(\d+-\d+-\d+)T(\d+:\d+)/.exec($Y))
{var d=RegExp.$1,t=RegExp.$2;return d.replace(/-/g,'/')+' '+t;}
else
{return'';}},$Z:function($W)
{var $10=[];$W=$W.replace(/~/g,'~T');$W=$W.replace(/(\s)(https?:\/\/[^\s]+)/g,function(d,$11,$12){$10[$10.length]=$12;return $11+'~L';});$W=$W.replace(/\r\n|\r|\n/g,'~N');$W=$8($W);$W=$W.replace(/~L/g,function(){var $13=$10.shift();var $14=$13;if($14.length>60)
$14=$14.slice(0,60)+'...';return'<a href="'+$13+'">'+$14+'</a>';});$W=$W.replace(/~N/g,'<br/>').replace(/~T/g,'~');return $W;},$15:function($C,$b)
{var $A=$1('DIV');$e($A,this.$16);if(this.$t)
this.$t.addTab($C,{content:$A});else
this.$q.appendChild($A);$b.call(this,$A);},$17:function($18)
{var $19;this.$15('ソース',function($A){$A.innerHTML='<pre style="margin:0px;padding:0px;border:none;">'+$18.entry.src_sourcecode+'</pre>';$A.firstChild.className=this.$O;});},$1a:function($18)
{this.$15('詳細',function($A){var $v=$1('TABLE');var $w=$1('TBODY');var $1b=$1('DIV');var $1c=$18.entry;var $1d=[['タイトル',this.$U('/source/view/'+$1c.src_id,$1c.src_title)],['ソースコードID',$1c.src_id],['登録者',this.$U('/user/profile/'+$18.auth_id,$18.auth_name)],['登録日時',this.$X($18.auth_regdate)],['最終更新者',this.$U('/user/profile/'+$18.modifier_id,$18.auth_modifier_name)],['最終更新日時',this.$X($18.auth_modify_date)],['GoodJob数',$1c.src_gj],['アクセス数',$1c.src_access_num],['コメント数',$1c.src_comment_num]];if($18.tagdata.length>0)
{var $1e=$18.tagdata,$1f=[];for(var i=0;i<$1e.length;++i)
{var $1g=$1e[i].tag;$1f[$1f.length]=this.$U('/code/search?q='+$1g+'&tag=1&code_type=1',$1g);}
$1d[$1d.length]=['タグ',$1f.join('&nbsp;')];}
if($1c.src_relate_name)
$1d[$1d.length]=['関連トピック',$8($1c.src_relate_name)];$e($v,this.$f);$w.appendChild(this.$P($1d));$v.appendChild($w);$A.appendChild($v);$e($1b,this.$1h);$1b.innerHTML=this.$Z($1c.src_description);$A.appendChild($1b);});},$1i:function($18)
{var $1j=$18.commnt;$1j.sort(function(a,b){return a.com_num-b.com_num;});this.$15('コメント',function($A){for(var i=0;i<$1j.length;++i)
{var $1k=$1j[i];var $1l=$1('DIV');var $1m=$1('DIV');var $1n=$1('DIV');$e($1l,this.$1o);$e($1m,this.$1p);$e($1n,this.$1q);if(i!=$18.entry.src_comment_num-1)
$1l.style.borderBottom='dotted 1px #333';$1m.innerHTML=($1k.com_num+': '+
this.$U('/user/profile/'+$1k.com_id,$1k.com_name)+' ('+
this.$X($1k.com_regdate)+')');$1n.innerHTML=$1k.com_description.replace(/\r\n|\r|\n/g,'<br/>');$1l.appendChild($1m);$1l.appendChild($1n);$A.appendChild($1l);}
if($1j.length!=$18.entry.src_comment_num)
{var $G=$1('DIV');$e($G,this.$1r);$G.innerHTML=this.$U('/source/view/'+$18.entry.src_id,'>> もっと読む');$A.appendChild($G);}});},$1s:function($18)
{this.$G=$1('DIV');$e(this.$G,this.$1t);this.$G.innerHTML=this.$U('/source/view/'+$18.entry.src_id,'説明')+' | '+
this.$U('/source/history/'+$18.entry.src_id+' ?pid=1','履歴')+' | '+
this.$U('/source/download/'+$18.entry.src_id+' ?pid=1','コピペ用');$0(this.$F).appendChild(this.$G);},$1u:function($18)
{this.$1v={width:'100%',margin:'0px',padding:'4px',overflow:'auto',borderWidth:'1px',borderColor:'#666'};this.$16={margin:'0px',padding:'0px'};this.$f={margin:'8px 8px',padding:'0px',borderCollapse:'separate',borderSpacing:'0px',emptyCells:'show',lineHeight:'1.5'};this.$S={fontSize:'11px',textAlign:'right',padding:'0px 8px 0px 0px',whiteSpace:'pre'};this.$T={fontSize:'12px',textAlign:'left',padding:'0px'};this.$1h={margin:'12px 8px 0px 8px',padding:'8px',border:'dotted 1px #333'};this.$1o={margin:'0px',padding:'8px 0px'};this.$1p={margin:'0px 0px 4px 0px',padding:'0px'};this.$1q={margin:'0px 0px 0px 1em',padding:'0px'};this.$1r={margin:'4px',padding:'0px',textAlign:'right',fontSize:'10px'};this.$1t={margin:'0px',padding:'0px',textAlign:'right',fontSize:'12px'};var $K=this.$K&&$18.commnt.length>0;var $1w=(this.$I?1:0)+(this.$J?1:0)+($K?1:0);var $L=$1w>=2||this.$L;if($L)
{this.$t=new WebOSGoodies.SimpleTab(this.$F);this.$q=this.$t.getContentContainer();$e(this.$q,this.$1v);this.$q.style.borderStyle='none solid solid solid';}
else
{this.$q=$1('DIV');$e(this.$q,this.$1v);this.$q.style.borderStyle='solid';$0(this.$F).appendChild(this.$q);}
if(window.Components)
this.$q.style.setProperty('-moz-box-sizing','border-box',null);else if($5(this.$q.style.setProperty))
this.$q.style.setProperty('box-sizing','border-box',null);if(!this.$N)
this.$q.style.borderStyle='none';if(this.$H)
this.$q.style.height=this.$H+'px';if(this.$I)
this.$17($18);if(this.$J)
this.$1a($18);if($K)
this.$1i($18);if(this.$M)
this.$1s($18);if(window.ActiveXObject)
{var $A=$0(this.$F).parentNode;if($A.offsetWidth<this.$q.offsetWidth)
{this.$q.style.width=$A.offsetWidth-(this.$q.offsetWidth-$A.offsetWidth);}}},getTabs:function()
{return this.$t;},getContentContainer:function()
{return this.$q;},getFooterContainer:function()
{return this.$G;}};window.WebOSGoodies.CodeNanigaC={$b:function($1x,$18)
{$1x.$1u($18);},write:function($1y,$n)
{var $1z=$E++;var $F=$D+$1z;var $b='callback'+$1z;var $1x=new Widget($F,$n);this[$b]=$9(this,this.$b,$1x);document.open();document.write('<div id="'+$F+'" style="width:100%;"></div>');document.write('<scr'+'ipt type="text/javascript" src="http://api.code.nanigac.com/getSource.php?id='+parseInt($1y,10)+'&fmt=json&jsonp=window.WebOSGoodies.CodeNanigaC.'+$b+'&comment=1-10"></scr'+'ipt>');document.close();return $1x;}};}})();