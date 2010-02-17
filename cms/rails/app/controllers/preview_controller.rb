class PreviewController < ApplicationController

  def index
    common_params(params)
    @site     = Site.find(params[:site_id], :include => :preference)
    @articles = @site.articles.find(:all,
                                    :order      => 'publish_date DESC',
                                    :conditions => { :published => true },
                                    :limit      => 10,
                                    :include    => :site)
    respond_to do |type|
      type.html
      type.rss
      type.atom
    end
  end

  def article
    common_params(params)
    if request.method != :post && request.method != :put
      @article = Article.find(params[:id])
      @site    = @article.site
      @article.publish_date ||= DateTime.now
      raise ActiveRecord::RecordInvalid.new(article) unless @article.valid?
    else
      @article = Article.new(params[:article])
      @article.page_name      = '__preview__'
      @article.publish_date ||= DateTime.now
      #raise ActiveRecord::RecordInvalid.new(article) unless @article.valid?
      @article.site_id = params[:site_id]
      @site            = @article.site
    end
  rescue ActiveRecord::RecordInvalid => e
    render :action => 'error', :layout => false
  end

  private

  def common_params(params)
    @dev = params[:dev]
  end

end
