# -*- coding: utf-8 -*-

import setup
setup.initialize()
import webapp2

from comments import CommentsView

class MainHandler(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/html'
    self.response.out.write('Hello world!')

app = webapp2.WSGIApplication(
    [ ('/comments/([^/]+)', CommentsView) ],
    debug=False)
