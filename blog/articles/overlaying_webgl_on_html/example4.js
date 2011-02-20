// グローバル変数
var gl          = null;
var vbuffers    = null;
var ibuffer     = null;
var texture     = null;
var program     = null;
var uniformVars = null;
var count       = 0;

var vbuffer2    = null;
var program2    = null;
var uniformVar2 = null;

$(function() {
  // WebGL コンテキストの取得
  var canvas = $("#screen").get(0);
  $.each(["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], function(i, name) {
    try { gl = canvas.getContext(name); } catch(e) {}
    return !gl
  });
  if(!gl) {
    alert("WebGL がサポートされていません。");
    return;
  }

  // リソースの初期化
  initVertices();
  initIndices();
  initTexture();
  initShaders();
  initFilterResource();

  // 描画処理を毎秒 30 回呼び出す
  setInterval(redrawScene, 1000/30);
});

function initVertices() {
  // 頂点データを生成
  var positions = [], uvs = [];
  for(var i = 0 ; i <= 8 ; ++i) {
    var v = i / 8.0;
    var y = Math.cos(Math.PI * v), r = Math.sin(Math.PI * v);
    for(var j = 0 ; j <= 16 ; ++j) {
      var u = j / 16.0;
      positions = positions.concat(
        Math.cos(2 * Math.PI * u) * r, y, Math.sin(2 * Math.PI * u) * r);
      uvs = uvs.concat(u, v);
    }
  }

  // VBOを作成し、データを転送
  vbuffers = $.map([positions, positions, uvs], function(data, i) {
    var vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return vbuffer;
  });
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initIndices() {
  // インデックスデータを生成
  var indices = [];
  for(var j = 0 ; j < 8 ; ++j) {
    var base = j * 17;
    for(var i = 0 ; i < 16 ; ++i) {
      indices = indices.concat(
        base + i,      base + i + 1, base + i     + 17,
        base + i + 17, base + i + 1, base + i + 1 + 17);
    }
  }

  // IBOを作成し、データを転送
  ibuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // インデックスの数を保存しておく
  numIndices = indices.length;
}

function initTexture() {
  // テクスチャーオブジェクトを作成
  texture = gl.createTexture();

  // 画像の読み込み完了時の処理
  var image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  // 画像の読み込みを開始
  image.src = "earth.jpg";
}

function initShaders() {
  // 頂点シェーダーを作成
  var vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vshader, $('#vshader').text());
  gl.compileShader(vshader);
  if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS))
    alert(gl.getShaderInfoLog(vshader));

  // フラグメントシェーダーを作成
  var fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fshader, $('#fshader').text());
  gl.compileShader(fshader);
  if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS))
    alert(gl.getShaderInfoLog(fshader));

  // プログラムオブジェクトを作成
  program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);

  // シェーダー内の変数を頂点属性に結びつける
  $.each(["position", "normal", "uv"], function(i, name) {
    gl.bindAttribLocation(program, i, name);
  });

  // 頂点シェーダーとフラグメントシェーダーをリンクする
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS))
    alert(gl.getProgramInfoLog(program));

  // シェーダーパラメータのインデックスを取得・保存
  uniformVars = $.map(["mvpMatrix", "normalMatrix", "lightVec"], function(name) {
    return gl.getUniformLocation(program, name);
  });
}

// 最後にアルファ値を反転させるためのVBOとシェーダー
function initFilterResource() {
  // VBOを作成し、データを転送
  var positions = [100, 100, 1, -100, 100, 1, -100, -100, 1, 100, -100, 1];
  vbuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer2);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // 頂点シェーダーを作成
  var vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vshader, $('#vshader2').text());
  gl.compileShader(vshader);
  if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS))
    alert(gl.getShaderInfoLog(vshader));

  // フラグメントシェーダーを作成
  var fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fshader, $('#fshader2').text());
  gl.compileShader(fshader);
  if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS))
    alert(gl.getShaderInfoLog(fshader));

  // プログラムオブジェクトを作成
  program2 = gl.createProgram();
  gl.attachShader(program2, vshader);
  gl.attachShader(program2, fshader);

  // シェーダー内の変数を頂点属性に結びつける
  gl.bindAttribLocation(program2, 0, 'position');

  // 頂点シェーダーとフラグメントシェーダーをリンクする
  gl.linkProgram(program2);
  if(!gl.getProgramParameter(program2, gl.LINK_STATUS))
    alert(gl.getProgramInfoLog(program2));

  // シェーダーパラメータのインデックスを取得・保存
  uniformVar2 = gl.getUniformLocation(program2, 'mvpMatrix');
}

function redrawScene() {
  // フレームカウントをインクリメント
  count += 1;

  // 画面をクリア
  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1000);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // デプステストを有効、裏面をカリング、シェーダーを指定
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.useProgram(program);

  // VBOを頂点属性に割り当てる
  $.each([3, 3, 2], function(i, stride) {
    gl.enableVertexAttribArray(i);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffers[i]);
    gl.vertexAttribPointer(i, stride, gl.FLOAT, false, 0, 0);
  });

  // IBOを指定
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuffer);

  // テクスチャを指定
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // ブレンドモードを指定
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);

  // シェーダーに渡すパラメータを計算し、設定
  var lightVec = [0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.0];
  var alpha    = (count % 270) / 135.0;
  lightVec[3]  = alpha <= 1.0 ? alpha : 2.0 - alpha;

  var modelMatrix = new CanvasMatrix4();
  modelMatrix.rotate(count*0.7, 0, 1, 0);

  var mvpMatrix = new CanvasMatrix4(modelMatrix);
  mvpMatrix.translate(-1, 0, -8);
  mvpMatrix.perspective(30, 500.0 / 500.0, 0.1, 1000);

  var normalMatrix = new CanvasMatrix4(modelMatrix);
  normalMatrix.invert();
  normalMatrix.transpose();

  $.each([mvpMatrix, normalMatrix, lightVec], function(i, value) {
    if(value instanceof CanvasMatrix4)
      gl.uniformMatrix4fv(uniformVars[i], false, value.getAsWebGLFloatArray());
    else
      gl.uniform4fv(uniformVars[i], new Float32Array(value));
  });

  // 奥の地球描画
  gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);

  // シェーダーに渡すパラメータを計算し、設定
  var lightVec = [0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.0];
  var alpha    = (count % 200) / 100.0;
  lightVec[3]  = alpha <= 1.0 ? alpha : 2.0 - alpha;

  var modelMatrix = new CanvasMatrix4();
  modelMatrix.rotate(count, 0, 1, 0);

  var mvpMatrix = new CanvasMatrix4(modelMatrix);
  mvpMatrix.translate(0.3, 0, -5);
  mvpMatrix.perspective(30, 500.0 / 500.0, 0.1, 1000);

  var normalMatrix = new CanvasMatrix4(modelMatrix);
  normalMatrix.invert();
  normalMatrix.transpose();

  $.each([mvpMatrix, normalMatrix, lightVec], function(i, value) {
    if(value instanceof CanvasMatrix4)
      gl.uniformMatrix4fv(uniformVars[i], false, value.getAsWebGLFloatArray());
    else
      gl.uniform4fv(uniformVars[i], new Float32Array(value));
  });

  // 手前の地球描画
  gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);

  // シェーダーに渡すパラメータを計算し、設定
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.useProgram(program2);

  gl.enable(gl.BLEND)
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFuncSeparate(gl.ZERO, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ZERO);

  gl.enableVertexAttribArray(0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer2);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.disableVertexAttribArray(1);
  gl.disableVertexAttribArray(2);
  gl.bindTexture(gl.TEXTURE_2D, null);

  var mvpMatrix = new CanvasMatrix4();
  mvpMatrix.translate(0, 0, -5);
  mvpMatrix.perspective(30, 500.0 / 500.0, 0.1, 1000);

  gl.uniformMatrix4fv(uniformVar2, false, mvpMatrix.getAsWebGLFloatArray());

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  // ページに反映させる
  gl.flush();
}
