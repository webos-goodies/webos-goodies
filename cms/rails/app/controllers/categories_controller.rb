class CategoriesController < ApplicationController
  def index
    @site       = Site.find(params[:site_id])
    @categories = @site.categories

    respond_to do |format|
      format.html # index.html.erb
    end
  end

  def show
    @category = load_category(params[:site_id], params[:id]) || return
    @site     = @category.site

    respond_to do |format|
      format.html { render :action => 'edit' }
    end
  end

  def new
    @site     = Site.find(params[:site_id])
    @category = Category.new

    respond_to do |format|
      format.html # new.html.erb
    end
  end

  def create
    @site     = Site.find(params[:site_id])
    @category = Category.new(params[:category])
    @category.site_id = @site.id

    respond_to do |format|
      if @category.save
        format.html { redirect_to(site_category_path(@site.id, @category.id),
                                  :notice => 'Category was successfully created.') }
      else
        format.html { render :action => "new" }
      end
    end
  end

  def update
    @category = load_category(params[:site_id], params[:id]) || return
    @site     = @category.site

    respond_to do |format|
      if @category.update_attributes(params[:category])
        format.html { redirect_to(site_category_path(@site.id, @category.id),
                                  :notice => 'Category was successfully updated.') }
      else
        format.html { render :action => "edit" }
      end
    end
  end

  # DELETE /categories/1
  # DELETE /categories/1.xml
  def destroy
    @category = Category.find(params[:id])
    @category.destroy

    respond_to do |format|
      format.html { redirect_to(categories_url) }
      format.xml  { head :ok }
    end
  end

  private

  def load_category(site_id, category_id)
    category = Category.find_by_id(category_id, :include => :site)
    if category && category.site.id.to_i == site_id.to_i
      category
    else
      render :file => "#{RAILS_ROOT}/public/404.html", :status => 404
      nil
    end
  end

end
