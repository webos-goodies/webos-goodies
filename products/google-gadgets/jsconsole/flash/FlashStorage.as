package
{

  import flash.display.*;
  //import flash.text.TextField;
  import flash.net.*;
  import flash.events.NetStatusEvent;
  import flash.external.ExternalInterface;

  public class FlashStorage extends Sprite
  {
	private var prefix:String;
	private var storage:SharedObject;
	//private var myText1:TextField;

	public function FlashStorage()
	{
	  try {
		var flashVars:* = this.root.loaderInfo.parameters;
		prefix = flashVars.prefix;
/*
		myText1 = new TextField();
		myText1.text = prefix;
		myText1.name = "myText1";
		this.addChild(myText1);
*/
		if(!prefix)
		  prefix = 'flashStorage';
		ExternalInterface.addCallback('open',    jsOpen);
		ExternalInterface.addCallback('close',   jsClose);
		ExternalInterface.addCallback('flush',   jsFlush);
		ExternalInterface.addCallback('clear',   jsClear);
		ExternalInterface.addCallback('setData', jsSetData);
		ExternalInterface.addCallback('getData', jsGetData);
		ExternalInterface.addCallback('isOk',    jsIsOk);
		ExternalInterface.call(prefix + 'Ready');
	  } catch(err:Error) {
		//myText1.text = err.message;
	  }
	}

/*
	public function jsSetText(message:String) : void
	{
	  myText1.text = message;
	}
*/

	public function jsOpen(name:String) : void
	{
	  jsClose();
	  storage = SharedObject.getLocal(name);
	}

	public function jsClose() : void
	{
	  storage = null;
	}

	public function jsFlush() : String
	{
	  var result:String = storage.flush();
	  if(result && result == SharedObjectFlushStatus.PENDING)
	  {
		storage.addEventListener(NetStatusEvent.NET_STATUS, onClosePermissionDialog);
	  }
	  return result;
	}

	public function jsClear() : void
	{
	  storage.clear();
	  storage = null;
	}

	public function jsSetData(name:String, value:*) : void
	{
	  storage.data[name] = value.replace(/\\/, '\\\\');
	}

	public function jsGetData(name:String) : *
	{
	  return storage.data[name];
	}

	public function jsIsOk() : Boolean
	{
	  return storage ? true : false;
	}

	public function onClosePermissionDialog(event:NetStatusEvent) : void
	{
	  ExternalInterface.call(prefix + 'DialogClosed', event.info.code);
	  storage.removeEventListener(NetStatusEvent.NET_STATUS, onClosePermissionDialog);
	}
  }

}
