import logging
import urllib
import urlparse
import hmac
import hashlib
import base64
import time
import random

from google.appengine.api import urlfetch


def encode(s):
  return urllib.quote(s, '~')

def encode_params(params, sep='&', notation='%s=%s'):
  if isinstance(params, dict):
    params = params.iteritems()
  return sep.join(map(lambda p:notation % (encode(p[0]), encode(p[1])), params))

def normalize_params(params):
  result = params
  if isinstance(params, dict):
    result = []
    for key, values in params.iteritems():
      if isinstance(values, (list, tuple)):
        result.extend([(key, value) for value in values])
      else:
        result.append((key, values))
  elif isinstance(params, tuple):
    result = list(tuple)
  return result

def generate_base_string(url, method, auth, form={}):
  """
  method : HTTP method (GET, POST, etc...)
  auth   : contents of authorization header (dict or list)
  url    : request url (including query parameters)
  form   : request body at application/x-www-form-urlencoded (dict or list)
  """
  auth   = normalize_params(auth)
  form   = normalize_params(form)
  url    = urlparse.urlparse(url)
  params = urlparse.parse_qsl(url.query, True) + auth + form
  params.sort(lambda p1,p2:cmp(p1[0], p2[0]) or cmp(p1[1], p2[1]))
  params = encode_params(params)
  port   = ''
  if url.port is not None:
    if url.scheme == 'http' and url.port != 80:
      port = ':%d' % url.port
    elif url.scheme == 'https' and url.port != 443:
      port = ':%d' % url.port
  url = '%s://%s%s%s' % (url.scheme, url.hostname, port, url.path)
  return '&'.join(map(lambda s:encode(s), (method.upper(), url, params)))

def generate_authorization_header(key, secret, url, method, form={}):
  """
  key    : consumer key for 2legged-OAuth
  secret : consumer secret for 2legged-OAuth
  method : HTTP method (GET, POST, etc...)
  url    : request url (including query parameters)
  form   : request body at application/x-www-form-urlencoded (dict or list)
  """
  nonce = ((long(random.randint(0, 65535)) << 32) +
           (long(random.randint(0, 65535)) << 16) +
           long(random.randint(0, 65535)))
  oauth_params = {
    'oauth_version':          '1.0',
    'oauth_consumer_key':     key,
    'oauth_signature_method': 'HMAC-SHA1',
    'oauth_timestamp':        str(int(time.time())),
    'oauth_nonce':            str(nonce) }
  bstr = generate_base_string(url, method, oauth_params, form)
  sig  = hmac.new(secret+'&', msg=bstr, digestmod=hashlib.sha1)
  oauth_params['oauth_signature'] = base64.b64encode(sig.digest())
  return 'OAuth %s' % encode_params(oauth_params, sep=',', notation='%s="%s"')


class Client(object):
  def __init__(self, consumer_key, consumer_secret, api_key=None, deadline=5):
    self.consumer_key    = consumer_key
    self.consumer_secret = consumer_secret
    self.api_key         = api_key
    self.deadline        = deadline

  def fetch(self, request, headers={}, deadline=None):
    if self.api_key is not None:
      query = (('key', self.api_key),)
    else:
      query = ()
    return request.fetch(self.consumer_key, self.consumer_secret, query=query, deadline=deadline)


class BaseRequest(object):
  def __init__(self, url, method='GET', headers={}, user=None):
    self.__url   = urlparse.urlparse(url)
    self.__query = urlparse.parse_qsl(self.__url[4], True)
    self.method  = method
    self.headers = dict(headers)
    if user is not None:
      self.__query.append(('xoauth_requestor_id', user))

  def _build_url(self, query=()):
    query = query.__class__(self.__query) + query
    return urlparse.urlunparse((
        self.__url[0], self.__url[1], self.__url[2],
        self.__url[3], urllib.urlencode(query), self.__url[5]))

  def _build_headers(self, key, secret, url):
    headers = dict(self.headers)
    headers['Authorization'] = generate_authorization_header(key, secret, url, self.method)
    return headers

  def _build_payload(self):
    return ''

  def add_param(self, name, value):
    self.__query.append((name, value))

  def set_header(self, name, value):
    self.headers[name] = value

  def fetch(self, key, secret, query=(), **kwargs):
    return self.__fetch(key, secret, self._build_url(query=query), **kwargs)

  def __fetch(self, key, secret, url, **kwargs):
    kwargs.update({
        'url'     : url,
        'payload' : self._build_payload(),
        'method'  : self.method.upper(),
        'headers' : self._build_headers(key, secret, url),
        'allow_truncated'  : False,
        'follow_redirects' : False })
    logging.debug("Send request:\n%s" % str(kwargs))
    response = urlfetch.fetch(**kwargs)
    st = response.status_code
    if st < 400:
      logging.debug("Receive %d response:%s" % (response.status_code, response.headers))
    else:
      logging.error("Receive %d response:%s\n%s" %
                    (response.status_code, response.headers, response.content))
    if 301 <= st and st <= 303 and response.headers.get('location', None) is not None:
      return self.__fetch(key, secret, response.headers['location'])
    else:
      return response


class Request(BaseRequest):
  def __init__(self, url, payload=None, method='GET', headers={}, user=None):
    super(Request, self).__init__(url, method=method, headers=headers, user=user)
    self.payload = payload

  def _build_payload(self):
    return self.payload


class FormRequest(BaseRequest):
  def __init__(self, url, form={}, method='GET', headers={}, user=None):
    super(FormRequest, self).__init__(url, method=method, headers=headers, user=user)
    self.form = form

  def _build_headers(self, key, secret, url):
    headers = dict(self.headers)
    headers['Content-Type']  = 'application/x-www-form-urlencoded'
    headers['Authorization'] = generate_authorization_header(
      key, secret, url, self.method, self.form)
    return headers

  def _build_payload(self):
    return urllib.urlencode(self.form)
