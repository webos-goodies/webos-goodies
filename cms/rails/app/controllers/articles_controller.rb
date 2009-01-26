require 'credentials.rb'
require 'xmlrpc/client'

class ArticlesController < ApplicationController
  include Credentials

  def index
    @articles = Article.find(:all, :order => 'id')
    set_template_parameters
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
    @article.save!
    redirect_to article_path(@article.id)
  rescue ActiveRecord::RecordInvalid
    render :action => 'new'
  end

  def update
    @article = Article.find(params[:id])
    @article.attributes = params[:article]
    @article.save!
    redirect_to article_path(@article.id)
  rescue ActiveRecord::RecordInvalid
    render :action => 'edit'
  end

  def publish
    @article = Article.find(params[:id])
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
    redirect_to article_path(@article.id)
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
