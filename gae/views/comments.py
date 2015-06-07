# -*- coding: utf-8 -*-

import logging
import re
import datetime
import dateutil.tz
import jinja2
import settings_private
import baseview
import json
import urllib

from google.appengine.api import mail
from google.appengine.api import urlfetch


LISTFEED_URL    = 'https://spreadsheets.google.com/feeds/list/%s/%s/private/full?alt=json'
SHEET_ID        = ('0Ao0lgngMECUtcE1JQnJuSjRQSEtfVG5iX0lBejNjVFE', 'od6')
HEADERS         = { 'GData-Version': '3.0', 'Content-Type':'application/atom+xml' }
USER_EMAIL      = 'support@webos-goodies.jp'

ARTICLE_URL     = 'http://webos-goodies.jp/archives/%s.html#comments'
LINK_RE         = re.compile(r'^https?://[\x01-\x7f]+$')
SEPARATOR_RE    = re.compile(r'''[\s!-/:-?@\[-`{-~]+''')
SPAM_NAMES      = ('replicas', 'mafformmart', u'シャネル', u'プラダ', u'ネックレス', 'hermes',
                   u'バッグ', u'時計', u'コピー', u'ヴィトン', u'ロレックス', u'オメガ', 'emma',
                   u'ヴィンテージ', u'草間彌生', u'コーチ', u'財布', 'ugg', 'sale', 'xrumertest',
                   'jeanstory', 'baidu', 'gold', '____', 'debrabanks', 'pharm', 'prada', 'mulberry',
                   'louis', 'vuitton', 'handbag', 'luggage', 'purse', 'miu miu', 'MCM', 'bags',
                   'loans', 'coupon', 'nike', 'clothing', 'dresses', 'wedding', 'exotic',
                   'burberry', 'girlfriend', u'バイエルン', 'credit', 'sabo', 'talked', u'ACミラン',
                   u'ユニフォーム', u'アディダス', u'シューズ', 'shoes', 'miumiu', 'discount',
                   'secret', 'expensive', 'market', 'fashion', 'replica', 'watch', 'planta',
                   'promo', 'cheap', 'belt', 'gucci', 'addidas', 'annabell', 'adidas',
                   'outlet', 'swimwear', 'bikini', u'アウトレット', u'ジバンシ', u'メンズ',
                   'louboutin', 'pumps', 'brillen', u'モンブラン', u'画像', 'diamond',
                   'shoulder bag', 'dvds', u'フェラガモ', u'靴', 'dorothy', 'lampinen',
                   'zixiutang', 'diet', u'ルブタン', 'zi xiu tang', 'pollen', u'バーバリ',
                   u'ビキニ', 'dient', '2 day', 'slimming', 'meizitang', u'ブルガリ',
                   u'スニーカ', u'通販', u'ティファニ', 'shoe', u'エルメス', u'ブレスレット',
                   u'指輪', u'ミュウミュウ', 'pills', 'shenna', 'ralph', 'lauren', u'ドレス',
                   u'ショッピング', u'ブランド', u'ジャージ', 'lunettes', 'carrera', 'oakley',
                   'soldes', 'reviews', u'ラルフローレン', u'ジャケット', u'トムフォード',
                   u'楽天', u'ブラジャー', u'ヴィクトリアシークレット', u'サンダル', u'レイバン',
                   u'ナイキ', 'canon', u'サングラス', u'クロックス', 'beams', 'moncler',
                   'crocss', 'powerleveling', u'ラッシュガード', u'ハーレー', u'ゴローズ',
                   'pil', u'ブーツ', u'レディス', u'レディース', u'長袖', u'ビトン', u'販売',
                   'capsule', u'カルティエ', u'折りたたみ', u'パーカー', u'折り畳み',
                   u'自動開閉傘', u'下着', u'グッチ', u'手帳', u'ショルダーバッグ', 'infections',
                   'casio', u'泳装', u'激安', u'ミネトンカ', 'mizuno', u'カシオ', u'シチズン',
                   u'オシアナス', u'朱肉', 'minnetonka', u'カルバンクライン', u'ロキシー',
                   u'セイコー', u'クォーツ', 'chanel', u'ミズノゴルフ', u'パネライ', u'ルミノールマリーナ',
                   u'プレイボーイ', u'ゴルフ', u'サマンサ', u'バック', 'hoodia', '7 day',
                   'gordoni', u'新作', 'chloe', 'air max', u'アイフォン', 'sdao', 'cut down',
                   'bear', 'parajumpers', u'モカシン', 'http://', 'p57', u'パーペチュアル',
                   u'アルマーニ', '.com', u'コンバース', u'オールスター', 'http://', u'リーボック',
                   'daidaihua', u'アイホン', 'benefits', u'キーケース', u'デジタルカメラ',
                   u'モンクレール', u'ジミーチュウ', u'トミーヒルフィガー', 'newera', u'ニューエラ',
                   u'チャンルー', u'ニクソン', u'ストーンブレス', 'weightloss', 'canada goose',
                   'calvin klein', 'wallet', 'michael kors', '&#', 'jordan', 'bottega', 'veneta',
                   u'トリーバーチ', u'ラゲージ', u'キャロウェイ', u'クロムハーツ', 'skuteczne',
                   'odchudzanie', 'vapor', 'veloce', u'セリーヌ', u'万年筆', u'サンローラン',
                   u'芸能人', u'ダッフル', u'ネイビー', 'tennis', 'golf', 'clearance', 'birkin',
                   'jersey', 'costume', 'homme', 'jacket', 'survetement', 'honestly', 'airmax',
                   'femme', 'montant', 'sterling', 'birthstone', 'charm', 'ray ban', 'bracciale',
                   'tiffany', 'prezzo', 'occhiali', 'wayfarer', 'cosmetics', 'pencil', 'gamma 11s',
                   'pants', 'tshirt', 'cycling', 'trousers', 'abercrombie', 'rainproof', 'hogan',
                   'lancome', 'giuseppe', 'longchamp', 'scarpe', 'kurikulum', u'店舗', u'コービー',
                   u'マリークワント', u'ニューバランス', u'¥', 'superior', 'venus', u'ズームコービー',
                   'interview', u'ジョーダン', 'lancel', u'オークリー', u'フロッグスキン', u'限定',
                   u'鯨肉', u'にんにく', u'リモワ', u'インテグラル', u'トパーズ', u'安値', u'ルフトハンザ',
                   u'スーツケース', u'レンタル', u'送料無料', u'最高級', u'百貨店', u'松坂屋',
                   u'メデューサ', u'中古', 'emanuel', 'jaime', 'kylie', 'abigail', u'バスケットボール',
                   u'サッカー', u'エアペニー', u'ヴェイパー', 'murah', 'stylo', u'レプリカ',
                   u'ジェレミースコット', u'エアマックス', u'パトリック', u'浴衣', u'スワロフスキ',
                   u'ヘッドホン', 'hilfiger', u'リュックサック', u'レベッカテイラ', u'クイックサーフ',
                   u'スリッポン', u'スエード', 'www.', u'正規品', 'nikon', u'デジタル一眼', 'visconti',
                   u'ビスコンティ', u'リーバイス', u'景品', u'ダイニング', u'掃除機', u'バッテリ',
                   u'自転車', u'洗濯機', u'ダイニング', 'olivea', 'stephenamex', 'meitzitang'
                   'manuelon', u'ポールスミス', u'パスケース', 'vernonpt', u'ビルケンシュトック',
                   u'ビルキー', u'釣り竿', u'空気清浄機', u'ワンピース', u'釣り', u'ダミアーニ',
                   'subwoofer', 'woolrich', u'取扱店', u'鮎竿', u'購入', 'mercurial', 'barbour',
                   'coach')
TYPICAL_WORDS   = ('', 'this', 'that', 'these', 'those', 'they', 'it', 'its', 'is', 'was',
                   'are', 'were', 'be', 'i', 'my', 'me', 'mine', 'you', 'your', 'yours',
                   'he', 'him', 'his', 'she', 'her', 'hers', 'we', 'our', 'us', 'ours',
                   'see', 'dig', 'updated', 'blog', 'post', 'hudson', 'the', 'a', 'full',
                   'report', 'eat', 'stop', 'lucy', 'glenn', 'glendora', 'layla', 'facebook',
                   'lv', u'ケイト', u'けいと')
SPAM_NAME_RE    = re.compile(ur'(?:^|[-_\s])(?:'
                             ur'seo|weight|価格|pas|john\w\d+|smith\w\d+|shop|mbt|bag|sex|slim'
                             ur'|pants?|suits?|fu|sko|norge|makeup|bobbi\s*brown|akkie|fuck'
                             ur'|pdf|ケース|ポーチ|セール|人気|エリート|最新|shock|cdk|バッシュ'
                             ur'|wild\s*star|ella|new\s*balance|dre|スラッシャー|バカラ|era|vans|水着'
                             ur'|トキナー|イヤホン|ダイワ|seiko|actus|uk|paris|judi|hamilton|rimowa'
                             ur'|vintage|london|samantha|salsa|sheaffer|celine|marc\s*jacobs'
                             ur'|koffer|fifa|tn'
                             ur')(?:[-_\s]|$)',
                             re.I | re.M | re.U)
SPAM_WORDS      = ('[/url]', u'紹介します', u'ナイキ', 'loans', 'coupon', 'extravagant',
                   'enviable', u'アディダス', u'シャネル', u'プラダ', u'ネックレス', u'ヴィトン',
                   u'ロレックス', u'オメガ', u'コーチ', u'ブレスレット', 'crocs', u'ビクトリア',
                   u'下着', u'エルメス', u'バーキン', u'ルブタン', 'christian', u'クロックス',
                   u'グラビア', u'水着', u'アウトレット', u'カシオ', 'puma', u'水着', u'掛け時計',
                   'gucci', u'グッチ', u'ラルフローレン', 'minnetonka', u'レディース', 'lanvin',
                   u'パネライ', 'icamtech', u'セイコー', 'playboy', u'表参道', u'海外ファッション',
                   'hahaha', u'カルバンクライン', u'ブランド時計', u'デジタル一眼', u'フレッドペリー',
                   u'トートバッグ', u'ニューバランス', u'スニーカー', 'newbalance', u'ショルダーバッグ',
                   u'アイホン', u'高級腕時計', 'shoe', 'clearance', 'cheap', 'hermes', u'在庫あり',
                   u'送料無料', u'けいとすぺーど', u'ケイトスペイド', u'海外ブランド', u'ミュウミュウ')
SPAM_WORD_RE    = re.compile('|'.join((ur'(?:^|\s)(?:'
                                       ur'メンズ|通販|バッグ|帽子|価格|mbt|mens?|stores?|sales?'
                                       ur')(?:\s|$)',
                                       ur'https?://www\.[a-z]{4,8}\d{4}\.com',
                                       ur'&#\d{4,8};', ur'^[-\._a-z0-9]+$')),
                             re.I | re.M | re.U)
SPAM_URLS       = ('http://www.paydayloansbargains.co.uk', 'http://shoebuycoupon2013.com',
                   'http://www.canadagooseestore.com/', 'http://goo.gl/', 'http://is.gd/',
                   'http://tinyurl.com/', 'http://www.dokka-fasteners.com',
                   'http://www.cristalcreditgroup.com')
SPAM_URL_WORDS  = ('asian', 'discount', 'twodaydiet4u.com', 'indiadealsonline.com', '/nike',
                   'mitsubishielectric.co.uk', 'hspa.com', 'jimdo.com', 'www.bookyards.com',
                   'freesound.org', 'hm6v.com', 'hspa.com', u'セイコー', '-nike-', 'lidadaidaihua',
                   'fledlights', 'taobao')
SPAM_LINK_RE    = re.compile(r'https?://|\[\/\w+\]', re.I)


def to_unicode(s):
  if s is None or isinstance(s, unicode):
    return s
  elif isinstance(s, bytes):
    return unicode(s, 'utf-8')
  else:
    return unicode(s)


class CommentsView(baseview.BaseView):
  def get(self, page_id):
    self.render_html(TOP_TEMPLATE)

  def post(self, page_id):
    dt = datetime.datetime.now(dateutil.tz.tzoffset('JST', +9*60*60))
    p  = {
      'timestamp': self.force_unicode(dt.strftime('%m/%d/%Y %H:%M:%S')),
      'page':      self.force_unicode(page_id),
      'title':     self.force_unicode(self.request.get('title')),
      'name':      self.force_unicode(self.request.get('name')),
      'url':       self.force_unicode(self.request.get('url'), True),
      'comment':   self.force_unicode(self.request.get('comment')),
      'code':      self.force_unicode(self.request.get('code')) }

    err = self.validate_form(p)
    if err is None:
      token = self.retrieve_access_token(p)
      if token is not None:
        self.add_to_sheet(p, token)
      return self.redirect(ARTICLE_URL % page_id)
    else:
      p['err'] = err
      self.render_html(TOP_TEMPLATE, p)

  def add_to_sheet(self, p, token):
    url     = LISTFEED_URL % SHEET_ID
    payload = self.template_env.from_string(POST_SPREADSHEETS_TEMPLATE).render(p).encode('utf-8')
    headers = dict(HEADERS)
    headers['Authorization'] = 'Bearer %s' % token
    rsp = urlfetch.fetch(method='POST', url=url, payload=payload, headers=headers)
    if 200 <= rsp.status_code < 300:
      mail.send_mail(sender="support@webos-goodies.jp",
                     to="support@webos-goodies.jp",
                     subject="You've got a comment!",
                     body=NOTIFICATION)
    else:
      self.send_error(p, LISTFEED_URL % SHEET_ID, 'POST', headers, payload, rsp)

  def retrieve_access_token(self, p):
    url = 'https://www.googleapis.com/oauth2/v3/token'
    payload = {
      'client_id':     settings_private.CLIENT_ID,
      'client_secret': settings_private.CLIENT_SECRET,
      'refresh_token': settings_private.REFRESH_TOKEN,
      'grant_type':    'refresh_token'
    }
    payload = urllib.urlencode(payload)
    headers = { 'Content-Type':'application/x-www-form-urlencoded' }
    rsp = urlfetch.fetch(url=url, method='POST', payload=payload, headers=headers)
    if 200 <= rsp.status_code < 300:
      return json.loads(rsp.content)['access_token']
    else:
      self.send_error(p, url, 'POST', headers, payload, rsp)
      return None

  def send_error(self, p, url, method, headers, payload, rsp):
    body = ERR_NOTIFICATION % (
      p['timestamp'], p['page'], p['title'], p['name'], p['url'], p['comment'],
      url, method, str(headers), to_unicode(payload),
      rsp.status_code, str(rsp.headers), to_unicode(rsp.content))
    mail.send_mail(sender="support@webos-goodies.jp",
                   to="support@webos-goodies.jp",
                   subject="Error at posting comment",
                   body=body)

  def validate_form(self, p):
    name       = (p['name']    or '').lower()
    name_words = SEPARATOR_RE.split(name)
    comment    = (p['comment'] or '').lower()
    url        = (p['url']     or '').lower().strip()

    if not name:
      return u'お名前を入力してください。'
    if not comment:
      return u'コメントを入力してください。'
    if url and not LINK_RE.match(p['url']):
      return u'URLのフォーマットが間違っています。'
    if p['code'] != u'寿限無寿限無五劫の擦り切れ':
      return u'スパム対策によりコメントは拒否されました。'
    if any([url.startswith(s) for s in SPAM_URLS]):
      return u'スパム対策によりコメントは拒否されました。'
    if any([s in name for s in SPAM_NAMES]):
      return u'スパム対策によりコメントは拒否されました。'
    if all((s in TYPICAL_WORDS for s in name_words)):
      return u'スパム対策によりコメントは拒否されました。'
    if SPAM_NAME_RE.search(name):
      return u'スパム対策によりコメントは拒否されました。'
    if any([s in url for s in SPAM_URL_WORDS]):
      return u'スパム対策によりコメントは拒否されました。'
    if any([0xb000 <= ord(c) <= 0xcfff for c in name]): # Rejects Hangeul letters.
      return u'スパム対策によりコメントは拒否されました。'
    if len(comment) > 4096:
      return u'コメントが長すぎます。'
    if any([s in comment for s in SPAM_WORDS]):
      return u'スパム対策によりコメントは拒否されました。'
    if SPAM_WORD_RE.search(comment):
      return u'スパム対策によりコメントは拒否されました。'
    if len(SPAM_LINK_RE.findall(p['comment'])) >= 3:
      return u'スパム対策によりコメントは拒否されました。'
    if url and url in comment:
      return u'スパム対策によりコメントは拒否されました。'
    if url and url.startswith(name):
      return u'スパム対策によりコメントは拒否されました。'
    return None


  def force_unicode(self, s, strip=False):
    if not isinstance(s, unicode):
      s = unicode(s, 'UTF-8')
    if s and strip:
      s = s.strip()
    return s


TOP_TEMPLATE = u"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>コメント投稿フォーム</title>
<style>
.notice {background-color:#fae8a0;margin:16px 0 16px 90px; padding:8px;}
.label {clear:both;float:left;text-align:right;width:80px;}
.field {margin: 16px 0 16px 90px;}
.btn   {clear:botn;text-align:center;}
.form input{width:40em;font-size:14px;}
.form textarea{width:40em;height:20em;font-size:14px;}
.btn  input{font-size:14px; padding:8px 24px;}
</style>
</head>
<body>
<div style="float:left;">
  <form action="#" method="POST">
    <input type="hidden" name="title" value="{{title}}">
    <input type="hidden" name="code" value="寿限無寿限無五劫の擦り切れ" />
    <div class="form">
      {% if err %}<div class="notice">{{err}}</div>{% endif %}
      <div class="label">お名前</div>
      <div class="field"><input type="text" name="name" value="{{name}}"></div>
      <div class="label">URL</div>
      <div class="field"><input type="text" name="url" value="{{url}}"></div>
      <div class="label"></div>
      <div class="field"><textarea name="comment">{{comment}}</textarea></div>
    </div>
    <div class="btn"><input type="submit"></div>
  </form>
</div>
</body>
</html>
"""

POST_SPREADSHEETS_TEMPLATE = """
<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">
  <gsx:timestamp>{{timestamp}}</gsx:timestamp>
  <gsx:page>{{page}}</gsx:page>
  <gsx:title>{{title}}</gsx:title>
  <gsx:name>{{name}}</gsx:name>
  <gsx:url>{{url}}</gsx:url>
  <gsx:comment>{{comment}}</gsx:comment>
</entry>"""

NOTIFICATION = """
A comment has been posted on webos-goodies.jp.

https://docs.google.com/a/webos-goodies.jp/spreadsheet/ccc?key=0Ao0lgngMECUtcE1JQnJuSjRQSEtfVG5iX0lBejNjVFE
"""

ERR_NOTIFICATION = """
Got an error at posting a comment.

---- Comment ----
Timestamp: %s
Page:      %s
Title:     %s
Name:      %s
Url:       %s
Comment:
%s

---- Request ----
Url: %s
Method: %s
Headers:
%s

Body:
%s

---- Response ----
Status: %d

Headers:
%s

Body:
%s
"""
