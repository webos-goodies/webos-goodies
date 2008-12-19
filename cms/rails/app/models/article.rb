class Article < ActiveRecord::Base
  AVAILABLE_PARSERS = ['raw', 'livedoor']

  validates_uniqueness_of :page_name
  validates_presence_of   :page_name
  validates_inclusion_of  :parser, :in => AVAILABLE_PARSERS
  validates_presence_of   :title
  validates_presence_of   :body1
end
