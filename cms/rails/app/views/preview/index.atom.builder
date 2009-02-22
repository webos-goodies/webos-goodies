atom_feed(:language => 'ja-JP',
          :root_url => @site.url,
		  :url      => @site.full_url(:atom_path),
		  :id       => @site.url) do |feed|
  feed.title   @site.title
  feed.updated Time.now
  feed.author{|author| author.name(@site.author) }

  @articles.each do |article|
    feed.entry(article,
	           :url       => article.url,
	           :id        => article.url,
			   :published => article.publish_date,
			   :updated   => article.updated_at) do |entry|
	  entry.title(article.title)
	  entry.content(article.formatted_body1, :type => 'html')
	  entry.author{|author| author.name(@site.author) }
	end
  end

end
