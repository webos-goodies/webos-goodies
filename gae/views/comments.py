# -*- coding: utf-8 -*-

import logging
import re
import datetime
import dateutil.tz
import jinja2
import settings
import baseview
import twolegged

from google.appengine.api import mail


CONSUMER_KEY    = settings.CONSUMER_KEY
CONSUMER_SECRET = settings.CONSUMER_SECRET

LISTFEED_URL    = 'https://spreadsheets.google.com/feeds/list/%s/%s/private/full?alt=json'
SHEET_ID        = ('0Ao0lgngMECUtcE1JQnJuSjRQSEtfVG5iX0lBejNjVFE', 'od6')
HEADERS         = { 'GData-Version': '3.0', 'Content-Type':'application/atom+xml' }
USER_EMAIL      = 'support@webos-goodies.jp'

ARTICLE_URL     = 'http://webos-goodies.jp/archives/%s.html#comments'
LINK_RE         = re.compile(r'^https?://')
SPAM_NAMES      = ('replicas', 'mafformmart', u'シャネル', u'プラダ', u'ネックレス', 'hermes',
                   u'バッグ', u'時計', u'コピー', u'ヴィトン', u'ロレックス', u'オメガ', 'emma',
                   u'ヴィンテージ', u'草間彌生', u'コーチ', u'財布', 'ugg', 'sale', 'xrumertest',
                   'jeanstory', 'baidu', 'gold', '____', 'debrabanks', 'pharm', 'prada', 'mulberry',
                   'louis', 'vuitton', 'handbag', 'luggage', 'purse', 'miu miu', 'MCM', 'bags',
                   'loans', 'coupon')
SPAM_WORDS      = ('[/url]', u'紹介します', u'ナイキ', 'loans', 'coupon')
SPAM_URLS       = ('http://www.paydayloansbargains.co.uk',
                   'http://shoebuycoupon2013.com')
SPAM_LINK_RE    = re.compile(r'(?:^|\s|")https?://', re.I)


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
      payload  = self.template_env.from_string(POST_SPREADSHEETS_TEMPLATE).render(p)
      client   = twolegged.Client(CONSUMER_KEY, CONSUMER_SECRET, deadline=30)
      response = client.fetch(twolegged.Request(
          method='POST', url=LISTFEED_URL % SHEET_ID, payload=payload.encode('utf-8'),
          headers=HEADERS, user=USER_EMAIL))
      if 200 <= response.status_code < 300:
        mail.send_mail(sender="support@webos-goodies.jp",
                       to="support@webos-goodies.jp",
                       subject="You've got a comment!",
                       body=NOTIFICATION)
      else:
        body = ERR_NOTIFICATION % (
          p['timestamp'], p['page'], p['title'], p['name'], p['url'], p['comment'],
          str(HEADERS), payload, response.status_code, str(response.headers), response.content)
        mail.send_mail(sender="support@webos-goodies.jp",
                       to="support@webos-goodies.jp",
                       subject="Error at posting comment",
                       body=body)
      return self.redirect(ARTICLE_URL % page_id)

    else:
      p['err'] = err
      self.render_html(TOP_TEMPLATE, p)


  def validate_form(self, p):
    name    = (p['name']    or '').lower()
    comment = (p['comment'] or '').lower()
    url     = (p['url']     or '').lower()

    if not name:
      return u'お名前を入力してください。'
    if not comment:
      return u'コメントを入力してください。'
    if url and not LINK_RE.match(p['url']):
      return u'URLのフォーマットが間違っています。'
    if p['code'] != u'寿限無寿限無五劫の擦り切れ':
      return u'スパム対策によりコメントは拒否されました。'
    if url.strip() in SPAM_URLS:
      return u'スパム対策によりコメントは拒否されました。'
    if any([s in name for s in SPAM_NAMES]):
      return u'スパム対策によりコメントは拒否されました。'
    if any([0xb000 <= ord(c) <= 0xcfff for c in name]): # Rejects Hangeul letters.
      return u'スパム対策によりコメントは拒否されました。'
    if len(comment) > 4096:
      return u'コメントが長すぎます。'
    if any([s in comment for s in SPAM_WORDS]):
      return u'スパム対策によりコメントは拒否されました。'
    if len(SPAM_LINK_RE.findall(p['comment'])) >= 4:
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
