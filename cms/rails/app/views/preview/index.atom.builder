atom_feed(:language => 'ja-JP',
          :root_url => @site_url,
		  :url      => @atom_url,
		  :id       => @site_url) do |feed|
  feed.title    @site_title
  feed.subtitle @site_description
  feed.updated  Time.now
  feed.author{|author| author.name(@author) }

  @articles.each do |article|
    feed.entry(article,
	           :url       => @article_base_url + article.page_name + '.html',
	           :id        => @article_base_url + article.page_name + '.html',
			   :published => article.publish_date,
			   :updated   => article.updated_at) do |entry|
	  entry.title(article.title)
	  entry.content(article.formatted_body1, :type => 'html')
	  entry.author{|author| author.name(@author) }
	end
  end

end
