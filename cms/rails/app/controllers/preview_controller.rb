class PreviewController < ApplicationController
  include Credentials

  def index
    @articles = Article.find(:all,
                             :order      => 'publish_date DESC',
                             :conditions => { :published => true },
                             :limit      => 10)
    set_template_parameters
    respond_to do |type|
      type.html
      type.rss
      type.atom
    end
  end

  def article
    if request.method != :post && request.method != :put
      article = Article.find(params[:id])
    else
      article = Article.new(params[:article])
      article.page_name      = '__preview__'
      article.publish_date ||= Time.now
    end
    set_template_parameters(article)
    raise ActiveRecord::RecordInvalid.new(article) unless article.valid?
  rescue ActiveRecord::RecordInvalid => e
    @article = e.record
    render :action => 'error', :layout => false
  end

end
