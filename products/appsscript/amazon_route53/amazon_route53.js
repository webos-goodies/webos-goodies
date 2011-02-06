var R53HOST  = 'route53.amazonaws.com';
var R53PATH  = '2010-10-01';
var UNITTEST = false;

function onInstall() {
  exports.buildMenu();
  menuHelp();
}

function onOpen() {
  exports.buildMenu();
}

var exports = (function(){
  //----------------------------------------------------------
  // Route35 Menu

  function buildMenu() {
    SpreadsheetApp.getActiveSpreadsheet().addMenu(
      'Route35', [
        { name: 'Sync this zone...',   functionName: 'menuSyncCurrent' },
        { name: 'Sync all zones...',   functionName: 'menuSyncAll' },
        null,
        { name: 'Submit this zone...', functionName: 'menuSubmitCurrent' },
        { name: 'Submit all zones...', functionName: 'menuSubmitAll' },
        null,
        { name: 'Create new zone...',  functionName: 'menuCreateZone' },
        { name: 'Delete this zone...', functionName: 'menuDeleteZone' },
        { name: 'Zone properties...',  functionName: 'menuZoneProperties' },
        null,
        { name: 'Settings...',         functionName: 'menuSettings' },
        { name: 'Help...',             functionName: 'menuHelp' } ]);
  }

  var msgNoZone  = 'Please select one of "zone:*" sheets.';
  var msgStatus  = 'Click "Check Status" to check the status of this change.';
  var msgSync1   = 'All unsubmit changes will be lost. Continue?';
  var msgSync2   = 'Please click "Continue" to fetch your zone informations.';
  var msgSync3   = ('All existing sheets are preserved. ' +
                    "If you don't need them, you can delete them manually.");
  var msgSubmit1 = 'Please click "Continue" to submit your changes.';
  var msgSubmit2 = 'Submitting finished. ' + msgStatus;
  var msgCreate1 = ('Input the domain name and click "Create". ' +
                    "Please note: You're charged $1.00 per hosted zone/month.");
  var msgCreate2 = 'New hosted zone is created. ' + msgStatus;
  var msgDelete1 = 'Please click "Delete" to delete this zone.';
  var msgDelete2 = ('You can delete a hosted zone only if there is no record ' +
                    'other than the default SOA record and NS records.');
  var msgDelete3 = 'Finished. The current sheet can be deleted manually. ' + msgStatus;
  var msgConfig  = 'Please select Route53>Settings first.';

  function menuSyncCurrent() {
    var btns = [{ label:'Continue', func:'menuSyncHandler', visible:true }];
    menuPrepareCurrent('Sync this zone',  msgSync1, btns);
  }

  function menuSyncAll() {
    menuPrepareAll(function(firstTime) {
      var msg    = firstTime ? msgSync3 : 'Finished.';
      var params = { msg: msg, zones: HostedZone.toJson() };
      requestOpen(
        'Sync all zones', firstTime ? msgSync2 : msgSync1,
        Utilities.jsonStringify(params),
        [{ label:'Continue', func:'menuSyncHandler', visible:true }]);
    });
  }

  function menuSyncHandler(e) {
    var params = Utilities.jsonParse(e.parameter.params);
    var output = [];
    HostedZone.fromJson(params.zones);
    HostedZone.forEach(function(zone) {
      try {
        output.push(zone.getSheetName() + '...');
        zone.initSheet();
        zone.fetch();
        zone.merge();
        output[output.length - 1] += 'done';
      } catch(e) {
        output.push(''+e);
      }
    });
    var app = requestUpdate(params.msg, output.join('\n'), null);
    app.getElementById('continue').setVisible(false);
    return app;
  }

  function menuSubmitCurrent() {
    var btns = [
      { label:'Continue',     func:'menuSubmitHandler', visible:true },
      { label:'Check Status', func:'menuCheckHandler',  visible:false }];
    menuPrepareCurrent('Submit this zone',  msgSubmit1, btns);
  }

  function menuSubmitAll() {
    menuPrepareAll(function(firstTime) {
      var btns = [
        { label:'Continue',     func:'menuSubmitHandler', visible:true },
        { label:'Check Status', func:'menuCheckHandler',  visible:false }];
      requestOpen(
        'Submit all zones', msgSubmit1,
        Utilities.jsonStringify({ zones: HostedZone.toJson() }), btns);
    });
  }

  function menuSubmitHandler(e) {
    var params = Utilities.jsonParse(e.parameter.params);
    var output = [], results = [], changeId;
    HostedZone.fromJson(params.zones);
    HostedZone.forEach(function(zone) {
      try {
        if(zone.getSheet()) {
          output.push(zone.getSheetName() + '...');
          zone.fetch();
          if(changeId = zone.submit())
            results.push({ zone:zone.getSheetName(), changeId:changeId });
          output[output.length - 1] += changeId ? 'submitted.' : 'unmodified.';
        }
      } catch(e) {
        output.push(''+e);
      }
    });
    var app = requestUpdate(
      results.length > 0 ? msgSubmit2 : 'No data to submit.', output.join('\n'), results);
    app.getElementById('continue').setVisible(false);
    app.getElementById('checkstatus').setVisible(results.length > 0);
    return app;
  }

  function menuCreateZone() {
    if(menuConfigOk()) {
      var btns = [
        { label:'Create',       func:'menuCreateHandler', visible:true },
        { label:'Check Status', func:'menuCheckHandler',  visible:false }];
      requestOpen('Create new zone', msgCreate1, '', btns, function(app, panel, btnPanel) {
        panel.add(app.createLabel('Domain name:'));
        panel.add(setNameId(app.createTextBox(), 'domain').setWidth('400px'));
        return 30;
      });
    }
  }

  function menuCreateHandler(e) {
    var domain = strStrip(e.parameter.domain).replace(/\.+$/, '');
    if(!domain)
      return requestUpdate('Please input the domain name.', '', null);
    var ref  = 'Add ' + domain + ' : ' + getIsoDateTime();
    var body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<CreateHostedZoneRequest xmlns="https://route53.amazonaws.com/doc/2010-10-01/">',
      '<Name>', xmlEscape(domain + '.'), '</Name>',
      '<CallerReference>' + xmlEscape(ref) + '</CallerReference>',
      '</CreateHostedZoneRequest>'].join('');
    try {
      var data = r53Request('post', 'hostedzone', body);
      var zone = new HostedZone(data.HostedZone[0].Id[0].replace(/^.*\//, ''),
                                data.HostedZone[0].Name[0]);
      var change = data.ChangeInfo[0].Id[0].replace(/^.*\//, '');
      zone.initSheet();
      zone.fetch();
      zone.merge();
      var app = requestUpdate(
        msgCreate2, '', [{ zone: zone.getSheetName(), changeId: change }]);
      app.getElementById('create').setVisible(false);
      app.getElementById('checkstatus').setVisible(true);
      return app;
    } catch(e) {
      return requestUpdate('Failed to create the hosted zone.', ''+e, null);
    }
  }

  function menuDeleteZone() {
    if(menuConfigOk()) {
      HostedZone.fetch();
      var zone = HostedZone.getActive();
      if(!zone) {
        Browser.msgBox(msgNoZone);
        return null;
      }
      zone.fetch();
      var btns = [
        { label:'Delete',       func:'menuDeleteHandler', visible:true },
        { label:'Check Status', func:'menuCheckHandler',  visible:false }];
      requestOpen(
        'Delete this zone', msgDelete1, Utilities.jsonStringify(zone.toJson()), btns,
        function(app, panel, btnPanel) {
          if(!zone.isDeletable()) {
            panel.add(app.createLabel(msgDelete2).
                      setHeight('40px').setStyleAttribute('color', 'red'));
            return 40;
          } else {
            return 0;
          }
        });
    }
  }

  function menuDeleteHandler(e) {
    var params = Utilities.jsonParse(e.parameter.params);
    try {
      var url    = urlJoin('hostedzone', params.id);
      var data   = r53Request('delete', url);
      var change = data.ChangeInfo[0].Id[0].replace(/^.*\//, '');
      var zone   = new HostedZone(params.id, params.name);
      var app    = requestUpdate(
        msgDelete3, '', [{ zone: zone.getSheetName(), changeId: change }]);
      app.getElementById('delete').setVisible(false);
      app.getElementById('checkstatus').setVisible(true);
      return app;
    } catch(e) {
      return requestUpdate('Failed to create the hosted zone.', ''+e, null);
    }
  }

  function menuZoneProperties() {
    if(menuConfigOk()) {
      HostedZone.fetch();
      var zone = HostedZone.getActive();
      if(!zone) {
        Browser.msgBox(msgNoZone);
        return null;
      }
      var prop = zone.fetchProperties();
      var text = [
        '[Domain]\n', prop.HostedZone[0].Name[0], '\n\n',
        '[Hosted zone ID]\n', prop.HostedZone[0].Id[0], '\n\n'];
      if(prop.DelegationSet && prop.DelegationSet[0].NameServers) {
        text.push('[Name servers]\n');
        var nameservers = prop.DelegationSet[0].NameServers[0].NameServer || [];
        for(var i = 0 ; i < nameservers.length ; ++i) {
          text.push('    ', nameservers[i], '\n');
        }
      }
      infoOpen('Zone properties', text.join(''));
    }
  }

  function menuSettings() {
    configOpen();
  }

  function menuHelp() {
    var text = [
      '[Getting Started]',
      '1. Select [Route53]>[Settings] and provide your access keys.',
      '2. Select [Route53]>[Sync all zones] to prepare to edit your',
      '   resource records. Or, you can create a new hosted zone',
      '   with [Route53]>[Create new zone].',
      '3. Edit your resource records.',
      '4. Select [Route53]>[Submit all zones] to apply your changes',
      '   to Route 53 servers.',
      '',
      '[Tips]',
      '- You can view a sample sheet at http://goo.gl/idEAK or',
      '  http://goo.gl/Us8ta',
      '- Sync or submit an indivudual zone with ',
      '  [Route53]>[Sync/Submit this zone].',
      '- You can view the zone id and nameservers with ',
      '  [Route53]>[Zone properties].'].join('\n');
    infoOpen('Help', text);
  }

  function menuConfigOk() {
    if(!Config.isOk()) {
      Browser.msgBox(msgConfig);
      return false;
    }
    return true;
  }

  function menuPrepareCurrent(title, msg, btns) {
    if(menuConfigOk()) {
      HostedZone.fetch();
      var zone = HostedZone.getActive();
      if(!zone) {
        Browser.msgBox(msgNoZone);
      } else {
        var params = {
          msg:   'Finished.',
          zones: [zone.toJson()]
        };
        requestOpen(title, msg, Utilities.jsonStringify(params), btns);
      }
    }
  }

  function menuPrepareAll(fn) {
    if(menuConfigOk()) {
      HostedZone.fetch();
      var firstTime = true;
      HostedZone.forEach(function(zone) { firstTime = firstTime && !zone.getSheet(); });
      fn(firstTime);
    }
  }

  function menuCheckHandler(e) {
    var changes = Utilities.jsonParse(e.parameter.params);
    var output  = [];
    for(var i = 0 ; i < changes.length ; ++i) {
      try {
        output.push(changes[i].zone + '...');
        var path = urlJoin('change', encodeURIComponent(changes[i].changeId));
        var data = r53Request('get', path);
        if(data && data.ChangeInfo && data.ChangeInfo[0].Status) {
          output[output.length - 1] += data.ChangeInfo[0].Status[0] + '.';
        } else {
          output[output.length - 1] += 'Unknown.';
        }
      } catch(e) {
        output.push(''+e);
      }
    }
    var app = requestUpdate(null, output.join('\n'), e.parameter.params);
    return app;
  }

  //----------------------------------------------------------
  // Request dialog.

  function requestOpen(title, msg, params, btns, fn) {
    var app      = UiApp.createApplication().setTitle(title);
    var panel    = app.createVerticalPanel();
    var btnPanel = app.createHorizontalPanel();
    var height   = 300;

    panel.add(app.createLabel(msg).setId('message').setHeight('40px'));
    height += fn ? fn(app, panel, btnPanel) : 0;
    panel.add(app.createLabel('Output:'));
    panel.add(app.createTextArea().setWidth('400px').setHeight('200px').setId('output'));

    var paramsField = app.createTextArea().setId('params').setName('params');
    paramsField.setText(params).setVisible(false);

    btns.push({ label: 'Close', func:'requestClose', visible:true });
    for(var i = 0 ; i < btns.length ; ++i) {
      var btn = app.createButton(btns[i].label);
      var hdl = app.createServerClickHandler(btns[i].func);
      hdl.addCallbackElement(panel);
      hdl.addCallbackElement(paramsField);
      btn.setId(btns[i].label.replace(/\s/g, '').toLowerCase());
      btn.setVisible(btns[i].visible);
      btn.addClickHandler(hdl);
      btnPanel.add(btn);
    }

    app.setStyleAttribute('padding', '4px 8px');
    app.setWidth(420).setHeight(height);
    app.add(panel);
    app.add(btnPanel);
    app.add(paramsField);
    SpreadsheetApp.getActiveSpreadsheet().show(app);
  }

  function requestUpdate(msg, output, params) {
    Logger.log('requestUpdate : ' + [msg, output, params].join(':'));
    var app = UiApp.getActiveApplication();
    if(params !== null && params !== undefined && typeof params != 'string')
      params = Utilities.jsonStringify(params);
    if(msg)
      app.getElementById('message').setText(msg);
    app.getElementById('output').setText(output || '');
    app.getElementById('params').setText(params || '');
    return app;
  }

  function requestClose(e) {
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  }

  //----------------------------------------------------------
  // Config.

  var Config = {
    key:    ScriptProperties.getProperty('key'),
    secret: ScriptProperties.getProperty('secret'),
    save: function() {
      for(var i in this) {
        if(typeof this[i] != 'function') {
          ScriptProperties.setProperty(i, this[i]);
        }
      }
    },
    isOk: function() {
      return this.key && this.secret;
    }
  };

  //----------------------------------------------------------
  // Config dialog.

  function configOpen() {
    var app      = UiApp.createApplication().setTitle('Route53 Settings');
    var panel    = app.createVerticalPanel();
    var btnPanel = app.createHorizontalPanel();

    panel.add(app.createLabel('Access Key (required)'));
    panel.add(configTextBox(app, 'createTextBox', 'key'));
    panel.add(app.createLabel('Secret Access Key (required)'));
    panel.add(configTextBox(app, 'createPasswordTextBox', 'secret'));
    panel.add(app.createLabel('').setId('msg').setStyleAttribute('color', 'red'));

    var okButton  = app.createButton('OK');
    var okHandler = app.createServerClickHandler('configOk');
    okHandler.addCallbackElement(panel);
    okButton.addClickHandler(okHandler);
    btnPanel.add(okButton);

    var cancelButton  = app.createButton('Cancel');
    var cancelHandler = app.createServerClickHandler('configCancel');
    cancelHandler.addCallbackElement(panel);
    cancelButton.addClickHandler(cancelHandler);
    btnPanel.add(cancelButton);

    app.setStyleAttribute('padding', '4px 8px');
    app.setWidth(320).setHeight(130);
    app.add(panel);
    app.add(btnPanel);
    SpreadsheetApp.getActiveSpreadsheet().show(app);
  }

  function configTextBox(app, method, name) {
    var widget = app[method]().setName(name).setId(name);
    widget.setText(Config[name]||'');
    return widget.setWidth('300px');
  }

  function configOk(e) {
    var app = UiApp.getActiveApplication();
    if(e.parameter.key && e.parameter.secret) {
      Config.key    = e.parameter.key;
      Config.secret = e.parameter.secret;
      Config.save();
      app.close();
    } else {
      app.getElementById('msg').setText('Please fill all required fields.');
    }
    return app;
  }

  function configCancel(e) {
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  }

  //----------------------------------------------------------
  // Information dialog.

  function infoOpen(title, text) {
    var app      = UiApp.createApplication().setTitle(title);
    var panel    = app.createVerticalPanel();
    var btnPanel = app.createHorizontalPanel();

    panel.add(app.createTextArea().setText(text).
              setWidth('400px').setHeight('200px'));

    var okButton  = app.createButton('OK');
    var okHandler = app.createServerClickHandler('helpOk');
    okHandler.addCallbackElement(panel);
    okButton.addClickHandler(okHandler);
    btnPanel.add(okButton);

    app.setStyleAttribute('padding', '4px 8px');
    app.setWidth(420).setHeight(240);
    app.add(panel);
    app.add(btnPanel);
    SpreadsheetApp.getActiveSpreadsheet().show(app);
  }

  function helpOk(e) {
    var app = UiApp.getActiveApplication();
    app.close();
    return app;
  }

  //----------------------------------------------------------
  // HostedZone class.

  function HostedZone(id, name) {
    var idMatch   = id && /[^\/]+$/.exec(id);
    this.id_      = idMatch ? strStrip(idMatch[0]) : null;
    this.name_    = strStrip(name);
    this.sheet_   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.getSheetName());
    this.records_ = {};
  }

  HostedZone.zones_         = [];
  HostedZone.commentRegexp_ = /^\s*#/;

  HostedZone.toJson = function() {
    var zones = [];
    HostedZone.forEach(function(zone) {
      zones.push(zone.toJson());
    });
    return zones;
  };

  HostedZone.fromJson = function(json) {
    for(var i = 0 ; i < json.length ; ++i) {
      if(!(json[i].name && json[i].id))
        throw 'Failed to build HostedZone instance.';
      HostedZone.zones_.push(new HostedZone(json[i].id, json[i].name));
    }
  };

  HostedZone.fetch = function(){
    var data  = r53Request('get', 'hostedzone');
    var zones = data.HostedZones[0].HostedZone;
    HostedZone.zones_ = [];
    for(var i = 0 ; i < zones.length ; ++i) {
      HostedZone.zones_.push(
        new HostedZone(zones[i].Id[0], zones[i].Name[0]));
    }
  };

  HostedZone.forEach = function(fn, opt_scope) {
    var zones = HostedZone.zones_;
    for(var i = 0 ; i < zones.length ; ++i) {
      fn.call(opt_scope || null, zones[i], i, zones);
    }
  };

  HostedZone.getActive = function() {
    var sheetName = SpreadsheetApp.getActiveSheet().getName();
    var zones     = HostedZone.zones_;
    for(var i = 0 ; i < zones.length ; ++i) {
      if(zones[i].getSheetName() == sheetName)
        return zones[i];
    }
    return null;
  };

  HostedZone.prototype.getSheetName = function() {
    return 'zone:' + this.name_;
  };

  HostedZone.prototype.getSheet = function() {
    return this.sheet_;
  };

  HostedZone.prototype.initSheet = function() {
    if(this.sheet_)
      return null;
    this.sheet_ = SpreadsheetApp.getActiveSpreadsheet().insertSheet(this.getSheetName());
    if(!this.sheet_)
      throw 'Failed to create a sheet correspoinding to ' + this.name_;
    var numColumns = this.sheet_.getMaxColumns();
    var numRows    = this.sheet_.getMaxRows();
    if(numColumns < 4)
      this.sheet_.insertColumnsAfter(numColumns, 4 - numColumns);
    if(numRows < 1)
      this.sheet_.insertRowsAfter(numRows, 1);
    this.sheet_.setFrozenRows(1);
    var range = this.sheet_.getRange(1, 1, 1, 4);
    range.setValues([['Name', 'Type', 'Value', 'TTL']]);
  };

  HostedZone.prototype.fetch = function() {
    this.records_ = {};
    var path = urlJoin('hostedzone', encodeURIComponent(this.id_), 'rrset');
    var data = r53Request('get', path);
    this.parseRecords_(data);
    while(data.IsTruncated[0] == 'true' && data.NextRecordName && data.NextRecordType) {
      var query =
          '?type=' + encodeURIComponent(data.NextRecordType[0]) +
          '&name=' + encodeURIComponent(data.NextRecordName[0]);
      data = r53Request('get', path + query);
      this.parseRecords_(data);
    }
  };

  HostedZone.prototype.parseRecords_ = function(data) {
    var entries = data.ResourceRecordSets[0].ResourceRecordSet;
    for(var i = 0 ; i < entries.length ; ++i) {
      var record = ResourceRecord.fromJson(this.name_, entries[i]);
      this.records_[record.getKey()] = record;
    }
  };

  HostedZone.prototype.merge = function() {
    this.clearRecordMarker_();
    var deletedRows = [];

    // Update existing values
    var range = this.getRecordRange();
    if(range) {
      var rows = range.getValues(), cellRecord, record;
      for(var i = 0 ; i < rows.length ; ++i) {
        if(!HostedZone.commentRegexp_.test(rows[i][0])) {
          cellRecord = ResourceRecord.fromCells(this.name_, rows[i]);
          if(cellRecord && (record = this.records_[cellRecord.getKey()])) {
            if(!record.valueCompare(cellRecord))
              rows[i][2] = record.toCells()[2];
            rows[i][3] = record.ttl;
            record.marker = true;
          } else {
            deletedRows.push(i + 2);
          }
        }
      }
      range.setValues(rows);
    }

    // Delete unnecessary rows
    for(var i = deletedRows.length - 1 ; i >= 0 ; --i) {
      this.sheet_.deleteRow(deletedRows[i]);
    }

    // Append new records
    var newRows = [];
    for(var i in this.records_) {
      if(!this.records_[i].marker)
        newRows.push(this.records_[i].toCells());
    }
    if(newRows.length > 0) {
      this.sheet_.getRange(this.sheet_.getLastRow() + 1, 1, newRows.length, 4).setValues(newRows);
    }
  };

  HostedZone.prototype.submit = function() {
    var range = this.getRecordRange();
    if(!range)
      return null;
    var rows = range.getValues(), oldRecords = {}, body = [],
        newRecord, record, error = false;
    this.clearRecordMarker_();
    for(var i = 0 ; i < rows.length ; ++i) {
      if(HostedZone.commentRegexp_.test(rows[i][0])) {
        rows[i] = ['#cccccc', '#cccccc', '#cccccc', '#cccccc'];
      } else if(newRecord = ResourceRecord.fromCells(this.name_, rows[i])) {
        if(record = this.records_[newRecord.getKey()]) {
          if(record.compare(newRecord)) {
            record.marker = 'pass';
          } else {
            newRecord.marker                  = 'update';
            this.records_[newRecord.getKey()] = newRecord;
            oldRecords[newRecord.getKey()]    = record;
          }
        } else {
          newRecord.marker = 'create';
          this.records_[newRecord.getKey()] = newRecord;
        }
        rows[i] = ['#ffffff', '#ffffff', '#ffffff', '#ffffff'];
      } else {
        rows[i] = ['#ffcccc', '#ffcccc', '#ffcccc', '#ffcccc'];
        error   = true;
      }
    }
    range.setBackgroundColors(rows);
    if(error)
      throw 'Error: empty cell(s).';
    for(var i in this.records_) {
      var record = this.records_[i];
      if(record.marker == 'create') {
        body.push(record.toXML('CREATE'));
      } else if(record.marker == 'update') {
        body.push(oldRecords[record.getKey()].toXML('DELETE'));
        body.push(record.toXML('CREATE'));
      } else if(record.marker != 'pass') {
        body.push(record.toXML('DELETE'));
      }
    }
    if(body.length > 0) {
      body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<ChangeResourceRecordSetsRequest xmlns="https://route53.amazonaws.com/doc/2010-10-01/">',
        '<ChangeBatch><Changes>', body.join('\n'), '</Changes></ChangeBatch>',
        '</ChangeResourceRecordSetsRequest>'].join('\n');
      var path  = urlJoin('hostedzone', encodeURIComponent(this.id_), 'rrset');
      var data  = r53Request('post', path, body);
      var match = /[^\/]+$/.exec(((data.ChangeInfo||[])[0].Id||[])[0]||'');
      return match ? match[0] : null;
    }
    return null;
  };

  HostedZone.prototype.fetchProperties = function() {
    return r53Request('get', urlJoin('hostedzone', encodeURIComponent(this.id_)));
  };

  HostedZone.prototype.getRecordRange = function() {
    var lastRow = this.sheet_.getLastRow();
    return lastRow > 1 ? this.sheet_.getRange(2, 1, lastRow - 1, 4) : null;
  };

  HostedZone.prototype.clearRecordMarker_ = function() {
    for(var i in this.records_) {
      this.records_[i].marker = null;
    }
  };

  HostedZone.prototype.isDeletable = function() {
    for(var i in this.records_) {
      var record = this.records_[i];
      if(record.name != this.name_)
        return false;
      if(record.type == 'NS') {
        for(var j = 0 ; j < record.values.length ; ++j) {
          if(record.values[j].indexOf('awsdns') < 0)
            return false;
        }
      } else if(record.type != 'SOA') {
        return false;
      }
    }
    return true;
  };

  HostedZone.prototype.toJson = function() {
    return { name:this.name_, id:this.id_ };
  };

  HostedZone.prototype.toString = function() {
    return '[HostedZone ' + this.name_ + ':' + this.id_ + ']';
  };

  //----------------------------------------------------------
  // ResourceRecord class.

  function ResourceRecord(zone, name, type, values, ttl) {
    this.zone   = zone;
    this.name   = strStrip(name).toLowerCase();
    this.type   = strStrip(type).toUpperCase();
    this.values = values;
    this.ttl    = ttl;
    this.marker = null;
  }

  ResourceRecord.HOST_FIELDS ={
    CNAME:[0], NS:[0], PTR:[0], MX:[2], SOA:[0,2], SRV:[6]
  };

  ResourceRecord.fromJson = function(zone, entry) {
    var records = entry.ResourceRecords[0].ResourceRecord;
    var values  = [];
    for(var j = 0 ; j < records.length ; ++j) {
      values[j] = strStrip(records[j].Value[0]);
    }
    return new ResourceRecord(
      zone, entry.Name[0], entry.Type[0], values.sort(), entry.TTL[0]);
  };

  ResourceRecord.fromCells = function(zone, cells) {
    var name = ResourceRecord.normalizeHost(zone, cells[0]);
    var type = strStrip(cells[1]).toUpperCase();
    var ttl  = (strStrip(cells[3] - 0)) || (60 * 60 * 24);
    if(!(name && type && ttl))
      return null;
    var lines      = (cells[2]||'').split(/\r\n?|\n/);
    var hostFields = ResourceRecord.HOST_FIELDS[type]||[];
    var values     = [], line;
    for(var i = 0 ; i < lines.length ; ++i) {
      if(line = strStrip(lines[i])) {
        var fields = line.split(/(\s+)/);
        for(var j = 0 ; j < hostFields.length ; ++j) {
          fields[hostFields[j]] =
            ResourceRecord.normalizeHost(zone, fields[hostFields[j]]||'');
        }
        values.push(fields.join(''));
      }
    }
    return (values.length <= 0 ? null :
            new ResourceRecord(zone, name, type, values.sort(), ttl));
  };

  ResourceRecord.normalizeHost = function(zone, name) {
    name = strStrip(name).toLowerCase();
    if(name == '@')
      return zone;
    else if(name.length > 0 && !/\.$/.test(name))
      return name + '.' + zone;
    else
      return name;
  };

  ResourceRecord.shortenHost = function(zone, name) {
    var index = name.length - (zone.length + 1);
    if(name == zone)
      return '@';
    else if(name.lastIndexOf('.' + zone) == index)
      return name.substr(0, index);
    return name;
  };

  ResourceRecord.prototype.getKey = function() {
    return this.type + ':' + this.name;
  };

  ResourceRecord.prototype.toCells = function() {
    var name       = ResourceRecord.shortenHost(this.zone, this.name),
        hostFields = ResourceRecord.HOST_FIELDS[this.type]||[],
        values     = [];
    for(var i = 0 ; i < this.values.length ; ++i) {
      var fields = this.values[i].split(/(\s+)/);
      for(var j = 0 ; j < hostFields.length ; ++j) {
        fields[hostFields[j]] =
          ResourceRecord.shortenHost(this.zone, fields[hostFields[j]]);
      }
      values[i] = fields.join('');
    }
    return [name, this.type, values.join('\n'), this.ttl];
  };

  ResourceRecord.prototype.toXML = function(action) {
    var values = [];
    for(var i = 0 ; i < this.values.length ; ++i) {
      values[i] =
        '<ResourceRecord><Value>' +
        xmlEscape(this.values[i]) +
        '</Value></ResourceRecord>';
    }
    return [
      '<Change>\n<Action>', xmlEscape(action.toUpperCase()),
      '</Action>\n<ResourceRecordSet>\n',
      '<Name>', xmlEscape(this.name), '</Name>\n',
      '<Type>', xmlEscape(this.type), '</Type>\n',
      '<TTL>',  xmlEscape(this.ttl),  '</TTL>\n',
      '<ResourceRecords>\n', values.join('\n'),
      '\n</ResourceRecords>\n</ResourceRecordSet>\n</Change>'].join('');
  };

  ResourceRecord.prototype.compare = function(record) {
    if(this.name == record.name &&
       this.type == record.type &&
       this.ttl  == record.ttl)
    {
      return this.valueCompare(record);
    }
    return false;
  };

  ResourceRecord.prototype.valueCompare = function(record) {
    var array1 = this.values, array2 = record.values;
    if(array1.length == array2.length) {
      for(var i = 0 ; i < array1.length ; ++i) {
        if(array1[i] != array2[i])
          return false;
      }
      return true;
    }
    return false;
  };

  ResourceRecord.prototype.toString = function() {
    return '[ResourceRecord ' + this.type + ':' + this.name + ']';
  };

  //----------------------------------------------------------
  // Network access.

  function RequestError(body) {
    this.message = body;
    var match = /\<\?xml(.|\s)*/i.exec(body);
    if(match) {
      body = XmlToJson(Xml.parse(match[0]).getElement());
      if(body && body.Error && body.Error[0].Message && body.Error[0].Message[0]) {
        this.message = body.Error[0].Message[0];
      }
    }
  }
  RequestError.prototype = new Error();

  function signedRequest(method, path, body) {
    var method = method.toUpperCase();
    var url    = urlJoin('https://', R53HOST, R53PATH, path);
    var opts = {
      contentType: 'text/xml',
      headers: generateOAuthHeader(),
      method: method
    };
    if(body && (method == 'POST' || method == 'PUT')) {
      opts.payload = body;
    }
    var response = null;
    try {
      response = UrlFetchApp.fetch(url, opts);
    } catch(e) {
      throw new RequestError(e.message);
    }
    var code = response.getResponseCode();
    if(code != 200 && code != 201) {
      throw new RequestError(response.getContentText());
    }
    return XmlToJson(Xml.parse(response.getContentText()).getElement());
  }

  function testRequest(method, path, body) {
    Logger.log('request : ' + [method, path, body].join(' : '));
    method = method.toUpperCase();
    if(body)
      body = XmlToJson(Xml.parse(body).getElement());

    var zone = [{
      Id:   ['/hostedzone/Z21DW1QVGID6NG'],
      Name: ['example.com.'] }];
    var change1 = [{
      Id:     ['/change/C24LD0DUV5VOVE'],
      Status: ['PENDING'],
      SubmittedAt: [getIsoDateTime()] }];
    var change2 = [{
      Id:     ['/change/C1PA6795UKMFR9'],
      Status: ['PENDING'],
      SubmittedAt: [getIsoDateTime()] }];

    if(method == 'POST' && path == 'hostedzone') {
      // Create new hostedzone.
      if(body.Name[0] != zone[0].Name[0])
        throw 'Domain name must be example.com to test.';
      return { HostedZone: zone, ChangeInfo: change1 };
    } else if(method == 'GET' && path == 'change/C24LD0DUV5VOVE') {
      // Check the status of the new hostedzone.
      change1[0].Status[0] = 'INSYNC';
      return { ChangeInfo: change1 };
    } else if(method == 'GET' && path == 'hostedzone/Z21DW1QVGID6NG/rrset') {
      // Sync with the new hostedzone.
      return {
        ResourceRecordSets: [{
          ResourceRecordSet: [
            { Name: ['example.com.'], Type: ['A'], TTL: ['86400'],
              ResourceRecords: [{ ResourceRecord: [{ Value: ['192.168.0.1'] }] }] },
            { Name: ['example.com.'], Type: ['NS'], TTL: ['86400'],
              ResourceRecords: [{ ResourceRecord: [{ Value: ['ns-1473.awsdns-56.org.'] }] }] }] }],
        IsTruncated: ['false'],
        MaxItems: ['100']
      };
    } else if(method == 'GET' && path == 'hostedzone') {
      // Fetch the hostedzone list.
      return {
        HostedZones: [{ HostedZone: zone }],
        IsTruncated: ['false'],
        MaxItems: ['100']
      };
    } else if(method == 'DELETE' && path == 'hostedzone/Z21DW1QVGID6NG') {
      // Delete a hostedzone.
      return { ChangeInfo: change2 };
    } else if(method == 'GET' && path == 'change/C1PA6795UKMFR9') {
      // Check the status of deletion.
      change2[0].Status[0] = 'INSYNC';
      return { ChangeInfo: change2 };
    } else {
      throw 'Illegal request';
    }
  }

  var r53Request = UNITTEST ? testRequest : signedRequest;

  function generateOAuthHeader() {
    var date    = fetchDate();
    var sign    = Utilities.computeHmacSha256Signature(date, Config.secret);
    var b64sign = Utilities.base64Encode(sign);
    var auth = [
      'AWS3-HTTPS ',
      'AWSAccessKeyId=', Config.key, ',',
      'Algorithm=HmacSHA256,',
      'Signature=', b64sign].join('');
    return { 'x-amz-date': date, 'X-Amzn-Authorization': auth };
  }

  function fetchDate() {
    var response = UrlFetchApp.fetch(urlJoin('https://', R53HOST, 'date'));
    var headers  = response.getHeaders();
    return headers['Date'] || headers['date'];
  }

  //----------------------------------------------------------
  // Utilities.

  function urlJoin() {
    var parts = [], begin = 0, match;
    if(arguments.length > 0 && (match = /^(https?|ftp)\:\/+$/.exec(arguments[0]))) {
      parts[0] = match[1] + ':/';
      begin    = 1;
    }
    for(var i = begin ; i < arguments.length ; ++i) {
      parts[i] = arguments[i].replace(/^\/+|\/+$/g, '');
    }
    return parts.join('/');
  }

  function strStrip(str) {
    return ('' + str).replace(/^\s+|\s+$/g, '');
  }

  function xmlEscape(str) {
    str = str.replace('&', '&amp;').replace('"', '&quot;');
    str = str.replace('<', '&lt;').replace('>', '&gt;');
    return str.replace("'", '&#39;');
  }

  function setNameId(widget, name) {
    return widget.setName(name).setId(name);
  }

  function XmlToJson(element) {
    var obj   = { '#text' : (' ' + element.getText()).substr(1) }, hasChild = false;
    var attrs = element.getAttributes();
    for(var i = 0 ; i < attrs.length ; ++i) {
      obj['@' + attrs[i].getName()] = attrs[i].getValue();
      hasChild = true;
    }
    var children = element.getElements();
    for(var i = 0 ; i < children.length ; ++i) {
      var child = children[i];
      var name  = child.getName().getLocalName();
      if(obj[name]) {
        obj[name].push(XmlToJson(child));
      } else {
        obj[name] = [XmlToJson(child)];
      }
      hasChild = true;
    }
    return hasChild ? obj : obj['#text'];
  }

  function getIsoDateTime() {
    return Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  }

  return {
    buildMenu:         buildMenu,
    menuSyncCurrent:   menuSyncCurrent,
    menuSyncAll:       menuSyncAll,
    menuSyncHandler:   menuSyncHandler,
    menuSubmitCurrent: menuSubmitCurrent,
    menuSubmitAll:     menuSubmitAll,
    menuSubmitHandler: menuSubmitHandler,
    menuCreateZone:    menuCreateZone,
    menuCreateHandler: menuCreateHandler,
    menuDeleteZone:    menuDeleteZone,
    menuDeleteHandler: menuDeleteHandler,
    menuZoneProperties:menuZoneProperties,
    menuSettings:      menuSettings,
    menuHelp:          menuHelp,
    menuCheckHandler:  menuCheckHandler,
    requestClose:      requestClose,
    configOk:          configOk,
    configCancel:      configCancel,
    helpOk:            helpOk
  };
})();

function menuSyncCurrent()   { return exports.menuSyncCurrent.apply(this, arguments); }
function menuSyncAll()       { return exports.menuSyncAll.apply(this, arguments); }
function menuSyncHandler()   { return exports.menuSyncHandler.apply(this, arguments); }
function menuSubmitCurrent() { return exports.menuSubmitCurrent.apply(this, arguments); }
function menuSubmitAll()     { return exports.menuSubmitAll.apply(this, arguments); }
function menuSubmitHandler() { return exports.menuSubmitHandler.apply(this, arguments); }
function menuCreateZone()    { return exports.menuCreateZone.apply(this, arguments); }
function menuCreateHandler() { return exports.menuCreateHandler.apply(this, arguments); }
function menuDeleteZone()    { return exports.menuDeleteZone.apply(this, arguments); }
function menuDeleteHandler() { return exports.menuDeleteHandler.apply(this, arguments); }
function menuZoneProperties(){ return exports.menuZoneProperties.apply(this, arguments); }
function menuSettings()      { return exports.menuSettings.apply(this, arguments); }
function menuHelp()          { return exports.menuHelp.apply(this, arguments); }
function menuCheckHandler()  { return exports.menuCheckHandler.apply(this, arguments); }
function requestClose()      { return exports.requestClose.apply(this, arguments); }
function configOk()          { return exports.configOk.apply(this, arguments); }
function configCancel()      { return exports.configCancel.apply(this, arguments); }
function helpOk()            { return exports.helpOk.apply(this, arguments); }
