goog.provide('crypt.App');
goog.require('goog.crypt');
goog.require('goog.crypt.pbkdf2');
goog.require('goog.crypt.Aes');
goog.require('goog.crypt.Cbc');
goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.events');

/** @constructor */
crypt.App = function() {
  goog.events.listen(goog.dom.getElement('encrypt-form'), 'submit', this.encrypt, false, this);
  goog.events.listen(goog.dom.getElement('decrypt-form'), 'submit', this.decrypt, false, this);
};

crypt.App.randomArray = function(length) {
  var array = [];
  for(var i = 0 ; i < length ; i++) {
    array.push((Math.random() * 256) & 0xff);
  }
  return array;
};

crypt.App.prototype.encrypt = function(e) {
  e.preventDefault();

  // 平文とパスワードを取得
  var plaintext = goog.dom.forms.getValueByName(e.target, 'plaintext');
  var password  = goog.dom.forms.getValueByName(e.target, 'password');

  // 平文とパスワードをバイト配列に変換
  var plaintextBytes = goog.crypt.stringToUtf8ByteArray(plaintext);
  var passwordBytes  = goog.crypt.stringToUtf8ByteArray(password);

  // PBKDF2で暗号鍵を生成
  var salt = crypt.App.randomArray(10);
  var key  = goog.crypt.pbkdf2.deriveKeySha1(passwordBytes, salt, 1000, 128);

  // 平文のバイト数が16の倍数になるように、末尾に0を付加する
  while(plaintextBytes.length % 16 != 0) {
    plaintextBytes.push(0);
  }

  // AESで暗号化
  var iv  = crypt.App.randomArray(16);
  var aes = new goog.crypt.Aes(key);
  var cbc = new goog.crypt.Cbc(aes);
  var encrypted = cbc.encrypt(plaintextBytes, iv);

  // 結果を復号フォームに設定
  var formEl = goog.dom.getElement('decrypt-form');
  formEl.elements['encryptedtext'].value = goog.crypt.byteArrayToHex(encrypted);
  formEl.elements['password'].value      = password
  formEl.elements['salt'].value          = goog.crypt.byteArrayToHex(salt);
  formEl.elements['iv'].value            = goog.crypt.byteArrayToHex(iv);
};

crypt.App.prototype.decrypt = function(e) {
  e.preventDefault();

  var encryptedHex = goog.dom.forms.getValueByName(e.target, 'encryptedtext');
  var password     = goog.dom.forms.getValueByName(e.target, 'password');
  var saltHex      = goog.dom.forms.getValueByName(e.target, 'salt');
  var ivHex        = goog.dom.forms.getValueByName(e.target, 'iv');

  // 暗号文などを16進文字列からバイト配列に変換
  var encrypted = goog.crypt.hexToByteArray(encryptedHex);
  var salt      = goog.crypt.hexToByteArray(saltHex);
  var iv        = goog.crypt.hexToByteArray(ivHex);

  // PBKDF2で暗号鍵を生成
  var passwordBytes = goog.crypt.stringToUtf8ByteArray(password);
  var key = goog.crypt.pbkdf2.deriveKeySha1(passwordBytes, salt, 1000, 128);

  // 復号
  var aes = new goog.crypt.Aes(key);
  var cbc = new goog.crypt.Cbc(aes);
  var plaintext = cbc.decrypt(encrypted, iv);

  // 末尾の0を削除
  var length = plaintext.indexOf(0);
  if(length >= 0) {
    plaintext.length = length;
  }

  // 結果を表示
  goog.dom.setTextContent(
    goog.dom.getElement('decryptedtext'),
    goog.crypt.utf8ByteArrayToString(plaintext));
};

var app = new crypt.App();
