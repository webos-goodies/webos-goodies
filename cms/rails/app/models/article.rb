class Article < ActiveRecord::Base
  AVAILABLE_PARSERS = Parser::Base.all_parsers.map{|k| k.name }

  validates_uniqueness_of :page_name
  validates_presence_of   :page_name
  validates_inclusion_of  :parser, :in => AVAILABLE_PARSERS
  validates_presence_of   :title
  validates_presence_of   :body1
end
