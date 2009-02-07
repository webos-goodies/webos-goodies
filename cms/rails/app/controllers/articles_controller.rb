require 'credentials.rb'
require 'xmlrpc/client'

class ArticlesController < ApplicationController
  include Credentials

  def index
    @site     = Site.find(params[:site_id])
    @articles = @site.articles.find(:all, :order => 'created_at DESC')
    set_template_parameters
  end

  def show
    @site    = Site.find(params[:site_id])
    @article = @site.articles.find(params[:id])
  end

  def new
    @site    = Site.find(params[:site_id])
    @article = Article.new
  end

  def edit
    @site    = Site.find(params[:site_id])
    @article = Article.find(params[:id])
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
    @site    = Site.find(params[:site_id])
    @article = @site.articles.find(params[:id])
    @article.attributes = params[:article]
    @article.save!
    redirect_to(site_article_path(@site.id, @article.id))
  rescue ActiveRecord::RecordInvalid
    render :action => 'edit'
  end

  def publish
    @site    = Site.find(params[:site_id])
    @article = @site.articles.find(params[:id])
    first    = !@article.published
    @article.published      = true
    @article.publish_date ||= Time.now
    @article.save(false)
    Dir.chdir(RAILS_ROOT) do
      external_command("rake upload:single_article ARTICLE=#{@article.id}")
      external_command("rake upload:indices")
    end
    if first
      set_template_parameters(@article)
      PING_SERVERS.each do |server|
        send_ping(server, @article_title, @article_url)
      end
    end
    redirect_to(site_article_path(@site.id, @article.id))
  end

  private

  def external_command(cmd)
    raise "External command failed : #{cmd}" unless system(cmd)
  end

  def send_ping(server, title, url)
    logger.info('sending ping to ' + server)
    client   = XMLRPC::Client.new2(server)
    response = client.call("weblogUpdates.ping", title, url)
    logger.info(response.inspect)
    response
  end

end
