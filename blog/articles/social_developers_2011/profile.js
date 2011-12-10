var g_gplusApiKey  = 'AIzaSyDlSUZoRH5kERDrBDLDNLCyis4drcam8eQ';
var g_participants = {};

// gadgets.io.makeRequestのjQuery.Deferrdバージョン
function makeRequest(url, arg, params) {
  var df = $.Deferred();
  params = params || {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] =
    gadgets.io.ContentType.JSON;
  gadgets.io.makeRequest(url, function(response) {
    if((response.errors || []).length <= 0 &&
       (200 == response.rc || response.rc == 201)) {
        df.resolve(response, arg);
    } else {
      df.reject(response, arg);
    }
  }, params);
  return df;
}

// hangoutのURLを短縮して表示
function displayShortenUrl() {
  var params = {};
  params[gadgets.io.RequestParameters.METHOD] =
    gadgets.io.MethodType.POST;
  params[gadgets.io.RequestParameters.POST_DATA] =
    gadgets.json.stringify({
      'longUrl':
      'https://hangoutsapi.talkgadget.google.com/hangouts/' +
        gapi.hangout.getHangoutId()
    });
  params[gadgets.io.RequestParameters.HEADERS] = {
    'Content-Type': 'application/json'
  };

  var url =
    'https://www.googleapis.com/urlshortener/v1/url?key=' +
    encodeURIComponent(g_gplusApiKey);
  makeRequest(url, null, params).done(function(response) {
    $('#hangout-url').text(response.data.id);
  });
}

function updateParticipants(participants) {
  // 参加者の情報を得る
  var newParticipants = {};
  var maxIndex        = -1;
  $.each(participants, function() {
    var id   = this.id;
    var data = g_participants[id] || {};
    data.id            = id;
    data.displayIndex  = this.displayIndex,
    data.hasAppEnabled = this.hasAppEnabled,
    data.displayName   = 'Unknown'
    if(this.person) {
      data.gplusId     = this.person.id;
      data.displayName = this.person.displayName;
      if(this.person.image && this.person.image.url) {
        data.imageUrl = this.person.image.url;
      }
    }
    if(data.displayIndex > maxIndex) {
      maxIndex = data.displayIndex;
    }
    newParticipants[id] = data;
  });
  g_participants = newParticipants;

  // テーブルのカラム数の調整
  var tbodyEl = $('#profiles').get(0);
  while(tbodyEl.childNodes.length <= maxIndex) {
    tbodyEl.appendChild(document.createElement('td'));
  }
  while(tbodyEl.childNodes[maxIndex + 1]) {
    tbodyEl.removeChild(tbodyEl.childNodes[maxIndex + 1]);
  }
  $.each(tbodyEl.childNodes, function() {
    this.style.width = (100 / (maxIndex + 1) || 0) + '%';
  });

  // 参加者の情報をリクエスト
  for(var id in g_participants) {
    var participant = g_participants[id];
    if(participant.gplusId && !participant.requested) {
      var url =
        'https://www.googleapis.com/plus/v1/people/' +
        encodeURIComponent(participant.gplusId) +
        '?key=' + encodeURIComponent(g_gplusApiKey);
      makeRequest(url, id).done(receivePerson);
      participant.requested = true;
    }
  }

  // 参加者の情報を表示
  for(var id in g_participants) {
    displayParticipant(id);
  }
};

// Google+ API get people のレスポンスを処理
function receivePerson(response, participantId) {
  var participant = g_participants[participantId];
  var person      = response.data
  if(!participant || !person || person.id != participant.gplusId)
    return;

  participant.displayName = person.displayName;
  participant.aboutMe     = person.aboutMe;
  participant.imageUrl    = (person.image || {}).url;
  participant.profileUrl  = person.url;
  participant.gender      = person.gender;
  participant.sites       = person.urls;

  displayParticipant(participantId);
}

// 参加者の情報を表示
function displayParticipant(participantId) {
  var participant = g_participants[participantId];
  var td          = participant && $('#profiles').children()[participant.displayIndex];
  if(!td) {
    return;
  }
  td = $(td);

  td.empty();
  if(participant.imageUrl) {
    td.append(
      $('<div />').append(
        $('<img />').attr('src', participant.imageUrl)));
  }
  if(participant.profileUrl) {
    td.append($('<div />').append(
      $('<a target="_blank"/>').
      attr('href', participant.profileUrl).
      text(participant.displayName)));
  } else {
    td.append($('<div />').text(participant.displayName));
  }
  if(participant.gender) {
    td.append($('<div class="label" />').text('性別'));
    td.append($('<div />').text(participant.gender));
  }
  if(participant.aboutMe) {
    td.append($('<div class="label" />').text('自己紹介'));
    td.append($(participant.aboutMe));
  }
  if(participant.sites) {
    td.append($('<div class="label" />').text('リンク'));
    $.each(participant.sites, function() {
      td.append($('<div />').append(
        $('<a target="_blank" />').
        attr('href', this.value).text(this.value)));
    });
  }
};

gapi.hangout.onApiReady.add(function(e) {
  if(e.isApiReady) {
    displayShortenUrl();
    updateParticipants(gapi.hangout.getParticipants());
    gapi.hangout.onParticipantsChanged.add(function(e) {
      updateParticipants(e.participants);
    });
  }
});
