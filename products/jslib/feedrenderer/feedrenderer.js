(function(){var g=this;
function h(a){var c=typeof a;if(c=="object")if(a){if(a instanceof Array||!(a instanceof Object)&&Object.prototype.toString.call(a)=="[object Array]"||typeof a.length=="number"&&typeof a.splice!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("splice"))return"array";if(!(a instanceof Object)&&(Object.prototype.toString.call(a)=="[object Function]"||typeof a.call!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("call")))return"function"}else return"null";else if(c==
"function"&&typeof a.call=="undefined")return"object";return c}function i(a){var c=h(a);return c=="array"||c=="object"&&typeof a.length=="number"}function k(a){return typeof a=="string"}function l(a){a=h(a);return a=="object"||a=="array"||a=="function"}function m(a){var c=h(a);if(c=="object"||c=="array"){if(a.e)return a.e.call(a);c=c=="array"?[]:{};for(var b in a)c[b]=m(a[b]);return c}return a};var n=Array.prototype,o=n.forEach?function(a,c,b){n.forEach.call(a,c,b)}:function(a,c,b){for(var d=a.length,e=k(a)?a.split(""):a,f=0;f<d;f++)f in e&&c.call(b,e[f],f,a)};function p(){return n.concat.apply(n,arguments)}function q(a){if(h(a)=="array")return p(a);else{for(var c=[],b=0,d=a.length;b<d;b++)c[b]=a[b];return c}};function r(a,c,b){for(var d in a)c.call(b,a[d],d,a)};var s=/^[a-zA-Z0-9\-_.!~*'()]*$/;function t(a){a=String(a);if(!s.test(a))return encodeURIComponent(a);return a}function u(a,c){if(c)return a.replace(v,"&amp;").replace(y,"&lt;").replace(z,"&gt;").replace(A,"&quot;");else{if(!B.test(a))return a;if(a.indexOf("&")!=-1)a=a.replace(v,"&amp;");if(a.indexOf("<")!=-1)a=a.replace(y,"&lt;");if(a.indexOf(">")!=-1)a=a.replace(z,"&gt;");if(a.indexOf('"')!=-1)a=a.replace(A,"&quot;");return a}}var v=/&/g,y=/</g,z=/>/g,A=/\"/g,B=/[&<>\"]/;
function C(){return Array.prototype.join.call(arguments,"")}(Date.now||function(){return+new Date})();var D,E,F,G;function H(){return g.navigator?g.navigator.userAgent:null}G=F=E=D=false;var I;if(I=H()){var J=g.navigator;D=I.indexOf("Opera")==0;E=!D&&I.indexOf("MSIE")!=-1;F=!D&&I.indexOf("WebKit")!=-1;G=!D&&!F&&J.product=="Gecko"}var K=E,L=G,M=F,N="",O;if(D&&g.opera){var P=g.opera.version;N=typeof P=="function"?P():P}else{if(L)O=/rv\:([^\);]+)(\)|;)/;else if(K)O=/MSIE\s+([^\);]+)(\)|;)/;else if(M)O=/WebKit\/(\S+)/;if(O){var Q=O.exec(H());N=Q?Q[1]:""}};function R(a,c){r(c,function(b,d){if(d=="style")a.style.cssText=b;else if(d=="class")a.className=b;else if(d=="for")a.htmlFor=b;else if(d in S)a.setAttribute(S[d],b);else a[d]=b})}var S={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",rowspan:"rowSpan",valign:"vAlign",height:"height",width:"width",usemap:"useMap",frameborder:"frameBorder",type:"type"};function T(){return U(document,arguments)}
function U(a,c){var b=c[0],d=c[1];if(K&&d&&(d.name||d.type)){b=["<",b];d.name&&b.push(' name="',u(d.name),'"');if(d.type){b.push(' type="',u(d.type),'"');d=m(d);delete d.type}b.push(">");b=b.join("")}var e=a.createElement(b);if(d)if(k(d))e.className=d;else R(e,d);if(c.length>2){d=function(j){if(j)e.appendChild(k(j)?a.createTextNode(j):j)};for(b=2;b<c.length;b++){var f=c[b];i(f)&&!(l(f)&&f.nodeType>0)?o(V(f)?q(f):f,d):d(f)}}return e}
function W(a,c){var b=a.createElement("div");b.innerHTML=c;if(b.childNodes.length==1)return b.removeChild(b.firstChild);else{for(a=a.createDocumentFragment();b.firstChild;)a.appendChild(b.firstChild);return a}}function X(a,c){a.appendChild(c)}function V(a){if(a&&typeof a.length=="number")if(l(a))return typeof a.item=="function"||typeof a.item=="string";else if(h(a)=="function")return typeof a.item=="function";return false};function Y(a){a=a||{};this.g=a.key;this.b=a.template||"";this.d=a.formatter||{};this.c=a.callbackName||Z}function $(a){a=a.replace("<","&lt;").replace(">","&gt;");return a=a.replace('"',"&quot;").replace("'","&#39;")}var Z="";Y.prototype.a=[];Y.prototype.j=function(a){this.b=a};Y.prototype.i=function(a){this.d=a};
Y.prototype.h=function(a,c,b){if(!this.b)throw"FeedRenderer : The template string must be set.";if(!this.c)throw"FeedRenderer : The callback name must be set.";b=b||{};a=["http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json&callback=",t(this.c),"&q=",t(a),"&context=",this.a.length];var d=b.num;b=b.scoring;var e=this.g;if(d)a=p(a,["&num=",t(d)]);if(e)a=p(a,["&key=",t(e)]);if(b)a=p(a,["&scoring=",t(b)]);this.a.push({element:c,k:this.b,f:this.d});c=T("script",{type:"text/javascript",
src:C.apply(null,a)});document.body.appendChild(c)};window.FeedRenderer=Y;Y.processResponse=function(a,c,b,d){if(!c||b<200||300<=b)throw"FeedRenderer : "+d;if(a=Y.prototype.a[a-0]){var e=[],f=a.k||"",j=a.f||{};a=a.element||"";o(c.feed.entries,function(w,aa){e[aa]=f.replace(/%([^%]*)%/g,function(ba,x){return x in w?(j[x]||$)(w[x],w):""})});if(h(a)=="function")a(e,c);else{e=e.join("");l(a)&&a.nodeType>0||(a=k(a)?document.getElementById(a):a);a&&X(a,W(document,e))}}};Y.prototype.setTemplate=Y.prototype.j;Y.prototype.setFormatter=Y.prototype.i;
Y.prototype.render=Y.prototype.h;Z="FeedRenderer.processResponse";
})();