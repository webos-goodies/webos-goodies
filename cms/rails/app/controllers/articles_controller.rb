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
    @article.published      = true
    @article.publish_date ||= Time.now
    @article.save(false)
    Dir.chdir(RAILS_ROOT) do
      external_command("rake upload:single_article ARTICLE=#{@article.id}")
      external_command("rake upload:indices")
    end
    redirect_to article_path(@article.id)
  end

  private

  def external_command(cmd)
    raise "External command failed : #{cmd}" unless system(cmd)
  end

end
