class ArticlesController < ApplicationController

  def index
    @articles = Article.find(:all)
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

  def preview
    article = Article.find(params[:id])
    parser  = Parser::Base.find(article.parser).new
    @page_name     = article.page_name
    @title         = article.title
    @meta          = article.meta
    @publish_date  = article.publish_date || DateTime.now
    @body1, @body2 = parser.parse(article.body1, article.body2)
    render :layout => false
  end

end
