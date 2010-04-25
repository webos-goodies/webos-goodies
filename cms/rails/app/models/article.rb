class Article < ActiveRecord::Base
  belongs_to     :site
  attr_protected :id, :created_at, :updated_at, :site_id, :site, :published, :short_url

  AVAILABLE_PARSERS = Parser::Base.all_parsers.map{|k| k.name }

  validates_presence_of   :page_name
  validates_uniqueness_of :page_name
  validates_inclusion_of  :parser, :in => AVAILABLE_PARSERS
  validates_presence_of   :title
  validates_presence_of   :body1

  def initialize(*args)
    @prettify = false
    super
  end

  def url()             self.site.full_url(self.site.article_path, self.page_name + '.html') end
  def full_title()      self.site.format_title(self.title) end

  def page_name=(value) self[:page_name] = value.strip end
  def title=(value)     self[:title]     = value.strip end

  def body1=(value)
    self[:body1]     = value.to_s.gsub(/\r\n|\n|\r/u, "\n")
    @formatted_body1 = nil
  end

  def body2=(value)
    self[:body2] = value.to_s.gsub(/\r\n|\n|\r/u, "\n")
    @formatted_body2 = nil
  end

  def formatted_body1
    parse() unless @formatted_body1
    @formatted_body1
  end

  def formatted_body2
    parse() unless @formatted_body2
    @formatted_body2
  end

  def prettify?() @prettify end

  def publish
    self.published      = true
    self.publish_date ||= DateTime.now
    self.shorten_url
  end

  def shorten_url
    user   = self.site.bitly_user
    apikey = self.site.bitly_apikey
    if self.short_url.blank? && !user.blank? && !apikey.blank?
      url = ERB::Util.u(self.url)
      Net::HTTP.start('api.bit.ly', 80) do |http|
        response = http.get("/v3/shorten?login=#{user}&apiKey=#{apikey}&uri=#{url}&format=txt")
        self.short_url = response.body
      end
    end
  end

  private

  def parse()
    parser  = Parser::Base.find(self.parser).new
    @formatted_body1, @formatted_body2 = parser.parse(self.body1||'', self.body2||'')
    @prettify = parser.get_meta('prettify')
  end

end
