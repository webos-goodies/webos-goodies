module PreviewHelper

  def css_tag(site, url)
    url = site.full_url(url)
    %(<link rel="stylesheet" href="#{h(url)}" type="text/css">)
  end

  def atom_tag(site, url, title)
    url = site.full_url(url)
    %(<link rel="alternate" type="application/atom+xml" title="#{h(title)}" href="#{h(url)}">)
  end

  def rss_tag(site, url, title)
    url = site.full_url(url)
    %(<link rel="alternate" type="application/rss+xml" title="#{h(title)}" href="#{h(url)}">)
  end

  def favicon_tag(site, url)
    url = site.full_url(url)
    %(<link rel="shortcut icon" href="#{h(url)}" type="image/x-icon" />)
  end

  def js_tag(*paths)
    paths.map do |path|
      if !(/^https?:/ === path)
        path = File.join(ActionController::Base.relative_url_root || '', 'javascripts', path)
      end
      %(<script type="text/javascript" src="#{h(path)}"></script>\n)
    end
  end

end
