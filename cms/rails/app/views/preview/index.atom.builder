atom_feed(:language => 'ja-JP',
          :root_url => @site.url,
		  :url      => @site.full_url(:atom_path),
		  :id       => @site.url) do |feed|
  feed.title    @site.title
  feed.subtitle @site.description
  feed.updated  Time.now
  feed.author{|author| author.name(@site.author) }

  @articles.each do |article|
    feed.entry(article,
	           :url       => article.url,
	           :id        => article.url,
			   :published => article.publish_date,
			   :updated   => article.updated_at) do |entry|
	  entry.title(article.title)
	  entry.content(<<EOS, :type => 'html')
#{article.formatted_body1}
<p><a href="#{CGI.escapeHTML(article.url)}">&gt;&gt; 続きを読む</a></p>
EOS
	  entry.author{|author| author.name(@site.author) }
	end
  end

end
