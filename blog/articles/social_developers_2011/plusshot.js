var g_gplusApiKey  = 'AIzaSyA66MPZoCni63p1HVlOmfptNKlaQZAyOVQ';
var g_imageUrl     = '////dl.dropbox.com/u/327/images/';
var g_canvas       = null;
var g_ctx          = null;
var g_screenWidth  = 384;
var g_screenHeight = 256;
var g_screenDiv    = null;
var g_gadgetHeight = null;
var g_keyStats     = [];
var g_shot         = false;
var g_shotIndex    = 0;
var g_players      = {};
var g_bullets      = {};
var g_existingBullets = {};
var g_dataUpdates  = {};
var g_dataRemoves  = [];
var g_submitTime   = 0;

var KeyCodes = {
  LEFT:  37,
  UP:    38,
  RIGHT: 39,
  DOWN:  40,
  SPACE: 32
}

var PlayerMode = {
  UNINITIALIZED: -1,
  ACTIVE:         1,
  DEAD:           2
};

var PlayerColors = [
  "rgb(  0, 255, 255)", // 0
  "rgb(255,   0, 255)", // 1
  "rgb(255, 255,   0)", // 2
  "rgb(255, 128,   0)", // 3
  "rgb(  0, 255, 128)", // 4
  "rgb(128,   0, 255)", // 5
  "rgb(255,   0, 128)", // 6
  "rgb(128, 255,   0)", // 7
  "rgb(  0, 128, 255)", // 8
  "rgb(255,  64,  64)", // 9
  "rgb( 64, 255,  64)", // 10
  "rgb( 64,  64, 255)", // 11
  "rgb(255, 255, 255)"];// 12（自機）


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

// キーイベントの処理
$(document).keydown(function(e) {
  g_keyStats[e.keyCode+0] = true;
}).keyup(function(e) {
  g_keyStats[e.keyCode+0] = false;
});

// 参加者を更新
function updateParticipants(participants) {
  var myId       = gapi.hangout.getParticipantId();
  var newPlayers = {};
  $.each(participants, function() {
    if(this.hasAppEnabled) {
      var id     = this.id;
      var player = g_players[id] || {};
      player.id    = id;
      player.mine  = player.id == myId;
      player.mode  = player.mode || PlayerMode.UNINITIALIZED
      player.index = player.mine ? 12 : this.displayIndex;
      if(player.mine && player.mode == PlayerMode.UNINITIALIZED) {
        player.x    = Math.random() * (g_screenWidth  - 20) + 10;
        player.y    = Math.random() * (g_screenHeight - 20) + 10;
        player.dx   = 0;
        player.dy   = 0;
        player.rot  = 0;
      }
      newPlayers[id] = player;

      gapi.hangout.av.setAvatar(
        this.id, g_imageUrl + 'player' + player.index + '.png');
    }
  });
  g_players = newPlayers;
};

// 座標変換
function makeMatrix(angle, scale) {
  scale = scale || 1;
  angle = angle / 128 * Math.PI;
  var s = Math.sin(angle) * scale;
  var c = Math.cos(angle) * scale;
  return [c, -s, s, c];
};

function transform(x, y, tx, ty, mat) {
  return [mat[0]*x + mat[1]*y + tx,
          mat[2]*x + mat[3]*y + ty];
}

// 画面の描画
function redrawScreen() {
  // canvasのサイズを調整
  var gadgetHeight = g_screenDiv.innerHeight();
  if(g_gadgetHeight != gadgetHeight) {
    g_gadgetHeight = gadgetHeight;
    g_canvas.style.height = gadgetHeight + 'px';
    g_canvas.style.width  = ((gadgetHeight / g_screenHeight * g_screenWidth) | 0) + 'px';
  }

  // 画面クリア
  g_ctx.fillStyle = "rgb(0, 0, 0)";
  g_ctx.fillRect(0, 0, g_screenWidth+0, g_screenHeight+0);

  // プレイヤーと弾丸を描画
  var player = g_players[gapi.hangout.getParticipantId()];
  if(player && player.mode != PlayerMode.DEAD) {
    updateMe(player);
  }
  for(var id in g_bullets) {
    drawBullet(g_bullets[id], player);
  }
  for(var id in g_players) {
    var player = g_players[id];
    if(player && player.mode != PlayerMode.UNINITIALIZED) {
      drawPlayer(player);
    }
  }

  // 状態を送信
  var currentTime = (new Date).getTime();
  if(currentTime - g_submitTime > 1000/4) {
    gapi.hangout.data.submitDelta(g_dataUpdates, g_dataRemoves);
    g_dataUpdates = {};
    g_dataRemoves = [];
    g_submitTime = currentTime;
  }
}

// 自機の状態を送信
function submitMe(player) {
  g_dataUpdates['p|' + player.id] = gadgets.json.stringify(
    { x:player.x||0, y:player.y||0, rot:player.rot||0, mode:player.mode });
}

// 自機の更新
function updateMe(player) {
  var oldX   = player.x | 0;
  var oldY   = player.y | 0;
  var oldRot = player.rot | 0;

  // キー入力を反映
  var accl = 0;
  if(g_keyStats[KeyCodes.UP])
    accl += 0.2;
  if(g_keyStats[KeyCodes.DOWN])
    accl -= 0.2;
  if(g_keyStats[KeyCodes.LEFT])
    player.rot = (player.rot - 4) & 0xff;
  if(g_keyStats[KeyCodes.RIGHT])
    player.rot = (player.rot + 4) & 0xff;
  var mat = makeMatrix(player.rot);
  player.dx = (player.dx + mat[0] * accl) * 0.95;
  player.dy = (player.dy + mat[2] * accl) * 0.95;

  // 速度制限
  var norm = Math.sqrt(player.dx*player.dx + player.dy*player.dy);
  if(norm > 4) {
    var limit = 4 / norm;
    player.dx *= limit;
    player.dy *= limit;
  }

  // 座標を更新
  player.x += player.dx;
  player.y += player.dy;
  if(player.x < 0 || g_screenWidth <= player.x) {
    player.dx = -player.dx;
    player.x += player.dx * 2;
  }
  if(player.y < 0 || g_screenHeight <= player.y) {
    player.dy = -player.dy;
    player.y += player.dy * 2;
  }
  if((player.x | 0) != oldX || (player.y | 0) != oldY || (player.rot | 0) != oldRot ||
     player.mode == PlayerMode.UNINITIALIZED) {
    if(player.mode == PlayerMode.UNINITIALIZED)
      player.mode = PlayerMode.ACTIVE;
    submitMe(player);
  }

  // 弾発射
  if(g_shot) {
    g_shot = false;
    var bullet = createBullet(
      player.id + ':' + g_shotIndex++, player.x, player.y, player.rot, true);
    if(bullet) {
      g_dataUpdates['b|' + bullet.id] = gadgets.json.stringify(
        { x:bullet.x||0, y:bullet.y||0, rot:player.rot||0 });
    }
  }
};

// プレイヤーを描画
var tankPath = [12, 0, 3, 12, -12, 12, -12, -12, 3, -12];
function drawPlayer(player) {
  // 死亡時のアニメーション
  var rot = player.rot, scale = 1, alpha = 1;
  if(player.mode == PlayerMode.DEAD) {
    player.anim += 1;
    if(player.anim < 20) {
      rot   = player.rot + player.anim * 20;
      alpha = 1 - player.anim / 20;
      scale = 1 + player.anim / 20 * 3;
    } else if(player.anim < 40) {
      alpha = (player.anim - 20) / 20;
    } else {
      player.dx   = 0;
      player.dy   = 0;
      player.mode = PlayerMode.ACTIVE;
      if(player.mine)
        submitMe(player)
    }
  }

  var mat = makeMatrix(rot, scale);
  var x   = player.x
  var y   = player.y;
  var pt  = transform(tankPath[0], tankPath[1], x, y, mat);
  g_ctx.beginPath();
  g_ctx.moveTo(pt[0], pt[1]);
  for(var i = 2, l = tankPath.length * 2 ; i < l ; i += 2) {
    pt = transform(tankPath[i], tankPath[i+1], x, y, mat);
    g_ctx.lineTo(pt[0], pt[1]);
  }
  g_ctx.closePath();
  g_ctx.fillStyle   = PlayerColors[player.index];
  g_ctx.globalAlpha = alpha;
  g_ctx.fill();
  g_ctx.globalAlpha = 1;
};

// 弾丸の作成
function createBullet(bulletId, x, y, rot, mine) {
  var playerId = bulletId.split(':')[0];
  var player   = g_players[playerId];
  if(player) {
    var mat = makeMatrix(rot);
    var bullet = {
      id:    bulletId,
      x:     x,
      y:     y,
      dx:    mat[0] * 8,
      dy:    mat[2] * 8,
      index: player.index,
      mine:  mine
    };
    g_existingBullets[bullet.id] = true;
    return g_bullets[bullet.id] = bullet;
  }
  return null;
}

// 弾丸の描画
function drawBullet(bullet, player) {
  // 弾丸の描画
  bullet.x += bullet.dx;
  bullet.y += bullet.dy;
  if(bullet.x < -10 || g_screenWidth+10  < bullet.x ||
     bullet.y < -10 || g_screenHeight+10 < bullet.y) {
    if(bullet.mine) {
      g_dataRemoves.push('b|' + bullet.id);
    }
    delete g_bullets[bullet.id];
  }
  g_ctx.fillStyle = PlayerColors[bullet.index];
  g_ctx.fillRect(bullet.x - 3, bullet.y - 3, 6, 6);

  // 弾丸と自機の当たり判定
  if(!bullet.mine && player.mode == PlayerMode.ACTIVE) {
    var dx = bullet.x - player.x;
    var dy = bullet.y - player.y;
    if(dx*dx + dy*dy < 20*20) {
      player.mode = PlayerMode.DEAD;
      player.anim = 0;
      submitMe(player);
    }
  }
};

// 敵や弾丸を更新
function updateEnemies(e) {
  var myId  = gapi.hangout.getParticipantId();
  var state = e.state, player, data;
  for(var id in state) {
    var parts = id.split('|');
    if(parts[0] == 'p') {
      data   = gadgets.json.parse(state[id]);
      player = g_players[parts[1]];
      if(player && !player.mine) {
        player.x    = data.x;
        player.y    = data.y;
        player.rot  = data.rot;
        if(player.mode != data.mode)
          player.anim = 0;
        player.mode = data.mode;
      }
    } else if(parts[0] == 'b'){
      if(!g_existingBullets[parts[1]]) {
        data = gadgets.json.parse(state[id]);
        createBullet(parts[1], data.x, data.y, data.rot, false);
      }
    }
  }
}

// ボリュームチェンジイベント
var g_prevVolume = 0;
function volumesChange(e) {
  var volume = e.volumes[gapi.hangout.getParticipantId()];
  if(volume >= 5 && g_prevVolume < 3) {
    g_shot = true;
  }
  g_prevVolume = volume;
};

gapi.hangout.onApiReady.add(function(e) {
  if(e.isApiReady) {
    g_screenDiv    = $('#screendiv');
    g_canvas       = $('#screen').get(0);
    g_ctx          = g_canvas.getContext('2d');
    g_screenWidth  = g_canvas.width  + 0;
    g_screenHeight = g_canvas.height + 0;

    updateParticipants(gapi.hangout.getParticipants());
    gapi.hangout.onParticipantsChanged.add(function(e) {
      updateParticipants(e.participants);
    });
    gapi.hangout.data.onStateChanged.add(updateEnemies);
    gapi.hangout.av.onVolumesChanged.add(volumesChange);
    displayShortenUrl();
    setInterval(redrawScreen, 1000/15);
  }
});
