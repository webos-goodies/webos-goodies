class Category < ActiveRecord::Base
  belongs_to :site
  attr_protected :id, :created_at, :updated_at, :site_id

  validates_presence_of   :name
  validates_uniqueness_of :name
  validates_presence_of   :title
  validates_presence_of   :description

  def url()        self.site.full_url('categories', self.name + '.html') end
  def full_title() self.site.format_title(self.title) end

  def description=(value)
    self[:description]     = value.to_s.gsub(/\r\n|\n|\r/u, "\n")
    @formatted_description = nil
  end

  def formatted_description
    unless @formatted_description
      parser = Parser::Base.find('LivedoorParser').new
      @formatted_description = parser.parse(self.description || '')
      @formatted_description = %(<div class="dokuwiki">\n#{@formatted_description}\n</div>)
    end
    @formatted_description
  end

  def sub_categories
    tag_array = []
    tag_str   = self.tags
    while /\[([^\]]+)\]/ === tag_str
      tag_array << $1
      tag_str = $'
    end
    if tag_array.empty?
      []
    else
      results    = {}
      conditions = ['site_id=? AND name IN (?)', self.site_id, tag_array]
      self.class.find(:all, :conditions => conditions).each do |sub|
        results[sub.name] = sub
      end
      tag_array.map{|tag| results[tag] }.compact
    end
  end

  def articles(limit=nil, desc=false)
    conditions = ['site_id=? AND tags LIKE ?', self.site_id, "%[#{self.name}]%"]
    order      = "publish_date#{desc ? ' desc' : ''}"
    if limit
      Article.find(:all, :conditions => conditions, :order => order, :limit => limit)
    else
      Article.find(:all, :conditions => conditions, :order => order)
    end
  end

end
