// 基本情報の表示

gapi.hangout.addApiReadyListener(function() {
  $('#hangout-id').text(gapi.hangout.getHangoutId());
  $('#locale').text(gapi.hangout.getLocale());
  $('#participant-id').text(gapi.hangout.getParticipantId());
  $('#hide-app').click(function() { gapi.hangout.hideApp(); });
});

// 参加者情報の表示
function updateParticipants(participants) {
  var parentEl = $('#participants').empty();
  $.each(participants, function() {
    var name = this.hangoutId;
    if(this.displayName)
      name = this.displayName + ' (' + this.id + ')';
    $('<li/>').text(name).appendTo(parentEl);
  });
}
gapi.hangout.addApiReadyListener(function() {
  updateParticipants(gapi.hangout.getParticipants());
  gapi.hangout.addParticipantsListener(updateParticipants);
});

// アプリケーションをインストールしている参加者の表示
function updateAppParticipants(participants) {
  var parentEl = $('#app-participants').empty();
  $.each(participants, function() {
    if(this.hasAppInstalled) {
      $('<li/>').text(this.displayName || this.hangoutId).appendTo(parentEl);
    }
  });
}
gapi.hangout.addApiReadyListener(function() {
  updateAppParticipants(gapi.hangout.getAppParticipants());
  gapi.hangout.addAppParticipantsListener(updateAppParticipants);
});

// 通知
gapi.hangout.addApiReadyListener(function() {
  $('#notice').click(function() {
    if(gapi.hangout.hasNotice()) {
      gapi.hangout.dismissNotice();
    } else {
      gapi.hangout.displayNotice('hogehoge', true);
    }
  });
});

// アクティブスピーカーの制御

// 現在のアクティブスピーカーを表示
function showActiveSpeaker(hangoutId) {
  var p = gapi.hangout.getParticipantById(hangoutId);
  if(p) {
    $('#current-speaker').text(p.displayName || p.hangoutId);
  }
}
gapi.hangout.addApiReadyListener(function() {
  showActiveSpeaker(gapi.hangout.getActiveSpeaker());
  gapi.hangout.addActiveSpeakerListener(showActiveSpeaker);
});

// アクティブスピーカーを選択するためのラジオボタンを表示
function updateActiveSpeakerSelector(participants) {
  var parentEl = $('#active-speaker').empty();
  $('<input type="radio" name="activespeaker" value="">自動<br />').appendTo(parentEl);
  $.each(participants, function() {
    parentEl.append(
      $('<input type="radio" name="activespeaker" />').attr({
        value:this.hangoutId
      }),
      $('<span />').text(this.displayName || this.hangoutId),
      $('<br />'));
  });
}
gapi.hangout.addApiReadyListener(function() {
  updateActiveSpeakerSelector(gapi.hangout.getParticipants());
  gapi.hangout.addParticipantsListener(updateActiveSpeakerSelector);
});

// ラジオボタンがクリックされた際にアクティブスピーカーを切り替える
gapi.hangout.addApiReadyListener(function() {
  $('#active-speaker').change(function(e) {
    var hangoutId = $(e.target).val();
    if(hangoutId) {
      gapi.hangout.setActiveSpeaker(hangoutId);
    } else {
      gapi.hangout.clearActiveSpeaker();
    }
  });
});

// AV機器の状態取得
function updateAVStatus() {
  $('#camera-status').text(gapi.hangout.av.hasCamera() ? 'あり' : 'なし');
  $('#microphone-status').text(gapi.hangout.av.hasMicrophone() ? 'あり' : 'なし');
  $('#speakers-status').text(gapi.hangout.av.hasSpeakers() ? 'あり' : 'なし');
};
gapi.hangout.addApiReadyListener(function() {
  updateAVStatus();
  gapi.hangout.av.addHasCameraListener(updateAVStatus);
  gapi.hangout.av.addHasMicrophoneListener(updateAVStatus);
  gapi.hangout.av.addHasSpeakersListener(updateAVStatus);
});

// エマージェンシーボタン
var muted = false;
gapi.hangout.addApiReadyListener(function() {
  $('#emergency').click(function(e) {
    muted = !muted;
    gapi.hangout.av.setMicrophoneMute(muted);
    gapi.hangout.av.setCameraMute(muted);
  });
});

// 各参加者のボリュームを表示
var volumeElementMap = {};
function updateVolume(volumeInfo) {
  for(id in (volumeInfo || [])) {
    var span = volumeElementMap[id];
    if(span)
      span.text(volumeInfo[id]);
  }
}
function updateVolumeParticipants(participants) {
  volumeElementMap = {};
  var parentEl = $('#volume').empty();
  $.each(participants, function() {
    var span = $('<span />');
    var name = (this.displayName || this.hangoutId) + ' : ';
    $('<li/>').text(name).append(span).appendTo(parentEl);
    volumeElementMap[this.hangoutId] = span;
  });
}
gapi.hangout.addApiReadyListener(function() {
  updateVolumeParticipants(gapi.hangout.getParticipants());
  updateVolume(gapi.hangout.av.getVolumes());
  gapi.hangout.addParticipantsListener(updateVolumeParticipants);
  gapi.hangout.av.addVolumesChangedListener(updateVolume);
});

// へぇーボタン
var countElementMap = {};
function updateCount(adds, removes, state, metadata) {
  for(key in (state || {})) {
    if(countElementMap[key]) {
      countElementMap[key].text(state[key]);
    }
  }
};
function updateCountParticipants(participants) {
  var parentEl = $('#count');
  $.each(participants, function() {
    if(this.hasAppInstalled && !countElementMap[this.hangoutId]) {
      var span = $('<span />').text('0');
      var name = (this.displayName || this.hangoutId) + ' : ';
      $('<li/>').text(name).append(span).appendTo(parentEl);
      countElementMap[this.hangoutId] = span;
    }
  });
};
gapi.hangout.addApiReadyListener(function() {
  updateCountParticipants(gapi.hangout.getAppParticipants());
  gapi.hangout.addAppParticipantsListener(updateCountParticipants);
  gapi.hangout.data.addStateChangeListener(updateCount);
  $('#countup').click(function() {
    var id     = gapi.hangout.getParticipantId();
    var state  = gapi.hangout.data.getState() || {};
    var update = {}
    update[id] = ''+(((state[id] || 0) | 0) + 1);
    gapi.hangout.data.submitDelta(update);
  });
});
