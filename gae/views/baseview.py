import setup
import logging
import json
import webapp2
import jinja2

jinja_env = jinja2.Environment(autoescape=True)

class BaseView(webapp2.RequestHandler):
  def dispatch(self):
    setup.initialize()
    super(BaseView, self).dispatch()

  @property
  def template_env(self):
    return jinja_env

  def render_text(self, data, status=None):
    if isinstance(data, unicode):
      data = data.encode('UTF-8')
    self.response.headers['Content-Type'] = 'text/plain; charset=UTF-8'
    self.response.out.write(data)
    if status is not None:
      self.response.set_status(status)

  def render_html(self, template, params={}, status=None):
    self.response.headers['Content-Type'] = 'text/html; charset=UTF-8'
    self.response.out.write(self.template_env.from_string(template).render(**params))
    if status is not None:
      self.response.set_status(status)

  def render_json(self, data, status=None):
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps(data))
    if status is not None:
      self.response.set_status(status)
