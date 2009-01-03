require 'credentials.rb'

class ArticlesController < ApplicationController
  include Credentials

  SITE_URL          = 'http://webos-goodies.jp/'
  SITE_TITLE        = 'WebOS Goodies'
  SITE_DESCRIPTION  = 'Gentoo Linux で個人サーバーから名称変更しました。今後ともよろしくお願いします！'
  AUTHOR            = 'Chihiro Ito'
  ARTICLE_PATH      = 'archives/'
  RSS_PATH          = 'index.rdf'
  ATOM_PATH         = 'atom.xml'

  def index
    set_template_parameters
    respond_to do |type|
      type.html { @articles = Article.find(:all, :order => 'id') }
      type.rss  { fetch_feed_items }
      type.atom { fetch_feed_items }
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
    set_template_parameters(article)
    render :layout => false
  end

  private

  def publish(article)
    article.publish_date ||= Time.now
    article.save!
    set_template_parameters(article)
    fetch_feed_items()
    template_path = File.join(RAILS_ROOT, 'app/views/articles')
    html = render_to_string :action => 'preview', :layout => false
    rss  = render_to_string :file => File.join(template_path, 'index.rss.builder'),  :layout => false
    atom = render_to_string :file => File.join(template_path, 'index.atom.builder'), :layout => false
    Net::FTP.open(FTP_HOST, FTP_USER, FTP_PASS) do |ftp|
      ftp.putbinarystring(html, File.join(FTP_SITE_PATH, ARTICLE_PATH, article.page_name + '.html'))
      ftp.putbinarystring(rss,  File.join(FTP_SITE_PATH, RSS_PATH))
      ftp.putbinarystring(atom, File.join(FTP_SITE_PATH, ATOM_PATH))
    end
  end

  def set_template_parameters(article=nil)
    @site_url         = SITE_URL
    @rss_url          = File.join(SITE_URL, RSS_PATH)
    @atom_url         = File.join(SITE_URL, ATOM_PATH)
    @site_title       = SITE_TITLE
    @site_description = SITE_DESCRIPTION
    @author           = AUTHOR
    @article_base_url = File.join(SITE_URL, ARTICLE_PATH)
    if article
      @article_url   = File.join(@article_base_url, ERB::Util.url_encode(article.page_name) + '.html')
      @article_id    = article.page_name
      @article_title = article.title
      @article_meta  = article.meta
      @article_date  = article.publish_date || DateTime.now
      @article_body1 = article.formatted_body1
      @article_body2 = article.formatted_body2
    end
  end

  def fetch_feed_items()
    @articles = Article.find(:all,
                             :order      => 'publish_date DESC',
                             :conditions => { :published => true },
                             :limit      => 10)
  end

end
