require 'xmlrpc/client'

class ArticlesController < ApplicationController

  def index
    @site     = Site.find(params[:site_id])
    @q        = params[:q]
    @re       = (params[:re] || '0').to_i > 0
    parser    = [*params[:parser]]
    @html     = parser.include?('html')
    @livedoor = parser.include?('livedoor')
    @html = @livedoor = true if !@html && !@livedoor
    query = { :order => "coalesce(publish_date, date('now')) DESC, id DESC" }
    s     = []
    p     = {}
    if !@html || !@livedoor
      s    << "parser IN (:p)"
      p[:p] = [@html ? 'HtmlParser' : nil, @livedoor ? 'LivedoorParser' : nil].compact
    end
    if !@q.blank? && !@re
      s    << %w"page_name title body1 body2".map{|c| "#{c} LIKE :q" }.join(' OR ')
      p[:q] = "%#{@q}%"
    end
    query[:conditions] = ["(#{s.join(') AND (')})", p] unless s.empty?
    @articles = @site.articles.find(:all, query)
    if !@q.blank? && @re
      begin
        regexp = Regexp.new(@q, false, 'U')
        @articles = @articles.select do |article|
          (regexp === article.page_name ||
           regexp === article.title ||
           regexp === article.body1 ||
           regexp === article.body2)
        end
      rescue
      end
    end
  end

  def show
    @article = load_article(params[:site_id], params[:id]) || return
    @site    = @article.site
  end

  def new
    @site    = Site.find(params[:site_id])
    @article = Article.new
  end

  def edit
    @article = load_article(params[:site_id], params[:id]) || return
    @site    = @article.site
  end

  def create
    @site    = Site.find(params[:site_id])
    @article = Article.new(params[:article])
    @article.site_id = @site.id
    @article.save!
    redirect_to(site_article_path(@site.id, @article.id))
  rescue ActiveRecord::RecordInvalid
    render :action => 'new'
  end

  def update
    @article = load_article(params[:site_id], params[:id]) || return
    @site    = @article.site
    @article.attributes = params[:article]
    @article.save!
    redirect_to(site_article_path(@site.id, @article.id))
  rescue ActiveRecord::RecordInvalid
    render :action => 'edit'
  end

  def publish
    id      = params[:id].strip.to_i
    site_id = params[:site_id].strip.to_i
    Dir.chdir(RAILS_ROOT) do
      external_command("rake upload:single_article ARTICLE=#{id}")
      external_command("rake upload:indices SITE=#{site_id}")
    end
    @article = load_article(site_id, id) || return
    @site    = @article.site
    redirect_to(site_article_path(@site.id, @article.id))
  end

  private

  def load_article(site_id, article_id)
    article = Article.find_by_id(article_id, :include => :site)
    if article && article.site.id.to_i == site_id.to_i
      article
    else
      render :file => "#{RAILS_ROOT}/public/404.html", :status => 404
      nil
    end
  end

  def external_command(cmd)
    raise "External command failed : #{cmd}" unless system(cmd)
  end

end
