class ArticlesController < ApplicationController

  SITE_URL         = 'http://webos-goodies.jp/'
  RSS_URL          = 'http://webos-goodies.jp/index.rdf'
  ATOM_URL         = 'http://webos-goodies.jp/atom.xml'
  SITE_TITLE       = 'WebOS Goodies'
  SITE_DESCRIPTION = 'Gentoo Linux で個人サーバーから名称変更しました。今後ともよろしくお願いします！'
  AUTHOR           = 'Chihiro Ito'
  ARTICLE_BASE_URL = SITE_URL + 'archives/'

  def index
    @site_url         = SITE_URL
    @rss_url          = RSS_URL
    @atom_url         = ATOM_URL
    @site_title       = SITE_TITLE
    @site_description = SITE_DESCRIPTION
    @author           = AUTHOR
    @article_base_url = ARTICLE_BASE_URL
    respond_to do |type|
      type.html { @articles = Article.find(:all, :order => 'id') }
      type.rss  {
        @articles = Article.find(:all, :order => 'publish_date DESC', :conditions => { :published => true })
      }
      type.atom  {
        @articles = Article.find(:all, :order => 'publish_date DESC', :conditions => { :published => true })
      }
    end
  end

  def show
    @article = Article.find(params[:id])
  end

  def new
    @article = Article.new
  end

  def edit
    @article = Article.find(params[:id])
  end

  def create
    @article = Article.new(params[:article])
    if @article.published
      publish(@article)
    else
      @article.save!
    end
    redirect_to article_path(@article.id)
  rescue ActiveRecord::RecordInvalid
    render :action => 'new'
  end

  def update
    @article = Article.find(params[:id])
    @article.attributes = params[:article]
    if @article.published
      publish(@article)
    else
      @article.save!
    end
    redirect_to article_path(@article.id)
  rescue ActiveRecord::RecordInvalid
    render :action => 'edit'
  end

  def preview
    article = Article.find(params[:id])
    @site_url         = SITE_URL
    @rss_url          = RSS_URL
    @atom_url         = ATOM_URL
    @site_title       = SITE_TITLE
    @site_description = SITE_DESCRIPTION
    @author           = AUTHOR
    @article_url      = ARTICLE_BASE_URL + ERB::Util.url_encode(article.page_name) + '.html'
    @article_id       = article.page_name
    @article_title    = article.title
    @article_meta     = article.meta
    @article_date     = article.publish_date || DateTime.now
    @article_body1    = article.formatted_body1
    @article_body2    = article.formatted_body2
    render :layout => false
  end

  private

  def publish(article)
    article.publish_date ||= Time.now
    article.save!
  end

end
