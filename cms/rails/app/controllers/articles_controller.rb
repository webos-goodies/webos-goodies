require 'xmlrpc/client'

class ArticlesController < ApplicationController

  def index
    @site     = Site.find(params[:site_id])
    @q        = params[:q]
    query = { :order => "coalesce(publish_date, date('now')) DESC, id DESC" }
    unless @q.blank?
      query[:conditions] =
        [%w"page_name title body1 body2".map{|c| "#{c} LIKE :q" }.join(' OR '), { :q => "%#{@q}%" }]
    end
    @articles = @site.articles.find(:all, query)
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
    @article = load_article(params[:site_id], params[:id]) || return
    @site    = @article.site
    first    = !@article.published
    @article.published      = true
    @article.publish_date ||= DateTime.now
    @article.save(false)
    Dir.chdir(RAILS_ROOT) do
      external_command("rake upload:single_article ARTICLE=#{@article.id}")
      external_command("rake upload:indices SITE=#{@site.id}")
    end
    if first
      @site.ping_servers.each_line do |server|
        server = server.strip
        send_ping(server, @article.full_title, @article.url) unless server.blank?
      end
    end
    @article.upload_googledocs
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

  def send_ping(server, title, url)
    logger.info('sending ping to ' + server)
    client   = XMLRPC::Client.new2(server)
    response = client.call("weblogUpdates.ping", title, url)
    logger.info(response.inspect)
    response
  rescue
    logger.error('sending ping to ' + server + ' failed.')
  end

end
