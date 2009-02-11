class Bookmark < ActiveResource::Base
  self.site = 'http://localhost:3000/'
  self.user = 'user'
  self.password = 'password'

  alias_method :new_record?, :new?
  def initialize(attr={})
    super({'title' => nil, 'url' => nil, 'comment' => nil}.update(attr))
  end
  def update_attributes(attr={})
    self.attributes = attr
    save
  end
end
