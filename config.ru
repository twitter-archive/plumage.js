require 'rubygems'
require 'bundler'

Bundler.require



root_paths = ['dist/docs', 'assets', 'examples', 'test']
cascade = [
  Rack::Directory.new('dist/docs'),
  Rack::URLMap.new({
    '/dist' => Rack::File.new('dist'),
    '/assets/examples' => Rack::File.new('examples'),
    '/assets' => Rack::File.new('assets'),
    '/test' => Rack::File.new('test')
  })
]



# For single page web apps:
#  - always serve appPath/index.html for any path in appPath.
class MountApp
  attr_accessor :app_path, :index_file

  def initialize(app_path, index_file)
    @app_path = app_path
    @index_file = index_file
  end

  def call(env)
    req = Rack::Request.new(env)
    if 0 == req.path.downcase.index(@app_path.downcase)
      [200, {}, [File.open(@index_file).read]]
    else
      [404, {}, ['Not found']]
    end
  end
end

cascade << MountApp.new('/examples/kitchen_sink', 'examples/kitchen_sink/index.html')
cascade << MountApp.new('/examples/countries', 'examples/countries/index.html')

run Rack::Cascade.new(cascade)
