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
{var $10=[],$11=[],$12=this.$12;$W=$W.replace(/~/g,'~T');$W=$W.replace(/(\s)(https?:\/\/[^\s]+)/g,function(d,$13,$14){$10[$10.length]=$14;return $13+'~L';});$W=$W.replace(/\s*\[block\]((?:.|[\r\n])*?)\[\/block\]\s*/g,function(d,$14){$11[$11.length]=$14;return'~B';});$W=$W.replace(/\r\n|\r|\n/g,'~N');$W=$W;$W=$W.replace(/~B/g,function(){var $15=$11.shift();return'<pre style="'+$12+'">'+$15+'</pre>';});$W=$W.replace(/~L/g,function(){var $16=$10.shift();var $15=$16;if($15.length>60)
$15=$15.slice(0,60)+'...';return'<a href="'+$16+'">'+$15+'</a>';});$W=$W.replace(/~N/g,'<br/>').replace(/~T/g,'~');return $W;},$17:function($C,$b)
{var $A=$1('DIV');$e($A,this.$18);if(this.$t)
this.$t.addTab($C,{content:$A});else
this.$q.appendChild($A);$b.call(this,$A);},$19:function($1a)
{var $1b;this.$17('ソース',function($A){$A.innerHTML='<pre style="margin:0px;padding:0px;border:none;">'+$1a.entry.src_sourcecode+'</pre>';$A.firstChild.className=this.$O;});},$1c:function($1a)
{this.$17('詳細',function($A){var $v=$1('TABLE');var $w=$1('TBODY');var $1d=$1('DIV');var $1e=$1a.entry;var $1f=[['タイトル',this.$U('/source/view/'+$1e.src_id,$1e.src_title)],['ソースコードID',$1e.src_id],['登録者',this.$U('/user/profile/'+$1a.auth_id,$1a.auth_name)],['登録日時',this.$X($1a.auth_regdate)],['最終更新者',this.$U('/user/profile/'+$1a.modifier_id,$1a.auth_modifier_name)],['最終更新日時',this.$X($1a.auth_modify_date)],['GoodJob数',$1e.src_gj],['アクセス数',$1e.src_access_num],['コメント数',$1e.src_comment_num]];if($1a.tagdata.length>0)
{var $1g=$1a.tagdata,$1h=[];for(var i=0;i<$1g.length;++i)
{var $1i=$1g[i].tag;$1h[$1h.length]=this.$U('/code/search?q='+$1i+'&tag=1&code_type=1',$1i);}
$1f[$1f.length]=['タグ',$1h.join('&nbsp;')];}
if($1e.src_relate_name)
$1f[$1f.length]=['関連トピック',$8($1e.src_relate_name)];$e($v,this.$f);$w.appendChild(this.$P($1f));$v.appendChild($w);$A.appendChild($v);$e($1d,this.$1j);$1d.innerHTML=this.$Z($1e.src_description);$A.appendChild($1d);});},$1k:function($1a)
{var $1l=$1a.commnt;$1l.sort(function(a,b){return a.com_num-b.com_num;});this.$17('コメント',function($A){for(var i=0;i<$1l.length;++i)
{var $1m=$1l[i];var $1n=$1('DIV');var $1o=$1('DIV');var $1p=$1('DIV');$e($1n,this.$1q);$e($1o,this.$1r);$e($1p,this.$1s);if(i!=$1a.entry.src_comment_num-1)
$1n.style.borderBottom='dotted 1px #333';$1o.innerHTML=($1m.com_num+': '+
this.$U('/user/profile/'+$1m.com_id,$1m.com_name)+' ('+
this.$X($1m.com_regdate)+')');$1p.innerHTML=$1m.com_description.replace(/\r\n|\r|\n/g,'<br/>');$1n.appendChild($1o);$1n.appendChild($1p);$A.appendChild($1n);}
if($1l.length!=$1a.entry.src_comment_num)
{var $G=$1('DIV');$e($G,this.$1t);$G.innerHTML=this.$U('/source/view/'+$1a.entry.src_id,'>> もっと読む');$A.appendChild($G);}});},$1u:function($1a)
{this.$G=$1('DIV');$e(this.$G,this.$1v);this.$G.innerHTML=this.$U('/source/view/'+$1a.entry.src_id,'説明')+' | '+
this.$U('/source/history/'+$1a.entry.src_id+' ?pid=1','履歴')+' | '+
this.$U('/source/download/'+$1a.entry.src_id+' ?pid=1','コピペ用');$0(this.$F).appendChild(this.$G);},$1w:function($1a)
{this.$1x={width:'100%',margin:'0px',padding:'4px',overflow:'auto',borderWidth:'1px',borderColor:'#666'};this.$18={margin:'0px',padding:'0px'};this.$f={margin:'8px 8px',padding:'0px',borderCollapse:'separate',borderSpacing:'0px',emptyCells:'show',lineHeight:'1.5'};this.$S={fontSize:'11px',textAlign:'right',padding:'0px 8px 0px 0px',whiteSpace:'pre'};this.$T={fontSize:'12px',textAlign:'left',padding:'0px'};this.$1j={margin:'12px 8px 0px 8px',padding:'8px',border:'dashed 1px #888'};this.$1q={margin:'0px',padding:'8px 0px'};this.$1r={margin:'0px 0px 4px 0px',padding:'0px'};this.$1s={margin:'0px 0px 0px 1em',padding:'0px'};this.$1t={margin:'4px',padding:'0px',textAlign:'right',fontSize:'10px'};this.$1v={margin:'0px',padding:'0px',textAlign:'right',fontSize:'12px'};this.$12='margin:0.8em 0px;padding:0.8em;background-color:#eee;border:solid 1px #888;';var $K=this.$K&&$1a.commnt.length>0;var $1y=(this.$I?1:0)+(this.$J?1:0)+($K?1:0);var $L=$1y>=2||this.$L;if($L)
{this.$t=new WebOSGoodies.SimpleTab(this.$F);this.$q=this.$t.getContentContainer();$e(this.$q,this.$1x);this.$q.style.borderStyle='none solid solid solid';}
else
{this.$q=$1('DIV');$e(this.$q,this.$1x);this.$q.style.borderStyle='solid';$0(this.$F).appendChild(this.$q);}
if(window.Components)
this.$q.style.setProperty('-moz-box-sizing','border-box',null);else if($5(this.$q.style.setProperty))
this.$q.style.setProperty('box-sizing','border-box',null);if(!this.$N)
this.$q.style.borderStyle='none';if(this.$H)
this.$q.style.height=this.$H+'px';if(this.$I)
this.$19($1a);if(this.$J)
this.$1c($1a);if($K)
this.$1k($1a);if(this.$M)
this.$1u($1a);if(window.ActiveXObject)
{var $A=$0(this.$F).parentNode;if($A.offsetWidth<this.$q.offsetWidth)
{this.$q.style.width=$A.offsetWidth-(this.$q.offsetWidth-$A.offsetWidth);}}},getTabs:function()
{return this.$t;},getContentContainer:function()
{return this.$q;},getFooterContainer:function()
{return this.$G;}};window.WebOSGoodies.CodeNanigaC={$b:function($1z,$1a)
{$1z.$1w($1a);},write:function($1A,$n)
{var $1B=$E++;var $F=$D+$1B;var $b='callback'+$1B;var $1z=new Widget($F,$n);this[$b]=$9(this,this.$b,$1z);document.open();document.write('<div id="'+$F+'" style="width:100%;"></div>');document.write('<scr'+'ipt type="text/javascript" src="http://api.code.nanigac.com/getSource.php?id='+parseInt($1A,10)+'&fmt=json&jsonp=window.WebOSGoodies.CodeNanigaC.'+$b+'&comment=1-10"></scr'+'ipt>');document.close();return $1z;}};}})();