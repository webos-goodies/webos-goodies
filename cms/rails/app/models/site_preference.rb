class SitePreference < ActiveRecord::Base
  belongs_to :site
  serialize  :preferences, Hash
end
