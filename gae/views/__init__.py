# -*- coding: utf-8 -*-

import os
import setup
setup.initialize()
import logging
import webapp2

from comments import CommentsView

def is_dev_server():
  server_software = os.environ.get('SERVER_SOFTWARE')
  logging.debug(server_software)
  return server_software.startswith('Development')

class MainHandler(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'text/html'
    self.response.out.write('Hello world!')

app = webapp2.WSGIApplication(
    [ ('/comments/([^/]+)', CommentsView) ],
    debug=is_dev_server())
