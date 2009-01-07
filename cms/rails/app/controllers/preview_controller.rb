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
    article = Article.find(params[:id])
    set_template_parameters(article)
  end

end
