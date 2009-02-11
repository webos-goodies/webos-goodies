class Bookmark < ActiveRecord::Base
  validates_presence_of :title
  validates_format_of   :url, :with => /\Ahttps?:\/\//
end
