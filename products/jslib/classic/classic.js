var Classic = {};

Classic.SpecialMemberType = function() {};
Classic.Property = function(definition) {
  if(this instanceof Classic.Property)
	this.definition = definition;
  else
	return new Classic.Property(definition);
};
Classic.Property.prototype = new Classic.SpecialMemberType;
Classic.Property.prototype['applyTo'] = function(klass, name) {
  var def = this.definition, proto = klass.prototype;
  delete proto[name];
  if(def.get)
	proto.__defineGetter__(name, def.get);
  if(def.set)
	proto.__defineSetter__(name, def.set);
};

Classic.Utils = {
  mergeObject : function(dst, src) {
	for(var i in src) {
	  dst[i] = src[i];
	}
  },
  defineMember : function(klass, name, value) {
	if(value instanceof Classic.SpecialMemberType) {
	  value.applyTo(klass, name);
	} else {
	  klass.prototype[name] = value;
	}
  },
  defineAccessors : function(klass, name) {
	delete klass[name];
	klass.__defineGetter__(name, function()  { return this.prototype[name] });
	klass.__defineSetter__(name, function(v) { this.prototype[name] = v; });
  },
  include : function(klass, module) {
	var defineMember     = this.defineMember,
	    defineAccessors  = this.defineAccessors,
	    members          = module.members      || {},
	    classMembers     = module.classMembers || {},
	    classMemberNames = (klass.classic_classMemberNames = klass.classic_classMemberNames || {}),
	    i;

	for(i in members) {
	  defineMember(klass, i, members[i]);
	}

	for(i in classMembers) {
	  classMemberNames[i] = true;
	  defineMember(klass, i, classMembers[i]);
	}

	for(i in classMemberNames) {
	  defineAccessors(klass, i);
	}
  }
};

Classic.Class = function(name, parent, generator) {
  if(!generator) {
	generator = parent;
	parent    = Classic.RootClass;
  }

  function DummyClass() {}

  function CLASS() {
	if(this instanceof CLASS) {
	  var ctor = CLASS.prototype.initialize;
	  if(ctor)
		ctor.apply(this, arguments);
	} else {
	  throw "Use new to create a new instance.";
	}
  }

  CLASS.name                     = name;
  CLASS.classic_classMemberNames = {};

  if(parent) {
	DummyClass.prototype        = parent.prototype;
	CLASS.parentClass           = parent;
	CLASS.prototype             = new DummyClass;
	CLASS.prototype.constructor = parent;
	CLASS.prototype.klass       = CLASS;
	Classic.Utils.mergeObject(CLASS.classic_classMemberNames,
							  parent.classic_classMemberNames || {});
	if(typeof parent.inherited == 'function')
	  parent.inherited(CLASS);
  }

  CLASS.prototype.klass = CLASS;
  Classic.Utils.include(CLASS, generator(CLASS, parent) || {});

  return CLASS;
}

Classic.RootModule ={
  members : {
	initialize : function() {
	  var parent = this.parentClass;
	  if(typeof parent == 'function' && parent.prototype &&
		 typeof parent.prototype.initialize == 'function')
	  {
		parent.prototype.initialize.apply(arguments);
	  }
	}
  },

  classMembers : {
	includeModule : function(module) {
	  Classic.Utils.include(this.klass, module, false);
	},

	defineClassMember : function(name, value) {
	  this.classic_classMemberNames[name] = true;
	  Classic.Utils.defineMember(this.klass, name, value);
	  Classic.Utils.defineAccessors(this.klass, name);
	},

	callMethod : function(self, method) {
	  var args = Array.prototype.slice.call(arguments, 2);
	  return this[method].apply(self, args);
	},

	applyMethod : function(self, method, args) {
	  return this[method].apply(self, args);
	}
  }
};

Classic.RootClass = Classic.Class('RootClass', null, function(klass, parent) {
  return Classic.RootModule;
});
