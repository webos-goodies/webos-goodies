class Article < ActiveRecord::Base
  AVAILABLE_PARSERS = Parser::Base.all_parsers.map{|k| k.name }

  validates_uniqueness_of :page_name
  validates_presence_of   :page_name
  validates_inclusion_of  :parser, :in => AVAILABLE_PARSERS
  validates_presence_of   :title
  validates_presence_of   :body1

  def formatted_body1
    parse() unless @formatted_body1
    @formatted_body1
  end

  def formatted_body2
    parse() unless @formatted_body2
    @formatted_body2
  end

  private

  def parse()
    parser  = Parser::Base.find(self.parser).new
    @formatted_body1, @formatted_body2 = parser.parse(self.body1||'', self.body2||'')
  end

end