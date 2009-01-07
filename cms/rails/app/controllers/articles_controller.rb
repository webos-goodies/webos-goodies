require 'credentials.rb'

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

  private

  def publish(article)
    article.publish_date ||= Time.now
    article.save!
    Dir.chdir(RAILS_ROOT) do
      external_command("rake upload:single_article ARTICLE=#{article.id}")
      external_command("rake upload:indices")
    end
  end

  def external_command(cmd)
    raise "External command failed : #{cmd}" unless system(cmd)
  end

end
