# -*- coding: utf-8 -*-

import logging
import datetime
import dateutil.tz
import jinja2
import baseview
import twolegged

from google.appengine.api import mail


CONSUMER_KEY    = 'webos-goodies.jp'
CONSUMER_SECRET = 'RR3Na6IT1KTO8JrsvjqbSXFd'

LISTFEED_URL    = 'https://spreadsheets.google.com/feeds/list/%s/%s/private/full?alt=json'
SHEET_ID        = ('0Ao0lgngMECUtcE1JQnJuSjRQSEtfVG5iX0lBejNjVFE', 'od6')
HEADERS         = { 'GData-Version': '3.0', 'Content-Type':'application/atom+xml' }
USER_EMAIL      = 'support@webos-goodies.jp'

ARTICLE_URL    = 'http://webos-goodies.jp/archives/%s.html#comments'


class CommentsView(baseview.BaseView):
  def get(self, page_id):
    self.render_html(PAGE_TEMPLATE)

  def post(self, page_id):
    dt = datetime.datetime.now(dateutil.tz.tzoffset('JST', +9*60*60))
    payload = self.template_env.from_string(POST_SPREADSHEETS_TEMPLATE).render(
      timestamp = dt.strftime('%m/%d/%Y %H:%M:%S'),
      page      = page_id,
      title     = self.request.get('title'),
      name      = self.request.get('name'),
      url       = self.request.get('url'),
      comment   = self.request.get('comment'))

    client   = twolegged.Client(CONSUMER_KEY, CONSUMER_SECRET, deadline=30)
    response = client.fetch(twolegged.Request(
        method='POST', url=LISTFEED_URL % SHEET_ID, payload=payload,
        headers=HEADERS, user=USER_EMAIL))

    mail.send_mail(sender="support@webos-goodies.jp",
                   to="support@webos-goodies.jp",
                   subject="You got a comment!",
                   body=NOTIFICATION)

    return self.redirect(ARTICLE_URL % page_id)


PAGE_TEMPLATE = u"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>コメント投稿フォーム</title>
</head>
<body>
<form action="#" method="POST">
<input type="hidden" name="title" value="テスト">
お名前: <input type="text" name="name">
URL: <input type="text" name="url">
<textarea style="width:80em;height:30em;" name="comment"></textarea>
<input type="submit">
</form>
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
