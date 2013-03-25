import os
import sys

def initialize():
  libpath = os.path.join(os.path.dirname(__file__), 'lib')
  if sys.path[0] != libpath:
    sys.path.insert(0, libpath)
