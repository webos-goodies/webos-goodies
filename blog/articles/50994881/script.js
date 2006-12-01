function onkey(event)
{
  if(event.keyCode == 9)
  {
    event.returnValue = false;
    if(event.preventDefault)
      event.preventDefault();
  }
}

window.onload = function() {
  var f = window.event ? function() { onkey(window.event); } : onkey;
  var e = document.getElementsByTagName('TEXTAREA');
  for(var i = 0 ; i < e.length ; ++i)
  {
    e[i].onkeydown = f;
  }
}
