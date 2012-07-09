// 基本情報の表示

gapi.hangout.onApiReady.add(function(e) {
  $('#hangout-url').text(gapi.hangout.getHangoutUrl());
  $('#hangout-id').text(gapi.hangout.getHangoutId());
  $('#locale').text(gapi.hangout.getLocale());
  $('#startdata').text(gapi.hangout.getStartData());
  $('#participant-id').text(gapi.hangout.getParticipantId());
  $('#hide-app').click(function() { gapi.hangout.hideApp(); });
});

// 参加者情報の表示
function updateParticipants(participants) {
  var parentEl = $('#participants').empty();
  $.each(participants, function() {
    var name = this.id;
    if(this.person && this.person.displayName)
      name = this.person.displayName + ' (' + this.person.id + ')';
    $('<li/>').text(name).appendTo(parentEl);
  });
}
gapi.hangout.onApiReady.add(function(e) {
  updateParticipants(gapi.hangout.getParticipants());
  gapi.hangout.onParticipantsChanged.add(function(e) {
    updateParticipants(e.participants);
  });
});

// アプリケーションをインストールしている参加者の表示
function updateAppParticipants(participants) {
  var parentEl = $('#app-participants').empty();
  $.each(participants, function() {
    if(this.hasAppEnabled) {
      var name = (this.person && this.person.displayName) || this.id;
      $('<li/>').text(name).appendTo(parentEl);
    }
  });
}
gapi.hangout.onApiReady.add(function(e) {
  updateAppParticipants(gapi.hangout.getEnabledParticipants());
  gapi.hangout.onEnabledParticipantsChanged.add(function(e) {
    updateAppParticipants(e.enabledParticipants);
  });
});

// AV機器の状態取得
function updateAVStatus() {
  $('#camera-status').text(gapi.hangout.av.hasCamera() ? 'あり' : 'なし');
  $('#microphone-status').text(gapi.hangout.av.hasMicrophone() ? 'あり' : 'なし');
  $('#speakers-status').text(gapi.hangout.av.hasSpeakers() ? 'あり' : 'なし');
};
gapi.hangout.onApiReady.add(function(e) {
  updateAVStatus();
  gapi.hangout.av.onHasCamera.add(updateAVStatus);
  gapi.hangout.av.onHasMicrophone.add(updateAVStatus);
  gapi.hangout.av.onHasSpeakers.add(updateAVStatus);
});

// エマージェンシーボタン
var muted = false;
gapi.hangout.onApiReady.add(function(e) {
  $('#emergency').click(function(e) {
    muted = !muted;
    gapi.hangout.av.setMicrophoneMute(muted);
    gapi.hangout.av.setCameraMute(muted);
  });
});

// 各参加者のボリュームを表示
var volumeElementMap = {};
function updateVolume(volumeInfo) {
  for(id in (volumeInfo || {})) {
    var span = volumeElementMap[id];
    if(span) {
      span.text(volumeInfo[id]);
    }
  }
}

function updateVolumeParticipants(participants) {
  volumeElementMap = {};
  var parentEl = $('#volume').empty();
  $.each(participants, function() {
    var span = $('<span />');
    var name = ((this.person && this.person.displayName) || this.id) + ' : ';
    $('<li/>').text(name).append(span).appendTo(parentEl);
    volumeElementMap[this.id] = span;
  });
}

gapi.hangout.onApiReady.add(function(e) {
  updateVolumeParticipants(gapi.hangout.getParticipants());
  updateVolume(gapi.hangout.av.getVolumes());
  gapi.hangout.onParticipantsChanged.add(function(e) {
    updateVolumeParticipants(e.participants);
  });
  gapi.hangout.av.onVolumesChanged.add(function(e) {
    updateVolume(e.volumes)
  });
});

// フェイストラッキング
gapi.hangout.onApiReady.add(function(e) {
  $('#overlay-btn').click(function(e) {
    var url = $('#overlay-url').val();
    var rsc = gapi.hangout.av.effects.createImageResource(url);
    rsc.showFaceTrackingOverlay({
      trackingFeature: gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
      rotateWithFace:  true,
      scaleWithFace:   true
    });
  });
});

// へぇーボタン
var countElementMap = {};
function updateCount(e) {
  for(key in (e.state || {})) {
    if(countElementMap[key]) {
      countElementMap[key].text(e.state[key] || '0');
    }
  }
};

function updateCountParticipants(participants) {
  countElementMap = {};
  var parentEl = $('#count').empty();
  var state    = gapi.hangout.data.getState() || {};
  $.each(participants, function() {
    var span = $('<span />').text(state[this.id] || '0');
    var name = ((this.person && this.person.displayName) || this.id) + ' : ';
    $('<li/>').text(name).append(span).appendTo(parentEl);
    countElementMap[this.id] = span;
  });
};

gapi.hangout.onApiReady.add(function(e) {
  updateCountParticipants(gapi.hangout.getEnabledParticipants());
  gapi.hangout.onEnabledParticipantsChanged.add(function(e) {
    updateCountParticipants(e.enabledParticipants);
  });
  gapi.hangout.data.onStateChanged.add(updateCount);
  $('#countup').click(function() {
    var id    = gapi.hangout.getParticipantId();
    var value = gapi.hangout.data.getValue(id) || 0;
    gapi.hangout.data.setValue(id, '' + ((value | 0) + 1));
  });
});

// ビデオフィードの表示
gapi.hangout.onApiReady.add(function(e) {
  $('#show-feed').click(function(e) {
    var vc   = gapi.hangout.layout.getVideoCanvas();
    var feed = gapi.hangout.layout.createParticipantVideoFeed(
      gapi.hangout.getParticipantId());
    vc.setVideoFeed(feed);
    vc.setPosition(0, 0);
    vc.setWidth(200);
    vc.setHeight(150);
    vc.setVisible(true);
  });
});

// 通知
gapi.hangout.onApiReady.add(function(e) {
  $('#notice').click(function() {
    if(gapi.hangout.layout.hasNotice()) {
      gapi.hangout.layout.dismissNotice();
    } else {
      gapi.hangout.layout.displayNotice('このように通知が表示できます', true);
    }
  });
});
