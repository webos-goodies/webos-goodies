class SitesController < ApplicationController

  # GET /sites
  # GET /sites.xml
  def index
    @sites = Site.find(:all)
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @sites }
    end
  end

  # GET /sites/1
  # GET /sites/1.xml
  def show
    @site = Site.find(params[:id], :include => :preference)
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @site }
    end
  end

  # GET /sites/new
  # GET /sites/new.xml
  def new
    @site = Site.new
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @site }
    end
  end

  # GET /sites/1/edit
  def edit
    @site       = Site.find(params[:id], :include => :preference)
    @preference = @site.preference
  end

  # POST /sites
  # POST /sites.xml
  def create
    Site.transaction do
      @site = Site.new(params[:site])
      @site.preference = SitePreference.new(params[:preference])
      @site.save!
      @site.preference.save!
      respond_to do |format|
        flash[:notice] = 'Site was successfully created.'
        format.html { redirect_to(@site) }
        format.xml  { render :xml => @site, :status => :created, :location => @site }
      end
    end
  rescue ActiveRecord::RecordInvalid
    respond_to do |format|
      format.html { render :action => "new" }
      format.xml  { render :xml => @site.errors, :status => :unprocessable_entity }
    end
  end

  # PUT /sites/1
  # PUT /sites/1.xml
  def update
    Site.transaction do
      @site = Site.find(params[:id], :include => :preference)
      @site.attributes = params[:site]
      @preference = (@site.preference ||= SitePreference.new)
      @preference.attributes = params[:preference]
      @site.save!
      @preference.save!
      respond_to do |format|
        flash[:notice] = 'Site was successfully updated.'
        format.html { redirect_to(@site) }
        format.xml  { head :ok }
      end
    end
  rescue ActiveRecord::RecordInvalid
    respond_to do |format|
      format.html { render :action => "edit" }
      format.xml  { render :xml => @site.errors, :status => :unprocessable_entity }
    end
  end

  # DELETE /sites/1
  # DELETE /sites/1.xml
  def destroy
    Site.transaction do
      @site = Site.find(params[:id], :include => :preference)
      @site.destroy
      respond_to do |format|
        format.html { redirect_to(sites_url) }
        format.xml  { head :ok }
      end
    end
  end
end
